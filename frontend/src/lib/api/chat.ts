/**
 * Cliente API para endpoints de chat conversacional
 * Proporciona funciones tipadas para interactuar con el backend
 */

import {
  ChatRequest,
  ChatResponse,
  ChatStreamEvent,
  DataExtraction,
  JobAnalysisRequest,
  JobAnalysisResponse,
  ConversationPhase,
} from '@/types/chat';
import { CVData } from '@/types/cv';

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

// =============================================================================
// TIPOS
// =============================================================================

interface ApiError {
  message: string;
  code: string;
  status: number;
}

interface StreamCallbacks {
  onDelta?: (content: string) => void;
  onExtraction?: (extraction: DataExtraction) => void;
  onPhaseChange?: (phase: ConversationPhase) => void;
  onComplete?: (response: ChatResponse) => void;
  onError?: (error: ApiError) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface SendMessageOptions {
  signal?: AbortSignal;
  retries?: number;
  retryDelay?: number;
}

// =============================================================================
// ERRORES
// =============================================================================

class ChatApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ChatApiError';
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Delay helper para retries
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parsea una línea SSE y retorna el evento
 */
function parseSSELine(line: string): ChatStreamEvent | null {
  if (!line.startsWith('data: ')) return null;

  const data = line.slice(6);

  if (data === '[DONE]') return null;

  try {
    return JSON.parse(data) as ChatStreamEvent;
  } catch {
    return null;
  }
}

/**
 * Maneja errores de respuesta HTTP
 */
async function handleApiError(response: Response): Promise<never> {
  let errorData: { detail?: string; message?: string; code?: string } = {};

  try {
    errorData = await response.json();
  } catch {
    // Si no se puede parsear JSON, usar el status text
  }

  const message = errorData.detail || errorData.message || response.statusText;
  const code = errorData.code || `HTTP_${response.status}`;

  throw new ChatApiError(message, code, response.status);
}

// =============================================================================
// FUNCIONES API
// =============================================================================

/**
 * Envía un mensaje al chat con streaming SSE
 * @param request Datos del mensaje y contexto
 * @param callbacks Callbacks para eventos del stream
 * @param options Opciones adicionales
 * @returns Función para abortar el stream
 */
export function sendChatMessageStream(
  request: ChatRequest,
  callbacks: StreamCallbacks,
  options: SendMessageOptions = {}
): () => void {
  const { signal, retries = DEFAULT_RETRY_ATTEMPTS, retryDelay = DEFAULT_RETRY_DELAY_MS } = options;

  const abortController = new AbortController();

  // Combinar señales si se proporciona una externa
  if (signal) {
    signal.addEventListener('abort', () => abortController.abort());
  }

  let lastExtraction: DataExtraction | undefined;
  let lastPhase: ConversationPhase | undefined;
  let retryCount = 0;

  const executeStream = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(request),
        signal: abortController.signal,
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      if (!response.body) {
        throw new ChatApiError('No response body', 'NO_BODY', 500);
      }

      callbacks.onConnect?.();
      retryCount = 0;

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
          if (!event) continue;

          switch (event.type) {
            case 'delta':
              callbacks.onDelta?.(event.content);
              break;

            case 'extraction':
              lastExtraction = event.extraction;
              callbacks.onExtraction?.(event.extraction);
              break;

            case 'phase_change':
              lastPhase = event.newPhase;
              callbacks.onPhaseChange?.(event.newPhase);
              break;

            case 'complete':
              callbacks.onComplete?.({
                message: event.message,
                extraction: event.finalExtraction || lastExtraction,
                newPhase: lastPhase,
              });
              callbacks.onDisconnect?.();
              break;

            case 'error':
              throw new ChatApiError(event.error, event.code, 500);
          }
        }
      }

      // Procesar buffer restante
      if (buffer.trim()) {
        const event = parseSSELine(buffer.trim());
        if (event?.type === 'complete') {
          callbacks.onComplete?.({
            message: event.message,
            extraction: event.finalExtraction || lastExtraction,
            newPhase: lastPhase,
          });
        }
      }

      callbacks.onDisconnect?.();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Abortación intencional, no es error
        return;
      }

      console.error('Stream error:', error);

      // Intentar reconexión si es apropiado
      const shouldRetry =
        retryCount < retries &&
        error instanceof ChatApiError &&
        (error.status >= 500 || error.code === 'NETWORK_ERROR');

      if (shouldRetry) {
        retryCount++;
        await delay(retryDelay * retryCount);
        return executeStream();
      }

      const apiError: ApiError =
        error instanceof ChatApiError
          ? { message: error.message, code: error.code, status: error.status }
          : {
            message: error instanceof Error ? error.message : 'Error desconocido',
            code: 'UNKNOWN_ERROR',
            status: 500,
          };

      callbacks.onError?.(apiError);
      callbacks.onDisconnect?.();
    }
  };

  // Iniciar el stream
  executeStream();

  // Retornar función de abort
  return () => abortController.abort();
}

