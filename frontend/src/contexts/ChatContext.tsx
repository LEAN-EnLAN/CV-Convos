/**
 * ChatContext - Contexto de estado para el chat conversacional del CV builder
 * Maneja mensajes, fases de conversación, extracción de datos y streaming
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef, ReactNode, useEffect, useMemo } from 'react';
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
import {
  NotificationItem,
  CreateNotificationInput,
  DEFAULT_TOAST_DURATION,
} from '@/types/notifications';
import { buildApiUrl } from '@/lib/api/base';
import { getAiConfigErrorMessage } from '@/lib/ai-errors';

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
  notifications: [],
  activeNotificationId: null,
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
  | { type: 'ADD_ASSISTANT_MESSAGE'; payload: ChatMessage }
  | { type: 'SHOW_NOTIFICATION'; payload: NotificationItem }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'DISMISS_ALL_NOTIFICATIONS' }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<NotificationItem> } }
  | { type: 'SET_ACTIVE_NOTIFICATION'; payload: string | null };

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

    case 'SHOW_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
        activeNotificationId: action.payload.id,
      };

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
        activeNotificationId:
          state.activeNotificationId === action.payload ? null : state.activeNotificationId,
      };

    case 'DISMISS_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        activeNotificationId: null,
      };

    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? { ...n, ...action.payload.updates } : n
        ),
      };

    case 'SET_ACTIVE_NOTIFICATION':
      return {
        ...state,
        activeNotificationId: action.payload,
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

const ChatStateContext = createContext<ChatState | undefined>(undefined);
const ChatActionsContext = createContext<ChatActions | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface ChatProviderProps {
  children: ReactNode;
  initialCVData?: Partial<CVData>;
  onCVDataUpdate?: (data: Partial<CVData>) => void;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

const levelToProficiency = (level?: string) => {
  switch (level) {
    case 'Beginner':
      return 25;
    case 'Advanced':
      return 75;
    case 'Expert':
      return 90;
    default:
      return 50;
  }
};

const hashString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildStableId = (prefix: string, parts: Array<string | undefined | null>) => {
  const payload = parts.filter(Boolean).join('|');
  if (!payload) return '';
  return `${prefix}_${hashString(payload)}`;
};

export function ChatProvider({ children, initialCVData, onCVDataUpdate }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, createInitialState());
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAssistantMessageRef = useRef<ChatMessage | null>(null);
  const extractionHandledRef = useRef(false);
  const extractionNotificationIdRef = useRef<string | null>(null);

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
    (event: ChatStreamEvent & { provider?: string; fallback_active?: boolean; offline_mode?: boolean }, messageId: string) => {
      switch (event.type) {
        case 'delta':
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: { id: messageId, content: event.content },
          });

          if (currentAssistantMessageRef.current) {
            currentAssistantMessageRef.current.content += event.content;
          }
          break;

        case 'extraction':
          dispatch({ type: 'SET_EXTRACTION', payload: event.extraction });
          console.log('%c[AI-EXTRACTION]', 'color: #10b981; font-weight: bold', event.extraction);
          break;

        case 'visual_update':
          console.log('%c[AI-VISUAL-UPDATE]', 'color: #8b5cf6; font-weight: bold', event.config);
          if (onCVDataUpdate) {
            onCVDataUpdate({ config: event.config } as any);
          }
          break;

        case 'phase_change':
          dispatch({ type: 'SET_PHASE', payload: event.newPhase });
          console.log('%c[PHASE-CHANGE]', 'color: #f59e0b; font-weight: bold', event.newPhase);
          break;

        case 'complete': {
          if (event.finalExtraction) {
            dispatch({ type: 'SET_EXTRACTION', payload: event.finalExtraction });
          }

          // ═══════════════════════════════════════════════════════════════
          // DEBUG: Log provider info for DevTools monitoring
          // ═══════════════════════════════════════════════════════════════
          const provider = (event as any).provider || 'unknown';
          const isFallback = (event as any).fallback_active;
          const isOffline = (event as any).offline_mode;

          if (isOffline) {
            console.warn('%c[AI-OFFLINE-MODE]', 'background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px;',
              'All AI providers exhausted. Heuristic engine active.');
          } else if (isFallback) {
            console.warn('%c[AI-FALLBACK]', 'background: #f59e0b; color: black; padding: 2px 6px; border-radius: 4px;',
              `Primary AI exhausted. Using fallback: ${provider}`);
          } else {
            console.log('%c[AI-RESPONSE]', 'color: #22c55e; font-weight: bold',
              `Provider: ${provider}`);
          }
          break;
        }

        case 'error': {
          const errorCode = (event as any).code || 'UNKNOWN';
          const isRateLimited = event.error.includes('429') ||
            event.error.includes('RESOURCE_EXHAUSTED') ||
            event.error.includes('quota');
          const aiConfigMessage = getAiConfigErrorMessage(event.error);

          // ═══════════════════════════════════════════════════════════════
          // CONSOLE LOG: Detailed error for DevTools debugging
          // ═══════════════════════════════════════════════════════════════
          console.error('%c[AI-ERROR]', 'background: #dc2626; color: white; padding: 2px 6px; border-radius: 4px;', {
            code: errorCode,
            isQuotaError: isRateLimited,
            message: event.error,
            timestamp: new Date().toISOString(),
          });

          if (isRateLimited) {
            console.warn('%c[QUOTA-EXHAUSTED]', 'background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 14px;',
              '\n⚠️ AI Token Quota Exhausted!',
              '\n• Gemini Flash Lite has hit its daily/minute token limit',
              '\n• System should fallback to Groq automatically',
              '\n• If this persists, check API quotas in Google Cloud Console');
          }

          dispatch({ type: 'SET_ERROR', payload: aiConfigMessage || event.error });

          const errorMessage: ChatMessage = {
            id: `msg_${Date.now()}_error`,
            role: 'assistant',
            content: aiConfigMessage
              ? `⚙️ ${aiConfigMessage}`
              : isRateLimited
                ? '⏳ El servicio de IA está temporalmente limitado. Cambiando a modo alternativo...'
                : '❌ Hubo un problema procesando tu mensaje. Por favor, intenta de nuevo.',
            timestamp: new Date(),
          };
          dispatch({ type: 'ADD_ASSISTANT_MESSAGE', payload: errorMessage });
          break;
        }
      }
    },
    [onCVDataUpdate]
  );

  /**
   * Envía un mensaje del usuario y obtiene la respuesta del asistente vía streaming
   */
  const sendMessage = useCallback(
    async (content: string) => {
      extractionHandledRef.current = false;

      // PROOF OF CONCEPT: Si el usuario escribe /demo, forzamos una actualización
      if (content.toLowerCase() === '/demo' && onCVDataUpdate) {
        const demoData = {
          personalInfo: {
            fullName: 'Alejandro Tech',
            email: 'alejandro@demo.com',
            role: 'Senior Software Architect',
            summary: 'Arquitecto de software con pasión por el diseño minimalista y la IA.'
          },
          skills: [{ id: '1', name: 'React', level: 'Expert', proficiency: 95 }]
        };
        onCVDataUpdate(demoData as any);
        dispatch({
          type: 'SEND_MESSAGE',
          payload: { id: `msg_${Date.now()}_user`, role: 'user', content: '/demo', timestamp: new Date() }
        });
        dispatch({
          type: 'ADD_ASSISTANT_MESSAGE',
          payload: {
            id: `msg_${Date.now()}_assistant`,
            role: 'assistant',
            content: '¡Modo Demo activado! He actualizado tu preview para demostrar que la sincronización funciona perfectamente.',
            timestamp: new Date()
          }
        });
        return;
      }

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
        const response = await fetch(buildApiUrl('/api/chat/stream'), {
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
          return;
        }

        // ═══════════════════════════════════════════════════════════════
        // CONSOLE LOG: Network/fetch level error
        // ═══════════════════════════════════════════════════════════════
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const isNetworkError = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError');
        const isQuotaRelated = errorMessage.includes('503') || errorMessage.includes('429');
        const aiConfigMessage = getAiConfigErrorMessage(errorMessage);

        console.error('%c[CHAT-ERROR]', 'background: #7c2d12; color: white; padding: 2px 6px; border-radius: 4px;', {
          type: isNetworkError ? 'NETWORK' : isQuotaRelated ? 'QUOTA' : 'UNKNOWN',
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });

        if (isQuotaRelated) {
          console.warn('%c[SERVICE-OVERLOADED]', 'background: #ea580c; color: white; padding: 4px 8px; border-radius: 4px;',
            '\n🔥 Backend returned 503/429',
            '\n• The AI services are overloaded',
            '\n• Check backend logs for detailed fallback info');
        }

        dispatch({
          type: 'SET_ERROR',
          payload: aiConfigMessage || errorMessage,
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


  const prepareExtractionForApply = useCallback((extracted: DataExtraction['extracted']) => {
    const prepared: Partial<CVData> = {};

    if (extracted.personalInfo) {
      prepared.personalInfo = extracted.personalInfo as CVData['personalInfo'];
    }

    if (extracted.experience) {
      const mapped = extracted.experience.map((item) => {
        const company = (item as any).company || '';
        const position = (item as any).position || '';
        const startDate = (item as any).startDate || '';
        const endDate = (item as any).endDate || '';
        const description = (item as any).description || '';
        return {
          id: (item as any).id || buildStableId('exp', [company, position, startDate, endDate, description]) || generateId(),
          company,
          position,
          startDate,
          endDate,
          current: Boolean((item as any).current),
          location: (item as any).location || '',
          description,
        };
      });
      const unique = new Map(mapped.map((item) => [item.id, item]));
      prepared.experience = Array.from(unique.values());
    }

    if (extracted.education) {
      const mapped = extracted.education.map((item) => {
        const institution = (item as any).institution || '';
        const degree = (item as any).degree || '';
        const fieldOfStudy = (item as any).fieldOfStudy || '';
        const startDate = (item as any).startDate || '';
        const endDate = (item as any).endDate || '';
        return {
          id: (item as any).id || buildStableId('edu', [institution, degree, fieldOfStudy, startDate, endDate]) || generateId(),
          institution,
          degree,
          fieldOfStudy,
          startDate,
          endDate,
          location: (item as any).location || '',
          description: (item as any).description || '',
        };
      });
      const unique = new Map(mapped.map((item) => [item.id, item]));
      prepared.education = Array.from(unique.values());
    }

    if (extracted.skills) {
      const mapped = extracted.skills.map((item) => {
        const name = (item as any).name || '';
        const level = (item as any).level || 'Intermediate';
        return {
          id: (item as any).id || buildStableId('skill', [name, level]) || generateId(),
          name,
          level,
          proficiency: (item as any).proficiency ?? levelToProficiency(level),
          category: (item as any).category || '',
        };
      });
      const unique = new Map(mapped.map((item) => [item.id, item]));
      prepared.skills = Array.from(unique.values());
    }

    if (extracted.projects) {
      const mapped = extracted.projects.map((item) => {
        const name = (item as any).name || '';
        const description = (item as any).description || '';
        return {
          id: (item as any).id || buildStableId('proj', [name, description]) || generateId(),
          name,
          description,
          url: (item as any).url || '',
          technologies: (item as any).technologies || [],
        };
      });
      const unique = new Map(mapped.map((item) => [item.id, item]));
      prepared.projects = Array.from(unique.values());
    }

    if (extracted.languages) {
      const mapped = extracted.languages.map((item) => {
        const language = (item as any).language || '';
        const fluency = (item as any).fluency || 'Conversational';
        return {
          id: (item as any).id || buildStableId('lang', [language, fluency]) || generateId(),
          language,
          fluency,
        };
      });
      const unique = new Map(mapped.map((item) => [item.id, item]));
      prepared.languages = Array.from(unique.values());
    }

    if (extracted.certifications) {
      const mapped = extracted.certifications.map((item) => {
        const name = (item as any).name || '';
        const issuer = (item as any).issuer || '';
        const date = (item as any).date || '';
        return {
          id: (item as any).id || buildStableId('cert', [name, issuer, date]) || generateId(),
          name,
          issuer,
          date,
          url: (item as any).url || '',
        };
      });
      const unique = new Map(mapped.map((item) => [item.id, item]));
      prepared.certifications = Array.from(unique.values());
    }

    return prepared;
  }, []);

  /**
   * Aplica manualmente los datos extraídos al CV
   */
  const applyExtraction = useCallback(
    (extraction: DataExtraction) => {
      const hasExtracted = extraction.extracted && Object.keys(extraction.extracted).length > 0;
      const deletedItems = (extraction as any).deletedItems || [];

      if ((hasExtracted || deletedItems.length > 0) && onCVDataUpdate) {
        const updatedData = prepareExtractionForApply(extraction.extracted || {});

        // Manejar eliminaciones
        if (deletedItems.length > 0) {
          deletedItems.forEach((item: any) => {
            const section = item.section as keyof CVData;
            const currentList = cvDataRef.current[section];

            if (Array.isArray(currentList)) {
              const newList = currentList.filter((existingItem: any) => {
                // Eliminar por ID si está disponible
                if (item.id && existingItem.id) {
                  return String(existingItem.id) !== String(item.id);
                }
                // Eliminar por nombre/empresa como fallback
                if (item.name) {
                  const existingName = String(existingItem.name || existingItem.company || existingItem).toLowerCase();
                  return existingName !== String(item.name).toLowerCase();
                }
                return true;
              });
              (updatedData as any)[section] = newList;
            }
          });
        }

        // Cast to unknown first to bypass strict type checking
        onCVDataUpdate(updatedData as unknown as Partial<CVData>);
      }
      dispatch({ type: 'SET_EXTRACTION', payload: null });
    },
    [onCVDataUpdate, prepareExtractionForApply]
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

  /**
   * Muestra una notificación
   */
  const showNotification = useCallback((notification: CreateNotificationInput): string => {
    const id = crypto.randomUUID();
    const newNotification: NotificationItem = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? DEFAULT_TOAST_DURATION,
      actions: notification.actions || [],
      dismissible: notification.dismissible ?? true,
      priority: notification.priority ?? 'normal',
    };

    dispatch({ type: 'SHOW_NOTIFICATION', payload: newNotification });

    // Auto-dismiss for toast notifications with duration
    if (newNotification.duration !== null && newNotification.type === 'toast') {
      setTimeout(() => {
        dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
      }, newNotification.duration);
    }

    return id;
  }, []);

  const hasMeaningfulExtraction = useCallback((extraction: DataExtraction): boolean => {
    const extracted = extraction.extracted || {};
    const deletedItems = (extraction as any).deletedItems || [];
    return Boolean(
      (extracted.personalInfo && Object.keys(extracted.personalInfo).length > 0) ||
      (extracted.experience && extracted.experience.length > 0) ||
      (extracted.education && extracted.education.length > 0) ||
      (extracted.skills && extracted.skills.length > 0) ||
      (extracted.projects && extracted.projects.length > 0) ||
      (extracted.languages && extracted.languages.length > 0) ||
      (extracted.certifications && extracted.certifications.length > 0) ||
      (deletedItems.length > 0)
    );
  }, []);

  const showExtractionNotification = useCallback((extraction: DataExtraction) => {
    if (!hasMeaningfulExtraction(extraction)) return;

    if (extractionNotificationIdRef.current) {
      dispatch({ type: 'DISMISS_NOTIFICATION', payload: extractionNotificationIdRef.current });
    }

    const id = crypto.randomUUID();
    extractionNotificationIdRef.current = id;

    const notification: NotificationItem = {
      id,
      type: 'extraction',
      variant: 'info',
      title: 'Datos detectados',
      message: 'Encontré información útil para tu CV.',
      duration: null,
      actions: [],
      metadata: {
        extraction: {
          data: extraction,
          onApply: (payload) => {
            applyExtraction(payload);
            dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
            extractionNotificationIdRef.current = null;
          },
          onDismiss: () => {
            dispatch({ type: 'SET_EXTRACTION', payload: null });
            dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
            extractionNotificationIdRef.current = null;
          },
        },
      },
      timestamp: new Date(),
      dismissible: true,
      priority: 'high',
    };

    dispatch({ type: 'SHOW_NOTIFICATION', payload: notification });
  }, [applyExtraction, hasMeaningfulExtraction]);

  useEffect(() => {
    if (!state.extractedData) return;
    if (extractionHandledRef.current) return;

    extractionHandledRef.current = true;
    showExtractionNotification(state.extractedData);
  }, [state.extractedData, showExtractionNotification]);

  /**
   * Descarta una notificación específica
   */
  const dismissNotification = useCallback((id: string) => {
    dispatch({ type: 'DISMISS_NOTIFICATION', payload: id });
  }, []);

  /**
   * Descarta todas las notificaciones
   */
  const dismissAllNotifications = useCallback(() => {
    dispatch({ type: 'DISMISS_ALL_NOTIFICATIONS' });
  }, []);

  /**
   * Actualiza una notificación existente
   */
  const updateNotification = useCallback((id: string, updates: Partial<NotificationItem>) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, updates } });
  }, []);

  /**
   * Establece la notificación activa
   */
  const setActiveNotification = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_NOTIFICATION', payload: id });
  }, []);

  const actions = useMemo<ChatActions>(() => ({
    sendMessage,
    startNewConversation,
    applyExtraction,
    resetChat,
    setJobDescription,
    showNotification,
    dismissNotification,
    dismissAllNotifications,
    updateNotification,
    setActiveNotification,
  }), [
    applyExtraction,
    dismissAllNotifications,
    dismissNotification,
    resetChat,
    sendMessage,
    setActiveNotification,
    setJobDescription,
    showNotification,
    startNewConversation,
    updateNotification,
  ]);

  return (
    <ChatStateContext.Provider value={state}>
      <ChatActionsContext.Provider value={actions}>
        {children}
      </ChatActionsContext.Provider>
    </ChatStateContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook principal para acceder al estado y acciones del chat
 */
export function useChat(): ChatContextValue {
  const state = useContext(ChatStateContext);
  const actions = useContext(ChatActionsContext);

  if (state === undefined || actions === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return { state, actions };
}

/**
 * Hook para acceder solo al estado del chat
 */
export function useChatState(): ChatState {
  const state = useContext(ChatStateContext);

  if (state === undefined) {
    throw new Error('useChatState must be used within a ChatProvider');
  }

  return state;
}

/**
 * Hook para acceder solo a las acciones del chat
 */
export function useChatActions(): ChatActions {
  const actions = useContext(ChatActionsContext);

  if (actions === undefined) {
    throw new Error('useChatActions must be used within a ChatProvider');
  }

  return actions;
}

/**
 * Hook para verificar si hay un mensaje del asistente en streaming
 */
export function useIsStreaming(): boolean {
  const state = useChatState();
  return state.isStreaming;
}

/**
 * Hook para obtener el mensaje actual en streaming (si existe)
 */
export function useStreamingMessage(): ChatMessage | undefined {
  const state = useChatState();

  if (!state.isStreaming) return undefined;

  const lastMessage = state.messages[state.messages.length - 1];
  return lastMessage?.role === 'assistant' ? lastMessage : undefined;
}
