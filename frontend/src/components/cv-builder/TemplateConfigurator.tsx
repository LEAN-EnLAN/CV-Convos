import React from 'react';
import { TemplateConfig, SectionConfig } from '@/types/cv';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface TemplateConfiguratorProps {
    config: TemplateConfig;
    onChange: (config: TemplateConfig) => void;
}

export function TemplateConfigurator({ config, onChange }: TemplateConfiguratorProps) {
    const updateConfig = (path: string, value: any) => {
        // Deep clone to avoid mutating the Reference which breaks useCVHistory comparison
        const newConfig = JSON.parse(JSON.stringify(config));
        const keys = path.split('.');
        let current: any = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        onChange(newConfig);
    };

    const updateSection = (section: keyof TemplateConfig['sections'], updates: Partial<SectionConfig>) => {
        onChange({
            ...config,
            sections: {
                ...config.sections,
                [section]: { ...config.sections[section], ...updates }
            }
        });
    };

    return (
        <div className="space-y-6 p-1">
            <Accordion type="single" collapsible className="w-full">
                {/* Colores */}
                <AccordionItem value="colors">
                    <AccordionTrigger className="text-sm font-semibold">Colores</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase opacity-60">Primario</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={config.colors.primary}
                                        onChange={(e) => updateConfig('colors.primary', e.target.value)}
                                        className="w-8 h-8 p-0 border-none bg-transparent"
                                    />
                                    <Input
                                        type="text"
                                        value={config.colors.primary}
                                        onChange={(e) => updateConfig('colors.primary', e.target.value)}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase opacity-60">Secundario</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={config.colors.secondary}
                                        onChange={(e) => updateConfig('colors.secondary', e.target.value)}
                                        className="w-8 h-8 p-0 border-none bg-transparent"
                                    />
                                    <Input
                                        type="text"
                                        value={config.colors.secondary}
                                        onChange={(e) => updateConfig('colors.secondary', e.target.value)}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Diseño */}
                <AccordionItem value="layout">
                    <AccordionTrigger className="text-sm font-semibold">Diseño & Espaciado</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label className="text-xs">Densidad</Label>
                            <Select
                                value={config.layout.density}
                                onValueChange={(v) => updateConfig('layout.density', v)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="compact">Compacto</SelectItem>
                                    <SelectItem value="standard">Estándar</SelectItem>
                                    <SelectItem value="relaxed">Espacioso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Gap Secciones</Label>
                                <Input
                                    type="number"
                                    value={config.layout.sectionGap}
                                    onChange={(e) => updateConfig('layout.sectionGap', parseInt(e.target.value))}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Gap Contenido</Label>
                                <Input
                                    type="number"
                                    value={config.layout.contentGap}
                                    onChange={(e) => updateConfig('layout.contentGap', parseInt(e.target.value))}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Expertise Bar */}
                <AccordionItem value="expertise">
                    <AccordionTrigger className="text-sm font-semibold">Barra de Skills</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Mostrar Barras</Label>
                            <input
                                type="checkbox"
                                checked={config.layout.showExpertiseBar}
                                onChange={(e) => updateConfig('layout.showExpertiseBar', e.target.checked)}
                                className="w-4 h-4 accent-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Estilo</Label>
                            <Select
                                value={config.layout.expertiseBarStyle}
                                onValueChange={(v) => updateConfig('layout.expertiseBarStyle', v)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solid">Sólido</SelectItem>
                                    <SelectItem value="gradient">Degradado</SelectItem>
                                    <SelectItem value="dots">Puntos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Secciones */}
                <AccordionItem value="sections">
                    <AccordionTrigger className="text-sm font-semibold">Títulos de Secciones</AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
                        {Object.entries(config.sections).map(([key, section]) => (
                            <div key={key} className="space-y-1">
                                <div className="flex items-center justify-between mb-1">
                                    <Label className="text-[10px] uppercase opacity-60">{key}</Label>
                                    <input
                                        type="checkbox"
                                        checked={section.visible}
                                        onChange={(e) => updateSection(key as any, { visible: e.target.checked })}
                                        className="w-3 h-3 accent-primary"
                                    />
                                </div>
                                <Input
                                    value={section.title}
                                    onChange={(e) => updateSection(key as any, { title: e.target.value })}
                                    className="h-7 text-[11px]"
                                    placeholder={`Título de ${key}...`}
                                />
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
