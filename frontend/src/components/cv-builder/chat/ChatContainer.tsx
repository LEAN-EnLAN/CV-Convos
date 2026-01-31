'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { useChat } from '@/contexts/ChatContext';
import { ExtractionPreview } from './ExtractionPreview';
import { TypingIndicator } from './TypingIndicator';
import { PhaseIndicator } from './PhaseIndicator';
import {
  RotateCcw,
  Expand,
  Shrink,
  Sparkles,
  MessageSquare,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataExtraction } from '@/types/chat';

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
  const [showExtractionPreview, setShowExtractionPreview] = useState(true);
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
  }, [state.messages.length, lastMessageContent, state.isStreaming, scrollToBottom]);

  // Sync extraction preview visibility when new data arrives
  const hasExtractedData = !!state.extractedData;
  useEffect(() => {
    if (hasExtractedData) {
      queueMicrotask(() => {
        setShowExtractionPreview(true);
      });
    }
  }, [hasExtractedData]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      await actions.sendMessage(content);
    },
    [actions]
  );

  const handleApplyExtraction = useCallback(
    (extraction: DataExtraction) => {
      actions.applyExtraction(extraction);
      setShowExtractionPreview(false);
    },
    [actions]
  );

  return (
    <div className={cn(
      'flex h-full w-full bg-background overflow-hidden font-sans',
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
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground leading-none">CV Studio AI</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Online</p>
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
            <div className="px-4 md:px-6 py-6 space-y-8 max-w-2xl mx-auto">
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
            </div>
          </ScrollArea>
        </div>

        {/* Floating Extraction Overlay */}
        <AnimatePresence>
          {state.extractedData && showExtractionPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute left-4 right-4 md:left-6 md:right-6 bottom-[140px] z-50"
            >
              <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
                <ExtractionPreview
                  extraction={state.extractedData}
                  onApply={handleApplyExtraction}
                  onDismiss={() => setShowExtractionPreview(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Progress</span>
                <span className={cn("text-xs font-bold mt-0.5", canFinalize ? "text-green-600" : "text-foreground")}>
                  {canFinalize ? 'Listo para finalizar' : 'Información incompleta'}
                </span>
              </div>
              <Button
                onClick={onFinalizeRequest}
                disabled={!canFinalize}
                className={cn(
                  "px-6 h-10 rounded-lg font-bold text-xs transition-all shadow-lg",
                  canFinalize
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
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
               // Desktop logic
               showCVPreview ? "hidden lg:flex" : "hidden",
               // Mobile logic (override desktop hidden if tab is active)
               mobileTab === 'preview' ? "flex w-full" : ""
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
