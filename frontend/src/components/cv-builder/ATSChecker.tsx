'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Upload,
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Target,
    Sparkles,
    Loader2,
    RefreshCw,
    ChevronRight,
    Search,
    LayoutTemplate,
    Shield,
    Zap,
    AlertCircle,
    Menu,
    ChevronDown,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { buildApiUrl } from '@/lib/api/base';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { resolveApiErrorMessage } from '@/lib/error-utils';
import { CVData, CVTemplate } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';

// =============================================
// Types & Interfaces
// =============================================

interface ATSResult {
    ats_score: number;
    grade: string;
    summary: string;
    format_score: number;
    keyword_score: number;
    completeness_score: number;
    found_keywords: string[];
    missing_keywords: string[];
    industry_recommendation: string;
    issues: Array<{
        severity: string;
        message: string;
        fix: string;
    }>;
    quick_wins: string[];
    detailed_tips: string;
    mismatch_detected?: boolean;
    mismatch_warning?: string;
    suggested_industry?: string;
    relevance_justification?: string;
    extracted_cv_data?: CVData;
}

interface Industry {
    value: string;
    label: string;
    icon: string;
    shortLabel: string;
    color: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo';
}

interface CategoryConfig {
    value: string;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

// =============================================
// Constants & Configuration
// =============================================

const industries: Industry[] = [
    { value: 'general', label: 'General', icon: '📋', shortLabel: 'General', color: 'blue' },
    { value: 'tech', label: 'Tecnología', icon: '💻', shortLabel: 'Tech', color: 'emerald' },
    { value: 'finance', label: 'Finanzas', icon: '📊', shortLabel: 'Finanzas', color: 'amber' },
    { value: 'healthcare', label: 'Salud', icon: '🏥', shortLabel: 'Salud', color: 'rose' },
    { value: 'creative', label: 'Creativo', icon: '🎨', shortLabel: 'Creativo', color: 'purple' },
    { value: 'education', label: 'Educación', icon: '📚', shortLabel: 'Edu', color: 'indigo' },
];

const categoryConfig: CategoryConfig[] = [
    { 
        value: 'issues', 
        label: 'Problemas Detectados', 
        shortLabel: 'Problemas', 
        icon: AlertCircle,
        description: 'Errores críticos que debés corregir'
    },
    { 
        value: 'keywords', 
        label: 'Análisis de Keywords', 
        shortLabel: 'Keywords', 
        icon: Search,
        description: 'Palabras clave encontradas y faltantes'
    },
    { 
        value: 'quick', 
        label: 'Quick Wins', 
        shortLabel: 'Quick Wins', 
        icon: Zap,
        description: 'Mejoras rápidas para aplicar ahora'
    },
    { 
        value: 'tips', 
        label: 'Consejos Detallados', 
        shortLabel: 'Consejos', 
        icon: LayoutTemplate,
        description: 'Recomendaciones personalizadas'
    },
];

const emptyCV: CVData = {
    personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    certifications: [],
    interests: [],
    config: DEFAULT_CONFIG,
};

const industryColors: Record<string, { 
    border: string; 
    bg: string; 
    text: string; 
    shadow: string; 
    glow: string;
    light: string;
}> = {
    blue: { 
        border: 'border-blue-500', 
        bg: 'bg-blue-500/10', 
        text: 'text-blue-500', 
        shadow: 'shadow-blue-500/10', 
        glow: 'bg-blue-500/5',
        light: 'bg-blue-500/5'
    },
    emerald: { 
        border: 'border-emerald-500', 
        bg: 'bg-emerald-500/10', 
        text: 'text-emerald-500', 
        shadow: 'shadow-emerald-500/10', 
        glow: 'bg-emerald-500/5',
        light: 'bg-emerald-500/5'
    },
    amber: { 
        border: 'border-amber-500', 
        bg: 'bg-amber-500/10', 
        text: 'text-amber-500', 
        shadow: 'shadow-amber-500/10', 
        glow: 'bg-amber-500/5',
        light: 'bg-amber-500/5'
    },
    rose: { 
        border: 'border-rose-500', 
        bg: 'bg-rose-500/10', 
        text: 'text-rose-500', 
        shadow: 'shadow-rose-500/10', 
        glow: 'bg-rose-500/5',
        light: 'bg-rose-500/5'
    },
    purple: { 
        border: 'border-purple-500', 
        bg: 'bg-purple-500/10', 
        text: 'text-purple-500', 
        shadow: 'shadow-purple-500/10', 
        glow: 'bg-purple-500/5',
        light: 'bg-purple-500/5'
    },
    indigo: { 
        border: 'border-indigo-500', 
        bg: 'bg-indigo-500/10', 
        text: 'text-indigo-500', 
        shadow: 'shadow-indigo-500/10', 
        glow: 'bg-indigo-500/5',
        light: 'bg-indigo-500/5'
    },
};

// =============================================
// Animation Variants
// =============================================

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
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1] as const
        }
    }
};

const scoreCircleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
        scale: 1, 
        opacity: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 200,
            damping: 15,
            delay: 0.2
        }
    }
};

// =============================================
// Helper Functions
// =============================================

function getGradeInfo(grade: string) {
    switch (grade) {
        case 'A': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' };
        case 'B': return { color: 'text-lime-500', bg: 'bg-lime-500/10', border: 'border-lime-500/30', glow: 'shadow-lime-500/20' };
        case 'C': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' };
        case 'D': return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' };
        case 'F': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', glow: 'shadow-red-500/20' };
        default: return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/30', glow: '' };
    }
}

function getScoreColor(score: number) {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
}

function getSeverityIcon(severity: string) {
    switch (severity) {
        case 'high': return <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />;
        case 'medium': return <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />;
        default: return <AlertCircle className="w-5 h-5 text-blue-500" aria-hidden="true" />;
    }
}

function getCategoryBadgeCount(category: string, result: ATSResult): number {
    switch (category) {
        case 'issues': return result.issues.length;
        case 'keywords': return result.found_keywords.length + result.missing_keywords.length;
        case 'quick': return result.quick_wins.length;
        case 'tips': return result.detailed_tips ? 1 : 0;
        default: return 0;
    }
}

// =============================================
// Sub-Components
// =============================================

function BackgroundDecoration() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Primary gradient orb - top */}
            <div className="absolute top-[-10%] right-[-5%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
            {/* Secondary gradient orb - bottom */}
            <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px]" />
            {/* Accent gradient orb */}
            <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-emerald-500/3 rounded-full blur-[80px]" />
            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
    );
}

function HeroSection() {
    return (
        <motion.div
            className="text-center mb-8 sm:mb-12 lg:mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            <motion.div 
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20 backdrop-blur-sm mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Target className="w-3.5 h-3.5" aria-hidden="true" />
                ATS Checker Pro
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9] uppercase mb-4">
                ¿Tu CV pasa el{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-accent italic font-serif lowercase tracking-normal">
                    filtro ATS?
                </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                Subí tu CV y te analizamos como lo haría un sistema de contratación real.
                Descubrí qué keywords faltan y cómo mejorarlo.
            </p>
        </motion.div>
    );
}

