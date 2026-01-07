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
    Loader2, Scissors, Zap, Undo2, Redo2,
    Linkedin, Github, Globe, Twitter, Clock, Languages, Award, Heart
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

    // Helper to ensure all array items have unique IDs
    const ensureIds = (cvData: any): CVData => {
        const newData = { ...cvData };
        const arrayFields = ['experience', 'education', 'skills', 'projects', 'languages', 'certifications', 'interests'];

        arrayFields.forEach(field => {
            if (Array.isArray(newData[field])) {
                newData[field] = newData[field].map((item: any) => ({
                    ...item,
                    id: item.id || Math.random().toString(36).substr(2, 9)
                }));
            }
        });
        return newData;
    };

    const optimizeContent = async (type: string, action: string) => {
        setIsOptimizing(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/optimize-cv?target=${action}&section=${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to optimize content');

            const optimizedData = await res.json();

            // The backend now returns the COMPLETE and VALID CVData object
            // with the surgical merge already performed.
            if (optimizedData) {
                const sanitizedData = ensureIds(optimizedData);
                onChange(sanitizedData);
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
        // Validate path before traversing
        for (let i = 0; i < path.length - 1; i++) {
            const part = path[i];

            if (current === undefined || current === null) {
                console.error(`Invalid path: ${improvement.target_field} (broken at ${part})`);
                toast.error("Error: No se puede aplicar la mejora en este campo (ruta inválida).");
                return;
            }

            if (!isNaN(Number(part))) {
                current = current[Number(part)];
            } else {
                current = current[part];
            }
        }

        const lastPart = path[path.length - 1];
        if (current && typeof current === 'object') {
            if (!isNaN(Number(lastPart))) {
                current[Number(lastPart)] = improvement.suggested_text;
            } else {
                current[lastPart] = improvement.suggested_text;
            }
            onChange(newData);
            toast.success("Mejora aplicada correctamente.");
        } else {
            console.error(`Cannot apply improvement: target is invalid`);
            toast.error("Error al aplicar mejora.");
        }
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

                                        <div className="space-y-3">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                                <Globe className="w-3 h-3" /> Redes & Enlaces
                                            </Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <Linkedin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="LinkedIn URL"
                                                        value={data.personalInfo.linkedin || ''}
                                                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                                                        className="pl-9 h-9 text-xs bg-background/50"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Github className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="GitHub URL"
                                                        value={data.personalInfo.github || ''}
                                                        onChange={(e) => updatePersonalInfo('github', e.target.value)}
                                                        className="pl-9 h-9 text-xs bg-background/50"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Portfolio / Website"
                                                        value={data.personalInfo.website || ''}
                                                        onChange={(e) => updatePersonalInfo('website', e.target.value)}
                                                        className="pl-9 h-9 text-xs bg-background/50"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Twitter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Twitter / X"
                                                        value={data.personalInfo.twitter || ''}
                                                        onChange={(e) => updatePersonalInfo('twitter', e.target.value)}
                                                        className="pl-9 h-9 text-xs bg-background/50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-2">
                                                <Label htmlFor="availability" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Disponibilidad
                                                </Label>
                                                <Select
                                                    value={data.personalInfo.availability || ''}
                                                    onValueChange={(val) => updatePersonalInfo('availability', val)}
                                                >
                                                    <SelectTrigger className="h-9 text-xs bg-background/50">
                                                        <SelectValue placeholder="Seleccionar disponibilidad" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                                        <SelectItem value="Freelance">Freelance</SelectItem>
                                                        <SelectItem value="Contract">Por Contrato</SelectItem>
                                                        <SelectItem value="Remote">Remoto</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
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
                                                <div key={skill.id} className="space-y-2 p-3 bg-muted/20 rounded-xl border group hover:border-orange-200 transition-all">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                                        <Input
                                                            className="h-7 border-none shadow-none focus-visible:ring-0 bg-transparent text-sm font-bold px-1 flex-1"
                                                            placeholder="Skill (ej: React)"
                                                            value={skill.name}
                                                            onChange={(e) => updateArrayField('skills', index, 'name', e.target.value)}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeArrayItem('skills', index)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>

                                                    <div className="flex items-center gap-3 px-1">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={skill.proficiency || 0}
                                                            onChange={(e) => updateArrayField('skills', index, 'proficiency', parseInt(e.target.value))}
                                                            className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-orange-500"
                                                        />
                                                        <span className="text-[10px] font-mono text-muted-foreground w-7 text-right">
                                                            {skill.proficiency || 0}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            onClick={() => addArrayItem('skills', { name: '', level: 'Intermediate', proficiency: 80, category: '' })}
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

                            {/* Languages Section */}
                            <AccordionItem value="languages" className="border-b">
                                <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 hover:no-underline [&[data-state=open]]:bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                                            <Languages className="w-4 h-4" />
                                        </div>
                                        <div className="text-left flex items-center gap-2">
                                            <p className="text-sm font-bold text-foreground/80">Idiomas</p>
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-sky-50 text-sky-600 border-none font-medium">
                                                {data.languages?.length || 0}
                                            </Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-6 pt-2">
                                    <div className="space-y-3">
                                        {data.languages?.map((lang, index) => (
                                            <div key={lang.id} className="flex items-center gap-2">
                                                <Input
                                                    placeholder="Idioma (ej: Inglés)"
                                                    value={lang.language}
                                                    onChange={(e) => updateArrayField('languages', index, 'language', e.target.value)}
                                                    className="h-9 text-sm font-semibold flex-1"
                                                />
                                                <Select
                                                    value={lang.fluency}
                                                    onValueChange={(val) => updateArrayField('languages', index, 'fluency', val)}
                                                >
                                                    <SelectTrigger className="w-[140px] h-9 text-xs">
                                                        <SelectValue placeholder="Nivel" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Native">Nativo</SelectItem>
                                                        <SelectItem value="Fluent">Fluido</SelectItem>
                                                        <SelectItem value="Conversational">Conversacional</SelectItem>
                                                        <SelectItem value="Basic">Básico</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeArrayItem('languages', index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            onClick={() => addArrayItem('languages', { language: '', fluency: 'Conversational' })}
                                            className="w-full h-9 border-dashed border-sky-300 text-sky-600 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-400 gap-2"
                                            variant="outline"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Agregar Idioma
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Certifications Section */}
                            <AccordionItem value="certifications" className="border-b">
                                <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 hover:no-underline [&[data-state=open]]:bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                            <Award className="w-4 h-4" />
                                        </div>
                                        <div className="text-left flex items-center gap-2">
                                            <p className="text-sm font-bold text-foreground/80">Certificaciones</p>
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-amber-50 text-amber-600 border-none font-medium">
                                                {data.certifications?.length || 0}
                                            </Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-6 pt-2">
                                    <div className="space-y-4">
                                        {data.certifications?.map((cert, index) => (
                                            <Card key={cert.id} className="p-3 relative group hover:shadow-md transition-all border-l-4 border-l-amber-400">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeArrayItem('certifications', index)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>

                                                <div className="space-y-2 pr-6">
                                                    <Input
                                                        placeholder="Nombre de la Certificación"
                                                        value={cert.name}
                                                        onChange={(e) => updateArrayField('certifications', index, 'name', e.target.value)}
                                                        className="h-8 text-sm font-semibold border-none focus-visible:ring-0 px-0"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input
                                                            placeholder="Emisor (ej: Google)"
                                                            value={cert.issuer}
                                                            onChange={(e) => updateArrayField('certifications', index, 'issuer', e.target.value)}
                                                            className="h-7 text-xs"
                                                        />
                                                        <Input
                                                            placeholder="Fecha (ej: 2024)"
                                                            value={cert.date}
                                                            onChange={(e) => updateArrayField('certifications', index, 'date', e.target.value)}
                                                            className="h-7 text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                        <Button
                                            onClick={() => addArrayItem('certifications', { name: '', issuer: '', date: '' })}
                                            className="w-full h-9 border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400 gap-2"
                                            variant="outline"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Agregar Certificación
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Interests Section */}
                            <AccordionItem value="interests" className="border-none">
                                <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 hover:no-underline [&[data-state=open]]:bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                                            <Heart className="w-4 h-4" />
                                        </div>
                                        <div className="text-left flex items-center gap-2">
                                            <p className="text-sm font-bold text-foreground/80">Intereses</p>
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-pink-50 text-pink-600 border-none font-medium">
                                                {data.interests?.length || 0}
                                            </Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-6 pt-2">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {data.interests?.map((interest, index) => (
                                                <Badge key={interest.id} variant="secondary" className="pl-2 pr-1 py-1 gap-1 hover:bg-pink-100 transition-colors">
                                                    {interest.name}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 rounded-full hover:bg-pink-200/50 hover:text-pink-700"
                                                        onClick={() => removeArrayItem('interests', index)}
                                                    >
                                                        <Trash2 className="w-2.5 h-2.5" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                id="new-interest-input"
                                                placeholder="Nuevo interés (ej: Fotografía)..."
                                                className="h-9 text-sm"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = (e.target as HTMLInputElement).value;
                                                        if (val.trim()) {
                                                            addArrayItem('interests', { name: val.trim() });
                                                            (e.target as HTMLInputElement).value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => {
                                                    const input = document.getElementById('new-interest-input') as HTMLInputElement;
                                                    if (input && input.value.trim()) {
                                                        addArrayItem('interests', { name: input.value.trim() });
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
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
        </TooltipProvider >
    );
}
