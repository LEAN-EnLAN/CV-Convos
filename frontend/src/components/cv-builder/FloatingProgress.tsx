'use client';

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    X,
    Zap,
    AlertCircle,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip';

interface FloatingProgressProps {
    percentage: number;
    isSaving: boolean;
    lastSaved: Date | null;
}

export function FloatingProgress({ percentage, isSaving, lastSaved }: FloatingProgressProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const hidden = sessionStorage.getItem('hide-cv-progress');
        if (hidden) setIsVisible(false);
    }, []);

    const handleHide = () => {
        if (!showWarning) {
            setShowWarning(true);
            return;
        }
        setIsVisible(false);
        sessionStorage.setItem('hide-cv-progress', 'true');
    };

    if (!isVisible) return null;

    const isComplete = percentage >= 100;

    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 z-[60] no-print transition-all duration-500 ease-out",
                isMinimized ? "w-14" : "w-80"
            )}
        >
            <div className={cn(
                "relative group overflow-hidden transition-all duration-500",
                "bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/95 backdrop-blur-xl",
                "border shadow-2xl",
                isMinimized
                    ? "rounded-full aspect-square p-0"
                    : "rounded-3xl p-6",
                isComplete
                    ? "border-emerald-500/40 shadow-emerald-500/20"
                    : "border-white/10 shadow-black/50"
            )}>
                {/* Ambient glow effect */}
                <div className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-1000",
                    isComplete && !isMinimized && "opacity-100"
                )}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-emerald-500/5 blur-2xl" />
                </div>

                {/* Hover controls */}
                {!isMinimized && !showWarning && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/30 hover:text-white/70"
                            aria-label="Minimizar"
                        >
                            <Minimize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={handleHide}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all text-white/30 hover:text-red-400"
                            aria-label="Ocultar"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {isMinimized ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setIsMinimized(false)}
                                className={cn(
                                    "w-full h-full flex items-center justify-center transition-all duration-300",
                                    "hover:scale-110 active:scale-95 relative",
                                    isComplete ? "text-emerald-400" : "text-primary"
                                )}
                            >
                                {isComplete && (
                                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />
                                )}
                                <span className="text-sm font-black tracking-tight z-10">{percentage}%</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="bg-slate-900 border-white/10 text-white font-semibold">
                            Expandir progreso
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <div className="relative z-10">
                        {showWarning ? (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <h4 className="text-sm font-bold text-white mb-1">¿Ocultar progreso?</h4>
                                        <p className="text-xs text-white/50 leading-relaxed">
                                            Se ocultará hasta que reinicies la sesión.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 px-4 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5"
                                        onClick={() => setShowWarning(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-700"
                                        onClick={handleHide}
                                    >
                                        Sí, ocultar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Header with percentage */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className={cn(
                                                "text-4xl font-black tracking-tight",
                                                isComplete
                                                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent"
                                                    : "text-white"
                                            )}>
                                                {percentage}%
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-white/40 tracking-wide">
                                            {isComplete ? "Completado" : "En progreso"}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                                        "ring-1 ring-white/10",
                                        isComplete
                                            ? "bg-emerald-500/20 text-emerald-400 scale-110"
                                            : "bg-white/5 text-primary"
                                    )}>
                                        {isComplete ? (
                                            <CheckCircle2 className="w-7 h-7" />
                                        ) : (
                                            <Zap className="w-7 h-7" />
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000 ease-out",
                                                isComplete
                                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                                                    : "bg-gradient-to-r from-primary to-primary/80"
                                            )}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Status footer */}
                                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                    {isSaving ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                                            </div>
                                            <span className="text-xs font-semibold text-emerald-400">Guardando...</span>
                                        </div>
                                    ) : lastSaved ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                            <span className="text-xs font-medium text-white/40">
                                                {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                            <span className="text-xs font-medium text-white/30">Sin cambios</span>
                                        </div>
                                    )}

                                    {isComplete && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Listo</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
