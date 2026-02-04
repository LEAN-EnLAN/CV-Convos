'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CVData, CVTemplate, TemplateConfig } from '@/types/cv';
import { Editor } from './Editor';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { HarvardTemplate } from './templates/HarvardTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { PureTemplate } from './templates/PureTemplate';
import { TerminalTemplate } from './templates/TerminalTemplate';
import { CareTemplate } from './templates/CareTemplate';
import { CapitalTemplate } from './templates/CapitalTemplate';
import { ScholarTemplate } from './templates/ScholarTemplate';

import { useReactToPrint } from 'react-to-print';
import { useCVHistory } from '@/hooks/use-cv-history';
import { Eye } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header, templateOptions } from './header/Header';
import { cn } from '@/lib/utils';
import { useAutoSave } from '@/hooks/use-auto-save';
import { FloatingProgress } from './FloatingProgress';
import { TEMPLATE_FONT_PRESETS, getTemplateFontPreset } from '@/lib/cv-templates/template-fonts';

interface BuilderProps {
    initialData: CVData;
    onReset: () => void;
    initialTemplate?: CVTemplate;
}

function calculateCVProgress(data: CVData): { percentage: number; sections: { name: string; completed: boolean; progress: number }[] } {
    const sections = [
        {
            name: 'Información Personal',
            check: () => {
                const p = data.personalInfo;
                let filled = 0;
                const total = 5;
                if (p.fullName) filled++;
                if (p.email) filled++;
                if (p.phone) filled++;
                if (p.location) filled++;
                if (p.linkedin || p.github) filled++;
                return { completed: filled >= 4, progress: (filled / total) * 100 };
            }
        },
        {
            name: 'Resumen',
            check: () => {
                const summary = data.personalInfo.summary?.trim();
                if (!summary) return { completed: false, progress: 0 };
                if (summary.length < 50) return { completed: false, progress: 50 };
                if (summary.length < 150) return { completed: true, progress: 75 };
                return { completed: true, progress: 100 };
            }
        },
        {
            name: 'Experiencia',
            check: () => {
                if (data.experience.length === 0) return { completed: false, progress: 0 };
                const validExp = data.experience.filter(e =>
                    e.company && e.position && e.startDate &&
                    (e.current || e.endDate)
                );
                const progress = Math.min((validExp.length / Math.max(data.experience.length, 1)) * 100, 100);
                return { completed: validExp.length >= 1, progress };
            }
        },
        {
            name: 'Educación',
            check: () => {
                if (data.education.length === 0) return { completed: false, progress: 0 };
                return { completed: true, progress: 100 };
            }
        },
        {
            name: 'Skills',
            check: () => {
                if (data.skills.length === 0) return { completed: false, progress: 0 };
                if (data.skills.length < 3) return { completed: false, progress: 50 };
                if (data.skills.length < 8) return { completed: true, progress: 75 };
                return { completed: true, progress: 100 };
            }
        },
        {
            name: 'Proyectos',
            check: () => {
                if (data.projects.length === 0) return { completed: true, progress: 0 };
                const validProjects = data.projects.filter(p => p.name && p.description);
                const progress = (validProjects.length / data.projects.length) * 100;
                return { completed: true, progress };
            }
        },
        {
            name: 'Idiomas',
            check: () => {
                if (data.languages.length === 0) return { completed: true, progress: 0 };
                return { completed: true, progress: 100 };
            }
        }
    ];

    const results = sections.map(s => {
        const result = s.check();
        return { name: s.name, ...result };
    });

    const avgProgress = results.reduce((acc, r) => acc + r.progress, 0) / results.length;

    return { percentage: Math.round(avgProgress), sections: results };
}

// Density is now handled entirely within TemplateConfigurator and globals.css classes

