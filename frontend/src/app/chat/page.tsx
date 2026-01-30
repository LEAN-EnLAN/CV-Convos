'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationalWizard } from '@/components/cv-builder/wizard/ConversationalWizard';
import { ChatProvider } from '@/contexts/ChatContext';
import { CVData, CVTemplate } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { cn } from '@/lib/utils';

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
  const [cvData, setCvData] = useState<CVData>(emptyCV);
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate>('professional');
  const [isComplete, setIsComplete] = useState(false);
  const [showCVPreview, setShowCVPreview] = useState(true);

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
    <main className="h-screen w-full flex flex-col bg-[#F3F4F6] overflow-hidden">
      {/* High-Contrast Unified Header */}
      <motion.header
        className="h-16 px-6 flex items-center justify-between bg-slate-900 text-white z-50 shrink-0 shadow-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="group px-3 hover:bg-white/10 text-white/70 hover:text-white font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Salir
          </Button>

          <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-tight leading-none mb-1 text-white">Editor Inteligente</h1>
              <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">Chat & Preview</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Preview Toggle */}
          <Button
            variant={showCVPreview ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowCVPreview(!showCVPreview)}
            className={cn(
              "hidden md:flex gap-2 rounded-xl font-black transition-all text-[10px] uppercase tracking-widest h-9 px-4",
              showCVPreview
                ? "bg-white text-slate-900 border-none shadow-xl"
                : "bg-transparent text-white border-white/30 hover:bg-white/10"
            )}
          >
            <FileText className="w-4 h-4" />
            {showCVPreview ? "Ocultar Vista" : "Mostrar Vista"}
          </Button>

          <div className="h-8 w-[1px] bg-white/10" />

          {/* Template Selection */}
          <div className="flex items-center gap-3">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as CVTemplate)}
              className="text-[10px] font-black bg-white/5 hover:bg-white/10 text-white border-2 border-white/20 rounded-xl px-4 py-2 outline-none focus:ring-2 ring-white/40 transition-all cursor-pointer min-w-[150px] appearance-none uppercase tracking-widest"
              style={{ textAlignLast: 'center' }}
            >
              <option className="bg-slate-900" value="professional">PROFESIONAL</option>
              <option className="bg-slate-900" value="minimal">MINIMALISTA</option>
              <option className="bg-slate-900" value="creative">CREATIVO</option>
              <option className="bg-slate-900" value="tech">TECH STACK</option>
              <option className="bg-slate-900" value="harvard">HARVARD</option>
              <option className="bg-slate-900" value="bian">MODERN BIAN</option>
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md"
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
              <div className="w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center mx-auto shadow-2xl shadow-slate-400 rotation-slow">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">¡CV Perfeccionado!</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Estamos preparando tu entorno de edición final. Un segundo...
                </p>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-slate-900"
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
