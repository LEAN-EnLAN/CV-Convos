'use client';

import React from 'react';
import { CVData } from '@/types/cv';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, Brain, Briefcase, GraduationCap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpdateApprovalModalProps {
  pendingData: Partial<CVData>;
  onAccept: () => void;
  onDeny: () => void;
}

export function UpdateApprovalModal({ pendingData, onAccept, onDeny }: UpdateApprovalModalProps) {
  const changes = [];
  if (pendingData.personalInfo && Object.keys(pendingData.personalInfo).length > 0) {
    changes.push({ label: "Identidad", icon: <User className="w-3 h-3" /> });
  }
  if (pendingData.personalInfo?.summary) {
    changes.push({ label: "Narrativa", icon: <Sparkles className="w-3 h-3" /> });
  }
  if (pendingData.experience && pendingData.experience.length > 0) {
    changes.push({ label: "Trayectoria", icon: <Briefcase className="w-3 h-3" /> });
  }
  if (pendingData.education && pendingData.education.length > 0) {
    changes.push({ label: "Academia", icon: <GraduationCap className="w-3 h-3" /> });
  }
  if (pendingData.skills && pendingData.skills.length > 0) {
    changes.push({ label: "Habilidades", icon: <Brain className="w-3 h-3" /> });
  }

  if (changes.length === 0) return null;

  return (
    <div className="fixed bottom-10 right-10 z-[100] w-full max-w-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-border/50 overflow-hidden backdrop-blur-xl bg-card/90"
      >
        {/* Progress bar decoration */}
        <div className="h-1.5 w-full bg-primary/10 relative overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8 }}
            className="h-full bg-primary"
          />
        </div>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground">Optimización Lista</h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">El arquitecto propone revisiones</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            {changes.map((c, i) => (
              <span key={i} className="flex items-center gap-2 px-4 py-2 bg-muted/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground rounded-xl border border-border/50">
                {c.icon}
                {c.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={onDeny}
              variant="ghost"
              className="h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
            >
              <X className="w-4 h-4 mr-2" />
              Ignorar
            </Button>
            <Button 
              onClick={onAccept}
              className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
            >
              <Check className="w-4 h-4 mr-2" />
              Aplicar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
