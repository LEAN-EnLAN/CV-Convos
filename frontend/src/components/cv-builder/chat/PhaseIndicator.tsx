'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ConversationPhase, PHASES } from '@/types/chat';

interface PhaseIndicatorProps {
  currentPhase: ConversationPhase;
  className?: string;
  compact?: boolean;
}

const MAIN_PHASES: ConversationPhase[] = [
  'welcome',
  'personal_info',
  'experience',
  'education',
  'skills',
  'summary',
  'review',
];

export function PhaseIndicator({
  currentPhase,
  className,
  compact = false,
}: PhaseIndicatorProps) {
  const currentPhaseInfo = PHASES[currentPhase];
  const currentMainIndex = MAIN_PHASES.indexOf(currentPhase);
  const progress = Math.max(
    5,
    Math.min(100, ((currentMainIndex + 1) / MAIN_PHASES.length) * 100)
  );

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Phase</span>
            <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">{currentPhaseInfo.label}</span>
          </div>
          <span className="text-[10px] font-bold text-foreground tracking-widest">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-gradient-to-r from-primary to-accent relative"
          >
            <div className="absolute top-0 right-0 bottom-0 w-[4px] bg-white/50 blur-[2px]" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground tracking-tight">{currentPhaseInfo.label}</h3>
          <p className="text-sm text-muted-foreground font-medium">
            {currentPhaseInfo.description}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-foreground">{Math.round(progress)}%</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">completado</span>
        </div>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary"
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

export default PhaseIndicator;
