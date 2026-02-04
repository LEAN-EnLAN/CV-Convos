'use client';

import React from 'react';
import { FileText, Sparkles, ArrowRight, Sparkles as SparklesIcon, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface OnboardingSelectionProps {
    onSelectOption: (option: 'existing' | 'new') => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export function OnboardingSelection({ onSelectOption }: OnboardingSelectionProps) {
    const router = useRouter();

    return (
        <motion.div
            className="min-h-screen flex flex-col bg-background selection:bg-primary/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="relative flex-1 flex flex-col overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px] animate-sentinel-float" />
                    <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-emerald-500/3 rounded-full blur-[80px]" />
                    
                    {/* Decorative Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 w-full">
                    <motion.header
                        className="flex items-center justify-between mb-24"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                                <span className="text-background font-black text-sm">CV</span>
                            </div>
                            <div>
                                <h1 className="text-sm font-black tracking-tighter uppercase">CV-ConVos</h1>
                                <div className="h-0.5 w-full bg-primary/40 rounded-full mt-0.5" />
                            </div>
                        </div>
                        
                        <div className="hidden sm:flex items-center gap-8">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Constructor de CV con IA </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Código Abierto</span>
                        </div>
                    </motion.header>

                    <motion.div
                        className="space-y-8 mb-24 relative"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div 
                            variants={itemVariants} 
                            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20 backdrop-blur-sm"
                        >
                            <SparklesIcon className="w-3.5 h-3.5" />
                            Núcleo IA Avanzado Activo
                        </motion.div>
                        
                        <div className="space-y-2">
                            <motion.h2 
                                variants={itemVariants} 
                                className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase"
                            >
                                Re-evoluciona <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-accent italic font-serif lowercase tracking-normal">
                                    tu carrera
                                </span>
                            </motion.h2>
                        </div>
                        
                        <motion.p 
                            variants={itemVariants} 
                            className="text-xl sm:text-2xl text-muted-foreground max-w-2xl leading-tight font-medium tracking-tight"
                        >
                            Diseña un curriculum excepcional en minutos. Sin fricción, sin costos, 
                            potenciado por modelos de lenguaje de última generación.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-4 lg:gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="h-full">
                            <OptionCard
                                icon={FileText}
                                title="Optimizar Existente"
                                description="Transformamos tu CV actual en una obra maestra optimizada para ATS y reclutadores."
                                features={[
                                    "Extracción inteligente",
                                    "Mejora de redacción",
                                    "Formatos Premium"
                                ]}
                                buttonText="Importar CV"
                                onClick={() => onSelectOption('existing')}
                                variant="existing"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="h-full">
                            <OptionCard
                                icon={Sparkles}
                                title="Crear Desde Cero"
                                description="Construye tu historia profesional desde cero con asistencia guiada por IA en tiempo real."
                                features={[
                                    "Chat interactivo",
                                    "Sugerencias de logros",
                                    "Diseño instantáneo"
                                ]}
                                buttonText="Empezar ahora"
                                onClick={() => onSelectOption('new')}
                                variant="new"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="h-full">
                            <OptionCard
                                icon={Target}
                                title="Diagnóstico ATS"
                                description="Analiza qué tan efectivo es tu CV contra los algoritmos de filtrado más usados."
                                features={[
                                    "Score de visibilidad",
                                    "Keywords críticas",
                                    "Mapa de calor"
                                ]}
                                buttonText="Ver Diagnóstico"
                                onClick={() => router.push('/ats-checker')}
                                variant="ats"
                                highlight={false}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

interface OptionCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    features: string[];
    buttonText: string;
    onClick: () => void;
    variant: 'existing' | 'new' | 'ats';
    highlight?: boolean;
}

function OptionCard({ icon: Icon, title, description, features, buttonText, onClick, variant, highlight = true }: OptionCardProps) {
    const isNew = variant === 'new';
    const isATS = variant === 'ats';
    const isExisting = variant === 'existing';

    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all duration-500 h-full",
                "bg-card/40 backdrop-blur-xl border-border/50",
                "hover:bg-card/60 hover:border-primary/30",
                "shadow-sm hover:shadow-2xl hover:shadow-primary/5",
                "flex flex-col"
            )}
        >
            <div className="relative p-8 flex-1 flex flex-col space-y-8">
                <div className="flex items-start justify-between">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                        isNew && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                        isATS && "bg-foreground text-background",
                        isExisting && "bg-muted text-foreground"
                    )}>
                        <Icon className="w-7 h-7" />
                    </div>
                    {highlight && isNew && (
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Recomendado</span>
                            <div className="h-1 w-12 bg-primary/30 rounded-full mt-1" />
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">{description}</p>
                </div>

                <div className="flex-1">
                    <ul className="space-y-3">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-3">
                                <div className="h-px w-4 bg-primary/30" />
                                <span className="text-xs font-bold uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity">
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <Button
                    onClick={onClick}
                    variant={isNew ? "default" : "outline"}
                    className={cn(
                        "w-full h-12 text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300",
                        "hover:scale-[1.02] active:scale-95",
                        isNew && "shadow-xl shadow-primary/20"
                    )}
                >
                    {buttonText}
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
            
            {/* Hover Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </Card>
    );
}
