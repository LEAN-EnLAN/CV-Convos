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
      "group flex items-center justify-between p-3 border transition-all duration-300",
      status === 'accepted' ? 'bg-black/5 border-black/10' :
        status === 'rejected' ? 'bg-red-50/50 border-red-100 opacity-50' :
          'bg-white border-slate-100 hover:border-black'
    )}>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-4">
        <span className="text-[9px] font-bold uppercase tracking-widest text-black">{label}</span>
        <span className={cn(
          "text-xs font-semibold truncate",
          status === 'rejected' ? 'line-through' : 'text-black'
        )}>
          {String(value)}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {status !== 'accepted' && (
          <button
            onClick={onAccept}
            className="p-1.5 hover:bg-black hover:text-white transition-colors border border-black"
          >
            <Check className="w-3 h-3" />
          </button>
        )}
        {status !== 'rejected' && (
          <button
            onClick={onReject}
            className="p-1.5 hover:bg-red-600 hover:text-white transition-colors border-red-100"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {status === 'accepted' && <CheckCircle2 className="w-3 h-3 text-black mb-auto mt-1" />}
      {status === 'rejected' && <AlertCircle className="w-3 h-3 text-red-500 mb-auto mt-1" />}
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
    <div className="bg-white border-2 border-black flex flex-col max-h-[400px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-black bg-black text-white shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles className="w-3.5 h-3.5" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest">Magic Extraction</h3>
        </div>
        <button onClick={onDismiss} className="hover:rotate-90 transition-transform duration-300 p-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-8">
          {personalEntries.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[9px] font-bold text-black uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-4 h-px bg-black opacity-20" /> Información Personal
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
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
              <h4 className="text-[9px] font-bold text-black uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-4 h-px bg-black opacity-20" /> Experiencia
              </h4>
              {experienceData.map((exp, i) => (
                <div key={`exp-${i}`} className="space-y-2 mb-4 border-l-2 border-slate-100 pl-3">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <ArrowRight className="w-3 h-3 text-black opacity-60" />
                    <span className="text-[10px] font-bold text-black uppercase tracking-wider italic">{(exp as any).company || 'Empresa'}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
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
              <h4 className="text-[9px] font-bold text-black uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-4 h-px bg-black opacity-20" /> Formación
              </h4>
              {educationData.map((edu, i) => (
                <div key={`edu-${i}`} className="space-y-2 mb-4 border-l-2 border-slate-100 pl-3">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <ArrowRight className="w-3 h-3 text-black opacity-60" />
                    <span className="text-[10px] font-bold text-black uppercase tracking-wider italic">{(edu as any).institution || 'Institución'}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
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

      <div className="p-4 border-t border-black bg-slate-50 flex items-center justify-between shrink-0">
        <Button
          variant="ghost"
          onClick={onDismiss}
          className="text-[9px] font-bold uppercase tracking-widest rounded-none border border-slate-200 hover:bg-white px-4 h-9"
        >
          Descartar
        </Button>
        <Button
          onClick={() => onApply(extraction)}
          className="bg-black text-white hover:bg-white hover:text-black border border-black text-[9px] font-bold uppercase tracking-widest rounded-none shadow-[0_4px_12px_rgba(0,0,0,0.1)] px-6 h-9"
        >
          Aplicar Cambios
        </Button>
      </div>
    </div>
  );
}

export default ExtractionPreview;