/**
 * Envía un mensaje al chat sin streaming (respuesta completa)
 * @param request Datos del mensaje y contexto
 * @param options Opciones adicionales
 * @returns Respuesta completa del chat
 */
export async function sendChatMessage(
  request: ChatRequest,
  options: Omit<SendMessageOptions, 'signal'> = {}
): Promise<ChatResponse> {
  const { retries = DEFAULT_RETRY_ATTEMPTS, retryDelay = DEFAULT_RETRY_DELAY_MS } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Error desconocido');

      // No reintentar errores 4xx (cliente)
      if (error instanceof ChatApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Esperar antes de reintentar
      if (attempt < retries) {
        await delay(retryDelay * (attempt + 1));
      }
    }
  }

  throw lastError || new ChatApiError('Max retries exceeded', 'MAX_RETRIES', 500);
}

/**
 * Analiza una descripción de puesto y compara con el CV
 * @param request Datos del puesto y CV
 * @param options Opciones adicionales
 * @returns Análisis del puesto con sugerencias
 */
export async function analyzeJob(
  request: JobAnalysisRequest,
  options: Omit<SendMessageOptions, 'signal'> = {}
): Promise<JobAnalysisResponse> {
  const { retries = DEFAULT_RETRY_ATTEMPTS, retryDelay = DEFAULT_RETRY_DELAY_MS } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/job-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Error desconocido');

      if (error instanceof ChatApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      if (attempt < retries) {
        await delay(retryDelay * (attempt + 1));
      }
    }
  }

  throw lastError || new ChatApiError('Max retries exceeded', 'MAX_RETRIES', 500);
}

/**
 * Obtiene la siguiente pregunta sugerida para la conversación
 * @param sessionId ID de la sesión de chat
 * @param options Opciones adicionales
 * @returns Pregunta sugerida
 */
export async function getNextQuestion(
  sessionId: string,
  options: Omit<SendMessageOptions, 'signal'> = {}
): Promise<{ question: string; context?: string }> {
  const { retries = DEFAULT_RETRY_ATTEMPTS, retryDelay = DEFAULT_RETRY_DELAY_MS } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/session/${sessionId}/next-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Error desconocido');

      if (error instanceof ChatApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      if (attempt < retries) {
        await delay(retryDelay * (attempt + 1));
      }
    }
  }

  throw lastError || new ChatApiError('Max retries exceeded', 'MAX_RETRIES', 500);
}

/**
 * Extrae datos estructurados de un mensaje sin generar respuesta
 * @param request Datos del mensaje y contexto
 * @param options Opciones adicionales
 * @returns Datos extraídos
 */
export async function extractDataFromMessage(
  request: ChatRequest,
  options: Omit<SendMessageOptions, 'signal'> = {}
): Promise<DataExtraction> {
  const { retries = DEFAULT_RETRY_ATTEMPTS, retryDelay = DEFAULT_RETRY_DELAY_MS } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Error desconocido');

      if (error instanceof ChatApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      if (attempt < retries) {
        await delay(retryDelay * (attempt + 1));
      }
    }
  }

  throw lastError || new ChatApiError('Max retries exceeded', 'MAX_RETRIES', 500);
}

/**
 * Obtiene el estado de una sesión de chat
 * @param sessionId ID de la sesión
 * @returns Estado de la sesión
 */
export async function getChatSession(sessionId: string): Promise<{
  session_id: string;
  messages: unknown[];
  cv_data: Partial<CVData>;
  current_phase: string;
  created_at: string;
  updated_at: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/chat/session/${sessionId}`);

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
}

// =============================================================================
// EXPORTS
// =============================================================================

export { ChatApiError };
export type { ApiError, StreamCallbacks, SendMessageOptions };
