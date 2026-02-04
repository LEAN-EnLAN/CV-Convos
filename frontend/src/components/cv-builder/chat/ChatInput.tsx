'use client';

import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  SendHorizontal,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onQuickAction?: (action: string) => boolean | void;
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
    const isHandled = onQuickAction?.(action);
    if (!isHandled) {
      onSendMessage(text);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {showQuickActions && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickActionClick('optimize', 'Optimiza mi perfil profesional')}
            className="rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-xs font-semibold h-7 px-4 whitespace-nowrap border border-border hover:border-primary/20 transition-all shadow-sm"
          >
            <Sparkles className="w-3 h-3 mr-2" />
            Optimizar Perfil
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickActionClick('job_targeting', 'Adapta mi CV para esta vacante')}
            className="rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-xs font-semibold h-7 px-4 whitespace-nowrap border border-border hover:border-primary/20 transition-all shadow-sm"
          >
            Adaptar a Vacante
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickActionClick('fix_grammar', 'Corrige la gramática de todo mi CV')}
            className="rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-xs font-semibold h-7 px-4 whitespace-nowrap border border-border hover:border-primary/20 transition-all shadow-sm"
          >
            Corregir Gramática
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickActionClick('template_terminal', 'Cambia el estilo de mi CV a un diseño Terminal/Monoespaciado')}
            className="rounded-full bg-muted hover:bg-slate-900 hover:text-white text-xs font-semibold h-7 px-4 whitespace-nowrap border border-border transition-all shadow-sm"
          >
            Estilo Terminal
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickActionClick('template_creative', 'Cambia el estilo de mi CV a un diseño Creativo y Moderno')}
            className="rounded-full bg-muted hover:bg-emerald-500 hover:text-white text-xs font-semibold h-7 px-4 whitespace-nowrap border border-border transition-all shadow-sm"
          >
            Estilo Creativo
          </Button>
        </div>
      )}

      <div className="relative border border-input bg-background rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary transition-all duration-300">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          aria-label="Mensaje para el asistente"
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="min-h-[50px] max-h-[200px] w-full resize-none border-none bg-transparent py-4 pl-4 pr-24 text-sm focus-visible:ring-0 placeholder:text-foreground/40 rounded-2xl"
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          {message.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setMessage('');
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
              }}
              aria-label="Limpiar mensaje"
              className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}

          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || isLoading || disabled}
            aria-label="Enviar mensaje"
            className="h-9 w-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
