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
                {/* Secciones */}
                <AccordionItem value="sections">
                    <AccordionTrigger className="text-sm font-semibold">Secciones</AccordionTrigger>
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
