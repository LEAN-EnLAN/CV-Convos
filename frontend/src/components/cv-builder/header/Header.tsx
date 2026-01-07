import React from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import { Button } from '@/components/ui/button';
import {
    Layout, RotateCcw,
    Palette, FileText, Sparkles, Eye, PenLine,
    Settings2, GraduationCap, Terminal, Menu, ChevronDown, Check
} from 'lucide-react';
import { FinalizeExport } from '../FinalizeExport';
import { TemplateConfigurator } from '../TemplateConfigurator';
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
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export const templateOptions = [
    {
        id: 'professional',
        name: 'Professional',
        description: 'Diseño clásico y elegante',
        icon: FileText
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'Estilo editorial y audaz',
        icon: Sparkles
    },
    {
        id: 'harvard',
        name: 'Harvard',
        description: 'Estilo Ivy League, ATS-Optimized',
        icon: GraduationCap
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Diseño limpio y estructurado',
        icon: Layout
    },
    {
        id: 'tech',
        name: 'Tech',
        description: 'Optimizado para desarrolladores',
        icon: Terminal
    },
    {
        id: 'bian',
        name: 'Bian',
        description: 'Factual, académico y directo',
        icon: FileText
    }
];

interface HeaderProps {
    data: CVData;
    setData: (data: CVData) => void;
    template: CVTemplate;
    setTemplate: (page: CVTemplate) => void;
    onReset: () => void;
    activeView: 'editor' | 'preview';
    setActiveView: (view: 'editor' | 'preview') => void;
    onDownloadPDF: () => void;
}

export function Header({
    data,
    setData,
    template,
    setTemplate,
    onReset,
    activeView,
    setActiveView,
    onDownloadPDF
}: HeaderProps) {
    const currentTemplate = templateOptions.find(t => t.id === template);

    return (
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

            {/* Center: View Toggle (Mobile only) */}
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
                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center gap-2">
                    {/* Template Selector */}
                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
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
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-px h-6 bg-border" />

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

                    {/* Settings */}
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
                </div>

                {/* Finalize Button - Visible on both but smaller on mobile maybe? kept same size for prominence */}
                <FinalizeExport data={data} onDownloadPDF={onDownloadPDF} />

                {/* Mobile Menu Trigger */}
                <div className="sm:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[85vw] sm:w-[540px] p-0">
                            <SheetHeader className="p-6 border-b">
                                <SheetTitle>Menú</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-80px)]">
                                <div className="p-6 space-y-8">
                                    {/* Template Selection */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Plantilla</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {templateOptions.map((opt) => (
                                                <Button
                                                    key={opt.id}
                                                    variant={template === opt.id ? "secondary" : "outline"}
                                                    className="w-full justify-start h-auto py-3 px-4"
                                                    onClick={() => setTemplate(opt.id as CVTemplate)}
                                                >
                                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 ${template === opt.id ? 'bg-background' : 'bg-muted'
                                                        }`}>
                                                        <opt.icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="font-medium flex items-center gap-2">
                                                            {opt.name}
                                                            {template === opt.id && <Check className="w-3 h-3 text-primary" />}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground font-normal line-clamp-1">
                                                            {opt.description}
                                                        </p>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="w-full h-px bg-border" />

                                    {/* Settings */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Diseño & Estilo</h3>
                                        <div className="border rounded-xl p-4 bg-muted/30">
                                            <TemplateConfigurator
                                                config={data.config!}
                                                onChange={(config) => setData({ ...data, config })}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full h-px bg-border" />

                                    {/* Reset Actions */}
                                    <div className="space-y-4">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="destructive" className="w-full gap-2">
                                                    <RotateCcw className="w-4 h-4" />
                                                    Empezar de nuevo
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>¿Empezar de nuevo?</DialogTitle>
                                                    <DialogDescription>
                                                        Se perderán todos los cambios. Esta acción no se puede deshacer.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex gap-3 justify-end mt-4">
                                                    <Button variant="outline">Cancelar</Button>
                                                    <Button variant="destructive" onClick={onReset}>
                                                        Sí, reiniciar
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
