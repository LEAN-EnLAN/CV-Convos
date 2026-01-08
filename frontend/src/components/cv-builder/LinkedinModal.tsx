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
    X
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
import html2canvas from 'html2canvas';

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
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !content) {
            fetchAIContent();
        }
    }, [isOpen]);

    const fetchAIContent = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/generate-linkedin-post`, {
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
                const canvas = await html2canvas(cardRef.current!, {
                    scale: 2,
                    backgroundColor: null,
                    useCORS: true,
                    logging: false,
                    allowTaint: true,
                    // Optimization for high-res screens
                    windowWidth: cardRef.current?.scrollWidth,
                    windowHeight: cardRef.current?.scrollHeight,
                });

                const link = document.createElement('a');
                link.download = `linkedin-card-${data.personalInfo.fullName.replace(/\s+/g, '-').toLowerCase()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                toast.success("Imagen descargada con éxito.");
                setCurrentStep(2);
            } catch (err) {
                console.error("html2canvas error:", err);
                toast.error("Error al generar la imagen.");
            } finally {
                setIsCapturing(false);
            }
        }, 100);
    };

    const handleFinalShare = () => {
        navigator.clipboard.writeText(content);
        toast.success("Texto copiado al portapapeles.");
        window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-[95vw] !w-[95vw] h-[95vh] md:h-[90vh] p-0 gap-0 overflow-hidden flex flex-col sm:max-w-none bg-background border-border shadow-2xl transition-all duration-300">
                <VisuallyHidden.Root>
                    <DialogTitle>LinkedIn Professional Export</DialogTitle>
                </VisuallyHidden.Root>

                <div className="flex h-full flex-col md:flex-row overflow-hidden">
                    {/* SIDEBAR: System Navigation */}
                    <div className={`${currentStep === 2 ? 'hidden md:flex' : 'flex'} w-full border-b md:border-b-0 md:border-r border-border bg-muted/20 p-6 md:p-8 md:w-80 flex-shrink-0 flex-col justify-between transition-all duration-300`}>
                        <div className="space-y-6 md:space-y-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Linkedin className="h-5 w-5" />
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Protocol_v4</span>
                                </div>
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight">
                                    LinkedIn <span className="text-primary italic">Share</span>
                                </h1>
                                <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed hidden md:block">
                                    Sigue estos pasos para maximizar la visibilidad de tu perfil profesional.
                                </p>
                            </div>

                            <nav className="space-y-2">
                                <StepItem
                                    number="1"
                                    label="Visual Core"
                                    description="Generar Tarjeta HQ"
                                    active={currentStep === 1}
                                    completed={currentStep > 1}
                                    onClick={() => setCurrentStep(1)}
                                />
                                <StepItem
                                    number="2"
                                    label="Message Kit"
                                    description="IA Viral Script"
                                    active={currentStep === 2}
                                    completed={false}
                                    onClick={() => setCurrentStep(2)}
                                />
                            </nav>
                        </div>

                        <div className="hidden md:block pt-6 border-t border-border">
                            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none">
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                System Active
                            </div>
                        </div>
                    </div>

                    {/* MAIN WORKSPACE */}
                    <div className="relative flex-1 flex flex-col bg-background/50 overflow-hidden">
                        {/* Header / Nav for mobile */}
                        <div className="flex items-center justify-between p-4 border-b border-border md:hidden bg-background/80 backdrop-blur">
                            {currentStep === 2 && (
                                <button onClick={() => setCurrentStep(1)} className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                                    <ChevronLeft className="h-4 w-4" /> Atrás
                                </button>
                            )}
                            <div className="text-[10px] font-mono font-bold text-primary uppercase ml-auto mr-4">
                                STAGE: {currentStep === 1 ? 'VISUAL' : 'COPY'}
                            </div>
                            <button onClick={onClose} className="p-1 rounded-full text-muted-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Desktop Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-8 hidden md:flex p-2 rounded-full hover:bg-muted transition-all text-zinc-400 hover:text-foreground z-50 group"
                        >
                            <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                        </button>

                        <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col">
                            {currentStep === 1 ? (
                                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-in fade-in duration-500">
                                    <div className="mb-8 hidden md:flex items-center justify-between border-b border-border pb-4">
                                        <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 text-zinc-500">
                                            <ImageIcon className="h-4 w-4" />
                                            Card Canvas
                                        </h2>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-mono text-zinc-400 bg-muted px-2 py-0.5 rounded border border-border">
                                                RENDER_SCALE: 2.0x
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex items-center justify-center py-4 min-h-[350px]">
                                        {/* IMPACT CARD - Simplified for html2canvas compatibility */}
                                        <div
                                            ref={cardRef}
                                            className="relative aspect-[1.91/1] w-full max-w-2xl bg-white border border-border rounded-lg shadow-2xl overflow-hidden p-8 md:p-14 flex flex-col justify-between"
                                            style={{ color: '#000' }} // Force black text for card context
                                        >
                                            {/* Decorative corners */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12" />
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -ml-16 -mb-16" />

                                            <div className="relative z-10">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-black text-white text-[9px] font-black tracking-[0.2em] uppercase mb-8">
                                                    AVAILABLE FOR HIRE
                                                </div>
                                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.85] text-black">
                                                    {data.personalInfo.fullName.split(' ')[0]}<br />
                                                    <span className="opacity-20 text-stroke italic">{data.personalInfo.fullName.split(' ').slice(1).join(' ')}</span>
                                                </h2>
                                                <p className="mt-6 text-xl md:text-2xl font-bold tracking-tight text-primary border-l-4 border-primary pl-5">
                                                    {data.experience[0]?.position || 'Professional'}
                                                </p>
                                            </div>

                                            <div className="relative z-10 flex flex-wrap gap-2 md:gap-3">
                                                {data.skills.slice(0, 5).map((s) => (
                                                    <span
                                                        key={s.id}
                                                        className="px-3 py-1 bg-zinc-100 text-zinc-900 rounded font-mono text-[10px] font-bold uppercase tracking-wider border border-zinc-200"
                                                    >
                                                        {s.name}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Tech watermark */}
                                            <div className="absolute bottom-6 right-10 text-[8px] font-mono text-zinc-300 tracking-widest rotate-90 origin-bottom-right">
                                                CV_CONVOS_PROTO_4
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 flex flex-col items-center gap-4 max-w-sm mx-auto w-full">
                                        <Button
                                            size="lg"
                                            onClick={handleDownloadImage}
                                            disabled={isCapturing}
                                            className="w-full gap-3 h-14 md:h-16 rounded-none text-sm font-black tracking-[0.2em] uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20"
                                        >
                                            {isCapturing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                                            {isCapturing ? 'Capturando...' : 'Descargar Tarjeta'}
                                        </Button>
                                        <button
                                            onClick={() => setCurrentStep(2)}
                                            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Omitir paso visual
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-in slide-in-from-right-8 duration-500">
                                    <div className="mb-8 hidden md:flex items-center justify-between border-b border-border pb-4">
                                        <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 text-zinc-500">
                                            <Sparkles className="h-4 w-4" />
                                            AI Copy-System
                                        </h2>
                                        <div className="font-mono text-[10px] text-zinc-400">
                                            STATE: FULL_READY
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-primary/20 rounded-lg blur transition duration-1000 group-hover:opacity-100 opacity-50" />
                                        <div className="relative flex-1 bg-card rounded-lg border border-border shadow-sm flex flex-col overflow-hidden">
                                            <div className="bg-muted/40 border-b border-border px-5 py-3 flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                                                </div>
                                                <div className="text-[9px] font-mono font-bold text-muted-foreground">OUT_BUFFER_734</div>
                                            </div>

                                            {loading ? (
                                                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
                                                        <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                                                    </div>
                                                    <div className="text-center space-y-2">
                                                        <p className="text-sm font-black tracking-widest uppercase animate-pulse">Analizando Perfil...</p>
                                                        <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-50">Generando estructura viral de impacto</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Textarea
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                    className="flex-1 resize-none border-0 focus-visible:ring-0 p-8 text-base md:text-lg leading-relaxed bg-transparent no-scrollbar"
                                                    placeholder="Inyectando copy..."
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
                                            className="flex-1 h-14 md:h-16 gap-3 font-black tracking-[0.2em] uppercase rounded-none shadow-xl shadow-primary/30 transition-all hover:scale-[1.01]"
                                        >
                                            Copiar & Lanzar <Linkedin className="h-5 w-5 fill-current" />
                                        </Button>
                                    </div>

                                    <p className="mt-8 text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold opacity-60 flex items-center justify-center gap-2">
                                        <Share2 className="h-3 w-3" />
                                        LinkedIn requiere adjuntar imagen manualmente
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
            className={`flex items-center gap-5 p-4 rounded-lg cursor-pointer transition-all border duration-300 ${active ? 'bg-background border-primary shadow-md translate-x-1' : 'border-transparent hover:bg-background/40 hover:translate-x-0.5'}`}
        >
            <div className={`flex h-10 w-10 items-center justify-center rounded transition-all duration-500 font-mono font-bold text-sm ${active ? 'bg-primary text-primary-foreground rotate-6' : 'bg-muted text-muted-foreground'}`}>
                {completed ? <Check className="h-5 w-5" /> : `0${number}`}
            </div>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.15em] leading-none mb-1.5 ${active ? 'text-primary' : 'text-zinc-600'}`}>{label}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{description}</p>
            </div>
        </div>
    );
}
