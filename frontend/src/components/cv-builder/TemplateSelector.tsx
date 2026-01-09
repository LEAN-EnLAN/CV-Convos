'use client';

import React, { useState } from 'react';
import { CVTemplate } from '@/types/cv';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sparkles,
    Check,
    Layout,
    Zap,
    ArrowRight,
    Palette,
    Search,
    Monitor,
    Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { templateOptions } from './header/Header';

interface TemplateSelectorProps {
    currentTemplate: CVTemplate;
    onSelect: (template: CVTemplate) => void;
    trigger?: React.ReactNode;
}

const ResumeSkeleton = ({ variant }: { variant: string }) => {
    // Minimalist skeletons for preview
    const layouts: Record<string, React.ReactNode> = {
        classic: (
            <div className="p-4 space-y-4 opacity-50 grayscale">
                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div className="space-y-1.5 flex-1">
                        <div className="h-2 w-24 bg-slate-300 rounded-full" />
                        <div className="h-1.5 w-16 bg-slate-200 rounded-full" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-200 rounded-full" />
                    <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                    <div className="h-1.5 w-4/5 bg-slate-100 rounded-full" />
                </div>
            </div>
        ),
        modern: (
            <div className="flex h-full opacity-60">
                <div className="w-1/3 bg-slate-100 p-3 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-300 mx-auto" />
                    <div className="space-y-1">
                        <div className="h-1.5 w-full bg-slate-300 rounded-full" />
                        <div className="h-1.5 w-1/2 bg-slate-200 rounded-full" />
                    </div>
                </div>
                <div className="flex-1 p-3 space-y-2">
                    <div className="h-3 w-3/4 bg-slate-300 rounded-full" />
                    <div className="h-1.5 w-full bg-slate-200 rounded-full" />
                    <div className="h-1.5 w-full bg-slate-200 rounded-full" />
                </div>
            </div>
        ),
        split: (
            <div className="p-4 space-y-5 opacity-50">
                <div className="text-center space-y-1.5">
                    <div className="h-2 w-20 mx-auto bg-slate-300 rounded-full" />
                    <div className="h-1 w-24 mx-auto bg-slate-200 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded h-16 w-full" />
                    <div className="bg-slate-50 rounded h-16 w-full" />
                </div>
            </div>
        )
    };
    return (layouts[variant] || layouts.classic) as React.ReactElement;
};

// Updated categories with better mapping
const templateMeta: Record<string, { category: string; color: string; tags: string[]; skeleton: string }> = {
    professional: { category: 'Corporativo', color: 'bg-zinc-800', tags: ['Clean', 'ATS-Ready'], skeleton: 'classic' },
    creative: { category: 'Diseño', color: 'bg-stone-800', tags: ['Editorial', 'Bold'], skeleton: 'modern' },
    harvard: { category: 'Académico', color: 'bg-slate-800', tags: ['Ivy League', 'Standard'], skeleton: 'classic' },
    minimal: { category: 'Moderno', color: 'bg-neutral-200', tags: ['Minimal', 'Light'], skeleton: 'split' },
    tech: { category: 'Tecnología', color: 'bg-zinc-900', tags: ['Dev', 'Code'], skeleton: 'modern' },
    bian: { category: 'Académico', color: 'bg-slate-700', tags: ['Formal', 'Classic'], skeleton: 'classic' },
    finance: { category: 'Corporativo', color: 'bg-slate-900', tags: ['Finance', 'Premium'], skeleton: 'classic' },
    health: { category: 'Salud', color: 'bg-teal-900', tags: ['Health', 'Clean'], skeleton: 'split' },
    education: { category: 'Educación', color: 'bg-indigo-950', tags: ['Teaching', 'Warm'], skeleton: 'classic' }
};

const CATEGORIES = ['Todas', 'Corporativo', 'Académico', 'Moderno', 'Diseño', 'Tecnología'];

export function TemplateSelector({ currentTemplate, onSelect, trigger }: TemplateSelectorProps) {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('Todas');

    const filteredTemplates = filter === 'Todas'
        ? templateOptions
        : templateOptions.filter(t => templateMeta[t.id]?.category === filter);

    const handleSelect = (id: string) => {
        onSelect(id as CVTemplate);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Palette className="w-4 h-4" />
                        <span className="hidden md:inline">Plantilla</span>
                    </Button>
                )}
            </DialogTrigger>
            {/* Added max-h-[90vh] and proper flex layout for scrolling */}
            <DialogContent className="!max-w-[95vw] !w-[1400px] h-[90vh] md:h-[85vh] p-0 flex flex-col gap-0 border-none rounded-2xl overflow-hidden bg-slate-50/50 backdrop-blur-xl outline-none">

                {/* Header Section - Sticky at top of dialog */}
                <div className="p-6 md:p-8 bg-white/80 border-b backdrop-blur-md z-10 shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <DialogTitle className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900">
                                Galería de Plantillas
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 mt-1">
                                Diseños optimizados para ATS y enfocados en resultados.
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Premium Free
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar mask-gradient-x">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                                    filter === cat
                                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className="flex-1 w-full h-full bg-slate-50" type="always">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-8">
                        {filteredTemplates.map(template => {
                            const meta = templateMeta[template.id] || { category: 'General', color: 'from-slate-400 to-slate-500', tags: [], skeleton: 'classic' };
                            const isSelected = currentTemplate === template.id;

                            return (
                                <div
                                    key={template.id}
                                    onClick={() => handleSelect(template.id)}
                                    className={cn(
                                        "group relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer h-[320px]",
                                        isSelected
                                            ? "ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/10 translate-y-[-2px]"
                                            : "border border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-4px] hover:border-slate-300"
                                    )}
                                >
                                    {/* Preview Header */}
                                    <div className={cn(
                                        "h-32 relative overflow-hidden flex items-center justify-center transition-colors duration-500",
                                        meta.color
                                    )}>
                                        <div className="absolute inset-0 bg-black/10" />
                                        <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-105">
                                            <div className="w-32 h-40 bg-white rounded shadow-2xl rotate-[-5deg] translate-y-8 opacity-90 scale-75">
                                                <ResumeSkeleton variant={meta.skeleton} />
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-3 right-3 bg-white text-emerald-600 p-1.5 rounded-full shadow-lg z-20">
                                                <Check className="w-4 h-4 stroke-[3]" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Body */}
                                    <div className="p-5 flex flex-col flex-1 relative bg-white">
                                        <div className="mb-auto">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-lg font-bold text-slate-900">{template.name}</h3>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                    {meta.category}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                {template.description}
                                            </p>
                                        </div>

                                        <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex gap-1.5">
                                                {meta.tags.slice(0, 2).map((tag) => (
                                                    <span key={tag} className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-slate-100">
                                                <ArrowRight className="w-4 h-4 text-slate-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-4 bg-white border-t flex justify-end shrink-0">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
