/**
 * Tipos para el sistema de chat conversacional del CV builder
 * Define las estructuras de datos para mensajes, extracciones y eventos de streaming
 */

import { CVData, PersonalInfo, Experience, Education, Skill, Project, Language, Certification } from './cv';

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Fases de la conversación del wizard conversacional
 */
export type ConversationPhase =
  | 'welcome'
  | 'personal_info'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'summary'
  | 'job_tailoring'
  | 'optimization'
  | 'review';

/**
 * Roles de los mensajes en el chat
 */
export type ChatRole = 'user' | 'assistant' | 'system';

/**
 * Tipos de eventos de streaming SSE
 */
export type ChatStreamEventType =
  | 'delta'
  | 'extraction'
  | 'visual_update'
  | 'phase_change'
  | 'complete'
  | 'error';

// =============================================================================
// INTERFACES PRINCIPALES
// =============================================================================

/**
 * Estructura de un mensaje en la conversación
 */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  extraction?: DataExtraction;
  metadata?: {
    phase?: ConversationPhase;
    intent?: string;
    entities?: string[];
  };
}

/**
 * Datos extraídos de un mensaje del usuario
 */
export interface DataExtraction {
  extracted: {
    personalInfo?: Partial<PersonalInfo>;
    experience?: Partial<Experience>[];
    education?: Partial<Education>[];
    skills?: Partial<Skill>[];
    projects?: Partial<Project>[];
    languages?: Partial<Language>[];
    certifications?: Partial<Certification>[];
  };
  confidence: Record<string, number>;
  needsClarification?: string[];
  followUpQuestions?: string[];
  detectedPhase?: ConversationPhase;
}

/**
 * Estado completo del chat
 */
export interface ChatState {
  messages: ChatMessage[];
  currentPhase: ConversationPhase;
  isStreaming: boolean;
  sessionId: string;
  extractedData: DataExtraction | null;
  error: string | null;
  jobDescription: string | null;
  notifications: import('./notifications').NotificationItem[];
  activeNotificationId: string | null;
}

// =============================================================================
// EVENTOS DE STREAMING
// =============================================================================

/**
 * Evento de streaming: fragmento de texto (delta)
 */
export interface ChatDeltaEvent {
  type: 'delta';
  content: string;
}

/**
 * Evento de streaming: extracción de datos
 */
export interface ChatExtractionEvent {
  type: 'extraction';
  extraction: DataExtraction;
}

/**
 * Evento de streaming: cambio de fase
 */
export interface ChatPhaseChangeEvent {
  type: 'phase_change';
  newPhase: ConversationPhase;
  reason: string;
}

/**
 * Evento de streaming: mensaje completo
 */
export interface ChatCompleteEvent {
  type: 'complete';
  message: ChatMessage;
  finalExtraction?: DataExtraction;
}

/**
 * Evento de streaming: error
 */
export interface ChatErrorEvent {
  type: 'error';
  error: string;
  code: string;
}

/**
 * Evento de streaming: actualización visual (template, colores, fuentes)
 */
export interface ChatVisualUpdateEvent {
  type: 'visual_update';
  config: Partial<import('./cv').TemplateConfig>;
}

/**
 * Unión de todos los tipos de eventos de streaming
 */
export type ChatStreamEvent =
  | ChatDeltaEvent
  | ChatExtractionEvent
  | ChatVisualUpdateEvent
  | ChatPhaseChangeEvent
  | ChatCompleteEvent
  | ChatErrorEvent;

// =============================================================================
// REQUESTS Y RESPONSES API
// =============================================================================

/**
 * Request para el endpoint de chat
 */
export interface ChatRequest {
  message: string;
  sessionId: string;
  cvData: Partial<CVData>;
  history: ChatMessage[];
  phase: ConversationPhase;
  jobDescription?: string;
}

/**
 * Response completo del chat (no-streaming)
 */
export interface ChatResponse {
  message: ChatMessage;
  extraction?: DataExtraction;
  newPhase?: ConversationPhase;
  suggestions?: string[];
}

/**
 * Request para análisis de puesto
 */
export interface JobAnalysisRequest {
  jobDescription: string;
  cvData: Partial<CVData>;
}

/**
 * Sugerencia de mejora para el CV
 */
