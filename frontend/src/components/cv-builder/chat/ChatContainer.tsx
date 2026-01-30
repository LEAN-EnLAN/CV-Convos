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
  Sparkles
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
}: ChatContainerProps) {
  const { state, actions } = useChat();
  const [showCVPreview, setShowCVPreview] = useState(true);
  const [showExtractionPreview, setShowExtractionPreview] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      // Use queueMicrotask to avoid synchronous setState in effect lint error
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
      'flex h-full w-full bg-white overflow-hidden font-sans selection:bg-black selection:text-white',
      className
    )}>
      {/* LEFT PANEL: CHAT */}
      <div className={cn(
        'flex flex-col h-full bg-white transition-all duration-500 ease-in-out relative z-20 border-r border-slate-200',
        showCVPreview
          ? 'w-full lg:w-[45%] xl:w-[500px]'
          : 'w-full'
      )}>

        {/* Header - Minimal & Sharp */}
        <div className="flex flex-col shrink-0 border-b border-black">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-black leading-none">CV Studio AI</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-500" />
                  <p className="text-[9px] font-bold text-black uppercase tracking-widest">Live Assistant</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none hover:bg-black hover:text-white"
                onClick={() => setShowCVPreview(!showCVPreview)}
              >
                {showCVPreview ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none hover:bg-black hover:text-white"
                onClick={actions.startNewConversation}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="px-6 py-2 bg-black">
            <PhaseIndicator currentPhase={state.currentPhase} compact />
          </div>
        </div>

        {/* Messages - Structured */}
        <div className="flex-1 min-h-0 relative flex flex-col">
          <ScrollArea className="h-full w-full" ref={scrollRef}>
            <div className="px-6 py-10 space-y-10 max-w-2xl mx-auto">
              {state.messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={state.isStreaming && index === state.messages.length - 1 && message.role === 'assistant'}
                />
              ))}

              {state.isStreaming && !state.messages[state.messages.length - 1]?.content && (
                <div className="flex items-center gap-3 pl-12">
                  <TypingIndicator />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Floating Extraction Overlay - Sharp & Dark */}
        <AnimatePresence>
          {state.extractedData && showExtractionPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute left-6 right-6 bottom-[140px] z-50"
            >
              <div className="border-2 border-black bg-white shadow-xl">
                <ExtractionPreview
                  extraction={state.extractedData}
                  onApply={handleApplyExtraction}
                  onDismiss={() => setShowExtractionPreview(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area - Sharp & Minimal */}
        <div className="shrink-0 px-6 py-6 border-t border-black bg-white">
          <div className="max-w-2xl mx-auto w-full">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={state.isStreaming}
              showQuickActions
            />
          </div>

          {onFinalizeRequest && (
            <div className="max-w-2xl mx-auto w-full mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-black uppercase tracking-widest">Progress</span>
                <span className={cn("text-[10px] font-bold mt-0.5 uppercase tracking-wider", canFinalize ? "text-green-600" : "text-black")}>
                  {canFinalize ? 'Done!' : 'Info required'}
                </span>
              </div>
              <Button
                onClick={onFinalizeRequest}
                disabled={!canFinalize}
                className={cn(
                  "px-8 h-12 rounded-none font-bold uppercase tracking-widest text-[10px] transition-all",
                  canFinalize
                    ? "bg-black text-white hover:bg-white hover:text-black border border-black shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    : "bg-slate-50 text-black/30 border border-slate-200 cursor-not-allowed"
                )}
              >
                Finalize CV
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CV PREVIEW */}
      <AnimatePresence>
        {showCVPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="hidden lg:flex flex-col flex-1 h-full bg-slate-50 relative overflow-hidden border-l border-slate-200"
          >
            {/* Minimal Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '32px 32px' }} />

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-12 overflow-y-auto scrollbar-hide">
              <div className="w-full max-w-[800px] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.1)] border border-white bg-white">
                {cvPreviewComponent}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatContainer;
