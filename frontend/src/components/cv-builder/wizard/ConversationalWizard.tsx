'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatContainer } from '@/components/cv-builder/chat/ChatContainer';
import { CVData, CVTemplate } from '@/types/cv';
import { FileText, ZoomIn, ZoomOut, Maximize2, Layout, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UpdateApprovalModal } from './UpdateApprovalModal';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { getTemplateFontPreset } from '@/lib/cv-templates/template-fonts';

// Templates for preview
import { ProfessionalTemplate } from '@/components/cv-builder/templates/ProfessionalTemplate';
import { HarvardTemplate } from '@/components/cv-builder/templates/HarvardTemplate';
import { CreativeTemplate } from '@/components/cv-builder/templates/CreativeTemplate';
import { PureTemplate } from '@/components/cv-builder/templates/PureTemplate';
import { TerminalTemplate } from '@/components/cv-builder/templates/TerminalTemplate';
import { CareTemplate } from '@/components/cv-builder/templates/CareTemplate';
import { CapitalTemplate } from '@/components/cv-builder/templates/CapitalTemplate';
import { ScholarTemplate } from '@/components/cv-builder/templates/ScholarTemplate';

interface ConversationalWizardProps {
  onComplete: (data: CVData) => void;
  onBack: () => void;
  initialData?: Partial<CVData>;
  selectedTemplate?: CVTemplate;
  onTemplateChange?: (template: CVTemplate) => void;
  showCVPreview?: boolean;
}

