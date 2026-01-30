'use client';

import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  SendHorizontal,
  RotateCcw,
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onQuickAction?: (action: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showQuickActions?: boolean;
}

export function ChatInput({
  onSendMessage,
  onQuickAction,
  isLoading = false,
  disabled = false,
  placeholder = 'Describe una sección o pide una mejora...',
  showQuickActions = true,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [message, onSendMessage, isLoading, disabled]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleQuickActionClick = (action: string, text: string) => {
    if (onQuickAction) {
      onQuickAction(action);
    }
    onSendMessage(text);
  };

  return (
    <div className="flex flex-col gap-4">
      {showQuickActions && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickActionClick('optimize', 'Optimiza mi perfil profesional')}
            className="rounded-none border-black hover:bg-black hover:text-white text-[10px] font-bold uppercase tracking-widest h-8 px-4 whitespace-nowrap"
          >
            Optimizar Perfil
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickActionClick('job_targeting', 'Adapta mi CV para esta vacante')}
            className="rounded-none border-black hover:bg-black hover:text-white text-[10px] font-bold uppercase tracking-widest h-8 px-4 whitespace-nowrap"
          >
            Adaptar a Vacante
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickActionClick('fix_grammar', 'Corrige la gramática de todo mi CV')}
            className="rounded-none border-black hover:bg-black hover:text-white text-[10px] font-bold uppercase tracking-widest h-8 px-4 whitespace-nowrap"
          >
            Corregir Gramática
          </Button>
        </div>
      )}

      <div className="relative border-2 border-black group focus-within:shadow-[8px_8px_0_0_#000] transition-all duration-300">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="min-h-[50px] max-h-[200px] w-full resize-none border-none bg-white py-4 pl-4 pr-16 text-sm font-medium focus-visible:ring-0 placeholder:text-black/30 placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px] rounded-none"
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-2">
          {message.length > 0 && (
            <button
              onClick={() => {
                setMessage('');
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
              }}
              className="p-2 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-black" />
            </button>
          )}

          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || isLoading || disabled}
            className="h-10 w-10 bg-black text-white hover:bg-white hover:text-black hover:border-black border border-transparent transition-all rounded-none"
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
