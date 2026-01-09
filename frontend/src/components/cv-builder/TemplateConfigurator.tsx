import React from 'react';
import { TemplateConfig, SectionConfig } from '@/types/cv';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Palette, Layout, Type, Eye, Sliders, BarChart3 } from 'lucide-react';

interface TemplateConfiguratorProps {
    config: TemplateConfig;
    onChange: (config: TemplateConfig) => void;
}

// Fuentes disponibles
const AVAILABLE_FONTS = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Raleway', label: 'Raleway' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' },
    { value: 'Fira Code', label: 'Fira Code' },
    { value: 'Space Mono', label: 'Space Mono' },
];

// Colores predefinidos
const PRESET_COLORS = [
    { value: 'oklch(0.55 0.18 155)', label: 'Esmeralda', preview: '#10b981' },
    { value: 'oklch(0.55 0.20 260)', label: 'Índigo', preview: '#6366f1' },
    { value: 'oklch(0.55 0.20 0)', label: 'Rosa', preview: '#ec4899' },
    { value: 'oklch(0.55 0.20 30)', label: 'Naranja', preview: '#f97316' },
    { value: 'oklch(0.55 0.20 210)', label: 'Azul', preview: '#3b82f6' },
    { value: 'oklch(0.55 0.15 280)', label: 'Violeta', preview: '#8b5cf6' },
    { value: 'oklch(0.20 0.02 280)', label: 'Slate', preview: '#334155' },
    { value: 'oklch(0.00 0 0)', label: 'Negro', preview: '#000000' },
];