export function Builder({ initialData, onReset, initialTemplate }: BuilderProps) {
    const { state: data, set: setData, undo, redo, canUndo, canRedo } = useCVHistory<CVData>({
        ...initialData,
        config: initialData.config || DEFAULT_CONFIG
    });
    const [template, setTemplate] = useState<CVTemplate>(initialTemplate || 'creative');
    const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');
    const [scale, setScale] = useState(1);
    const [pages, setPages] = useState(1);
    const [printScale, setPrintScale] = useState(1);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const templateFontsRef = useRef<Record<CVTemplate, TemplateConfig['fonts']>>({
        ...TEMPLATE_FONT_PRESETS
    });
    const initialFontsAppliedRef = useRef(false);

    // React to Print logic
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'CV_' + (data.personalInfo.fullName.replace(/\s+/g, '_') || 'Curriculum'),
    });

    // Handle Scaling for A4 Preview
    useEffect(() => {
        const handleResize = () => {
            if (previewContainerRef.current) {
                const containerWidth = previewContainerRef.current.offsetWidth - 64; // Padding
                const paperWidth = 794; // Fixed A4 width at 96dpi
                const newScale = Math.min(containerWidth / paperWidth, 1);
                setScale(newScale);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeView]);

    // Track Height for Page Breaks
    useEffect(() => {
        const updatePages = () => {
            if (contentRef.current) {
                const height = contentRef.current.offsetHeight;
                if (!height) return;
                const pageHeight = 1122; // A4 height in pixels
                setPages(Math.ceil(height / pageHeight));
                setPrintScale(height > pageHeight ? pageHeight / height : 1);
            }
        };

        const timer = setTimeout(updatePages, 500); // Debounce
        return () => clearTimeout(timer);
    }, [data, template]);

    // Mantener fuentes por plantilla y aplicar preset inicial si no hay personalizacion previa
    useEffect(() => {
        if (!data.config?.fonts) return;
        templateFontsRef.current[template] = { ...data.config.fonts };
    }, [data.config?.fonts, template]);

    useEffect(() => {
        if (initialFontsAppliedRef.current) return;
        const currentFonts = data.config?.fonts;
        if (!currentFonts) return;
        const isDefaultFonts =
            currentFonts.heading === DEFAULT_CONFIG.fonts.heading &&
            currentFonts.body === DEFAULT_CONFIG.fonts.body;
        if (isDefaultFonts) {
            const presetFonts = { ...getTemplateFontPreset(template) };
            setData({
                ...data,
                config: {
                    ...data.config,
                    fonts: presetFonts
                }
            });
        }
        initialFontsAppliedRef.current = true;
    }, [data, template, setData]);

    const handleTemplateChange = (nextTemplate: CVTemplate) => {
        if (nextTemplate === template) return;
        const nextFonts = {
            ...(templateFontsRef.current[nextTemplate] || getTemplateFontPreset(nextTemplate))
        };
        setTemplate(nextTemplate);
        setData({
            ...data,
            config: {
                ...data.config,
                fonts: nextFonts
            }
        });
    };

    const currentTemplate = templateOptions.find(t => t.id === template);
    const progress = useMemo(() => calculateCVProgress(data), [data]);

    // Auto-save hook
    const { isSaving, lastSaved } = useAutoSave(data);

    // Get the appropriate template component
    const TemplateComponent = useMemo(() => {
        const templates: Record<string, React.ComponentType<{ data: CVData }>> = {
            professional: ProfessionalTemplate,
            harvard: HarvardTemplate,
            creative: CreativeTemplate,
            pure: PureTemplate,
            terminal: TerminalTemplate,
            care: CareTemplate,
            capital: CapitalTemplate,
            scholar: ScholarTemplate,
        };
        return templates[template] || CreativeTemplate;
    }, [template]);

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen overflow-hidden bg-background">
                <FloatingProgress
                    percentage={progress.percentage}
                    sections={progress.sections}
                    isSaving={isSaving}
                    lastSaved={lastSaved}
                />

                {/* Topbar */}
                <Header
                    data={data}
                    setData={setData}
                    template={template}
                    setTemplate={handleTemplateChange}
                    onReset={onReset}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    onDownloadPDF={handlePrint}
                />

                {/* Main Workspace */}
                <div className="flex flex-1 overflow-hidden">
                    <div className={cn(
                        "w-full sm:w-[420px] lg:w-[480px] border-r bg-card shrink-0",
                        activeView === 'preview' && "hidden sm:block",
                        "print:hidden"
                    )}>
                        <Editor
                            data={data}
                            onChange={setData}
                            undo={undo}
                            redo={redo}
                            canUndo={canUndo}
                            canRedo={canRedo}
                            onFinalize={handlePrint}
                        />
                    </div>

                    <div
                        ref={previewContainerRef}
                        className={cn(
                            "flex-1 bg-muted/30 overflow-auto p-4 sm:p-8 lg:p-12 scrollbar-thin",
                            activeView === 'editor' && "hidden sm:block",
                            "print:block print:w-full print:h-auto print:overflow-visible print:p-0 print:m-0"
                        )}
                    >
                        <div className="max-w-fit mx-auto">
                            {/* Preview Header */}
                            <div className="mb-6 flex items-center justify-between no-print max-w-[794px] mx-auto">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Preview de Impresión</span>
                                    </div>
                                    <div className="text-[10px] font-mono opacity-60 border px-2 py-0.5 rounded">
                                        A4 • 210 x 297 mm
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase opacity-50">Escala: {Math.round(scale * 100)}%</span>
                                    <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                                        {currentTemplate?.name}
                                    </div>
                                </div>
                            </div>

                            {/* CV Preview with Scaling */}
                            <div
                                className="origin-top transition-transform duration-300 ease-out relative"
                                style={{ transform: 'scale(' + scale + ')', width: '794px' }}
                            >
                                {/* Visual Page Breaks */}
                                <div className="absolute inset-0 pointer-events-none no-print">
                                    {pages > 1 && <div className="cv-page-break-overlay" />}
                                    {Array.from({ length: pages - 1 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute left-0 right-0 border-b-2 border-dashed border-primary/30 flex items-center justify-center"
                                            style={{ top: ((i + 1) * 1122) + 'px' }}
                                        >
                                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full mt-[-10px] backdrop-blur-sm">
                                                CORTE DE PÁGINA {i + 1}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    ref={printRef}
                                    className="cv-print-frame"
                                    style={{ '--cv-print-scale': printScale } as React.CSSProperties}
                                >
                                    <div
                                        ref={contentRef}
                                        data-cv-preview
                                        className={cn(
                                            "cv-print-content bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] print:shadow-none",
                                            "cv-density-" + (data.config?.layout.density || 'standard')
                                        )}
                                        style={{ minHeight: '1122px' }}
                                    >
                                        <TemplateComponent data={data} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
