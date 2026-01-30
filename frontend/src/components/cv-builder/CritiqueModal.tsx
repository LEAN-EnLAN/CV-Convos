'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CVData, ImprovementCard, CritiqueResponse } from '@/types/cv';
import {
    ShieldCheck,
    Zap,
    X,
    Check,
    AlertCircle,
    Sparkles,
    Search,
    ChevronRight,
    ArrowRight,
    Trophy,
    Target,
    TrendingUp,
    Star,
    CheckCircle2,
    AlertTriangle,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CritiqueModalProps {
    isOpen: boolean;
    onClose: () => void;
    cvData: CVData;
    onApplyImprovement: (improvement: ImprovementCard) => void;
    onScanComplete?: (results: CritiqueResponse) => void;
}

// Tips para alcanzar puntuación máxima
const BEST_PRACTICES = [
    {
        icon: Target,
        title: 'Cuantificá tus logros',
        description: 'Usá números y métricas: "Aumenté ventas un 25%"',
        color: 'emerald'
    },
    {
        icon: Zap,
        title: 'Verbos de acción',
        description: 'Empezá con: Lideré, Desarrollé, Implementé, Optimicé',
        color: 'amber'
    },
    {
        icon: TrendingUp,
        title: 'Palabras clave ATS',
        description: 'Incluí términos del puesto al que aplicás',
        color: 'blue'
    },
    {
        icon: CheckCircle2,
        title: 'Resumen impactante',
        description: '3-4 líneas que resuman tu propuesta de valor',
        color: 'violet'
    }
];

export function CritiqueModal({ isOpen, onClose, cvData, onApplyImprovement, onScanComplete }: CritiqueModalProps) {
    const [step, setStep] = useState<'scanning' | 'results' | 'empty'>('scanning');
    const [results, setResults] = useState<CritiqueResponse | null>(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [showTips, setShowTips] = useState(false);

    const runScan = useCallback(async () => {
        setStep('scanning');
        setScanProgress(0);
        setShowTips(false);

        // Simular progreso de escaneo para el "wow factor"
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/critique-cv`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cvData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Critique API Error:', response.status, errorData);
                throw new Error(errorData.detail || `Failed to fetch critique: ${response.status}`);
            }

            const data: CritiqueResponse = await response.json();

            // Esperar al menos 2.5 segundos para que la animación se luzca
            setTimeout(() => {
                setResults(data);
                setStep(data.critique?.length > 0 ? 'results' : 'empty');
                if (onScanComplete) onScanComplete(data);
                clearInterval(interval);
            }, 1000);

        } catch (error) {
            console.error('Critique error:', error);
            toast.error('Error al analizar el CV. Reintentá en unos momentos.');
            onClose();
        }
    }, [cvData, onClose, onScanComplete]);

    const hasScannedRef = React.useRef(false);

    useEffect(() => {
        if (isOpen && !hasScannedRef.current) {
            hasScannedRef.current = true;
            runScan();
        }
        if (!isOpen) {
            hasScannedRef.current = false;
        }
    }, [isOpen, runScan]);

    const handleApply = (improvement: ImprovementCard) => {
        onApplyImprovement(improvement);
        if (results) {
            setResults({
                ...results,
                critique: results.critique.filter(i => i.id !== improvement.id)
            });
            if (results.critique.length === 1) setStep('empty');
        }
        toast.success(`Mejora aplicada: ${improvement.title}`);
    };

    const handleDismiss = (id: string) => {
        if (results) {
            setResults({
                ...results,
                critique: results.critique.filter(i => i.id !== id)
            });
            if (results.critique.length === 1) setStep('empty');
        }
    };

    // Obtener color del score
    const getScoreColor = (score: number) => {
        if (score >= 90) return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', glow: 'shadow-emerald-500/30' };
        if (score >= 70) return { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', glow: 'shadow-amber-500/30' };
        return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', glow: 'shadow-red-500/30' };
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excelente';
        if (score >= 80) return 'Muy Bueno';
        if (score >= 70) return 'Bueno';
        if (score >= 60) return 'Regular';
        return 'Necesita Mejoras';
    };

    const getSeverityInfo = (severity: string) => {
        switch (severity) {
            case 'Critical':
                return { label: 'Crítico', className: 'bg-red-500/10 text-red-400 border-red-500/20', icon: AlertTriangle };
            case 'Suggested':
                return { label: 'Sugerido', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Info };
            default:
                return { label: 'Menor', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Info };
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] h-[700px] flex flex-col p-0 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-slate-800/50 shadow-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Análisis Crítico con IA</DialogTitle>
                    <DialogDescription>
                        Escaneo y optimización de currículum mediante inteligencia artificial.
                    </DialogDescription>
                </DialogHeader>
                <AnimatePresence mode="wait">
                    {step === 'scanning' && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center p-12 relative"
                        >
                            {/* Scanning line effect */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <motion.div
                                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                                    style={{ top: `${scanProgress}%` }}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            </div>

                            {/* Sentinel Logo Animation */}
                            <div className="relative mb-10">
                                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                                    <Search className="w-14 h-14 text-emerald-400" />
                                </div>
                                <motion.div
                                    className="absolute -inset-2 rounded-2xl border border-emerald-500/50"
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <motion.div
                                    className="absolute -inset-4 rounded-3xl border border-emerald-500/30"
                                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                                />
                            </div>

                            <h2 className="text-3xl font-black mb-3 tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                Analizando CV...
                            </h2>
                            <p className="text-slate-400 text-center max-w-sm mb-10 text-sm leading-relaxed">
                                Nuestra IA está evaluando cada sección de tu CV para encontrar oportunidades de mejora de alto impacto.
                            </p>

                            {/* Progress Bar */}
                            <div className="w-full max-w-md">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-widest">
                                        Análisis en Progreso
                                    </span>
                                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                        {scanProgress}%
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${scanProgress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-3 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                                    <span>Estructura</span>
                                    <span>Semántica</span>
                                    <span>Impacto</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                            {/* Header with Score */}
                            <div className="p-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        {/* Score Circle */}
                                        <div className="relative">
                                            <div className={`w-20 h-20 rounded-2xl border-4 flex items-center justify-center font-black text-2xl ${getScoreColor(results?.score || 0).border} ${getScoreColor(results?.score || 0).text} shadow-lg ${getScoreColor(results?.score || 0).glow}`}>
                                                {results?.score || 0}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded text-[8px] font-black uppercase ${getScoreColor(results?.score || 0).bg} text-white`}>
                                                /100
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                <h2 className="text-xl font-black tracking-tight">Reporte de Análisis</h2>
                                            </div>
                                            <p className="text-sm text-slate-400 max-w-md">
                                                {results?.overall_verdict}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${getScoreColor(results?.score || 0).text} border-current/30`}>
                                                    {getScoreLabel(results?.score || 0)}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                                                    {results?.critique.length || 0} mejoras detectadas
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`gap-2 ${showTips ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}`}
                                        onClick={() => setShowTips(!showTips)}
                                    >
                                        <Trophy className="w-4 h-4" />
                                        <span className="text-xs font-bold">Cómo llegar a 100</span>
                                    </Button>
                                </div>

                                {/* Tips Section */}
                                <AnimatePresence>
                                    {showTips && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-5 pt-5 border-t border-slate-800/50">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Star className="w-4 h-4 text-amber-400" />
                                                    <h3 className="text-sm font-bold text-amber-400">Mejores Prácticas para CV 100/100</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {BEST_PRACTICES.map((tip, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50"
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tip.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                tip.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                                                                    tip.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                                                        'bg-violet-500/20 text-violet-400'
                                                                }`}>
                                                                <tip.icon className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-white mb-0.5">{tip.title}</p>
                                                                <p className="text-[11px] text-slate-400 leading-relaxed">{tip.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Improvements List */}
                            <ScrollArea className="flex-1">
                                <div className="p-6 space-y-4">
                                    {results?.critique.map((item, idx) => {
                                        const severityInfo = getSeverityInfo(item.severity);
                                        const SeverityIcon = severityInfo.icon;

                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.08 }}
                                                className="bg-slate-900/80 border border-slate-800/50 rounded-xl overflow-hidden group hover:border-slate-700/50 transition-all"
                                            >
                                                <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-800/20">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={`${severityInfo.className} gap-1 px-2`}>
                                                            <SeverityIcon className="w-3 h-3" />
                                                            {severityInfo.label}
                                                        </Badge>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.category}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-slate-500 hover:text-white"
                                                        onClick={() => handleDismiss(item.id)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="p-5">
                                                    <h3 className="text-base font-bold mb-2 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                                                    <p className="text-slate-400 text-sm mb-5 leading-relaxed">{item.description}</p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                                            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-2">Actual</span>
                                                            <p className="text-xs text-slate-300 italic leading-relaxed">"{item.original_text}"</p>
                                                        </div>
                                                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Sugerencia IA</span>
                                                            <p className="text-xs text-white font-medium leading-relaxed">"{item.suggested_text}"</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-xs text-emerald-400/80 font-medium">
                                                            <Zap className="w-3.5 h-3.5" />
                                                            {item.impact_reason}
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold gap-2 shadow-lg shadow-emerald-500/20"
                                                            onClick={() => handleApply(item)}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            Aplicar Mejora
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </motion.div>
                    )}

                    {step === 'empty' && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                        >
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
                                <Sparkles className="w-12 h-12 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-black mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                ¡CV Optimizado!
                            </h2>
                            <p className="text-slate-400 max-w-sm mb-10 leading-relaxed">
                                No encontramos mejoras críticas pendientes. Tu CV está listo para destacar entre los demás.
                            </p>
                            <Button
                                onClick={onClose}
                                className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-10 h-12 rounded-xl shadow-xl shadow-white/10"
                            >
                                Volver al Editor
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
