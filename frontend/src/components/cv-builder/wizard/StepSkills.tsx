'use client';

import React, { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skill } from '@/types/cv';
import { cn } from '@/lib/utils';

interface StepSkillsProps {
    data: Skill[];
    onUpdate: (data: Skill[]) => void;
    onNext: () => void;
    onBack: () => void;
    onComplete: () => void;
}

const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
    'Python', 'Java', 'Go', 'Rust', 'SQL', 'MongoDB', 'PostgreSQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'Figma', 'UI/UX'
];

export function StepSkills({ data, onUpdate, onBack, onComplete }: StepSkillsProps) {
    const [skills, setSkills] = useState<Skill[]>(
        data.length > 0 ? data : [{ id: '', name: '', level: 'Intermediate', proficiency: 50, category: '' }]
    );
    const [newSkillName, setNewSkillName] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addSkill = (name?: string) => {
        const skillName = name || newSkillName.trim();
        if (!skillName) return;

        if (skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
            setNewSkillName('');
            setSuggestions([]);
            return;
        }

        const newSkill: Skill = {
            id: generateId(),
            name: skillName,
            level: 'Intermediate',
            proficiency: 50,
            category: ''
        };
        setSkills(prev => [...prev, newSkill]);
        setNewSkillName('');
        setSuggestions([]);
    };

    const removeSkill = (id: string) => {
        setSkills(prev => prev.filter(s => s.id !== id));
    };

    const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
        setSkills(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleInputChange = (value: string) => {
        setNewSkillName(value);
        if (value.length > 0) {
            const filtered = commonSkills.filter(s =>
                s.toLowerCase().includes(value.toLowerCase()) &&
                !skills.some(existing => existing.name.toLowerCase() === s.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sanitized = skills.map(s => ({
            ...s,
            id: s.id || generateId()
        }));
        onUpdate(sanitized);
        onComplete();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Habilidades</h3>
                <p className="text-sm text-muted-foreground">Agregá tus skills para destacar tu perfil</p>
            </div>

            <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Agregar skill
                </Label>
                <div className="relative">
                    <Input
                        value={newSkillName}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill();
                            }
                        }}
                        placeholder="Escribí una habilidad..."
                        className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-primary focus:ring-primary pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => addSkill()}
                        disabled={!newSkillName.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {suggestions.length > 0 && (
                    <Card className="p-2 bg-white/5 backdrop-blur-xl border-white/10">
                        <div className="space-y-1">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => addSkill(suggestion)}
                                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-white/10 transition-colors text-sm flex items-center justify-between"
                                >
                                    <span>{suggestion}</span>
                                    <Plus className="w-3 h-3 text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Tus skills ({skills.filter(s => s.name.trim()).length})
                </Label>
                <div className="flex flex-wrap gap-2">
                    {skills.filter(s => s.name.trim()).map((skill) => (
                        <div
                            key={skill.id}
                            className={cn(
                                "group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                                "bg-white/5 backdrop-blur-sm",
                                "border-white/10 hover:border-primary/30"
                            )}
                        >
                            <input
                                type="text"
                                value={skill.name}
                                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-24 focus:border-b focus:border-primary"
                            />
                            <select
                                value={skill.level}
                                onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                                className="bg-transparent text-xs text-muted-foreground outline-none cursor-pointer"
                            >
                                <option value="Beginner">Básico</option>
                                <option value="Intermediate">Intermedio</option>
                                <option value="Advanced">Avanzado</option>
                                <option value="Expert">Experto</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => removeSkill(skill.id)}
                                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {skills.filter(s => s.name.trim()).length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No hay skills agregados aún</p>
                    )}
                </div>
            </div>

            <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                        <p className="text-sm font-medium">Tip de IA</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Incluí entre 5-10 skills relevantes para tu objetivo. Podés agregar hard skills (tecnologías, idiomas) y soft skills (liderazgo, comunicación).
                        </p>
                    </div>
                </div>
            </Card>

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
                    Finalizar
                </Button>
            </div>
        </form>
    );
}