/**
 * Merge profundo de objetos con manejo inteligente de arrays
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = (source as any)[key];
    const targetValue = (result as any)[key];

    if (sourceValue === undefined || sourceValue === null || sourceValue === '') {
      continue;
    }

    if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
      const sourceArray = sourceValue as Array<any>;
      const targetArray = [...targetValue] as Array<any>;

      sourceArray.forEach((sourceItem) => {
        if (sourceItem && typeof sourceItem === 'object' && 'id' in sourceItem) {
          const existingIndex = targetArray.findIndex(item => item.id === sourceItem.id);
          if (existingIndex >= 0) {
            targetArray[existingIndex] = deepMerge(targetArray[existingIndex], sourceItem);
          } else {
            targetArray.push(sourceItem);
          }
        } else {
          if (!targetArray.includes(sourceItem)) {
            targetArray.push(sourceItem);
          }
        }
      });
      (result as any)[key] = targetArray;

    } else if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      (result as any)[key] = deepMerge(targetValue, sourceValue);
    } else {
      (result as any)[key] = sourceValue;
    }
  }
  return result;
}

export function ConversationalWizard({
  onComplete,
  initialData,
  selectedTemplate: externalTemplate,
  onTemplateChange: onExternalTemplateChange,
}: ConversationalWizardProps) {
  const [cvData, setCvData] = useState<Partial<CVData>>(
    initialData || {
      personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
      experience: [], education: [], skills: [], projects: [], languages: [], certifications: [], interests: [],
    }
  );
  const [internalTemplate, setInternalTemplate] = useState<CVTemplate>('professional');
  const [showFinalize, setShowFinalize] = useState(false);
  const [zoom, setZoom] = useState(0.7);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<Partial<CVData> | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewPages, setPreviewPages] = useState(1);
  const userPreviewOverrideRef = useRef(false);
  const previewContentRef = useRef<HTMLDivElement>(null);

  const selectedTemplate = externalTemplate || internalTemplate;

  const hasMeaningfulData = useMemo(() => {
    const personal = cvData.personalInfo || {};
    return Boolean(
      personal.fullName ||
      personal.email ||
      personal.phone ||
      personal.location ||
      personal.summary ||
      personal.role ||
      (cvData.experience && cvData.experience.length > 0) ||
      (cvData.education && cvData.education.length > 0) ||
      (cvData.skills && cvData.skills.length > 0) ||
      (cvData.projects && cvData.projects.length > 0) ||
      (cvData.languages && cvData.languages.length > 0) ||
      (cvData.certifications && cvData.certifications.length > 0) ||
      (cvData.interests && cvData.interests.length > 0)
    );
  }, [cvData]);

  // ═══════════════════════════════════════════════════════════════
  // SYNC: Keep internal cvData in sync with parent initialData
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      console.log('%c[WIZARD-SYNC]', 'color: #3b82f6; font-weight: bold', 'Syncing cvData with initialData:', initialData);
      setCvData(prev => deepMerge(prev, initialData));
    }
  }, [initialData]);

  useEffect(() => {
    if (userPreviewOverrideRef.current) return;
    setShowPreview(hasMeaningfulData);
  }, [hasMeaningfulData]);

  useEffect(() => {
    const updatePages = () => {
      if (!previewContentRef.current) return;
      const pageHeight = 1122;
      const height = previewContentRef.current.offsetHeight;
      setPreviewPages(Math.ceil(height / pageHeight));
    };

    const timer = setTimeout(updatePages, 300);
    return () => clearTimeout(timer);
  }, [cvData, selectedTemplate, showPreview]);

  // ═══════════════════════════════════════════════════════════════
  // HANDLER: Process CV data updates from ChatContext
  // ═══════════════════════════════════════════════════════════════
  const handleCVDataUpdate = useCallback((newData: Partial<CVData>) => {
    console.log('%c[WIZARD-UPDATE]', 'color: #8b5cf6; font-weight: bold', 'Received update:', newData);

    // Visual config updates (template, colors, fonts) → apply immediately
    if (newData.config && Object.keys(newData).length === 1) {
      console.log('%c[WIZARD-UPDATE]', 'color: #22c55e', 'Applying visual config directly');
      setCvData((prev) => deepMerge(prev, newData));
      const configWithTemplate = newData.config as { templateId?: string } & typeof newData.config;
      if (configWithTemplate.templateId) {
        setInternalTemplate(configWithTemplate.templateId as CVTemplate);
      }
      return;
    }

    // Content updates → queue for user approval (shows modal)
    console.log('%c[WIZARD-UPDATE]', 'color: #f59e0b', 'Queuing content update for approval');
    setPendingUpdate(newData);
  }, []);

  const applyPendingUpdate = useCallback(() => {
    if (!pendingUpdate) return;
    setIsUpdating(true);
    setCvData((prev) => deepMerge(prev, pendingUpdate));
    setPendingUpdate(null);
    setTimeout(() => setIsUpdating(false), 800);
  }, [pendingUpdate]);

  const handleFinalize = useCallback(() => {
    const finalData: CVData = {
      personalInfo: cvData.personalInfo || { fullName: '', email: '', phone: '', location: '', summary: '' },
      experience: cvData.experience || [],
      education: cvData.education || [],
      skills: cvData.skills || [],
      projects: cvData.projects || [],
      languages: cvData.languages || [],
      certifications: cvData.certifications || [],
      interests: cvData.interests || [],
      config: cvData.config,
    };
    onComplete(finalData);
  }, [cvData, onComplete]);

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 1.5));
  };

  const renderCVPreview = (scaleOverride?: number) => {
    const scale = scaleOverride ?? zoom;
    const data = cvData as CVData;
    const baseConfig = data.config || DEFAULT_CONFIG;
    const shouldUsePresetFonts =
      baseConfig.fonts?.heading === DEFAULT_CONFIG.fonts.heading &&
      baseConfig.fonts?.body === DEFAULT_CONFIG.fonts.body;
    const resolvedConfig = {
      ...baseConfig,
      fonts: shouldUsePresetFonts
        ? { ...getTemplateFontPreset(selectedTemplate) }
        : baseConfig.fonts
    };
    const resolvedData = { ...data, config: resolvedConfig };
    let template;
    switch (selectedTemplate) {
      case 'professional': template = <ProfessionalTemplate data={resolvedData} />; break;
      case 'harvard': template = <HarvardTemplate data={resolvedData} />; break;
      case 'creative': template = <CreativeTemplate data={resolvedData} />; break;
      case 'pure': template = <PureTemplate data={resolvedData} />; break;
      case 'terminal': template = <TerminalTemplate data={resolvedData} />; break;
      case 'care': template = <CareTemplate data={resolvedData} />; break;
      case 'capital': template = <CapitalTemplate data={resolvedData} />; break;
      case 'scholar': template = <ScholarTemplate data={resolvedData} />; break;
      default: template = <ProfessionalTemplate data={resolvedData} />;
    }

    return (
      <div
        className={cn(
          "transition-all duration-700",
          isUpdating ? "scale-[1.02] ring-8 ring-primary/5" : ""
        )}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        <div className="relative" style={{ width: '794px' }}>
          <div className="absolute inset-0 pointer-events-none no-print">
            {previewPages > 1 && <div className="cv-page-break-overlay" />}
            {Array.from({ length: previewPages - 1 }).map((_, i) => (
              <div
                key={i}
                className="cv-page-break-line"
                style={{ top: `${(i + 1) * 1122}px` }}
              />
            ))}
          </div>
          <div
            ref={previewContentRef}
            className="shadow-[0_60px_120px_-20px_rgba(0,0,0,0.2)] bg-white rounded-sm"
            style={{ minHeight: '1122px' }}
          >
            {template}
          </div>
        </div>
      </div>
    );
  };

  const emptyPreview = (
    <div className="w-full min-h-[500px] flex items-center justify-center bg-card/80 text-center px-6">
      <div className="space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">La vista previa se activará cuando tengamos datos.</p>
        <p className="text-xs text-muted-foreground">Completa tu información en el chat para ver el CV.</p>
      </div>
    </div>
  );
  const desktopPreviewComponent = hasMeaningfulData ? renderCVPreview() : emptyPreview;
  const mobilePreviewComponent = hasMeaningfulData ? renderCVPreview(1) : emptyPreview;

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#F0F2F5] overflow-hidden font-sans">

      {/* SIDEBAR - 420px Fixed */}
      <aside className="w-full lg:w-[420px] shrink-0 flex flex-col bg-background border-r border-border z-50 shadow-2xl relative">
        <ChatContainer
          showPhaseIndicator={false}
          showCVPreview={false}
          cvPreviewComponent={mobilePreviewComponent}
          onCVDataUpdate={handleCVDataUpdate}
          onFinalizeRequest={() => setShowFinalize(true)}
          canFinalize={true}
          className="h-full border-none"
        />
      </aside>

      {/* DESK VIEW - Flexible */}
      <main className="hidden lg:block flex-1 relative overflow-hidden bg-muted/30">

        {/* AVANT-GARDE HEADER CONTROLS */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40 bg-background/80 backdrop-blur-xl px-6 py-3 rounded-[2rem] shadow-xl border border-border/50">
          <div className="flex items-center gap-2 pr-4 border-r border-border">
            <Layout className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{selectedTemplate}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => adjustZoom(-0.1)} className="rounded-full h-8 w-8 hover:bg-muted">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-[10px] font-black text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => adjustZoom(0.1)} className="rounded-full h-8 w-8 hover:bg-muted">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setZoom(0.7)} className="rounded-full h-8 w-8 hover:bg-muted ml-1">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="pl-4 border-l border-border">
            <Button
              onClick={() => {
                userPreviewOverrideRef.current = true;
                setShowPreview(!showPreview);
              }}
              disabled={!hasMeaningfulData}
              variant="ghost"
              className="h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showPreview ? 'Ocultar' : 'Visualizar'}
            </Button>
          </div>
        </div>

        {/* SCROLLABLE AREA */}
        <ScrollArea className="h-full w-full">
          <div className="flex justify-center p-20 min-h-full min-w-[900px]">
            <AnimatePresence>
              {showPreview && hasMeaningfulData && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.9 }}
                  transition={{ type: "spring", damping: 30, stiffness: 200 }}
                >
                  {desktopPreviewComponent}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* EMPTY STATE */}
        {(!showPreview || !hasMeaningfulData) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">The Portfolio</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] mt-2">Studio Architect</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {pendingUpdate && (
          <UpdateApprovalModal
            pendingData={pendingUpdate}
            onAccept={applyPendingUpdate}
            onDeny={() => setPendingUpdate(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFinalize && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-w-md w-full"
            >
              <Card className="p-10 shadow-2xl border border-border rounded-[3rem] bg-card relative overflow-hidden">
                <div className="text-center space-y-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-primary flex items-center justify-center mx-auto shadow-xl shadow-primary/20 rotate-3">
                    <Check className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-foreground tracking-tighter leading-none uppercase italic">¿Finalizar Narrativa?</h2>
                    <p className="text-[13px] text-muted-foreground font-medium leading-relaxed px-4">
                      Tu trayectoria ha sido arquitecturada con éxito. ¿Deseas pasar al panel de control final?
                    </p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="ghost"
                      className="flex-1 h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                      onClick={() => setShowFinalize(false)}
                    >
                      Seguir Puliendo
                    </Button>
                    <Button
                      className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20"
                      onClick={handleFinalize}
                    >
                      Finalizar CV
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ConversationalWizard;
