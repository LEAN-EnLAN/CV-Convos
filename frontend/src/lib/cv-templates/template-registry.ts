import { FileText, Sparkles, GraduationCap, Grid3X3, Code, Users, Landmark, type LucideIcon } from 'lucide-react';
import { CVTemplate } from '@/types/cv';

export type TemplateSkeleton = 'classic' | 'modern' | 'split';

export interface TemplateDefinition {
    id: CVTemplate;
    name: string;
    description: string;
    category: string;
    tags: string[];
    previewColor: string;
    skeleton: TemplateSkeleton;
    icon: LucideIcon;
}

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
    {
        id: 'professional',
        name: 'Executive',
        description: 'Diseño clásico y elegante para corporativos',
        category: 'Corporativo',
        tags: ['ATS-friendly', 'Clásico'],
        previewColor: 'bg-zinc-800',
        skeleton: 'classic',
        icon: FileText,
    },
    {
        id: 'creative',
        name: 'Studio',
        description: 'Estilo editorial y audaz para creativos',
        category: 'Diseño',
        tags: ['Modern', 'Editorial'],
        previewColor: 'bg-stone-800',
        skeleton: 'modern',
        icon: Sparkles,
    },
    {
        id: 'harvard',
        name: 'Ivy',
        description: 'Estilo Ivy League, ATS-Optimized',
        category: 'Académico',
        tags: ['ATS-friendly', 'Research-ready'],
        previewColor: 'bg-slate-800',
        skeleton: 'classic',
        icon: GraduationCap,
    },
    {
        id: 'pure',
        name: 'Swiss',
        description: 'Minimalismo suizo con precisión extrema',
        category: 'Moderno',
        tags: ['Minimal', 'Structured'],
        previewColor: 'bg-stone-100',
        skeleton: 'split',
        icon: Grid3X3,
    },
    {
        id: 'terminal',
        name: 'Code',
        description: 'Elegancia técnica estilo editor de código',
        category: 'Tecnología',
        tags: ['Monospace', 'Developer'],
        previewColor: 'bg-slate-950',
        skeleton: 'modern',
        icon: Code,
    },
    {
        id: 'care',
        name: 'Care',
        description: 'Diseño cálido centrado en las personas',
        category: 'Diseño',
        tags: ['Warm', 'People-first'],
        previewColor: 'bg-orange-100',
        skeleton: 'split',
        icon: Users,
    },
    {
        id: 'capital',
        name: 'Capital',
        description: 'Precisión financiera y elegancia institucional',
        category: 'Corporativo',
        tags: ['ATS-friendly', 'Finance'],
        previewColor: 'bg-blue-950',
        skeleton: 'classic',
        icon: Landmark,
    },
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Plantilla académica con rigor investigativo',
        category: 'Académico',
        tags: ['Research', 'Publication-ready'],
        previewColor: 'bg-red-900',
        skeleton: 'classic',
        icon: GraduationCap,
    },
];

export const TEMPLATE_CATEGORIES = [
    'Todas',
    ...Array.from(new Set(TEMPLATE_DEFINITIONS.map((template) => template.category))),
];

export const TEMPLATE_BY_ID = TEMPLATE_DEFINITIONS.reduce((acc, template) => {
    acc[template.id] = template;
    return acc;
}, {} as Record<CVTemplate, TemplateDefinition>);

export const getTemplateIds = (): CVTemplate[] => TEMPLATE_DEFINITIONS.map((template) => template.id);
