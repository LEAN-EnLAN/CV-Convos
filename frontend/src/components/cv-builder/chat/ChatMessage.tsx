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
    content = content.replace(/^## (.*$)/gim, '<h3 class="text-xs font-bold uppercase tracking-widest mt-6 mb-3 text-black">$1</h3>');

    // Bold: **text**
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-black">$1</strong>');

    // Lists: - item
    content = content.replace(/^- (.*$)/gim, '<div class="flex items-start gap-3 mb-2"><span class="w-1.5 h-1.5 bg-black mt-1.5 shrink-0"></span><span class="text-xs leading-relaxed">$1</span></div>');

    return content;
  };

  return (
    <div className={cn(
      'flex w-full gap-5 group',
      isAssistant ? 'justify-start' : 'justify-end flex-row-reverse',
      className
    )}>
      {/* Avatar - Sharp & High Contrast */}
      <div className={cn(
        'w-10 h-10 shrink-0 flex items-center justify-center border-2 border-black transition-all duration-300',
        isAssistant
          ? 'bg-black text-white'
          : 'bg-white text-black group-hover:bg-black group-hover:text-white'
      )}>
        {isAssistant ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      <div className={cn(
        'flex flex-col max-w-[85%] lg:max-w-[75%]',
        isAssistant ? 'items-start' : 'items-end'
      )}>
        {/* Message Bubble - Sharp Corners */}
        <div className={cn(
          'px-6 py-4 border-2 transition-all duration-300',
          isAssistant
            ? 'bg-white border-black/5 text-black'
            : 'bg-black border-black text-white shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]'
        )}>
          <div
            className="text-xs leading-relaxed font-medium space-y-2 prose-minimal"
            dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) || '' }}
          />

          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-black animate-pulse ml-1 align-middle" />
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
