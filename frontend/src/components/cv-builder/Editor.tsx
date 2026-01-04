'use client';

import React from 'react';
import { CVData } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Mail, Phone, MapPin, FileText, Calendar, Building2,
    Sparkles, Wand2, Loader2, Scissors, Zap
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

interface EditorProps {
    data: CVData;
    onChange: (data: CVData) => void;
}

export function Editor({ data, onChange }: EditorProps) {
    const [isOptimizing, setIsOptimizing] = React.useState(false);

    const handleOptimize = async (target: 'shrink' | 'improve') => {
        setIsOptimizing(true);
        const promise = fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/optimize-cv?target=${target}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        toast.promise(promise, {
            loading: target === 'shrink' ? 'Encogiendo contenido...' : 'Mejorando redacción...',
            success: async (res) => {
                if (!res.ok) throw new Error('Error en la API');
                const optimizedData = await res.json();
                onChange(optimizedData);
                return target === 'shrink' ? '¡CV compactado con éxito!' : '¡Contenido optimizado!';
            },
            error: 'No se pudo optimizar el CV. Intentá de nuevo.',
            finally: () => setIsOptimizing(false),
        });
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
            <Card className="h-full border-none shadow-none rounded-none bg-transparent">
                <CardHeader className="px-5 py-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Editor de CV
                        </CardTitle>
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 border-primary/30 hover:border-primary text-primary hover:bg-primary/5 transition-all shadow-sm"
                                            disabled={isOptimizing}
                                        >
                                            {isOptimizing ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Wand2 className="w-4 h-4" />
                                            )}
                                            <span className="hidden lg:inline">Asistente IA</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Mejorar contenido con IA</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Acciones de IA
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleOptimize('shrink')} className="py-2.5 gap-3 cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Scissors className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold text-sm">Magic Shrink</span>
                                        <p className="text-[10px] text-muted-foreground whitespace-normal leading-tight">
                                            Resume y sintetiza para que todo entre en menos espacio.
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOptimize('improve')} className="py-2.5 gap-3 cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold text-sm">Mejorar Redacción</span>
                                        <p className="text-[10px] text-muted-foreground whitespace-normal leading-tight">
                                            Aplica el método STAR y un lenguaje más profesional.
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="w-full justify-start rounded-none border-b bg-muted/20 h-auto p-0 gap-0 overflow-x-auto no-scrollbar flex-nowrap">
                            <TabsTrigger
                                value="personal"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2 shrink-0"
                            >
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">Personal</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="experience"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2 shrink-0"
                            >
                                <Briefcase className="w-4 h-4" />
                                <span className="text-sm font-medium">Experiencia</span>
                                {data.experience.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-none">
                                        {data.experience.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="education"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2 shrink-0"
                            >
                                <GraduationCap className="w-4 h-4" />
                                <span className="text-sm font-medium">Educación</span>
                                {data.education.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-none">
                                        {data.education.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="skills"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2 shrink-0"
                            >
                                <Code className="w-4 h-4" />
                                <span className="text-sm font-medium">Skills</span>
                                {data.skills.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-none">
                                        {data.skills.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="projects"
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2 shrink-0"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-medium">Proyectos</span>
                                {data.projects.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-none">
                                        {data.projects.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[calc(100vh-180px)]">
                            <div className="p-5">
                                {/* Personal Info Tab */}
                                <TabsContent value="personal" className="space-y-5 mt-0">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                Nombre Completo
                                            </Label>
                                            <Input
                                                placeholder="Juan Pérez"
                                                value={data.personalInfo.fullName}
                                                onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                                                className="h-11"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                                    Email
                                                </Label>
                                                <Input
                                                    type="email"
                                                    placeholder="juan@email.com"
                                                    value={data.personalInfo.email}
                                                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                                    className="h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                                    Teléfono
                                                </Label>
                                                <Input
                                                    placeholder="+54 11 1234-5678"
                                                    value={data.personalInfo.phone}
                                                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                                    className="h-11"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                                Ubicación
                                            </Label>
                                            <Input
                                                placeholder="Buenos Aires, Argentina"
                                                value={data.personalInfo.location}
                                                onChange={(e) => updatePersonalInfo('location', e.target.value)}
                                                className="h-11"
                                            />
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                                    Resumen Profesional
                                                </Label>
                                                <span className="text-xs text-muted-foreground">
                                                    {data.personalInfo.summary?.length || 0} / 500
                                                </span>
                                            </div>
                                            <Textarea
                                                rows={5}
                                                maxLength={500}
                                                placeholder="Describí brevemente tu experiencia y objetivos profesionales..."
                                                value={data.personalInfo.summary}
                                                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                                                className="resize-none"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Experience Tab */}
                                <TabsContent value="experience" className="space-y-4 mt-0">
                                    {data.experience.length === 0 ? (
                                        <div className="text-center py-12 space-y-4">
                                            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                                                <Briefcase className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Sin experiencia agregada</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Agregá tu historial laboral
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        data.experience.map((exp, index) => (
                                            <Card key={exp.id} className="p-4 relative group border-l-4 border-l-primary/30 hover:border-l-primary transition-colors">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => removeArrayItem('experience', index)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Eliminar</TooltipContent>
                                                </Tooltip>

                                                <div className="space-y-4 pr-8">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs flex items-center gap-1.5">
                                                                <Building2 className="w-3 h-3" />
                                                                Empresa
                                                            </Label>
                                                            <Input
                                                                placeholder="Nombre de la empresa"
                                                                value={exp.company}
                                                                onChange={(e) => updateArrayField('experience', index, 'company', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">Cargo</Label>
                                                            <Input
                                                                placeholder="Tu cargo"
                                                                value={exp.position}
                                                                onChange={(e) => updateArrayField('experience', index, 'position', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs flex items-center gap-1.5">
                                                                <Calendar className="w-3 h-3" />
                                                                Fecha inicio
                                                            </Label>
                                                            <Input
                                                                placeholder="Ene 2020"
                                                                value={exp.startDate}
                                                                onChange={(e) => updateArrayField('experience', index, 'startDate', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">Fecha fin</Label>
                                                            <Input
                                                                placeholder="Actual"
                                                                value={exp.endDate}
                                                                onChange={(e) => updateArrayField('experience', index, 'endDate', e.target.value)}
                                                                disabled={exp.current}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Descripción</Label>
                                                        <Textarea
                                                            placeholder="Describí tus responsabilidades y logros..."
                                                            value={exp.description}
                                                            onChange={(e) => updateArrayField('experience', index, 'description', e.target.value)}
                                                            rows={3}
                                                            className="resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    )}

                                    <Button
                                        onClick={() => addArrayItem('experience', {
                                            company: '', position: '', startDate: '',
                                            endDate: '', current: false, location: '', description: ''
                                        })}
                                        className="w-full gap-2"
                                        variant="outline"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Agregar Experiencia
                                    </Button>
                                </TabsContent>

                                {/* Education Tab */}
                                <TabsContent value="education" className="space-y-4 mt-0">
                                    {data.education.length === 0 ? (
                                        <div className="text-center py-12 space-y-4">
                                            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                                                <GraduationCap className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Sin educación agregada</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Agregá tu formación académica
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        data.education.map((edu, index) => (
                                            <Card key={edu.id} className="p-4 relative group border-l-4 border-l-accent/30 hover:border-l-accent transition-colors">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => removeArrayItem('education', index)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Eliminar</TooltipContent>
                                                </Tooltip>

                                                <div className="space-y-4 pr-8">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs flex items-center gap-1.5">
                                                            <Building2 className="w-3 h-3" />
                                                            Institución
                                                        </Label>
                                                        <Input
                                                            placeholder="Nombre de la universidad/instituto"
                                                            value={edu.institution}
                                                            onChange={(e) => updateArrayField('education', index, 'institution', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">Título</Label>
                                                            <Input
                                                                placeholder="Ej: Licenciatura"
                                                                value={edu.degree}
                                                                onChange={(e) => updateArrayField('education', index, 'degree', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs">Especialidad</Label>
                                                            <Input
                                                                placeholder="Ej: Sistemas"
                                                                value={edu.fieldOfStudy}
                                                                onChange={(e) => updateArrayField('education', index, 'fieldOfStudy', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    )}

                                    <Button
                                        onClick={() => addArrayItem('education', {
                                            institution: '', degree: '', fieldOfStudy: '',
                                            startDate: '', endDate: '', location: ''
                                        })}
                                        className="w-full gap-2"
                                        variant="outline"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Agregar Educación
                                    </Button>
                                </TabsContent>

                                {/* Skills Tab */}
                                <TabsContent value="skills" className="space-y-4 mt-0">
                                    {data.skills.length === 0 ? (
                                        <div className="text-center py-12 space-y-4">
                                            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                                                <Code className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Sin habilidades agregadas</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Agregá tus skills y competencias
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-2">
                                            {data.skills.map((skill, index) => (
                                                <Card key={skill.id} className="p-3 flex items-center gap-3 group hover:border-primary/30 transition-colors">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                    <Input
                                                        className="flex-1 border-0 h-8 px-0 focus-visible:ring-0 bg-transparent"
                                                        placeholder="Nombre de la habilidad"
                                                        value={skill.name}
                                                        onChange={(e) => updateArrayField('skills', index, 'name', e.target.value)}
                                                    />
                                                    <Select
                                                        value={skill.category}
                                                        onValueChange={(value) => updateArrayField('skills', index, 'category', value)}
                                                    >
                                                        <SelectTrigger className="w-32 h-8 text-[10px] uppercase font-semibold">
                                                            <SelectValue placeholder="Categoría" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Hard Skills">Hard Skills</SelectItem>
                                                            <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                                                            <SelectItem value="Languages">Idiomas</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Select
                                                        value={skill.level}
                                                        onValueChange={(value) => updateArrayField('skills', index, 'level', value)}
                                                    >
                                                        <SelectTrigger className="w-24 h-8 text-[10px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Beginner">Básico</SelectItem>
                                                            <SelectItem value="Intermediate">Medio</SelectItem>
                                                            <SelectItem value="Advanced">Alto</SelectItem>
                                                            <SelectItem value="Expert">Experto</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => removeArrayItem('skills', index)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Card>
                                            ))}
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => addArrayItem('skills', { name: '', level: 'Intermediate', category: '' })}
                                        className="w-full gap-2"
                                        variant="outline"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Agregar Habilidad
                                    </Button>
                                </TabsContent>

                                {/* Projects Tab */}
                                <TabsContent value="projects" className="space-y-4 mt-0">
                                    {data.projects.length === 0 ? (
                                        <div className="text-center py-12 space-y-4">
                                            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                                                <Sparkles className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Sin proyectos agregados</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Agregá tus proyectos más relevantes
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        data.projects.map((proj, index) => (
                                            <Card key={proj.id} className="p-4 relative group border-l-4 border-l-primary/30 hover:border-l-primary transition-colors">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => removeArrayItem('projects', index)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Eliminar</TooltipContent>
                                                </Tooltip>

                                                <div className="space-y-4 pr-8">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Nombre del Proyecto</Label>
                                                        <Input
                                                            placeholder="Mi Proyecto Increíble"
                                                            value={proj.name}
                                                            onChange={(e) => updateArrayField('projects', index, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Descripción</Label>
                                                        <Textarea
                                                            placeholder="Breve descripción del proyecto y tecnologías usadas..."
                                                            value={proj.description}
                                                            onChange={(e) => updateArrayField('projects', index, 'description', e.target.value)}
                                                            rows={3}
                                                            className="resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                    <Button
                                        onClick={() => addArrayItem('projects', { name: '', description: '', technologies: [] })}
                                        className="w-full gap-2"
                                        variant="outline"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Agregar Proyecto
                                    </Button>
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
