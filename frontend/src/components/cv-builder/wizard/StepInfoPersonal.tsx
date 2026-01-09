'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PersonalInfo } from '@/types/cv';
import { cn } from '@/lib/utils';

interface StepInfoPersonalProps {
    data: PersonalInfo;
    onUpdate: (data: PersonalInfo) => void;
    onNext: () => void;
}

export function StepInfoPersonal({ data, onUpdate, onNext }: StepInfoPersonalProps) {
    const [formData, setFormData] = useState<PersonalInfo>(data);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (field: keyof PersonalInfo, value: string): string => {
        if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Email inválido';
        }
        if (field === 'fullName' && !value.trim()) {
            return 'El nombre es obligatorio';
        }
        if (field === 'phone' && value && !/^[\d\s\-+()]+$/.test(value)) {
            return 'Teléfono inválido';
        }
        return '';
    };

    const handleChange = (field: keyof PersonalInfo, value: string) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const isValid = () => {
        const newErrors: Record<string, string> = {};
        let hasErrors = false;

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'El nombre es obligatorio';
            hasErrors = true;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
            hasErrors = true;
        }

        setErrors(newErrors);
        return !hasErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid()) {
            onUpdate(formData);
            onNext();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Nombre completo *
                </Label>
                <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Juan Pérez"
                    className={cn(
                        "h-12 rounded-xl bg-white/5 border-white/10 focus:border-primary focus:ring-primary",
                        errors.fullName && "border-destructive focus:border-destructive focus:ring-destructive"
                    )}
                />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="juan@ejemplo.com"
                        className={cn(
                            "h-12 rounded-xl bg-white/5 border-white/10 focus:border-primary focus:ring-primary",
                            errors.email && "border-destructive focus:border-destructive focus:ring-destructive"
                        )}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        Teléfono
                    </Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+54 9 11 1234 5678"
                        className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-primary focus:ring-primary"
                    />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="location" className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        Ubicación
                    </Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="Buenos Aires, Argentina"
                        className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-primary focus:ring-primary"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        Título profesional
                    </Label>
                    <Input
                        id="role"
                        value={formData.role || ''}
                        onChange={(e) => handleChange('role', e.target.value)}
                        placeholder="Senior Frontend Developer"
                        className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-primary focus:ring-primary"
                    />
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        LinkedIn
                    </Label>
                    <Input
                        id="linkedin"
                        value={formData.linkedin || ''}
                        onChange={(e) => handleChange('linkedin', e.target.value)}
                        placeholder="linkedin.com/in/juanperez"
                        className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-primary focus:ring-primary"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="github" className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        GitHub
                    </Label>
                    <Input
                        id="github"
                        value={formData.github || ''}
                        onChange={(e) => handleChange('github', e.target.value)}
                        placeholder="github.com/juanperez"
                        className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-primary focus:ring-primary"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="summary" className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Resumen profesional
                </Label>
                <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => handleChange('summary', e.target.value)}
                    placeholder="Describe brevemente tu trayectoria profesional, tus habilidades principales y qué tipo de oportunidades buscas..."
                    rows={4}
                    className="rounded-xl bg-white/5 border-white/10 focus:border-primary focus:ring-primary resize-none"
                />
            </div>

            <div className="flex justify-end pt-4">
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
