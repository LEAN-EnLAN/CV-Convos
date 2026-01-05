'use client';

import React from 'react';
import { CVData } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    User, Briefcase, GraduationCap, Code, Plus, Trash2,
    Mail, Phone, MapPin, FileText, Sparkles, Wand2,
    Loader2, Scissors, Zap, Undo2, Redo2
} from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import { CritiqueModal } from './CritiqueModal';
import { ImprovementCard } from '@/types/cv';

interface EditorProps {
    data: CVData;
    onChange: (data: CVData) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export function Editor({
    data,
    onChange,
    undo,
    redo,
    canUndo,
    canRedo
}: EditorProps) {
    const [isOptimizing, setIsOptimizing] = React.useState(false);
    const [isCritiqueOpen, setIsCritiqueOpen] = React.useState(false);

    const optimizeContent = async (type: string, action: string) => {
        setIsOptimizing(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/optimize-cv?target=${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to optimize content');

            const optimizedData = await res.json();

            // If the AI returns the whole CV object optimized, we update it
            if (optimizedData) {
                onChange(optimizedData);
                toast.success(`Contenido optimizado: ${type} mejorado con éxito.`);
            }
        } catch (error) {
            console.error('AI Optimization Error:', error);
            toast.error("Error al optimizar con AI. Verificá que el servidor esté corriendo.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const applyImprovement = (improvement: ImprovementCard) => {
        const newData = JSON.parse(JSON.stringify(data));
        const path = improvement.target_field.split('.');

        let current = newData;
        for (let i = 0; i < path.length - 1; i++) {
            const part = path[i];
            // Handle array indices if any (e.g., experience.0)
            if (!isNaN(Number(part))) {
                current = current[Number(part)];
            } else {
                current = current[part];
            }
        }

        const lastPart = path[path.length - 1];
        if (!isNaN(Number(lastPart))) {
            current[Number(lastPart)] = improvement.suggested_text;
        } else {
            current[lastPart] = improvement.suggested_text;
        }

        onChange(newData);
    };

    const updatePersonalInfo = (field: string, value: string) => {
        onChange({
            ...data,
            personalInfo: { ...data.personalInfo, [field]: value },
        });
    };

    const updateArrayField = (field: keyof CVData, index: number, subfield: string, value: any) => {
        const newArray: any[] = [...(data[field] as any[])];
        newArray[index] = { ...newArray[index], [subfield]: value };
        onChange({ ...data, [field]: newArray });
    };

    const addArrayItem = (field: keyof CVData, defaultValue: any) => {
        onChange({
            ...data,
            [field]: [...(data[field] as any[]), { ...defaultValue, id: Math.random().toString(36).substr(2, 9) }],
        });
    };

    const removeArrayItem = (field: keyof CVData, index: number) => {
        const newArray = [...(data[field] as any[])];
        newArray.splice(index, 1);
        onChange({ ...data, [field]: newArray });
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full bg-background relative">
                {/* Critique Modal */}
                <CritiqueModal
                    isOpen={isCritiqueOpen}
                    onClose={() => setIsCritiqueOpen(false)}
                    cvData={data}
                    onApplyImprovement={applyImprovement}
                />

                {/* Editor Toolbar: Compact & Functional */}
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20 shrink-0 h-12">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Autosave on</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5 mr-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={undo}
                                        disabled={!canUndo}
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    >
                                        <Undo2 className="w-3.5 h-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Deshacer</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={redo}
                                        disabled={!canRedo}
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    >
                                        <Redo2 className="w-3.5 h-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Rehacer</TooltipContent>
                            </Tooltip>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isOptimizing}
                                    className="h-7 gap-2 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all ml-1"
                                >
                                    {isOptimizing ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Wand2 className="w-3.5 h-3.5" />
                                    )}
                                    <span className="text-xs font-semibold">AI Tools</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="flex items-center gap-2 text-primary">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Asistente IA</span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => optimizeContent('summary', 'refine')}>
                                    <Scissors className="w-4 h-4 mr-2" />
                                    <span>Resumir Perfil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => optimizeContent('experience', 'professional')}>
                                    <Zap className="w-4 h-4 mr-2" />
                                    <span>Mejorar Redacción</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => optimizeContent('skills', 'suggest')}>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    <span>Sugerir Skills</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full w-full">
                        <Accordion type="single" collapsible defaultValue="personal" className="w-full pb-4">
                            {/* Personal Info Section */}
                            <AccordionItem value="personal" className="border-b">
                                <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 hover:no-underline [&[data-state=open]]:bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-foreground/80">Información Personal</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-6 pt-2">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName" className="text-xs font-semibold uppercase text-muted-foreground">
                                                Nombre Completo
                                            </Label>
                                            <Input
                                                id="fullName"
                                                name="name"
                                                autoComplete="name"
                                                placeholder="Juan Pérez"
                                                value={data.personalInfo.fullName}
                                                onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                                                className="h-10 bg-background/50"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-xs font-semibold uppercase text-muted-foreground">
                                                    Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="juan@email.com"
                                                    value={data.personalInfo.email}
                                                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                                    className="h-10 bg-background/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-xs font-semibold uppercase text-muted-foreground">
                                                    Teléfono
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    name="tel"
                                                    type="tel"
                                                    placeholder="+54 11..."
                                                    value={data.personalInfo.phone}
                                                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                                    className="h-10 bg-background/50"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location" className="text-xs font-semibold uppercase text-muted-foreground">
                                                Ubicación
                                            </Label>
                                            <Input
                                                id="location"
                                                name="address"
                                                placeholder="Buenos Aires, Argentina"
                                                value={data.personalInfo.location}
                                                onChange={(e) => updatePersonalInfo('location', e.target.value)}
                                                className="h-10 bg-background/50"
                                            />
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="summary" className="text-xs font-semibold uppercase text-muted-foreground">
                                                    Resumen Profesional
                                                </Label>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {data.personalInfo.summary?.length || 0}/500
                                                </span>
                                            </div>
                                            <Textarea
                                                id="summary"
                                                rows={5}
                                                maxLength={500}
                                                placeholder="Describí tus objetivos..."
                                                value={data.personalInfo.summary}
                                                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                                                className="resize-none bg-background/50 leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Experience Section */}
                            <AccordionItem value="experience" className="border-b">
                                <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 hover:no-underline [&[data-state=open]]:bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <div className="text-left flex items-center gap-2">
                                            <p className="text-sm font-bold text-foreground/80">Experiencia</p>
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-emerald-50 text-emerald-600 border-none font-medium">
                                                {data.experience.length}
                                            </Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-6 pt-2">
                                    <div className="space-y-4">
                                        {data.experience.map((exp, index) => (
                                            <Card key={exp.id} className="p-4 relative group hover:shadow-md transition-all border-l-4 border-l-emerald-400">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeArrayItem('experience', index)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>

                                                <div className="space-y-3 pr-6">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Input
                                                            placeholder="Empresa"
                                                            value={exp.company}
                                                            onChange={(e) => updateArrayField('experience', index, 'company', e.target.value)}
                                                            className="h-9 text-sm font-semibold"
                                                        />
                                                        <Input
                                                            placeholder="Cargo"
                                                            value={exp.position}
                                                            onChange={(e) => updateArrayField('experience', index, 'position', e.target.value)}
                                                            className="h-9 text-sm"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Input
                                                            placeholder="Inicio"
                                                            value={exp.startDate}
                                                            onChange={(e) => updateArrayField('experience', index, 'startDate', e.target.value)}
                                                            className="h-8 text-xs"
                                                        />
                                                        <Input
                                                            placeholder="Fin"
                                                            value={exp.endDate}
                                                            onChange={(e) => updateArrayField('experience', index, 'endDate', e.target.value)}
                                                            className="h-8 text-xs"
                                                            disabled={exp.current}
                                                        />
                                                    </div>
                                                    <Textarea
                                                        placeholder="Logros y responsabilidades..."
                                                        value={exp.description}
                                                        onChange={(e) => updateArrayField('experience', index, 'description', e.target.value)}
                                                        className="min-h-[80px] text-sm resize-none"
                                                    />
                                                </div>
                                            </Card>
                                        ))}

