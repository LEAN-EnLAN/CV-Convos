'use client';

import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CVTemplate } from '@/types/cv';
import { cn } from '@/lib/utils';
import { templateOptions } from '../header/Header';

interface TemplateGalleryProps {
    onSelect: (template: CVTemplate) => void;
    onBack: () => void;
}

const mockLayouts: Record<string, React.ReactNode> = {
    classic: (
        <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                <div className="w-9 h-9 rounded-full bg-slate-200" />
                <div className="space-y-1 flex-1">
                    <div className="h-2 w-28 bg-slate-300 rounded-full" />
                    <div className="h-1.5 w-20 bg-slate-200 rounded-full" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-200 rounded-full" />
                <div className="h-1.5 w-11/12 bg-slate-100 rounded-full" />
                <div className="h-1.5 w-10/12 bg-slate-100 rounded-full" />
            </div>
            <div className="space-y-1.5">
                <div className="h-2 w-24 bg-slate-300 rounded-full" />
                <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                <div className="h-1.5 w-4/5 bg-slate-100 rounded-full" />
            </div>
        </div>
    ),
    modern: (
        <div className="flex h-full">
            <div className="w-1/3 bg-slate-100 p-3 space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-300 mx-auto" />
                <div className="space-y-1">
                    <div className="h-1.5 w-full bg-slate-300 rounded-full" />
                    <div className="h-1.5 w-2/3 bg-slate-200 rounded-full" />
                </div>
                <div className="space-y-1.5">
                    <div className="h-1 w-full bg-slate-200 rounded-full" />
                    <div className="h-1 w-3/4 bg-slate-200 rounded-full" />
                    <div className="h-1 w-2/3 bg-slate-200 rounded-full" />
                </div>
            </div>
            <div className="flex-1 p-3 space-y-2">
                <div className="h-2.5 w-4/5 bg-slate-300 rounded-full" />
                <div className="h-1.5 w-full bg-slate-200 rounded-full" />
                <div className="h-1.5 w-11/12 bg-slate-200 rounded-full" />
                <div className="h-1.5 w-10/12 bg-slate-100 rounded-full" />
                <div className="h-1.5 w-3/4 bg-slate-100 rounded-full" />
            </div>
        </div>
    ),
    split: (
        <div className="p-4 space-y-4">
            <div className="text-center space-y-1.5">
                <div className="h-2 w-24 mx-auto bg-slate-300 rounded-full" />
                <div className="h-1 w-28 mx-auto bg-slate-200 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <div className="h-1.5 w-16 bg-slate-300 rounded-full" />
                    <div className="h-1 w-full bg-slate-100 rounded-full" />
                    <div className="h-1 w-4/5 bg-slate-100 rounded-full" />
                    <div className="h-1 w-3/4 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-2">
                    <div className="h-1.5 w-16 bg-slate-300 rounded-full" />
                    <div className="h-1 w-full bg-slate-100 rounded-full" />
                    <div className="h-1 w-5/6 bg-slate-100 rounded-full" />
                    <div className="h-1 w-2/3 bg-slate-100 rounded-full" />
                </div>
            </div>
        </div>
    )
};

const ResumeMockup = ({ variant }: { variant: string }) => {
    return (mockLayouts[variant] || mockLayouts.classic) as React.ReactElement;
};

// Updated categories with better mapping - SYNCED with TemplateSelector
const templateMeta: Record<string, { category: string; color: string; tags: string[]; skeleton: string }> = {
    professional: { category: 'Corporativo', color: 'bg-zinc-800', tags: ['Clean', 'ATS-Ready'], skeleton: 'classic' },
    creative: { category: 'Diseño', color: 'bg-stone-800', tags: ['Editorial', 'Bold'], skeleton: 'modern' },
    harvard: { category: 'Académico', color: 'bg-slate-800', tags: ['Ivy League', 'Standard'], skeleton: 'classic' },
    pure: { category: 'Moderno', color: 'bg-stone-100', tags: ['Swiss', 'Whitespace'], skeleton: 'split' },
    terminal: { category: 'Tecnología', color: 'bg-slate-950', tags: ['Code', 'Monospace'], skeleton: 'modern' },
    care: { category: 'Diseño', color: 'bg-orange-100', tags: ['Warm', 'Human'], skeleton: 'split' },
    capital: { category: 'Corporativo', color: 'bg-blue-950', tags: ['Finance', 'Data'], skeleton: 'classic' },
    scholar: { category: 'Académico', color: 'bg-red-900', tags: ['Research', 'Publications'], skeleton: 'classic' }
};