export function TemplateConfigurator({ config, onChange }: TemplateConfiguratorProps) {
    const updateConfig = (path: string, value: unknown) => {
        // Deep clone to avoid mutating the Reference which breaks useCVHistory comparison
        const newConfig = JSON.parse(JSON.stringify(config));
        const keys = path.split('.');
        let current: Record<string, unknown> = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]] as Record<string, unknown>;
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
        <div className="space-y-4 p-1">
            <Accordion type="multiple" defaultValue={['colors', 'layout']} className="w-full">
                {/* Colores */}
                <AccordionItem value="colors" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-primary" />
                            Colores
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 pb-4">
                        {/* Color Primario */}
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase opacity-60 font-bold tracking-wide">Color Principal</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {PRESET_COLORS.slice(0, 8).map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => updateConfig('colors.primary', color.value)}
                                        className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-105 ${config.colors.primary === color.value ? 'border-foreground ring-2 ring-primary/30' : 'border-border'
                                            }`}
                                        style={{ backgroundColor: color.preview }}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Color Secundario */}
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase opacity-60 font-bold tracking-wide">Color Secundario</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => updateConfig('colors.secondary', color.value)}
                                        className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-105 ${config.colors.secondary === color.value ? 'border-foreground ring-2 ring-primary/30' : 'border-border'
                                            }`}
                                        style={{ backgroundColor: color.preview }}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Background Color Toggle */}
                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <Label className="text-[10px] uppercase opacity-60 font-bold tracking-wide">Fondo Oscuro</Label>
                                <p className="text-[9px] text-muted-foreground">Cambiar a fondo oscuro</p>
                            </div>
                            <Switch
                                checked={config.colors.background !== 'oklch(1 0 0)'}
                                onCheckedChange={(checked: boolean) => {
                                    updateConfig('colors.background', checked ? 'oklch(0.15 0.02 280)' : 'oklch(1 0 0)');
                                    updateConfig('colors.text', checked ? 'oklch(0.95 0 0)' : 'oklch(0.15 0.02 280)');
                                }}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Layout y Espaciado */}
                <AccordionItem value="layout" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Layout className="w-4 h-4 text-blue-500" />
                            Espaciado y Densidad
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 pb-4">
                        {/* Densidad */}
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase opacity-60 font-bold tracking-wide">Densidad</Label>
                            <Select
                                value={config.layout.density}
                                onValueChange={(val) => updateConfig('layout.density', val)}
                            >
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Seleccionar densidad" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="compact">Compacto</SelectItem>
                                    <SelectItem value="standard">Estándar</SelectItem>
                                    <SelectItem value="relaxed">Espacioso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Espaciado entre Secciones */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] uppercase opacity-60 font-bold tracking-wide">Espaciado entre Secciones</Label>
                                <span className="text-[10px] font-mono text-muted-foreground">{config.layout.sectionGap}px</span>
                            </div>
                            <Slider
                                value={[config.layout.sectionGap]}
                                onValueChange={([val]: number[]) => updateConfig('layout.sectionGap', val)}
                                min={8}
                                max={64}
                                step={4}
                                className="w-full"
                            />
                        </div>

                        {/* Espaciado de Contenido */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] uppercase opacity-60 font-bold tracking-wide">Espaciado de Contenido</Label>
                                <span className="text-[10px] font-mono text-muted-foreground">{config.layout.contentGap}px</span>
                            </div>
                            <Slider
                                value={[config.layout.contentGap]}
                                onValueChange={([val]: number[]) => updateConfig('layout.contentGap', val)}
                                min={8}
                                max={48}
                                step={4}
                                className="w-full"
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Barras de Expertise */}
                <AccordionItem value="expertise" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-orange-500" />
                            Barras de Habilidad
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 pb-4">
                        {/* Mostrar barras */}
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-[10px] uppercase opacity-60 font-bold tracking-wide">Mostrar Barras</Label>
                                <p className="text-[9px] text-muted-foreground">Visualizar nivel de habilidades</p>
                            </div>
                            <Switch
                                checked={config.layout.showExpertiseBar}
                                onCheckedChange={(checked: boolean) => updateConfig('layout.showExpertiseBar', checked)}
                            />
                        </div>

                        {/* Estilo de barras */}
                        {config.layout.showExpertiseBar && (
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase opacity-60 font-bold tracking-wide">Estilo de Barras</Label>
                                <Select
                                    value={config.layout.expertiseBarStyle}
                                    onValueChange={(val) => updateConfig('layout.expertiseBarStyle', val)}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Estilo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bars">Barras Sólidas</SelectItem>
                                        <SelectItem value="dots">Puntos</SelectItem>
                                        <SelectItem value="gradient">Degradado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                {/* Tipografía */}
                <AccordionItem value="fonts" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Type className="w-4 h-4 text-violet-500" />
                            Tipografía
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2 pb-4">
                        {/* Fuente de Títulos */}
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase opacity-60 font-bold tracking-wide">Fuente de Títulos</Label>
                            <Select
                                value={config.fonts.heading}
                                onValueChange={(val) => updateConfig('fonts.heading', val)}
                            >
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Fuente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_FONTS.map((font) => (
                                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                            {font.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fuente de Cuerpo */}
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase opacity-60 font-bold tracking-wide">Fuente de Cuerpo</Label>
                            <Select
                                value={config.fonts.body}
                                onValueChange={(val) => updateConfig('fonts.body', val)}
                            >
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Fuente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_FONTS.map((font) => (
                                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                            {font.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Secciones */}
                <AccordionItem value="sections" className="border-none">
                    <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-emerald-500" />
                            Visibilidad de Secciones
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2 pb-4">
                        {Object.entries(config.sections).map(([key, section]) => (
                            <div key={key} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[11px] font-semibold capitalize">{key}</Label>
                                    <Switch
                                        checked={section.visible}
                                        onCheckedChange={(checked: boolean) => updateSection(key as keyof TemplateConfig['sections'], { visible: checked })}
                                    />
                                </div>
                                {section.visible && (
                                    <Input
                                        value={section.title || ''}
                                        onChange={(e) => updateSection(key as keyof TemplateConfig['sections'], { title: e.target.value })}
                                        className="h-7 text-[11px]"
                                        placeholder={`Título de ${key}...`}
                                    />
                                )}
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
