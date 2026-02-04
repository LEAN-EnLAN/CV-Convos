/**
 * Notification system types for CV-ConVos chat interface
 * Defines the structure for all notification types and their metadata
 */

import { DataExtraction } from './chat';

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

/**
 * Types of notifications in the system
 */
export type NotificationType = 'extraction' | 'toast' | 'inline' | 'confirm';

/**
 * Visual variants for notifications
 */
export type NotificationVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Position options for notification container
 */
export type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Priority levels for notifications
 */
export type NotificationPriority = 'low' | 'normal' | 'high';

// =============================================================================
// CORE INTERFACES
// =============================================================================

/**
 * Individual notification item
 */
export interface NotificationItem {
  id: string;
  type: NotificationType;
  variant: NotificationVariant;
  title?: string;
  message: string;
  duration: number | null; // null = persistent until dismissed
  actions: NotificationAction[];
  metadata: NotificationMetadata;
  timestamp: Date;
  dismissible: boolean;
  priority: NotificationPriority;
}

/**
 * Action button configuration
 */
export interface NotificationAction {
  id: string;
  label: string;
  variant: 'primary' | 'secondary' | 'destructive' | 'ghost';
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Type-specific metadata
 */
export interface NotificationMetadata {
  // Extraction notification data
  extraction?: {
    data: DataExtraction;
    onApply: (extraction: DataExtraction) => void;
    onDismiss: () => void;
    fieldActions?: Record<string, {
      onAccept: () => void;
      onReject: () => void;
    }>;
  };

  // Confirmation dialog data
  confirm?: {
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  };

  // Toast-specific
  toast?: {
    showProgress?: boolean;
    pauseOnHover?: boolean;
  };

  // Inline-specific
  inline?: {
    relatedMessageId?: string;
    fieldPath?: string;
  };
}

/**
 * State for managing notifications array
 */
export interface NotificationState {
  notifications: NotificationItem[];
  activeNotificationId: string | null;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Notification system configuration
 */
export interface NotificationConfig {
  maxNotifications: number;
  defaultDuration: number;
  position: NotificationPosition;
  animations: AnimationConfig;
  accessibility: AccessibilityConfig;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  enterDuration: number;
  exitDuration: number;
  staggerDelay: number;
  easing: string;
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  announceToScreenReader: boolean;
  trapFocus: boolean;
  restoreFocus: boolean;
  closeOnEscape: boolean;
  closeOnClickOutside: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Helper type for creating notifications (excludes auto-generated fields)
 */
export type CreateNotificationInput = Omit<NotificationItem, 'id' | 'timestamp'>;

/**
 * Notification filter/sort options
 */
export interface NotificationFilter {
  types?: NotificationType[];
  variants?: NotificationVariant[];
  dismissibleOnly?: boolean;
  persistentOnly?: boolean;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

/**
 * Default notification configuration
 */
export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  maxNotifications: 3,
  defaultDuration: 5000,
  position: 'bottom-right',
  animations: {
    enterDuration: 200,
    exitDuration: 150,
    staggerDelay: 50,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  accessibility: {
    announceToScreenReader: true,
    trapFocus: false,
    restoreFocus: true,
    closeOnEscape: true,
    closeOnClickOutside: false,
  },
};

/**
 * Default duration for toast notifications (ms)
 */
export const DEFAULT_TOAST_DURATION = 5000;

/**
 * Maximum number of notifications to display
 */
export const MAX_NOTIFICATIONS = 3;
