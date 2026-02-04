'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Linkedin,
    Loader2,
    Download,
    Sparkles,
    Copy,
    Check,
    Share2,
    Image as ImageIcon,
    ChevronLeft,
    X,
    Briefcase,
    MapPin
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { toast } from 'sonner';
import { CVData } from '@/types/cv';
import { toPng } from 'html-to-image';
import { buildApiUrl } from '@/lib/api/base';

interface LinkedinModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: CVData;
}

export function LinkedinModal({ isOpen, onClose, data }: LinkedinModalProps) {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [isCapturing, setIsCapturing] = useState(false);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !content) {
            fetchAIContent();
        }
    }, [isOpen]);

    const fetchAIContent = async () => {
        setLoading(true);
        try {
            const res = await fetch(buildApiUrl('/api/generate-linkedin-post'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            setContent(json.post_content || "¡Hola a todos! Acabo de actualizar mi CV. #OpenToWork");
        } catch (e) {
            setContent(`🚀 Busco nuevas oportunidades como ${data.experience[0]?.position || 'Profesional'}.\n\n#OpenToWork #Tech`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadImage = async () => {
        if (!cardRef.current) return;
        setIsCapturing(true);

        // Defer capture slightly to ensure any state-driven styles are applied
        setTimeout(async () => {
            try {
                if (!cardRef.current) return;

                // Ensure correct gradient before capture (although usually reflected in DOM)
                cardRef.current.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4338ca 100%)';

                const dataUrl = await toPng(cardRef.current, {
                    cacheBust: true,
                    backgroundColor: undefined,
                    pixelRatio: 2,
                    quality: 1.0,
                    style: {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4338ca 100%)'
                    }
                });

                const link = document.createElement('a');
                link.download = `linkedin-card-${data.personalInfo.fullName.replace(/\s+/g, '-').toLowerCase()}.png`;
                link.href = dataUrl;
                link.click();
                toast.success("Imagen descargada correctamente.");
                setCurrentStep(2);
            } catch (err) {
                console.error("html-to-image error:", err);
                toast.error("Error al generar la imagen.");
            } finally {
                setIsCapturing(false);
            }
        }, 100);
    };

    const handleCopyText = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success("Texto copiado al portapapeles.");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFinalShare = () => {
        navigator.clipboard.writeText(content);
        window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
        onClose();
    };

    const professionalTitle = data.experience[0]?.position || data.personalInfo.role || 'Profesional';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent showCloseButton={false} className="!max-w-[95vw] !w-[95vw] h-[95vh] md:h-[90vh] p-0 gap-0 overflow-hidden flex flex-col sm:max-w-none bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 shadow-2xl transition-all duration-300">
                <VisuallyHidden.Root>
                    <DialogTitle>Exportar a LinkedIn</DialogTitle>
                </VisuallyHidden.Root>

                <div className="flex h-full flex-col md:flex-row overflow-hidden">
                    {/* SIDEBAR */}
                    <div className={`${currentStep === 2 ? 'hidden md:flex' : 'flex'} w-full border-b md:border-b-0 md:border-r border-border bg-muted/30 p-6 md:p-8 md:w-80 flex-shrink-0 flex-col justify-between transition-all duration-300`}>
                        <div className="space-y-6 md:space-y-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <Linkedin className="h-5 w-5" />
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">LinkedIn Export</span>
                                </div>
                                <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground leading-tight">
                                    Compartir en <span className="text-blue-600 dark:text-blue-400">LinkedIn</span>
                                </h1>
                                <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed hidden md:block">
                                    Sigue estos pasos para maximizar la visibilidad de tu perfil profesional.
                                </p>
                            </div>

                            <nav className="space-y-2">
                                <StepItem
                                    number="1"
                                    label="Tarjeta Visual"
                                    description="Generar imagen HQ"
                                    active={currentStep === 1}
                                    completed={currentStep > 1}
                                    onClick={() => setCurrentStep(1)}
                                />
                                <StepItem
                                    number="2"
                                    label="Texto del Post"
                                    description="Contenido generado por IA"
                                    active={currentStep === 2}
                                    completed={false}
                                    onClick={() => setCurrentStep(2)}
                                />
                            </nav>
                        </div>


                    </div>

                    {/* MAIN WORKSPACE */}
                    <div className="relative flex-1 flex flex-col bg-background/50 overflow-hidden">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border md:hidden bg-background/80 backdrop-blur">
                            {currentStep === 2 && (
                                <button onClick={() => setCurrentStep(1)} className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                                    <ChevronLeft className="h-4 w-4" /> Atrás
                                </button>
                            )}
                            <div className="text-[10px] font-mono font-bold text-blue-600 uppercase ml-auto mr-4">
                                PASO {currentStep}: {currentStep === 1 ? 'IMAGEN' : 'TEXTO'}
                            </div>
                            <button onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Desktop Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-8 hidden md:flex p-2 rounded-full hover:bg-muted transition-all text-muted-foreground hover:text-foreground z-50"
                        >
                            <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                        </button>

                        <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col">
                            {currentStep === 1 ? (
                                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-in fade-in duration-500">
                                    <div className="mb-8 hidden md:flex items-center justify-between border-b border-border pb-4">
                                        <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 text-muted-foreground">
                                            <ImageIcon className="h-4 w-4" />
                                            Vista Previa de Tarjeta
                                        </h2>

                                    </div>

                                    <div className="flex-1 flex items-center justify-center py-4 min-h-[350px]">
                                        {/* LinkedIn Card - Modern Design */}
                                        <div
                                            ref={cardRef}
                                            className="linkedin-card relative aspect-[1.91/1] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden p-8 md:p-12"
                                            style={{
                                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4338ca 100%)'
                                            }}
                                        >
                                            {/* Background Pattern */}
                                            <div className="absolute inset-0 opacity-10">
                                                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mr-48 -mt-48" />
                                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -ml-32 -mb-32" />
                                            </div>

                                            <div className="relative z-10 h-full flex flex-col justify-between">
                                                {/* Top Section */}
                                                <div>
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-[11px] font-black tracking-[0.15em] uppercase mb-6">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        Disponible para Oportunidades
                                                    </div>
                                                    <h2 className="text-4xl md:text-5xl font-black text-white leading-[0.95] tracking-tight mb-4">
                                                        {data.personalInfo.fullName}
                                                    </h2>
                                                    <div className="flex items-center gap-4 text-white/80">
                                                        <div className="flex items-center gap-2">
                                                            <Briefcase className="w-4 h-4" />
                                                            <span className="text-sm font-semibold">{professionalTitle}</span>
                                                        </div>
                                                        {data.personalInfo.location && (
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="w-4 h-4" />
                                                                <span className="text-sm">{data.personalInfo.location}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Skills */}
                                                <div className="flex flex-wrap gap-2">
                                                    {data.skills.slice(0, 6).map((s) => (
                                                        <span
                                                            key={s.id}
                                                            className="px-3 py-1.5 bg-white/20 text-white rounded-full text-[11px] font-bold uppercase tracking-wider border border-white/20"
                                                        >
                                                            {s.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Logo watermark */}
                                            <div className="absolute bottom-4 right-6 text-[9px] font-mono text-white/30 tracking-widest">
                                                CV-BUILDER
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 flex flex-col items-center gap-4 max-w-sm mx-auto w-full">
                                        <Button
                                            size="lg"
                                            onClick={handleDownloadImage}
                                            disabled={isCapturing}
                                            className="w-full gap-3 h-14 md:h-16 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-500/30 bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/50 hover:shadow-2xl"
                                        >
                                            {isCapturing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                                            {isCapturing ? 'Generando...' : 'Descargar Tarjeta'}
                                        </Button>
                                        <button
                                            onClick={() => setCurrentStep(2)}
                                            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Omitir este paso
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-in slide-in-from-right-8 duration-500">
                                    <div className="mb-8 hidden md:flex items-center justify-between border-b border-border pb-4">
                                        <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 text-muted-foreground">
                                            <Sparkles className="h-4 w-4" />
                                            Contenido del Post
                                        </h2>
                                        <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                                            Generado por IA
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl blur opacity-50" />
                                        <div className="relative flex-1 bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
                                            <div className="bg-muted/40 border-b border-border px-5 py-3 flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 gap-1.5 text-[10px] font-bold"
                                                    onClick={handleCopyText}
                                                >
                                                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                    {copied ? 'Copiado' : 'Copiar'}
                                                </Button>
                                            </div>

                                            {loading ? (
                                                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
                                                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 relative z-10" />
                                                    </div>
                                                    <div className="text-center space-y-2">
                                                        <p className="text-sm font-bold tracking-widest uppercase animate-pulse">Analizando Perfil...</p>
                                                        <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-50">Generando contenido optimizado</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Textarea
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                    className="flex-1 resize-none border-0 focus-visible:ring-0 p-8 text-base md:text-lg leading-relaxed bg-transparent"
                                                    placeholder="El contenido aparecerá aquí..."
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-10 flex flex-col md:flex-row gap-4 max-w-2xl mx-auto w-full">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setCurrentStep(1)}
                                            className="h-14 font-bold uppercase tracking-widest text-xs border border-border hover:bg-muted hidden md:flex"
                                        >
                                            ← Volver
                                        </Button>
                                        <Button
                                            size="lg"
                                            onClick={handleFinalShare}
                                            className="flex-1 h-14 md:h-16 gap-3 font-bold rounded-xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.01] bg-blue-600 hover:bg-blue-700"
                                        >
                                            Copiar y Compartir <Linkedin className="h-5 w-5 fill-current" />
                                        </Button>
                                    </div>

                                    <p className="mt-8 text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold opacity-60 flex items-center justify-center gap-2">
                                        <Share2 className="h-3 w-3" />
                                        LinkedIn requiere adjuntar la imagen manualmente
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StepItem({ number, label, description, active, completed, onClick }: {
    number: string,
    label: string,
    description: string,
    active: boolean,
    completed: boolean,
    onClick: () => void
}) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-5 p-4 rounded-xl cursor-pointer transition-all border duration-300 ${active ? 'bg-background border-blue-500/50 shadow-md translate-x-1' : 'border-transparent hover:bg-background/40 hover:translate-x-0.5'}`}
        >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500 font-mono font-bold text-sm ${active ? 'bg-blue-600 text-white rotate-3' : 'bg-muted text-muted-foreground'}`}>
                {completed ? <Check className="h-5 w-5" /> : `0${number}`}
            </div>
            <div>
                <p className={`text-xs font-black uppercase tracking-[0.1em] leading-none mb-1.5 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>{label}</p>
                <p className="text-[10px] font-medium text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
