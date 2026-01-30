/**
 * useChatStream - Hook para manejar streaming SSE del chat
 * Proporciona control granular sobre la conexión de streaming y reconexión automática
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChatStreamEvent,
  ChatDeltaEvent,
  ChatExtractionEvent,
  ChatPhaseChangeEvent,
  ChatCompleteEvent,
  ChatErrorEvent,
  ChatRequest,
  DataExtraction,
  ConversationPhase,
} from '@/types/chat';

// =============================================================================
// TIPOS DEL HOOK
// =============================================================================

interface UseChatStreamState {
  isConnected: boolean;
  isStreaming: boolean;
  error: string | null;
  accumulatedContent: string;
}

interface UseChatStreamActions {
  startStream: (request: ChatRequest) => Promise<void>;
  stopStream: () => void;
  reset: () => void;
}

interface UseChatStreamCallbacks {
  onDelta?: (event: ChatDeltaEvent) => void;
  onExtraction?: (event: ChatExtractionEvent) => void;
  onPhaseChange?: (event: ChatPhaseChangeEvent) => void;
  onComplete?: (event: ChatCompleteEvent) => void;
  onError?: (event: ChatErrorEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface UseChatStreamReturn extends UseChatStreamState, UseChatStreamActions {
  reconnect: () => void;
}

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 1000;

// =============================================================================
// HOOK
// =============================================================================

export function useChatStream(
  callbacks: UseChatStreamCallbacks = {}
): UseChatStreamReturn {
  const [state, setState] = useState<UseChatStreamState>({
    isConnected: false,
    isStreaming: false,
    error: null,
    accumulatedContent: '',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const pendingRequestRef = useRef<ChatRequest | null>(null);
  const isReconnectingRef = useRef(false);

  /**
   * Parsea una línea SSE y retorna el evento correspondiente
   */
  const parseSSELine = useCallback((line: string): ChatStreamEvent | null => {
    if (!line.startsWith('data: ')) return null;

    const data = line.slice(6);

    if (data === '[DONE]') return null;

    try {
      return JSON.parse(data) as ChatStreamEvent;
    } catch (e) {
      console.error('Error parsing SSE data:', e);
      return null;
    }
  }, []);

  /**
   * Procesa un evento del stream
   */
  const handleEvent = useCallback(
    (event: ChatStreamEvent) => {
      switch (event.type) {
        case 'delta':
          setState((prev) => ({
            ...prev,
            accumulatedContent: prev.accumulatedContent + event.content,
          }));
          callbacks.onDelta?.(event);
          break;

        case 'extraction':
          callbacks.onExtraction?.(event);
          break;

        case 'phase_change':
          callbacks.onPhaseChange?.(event);
          break;

        case 'complete':
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            isConnected: false,
          }));
          callbacks.onComplete?.(event);
          callbacks.onDisconnect?.();
          break;

        case 'error':
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            isConnected: false,
            error: event.error,
          }));
          callbacks.onError?.(event);
          callbacks.onDisconnect?.();
          break;
      }
    },
    [callbacks]
  );

  /**
   * Inicia el stream SSE
   */
  const startStream = useCallback(
    async (request: ChatRequest) => {
      // Cancelar stream anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Guardar request para posible reconexión
      pendingRequestRef.current = request;

      // Resetear estado
      setState({
        isConnected: false,
        isStreaming: true,
        error: null,
        accumulatedContent: '',
      });

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify(request),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body available');
        }

        setState((prev) => ({ ...prev, isConnected: true }));
        callbacks.onConnect?.();
        reconnectAttemptsRef.current = 0;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Procesar líneas completas
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            const event = parseSSELine(trimmedLine);
            if (event) {
              handleEvent(event);
            }
          }
        }

        // Procesar cualquier dato restante en el buffer
        if (buffer.trim()) {
          const event = parseSSELine(buffer.trim());
          if (event) {
            handleEvent(event);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            // Cancelación intencional, no es error
            return;
          }

          console.error('Stream error:', error);

          setState((prev) => ({
            ...prev,
            isStreaming: false,
            isConnected: false,
            error: error.message,
          }));

          callbacks.onError?.({
            type: 'error',
            error: error.message,
            code: 'STREAM_ERROR',
          });

          callbacks.onDisconnect?.();

          // Intentar reconexión automática si es apropiado
          if (
            !isReconnectingRef.current &&
            reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
          ) {
            isReconnectingRef.current = true;
            reconnectAttemptsRef.current++;

            setTimeout(() => {
              isReconnectingRef.current = false;
              if (pendingRequestRef.current) {
                startStream(pendingRequestRef.current);
              }
            }, RECONNECT_DELAY_MS * reconnectAttemptsRef.current);
          }
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [handleEvent, callbacks, parseSSELine]
  );

  /**
   * Detiene el stream activo
   */
  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isStreaming: false,
      isConnected: false,
    }));

    callbacks.onDisconnect?.();
  }, [callbacks]);

  /**
   * Reinicia el estado del hook
   */
  const reset = useCallback(() => {
    stopStream();
    reconnectAttemptsRef.current = 0;
    pendingRequestRef.current = null;
    isReconnectingRef.current = false;

    setState({
      isConnected: false,
      isStreaming: false,
      error: null,
      accumulatedContent: '',
    });
  }, [stopStream]);

  /**
   * Intenta reconectar manualmente
   */
  const reconnect = useCallback(() => {
    if (pendingRequestRef.current && !state.isStreaming) {
      reconnectAttemptsRef.current = 0;
      isReconnectingRef.current = false;
      startStream(pendingRequestRef.current);
    }
  }, [startStream, state.isStreaming]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    startStream,
    stopStream,
    reset,
    reconnect,
  };
}