export interface TailoringSuggestion {
  section: string;
  current: string;
  suggested: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Response del análisis de puesto
 */
export interface JobAnalysisResponse {
  matchScore: number;
  keyRequirements: string[];
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: TailoringSuggestion[];
  optimizedCV?: Partial<CVData>;
}

// =============================================================================
// CONFIGURACIÓN Y UTILIDADES
// =============================================================================

/**
 * Configuración del hook de chat
 */
export interface UseChatConfig {
  sessionId?: string;
  initialPhase?: ConversationPhase;
  onMessage?: (message: ChatMessage) => void;
  onExtraction?: (extraction: DataExtraction) => void;
  onPhaseChange?: (phase: ConversationPhase) => void;
  onError?: (error: string) => void;
}

/**
 * Acciones disponibles en el contexto de chat
 */
export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  startNewConversation: () => void;
  applyExtraction: (extraction: DataExtraction) => void;
  resetChat: () => void;
  setJobDescription: (description: string) => void;
  showNotification: (notification: import('./notifications').CreateNotificationInput) => string;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
  updateNotification: (id: string, updates: Partial<import('./notifications').NotificationItem>) => void;
  setActiveNotification: (id: string | null) => void;
}

/**
 * Información de una fase de conversación
 */
export interface PhaseInfo {
  id: ConversationPhase;
  label: string;
  description: string;
  icon: string;
  order: number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

/**
 * Información de todas las fases de conversación
 */
export const PHASES: Record<ConversationPhase, PhaseInfo> = {
  welcome: {
    id: 'welcome',
    label: 'Bienvenida',
    description: 'Inicio de la conversación',
    icon: 'hand',
    order: 0,
  },
  personal_info: {
    id: 'personal_info',
    label: 'Información Personal',
    description: 'Datos de contacto básicos',
    icon: 'user',
    order: 1,
  },
  experience: {
    id: 'experience',
    label: 'Experiencia',
    description: 'Historial laboral',
    icon: 'briefcase',
    order: 2,
  },
  education: {
    id: 'education',
    label: 'Educación',
    description: 'Formación académica',
    icon: 'graduation-cap',
    order: 3,
  },
  skills: {
    id: 'skills',
    label: 'Habilidades',
    description: 'Skills técnicos y blandos',
    icon: 'zap',
    order: 4,
  },
  projects: {
    id: 'projects',
    label: 'Proyectos',
    description: 'Proyectos destacados',
    icon: 'folder',
    order: 5,
  },
  summary: {
    id: 'summary',
    label: 'Resumen',
    description: 'Perfil profesional',
    icon: 'file-text',
    order: 6,
  },
  job_tailoring: {
    id: 'job_tailoring',
    label: 'Ajuste al Puesto',
    description: 'Personalización para el empleo',
    icon: 'target',
    order: 7,
  },
  optimization: {
    id: 'optimization',
    label: 'Optimización',
    description: 'Mejoras finales',
    icon: 'sparkles',
    order: 8,
  },
  review: {
    id: 'review',
    label: 'Revisión',
    description: 'Revisión y exportación',
    icon: 'check-circle',
    order: 9,
  },
};

/**
 * Mensaje de bienvenida inicial del asistente
 */
export const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  role: 'assistant',
  content: '¡Hola! Soy tu asistente para crear CVs profesionales. Voy a ayudarte a construir un currículum impactante paso a paso.\n\nPara empezar, cuéntame: ¿cuál es tu nombre completo y qué tipo de trabajo estás buscando?',
  timestamp: new Date(),
  metadata: {
    phase: 'welcome',
  },
};

/**
 * Quick actions disponibles para el usuario
 */
export const QUICK_ACTIONS = [
  { id: 'add_experience', label: 'Agregar experiencia', icon: 'plus' },
  { id: 'add_education', label: 'Agregar educación', icon: 'graduation-cap' },
  { id: 'add_skills', label: 'Agregar skills', icon: 'zap' },
  { id: 'job_targeting', label: 'Ajustar a puesto', icon: 'target' },
  { id: 'optimize', label: 'Optimizar CV', icon: 'sparkles' },
] as const;

export type QuickActionId = typeof QUICK_ACTIONS[number]['id'];
