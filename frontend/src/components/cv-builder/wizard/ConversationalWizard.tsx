'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatContainer } from '@/components/cv-builder/chat/ChatContainer';
import { CVData, CVTemplate } from '@/types/cv';
import { FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Templates for preview
import { MinimalTemplate } from '@/components/cv-builder/templates/MinimalTemplate';
import { ProfessionalTemplate } from '@/components/cv-builder/templates/ProfessionalTemplate';
import { TechTemplate } from '@/components/cv-builder/templates/TechTemplate';
import { HarvardTemplate } from '@/components/cv-builder/templates/HarvardTemplate';
import { BianTemplate } from '@/components/cv-builder/templates/BianTemplate';

interface ConversationalWizardProps {
  onComplete: (data: CVData) => void;
  onBack: () => void;
  initialData?: Partial<CVData>;
  selectedTemplate?: CVTemplate;
  onTemplateChange?: (template: CVTemplate) => void;
  showCVPreview?: boolean;
}

export function ConversationalWizard({
  onComplete,
  initialData,
  selectedTemplate: externalTemplate,
  onTemplateChange: onExternalTemplateChange,
  showCVPreview = true,
}: ConversationalWizardProps) {
  const [cvData, setCvData] = useState<Partial<CVData>>(
    initialData || {
      personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
      experience: [], education: [], skills: [], projects: [], languages: [], certifications: [], interests: [],
    }
  );
  const [internalTemplate, setInternalTemplate] = useState<CVTemplate>('professional');
  const [showFinalize, setShowFinalize] = useState(false);

  const selectedTemplate = externalTemplate || internalTemplate;

  const handleCVDataUpdate = useCallback((newData: Partial<CVData>) => {
    setCvData((prev) => deepMerge(prev, newData));
  }, []);

  const canFinalize = (): boolean => {
    const hasPersonalInfo = cvData.personalInfo?.fullName && cvData.personalInfo?.email;
    return Boolean(hasPersonalInfo);
  };

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

  const renderCVPreview = () => {
    const data = cvData as CVData;
    switch (selectedTemplate) {
      case 'minimal': return <MinimalTemplate data={data} />;
      case 'tech': return <TechTemplate data={data} />;
      case 'harvard': return <HarvardTemplate data={data} />;
      case 'bian': return <BianTemplate data={data} />;
      case 'professional':
      default: return <ProfessionalTemplate data={data} />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      <div className="flex-1 min-h-0">
        <ChatContainer
          showPhaseIndicator={true}
          showCVPreview={showCVPreview}
          cvPreviewComponent={renderCVPreview()}
          onCVDataUpdate={handleCVDataUpdate}
          onFinalizeRequest={() => setShowFinalize(true)}
          canFinalize={canFinalize()}
          className="h-full border-none"
        />
      </div>

      {/* Modern Finalize Modal */}
      <AnimatePresence>
        {showFinalize && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-md w-full"
            >
              <Card className="p-10 shadow-2xl border border-border rounded-[2rem] bg-card relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10" />

                <div className="text-center space-y-8">
                  <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
                    <FileText className="w-12 h-12 text-primary-foreground" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight leading-none">¿Todo listo?</h2>
                    <p className="text-[15px] text-muted-foreground font-medium leading-relaxed">
                      Hemos procesado tu información con éxito. Pulsa finalizar para acceder al panel de edición detallado, o continúa conversando con el asistente.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      variant="ghost"
                      className="flex-1 h-14 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      onClick={() => setShowFinalize(false)}
                    >
                      Seguir Editando
                    </Button>
                    <Button
                      className="flex-1 h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
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

/**
 * Merge profundo de objetos con manejo inteligente de arrays
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (sourceValue === undefined || sourceValue === null) {
      continue;
    }

    if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        // Estrategia para arrays:
        // Si el array fuente tiene elementos con ID, intentamos mergear por ID.
        // Si no, o si es un array simple, concatenamos o reemplazamos según el caso.
        // Para simplificar y asegurar que la extracción se refleje: SIEMPRE mergeamos por ID si existe, 
        // y si no, agregamos los nuevos.
        
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
                // Si no tiene ID o es primitivo, lo agregamos si no existe (set behavior)
                if (!targetArray.includes(sourceItem)) {
                    targetArray.push(sourceItem);
                }
            }
        });
        
        result[key] = targetArray as T[Extract<keyof T, string>];

    } else if (
      typeof sourceValue === 'object' && 
      sourceValue !== null && 
      typeof targetValue === 'object' && 
      targetValue !== null && 
      !Array.isArray(targetValue)
    ) {
      // Objeto anidado
      result[key] = deepMerge(targetValue as Record<string, unknown>, sourceValue as Record<string, unknown>) as T[Extract<keyof T, string>];
    } else {
      // Valor primitivo o reemplazo directo
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }
  return result;
}

export default ConversationalWizard;
