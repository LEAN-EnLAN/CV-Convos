'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { NotificationItem as NotificationItemType, NotificationVariant } from '@/types/notifications';
import { useChatActions } from '@/contexts/ChatContext';

interface NotificationItemProps {
  notification: NotificationItemType;
}

/**
 * NotificationItem - Base wrapper with dismiss button (X icon)
 * Visual variants: info (blue), success (green), warning (amber), error (red)
 * Keyboard support: Escape to dismiss
 * ARIA attributes: role="alert", aria-live="polite"
 */
export function NotificationItem({ notification }: NotificationItemProps) {
  const { dismissNotification } = useChatActions();

  // Keyboard support: Escape to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && notification.dismissible) {
        dismissNotification(notification.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notification.id, notification.dismissible, dismissNotification]);

  const variantStyles: Record<NotificationVariant, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
    success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100',
    error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
  };

  const variantIcon: Record<NotificationVariant, React.ReactNode> = {
    info: null, // Icon provided by parent
    success: null,
    warning: null,
    error: null,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
      role="alert"
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border shadow-lg',
        variantStyles[notification.variant],
        'w-full'
      )}
    >
      {/* Icon slot - parent components can provide their own icons */}
      {variantIcon[notification.variant]}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h3 className="text-sm font-semibold mb-1 truncate">
            {notification.title}
          </h3>
        )}
        <p className="text-sm leading-relaxed break-words">
          {notification.message}
        </p>

        {/* Actions */}
        {notification.actions.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {notification.actions.map((action) => (
              <Button
                key={action.id}
                variant={
                  action.variant === 'primary'
                    ? 'default'
                    : action.variant === 'destructive'
                    ? 'destructive'
                    : 'outline'
                }
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className="h-8 text-xs font-medium"
              >
                {action.icon && <action.icon className="w-3.5 h-3.5 mr-1.5" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {notification.dismissible && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dismissNotification(notification.id)}
          className="shrink-0 h-6 w-6 hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </motion.div>
  );
}

export default NotificationItem;
