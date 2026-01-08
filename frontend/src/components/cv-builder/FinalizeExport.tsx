'use client';

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
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
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { CVData } from '@/types/cv';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { LinkedinModal } from './LinkedinModal';


interface FinalizeExportProps {
    data: CVData;
    onDownloadPDF: () => void;
}

export function FinalizeExport({ data, onDownloadPDF }: FinalizeExportProps) {
    const [isStoryOpen, setIsStoryOpen] = useState(false);
    const [isLinkedinOpen, setIsLinkedinOpen] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);
    const storyRef = useRef<HTMLDivElement>(null);

    // Exportar PNG real usando html2canvas
    const handlePNGDownload = async () => {
        setDownloading('PNG');
        try {
            // Buscar el elemento del CV preview
            const cvElement = document.querySelector('[data-cv-preview]') as HTMLElement;
            if (!cvElement) {
                // Fallback: buscar por el ref del contenido
                const fallbackElement = document.querySelector('.cv-density-standard, .cv-density-compact, .cv-density-relaxed') as HTMLElement;
                if (!fallbackElement) {
                    throw new Error('No se encontró el elemento del CV');
                }
            }

            const targetElement = (document.querySelector('[data-cv-preview]') ||
                document.querySelector('.cv-density-standard, .cv-density-compact, .cv-density-relaxed')) as HTMLElement;

            const canvas = await html2canvas(targetElement, {
                scale: 2, // Alta resolución
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: 794,
                windowHeight: 1122
            });

            const link = document.createElement('a');
            const fileName = `cv_${data.personalInfo.fullName.replace(/\s+/g, '_')}.png`;
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();

            toast.success('PNG exportado correctamente', {
                description: `Guardado como ${fileName}`
            });
        } catch (error) {
            console.error('Error al exportar PNG:', error);
            toast.error('Error al exportar PNG', {
                description: 'Intenta de nuevo o usa la exportación PDF'
            });
        } finally {
            setDownloading(null);
        }
    };

    // Exportar JSON real
    const handleJSONDownload = () => {
        setDownloading('JSON');
        try {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            const fileName = `cv_${data.personalInfo.fullName.replace(/\s+/g, '_')}.json`;
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", fileName);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            toast.success('JSON exportado correctamente', {
                description: `Guardado como ${fileName}`
            });
        } catch (error) {
            toast.error('Error al exportar JSON');
        } finally {
            setDownloading(null);
        }
    };

    // Guardar Instagram Story como imagen real
    const handleSaveStory = async () => {
        if (!storyRef.current) return;

        setDownloading('STORY');
        try {
            const canvas = await html2canvas(storyRef.current, {
                scale: 2,
                backgroundColor: null,
                logging: false
            });

            const link = document.createElement('a');
            link.download = `cv_story_${data.personalInfo.fullName.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            toast.success('Story guardada', {
                description: 'Lista para subir a Instagram'
            });
            setIsStoryOpen(false);
        } catch (error) {
            toast.error('Error al guardar Story');
        } finally {
            setDownloading(null);
        }
    };

    const handleLinkedInShare = () => {
        // En lugar de compartir URL, descargamos el PDF preventivamente y abrimos modal IA
        onDownloadPDF();
        setIsLinkedinOpen(true);
    };

    // Obtener el título profesional del usuario
    const professionalTitle = data.experience[0]?.position || 'Profesional';


    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        size="lg"
                        className="bg-slate-900 hover:bg-black text-white font-bold rounded-xl px-6 gap-2 shadow-lg"
                    >
                        Finalizar CV
                        <Rocket className="w-4 h-4" />
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
                    <DialogHeader className="space-y-3 pb-4 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                                    ¡CV Listo para despegar! 🚀
                                </DialogTitle>
                                <DialogDescription className="text-base">
                                    Comparte tu perfil profesional o descárgalo en múltiples formatos.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-6 space-y-8">
                        {/* Share Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Share2 className="w-3 h-3" /> Compartir
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {/* LinkedIn */}
                                <button
                                    onClick={handleLinkedInShare}
                                    className="
                                        flex items-center gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 
                                        hover:bg-blue-500/10 hover:border-blue-500/40 transition-all group text-left
                                    "
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                                        <Linkedin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">LinkedIn</p>
                                        <p className="text-[10px] text-muted-foreground">Compartir perfil</p>
                                    </div>
                                </button>

                                {/* Instagram */}
                                <button
                                    onClick={() => setIsStoryOpen(true)}
                                    className="
                                        flex items-center gap-3 p-4 rounded-xl border border-pink-500/20 bg-pink-500/5 
                                        hover:bg-pink-500/10 hover:border-pink-500/40 transition-all group text-left
                                    "
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                                        <Instagram className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground group-hover:text-pink-500 transition-colors">Instagram</p>
                                        <p className="text-[10px] text-muted-foreground">Story Mode</p>
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
                                    onClick={onDownloadPDF}
                                    disabled={!!downloading}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">Documento PDF</p>
                                            <p className="text-[10px] text-muted-foreground">Formato estándar ATS</p>
                                        </div>
                                    </div>
                                    <Download className="w-4 h-4 text-muted-foreground" />
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
                                            <p className="text-[10px] text-muted-foreground">Estructura raw</p>
                                        </div>
                                    </div>
                                    {downloading === 'JSON' ? (
                                        <span className="text-xs text-muted-foreground">Generando...</span>
                                    ) : (
                                        <Download className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>
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

            {/* Instagram Story Dialog */}
            <Dialog open={isStoryOpen} onOpenChange={setIsStoryOpen}>

                <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none p-0 overflow-hidden flex items-center justify-center">
                    <VisuallyHidden.Root>
                        <DialogTitle>Vista previa de Instagram Story</DialogTitle>
                    </VisuallyHidden.Root>
                    <div ref={storyRef} className="relative w-full max-w-[320px] aspect-[9/16] bg-gradient-to-b from-blue-600 to-indigo-900 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/20">
                        <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 rounded-full bg-white mb-6 flex items-center justify-center shadow-lg">
                                <span className="text-4xl">🚀</span>
                            </div>
                            <h2 className="text-3xl font-black text-white italic mb-2 tracking-tighter uppercase transform -rotate-2">
                                HIRE ME!
                            </h2>
                            <div className="w-12 h-1 bg-white mb-6 rounded-full opacity-50"></div>
                            <p className="text-white font-bold text-xl mb-1">{data.personalInfo.fullName || "Tu Nombre"}</p>
                            <p className="text-blue-200 text-sm mb-4">{professionalTitle}</p>
                            {data.skills.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-[240px]">
                                    {data.skills.slice(0, 3).map((skill) => (
                                        <span key={skill.id} className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs border border-white/30 font-medium tracking-wide">
                                cv-convos.ai/share
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10"
                            onClick={() => setIsStoryOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </Button>

                        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                            <Button
                                onClick={handleSaveStory}
                                disabled={downloading === 'STORY'}
                                className="bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-full px-8 shadow-xl"
                            >
                                {downloading === 'STORY' ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando...</>
                                ) : (
                                    'Guardar Story'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
