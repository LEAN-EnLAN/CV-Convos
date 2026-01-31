'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Check,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { DataExtraction } from '@/types/chat';

interface ExtractionPreviewProps {
  extraction: DataExtraction;
  onApply: (extraction: DataExtraction) => void;
  onDismiss: () => void;
}

interface FieldPreviewProps {
  label: string;
  value: string | number | boolean | null | undefined;
  status: 'pending' | 'accepted' | 'rejected';
  onAccept: () => void;
  onReject: () => void;
}

function FieldPreview({ label, value, status, onAccept, onReject }: FieldPreviewProps) {
  if (value === undefined || value === null) return null;

  return (
    <div className={cn(
      "group flex items-center justify-between p-3 border rounded-xl transition-all duration-300",
      status === 'accepted' ? 'bg-primary/5 border-primary/20' :
        status === 'rejected' ? 'bg-destructive/5 border-destructive/20 opacity-60' :
          'bg-background border-border hover:border-primary/30'
    )}>
      <div className="flex flex-col gap-1 min-w-0 flex-1 pr-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={cn(
          "text-sm font-medium truncate",
          status === 'rejected' ? 'line-through text-muted-foreground' : 'text-foreground'
        )}>
          {String(value)}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {status !== 'accepted' && (
          <button
            onClick={onAccept}
            className="p-1.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        {status !== 'rejected' && (
          <button
            onClick={onReject}
            className="p-1.5 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors border border-border"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {status === 'accepted' && <CheckCircle2 className="w-4 h-4 text-primary mb-auto mt-1" />}
      {status === 'rejected' && <AlertCircle className="w-4 h-4 text-destructive mb-auto mt-1" />}
    </div>
  );
}

export function ExtractionPreview({ extraction, onApply, onDismiss }: ExtractionPreviewProps) {
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({});

  const handleFieldStatus = (id: string, status: 'accepted' | 'rejected') => {
    setFieldStatuses(prev => ({ ...prev, [id]: status }));
  };

  const hasMeaningfulData = useMemo(() => {
    const { extracted } = extraction;
    return (extracted.personalInfo && Object.keys(extracted.personalInfo).length > 0) ||
      (extracted.experience && extracted.experience.length > 0) ||
      (extracted.education && extracted.education.length > 0) ||
      (extracted.skills && extracted.skills.length > 0);
  }, [extraction]);

  if (!hasMeaningfulData) return null;

  const getFieldLabel = (section: string, key: string) => {
    const labels: Record<string, string> = {
      'p-fullName': 'Nombre', 'p-email': 'Email', 'p-phone': 'Teléfono',
      'e-company': 'Empresa', 'e-position': 'Puesto', 'e-startDate': 'Inicio',
      'ed-institution': 'Institución', 'ed-degree': 'Título', 's-name': 'Habilidad'
    };
    return labels[`${section}-${key}`] || key;
  };

  const personalEntries = Object.entries(extraction.extracted.personalInfo || {});
  const experienceData = extraction.extracted.experience || [];
  const educationData = extraction.extracted.education || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border flex flex-col max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">Datos Detectados</h3>
          </div>
          <button 
            onClick={onDismiss} 
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {personalEntries.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full" /> Información Personal
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {personalEntries.map(([k, v]) => (
                    <FieldPreview
                      key={`p-${k}`}
                      label={getFieldLabel('p', k)}
                      value={v}
                      status={fieldStatuses[`p-${k}`] || 'pending'}
                      onAccept={() => handleFieldStatus(`p-${k}`, 'accepted')}
                      onReject={() => handleFieldStatus(`p-${k}`, 'rejected')}
                    />
                  ))}
                </div>
              </div>
            )}

            {experienceData.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full" /> Experiencia
                </h4>
                {experienceData.map((exp, i) => (
                  <div key={`exp-${i}`} className="space-y-2 mb-4 border-l-2 border-border pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-foreground">{(exp as any).company || 'Empresa'}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(exp).map(([k, v]) => (
                        <FieldPreview
                          key={`e-${i}-${k}`}
                          label={getFieldLabel('e', k)}
                          value={v as string | number | boolean | null | undefined}
                          status={fieldStatuses[`e-${i}-${k}`] || 'pending'}
                          onAccept={() => handleFieldStatus(`e-${i}-${k}`, 'accepted')}
                          onReject={() => handleFieldStatus(`e-${i}-${k}`, 'rejected')}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {educationData.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full" /> Formación
                </h4>
                {educationData.map((edu, i) => (
                  <div key={`edu-${i}`} className="space-y-2 mb-4 border-l-2 border-border pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-foreground">{(edu as any).institution || 'Institución'}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(edu).map(([k, v]) => (
                        <FieldPreview
                          key={`ed-${i}-${k}`}
                          label={getFieldLabel('ed', k)}
                          value={v as string | number | boolean | null | undefined}
                          status={fieldStatuses[`ed-${i}-${k}`] || 'pending'}
                          onAccept={() => handleFieldStatus(`ed-${i}-${k}`, 'accepted')}
                          onReject={() => handleFieldStatus(`ed-${i}-${k}`, 'rejected')}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-border bg-card flex items-center justify-between shrink-0 gap-4">
          <Button
            variant="outline"
            onClick={onDismiss}
            className="flex-1 rounded-xl h-11"
          >
            Descartar
          </Button>
          <Button
            onClick={() => onApply(extraction)}
            className="flex-1 rounded-xl h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
          >
            Aplicar Todo
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ExtractionPreview;
