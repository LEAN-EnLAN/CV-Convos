'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import { Editor } from './Editor';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { HarvardTemplate } from './templates/HarvardTemplate';
import { SwissTemplate } from './templates/SwissTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { TechTemplate } from './templates/TechTemplate';

import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { useCVHistory } from '@/hooks/use-cv-history';
import {
    Layout, RotateCcw, RotateCw, Printer, ChevronDown,
    Palette, FileText, Sparkles, Eye, PenLine,
    Download, Share2, Settings2, Maximize2, Minimize2,
    Undo2, Redo2, GraduationCap, Terminal
} from 'lucide-react';
import { FinalizeExport } from './FinalizeExport';
import { TemplateConfigurator } from './TemplateConfigurator';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface BuilderProps {
    initialData: CVData;
    onReset: () => void;
}

const templateOptions = [
    {
        id: 'professional' as CVTemplate,
        name: 'Profesional',
        description: 'Diseño clásico y elegante',
        icon: FileText
    },
    {
        id: 'modern' as CVTemplate,
        name: 'Moderno',
        description: 'Con sidebar lateral',
        icon: Layout
    },
    {
        id: 'harvard',
        name: 'Harvard',
        description: 'Estilo Ivy League, ATS-Optimized',
        icon: GraduationCap
    },
    {
        id: 'swiss',
        name: 'Swiss',
        description: 'Diseño minimalista y audaz',
        icon: Layout
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'Estilo editorial y audaz',
        icon: Sparkles
    },
    {
        id: 'tech',
        name: 'Tech',
        description: 'Optimizado para desarrolladores',
        icon: Terminal
    },

];

// Density is now handled entirely within TemplateConfigurator and globals.css classes

export function Builder({ initialData, onReset }: BuilderProps) {
    const { state: data, set: setData, undo, redo, canUndo, canRedo } = useCVHistory<CVData>({
        ...initialData,
        config: initialData.config || DEFAULT_CONFIG
    });
    const [template, setTemplate] = useState<CVTemplate>('modern');
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
                <header className="h-16 border-b bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 no-print">
                    {/* Left: Logo & Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-sm font-bold text-primary-foreground">CV</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-bold tracking-tight">CV-ConVos</h1>
                            <p className="text-xs text-muted-foreground">Editor de CV</p>
                        </div>
                    </div>

                    {/* Center: View Toggle (Mobile) */}
                    <div className="sm:hidden">
                        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'editor' | 'preview')}>
                            <TabsList className="h-9">
                                <TabsTrigger value="editor" className="gap-1.5 text-xs">
                                    <PenLine className="w-3.5 h-3.5" />
                                    Editar
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="gap-1.5 text-xs">
                                    <Eye className="w-3.5 h-3.5" />
                                    Vista
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        {/* Template Selector */}
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                                            <Palette className="w-4 h-4" />
                                            <span className="hidden md:inline">Plantilla:</span>
                                            <span className="font-semibold">{currentTemplate?.name}</span>
                                            <ChevronDown className="w-3 h-3 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Cambiar plantilla</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Elegí una plantilla</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {templateOptions.map((opt) => (
                                    <DropdownMenuItem
                                        key={opt.id}
                                        onClick={() => setTemplate(opt.id as CVTemplate)}
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${template === opt.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                            }`}>
                                            <opt.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{opt.name}</span>
                                                {template === opt.id && (
                                                    <Badge variant="secondary" className="text-xs">Activa</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{opt.description}</p>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem disabled className="text-muted-foreground">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Más plantillas próximamente
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile Template Button */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className="sm:hidden">
                                <Button variant="outline" size="icon">
                                    <Palette className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {templateOptions.map((opt) => (
                                    <DropdownMenuItem
                                        key={opt.id}
                                        onClick={() => setTemplate(opt.id as CVTemplate)}
                                    >
                                        {opt.name}
                                        {template === opt.id && ' ✓'}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="w-px h-6 bg-border hidden sm:block" />

                        {/* Reset Button */}
                        <Dialog>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Empezar de nuevo</TooltipContent>
                            </Tooltip>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>¿Empezar de nuevo?</DialogTitle>
                                    <DialogDescription>
                                        Se perderán todos los cambios que hayas hecho en tu CV.
                                        Esta acción no se puede deshacer.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex gap-3 justify-end mt-4">
                                    <Button variant="outline">Cancelar</Button>
                                    <Button variant="destructive" onClick={onReset}>
                                        Sí, empezar de nuevo
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Settings2 className="w-4 h-4" />
                                            <span className="hidden lg:inline">Ajustes</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Configuración Visual</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end" className="w-80 p-4 max-h-[80vh] overflow-y-auto">
                                <DropdownMenuLabel>Control Total del Diseño</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <TemplateConfigurator
                                    config={data.config!}
                                    onChange={(config) => setData({ ...data, config })}
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <FinalizeExport data={data} onDownloadPDF={handlePrint} />
                    </div>
                </header>

                {/* Main Workspace */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Side: Editor - Hidden on mobile when preview is active */}
                    <div className={`
                        w-full sm:w-[420px] lg:w-[480px] border-r bg-card shrink-0 
                        ${activeView === 'preview' ? 'hidden sm:block' : 'block'}
                    `}>
                        <Editor
                            data={data}
                            onChange={setData}
                            undo={undo}
                            redo={redo}
                            canUndo={canUndo}
                            canRedo={canRedo}
                        />
                    </div>

                    {/* Right Side: Preview - Hidden on mobile when editor is active */}
                    <div
                        ref={previewContainerRef}
                        className={`
                            flex-1 bg-muted/30 overflow-auto p-4 sm:p-8 lg:p-12 scrollbar-thin
                            ${activeView === 'editor' ? 'hidden sm:block' : 'block'}
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
                                    ) : template === 'swiss' ? (
                                        <SwissTemplate data={data} />
                                    ) : template === 'creative' ? (
                                        <CreativeTemplate data={data} />
                                    ) : template === 'tech' ? (
                                        <TechTemplate data={data} />
                                    ) : (
                                        <ModernTemplate data={data} />
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
