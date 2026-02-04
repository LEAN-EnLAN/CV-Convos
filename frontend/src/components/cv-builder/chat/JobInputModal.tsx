/**
 * JobInputModal - Modal para ingresar descripción de puesto
 * Diseño minimalista y calmado siguiendo el sistema de diseño
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  JobAnalysisRequest,
  JobAnalysisResponse,
  TailoringSuggestion,
} from '@/types/chat';
import { CVData } from '@/types/cv';
import { CheckCircle, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';

interface JobInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: Partial<CVData>;
  onApplySuggestions: (suggestions: TailoringSuggestion[], optimizedCV?: Partial<CVData>) => void;
  onSetJobDescription: (description: string) => void;
}

interface SuggestionCardProps {
  suggestion: TailoringSuggestion;
  onApply: () => void;
  isApplied: boolean;
}

function SuggestionCard({ suggestion, onApply, isApplied }: SuggestionCardProps) {

  const priorityLabel = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-background">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full border',
              suggestion.priority === 'high' && 'border-destructive text-destructive',
              suggestion.priority === 'medium' && 'border-amber-500 text-amber-600',
              suggestion.priority === 'low' && 'border-muted-foreground text-muted-foreground'
            )}
          >
            {priorityLabel[suggestion.priority]}
          </span>
          <span className="font-medium text-sm text-foreground">{suggestion.section}</span>
        </div>
        <Button
          size="sm"
          variant={isApplied ? 'outline' : 'default'}
          className={cn(
            'h-7 text-xs',
            isApplied
              ? 'border-emerald-500 text-emerald-600'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
          onClick={onApply}
          disabled={isApplied}
        >
          {isApplied ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Aplicado
            </>
          ) : (
            'Aplicar'
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{suggestion.reason}</p>

      <div className="space-y-2">
        <div
          className="p-2 rounded text-xs line-through text-muted-foreground bg-muted"
        >
          {suggestion.current}
        </div>
        <div className="flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="p-2 rounded text-xs text-foreground border border-emerald-500/30 bg-emerald-500/5">
          {suggestion.suggested}
        </div>
      </div>
    </div>
  );
}

export function JobInputModal({
  isOpen,
  onClose,
  cvData,
  onApplySuggestions,
  onSetJobDescription,
}: JobInputModalProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JobAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());

  const handleAnalyze = useCallback(async () => {
    if (!jobDescription.trim() || jobDescription.length < 50) {
      setError('Por favor ingresa una descripción de al menos 50 caracteres');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const request: JobAnalysisRequest = {
        jobDescription: jobDescription.trim(),
        cvData,
      };

      const response = await fetch('/api/chat/job-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result: JobAnalysisResponse = await response.json();
      setAnalysisResult(result);
      onSetJobDescription(jobDescription.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al analizar el puesto');
    } finally {
      setIsAnalyzing(false);
    }
  }, [jobDescription, cvData, onSetJobDescription]);

  const handleApplySuggestion = useCallback(
    (index: number) => {
      if (!analysisResult) return;

      const suggestion = analysisResult.suggestions[index];
      if (!suggestion) return;

      setAppliedSuggestions((prev) => new Set([...prev, index]));
    },
    [analysisResult]
  );

  const handleApplyAll = useCallback(() => {
    if (!analysisResult) return;

    const allIndices = analysisResult.suggestions.map((_, i) => i);
    setAppliedSuggestions(new Set(allIndices));
    onApplySuggestions(analysisResult.suggestions, analysisResult.optimizedCV);
  }, [analysisResult, onApplySuggestions]);

  const handleClose = useCallback(() => {
    // Reset state when closing
    if (!isAnalyzing) {
      setJobDescription('');
      setAnalysisResult(null);
      setError(null);
      setAppliedSuggestions(new Set());
      onClose();
    }
  }, [isAnalyzing, onClose]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-destructive';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'flex flex-col bg-background border border-border shadow-2xl',
          'w-[94vw] max-w-2xl max-h-[92vh] sm:max-h-[90vh] p-4 sm:p-6 rounded-2xl'
        )}
      >
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2 text-foreground"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Ajustar CV al Puesto
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pega la descripción del puesto al que te postulas y te ayudaré a optimizar tu CV
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 my-4 pr-2 sm:pr-4">
          {!analysisResult ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  Descripción del puesto
                </label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Pega aquí la descripción completa del puesto de trabajo..."
                  className="min-h-[180px] sm:min-h-[200px] resize-none border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                  disabled={isAnalyzing}
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 50 caracteres • {jobDescription.length} caracteres ingresados
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 border border-destructive/20 rounded-lg text-destructive text-sm bg-destructive/5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted/40 rounded-lg">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-border"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className={getMatchScoreColor(analysisResult.matchScore)}
                      strokeDasharray={`${analysisResult.matchScore}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn('text-xl font-bold', getMatchScoreColor(analysisResult.matchScore))}>
                      {analysisResult.matchScore}%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Coincidencia con el puesto</h4>
                  <p className="text-sm text-muted-foreground">
                    {analysisResult.matchScore >= 80
                      ? '¡Excelente coincidencia! Tu CV está bien alineado con el puesto.'
                      : analysisResult.matchScore >= 60
                      ? 'Buena coincidencia. Hay algunas mejoras que puedes hacer.'
                      : 'Necesitas ajustar tu CV para destacar mejor frente a este puesto.'}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Habilidades</h4>

                {analysisResult.matchedSkills.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Coincidencias encontradas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.matchedSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded border border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.missingSkills.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Habilidades faltantes:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.missingSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded border border-amber-500/30 text-amber-600 bg-amber-500/5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sugerencias */}
              {analysisResult.suggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Sugerencias de mejora</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-muted-foreground hover:bg-muted"
                      onClick={handleApplyAll}
                      disabled={appliedSuggestions.size === analysisResult.suggestions.length}
                    >
                      Aplicar todas
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <SuggestionCard
                        key={index}
                        suggestion={suggestion}
                        onApply={() => handleApplySuggestion(index)}
                        isApplied={appliedSuggestions.has(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2 flex-col-reverse sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isAnalyzing}
            className="border-border text-muted-foreground hover:bg-muted w-full sm:w-auto"
          >
            {analysisResult ? 'Cerrar' : 'Cancelar'}
          </Button>

          {!analysisResult && (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || jobDescription.length < 50}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                'Analizar puesto'
              )}
            </Button>
          )}

          {analysisResult && appliedSuggestions.size > 0 && (
            <Button
              onClick={() => {
                onApplySuggestions(
                  analysisResult.suggestions.filter((_, i) => appliedSuggestions.has(i)),
                  analysisResult.optimizedCV
                );
                handleClose();
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar cambios
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default JobInputModal;
