'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useChatState } from '@/contexts/ChatContext';
import { NotificationItem } from './NotificationItem';
import { NotificationPosition } from '@/types/notifications';

interface NotificationContainerProps {
  position?: NotificationPosition;
  maxNotifications?: number;
}

/**
 * NotificationContainer - Renders notifications within chat container bounds
 * Uses Framer Motion for enter/exit animations
 * Position: bottom-right for toasts, inline for extraction
 * No full-screen overlays, max z-index 40
 */
export function NotificationContainer({
  position = 'bottom-right',
  maxNotifications = 3,
}: NotificationContainerProps) {
  const { notifications } = useChatState();

  // Filter notifications to display (max limit)
  const displayNotifications = notifications.slice(-maxNotifications);

  // Only render non-extraction notifications here (extractions are inline in chat flow)
  const otherNotifications = displayNotifications.filter((n) => n.type !== 'extraction');

  return (
    <>
      {/* Toast/inline notifications - positioned absolutely */}
      <AnimatePresence mode="popLayout">
        {otherNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'fixed z-40 pointer-events-none',
              // Position variants
              position === 'bottom-right' && 'bottom-4 right-4',
              position === 'bottom-left' && 'bottom-4 left-4',
              position === 'bottom-center' && 'bottom-4 left-1/2 -translate-x-1/2',
              position === 'top-right' && 'top-4 right-4',
              position === 'top-left' && 'top-4 left-4',
              position === 'top-center' && 'top-4 left-1/2 -translate-x-1/2'
            )}
          >
            <div className="flex flex-col gap-2 pointer-events-auto max-w-[400px]">
              {otherNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default NotificationContainer;