export function TemplateGallery({ onSelect, onBack }: TemplateGalleryProps) {
    const [selectedId, setSelectedId] = useState<CVTemplate | null>(null);
    const [filter, setFilter] = useState<string>('Todas');

    const categories = ['Todas', 'Corporativo', 'Académico', 'Moderno', 'Diseño', 'Tecnología'];

    const filteredTemplates = filter === 'Todas'
        ? templateOptions
        : templateOptions.filter(t => templateMeta[t.id]?.category === filter);

    const handleSelect = (templateId: string) => {
        setSelectedId(templateId as CVTemplate);
        // Add a small delay for visual feedback
        setTimeout(() => {
            onSelect(templateId as CVTemplate);
        }, 400);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50/80 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50/80 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-[1400px] mx-auto w-full px-6 py-8 flex flex-col h-screen">
                <div className="flex-shrink-0 mb-8">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="mb-6 pl-0 hover:bg-transparent hover:text-slate-900 text-slate-500 transition-colors"
                    >
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                        Volver al asistente
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900">Elegí tu plantilla</h2>
                                <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Premium Free
                                </div>
                            </div>
                            <p className="text-slate-500 text-lg max-w-2xl font-medium">
                                Diseños optimizados para ATS que destacan tu perfil.
                            </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar mask-gradient-x">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap border",
                                        filter === cat
                                            ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20 transform scale-105"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0 relative">
                    <ScrollArea className="h-full w-full rounded-3xl bg-white/40 border border-slate-200/60 backdrop-blur-sm shadow-xl shadow-slate-200/40">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
                            {filteredTemplates.map((template) => {
                                const meta = templateMeta[template.id] || { category: 'General', color: 'bg-slate-500', tags: [], skeleton: 'classic' };
                                const isSelected = selectedId === template.id;

                                return (
                                    <div
                                        key={template.id}
                                        onClick={() => handleSelect(template.id)}
                                        className={cn(
                                            "group relative flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer h-[360px]",
                                            "transition-all duration-300 ease-out",
                                            isSelected
                                                ? "ring-4 ring-emerald-500/20 border-emerald-500 shadow-2xl shadow-emerald-500/20 translate-y-[-4px]"
                                                : "border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-8px] hover:border-slate-200"
                                        )}
                                    >
                                        {/* Preview Header */}
                                        <div className={cn(
                                            "h-40 relative overflow-hidden flex items-center justify-center transition-colors duration-500",
                                            meta.color
                                        )}>
                                            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                                            {/* Pattern Overlay */}
                                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.2)_1px,transparent_0)] bg-[length:16px_16px]" />

                                            <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
                                                <div className="w-32 h-52 bg-white rounded shadow-2xl skew-y-[-2deg] opacity-95 scale-90 border border-black/5 overflow-hidden">
                                                    <ResumeMockup variant={meta.skeleton} />
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="absolute inset-0 bg-emerald-500/40 backdrop-blur-[1px] flex items-center justify-center z-20 animate-in fade-in duration-200">
                                                    <div className="bg-white text-emerald-600 p-3 rounded-full shadow-xl transform scale-110">
                                                        <Check className="w-6 h-6 stroke-[3]" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Body */}
                                        <div className="p-6 flex flex-col flex-1 relative bg-white">
                                            <div className="mb-auto">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{template.name}</h3>
                                                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 hover:bg-slate-200">
                                                        {meta.category}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium">
                                                    {template.description}
                                                </p>
                                            </div>

                                            <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {meta.tags.slice(0, 2).map((tag) => (
                                                        <span key={tag} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-md font-semibold border border-slate-100">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-slate-900 group-hover:text-white">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