function IndustrySelector({ 
    selectedIndustry, 
    onSelect 
}: { 
    selectedIndustry: string; 
    onSelect: (value: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const selected = industries.find(i => i.value === selectedIndustry);
    const colors = selected ? industryColors[selected.color] : industryColors.blue;

    return (
        <motion.div
            className="mb-6 sm:mb-8"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
        >
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 block">
                Seleccioná tu industria
            </label>
            
            {/* Desktop: Grid Layout */}
            <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {industries.map((ind) => {
                    const indColors = industryColors[ind.color];
                    const isSelected = selectedIndustry === ind.value;
                    
                    return (
                        <button
                            key={ind.value}
                            onClick={() => onSelect(ind.value)}
                            className={cn(
                                "group relative p-4 rounded-xl border-2 text-center transition-all duration-300 overflow-hidden",
                                "hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                isSelected
                                    ? `${indColors.border} ${indColors.bg} shadow-lg ${indColors.shadow}`
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                            aria-pressed={isSelected}
                            aria-label={`Seleccionar industria ${ind.label}`}
                        >
                            <div className="relative z-10">
                                <div className="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110">
                                    {ind.icon}
                                </div>
                                <div className={cn(
                                    "text-xs font-bold transition-colors",
                                    isSelected ? indColors.text : "text-muted-foreground"
                                )}>
                                    {ind.label}
                                </div>
                            </div>
                            {isSelected && (
                                <motion.div
                                    layoutId="industry-selection"
                                    className={cn("absolute inset-0 border-2 rounded-xl pointer-events-none", indColors.border)}
                                    initial={false}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Mobile: Accordion Dropdown */}
            <div className="sm:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isOpen 
                            ? `${colors.border} ${colors.bg} shadow-lg ${colors.shadow}`
                            : "border-border bg-card hover:border-primary/50"
                    )}
                    aria-expanded={isOpen}
                    aria-controls="industry-accordion"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{selected?.icon}</span>
                        <div className="text-left">
                            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                Industria seleccionada
                            </div>
                            <div className={cn("font-bold", colors.text)}>
                                {selected?.label}
                            </div>
                        </div>
                    </div>
                    <ChevronDown 
                        className={cn(
                            "w-5 h-5 text-muted-foreground transition-transform duration-300",
                            isOpen && "rotate-180"
                        )} 
                        aria-hidden="true"
                    />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            id="industry-accordion"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden mt-2"
                        >
                            <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-muted/30 border border-border">
                                {industries.map((ind) => {
                                    const indColors = industryColors[ind.color];
                                    const isSelected = selectedIndustry === ind.value;
                                    
                                    return (
                                        <button
                                            key={ind.value}
                                            onClick={() => {
                                                onSelect(ind.value);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "flex items-center gap-2 p-3 rounded-lg transition-all duration-200",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                isSelected
                                                    ? `${indColors.bg} ${indColors.border} border`
                                                    : "hover:bg-muted"
                                            )}
                                            aria-pressed={isSelected}
                                        >
                                            <span className="text-xl">{ind.icon}</span>
                                            <span className={cn(
                                                "text-xs font-bold",
                                                isSelected ? indColors.text : "text-muted-foreground"
                                            )}>
                                                {ind.shortLabel}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function UploadZone({
    file,
    isDragActive,
    getRootProps,
    getInputProps,
    onClear,
}: {
    file: File | null;
    isDragActive: boolean;
    getRootProps: () => Record<string, unknown>;
    getInputProps: () => Record<string, unknown>;
    onClear: () => void;
}) {
    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
        >
            <Card className="mb-6 sm:mb-8 bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 text-center cursor-pointer transition-all duration-300 min-h-[180px] sm:min-h-[220px] flex items-center justify-center",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            isDragActive
                                ? "border-primary bg-primary/10 scale-[1.01]"
                                : file
                                    ? "border-primary/30 bg-primary/5"
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                        role="button"
                        tabIndex={0}
                        aria-label="Zona de carga de archivos"
                    >
                        <input {...getInputProps()} aria-label="Seleccionar archivo CV" />
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                            <motion.div 
                                className={cn(
                                    "w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all",
                                    file
                                        ? "bg-primary/10 shadow-lg shadow-primary/20"
                                        : "bg-muted"
                                )}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {file ? (
                                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-primary" aria-hidden="true" />
                                ) : (
                                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" aria-hidden="true" />
                                )}
                            </motion.div>
                            <div>
                                {file ? (
                                    <div className="space-y-1">
                                        <p className="font-bold text-base sm:text-lg max-w-[250px] sm:max-w-[350px] truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1 sm:space-y-2">
                                        <p className="font-bold text-base sm:text-lg">
                                            {isDragActive ? 'Soltá el archivo aquí' : 'Arrastrá y soltá tu CV'}
                                        </p>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            o hacé click para seleccionar
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground/60 uppercase tracking-wider">
                                            PDF, DOCX, TXT
                                        </p>
                                    </div>
                                )}
                            </div>
                            {file && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClear();
                                    }}
                                    className="text-muted-foreground hover:text-foreground text-xs sm:text-sm h-9 sm:h-10"
                                    aria-label="Cambiar archivo seleccionado"
                                >
                                    Cambiar archivo
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function AnalyzeButton({
    onClick,
    isAnalyzing,
    disabled,
}: {
    onClick: () => void;
    isAnalyzing: boolean;
    disabled: boolean;
}) {
    return (
        <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <Button
                size="lg"
                onClick={onClick}
                disabled={disabled || isAnalyzing}
                className={cn(
                    "gap-2 sm:gap-3 h-14 sm:h-16 px-8 sm:px-12 text-sm sm:text-base rounded-full shadow-xl shadow-primary/25 transition-all",
                    "hover:scale-[1.02] active:scale-95 w-full sm:w-auto",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
                aria-label={isAnalyzing ? "Analizando CV" : "Analizar CV"}
                aria-busy={isAnalyzing}
            >
                {isAnalyzing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                        <span>Analizando tu CV...</span>
                    </>
                ) : (
                    <>
                        <Shield className="w-5 h-5" aria-hidden="true" />
                        <span>Analizar CV</span>
                    </>
                )}
            </Button>
        </motion.div>
    );
}

function ScoreCard({ result, selectedIndustry }: { result: ATSResult; selectedIndustry: string }) {
    const gradeInfo = getGradeInfo(result.grade);
    const industry = industries.find(i => i.value === selectedIndustry);
    const colors = industry ? industryColors[industry.color] : industryColors.blue;

    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
        >
            <Card className={cn(
                "overflow-hidden bg-white/5 backdrop-blur-xl border-white/10 relative mb-6",
                colors.glow
            )}>
                <CardContent className="p-4 sm:p-6 lg:p-8">
                    {/* Industry Badge */}
                    <div className="absolute top-4 right-4 z-20">
                        <Badge 
                            variant="outline" 
                            className={cn(
                                "px-3 py-1 font-bold text-[10px] uppercase tracking-wider backdrop-blur-md",
                                colors.border,
                                colors.text
                            )}
                        >
                            {industry?.label}
                        </Badge>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 lg:gap-10">
                        {/* Score Circle */}
                        <motion.div 
                            className="relative flex-shrink-0"
                            variants={scoreCircleVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className={cn(
                                "absolute inset-0 blur-2xl opacity-50",
                                gradeInfo.bg
                            )} />
                            <div className={cn(
                                "relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl",
                                gradeInfo.border,
                                gradeInfo.bg,
                                gradeInfo.glow
                            )}>
                                <span className={cn("text-4xl sm:text-5xl font-black", gradeInfo.color)}>
                                    {result.ats_score}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">/100</span>
                            </div>
                            <div className={cn(
                                "absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl border-2",
                                gradeInfo.bg,
                                gradeInfo.border,
                                gradeInfo.color
                            )}>
                                {result.grade}
                            </div>
                        </motion.div>

                        {/* Score Details */}
                        <div className="flex-1 text-center md:text-left w-full">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                                Análisis Completado
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                                {result.summary}
                            </p>

                            {/* Sub-scores */}
                            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                {[
                                    { label: 'Formato', score: result.format_score, color: 'from-primary to-primary/80' },
                                    { label: 'Keywords', score: result.keyword_score, color: 'from-purple-500 to-purple-400' },
                                    { label: 'Completitud', score: result.completeness_score, color: 'from-amber-500 to-amber-400' },
                                ].map((item, idx) => (
                                    <div key={item.label} className="space-y-2">
                                        <div className="flex justify-between text-xs sm:text-sm">
                                            <span className="text-muted-foreground font-medium">{item.label}</span>
                                            <span className={cn("font-bold", getScoreColor(item.score))}>
                                                {item.score}%
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <motion.div
                                                className={cn("h-full bg-gradient-to-r rounded-full", item.color)}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function CategoryAccordion({ 
    result, 
    isMobile 
}: { 
    result: ATSResult; 
    isMobile: boolean;
}) {
    const [openCategories, setOpenCategories] = useState<string[]>(['issues']);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Get first open category for mobile header display
    const activeCategory = categoryConfig.find(c => c.value === openCategories[0]) || categoryConfig[0];

    const handleValueChange = (values: string[]) => {
        setOpenCategories(values);
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    const getCategoryContent = (category: string) => {
        switch (category) {
            case 'issues':
                return (
                    <div className="space-y-3">
                        {result.issues.length === 0 ? (
                            <Card className="bg-emerald-500/5 border-emerald-500/20">
                                <CardContent className="flex items-center gap-4 py-6 px-6">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-600">¡Excelente!</h3>
                                        <p className="text-sm text-muted-foreground">No se detectaron problemas críticos en tu CV.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            result.issues.map((issue, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className={cn(
                                        "overflow-hidden transition-all hover:scale-[1.01]",
                                        issue.severity === 'high'
                                            ? 'bg-red-500/5 border-red-500/20'
                                            : issue.severity === 'medium'
                                                ? 'bg-amber-500/5 border-amber-500/20'
                                                : 'bg-blue-500/5 border-blue-500/20'
                                    )}>
                                        <CardContent className="p-4">
                                            <div className="flex gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                                    issue.severity === 'high' ? 'bg-red-500/10' :
                                                        issue.severity === 'medium' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                                                )}>
                                                    {getSeverityIcon(issue.severity)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium mb-1">{issue.message}</p>
                                                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                                                        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                                        <span className="leading-relaxed">{issue.fix}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>
                );

            case 'keywords':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="bg-emerald-500/5 border-emerald-500/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    Keywords encontradas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {result.found_keywords.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No se detectaron keywords</p>
                                    ) : (
                                        result.found_keywords.map((kw, idx) => (
                                            <Badge key={idx} className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                                                {kw}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-amber-500/5 border-amber-500/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <Search className="w-4 h-4 text-amber-500" />
                                    </div>
                                    Keywords faltantes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {result.missing_keywords.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">¡Tu CV tiene todas las keywords!</p>
                                    ) : (
                                        result.missing_keywords.map((kw, idx) => (
                                            <Badge key={idx} variant="outline" className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                                                {kw}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'quick':
                return (
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                {result.quick_wins.map((win, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                        <span className="leading-relaxed">{win}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'tips':
                return (
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                        <CardContent className="p-6">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                    {result.detailed_tips || 'No hay consejos adicionales disponibles.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
        >
            {/* Mobile Header Menu */}
            {isMobile && (
                <div className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-background/80 backdrop-blur-xl border-b border-border">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            mobileMenuOpen 
                                ? "bg-primary/10 border border-primary/20" 
                                : "bg-muted/50 hover:bg-muted"
                        )}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="category-menu"
                        aria-label="Abrir menú de categorías"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <activeCategory.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                    Viendo ahora
                                </div>
                                <div className="font-bold text-sm">
                                    {activeCategory.label}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                                {getCategoryBadgeCount(activeCategory.value, result)}
                            </Badge>
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <Menu className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                    </button>

                    {/* Mobile Category Dropdown */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <motion.div
                                id="category-menu"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden mt-2"
                            >
                                <div className="space-y-1 p-2 rounded-xl bg-muted/30 border border-border">
                                    {categoryConfig.map((cat) => {
                                        const Icon = cat.icon;
                                        const isActive = openCategories.includes(cat.value);
                                        const count = getCategoryBadgeCount(cat.value, result);
                                        
                                        return (
                                            <button
                                                key={cat.value}
                                                onClick={() => handleValueChange([cat.value])}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200",
                                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                    isActive
                                                        ? "bg-primary/10 border border-primary/20"
                                                        : "hover:bg-muted"
                                                )}
                                                aria-pressed={isActive}
                                                aria-label={`Ver ${cat.label}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className={cn(
                                                        "w-5 h-5",
                                                        isActive ? "text-primary" : "text-muted-foreground"
                                                    )} />
                                                    <div className="text-left">
                                                        <div className={cn(
                                                            "font-bold text-sm",
                                                            isActive ? "text-foreground" : "text-muted-foreground"
                                                        )}>
                                                            {cat.shortLabel}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {cat.description}
                                                        </div>
                                                    </div>
                                                </div>
                                                {count > 0 && (
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {count}
                                                    </Badge>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Accordion Navigation */}
            <Accordion
                type="multiple"
                value={openCategories}
                onValueChange={handleValueChange}
                className="space-y-3"
            >
                {categoryConfig.map((category) => {
                    const Icon = category.icon;
                    const isOpen = openCategories.includes(category.value);
                    const count = getCategoryBadgeCount(category.value, result);

                    return (
                        <AccordionItem 
                            key={category.value} 
                            value={category.value}
                            className={cn(
                                "border rounded-xl overflow-hidden transition-all duration-300",
                                "bg-white/5 backdrop-blur-sm",
                                isOpen 
                                    ? "border-primary/30 shadow-lg shadow-primary/5" 
                                    : "border-white/10 hover:border-white/20"
                            )}
                        >
                            <AccordionTrigger 
                                className={cn(
                                    "px-4 sm:px-6 py-4 hover:no-underline transition-all duration-300",
                                    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                    isOpen && "bg-primary/5"
                                )}
                                aria-label={`${category.label}${count > 0 ? `, ${count} items` : ''}`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                                    <div className={cn(
                                        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors",
                                        isOpen ? "bg-primary/10" : "bg-muted"
                                    )}>
                                        <Icon className={cn(
                                            "w-5 h-5 sm:w-6 sm:h-6 transition-colors",
                                            isOpen ? "text-primary" : "text-muted-foreground"
                                        )} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "font-bold text-sm sm:text-base transition-colors",
                                                isOpen ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {category.label}
                                            </span>
                                            {count > 0 && (
                                                <Badge 
                                                    variant={isOpen ? "default" : "secondary"} 
                                                    className="text-[10px] h-5 px-1.5"
                                                >
                                                    {count}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground hidden sm:block">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 sm:px-6 pb-4">
                                {getCategoryContent(category.value)}
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </motion.div>
    );
}

function MismatchAlert({ result }: { result: ATSResult }) {
    if (!result.mismatch_detected) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden mb-6"
        >
            <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
            <Alert 
                variant="destructive" 
                className="relative z-10 border-2 border-red-500/50 bg-background/50 backdrop-blur-xl py-6 px-6"
            >
                <div className="flex items-start gap-4">
                    <AlertTriangle className="h-8 w-8 text-red-500 shrink-0" aria-hidden="true" />
                    <div className="space-y-2">
                        <AlertTitle className="text-xl font-bold text-red-500 uppercase tracking-tight">
                            ¡Incoherencia Detectada!
                        </AlertTitle>
                        <AlertDescription className="text-base text-foreground/90 font-medium">
                            {result.mismatch_warning || "Tu CV no parece coincidir con la industria seleccionada."}
                            {result.suggested_industry && (
                                <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 inline-block">
                                    <p className="text-sm font-bold flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                                        Industria Recomendada: <span className="text-red-600 uppercase underline decoration-2 underline-offset-4">{result.suggested_industry}</span>
                                    </p>
                                </div>
                            )}
                        </AlertDescription>
                    </div>
                </div>
            </Alert>
        </motion.div>
    );
}

function ResultsActions({
    onReset,
    onApply,
    isApplying,
}: {
    onReset: () => void;
    onApply: () => void;
    isApplying: boolean;
}) {
    return (
        <motion.div 
            className="pt-6 sm:pt-8 flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
            <Button
                onClick={onApply}
                className="gap-2 rounded-full text-sm h-11 px-6 w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                disabled={isApplying}
                aria-label="Aplicar mejoras y abrir el editor"
            >
                {isApplying ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        Aplicando mejoras...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        Aplicar mejoras
                    </>
                )}
            </Button>
            <Button
                variant="outline"
                onClick={onReset}
                className="gap-2 rounded-full text-sm h-11 px-6 w-full sm:w-auto hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Analizar otro CV"
            >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Analizar otro CV
            </Button>
        </motion.div>
    );
}

// =============================================
// Main Component
// =============================================

export function ATSChecker() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ATSResult | null>(null);
    const [selectedIndustry, setSelectedIndustry] = useState('general');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const uploadedFile = acceptedFiles[0];
        if (uploadedFile) {
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            const validExtensions = ['.pdf', '.docx', '.txt'];
            const hasValidExtension = validExtensions.some(ext => uploadedFile.name.toLowerCase().endsWith(ext));
            
            if (!validTypes.includes(uploadedFile.type) && !hasValidExtension) {
                toast.error('Formato no soportado', {
                    description: 'Por favor subí un PDF, DOCX o TXT',
                });
                return;
            }
            setFile(uploadedFile);
            setResult(null);
            toast.success('Archivo seleccionado', {
                description: uploadedFile.name,
            });
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
        },
        maxFiles: 1,
    });

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('files', file);
            formData.append('target_industry', selectedIndustry);
            const improvementContext = localStorage.getItem('ats_improvement_context');
            if (improvementContext) {
                formData.append('improvement_context', improvementContext);
            }

            const response = await fetch(buildApiUrl('/api/ats-check'), {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = resolveApiErrorMessage(errorData, 'Analysis failed');
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setResult(data);
            toast.success('Análisis completado', {
                description: `Score ATS: ${data.ats_score}/100`,
            });
        } catch (error) {
            toast.error('Error al analizar', {
                description: error instanceof Error ? error.message : 'Intenta de nuevo o usa otro archivo',
            });
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
    };

    const handleClearFile = () => {
        setFile(null);
        setResult(null);
    };

    const normalizeCVData = useCallback((data: CVData): CVData => {
        return {
            ...emptyCV,
            ...data,
            config: {
                ...DEFAULT_CONFIG,
                ...data.config,
                sections: {
                    ...DEFAULT_CONFIG.sections,
                    ...data.config?.sections,
                },
            },
            experience: (data.experience || []).map((entry) => ({
                ...entry,
                id: entry.id || Math.random().toString(36).substr(2, 9),
            })),
            education: (data.education || []).map((entry) => ({
                ...entry,
                id: entry.id || Math.random().toString(36).substr(2, 9),
            })),
            skills: (data.skills || []).map((entry) => ({
                ...entry,
                id: entry.id || Math.random().toString(36).substr(2, 9),
            })),
            projects: (data.projects || []).map((entry) => ({
                ...entry,
                id: entry.id || Math.random().toString(36).substr(2, 9),
            })),
            languages: (data.languages || []).map((entry) => ({
                ...entry,
                id: entry.id || Math.random().toString(36).substr(2, 9),
            })),
            certifications: (data.certifications || []).map((entry) => ({
                ...entry,
                id: entry.id || Math.random().toString(36).substr(2, 9),
            })),
            interests: (data.interests || []).map((entry) => ({
                ...entry,
                id: entry.id || Math.random().toString(36).substr(2, 9),
            })),
        };
    }, []);

    const handleApplyImprovements = async () => {
        if (!result) return;

        setIsApplying(true);
        try {
            const extractedData = result.extracted_cv_data;
            let cvData = extractedData;

            if (!cvData) {
                if (!file) {
                    throw new Error('No encontramos el archivo original para extraer tu CV.');
                }
                const formData = new FormData();
                formData.append('files', file);

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
                const response = await fetch(`${apiUrl}/api/generate-cv`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const detail = errorData.detail;
                    const errorMessage =
                        typeof detail === 'string'
                            ? detail
                            : detail?.message || detail?.error || 'Error al generar el CV';
                    throw new Error(errorMessage);
                }

                cvData = await response.json();
            }

            if (!cvData) {
                throw new Error('No pudimos generar los datos del CV.');
            }

            const finalData = normalizeCVData(cvData);
            const template: CVTemplate = 'professional';
            localStorage.setItem('cv_data', JSON.stringify(finalData));
            localStorage.setItem('cv_template', template);
            localStorage.setItem('ats_improvement_context', JSON.stringify({
                baselineScore: result.ats_score,
                industry: selectedIndustry,
                missingKeywords: result.missing_keywords,
                issues: result.issues,
                timestamp: Date.now(),
            }));

            toast.success('CV listo para editar', {
                description: 'Abrimos el editor con tus datos cargados.',
            });
            router.push('/?flow=builder');
        } catch (error) {
            toast.error('No pudimos aplicar las mejoras', {
                description: error instanceof Error ? error.message : 'Intentá de nuevo más tarde.',
            });
            console.error(error);
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <BackgroundDecoration />

            <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <HeroSection />

                    {!result && (
                        <>
                            <IndustrySelector 
                                selectedIndustry={selectedIndustry}
                                onSelect={setSelectedIndustry}
                            />

                            <UploadZone
                                file={file}
                                isDragActive={isDragActive}
                                getRootProps={getRootProps}
                                getInputProps={getInputProps}
                                onClear={handleClearFile}
                            />

                            {file && (
                                <AnalyzeButton
                                    onClick={handleAnalyze}
                                    isAnalyzing={isAnalyzing}
                                    disabled={!file}
                                />
                            )}
                        </>
                    )}

                    {result && (
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <MismatchAlert result={result} />
                            
                            <ScoreCard 
                                result={result} 
                                selectedIndustry={selectedIndustry}
                            />

                            <CategoryAccordion 
                                result={result}
                                isMobile={isMobile}
                            />

                            <ResultsActions
                                onReset={handleReset}
                                onApply={handleApplyImprovements}
                                isApplying={isApplying}
                            />
                        </motion.div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}

export default ATSChecker;
