'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { useChat } from '@/contexts/ChatContext';
import { TypingIndicator } from './TypingIndicator';
import { PhaseIndicator } from './PhaseIndicator';
import { NotificationContainer } from '@/components/notifications';
import { ExtractionNotification } from '@/components/notifications/ExtractionNotification';
import {
  RotateCcw,
  Expand,
  Shrink,
  Sparkles,
  MessageSquare,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatContainerProps {
  className?: string;
  showPhaseIndicator?: boolean;
  showCVPreview?: boolean;
  cvPreviewComponent?: React.ReactNode;
  onFinalizeRequest?: () => void;
  canFinalize?: boolean;
  onCVDataUpdate?: (data: import('@/types/cv').CVData) => void;
}

export function ChatContainer({
  className,
  cvPreviewComponent,
  onFinalizeRequest,
  canFinalize = false,
  showCVPreview: desktopShowPreview = true,
}: ChatContainerProps) {
  const { state, actions } = useChat();
  const [showCVPreview, setShowCVPreview] = useState(desktopShowPreview);
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync internal state with prop if needed, or handle resize logic
  useEffect(() => {
    setShowCVPreview(desktopShowPreview);
  }, [desktopShowPreview]);

  const lastMessageContent = useMemo(() => {
    const lastMsg = state.messages[state.messages.length - 1];
    return lastMsg?.role === 'assistant' ? lastMsg.content : null;
  }, [state.messages]);

  const extractionNotifications = useMemo(
    () => state.notifications.filter((n) => n.type === 'extraction'),
    [state.notifications]
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        requestAnimationFrame(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior
          });
        });
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom(state.isStreaming ? 'auto' : 'smooth');
  }, [
    state.messages.length,
    lastMessageContent,
    state.isStreaming,
    extractionNotifications.length,
    scrollToBottom
  ]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      await actions.sendMessage(content);
    },
    [actions]
  );

  return (
    <div className={cn(
      'flex h-full w-full bg-background overflow-hidden font-sans pb-16 lg:pb-0',
      className
    )}>
      {/* LEFT PANEL: CHAT */}
      <div className={cn(
        'flex flex-col h-full bg-background transition-all duration-500 ease-in-out relative z-20 border-r border-border',
        // Desktop Layout logic
        showCVPreview ? 'lg:w-[45%] xl:w-[500px]' : 'lg:w-full',
        // Mobile Layout logic
        mobileTab === 'chat' ? 'w-full' : 'hidden lg:flex'
      )}>

        {/* Header - Minimal & Clean */}
        <div className="flex flex-col shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground leading-none">CV-ConVos</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-[10px] font-bold text-foreground/80 uppercase tracking-wider">Online</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={() => setShowCVPreview(!showCVPreview)}
              >
                {showCVPreview ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={actions.startNewConversation}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="px-6 py-2 bg-muted/30">
            <PhaseIndicator currentPhase={state.currentPhase} compact />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 relative flex flex-col">
          <ScrollArea className="h-full w-full" ref={scrollRef}>
            <div className="px-4 md:px-6 py-6 pb-28 lg:pb-8 space-y-8 max-w-2xl mx-auto">
              {state.messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={state.isStreaming && index === state.messages.length - 1 && message.role === 'assistant'}
                />
              ))}

              {state.isStreaming && !state.messages[state.messages.length - 1]?.content && (
                <div className="flex items-center gap-3 pl-4 md:pl-12">
                  <TypingIndicator />
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {extractionNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{
                      duration: 0.2,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <ExtractionNotification notification={notification} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Notification Container - toasts/alerts */}
        <NotificationContainer position="bottom-right" maxNotifications={3} />

        {/* Input area */}
        <div className="shrink-0 px-4 md:px-6 py-4 border-t border-border bg-background">
          <div className="max-w-2xl mx-auto w-full">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={state.isStreaming}
              showQuickActions
            />
          </div>

          {onFinalizeRequest && (
            <div className="max-w-2xl mx-auto w-full mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Progreso del CV</span>
                <span className={cn("text-xs font-bold mt-0.5", canFinalize ? "text-green-600" : "text-foreground/90")}>
                  {canFinalize ? 'Listo para finalizar' : 'Información requerida'}
                </span>
              </div>
              <Button
                onClick={onFinalizeRequest}
                disabled={!canFinalize}
                className={cn(
                  "px-6 h-10 rounded-lg font-bold text-xs transition-all shadow-md border",
                  canFinalize
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-primary/20"
                    : "bg-muted text-muted-foreground border-border cursor-not-allowed"
                )}
              >
                Finalizar CV
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CV PREVIEW (Desktop) / TAB (Mobile) */}
      <AnimatePresence mode="wait">
        {(showCVPreview || mobileTab === 'preview') && (
           <motion.div
             key="preview-panel"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 20 }}
             transition={{ duration: 0.3 }}
             className={cn(
               "flex-col flex-1 h-full bg-muted/30 relative overflow-hidden border-l border-border",
               mobileTab === 'preview' ? "flex w-full" : "hidden",
               showCVPreview ? "lg:flex" : "lg:hidden"
             )}
           >
             {/* Mobile Header for Preview */}
             <div className="lg:hidden h-14 border-b border-border bg-card flex items-center px-4 justify-between shrink-0">
                <span className="font-bold text-sm">Vista Previa</span>
                <Button variant="ghost" size="sm" onClick={() => setMobileTab('chat')}>
                  <MessageSquare className="w-4 h-4 mr-2"/> Volver al Chat
                </Button>
             </div>

             <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 overflow-y-auto scrollbar-hide">
               <div className="w-full max-w-[800px] shadow-2xl border border-border bg-card rounded-xl overflow-hidden">
                 {cvPreviewComponent}
               </div>
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE TAB BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-50 px-6 pb-safe">
        <button
          onClick={() => setMobileTab('chat')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            mobileTab === 'chat' ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className={cn("p-1.5 rounded-lg transition-all", mobileTab === 'chat' && "bg-primary/10")}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            mobileTab === 'preview' ? "text-primary" : "text-muted-foreground"
          )}
        >
           <div className={cn("p-1.5 rounded-lg transition-all", mobileTab === 'preview' && "bg-primary/10")}>
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Vista</span>
        </button>
      </div>
    </div>
  );
}

export default ChatContainer;
