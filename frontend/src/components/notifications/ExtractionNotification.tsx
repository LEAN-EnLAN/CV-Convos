'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { NotificationItem as NotificationItemType } from '@/types/notifications';
import { useChatActions } from '@/contexts/ChatContext';

interface ExtractionNotificationProps {
  notification: NotificationItemType;
}

interface FieldPreviewProps {
  label: string;
  value: string | number | boolean | null | undefined;
  status: 'pending' | 'accepted' | 'rejected';
  onAccept: () => void;
  onReject: () => void;
}

function FieldPreview({ label, value, status, onAccept, onReject }: FieldPreviewProps) {
  if (value === undefined || value === null || value === '') return null;

  return (
    <div className={cn(
      "group flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-3 border rounded-xl transition-all duration-300",
      status === 'accepted' ? 'bg-primary/5 border-primary/20' :
        status === 'rejected' ? 'bg-destructive/5 border-destructive/20 opacity-60' :
          'bg-background border-border hover:border-primary/30'
    )}>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={cn(
          "text-sm font-medium break-words line-clamp-2",
          status === 'rejected' ? 'line-through text-muted-foreground' : 'text-foreground'
        )}>
          {String(value)}
        </span>
      </div>

      <div className="flex w-full sm:w-auto items-center gap-2 justify-end shrink-0">
        {status !== 'accepted' && (
          <button
            onClick={onAccept}
            type="button"
            className="flex-1 sm:flex-none h-10 px-3 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors border border-border text-[11px] font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
            aria-label="Aceptar"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="sm:hidden">Aceptar</span>
          </button>
        )}
        {status !== 'rejected' && (
          <button
            onClick={onReject}
            type="button"
            className="flex-1 sm:flex-none h-10 px-3 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors border border-border text-[11px] font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
            aria-label="Rechazar"
          >
            <X className="w-3.5 h-3.5" />
            <span className="sm:hidden">Rechazar</span>
          </button>
        )}
      </div>

      {status === 'accepted' && <CheckCircle2 className="w-4 h-4 text-primary mt-1" />}
      {status === 'rejected' && <AlertCircle className="w-4 h-4 text-destructive mt-1" />}
    </div>
  );
}

/**
 * ExtractionNotification - Replaces ExtractionPreview modal
 * Renders as inline card within chat flow
 * Preserves all existing functionality (apply extraction, dismiss)
 * Positioned above input area by parent
 */
export function ExtractionNotification({ notification }: ExtractionNotificationProps) {
  const { dismissNotification } = useChatActions();
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({});

  const extraction = notification.metadata.extraction?.data;

  const hasMeaningfulData = useMemo(() => {
    if (!extraction) return false;
    const { extracted } = extraction;
    return (extracted.personalInfo && Object.keys(extracted.personalInfo).length > 0) ||
      (extracted.experience && extracted.experience.length > 0) ||
      (extracted.education && extracted.education.length > 0) ||
      (extracted.skills && extracted.skills.length > 0);
  }, [extraction]);

  if (!extraction) return null;
  if (!hasMeaningfulData) return null;

  const handleFieldStatus = (id: string, status: 'accepted' | 'rejected') => {
    setFieldStatuses(prev => ({ ...prev, [id]: status }));
  };

  const getFieldLabel = (section: string, key: string) => {
    const labels: Record<string, string> = {
      'p-fullName': 'Nombre', 'p-email': 'Email', 'p-phone': 'Teléfono',
      'p-location': 'Ubicación', 'p-role': 'Rol', 'p-summary': 'Resumen',
      'e-company': 'Empresa', 'e-position': 'Puesto', 'e-startDate': 'Inicio', 'e-endDate': 'Fin',
      'e-location': 'Ubicación', 'e-description': 'Descripción',
      'ed-institution': 'Institución', 'ed-degree': 'Título', 'ed-fieldOfStudy': 'Área', 'ed-startDate': 'Inicio', 'ed-endDate': 'Fin',
      's-name': 'Habilidad', 's-level': 'Nivel',
      'pr-name': 'Proyecto', 'pr-description': 'Descripción', 'pr-technologies': 'Tecnologías',
      'l-language': 'Idioma', 'l-fluency': 'Fluidez',
      'c-name': 'Certificación', 'c-issuer': 'Emisor', 'c-date': 'Fecha'
    };
    return labels[`${section}-${key}`] || key;
  };

  const hiddenFields = new Set(['id', 'current', 'proficiency', 'category']);
  const personalEntries = Object.entries(extraction.extracted.personalInfo || {})
    .filter(([key, value]) => !hiddenFields.has(key) && value !== '' && value !== null && value !== undefined);
  const experienceData = (extraction.extracted.experience || [])
    .map((exp) => Object.fromEntries(
      Object.entries(exp).filter(([key, value]) => !hiddenFields.has(key) && value !== '' && value !== null && value !== undefined)
    ))
    .filter((exp) => Object.keys(exp).length > 0);
  const educationData = (extraction.extracted.education || [])
    .map((edu) => Object.fromEntries(
      Object.entries(edu).filter(([key, value]) => !hiddenFields.has(key) && value !== '' && value !== null && value !== undefined)
    ))
    .filter((edu) => Object.keys(edu).length > 0);

  const handleApply = () => {
    if (notification.metadata.extraction?.onApply) {
      notification.metadata.extraction.onApply(extraction);
    }
    dismissNotification(notification.id);
  };

  const handleDismiss = () => {
    if (notification.metadata.extraction?.onDismiss) {
      notification.metadata.extraction.onDismiss();
    }
    dismissNotification(notification.id);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Datos Detectados</h3>
        </div>
        <button
          onClick={handleDismiss}
          className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

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
                    <span className="text-sm font-bold text-foreground">{exp.company || 'Empresa'}</span>
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
                    <span className="text-sm font-bold text-foreground">{edu.institution || 'Institución'}</span>
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

      <div className="p-6 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between shrink-0 gap-3">
        <Button
          variant="outline"
          onClick={handleDismiss}
          className="w-full sm:flex-1 rounded-xl h-12 text-sm font-bold"
        >
          Descartar
        </Button>
        <Button
          onClick={handleApply}
          className="w-full sm:flex-1 rounded-xl h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg text-sm font-bold"
        >
          Aplicar Todo
        </Button>
      </div>
    </div>
  );
}

export default ExtractionNotification;
