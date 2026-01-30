/**
 * ChatContext - Contexto de estado para el chat conversacional del CV builder
 * Maneja mensajes, fases de conversación, extracción de datos y streaming
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef, ReactNode } from 'react';
import {
  ChatState,
  ChatActions,
  ChatMessage,
  DataExtraction,
  ConversationPhase,
  ChatStreamEvent,
  ChatRequest,
  WELCOME_MESSAGE,
} from '@/types/chat';
import { CVData } from '@/types/cv';

// =============================================================================
// ESTADO INICIAL
// =============================================================================

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createInitialState = (): ChatState => ({
  messages: [WELCOME_MESSAGE],
  currentPhase: 'welcome',
  isStreaming: false,
  sessionId: generateSessionId(),
  extractedData: null,
  error: null,
  jobDescription: null,
});

// =============================================================================
// TIPOS DE ACCIONES
// =============================================================================

type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_STREAMING'; payload: boolean }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'SET_PHASE'; payload: ConversationPhase }
  | { type: 'SET_EXTRACTION'; payload: DataExtraction | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_JOB_DESCRIPTION'; payload: string }
  | { type: 'RESET_CHAT' }
  | { type: 'ADD_ASSISTANT_MESSAGE'; payload: ChatMessage };

// =============================================================================
// REDUCER
// =============================================================================

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };

    case 'SET_STREAMING':
      return {
        ...state,
        isStreaming: action.payload,
      };

    case 'UPDATE_MESSAGE': {
      const updatedMessages = state.messages.map((msg) =>
        msg.id === action.payload.id
          ? { ...msg, content: msg.content + action.payload.content }
          : msg
      );
      return {
        ...state,
        messages: updatedMessages,
      };
    }

    case 'SET_PHASE':
      return {
        ...state,
        currentPhase: action.payload,
      };

    case 'SET_EXTRACTION':
      return {
        ...state,
        extractedData: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isStreaming: false,
      };

    case 'SET_JOB_DESCRIPTION':
      return {
        ...state,
        jobDescription: action.payload,
      };

    case 'RESET_CHAT':
      return createInitialState();

    case 'ADD_ASSISTANT_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isStreaming: false,
      };

    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface ChatContextValue {
  state: ChatState;
  actions: ChatActions;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface ChatProviderProps {
  children: ReactNode;
  initialCVData?: Partial<CVData>;
  onCVDataUpdate?: (data: Partial<CVData>) => void;
}

export function ChatProvider({ children, initialCVData, onCVDataUpdate }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, createInitialState());
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAssistantMessageRef = useRef<ChatMessage | null>(null);

  // Referencia a los datos del CV para usarlos en las requests
  const cvDataRef = useRef<Partial<CVData>>(initialCVData || {});

  // Actualizar ref cuando cambien los datos externos
  React.useEffect(() => {
    if (initialCVData) {
      cvDataRef.current = initialCVData;
    }
  }, [initialCVData]);

  /**
   * Procesa un evento del stream SSE
   */
  const handleStreamEvent = useCallback(
    (event: ChatStreamEvent, messageId: string) => {
      switch (event.type) {
        case 'delta':
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { id: messageId, content: event.content },
          });

          // Actualizar también el mensaje en ref
          if (currentAssistantMessageRef.current) {
            currentAssistantMessageRef.current.content += event.content;
          }
          break;

        case 'extraction':
          dispatch({ type: 'SET_EXTRACTION', payload: event.extraction });

          // Aplicar extracción automáticamente si tiene alta confianza
          if (event.extraction.extracted) {
            const highConfidenceFields = Object.entries(event.extraction.confidence).filter(
              ([, score]) => score >= 0.9
            );

            if (highConfidenceFields.length > 0 && onCVDataUpdate) {
              onCVDataUpdate(event.extraction.extracted as unknown as Partial<CVData>);
            }
          }
          break;

        case 'phase_change':
          dispatch({ type: 'SET_PHASE', payload: event.newPhase });
          break;

        case 'complete':
          if (event.finalExtraction) {
            dispatch({ type: 'SET_EXTRACTION', payload: event.finalExtraction });
          }
          break;

        case 'error':
          dispatch({ type: 'SET_ERROR', payload: event.error });
          break;
      }
    },
    [onCVDataUpdate]
  );

  /**
   * Envía un mensaje del usuario y obtiene la respuesta del asistente vía streaming
   */
  const sendMessage = useCallback(
    async (content: string) => {
      // Cancelar cualquier stream anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear mensaje del usuario
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      dispatch({ type: 'SEND_MESSAGE', payload: userMessage });
      dispatch({ type: 'SET_STREAMING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Crear mensaje vacío del asistente que se irá llenando
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      currentAssistantMessageRef.current = assistantMessage;

      // Preparar request
      const request: ChatRequest = {
        message: content,
        sessionId: state.sessionId,
        cvData: cvDataRef.current,
        history: state.messages.slice(-10), // Últimos 10 mensajes para contexto
        phase: state.currentPhase,
        jobDescription: state.jobDescription || undefined,
      };

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Procesar líneas completas del buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Mantener la última línea incompleta

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const eventData = line.slice(6);

              if (eventData === '[DONE]') continue;

              try {
                const event: ChatStreamEvent = JSON.parse(eventData);
                handleStreamEvent(event, assistantMessage.id);
              } catch (e) {
                console.error('Error parsing SSE event:', e);
              }
            }
          }
        }

        // Agregar mensaje completo del asistente
        if (currentAssistantMessageRef.current) {
          dispatch({
            type: 'ADD_ASSISTANT_MESSAGE',
            payload: currentAssistantMessageRef.current,
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // El usuario canceló, no es un error real
          return;
        }

        console.error('Error sending message:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Error desconocido',
        });
      } finally {
        dispatch({ type: 'SET_STREAMING', payload: false });
        abortControllerRef.current = null;
        currentAssistantMessageRef.current = null;
      }
    },
    [state.sessionId, state.messages, state.currentPhase, state.jobDescription, handleStreamEvent]
  );

  /**
   * Inicia una nueva conversación
   */
  const startNewConversation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    dispatch({ type: 'RESET_CHAT' });
  }, []);

  /**
   * Aplica manualmente los datos extraídos al CV
   */
  const applyExtraction = useCallback(
    (extraction: DataExtraction) => {
      if (extraction.extracted && onCVDataUpdate) {
        // Cast to unknown first to bypass strict type checking
        onCVDataUpdate(extraction.extracted as unknown as Partial<CVData>);
      }
      dispatch({ type: 'SET_EXTRACTION', payload: null });
    },
    [onCVDataUpdate]
  );

  /**
   * Reinicia el chat completamente
   */
  const resetChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    dispatch({ type: 'RESET_CHAT' });
  }, []);

  /**
   * Establece la descripción del puesto para tailoring
   */
  const setJobDescription = useCallback((description: string) => {
    dispatch({ type: 'SET_JOB_DESCRIPTION', payload: description });
  }, []);

  const actions: ChatActions = {
    sendMessage,
    startNewConversation,
    applyExtraction,
    resetChat,
    setJobDescription,
  };

  return (
    <ChatContext.Provider value={{ state, actions }}>
      {children}
    </ChatContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook principal para acceder al estado y acciones del chat
 */
export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return context;
}

/**
 * Hook para acceder solo al estado del chat
 */
export function useChatState(): ChatState {
  const { state } = useChat();
  return state;
}

/**
 * Hook para acceder solo a las acciones del chat
 */
export function useChatActions(): ChatActions {
  const { actions } = useChat();
  return actions;
}

/**
 * Hook para verificar si hay un mensaje del asistente en streaming
 */
export function useIsStreaming(): boolean {
  const { state } = useChat();
  return state.isStreaming;
}

/**
 * Hook para obtener el mensaje actual en streaming (si existe)
 */
export function useStreamingMessage(): ChatMessage | undefined {
  const { state } = useChat();

  if (!state.isStreaming) return undefined;

  const lastMessage = state.messages[state.messages.length - 1];
  return lastMessage?.role === 'assistant' ? lastMessage : undefined;
}

export default ChatContext;