                                        <Button
                                            onClick={() => addArrayItem('experience', {
                                                company: '', position: '', startDate: '',
                                                endDate: '', current: false, location: '', description: ''
                                            })}
                                            className="w-full h-9 border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-400 gap-2"
                                            variant="outline"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Agregar Experiencia
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Education Section */}
                            <AccordionItem value="education" className="border-b">
                                <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 hover:no-underline [&[data-state=open]]:bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <GraduationCap className="w-4 h-4" />
                                        </div>
                                        <div className="text-left flex items-center gap-2">
                                            <p className="text-sm font-bold text-foreground/80">Educación</p>
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-blue-50 text-blue-600 border-none font-medium">
                                                {data.education.length}
                                            </Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-6 pt-2">
                                    <div className="space-y-4">
                                        {data.education.map((edu, index) => (
                                            <Card key={edu.id} className="p-4 relative group hover:shadow-md transition-all border-l-4 border-l-blue-400">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeArrayItem('education', index)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>

                                                <div className="space-y-3 pr-6">
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="Institución"
                                                            value={edu.institution}
                                                            onChange={(e) => updateArrayField('education', index, 'institution', e.target.value)}
                                                            className="h-9 text-sm font-semibold"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <Input
                                                            placeholder="Título"
                                                            value={edu.degree}
                                                            onChange={(e) => updateArrayField('education', index, 'degree', e.target.value)}
                                                            className="h-9 text-sm"
                                                        />
                                                        <Input
                                                            placeholder="Área de estudio"
                                                            value={edu.fieldOfStudy}
                                                            onChange={(e) => updateArrayField('education', index, 'fieldOfStudy', e.target.value)}
                                                            className="h-9 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}

                                        <Button
                                            onClick={() => addArrayItem('education', {
                                                institution: '', degree: '', fieldOfStudy: '',
                                                startDate: '', endDate: '', location: ''
                                            })}
                                            className="w-full h-9 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 gap-2"
                                            variant="outline"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Agregar Educación
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Skills Section */}
                            <AccordionItem value="skills" className="border-b">
                                <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 hover:no-underline [&[data-state=open]]:bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                            <Code className="w-4 h-4" />
                                        </div>
                                        <div className="text-left flex items-center gap-2">
                                            <p className="text-sm font-bold text-foreground/80">Skills</p>
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-orange-50 text-orange-600 border-none font-medium">
                                                {data.skills.length}
                                            </Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-6 pt-2">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-2">
                                            {data.skills.map((skill, index) => (
                                                <div key={skill.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded-md border group hover:border-orange-200 transition-colors">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 ml-1" />
                                                    <Input
                                                        className="h-7 border-none shadow-none focus-visible:ring-0 bg-transparent text-sm font-medium px-1"
                                                        placeholder="Skill"
                                                        value={skill.name}
                                                        onChange={(e) => updateArrayField('skills', index, 'name', e.target.value)}
                                                    />
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                            onClick={() => removeArrayItem('skills', index)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            onClick={() => addArrayItem('skills', { name: '', level: 'Intermediate', category: '' })}
                                            className="w-full h-9 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400 gap-2"
                                            variant="outline"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Agregar Skill
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Projects Section */}
                            <AccordionItem value="projects" className="border-none">
                                <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 hover:no-underline [&[data-state=open]]:bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div className="text-left flex items-center gap-2">
                                            <p className="text-sm font-bold text-foreground/80">Proyectos</p>
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-indigo-50 text-indigo-600 border-none font-medium">
                                                {data.projects.length}
                                            </Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-6 pt-2">
                                    <div className="space-y-4">
                                        {data.projects.map((proj, index) => (
                                            <Card key={proj.id} className="p-4 relative group hover:shadow-md transition-all border-l-4 border-l-indigo-400">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeArrayItem('projects', index)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>

                                                <div className="space-y-3 pr-6">
                                                    <Input
                                                        placeholder="Nombre del proyecto"
                                                        value={proj.name}
                                                        onChange={(e) => updateArrayField('projects', index, 'name', e.target.value)}
                                                        className="h-9 text-sm font-semibold"
                                                    />
                                                    <Textarea
                                                        placeholder="Descripción..."
                                                        value={proj.description}
                                                        onChange={(e) => updateArrayField('projects', index, 'description', e.target.value)}
                                                        className="min-h-[60px] text-sm resize-none"
                                                    />
                                                </div>
                                            </Card>
                                        ))}

                                        <Button
                                            onClick={() => addArrayItem('projects', { name: '', description: '', technologies: [] })}
                                            className="w-full h-9 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-400 gap-2"
                                            variant="outline"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Agregar Proyecto
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </ScrollArea>
                </div>

                {/* Footer Toolbar */}
                <div className="border-t bg-card p-3 flex items-center justify-between gap-2 shrink-0 z-10">
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest pl-1">
                            Acciones
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-[11px] font-bold uppercase tracking-tight"
                            onClick={() => setIsCritiqueOpen(true)}
                        >
                            <FileText className="w-3 h-3 mr-1" />
                            Validar
                        </Button>
                        <Button size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight shadow-sm bg-gray-900 text-white hover:bg-black">
                            <Zap className="w-3 h-3 mr-1" />
                            Finalizar
                        </Button>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
