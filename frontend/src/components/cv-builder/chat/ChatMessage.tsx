'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  User,
} from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  className?: string;
}

export function ChatMessage({ message, isStreaming, className }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  const formatMessageContent = (content: string) => {
    if (!content) return null;

    // Headings: ## Title
    content = content.replace(/^## (.*$)/gim, '<h3 class="text-sm font-bold mt-4 mb-2 text-foreground">$1</h3>');

    // Bold: **text**
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');

    // Lists: - item
    content = content.replace(/^- (.*$)/gim, '<div class="flex items-start gap-2 mb-1.5"><span class="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0 opacity-60"></span><span class="text-sm leading-relaxed opacity-90">$1</span></div>');

    return content;
  };

  return (
    <div className={cn(
      'flex w-full gap-4 group',
      isAssistant ? 'justify-start' : 'justify-end flex-row-reverse',
      className
    )}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 shrink-0 flex items-center justify-center rounded-xl border transition-all duration-300 shadow-sm',
        isAssistant
          ? 'bg-background border-border text-primary'
          : 'bg-primary/10 border-transparent text-primary'
      )}>
        {isAssistant ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      <div className={cn(
        'flex flex-col max-w-[85%] lg:max-w-[80%]',
        isAssistant ? 'items-start' : 'items-end'
      )}>
        {/* Message Bubble */}
        <div className={cn(
          'px-5 py-3.5 transition-all duration-300 shadow-sm',
          isAssistant
            ? 'bg-card border border-border text-foreground rounded-2xl rounded-tl-sm'
            : 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-md'
        )}>
          <div
            className={cn(
              "text-sm leading-relaxed font-normal space-y-2",
              isAssistant ? "prose-neutral" : "text-primary-foreground/90"
            )}
            dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) || '' }}
          />

          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-1 align-middle" />
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-1">
          <span className="text-[10px] font-medium text-muted-foreground">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
