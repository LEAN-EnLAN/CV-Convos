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
            className="min-h-screen flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-6xl mx-auto px-6 py-12">
                    <motion.header
                        className="flex items-center gap-3 mb-16"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                                <span className="text-xl font-bold text-primary-foreground">CV</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">CV-ConVos</h1>
                                <p className="text-xs text-muted-foreground">Tu CV, tu historia</p>
                            </div>
                        </div>
                    </motion.header>

                    <motion.div
                        className="space-y-4 mb-12"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            <SparklesIcon className="w-4 h-4" />
                            Potenciado por IA
                        </motion.div>
                        <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                            Tu CV profesional en{' '}
                            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                                menos de 5 minutos
                            </span>
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl">
                            Completamente gratis. Sin pagos, sin cuentas. Tus datos se guardan en tu navegador.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-6 max-w-5xl mb-12"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants}>
                            <OptionCard
                                icon={FileText}
                                title="Mejorar mi CV existente"
                                description="Subí tu CV y nuestra IA lo analiza, extrae la información y lo mejora automáticamente."
                                features={[
                                    "PDF, DOCX o TXT",
                                    "Análisis automático",
                                    "Optimización IA"
                                ]}
                                buttonText="Subir mi CV"
                                onClick={() => onSelectOption('existing')}
                                variant="existing"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <OptionCard
                                icon={Sparkles}
                                title="Crear un nuevo CV"
                                description="Completá 3 pasos con tu información y obtené un CV profesional listo para usar."
                                features={[
                                    "3 simples pasos",
                                    "Preview en tiempo real",
                                    "Plantillas profesionales"
                                ]}
                                buttonText="Crear CV"
                                onClick={() => onSelectOption('new')}
                                variant="new"
                            />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <OptionCard
                                icon={Target}
                                title="Chequear ATS"
                                description="Subí tu CV y te decimos si pasa los filtros automáticos de contratación."
                                features={[
                                    "Score ATS automático",
                                    "Keywords faltantes",
                                    "Consejos para mejorar"
                                ]}
                                buttonText="Analizar ahora"
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
                "group relative overflow-hidden transition-all duration-300 h-full",
                "bg-white/5 backdrop-blur-xl border-2",
                "hover:scale-[1.02] hover:shadow-xl",
                isNew && "hover:shadow-primary/10 border-primary/30",
                isATS && "border-border hover:border-primary/20",
                isExisting && "border-white/10 hover:border-white/20"
            )}
        >
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                isNew ? "bg-gradient-to-br from-primary/5 via-transparent to-transparent" :
                    isATS ? "bg-gradient-to-br from-purple-500/3 via-transparent to-transparent" :
                        "bg-gradient-to-br from-blue-500/5 via-transparent to-transparent"
            )} />

            <div className="relative p-6 space-y-5">
                <div className="flex items-start justify-between">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
                        isNew && "bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20",
                        isATS && "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20",
                        isExisting && "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20"
                    )}>
                        <Icon className={cn(
                            "w-6 h-6 transition-colors duration-200",
                            isNew ? "text-primary-foreground" :
                                isATS ? "text-white" :
                                    "text-white"
                        )} />
                    </div>
                    {highlight && isNew && (
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                            Nuevo
                        </span>
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>

                <ul className="space-y-2">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                            <div className={cn(
                                "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                                isNew ? "bg-primary/20" : "bg-white/10"
                            )}>
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    isNew ? "bg-primary" : "bg-white/50"
                                )} />
                            </div>
                            <span className="text-sm">{feature}</span>
                        </li>
                    ))}
                </ul>

                <Button
                    onClick={onClick}
                    className={cn(
                        "w-full h-10 text-sm font-semibold rounded-xl transition-all duration-200",
                        "group-hover:scale-[1.02] active:scale-95",
                        isNew
                            ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            : isATS
                                ? "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20"
                                : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                    )}
                >
                    {buttonText}
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </Card>
    );
}
