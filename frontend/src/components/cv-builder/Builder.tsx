'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import { Editor } from './Editor';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { HarvardTemplate } from './templates/HarvardTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { TechTemplate } from './templates/TechTemplate';
import { BianTemplate } from './templates/BianTemplate';

import { useReactToPrint } from 'react-to-print';
import { useCVHistory } from '@/hooks/use-cv-history';
import { Eye } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Header, templateOptions } from './header/Header';

interface BuilderProps {
    initialData: CVData;
    onReset: () => void;
}



// Density is now handled entirely within TemplateConfigurator and globals.css classes

export function Builder({ initialData, onReset }: BuilderProps) {
    const { state: data, set: setData, undo, redo, canUndo, canRedo } = useCVHistory<CVData>({
        ...initialData,
        config: initialData.config || DEFAULT_CONFIG
    });
    const [template, setTemplate] = useState<CVTemplate>('creative');
    const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');
    const [scale, setScale] = useState(1);
    const [pages, setPages] = useState(1);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // React to Print logic
    const handlePrint = useReactToPrint({
        contentRef,
        documentTitle: `CV_${data.personalInfo.fullName.replace(/\s+/g, '_') || 'Curriculum'}`,
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
                const pageHeight = 1122; // A4 height in pixels
                setPages(Math.ceil(height / pageHeight));
            }
        };

        const timer = setTimeout(updatePages, 500); // Debounce
        return () => clearTimeout(timer);
    }, [data, template]);

    const currentTemplate = templateOptions.find(t => t.id === template);

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen overflow-hidden bg-background">
                {/* Topbar */}
                <Header
                    data={data}
                    setData={setData}
                    template={template}
                    setTemplate={setTemplate}
                    onReset={onReset}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    onDownloadPDF={handlePrint}
                />

                {/* Main Workspace */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Side: Editor - Hidden on mobile when preview is active */}
                    <div className={`
                        w-full sm:w-[420px] lg:w-[480px] border-r bg-card shrink-0 
                        ${activeView === 'preview' ? 'hidden sm:block' : 'block'}
                        print:hidden
                    `}>
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

                    {/* Right Side: Preview - Hidden on mobile when editor is active */}
                    <div
                        ref={previewContainerRef}
                        className={`
                            flex-1 bg-muted/30 overflow-auto p-4 sm:p-8 lg:p-12 scrollbar-thin
                            ${activeView === 'editor' ? 'hidden sm:block' : 'block'}
                            print:block print:w-full print:h-auto print:overflow-visible print:p-0 print:m-0
                        `}
                    >
                        <div className="max-w-fit mx-auto">
                            {/* Preview Header */}
                            <div className="mb-6 flex items-center justify-between no-print max-w-[794px] mx-auto">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Preview de Impresión</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-mono opacity-60">
                                        A4 • 210 x 297 mm
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase opacity-50">Escala: {Math.round(scale * 100)}%</span>
                                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-none">
                                        {currentTemplate?.name}
                                    </Badge>
                                </div>
                            </div>

                            {/* CV Preview with Scaling - Wrapping in a div for scaling and another for printing */}
                            <div
                                className="origin-top transition-transform duration-300 ease-out relative"
                                style={{ transform: `scale(${scale})`, width: '794px' }}
                            >
                                {/* Visual Page Breaks */}
                                <div className="absolute inset-0 pointer-events-none no-print">
                                    {Array.from({ length: pages - 1 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute left-0 right-0 border-b-2 border-dashed border-primary/30 flex items-center justify-center"
                                            style={{ top: `${(i + 1) * 1122}px` }}
                                        >
                                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full mt-[-10px] backdrop-blur-sm">
                                                CORTE DE PÁGINA {i + 1}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    ref={contentRef}
                                    data-cv-preview
                                    className={`bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] print:shadow-none overflow-hidden cv-density-${data.config?.layout.density || 'standard'}`}
                                >
                                    {template === 'professional' ? (
                                        <ProfessionalTemplate data={data} />
                                    ) : template === 'harvard' ? (
                                        <HarvardTemplate data={data} />
                                    ) : template === 'minimal' ? (
                                        <MinimalTemplate data={data} />
                                    ) : template === 'tech' ? (
                                        <TechTemplate data={data} />
                                    ) : template === 'bian' ? (
                                        <BianTemplate data={data} />
                                    ) : (
                                        <CreativeTemplate data={data} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Styles */}
                <style jsx global>{`
                    @media print {
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: white !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}</style>
            </div>
        </TooltipProvider>
    );
}
