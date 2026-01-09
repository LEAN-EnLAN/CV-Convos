'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Experience } from '@/types/cv';
import { cn } from '@/lib/utils';

interface StepExperienciaProps {
    data: Experience[];
    onUpdate: (data: Experience[]) => void;
    onNext: () => void;
    onBack: () => void;
}

export function StepExperiencia({ data, onUpdate, onNext, onBack }: StepExperienciaProps) {
    const [experiences, setExperiences] = useState<Experience[]>(
        data.length > 0 ? data : [{ id: '', company: '', position: '', startDate: '', endDate: '', current: false, location: '', description: '' }]
    );
    const [expandedId, setExpandedId] = useState<string | null>(experiences[0]?.id || null);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addExperience = () => {
        const newExperience: Experience = {
            id: generateId(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            location: '',
            description: ''
        };
        setExperiences(prev => [...prev, newExperience]);
        setExpandedId(newExperience.id);
    };

    const removeExperience = (id: string) => {
        if (experiences.length > 1) {
            setExperiences(prev => prev.filter(e => e.id !== id));
            if (expandedId === id) {
                setExpandedId(null);
            }
        }
    };

    const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
        setExperiences(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sanitized = experiences.map(e => ({
            ...e,
            id: e.id || generateId()
        }));
        onUpdate(sanitized);
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold">Experiencia laboral</h3>
                    <p className="text-sm text-muted-foreground">Agregá tus puestos anteriores y actuales</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={addExperience}
                    className="rounded-xl border-primary/30 bg-primary/5 hover:bg-primary/10"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar puesto
                </Button>
            </div>

            <div className="space-y-4">
                {experiences.map((exp, index) => (
                    <Card
                        key={exp.id}
                        className={cn(
                            "overflow-hidden transition-all duration-200",
                            "bg-white/5 backdrop-blur-sm border-white/10",
                            expandedId === exp.id && "border-primary/30"
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
                            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        {exp.position || exp.company || 'Nuevo puesto'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {exp.company && exp.position ? `${exp.company} • ${exp.position}` : 'Completá los detalles'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {experiences.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeExperience(exp.id); }}
                                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                {expandedId === exp.id ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                        </button>

                        {expandedId === exp.id && (
                            <div className="p-4 pt-0 space-y-4 border-t border-white/5">
                                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                            Empresa
                                        </Label>
                                        <Input
                                            value={exp.company}
                                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                            placeholder="Google"
                                            className="h-10 rounded-lg bg-white/5 border-white/10 focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                            Posición
                                        </Label>
                                        <Input
                                            value={exp.position}
                                            onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                            placeholder="Software Engineer"
                                            className="h-10 rounded-lg bg-white/5 border-white/10 focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                            Fecha inicio
                                        </Label>
                                        <Input
                                            type="text"
                                            value={exp.startDate}
                                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                            placeholder="ene 2020"
                                            className="h-10 rounded-lg bg-white/5 border-white/10 focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                            Fecha fin
                                        </Label>
                                        <Input
                                            type="text"
                                            value={exp.endDate || ''}
                                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                            placeholder="dic 2023"
                                            disabled={exp.current}
                                            className="h-10 rounded-lg bg-white/5 border-white/10 focus:border-primary focus:ring-primary disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={exp.current}
                                                onChange={(e) => updateExperience(exp.id, 'current', e.currentTarget.checked)}
                                                className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm">Actualmente</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                        Ubicación
                                    </Label>
                                    <Input
                                        value={exp.location}
                                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                        placeholder="Buenos Aires, Argentina"
                                        className="h-10 rounded-lg bg-white/5 border-white/10 focus:border-primary focus:ring-primary"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                        Descripción
                                    </Label>
                                    <Textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                        placeholder="Describe tus responsabilidades y logros..."
                                        rows={3}
                                        className="rounded-lg bg-white/5 border-white/10 focus:border-primary focus:ring-primary resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <div className="flex justify-between pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onBack}
                    className="rounded-xl px-6"
                >
                    Volver
                </Button>
                <Button
                    type="submit"
                    className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-semibold"
                >
                    Continuar
                </Button>
            </div>
        </form>
    );
}
