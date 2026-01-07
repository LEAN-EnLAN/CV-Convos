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
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CritiqueModalProps {
    isOpen: boolean;
    onClose: () => void;
    cvData: CVData;
    onApplyImprovement: (improvement: ImprovementCard) => void;
    onScanComplete?: (results: CritiqueResponse) => void;
}

export function CritiqueModal({ isOpen, onClose, cvData, onApplyImprovement, onScanComplete }: CritiqueModalProps) {
    const [step, setStep] = useState<'scanning' | 'results' | 'empty'>('scanning');
    const [results, setResults] = useState<CritiqueResponse | null>(null);
    const [scanProgress, setScanProgress] = useState(0);

    const runScan = useCallback(async () => {
        setStep('scanning');
        setScanProgress(0);

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

            if (!response.ok) throw new Error('Failed to fetch critique');

            const data: CritiqueResponse = await response.json();

            // Esperar al menos 2.5 segundos para que la animación se luzca
            setTimeout(() => {
                setResults(data);
                setStep(data.critique?.length > 0 ? 'results' : 'empty');
                if (onScanComplete) onScanComplete(data);
                clearInterval(interval);
            }, 2500);

        } catch (error) {
            console.error('Critique error:', error);
            toast.error('Error al analizar el CV. Reintentá en unos momentos.');
            onClose();
        }
    }, [cvData, onClose]);

    useEffect(() => {
        if (isOpen) {
            runScan();
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col p-0 overflow-hidden bg-slate-950 text-white border-slate-800">
                <DialogHeader className="sr-only">
                    <DialogTitle>Análisis Sentinel CV</DialogTitle>
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
                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 blur-sm animate-scan" style={{ top: `${scanProgress}%` }} />
                            </div>

                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-full border-2 border-primary/30 flex items-center justify-center animate-pulse">
                                    <Search className="w-10 h-10 text-primary" />
                                </div>
                                <motion.div
                                    className="absolute inset-0 rounded-full border-t-2 border-primary"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                            </div>

                            <h2 className="text-2xl font-bold mb-2 tracking-tight">Sentinel Scanning...</h2>
                            <p className="text-slate-400 text-center max-w-xs mb-8">
                                Nuestra IA está analizando cada rincón de tu CV buscando puntos de mejora de alto impacto.
                            </p>

                            <div className="w-full max-w-sm bg-slate-900 h-1.5 rounded-full overflow-hidden mb-2">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${scanProgress}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-mono text-primary/70 uppercase tracking-widest">
                                {scanProgress}% Analizando Estructura y Semántica
                            </span>
                        </motion.div>
                    )}

                    {step === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-lg ${results?.score && results.score >= 80 ? 'border-emerald-500 text-emerald-500' : 'border-amber-500 text-amber-500'}`}>
                                        {results?.score || 0}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-primary" />
                                            Análisis Sentinel
                                        </h2>
                                        <p className="text-sm text-slate-400">{results?.overall_verdict}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-primary border-primary/30">AI Premium</Badge>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {results?.critique.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group shadow-xl"
                                    >
                                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-white/[0.02]">
                                            <div className="flex items-center gap-2">
                                                <Badge className={
                                                    item.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        item.severity === 'Suggested' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                }>
                                                    {item.severity}
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
                                            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                            <p className="text-slate-400 text-sm mb-4 leading-relaxed">{item.description}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                                    <span className="text-[9px] font-bold text-red-500 uppercase block mb-1">Actual</span>
                                                    <p className="text-xs text-slate-300 italic">"{item.original_text}"</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                    <span className="text-[9px] font-bold text-emerald-500 uppercase block mb-1">Sugerencia AI</span>
                                                    <p className="text-xs text-white font-medium">"{item.suggested_text}"</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-xs text-primary/80 font-medium">
                                                    <Zap className="w-3.5 h-3.5" />
                                                    {item.impact_reason}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="bg-primary hover:bg-primary/90 text-white font-bold gap-2"
                                                    onClick={() => handleApply(item)}
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Aplicar Mejora
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'empty' && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                                <Sparkles className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-white">¡CV Optimizado con Éxito!</h2>
                            <p className="text-slate-400 max-w-xs mb-8">
                                Ya no encontramos puntos críticos que mejorar. ¡Tu CV está listo para destacar!
                            </p>
                            <Button
                                onClick={onClose}
                                className="bg-white text-black hover:bg-slate-200 font-bold px-8 shadow-xl shadow-white/5"
                            >
                                Volver al Editor
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                    @keyframes scan {
                        0% { transform: translateY(0); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: translateY(100vh); opacity: 0; }
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(0,0,0,0.1);
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #1e293b;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #334155;
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}
