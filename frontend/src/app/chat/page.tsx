'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationalWizard } from '@/components/cv-builder/wizard/ConversationalWizard';
import { ChatProvider } from '@/contexts/ChatContext';
import { CVData, CVTemplate } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { getDebugData } from '@/lib/debug-utils';
import { DEBUG_UI_ENABLED } from '@/lib/debug-flags';

// =============================================================================
// INITIAL STATE
// =============================================================================

const emptyCV: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  languages: [],
  certifications: [],
  interests: [],
  config: DEFAULT_CONFIG,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cvData, setCvData] = useState<CVData>(emptyCV);
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate>('professional');
  const [isComplete, setIsComplete] = useState(false);
  const [showCVPreview, setShowCVPreview] = useState(true);

  // Debug Logic
  useEffect(() => {
    const isDebug = searchParams.get('debug') === 'true';
    if (isDebug && DEBUG_UI_ENABLED) {
      console.log('🐞 Debug Mode Activated: Pre-loading Chat Context & CV Data');
      setCvData(getDebugData());
    }
  }, [searchParams]);

  /**
   * Handles CV data updates from the wizard
   */
  const handleCVDataUpdate = useCallback((newData: Partial<CVData>) => {
    setCvData((prev: CVData) => ({
      ...prev,
      ...newData,
    }));
  }, []);

  /**
   * Finalizes the conversational creation process
   */
  const handleWizardComplete = useCallback((data: CVData) => {
    const finalData = {
      ...data,
      config: {
        ...DEFAULT_CONFIG,
        ...data.config,
      },
    };

    localStorage.setItem('cv_data', JSON.stringify(finalData));
    localStorage.setItem('cv_template', selectedTemplate);

    setCvData(finalData);
    setIsComplete(true);

    setTimeout(() => {
      router.push('/');
    }, 1500);
  }, [router, selectedTemplate]);

  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <main className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* High-Contrast Unified Header */}
      <motion.header
        className="h-16 px-6 flex items-center justify-between bg-card border-b border-border z-50 shrink-0"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="group px-3 hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Salir
          </Button>

          <div className="h-6 w-[1px] bg-border hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-tight leading-none mb-1 text-foreground">Editor Inteligente</h1>
              <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-wider">Chat & Preview</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Preview Toggle */}
          <Button
            variant={showCVPreview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowCVPreview(!showCVPreview)}
            className={cn(
              "hidden md:flex gap-2 rounded-lg font-medium transition-all text-xs h-9 px-4 border border-transparent",
              showCVPreview
                ? "bg-secondary text-secondary-foreground border-border shadow-sm"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <FileText className="w-4 h-4" />
            {showCVPreview ? "Ocultar Vista" : "Mostrar Vista"}
          </Button>

          <div className="h-8 w-[1px] bg-border" />

          {/* Template Selection */}
          <div className="flex items-center gap-3">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as CVTemplate)}
              className="text-[10px] font-bold bg-background hover:bg-muted text-foreground border border-input rounded-lg px-4 py-2 outline-none focus:ring-2 ring-ring transition-all cursor-pointer min-w-[150px] appearance-none uppercase tracking-wider shadow-sm"
              style={{ textAlignLast: 'center' }}
            >
              <option className="bg-popover text-popover-foreground" value="professional">PROFESIONAL</option>
              <option className="bg-popover text-popover-foreground" value="minimal">MINIMALISTA</option>
              <option className="bg-popover text-popover-foreground" value="creative">CREATIVO</option>
              <option className="bg-popover text-popover-foreground" value="tech">TECH STACK</option>
              <option className="bg-popover text-popover-foreground" value="harvard">HARVARD</option>
              <option className="bg-popover text-popover-foreground" value="bian">MODERN BIAN</option>
              <option className="bg-popover text-popover-foreground" value="pure">SWISS / PURE</option>
            </select>
          </div>
        </div>
      </motion.header>

      {/* Main Experience Container */}
      <div className="flex-1 overflow-hidden relative">
        <ChatProvider
          initialCVData={cvData}
          onCVDataUpdate={handleCVDataUpdate}
        >
          <ConversationalWizard
            initialData={cvData}
            onComplete={handleWizardComplete}
            onBack={handleBack}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            showCVPreview={showCVPreview}
          />
        </ChatProvider>
      </div>

      {/* Completion Experience */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center space-y-6 max-w-sm px-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
            >
              <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 rotation-slow">
                <Sparkles className="w-12 h-12 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">¡CV Perfeccionado!</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Estamos preparando tu entorno de edición final. Un segundo...
                </p>
              </div>
              <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