// =============================================================================
// HOOKS ESPECIALIZADOS
// =============================================================================

/**
 * Hook simplificado para solo recibir el contenido acumulado
 */
export function useChatStreamContent(
  request: ChatRequest | null,
  onComplete?: (content: string, extraction?: DataExtraction) => void
): {
  content: string;
  isStreaming: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
} {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const extractionRef = useRef<DataExtraction | undefined>(undefined);

  const { startStream, stopStream } = useChatStream({
    onDelta: (event) => {
      setContent((prev) => prev + event.content);
    },
    onExtraction: (event) => {
      extractionRef.current = event.extraction;
    },
    onComplete: () => {
      setIsStreaming(false);
      onComplete?.(content, extractionRef.current);
    },
    onError: (event) => {
      setError(event.error);
      setIsStreaming(false);
    },
    onConnect: () => {
      setIsStreaming(true);
      setError(null);
      setContent('');
      extractionRef.current = undefined;
    },
  });

  const start = useCallback(() => {
    if (request) {
      startStream(request);
    }
  }, [request, startStream]);

  return {
    content,
    isStreaming,
    error,
    start,
    stop: stopStream,
  };
}

/**
 * Hook para tracking de fase durante el streaming
 */
export function useChatStreamPhase(
  initialPhase: ConversationPhase
): {
  currentPhase: ConversationPhase;
  isStreaming: boolean;
  startStream: (request: ChatRequest) => Promise<void>;
  stopStream: () => void;
} {
  const [currentPhase, setCurrentPhase] = useState(initialPhase);
  const [isStreaming, setIsStreaming] = useState(false);

  const { startStream, stopStream } = useChatStream({
    onPhaseChange: (event) => {
      setCurrentPhase(event.newPhase);
    },
    onConnect: () => setIsStreaming(true),
    onDisconnect: () => setIsStreaming(false),
    onError: () => setIsStreaming(false),
  });

  return {
    currentPhase,
    isStreaming,
    startStream,
    stopStream,
  };
}

export default useChatStream;
