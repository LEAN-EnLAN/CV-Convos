import React from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import { Button } from '@/components/ui/button';
import {
    Layout, RotateCcw,
    Palette, Settings2, Terminal, Menu, ChevronDown,
    MapPin, Mail, Phone, Globe, Linkedin, Github, Twitter,
    Briefcase, Building2, Calendar, Award, Languages, List, Heart, TrendingUp, Bug
} from 'lucide-react';
import { FinalizeExport } from '../FinalizeExport';
import { TemplateConfigurator } from '../TemplateConfigurator';
import { TemplateSelector } from '../TemplateSelector';
import { getDebugData } from '@/lib/debug-utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PenLine, Eye } from 'lucide-react';
import { DEBUG_UI_ENABLED } from '@/lib/debug-flags';
import { TEMPLATE_BY_ID } from '@/lib/cv-templates/template-registry';

interface HeaderProps {
    data: CVData;
    setData: (data: CVData) => void;
    template: CVTemplate;
    setTemplate: (page: CVTemplate) => void;
    onReset: () => void;
    activeView: 'editor' | 'preview';
    setActiveView: (view: 'editor' | 'preview') => void;
}

export function Header({
    data,
    setData,
    template,
    setTemplate,
    onReset,
    activeView,
    setActiveView,
}: HeaderProps) {
    const currentTemplate = TEMPLATE_BY_ID[template];

    return (
        <header className="sticky top-0 z-50 h-16 border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 flex items-center justify-between px-4 sm:px-6 shrink-0 no-print transition-all duration-300">
            {/* Left: Logo & Brand */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20 ring-1 ring-slate-950/5">
                    <span className="text-[10px] sm:text-sm font-black text-white tracking-tighter">CV</span>
                </div>
                <div className="hidden sm:block leading-none">
                    <h1 className="font-extrabold tracking-tight text-slate-900 text-sm">CV-ConVos</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Builder</p>
                </div>
            </div>

            {/* Center: View Toggle (Mobile only) */}
            <div className="sm:hidden absolute left-1/2 -translate-x-1/2 z-10">
                <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'editor' | 'preview')}>
                    <TabsList className="h-8 w-[130px] bg-slate-100 p-0.5 border border-slate-200/50">
                        <TabsTrigger value="editor" className="flex-1 gap-1 text-[9px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm px-1">
                            <PenLine className="w-2.5 h-2.5" />
                            Editor
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="flex-1 gap-1 text-[9px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm px-1">
                            <Eye className="w-2.5 h-2.5" />
                            Vista
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative z-20">

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-2">
                    {/* Template Selector */}
                    <TemplateSelector
                        currentTemplate={template}
                        onSelect={setTemplate}
                        trigger={
                            <Button variant="outline" size="sm" className="gap-2 h-9 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium">
                                <Palette className="w-3.5 h-3.5 text-slate-500" />
                                <span className="hidden xl:inline">Plantilla:</span>
                                <span className="font-bold">{currentTemplate?.name}</span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        }
                    />

                    <div className="w-px h-6 bg-slate-200 mx-1" />

                    {/* Reset Button */}
                    <Dialog>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Reiniciar todo</TooltipContent>
                        </Tooltip>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>¿Empezar de cero?</DialogTitle>
                                <DialogDescription>
                                    Se borrarán todos los datos y cambios actuales. Esta acción es irreversible.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-3 justify-end mt-4">
                                <Button variant="outline" onClick={() => { }}>Cancelar</Button>
                                <Button variant="destructive" onClick={onReset}>
                                    Sí, borrar todo
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Settings */}
                    <DropdownMenu>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 h-9 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium">
                                        <Settings2 className="w-4 h-4 text-slate-500" />
                                        <span>Ajustes</span>
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Configuración avanzada</TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden border-slate-200 shadow-xl rounded-2xl">
                            <div className="p-4 bg-slate-50 border-b border-slate-100">
                                <h4 className="font-bold text-slate-900 text-sm">Personalización</h4>
                                <p className="text-xs text-slate-500">Ajusta fuentes, colores y espaciado</p>
                            </div>
                            <ScrollArea className="h-[400px] p-4">
                                <TemplateConfigurator
                                    config={data.config!}
                                    onChange={(config) => setData({ ...data, config })}
                                />
                            </ScrollArea>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Debug Button (Dev Only) */}
                    {DEBUG_UI_ENABLED && (
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                    onClick={() => setData({ ...getDebugData(), config: data.config })}
                                >
                                    <Bug className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Debug: Llenar con Lorem Ipsum</TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Finalize Button */}
                <FinalizeExport data={data} template={template} />

                <Button
                    size="sm"
                    onClick={onDownloadPDF}
                    className="h-9 sm:h-10 px-3 sm:px-4 text-[11px] sm:text-sm font-bold rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                    Exportar PDF
                </Button>

                {/* Mobile Menu Trigger */}
                <div className="lg:hidden ml-1">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-700">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 border-l border-slate-200">
                            <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <SheetTitle className="text-left font-black">Menú Principal</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-80px)]">
                                <div className="p-6 space-y-8">
                                    {/* Template Selection */}
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plantilla Activa</h3>
                                        <TemplateSelector
                                            currentTemplate={template}
                                            onSelect={setTemplate}
                                            trigger={
                                                <Button variant="outline" className="w-full justify-between h-auto py-4 px-5 border-slate-200 bg-white hover:bg-slate-50 rounded-xl shadow-sm group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                                            <Palette className="w-6 h-6 text-emerald-600" />
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="font-bold text-slate-900 text-base">{currentTemplate?.name}</div>
                                                            <p className="text-xs text-slate-500">Cambiar diseño</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                                </Button>
                                            }
                                        />
                                    </div>

                                    <div className="w-full h-px bg-slate-100" />

                                    {/* Settings */}
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajustes Visuales</h3>
                                        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                                            <TemplateConfigurator
                                                config={data.config!}
                                                onChange={(config) => setData({ ...data, config })}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full h-px bg-slate-100" />

                                    {/* Reset Actions */}
                                    <div className="space-y-3">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" className="w-full h-12 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold gap-2">
                                                    <RotateCcw className="w-4 h-4" />
                                                    Reiniciar CV
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>¿Estás seguro/a?</DialogTitle>
                                                    <DialogDescription>
                                                        Esta acción borrará todo el contenido de tu CV y no se puede deshacer.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex gap-3 justify-end mt-4">
                                                    <Button variant="outline">Cancelar</Button>
                                                    <Button variant="destructive" onClick={onReset}>
                                                        Sí, borrar todo
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <div className="pt-8 text-center">
                                        <p className="text-[10px] text-slate-300 font-mono">CV-ConVos Build v2.0</p>
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
