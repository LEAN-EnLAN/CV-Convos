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
    Linkedin, Github, Globe, Twitter, Clock, Languages, Award, Heart,
    Target, FileDown, Rocket, ShieldCheck, CheckCircle2, Wrench, Search
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    onFinalize?: () => void;
}

export function Editor({
    data,
    onChange,
    undo,
    redo,
    canUndo,
    canRedo,
    onFinalize
}: EditorProps) {
    const [isOptimizing, setIsOptimizing] = React.useState(false);
    const [isCritiqueOpen, setIsCritiqueOpen] = React.useState(false);
    const [showInterviewModal, setShowInterviewModal] = React.useState(false);
    const [targetRole, setTargetRole] = React.useState('');
    const [cvScore, setCvScore] = React.useState<number | null>(null);
    const [cvVerdict, setCvVerdict] = React.useState<string>('Escaneá tu CV para ver tu puntaje');

    // Helper to ensure all array items have unique IDs
    const ensureIds = (cvData: any): CVData => {
        const newData = { ...cvData };
        const arrayFields = ['experience', 'education', 'skills', 'projects', 'languages', 'certifications', 'interests', 'tools'];

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
                // Ensure we preserve the ID of the current arrays to avoid React key issues
                // We trust the backend returned the correct structure, but we re-apply local IDs if missing to be safe
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

    // Optimize CV for a specific target role
    const optimizeForRole = async () => {
        if (!targetRole.trim()) {
            toast.error("Por favor ingresá el puesto objetivo.");
            return;
        }
        setIsOptimizing(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(
                `${apiUrl}/api/interview-cv?target_role=${encodeURIComponent(targetRole)}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }
            );
            if (!res.ok) throw new Error('Failed');
            const optimizedData = await res.json();
            onChange(ensureIds(optimizedData));
            toast.success(`CV optimizado para: ${targetRole}`);
            setShowInterviewModal(false);
            setTargetRole('');
        } catch (error) {
            console.error('Role optimization error:', error);
            toast.error("Error al optimizar para el puesto.");
        } finally {
            setIsOptimizing(false);
        }
    };

    // Try to compress CV to one page
    const tryOnePage = async () => {
        setIsOptimizing(true);
        toast.info("Comprimiendo CV a una página...");
        try {
            await optimizeContent('summary', 'shrink');
            await optimizeContent('experience', 'shrink');
            toast.success("CV comprimido. Revisá el preview.");
        } catch (error) {
            toast.error("Error al comprimir.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const applyImprovement = (improvement: ImprovementCard) => {
        const newData = JSON.parse(JSON.stringify(data));
        // Normalizar la ruta: convertir 'a[0].b' en 'a.0.b'
        const normalizedPath = improvement.target_field.replace(/\[(\d+)\]/g, '.$1');
        const path = normalizedPath.split('.').filter(Boolean);

        let current = newData;
        // Validate path before traversing
        for (let i = 0; i < path.length - 1; i++) {
            const part = path[i];

            if (current === undefined || current === null) {
                console.error(`Invalid path: ${improvement.target_field} (normalized: ${normalizedPath}, broken at ${part})`);
                toast.error("Error: No se puede aplicar la mejora en este campo (ruta inválida).");
                return;
            }

            // Seleccionar el campo, ya sea texto o índice numérico
            if (!isNaN(Number(part)) && Array.isArray(current)) {
                current = current[Number(part)];
            } else {
                current = current[part];
            }
        }

        const lastPart = path[path.length - 1];
        if (current && typeof current === 'object') {
            const index = !isNaN(Number(lastPart)) ? Number(lastPart) : lastPart;
            current[index] = improvement.suggested_text;

            onChange(newData);
            toast.success("Mejora aplicada correctamente.");
        } else {
            console.error(`Cannot apply improvement: target is invalid or container not found for ${improvement.target_field}`);
            toast.error("Error al aplicar la mejora. La estructura del CV cambió.");
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
                    onScanComplete={(res) => {
                        setCvScore(res.score);
                        setCvVerdict(res.overall_verdict);
                    }}
                />

                {/* Interview Modal - Optimize for Role */}
                <Dialog open={showInterviewModal} onOpenChange={setShowInterviewModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Optimizar para Puesto
                            </DialogTitle>
                            <DialogDescription>
                                Ingresá el puesto que buscás y optimizaremos tu CV para destacar en esa posición.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="targetRole" className="text-sm font-medium">
                                Puesto Objetivo
                            </Label>
                            <Input
                                id="targetRole"
                                placeholder="Ej: Desarrollador Frontend, Data Analyst, Diseñador UX..."
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="mt-2"
                                onKeyDown={(e) => e.key === 'Enter' && optimizeForRole()}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowInterviewModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={optimizeForRole} disabled={isOptimizing}>
                                {isOptimizing ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Optimizando...</>
                                ) : (
                                    <><Wand2 className="w-4 h-4 mr-2" /> Optimizar CV</>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Editor Toolbar: Compact & Functional */}
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20 shrink-0 h-12">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Autoguardado activo</span>
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
                                    <span className="text-xs font-semibold">Herramientas IA</span>
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
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setShowInterviewModal(true)}>
                                    <Target className="w-4 h-4 mr-2" />
                                    <span>Optimizar para Puesto</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={tryOnePage}>
                                    <FileDown className="w-4 h-4 mr-2" />
                                    <span>Intentar One-Page</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full w-full">
                        <Accordion type="single" collapsible defaultValue="personal" className="w-full pb-32">
                            {/* Personal Info Section */}
                            <AccordionItem value="personal" className="border-b group">
                                <AccordionTrigger className="px-5 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:no-underline [&[data-state=open]]:bg-muted/20 transition-all data-[state=open]:border-l-4 data-[state=open]:border-primary">
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

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-xs font-semibold uppercase text-muted-foreground">
                                                    Email
                                                </Label>
                                                {/* Force Rebuild */}
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
                                                <Label htmlFor="role" className="text-xs font-semibold uppercase text-muted-foreground">
                                                    Título / Rol
                                                </Label>
                                                <Input
                                                    id="role"
                                                    placeholder="Ej: Senior Frontend Developer"
                                                    value={data.personalInfo.role || ''}
                                                    onChange={(e) => updatePersonalInfo('role', e.target.value)}
                                                    className="h-10 bg-background/50"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="space-y-3">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                                <Globe className="w-3 h-3" /> Redes & Enlaces
                                            </Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                    onValueChange={(val: string) => updatePersonalInfo('availability', val)}
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
                                                placeholder="Breve descripción profesional..."
                                                value={data.personalInfo.summary}
                                                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                                                maxLength={500}
                                                rows={4}
                                                className="resize-none bg-background/50 leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Experience Section */}
                            <AccordionItem value="experience" className="border-b group">
                                <AccordionTrigger className="px-5 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:no-underline [&[data-state=open]]:bg-muted/20 transition-all data-[state=open]:border-l-4 data-[state=open]:border-primary">
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
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            <AccordionItem value="education" className="border-b group">
                                <AccordionTrigger className="px-5 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:no-underline [&[data-state=open]]:bg-muted/20 transition-all data-[state=open]:border-l-4 data-[state=open]:border-primary">
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
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            <AccordionItem value="skills" className="border-b group">
                                <AccordionTrigger className="px-5 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:no-underline [&[data-state=open]]:bg-muted/20 transition-all data-[state=open]:border-l-4 data-[state=open]:border-primary">
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
                            <AccordionItem value="projects" className="border-b group">
                                <AccordionTrigger className="px-5 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:no-underline [&[data-state=open]]:bg-muted/20 transition-all data-[state=open]:border-l-4 data-[state=open]:border-primary">
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
                            <AccordionItem value="languages" className="border-b group">
                                <AccordionTrigger className="px-5 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:no-underline [&[data-state=open]]:bg-muted/20 transition-all data-[state=open]:border-l-4 data-[state=open]:border-primary">
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
                            <AccordionItem value="certifications" className="border-b group">
                                <AccordionTrigger className="px-5 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:no-underline [&[data-state=open]]:bg-muted/20 transition-all data-[state=open]:border-l-4 data-[state=open]:border-primary">
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

                            {/* Tools & Systems Step */}
                            <AccordionItem value="tools" className="border-b group">
                                <AccordionTrigger className="px-5 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:no-underline [&[data-state=open]]:bg-muted/20 transition-all data-[state=open]:border-l-4 data-[state=open]:border-primary">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            <Wrench className="w-4 h-4" />
                                        </div>
                                        <div className="text-left flex items-center gap-2">
                                            <p className="text-sm font-bold text-foreground/80">Herramientas</p>
                                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-orange-50 text-orange-600 border-none font-medium">
                                                {data.tools?.length || 0}
                                            </Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-6 pt-2">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {data.tools?.map((tool, index) => (
                                                <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 gap-1 hover:bg-orange-100 transition-colors">
                                                    {tool}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 rounded-full hover:bg-orange-200/50 hover:text-orange-700"
                                                        onClick={() => {
                                                            const newTools = [...(data.tools || [])];
                                                            newTools.splice(index, 1);
                                                            onChange({ ...data, tools: newTools });
                                                        }}
                                                    >
                                                        <Trash2 className="w-2.5 h-2.5" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                id="new-tool-input"
                                                placeholder="Nueva herramienta (ej: Jira, AWS)..."
                                                className="h-9 text-sm"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = (e.currentTarget as HTMLInputElement).value;
                                                        if (val.trim()) {
                                                            const newTools = [...(data.tools || [])];
                                                            newTools.push(val.trim());
                                                            onChange({ ...data, tools: newTools });
                                                            (e.currentTarget as HTMLInputElement).value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                onClick={() => {
                                                    const input = document.getElementById('new-tool-input') as HTMLInputElement;
                                                    if (input && input.value.trim()) {
                                                        const newTools = [...(data.tools || [])];
                                                        newTools.push(input.value.trim());
                                                        onChange({ ...data, tools: newTools });
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

                            {/* Interests Section */}
                            <AccordionItem value="interests" className="border-none group">
                                <AccordionTrigger className="px-5 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:no-underline [&[data-state=open]]:bg-muted/20 transition-all data-[state=open]:border-l-4 data-[state=open]:border-primary">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                                            <Heart className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-foreground/80">Intereses</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-5 pb-6 pt-2">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {data.interests.map((interest, index) => (
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
                                                        const val = (e.currentTarget as HTMLInputElement).value;
                                                        if (val.trim()) {
                                                            addArrayItem('interests', { name: val.trim() });
                                                            (e.currentTarget as HTMLInputElement).value = '';
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

                {/* Sentinel Hub - Reworked Design */}
                <div className="absolute bottom-6 left-6 right-6 z-50">
                    <div className="relative group">
                        {/* Glow effect on hover */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Main container */}
                        <div className="relative bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Top accent line */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                            <div className="flex items-center justify-between p-4 gap-4">
                                {/* Score & Info Section */}
                                <div
                                    className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                                    onClick={() => setIsCritiqueOpen(true)}
                                >
                                    {/* Score Circle */}
                                    <div className="relative shrink-0">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${cvScore
                                            ? cvScore >= 80
                                                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                                                : cvScore >= 60
                                                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                                                    : 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                                            : 'border-border bg-muted/50'
                                            }`}>
                                            {cvScore ? (
                                                <span className={`text-lg font-black ${cvScore >= 80 ? 'text-emerald-500' :
                                                    cvScore >= 60 ? 'text-amber-500' : 'text-red-500'
                                                    }`}>
                                                    {cvScore}
                                                </span>
                                            ) : (
                                                <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        {/* Pulse indicator when not scanned */}
                                        {!cvScore && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                                        )}
                                        {/* Score label */}
                                        {cvScore && (
                                            <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${cvScore >= 80 ? 'bg-emerald-500 text-white' :
                                                cvScore >= 60 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                                                }`}>
                                                /100
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Sentinel AI</p>
                                            {cvScore && (
                                                <Badge variant="outline" className={`h-4 px-1.5 text-[8px] font-bold ${cvScore >= 80 ? 'text-emerald-500 border-emerald-500/30' :
                                                    cvScore >= 60 ? 'text-amber-500 border-amber-500/30' : 'text-red-500 border-red-500/30'
                                                    }`}>
                                                    {cvScore >= 80 ? 'Excelente' : cvScore >= 60 ? 'Bueno' : 'Mejorable'}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                            {cvVerdict}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Scan/Rescan Button */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-10 px-3 gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 font-bold text-xs"
                                                onClick={() => setIsCritiqueOpen(true)}
                                            >
                                                <Search className="w-4 h-4" />
                                                <span className="hidden sm:inline">{cvScore ? 'Reanalizar' : 'Analizar'}</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Analizar CV con IA</TooltipContent>
                                    </Tooltip>

                                    {/* Finalize Button */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                className="h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105"
                                                onClick={onFinalize}
                                            >
                                                <Rocket className="w-5 h-5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Finalizar y Exportar</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider >
    );
}
