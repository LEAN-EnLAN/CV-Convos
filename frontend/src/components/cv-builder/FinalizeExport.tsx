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
    File,
    FileType,
    ClipboardCheck,
    PenLine,
    Copy,
    ArrowLeft,
    ArrowRight
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
import { toast } from 'sonner';
import { CVData } from '@/types/cv';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { LinkedinModal } from './LinkedinModal';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';


interface FinalizeExportProps {
    data: CVData;
    onDownloadPDF: () => void;
    onEdit: () => void;
}

export function FinalizeExport({ data, onDownloadPDF, onEdit }: FinalizeExportProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isStoryOpen, setIsStoryOpen] = useState(false);
    const [isLinkedinOpen, setIsLinkedinOpen] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [activePanel, setActivePanel] = useState<'summary' | 'actions'>('summary');
    const storyRef = useRef<HTMLDivElement>(null);

    // Cambiar a resumen cuando el usuario exporta o finaliza
    const showSummaryPanel = () => {
        setActivePanel('summary');
    };

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (open) {
            setActivePanel('summary');
        }
    };

    const handleEditClick = () => {
        onEdit();
        setIsDialogOpen(false);
    };

    // Exportar PNG real usando html-to-image
    const handlePNGDownload = async () => {
        setDownloading('PNG');
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
            showSummaryPanel();
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
            showSummaryPanel();
        } catch (error) {
            toast.error('Error al exportar JSON');
        } finally {
            setDownloading(null);
        }
    };

    // Exportar DOCX real
    const handleDOCXDownload = async () => {
        setDownloading('DOCX');
        try {
            const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');

            const sections: Paragraph[] = [];

            // Header con nombre
            sections.push(
                new Paragraph({
                    text: data.personalInfo.fullName || 'Sin nombre',
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                })
            );

            // Información de contacto
            const contactInfo = [];
            if (data.personalInfo.email) contactInfo.push(data.personalInfo.email);
            if (data.personalInfo.phone) contactInfo.push(data.personalInfo.phone);
            if (data.personalInfo.location) contactInfo.push(data.personalInfo.location);

            if (contactInfo.length > 0) {
                sections.push(
                    new Paragraph({
                        text: contactInfo.join(' | '),
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    })
                );
            }

            // Links
            if (data.personalInfo.linkedin || data.personalInfo.github) {
                const links = [];
                if (data.personalInfo.linkedin) links.push(`LinkedIn: ${data.personalInfo.linkedin}`);
                if (data.personalInfo.github) links.push(`GitHub: ${data.personalInfo.github}`);
                sections.push(
                    new Paragraph({
                        text: links.join(' | '),
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    })
                );
            }

            // Resumen profesional
            if (data.personalInfo.summary) {
                sections.push(
                    new Paragraph({
                        text: 'PERFIL PROFESIONAL',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 }
                    })
                );
                sections.push(
                    new Paragraph({
                        children: [new TextRun(data.personalInfo.summary)],
                        spacing: { after: 400 }
                    })
                );
            }

            // Experiencia
            if (data.experience.length > 0) {
                sections.push(
                    new Paragraph({
                        text: 'EXPERIENCIA LABORAL',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 }
                    })
                );

                for (const exp of data.experience) {
                    const title = exp.position || 'Sin título';
                    const company = exp.company ? ` en ${exp.company}` : '';
                    const period = [];
                    if (exp.startDate) period.push(exp.startDate);
                    if (exp.current) period.push('Presente');
                    else if (exp.endDate) period.push(exp.endDate);

                    sections.push(
                        new Paragraph({
                            text: title + company,
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: 200, after: 100 }
                        })
                    );

                    if (period.length > 0) {
                        sections.push(
                            new Paragraph({
                                text: period.join(' - '),
                                spacing: { after: 100 }
                            })
                        );
                    }

                    if (exp.description) {
                        sections.push(
                            new Paragraph({
                                children: [new TextRun(exp.description)],
                                spacing: { after: 200 }
                            })
                        );
                    }
                }
            }

            // Educación
            if (data.education.length > 0) {
                sections.push(
                    new Paragraph({
                        text: 'EDUCACIÓN',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 }
                    })
                );

                for (const edu of data.education) {
                    const title = edu.degree || edu.institution || 'Sin título';
                    const institution = edu.institution && !edu.degree ? '' : edu.institution || '';
                    const year = edu.endDate ? `(${edu.endDate})` : '';

                    sections.push(
                        new Paragraph({
                            text: `${title} ${year}`,
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: 200, after: 100 }
                        })
                    );

                    if (institution) {
                        sections.push(
                            new Paragraph({
                                text: institution,
                                spacing: { after: 200 }
                            })
                        );
                    }
                }
            }

            // Skills
            if (data.skills.length > 0) {
                sections.push(
                    new Paragraph({
                        text: 'HABILIDADES',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 }
                    })
                );

                const skillsText = data.skills.map(s => s.name).join(' • ');
                sections.push(
                    new Paragraph({
                        text: skillsText,
                        spacing: { after: 200 }
                    })
                );
            }

            // Proyectos
            if (data.projects.length > 0) {
                sections.push(
                    new Paragraph({
                        text: 'PROYECTOS',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 }
                    })
                );

                for (const proj of data.projects) {
                    sections.push(
                        new Paragraph({
                            text: proj.name || 'Sin título',
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: 200, after: 100 }
                        })
                    );

                    if (proj.description) {
                        sections.push(
                            new Paragraph({
                                children: [new TextRun(proj.description)],
                                spacing: { after: 200 }
                            })
                        );
                    }
                }
            }

            // Idiomas
            if (data.languages.length > 0) {
                sections.push(
                    new Paragraph({
                        text: 'IDIOMAS',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 }
                    })
                );

                const langsText = data.languages.map(l => `${l.language || 'Sin nombre'}${l.fluency ? ` (${l.fluency})` : ''}`).join(' • ');
                sections.push(
                    new Paragraph({
                        text: langsText,
                        spacing: { after: 200 }
                    })
                );
            }

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: sections
                }]
            });

            const blob = await Packer.toBlob(doc);
            const fileName = `cv_${data.personalInfo.fullName.replace(/\s+/g, '_')}.docx`;
            saveAs(blob, fileName);

            toast.success('DOCX exportado correctamente', {
                description: `Guardado como ${fileName}`
            });
            showSummaryPanel();
        } catch (error) {
            console.error('Error al exportar DOCX:', error);
            toast.error('Error al exportar DOCX', {
                description: 'Intenta de nuevo o usa otro formato'
            });
        } finally {
            setDownloading(null);
        }
    };

    // Exportar TXT real
    const handleTXTDownload = () => {
        setDownloading('TXT');
        try {
            let content = '';

            // Header
            content += `${data.personalInfo.fullName || 'SIN NOMBRE'}\n`;
            content += `${'='.repeat(50)}\n\n`;

            // Contacto
            const contactInfo = [];
            if (data.personalInfo.email) contactInfo.push(data.personalInfo.email);
            if (data.personalInfo.phone) contactInfo.push(data.personalInfo.phone);
            if (data.personalInfo.location) contactInfo.push(data.personalInfo.location);
            if (contactInfo.length > 0) {
                content += contactInfo.join(' | ') + '\n\n';
            }

            // Links
            if (data.personalInfo.linkedin || data.personalInfo.github) {
                if (data.personalInfo.linkedin) content += `LinkedIn: ${data.personalInfo.linkedin}\n`;
                if (data.personalInfo.github) content += `GitHub: ${data.personalInfo.github}\n`;
                content += '\n';
            }

            // Resumen
            if (data.personalInfo.summary) {
                content += `PERFIL PROFESIONAL\n${'-'.repeat(30)}\n${data.personalInfo.summary}\n\n`;
            }

            // Experiencia
            if (data.experience.length > 0) {
                content += `EXPERIENCIA LABORAL\n${'-'.repeat(30)}\n\n`;
                for (const exp of data.experience) {
                    content += `${exp.position || 'Sin título'}\n`;
                    if (exp.company) content += `  ${exp.company}\n`;
                    const period = [];
                    if (exp.startDate) period.push(exp.startDate);
                    if (exp.current) period.push('Presente');
                    else if (exp.endDate) period.push(exp.endDate);
                    if (period.length > 0) content += `  ${period.join(' - ')}\n`;
                    if (exp.description) content += `\n  ${exp.description}\n`;
                    content += '\n';
                }
            }

            // Educación
            if (data.education.length > 0) {
                content += `EDUCACION\n${'-'.repeat(30)}\n\n`;
                for (const edu of data.education) {
                    content += `${edu.degree || edu.institution || 'Sin título'}\n`;
                    if (edu.institution) content += `  ${edu.institution}\n`;
                    if (edu.endDate) content += `  ${edu.endDate}\n`;
                    content += '\n';
                }
            }

            // Skills
            if (data.skills.length > 0) {
                content += `HABILIDADES\n${'-'.repeat(30)}\n`;
                content += data.skills.map(s => s.name).join(' • ') + '\n\n';
            }

            // Proyectos
            if (data.projects.length > 0) {
                content += `PROYECTOS\n${'-'.repeat(30)}\n\n`;
                for (const proj of data.projects) {
                    content += `${proj.name || 'Sin título'}\n`;
                    if (proj.description) content += `  ${proj.description}\n`;
                    content += '\n';
                }
            }

            // Idiomas
            if (data.languages.length > 0) {
                content += `IDIOMAS\n${'-'.repeat(30)}\n`;
                content += data.languages.map(l => `${l.language}${l.fluency ? ` (${l.fluency})` : ''}`).join(' • ') + '\n';
            }

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const fileName = `cv_${data.personalInfo.fullName.replace(/\s+/g, '_')}.txt`;
            saveAs(blob, fileName);

            toast.success('TXT exportado correctamente', {
                description: `Guardado como ${fileName}`
            });
            showSummaryPanel();
        } catch (error) {
            toast.error('Error al exportar TXT');
        } finally {
            setDownloading(null);
        }
    };

    // Guardar Instagram Story como imagen real
    const handleSaveStory = async () => {
        if (!storyRef.current) return;

        setDownloading('STORY');
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
            setIsStoryOpen(false);
            showSummaryPanel();
        } catch (error) {
            console.error('Error al guardar Story:', error);
            toast.error('Error al guardar Story');
        } finally {
            setDownloading(null);
        }
    };

    const handleLinkedInShare = () => {
        // En lugar de compartir URL, descargamos el PDF preventivamente y abrimos modal IA
        onDownloadPDF();
        showSummaryPanel();
        setIsLinkedinOpen(true);
    };

    // Obtener el título profesional del usuario
    const professionalTitle = data.experience[0]?.position || data.personalInfo.role || 'Profesional';


    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
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
                                    {activePanel === 'summary' ? 'Resumen final' : '¡CV Listo! 🚀'}
                                </DialogTitle>
                                <DialogDescription className="text-sm">
                                    {activePanel === 'summary'
                                        ? 'Checklist final y próximos pasos recomendados'
                                        : 'Compartí o descargá en múltiples formatos'}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {activePanel === 'summary' ? (
                        <div className="py-6 space-y-6">
                            {/* Tips finales */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Tips rápidos
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
                                        <div className="mt-0.5 text-primary">
                                            <ClipboardCheck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Personalizá según la oferta</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Ajustá logros, palabras clave y el resumen para cada rol.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
                                        <div className="mt-0.5 text-primary">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Sumá una carta de presentación</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Presentá tu motivación y conectá tu experiencia con el puesto.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
                                        <div className="mt-0.5 text-primary">
                                            <Linkedin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Actualizá LinkedIn en sync</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Replicá logros y skills para coherencia en todo tu perfil.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Checklist */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Check className="w-3 h-3" /> Checklist antes de enviar
                                </h4>
                                <div className="space-y-2 text-sm">
                                    {[
                                        'Datos de contacto correctos y visibles.',
                                        'Logros con métricas concretas (%, $ o impacto).',
                                        'Formato listo para ATS y sin faltas.'
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2">
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Acciones rápidas */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <PenLine className="w-3 h-3" /> Acciones rápidas
                                </h4>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Button variant="outline" className="justify-start gap-2" onClick={handleEditClick}>
                                        <PenLine className="w-4 h-4" />
                                        Editar CV
                                    </Button>
                                    <Button variant="outline" className="justify-start gap-2" onClick={handleJSONDownload}>
                                        <Copy className="w-4 h-4" />
                                        Duplicar CV (JSON)
                                    </Button>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-center gap-2 text-xs"
                                    onClick={() => setActivePanel('actions')}
                                >
                                    Ver opciones de exportación <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 space-y-8">
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
                        </div>
                    )}

                    <DialogFooter className="sm:justify-center border-t border-border/50 pt-4">
                        <div className="flex flex-col items-center gap-2">
                            {activePanel === 'actions' && (
                                <Button
                                    variant="ghost"
                                    className="h-8 text-xs gap-2"
                                    onClick={() => setActivePanel('summary')}
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Volver al resumen
                                </Button>
                            )}
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-green-500" />
                                Guardado automáticamente en la nube
                            </p>
                        </div>
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
