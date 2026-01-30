'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-center gap-1 px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm shadow-slate-50', className)}
      role="status"
    >
      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-duration:0.6s]" />
      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.1s]" />
      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]" />
    </div>
  );
}

export default TypingIndicator;
