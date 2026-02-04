'use client';

import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
    Rocket,
    Linkedin,
    Instagram,
    FileText,
    Image as ImageIcon,
    FileCode,
    Download,
    Check,
    Share2,
    X,
    Loader2,
    Briefcase,
    Sparkles,
    MapPin,
    File,
    FileType
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { exportCv, ExportFormat } from '@/lib/api/export';
import { CVData, CVTemplate } from '@/types/cv';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { LinkedinModal } from './LinkedinModal';
import { saveAs } from 'file-saver';


interface FinalizeExportProps {
    data: CVData;
    template: CVTemplate;
}

export function FinalizeExport({ data, template }: FinalizeExportProps) {
    const [isStoryOpen, setIsStoryOpen] = useState(false);
    const [isLinkedinOpen, setIsLinkedinOpen] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportError, setExportError] = useState<string | null>(null);
    const storyRef = useRef<HTMLDivElement>(null);

    const handleBackendExport = async (format: ExportFormat) => {
        const label = format.toUpperCase();
        setDownloading(label);
        setExportProgress(10);
        setExportError(null);

        try {
            const { blob, fileName } = await exportCv(
                { cvData: data, templateId: template, format },
                {
                    onProgress: (progress) => {
                        setExportProgress(progress);
                    }
                }
            );

            saveAs(blob, fileName);
            setExportProgress(100);
            toast.success(`${label} exportado correctamente`, {
                description: `Guardado como ${fileName}`
            });
            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error inesperado al exportar';
            console.error(`Error al exportar ${label}:`, error);
            setExportError(message);
            toast.error(`Error al exportar ${label}`, {
                description: 'Intenta de nuevo o usa otro formato'
            });
            return false;
        } finally {
            setTimeout(() => setExportProgress(0), 300);
            setDownloading(null);
        }
    };

    // Exportar PNG real usando html-to-image
    const handlePNGDownload = async () => {
        setDownloading('PNG');
        setExportProgress(10);
        setExportError(null);
        try {
            // Buscar el elemento del CV preview
            const targetElement = (document.querySelector('[data-cv-preview]') ||
                document.querySelector('.cv-density-standard, .cv-density-compact, .cv-density-relaxed')) as HTMLElement;

            if (!targetElement) {
                throw new Error('No se encontró el elemento del CV');
            }

            const dataUrl = await toPng(targetElement, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                quality: 1.0,
                pixelRatio: 2, // Alta resolución
            });

            const link = document.createElement('a');
            const fileName = `cv_${data.personalInfo.fullName.replace(/\s+/g, '_')}.png`;
            link.download = fileName;
            link.href = dataUrl;
            link.click();

            toast.success('PNG exportado correctamente', {
                description: `Guardado como ${fileName}`
            });
            setExportProgress(100);
        } catch (error) {
            console.error('Error al exportar PNG:', error);
            toast.error('Error al exportar PNG', {
                description: 'Intenta de nuevo o usa la exportación PDF'
            });
            setExportError('No se pudo exportar el PNG.');
        } finally {
            setTimeout(() => setExportProgress(0), 300);
            setDownloading(null);
        }
    };

    // Exportar JSON real
    const handleJSONDownload = async () => {
        await handleBackendExport('json');
    };

    // Exportar DOCX real
    const handleDOCXDownload = async () => {
        await handleBackendExport('docx');
    };

    // Exportar TXT real
    const handleTXTDownload = async () => {
        await handleBackendExport('txt');
    };

    // Exportar PDF real
    const handlePDFDownload = async () => {
        await handleBackendExport('pdf');
    };

    // Guardar Instagram Story como imagen real
    const handleSaveStory = async () => {
        if (!storyRef.current) return;

        setDownloading('STORY');
        setExportProgress(10);
        setExportError(null);
        try {
            const dataUrl = await toPng(storyRef.current, {
                cacheBust: true,
                backgroundColor: undefined, // Preservar transparencia/gradientes si los hay, o dejar que el elemento maneje su fondo
                pixelRatio: 2,
                quality: 1.0
            });

            const link = document.createElement('a');
            link.download = `cv_story_${data.personalInfo.fullName.replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();

            toast.success('Story guardada', {
                description: 'Lista para subir a Instagram'
            });
            setExportProgress(100);
            setIsStoryOpen(false);
        } catch (error) {
            console.error('Error al guardar Story:', error);
            toast.error('Error al guardar Story');
            setExportError('No se pudo exportar la story.');
        } finally {
            setTimeout(() => setExportProgress(0), 300);
            setDownloading(null);
        }
    };

    const handleLinkedInShare = async () => {
        // En lugar de compartir URL, descargamos el PDF preventivamente y abrimos modal IA
        const exported = await handleBackendExport('pdf');
        if (exported) {
            setIsLinkedinOpen(true);
        }
    };

    // Obtener el título profesional del usuario
    const professionalTitle = data.experience[0]?.position || data.personalInfo.role || 'Profesional';


    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        size="lg"
                        className="group bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-bold rounded-xl px-4 sm:px-8 gap-3 shadow-xl shadow-slate-900/30 transition-all hover:scale-[1.02] active:scale-95 h-10 sm:h-12"
                    >
                        <span className="hidden sm:inline">Finalizar CV</span>
                        <Rocket className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-lg border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
                    <DialogHeader className="space-y-4 pb-6 border-b border-border/50">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <Rocket className="w-7 h-7 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold">
                                    ¡CV Listo! 🚀
                                </DialogTitle>
                                <DialogDescription className="text-sm">
                                    Compartí o descargá en múltiples formatos
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-6 space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                Share/Download
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Compartí tu CV o descargalo en el formato que prefieras.
                            </p>
                        </div>

                        {/* Share Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Share2 className="w-3 h-3" /> Compartir
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {/* LinkedIn */}
                                <button
                                    onClick={handleLinkedInShare}
                                    className="
                                        group relative flex items-center gap-3 p-4 rounded-xl border-2 border-blue-500/20 bg-blue-500/5 
                                        hover:bg-blue-500/10 hover:border-blue-500/40 hover:scale-[1.02] active:scale-95
                                        transition-all duration-200 text-left overflow-hidden
                                    "
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                                        <Linkedin className="w-5 h-5" />
                                    </div>
                                    <div className="relative">
                                        <p className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">LinkedIn</p>
                                        <p className="text-[10px] text-muted-foreground">Tarjeta + Post IA</p>
                                    </div>
                                </button>

                                {/* Instagram */}
                                <button
                                    onClick={() => setIsStoryOpen(true)}
                                    className="
                                        group relative flex items-center gap-3 p-4 rounded-xl border-2 border-pink-500/20 bg-pink-500/5 
                                        hover:bg-pink-500/10 hover:border-pink-500/40 hover:scale-[1.02] active:scale-95
                                        transition-all duration-200 text-left overflow-hidden
                                    "
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                                        <Instagram className="w-5 h-5" />
                                    </div>
                                    <div className="relative">
                                        <p className="text-sm font-bold text-foreground group-hover:text-pink-500 transition-colors">Instagram</p>
                                        <p className="text-[10px] text-muted-foreground">Story profesional</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Download Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Download className="w-3 h-3" /> Descargar
                            </h4>
                            <div className="space-y-2">
                                {/* PDF */}
                                <Button
                                    variant="outline"
                                    className="w-full h-auto p-4 justify-between hover:bg-muted/50 border-muted-foreground/20"
                                    onClick={handlePDFDownload}
                                    disabled={!!downloading}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                                            {downloading === 'PDF' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">Documento PDF</p>
                                            <p className="text-[10px] text-muted-foreground">Formato estándar ATS</p>
                                        </div>
                                    </div>
                                    {downloading === 'PDF' ? (
                                        <span className="text-xs text-muted-foreground">Generando...</span>
                                    ) : (
                                        <Download className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>

                                {/* PNG */}
                                <Button
                                    variant="outline"
                                    className="w-full h-auto p-4 justify-between hover:bg-muted/50 border-muted-foreground/20"
                                    onClick={handlePNGDownload}
                                    disabled={!!downloading}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                            {downloading === 'PNG' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">Imagen PNG</p>
                                            <p className="text-[10px] text-muted-foreground">Alta resolución</p>
                                        </div>
                                    </div>
                                    {downloading === 'PNG' ? (
                                        <span className="text-xs text-muted-foreground">Generando...</span>
                                    ) : (
                                        <Download className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>

                                {/* JSON */}
                                <Button
                                    variant="outline"
                                    className="w-full h-auto p-4 justify-between hover:bg-muted/50 border-muted-foreground/20"
                                    onClick={handleJSONDownload}
                                    disabled={!!downloading}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                            {downloading === 'JSON' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">Datos JSON</p>
                                            <p className="text-[10px] text-muted-foreground">Estructura completa</p>
                                        </div>
                                    </div>
                                    {downloading === 'JSON' ? (
                                        <span className="text-xs text-muted-foreground">Generando...</span>
                                    ) : (
                                        <Download className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>

                                {/* DOCX */}
                                <Button
                                    variant="outline"
                                    className="w-full h-auto p-4 justify-between hover:bg-muted/50 border-muted-foreground/20"
                                    onClick={handleDOCXDownload}
                                    disabled={!!downloading}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                            {downloading === 'DOCX' ? <Loader2 className="w-4 h-4 animate-spin" /> : <File className="w-4 h-4" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">Documento Word</p>
                                            <p className="text-[10px] text-muted-foreground">Editable en Word</p>
                                        </div>
                                    </div>
                                    {downloading === 'DOCX' ? (
                                        <span className="text-xs text-muted-foreground">Generando...</span>
                                    ) : (
                                        <Download className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>

                                {/* TXT */}
                                <Button
                                    variant="outline"
                                    className="w-full h-auto p-4 justify-between hover:bg-muted/50 border-muted-foreground/20"
                                    onClick={handleTXTDownload}
                                    disabled={!!downloading}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                                            {downloading === 'TXT' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileType className="w-4 h-4" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">Texto Plano</p>
                                            <p className="text-[10px] text-muted-foreground">Sin formato</p>
                                        </div>
                                    </div>
                                    {downloading === 'TXT' ? (
                                        <span className="text-xs text-muted-foreground">Generando...</span>
                                    ) : (
                                        <Download className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {(downloading || exportError) && (
                            <div className="rounded-xl border border-muted-foreground/20 bg-muted/40 p-4 space-y-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {downloading ? `Exportando ${downloading}...` : 'Último intento de exportación'}
                                    </span>
                                    {downloading && exportProgress > 0 && (
                                        <span className="font-medium">{exportProgress}%</span>
                                    )}
                                </div>
                                <Progress value={exportProgress} className="h-2" />
                                {exportError && (
                                    <p className="text-xs text-destructive">{exportError}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-center border-t border-border/50 pt-4">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-green-500" />
                            Guardado automáticamente en la nube
                        </p>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <LinkedinModal
                isOpen={isLinkedinOpen}
                onClose={() => setIsLinkedinOpen(false)}
                data={data}
            />

            {/* Instagram Story Dialog - Redesigned */}
            <Dialog open={isStoryOpen} onOpenChange={setIsStoryOpen}>

                <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none p-0 overflow-hidden flex items-center justify-center">
                    <VisuallyHidden.Root>
                        <DialogTitle>Vista previa de Instagram Story</DialogTitle>
                    </VisuallyHidden.Root>
                    <div ref={storyRef} className="relative w-full max-w-[340px] aspect-[9/16] bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-slate-900/50 flex flex-col">
                        {/* Avant-Garde Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-full h-2/3 bg-gradient-to-b from-emerald-500/20 via-slate-900/0 to-slate-900/0" />
                            <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[40%] bg-emerald-500/30 blur-[80px] rounded-full" />
                            <div className="absolute bottom-[-10%] left-[-20%] w-[60%] h-[40%] bg-blue-600/20 blur-[60px] rounded-full" />
                            {/* Grid texture */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_70%,transparent_100%)]" />
                        </div>

                        <div className="flex-1 flex flex-col p-8 relative z-10 h-full">
                            {/* Top Badge */}
                            <div className="flex justify-center shrink-0">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-xl shadow-black/20">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">Open to Work</span>
                                </div>
                            </div>

                            {/* Center Content - Massive Typography */}
                            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                                <div className="mb-6 relative shrink-0">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-2xl shadow-emerald-500/20 rotate-[-4deg]">
                                        <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden relative">
                                            <div className="absolute inset-0 bg-noise opacity-20" />
                                            <Briefcase className="w-8 h-8 text-emerald-400" />
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-3xl font-black text-white leading-[0.9] text-center mb-3 tracking-tighter shrink-0">
                                    {data.personalInfo.fullName.split(' ')[0]}<br />
                                    <span className="text-emerald-500">{data.personalInfo.fullName.split(' ').slice(1).join(' ')}</span>
                                </h2>

                                <div className="h-px w-10 bg-white/20 my-3 shrink-0" />

                                <p className="text-white/80 font-medium text-base text-center tracking-tight mb-4 shrink-0 line-clamp-2">
                                    {professionalTitle}
                                </p>

                                {/* Skills Pills */}
                                {data.skills.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-1.5 max-w-[280px] max-h-[100px] overflow-hidden">
                                        {data.skills.slice(0, 5).map((skill) => (
                                            <span
                                                key={skill.id}
                                                className="bg-white/5 backdrop-blur-md text-slate-300 text-[9px] font-bold px-2.5 py-1 rounded-md border border-white/10"
                                            >
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Bottom - CTA */}
                            <div className="shrink-0 space-y-4 pt-4 mt-auto">
                                <div className="p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/5 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider mb-0.5 truncate">Disponibilidad</p>
                                        <p className="text-xs text-white font-bold truncate">Inmediata / Remote</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={handleSaveStory}
                                        disabled={downloading === 'STORY'}
                                        className="w-full bg-white text-slate-950 hover:bg-emerald-50 hover:text-emerald-950 font-bold h-10 rounded-lg text-xs tracking-wide shadow-xl transition-all"
                                    >
                                        {downloading === 'STORY' ? (
                                            <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> GENERANDO...</>
                                        ) : (
                                            <>GUARDAR STORY <Download className="w-3 h-3 ml-2" /></>
                                        )}
                                    </Button>
                                    <p className="text-center text-[9px] text-white/20 font-mono tracking-[0.2em] uppercase">
                                        cv-builder.app
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-3 right-3 text-white/30 hover:text-white hover:bg-white/10 z-30 rounded-full w-8 h-8"
                            onClick={() => setIsStoryOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
