'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Upload,
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    TrendingUp,
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
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

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
}

const industries = [
    { value: 'general', label: 'General', icon: '📋', shortLabel: 'General' },
    { value: 'tech', label: 'Tecnología', icon: '💻', shortLabel: 'Tech' },
    { value: 'finance', label: 'Finanzas', icon: '📊', shortLabel: 'Finanzas' },
    { value: 'healthcare', label: 'Salud', icon: '🏥', shortLabel: 'Salud' },
    { value: 'creative', label: 'Creativo', icon: '🎨', shortLabel: 'Creativo' },
    { value: 'education', label: 'Educación', icon: '📚', shortLabel: 'Edu' },
];

// Mobile-first tab configuration with icons only for small screens
const tabsConfig = [
    { value: 'issues', label: 'Problemas', shortLabel: 'Issues', icon: AlertCircle },
    { value: 'keywords', label: 'Keywords', shortLabel: 'Keywords', icon: Search },
    { value: 'quick', label: 'Quick Wins', shortLabel: 'Wins', icon: Zap },
    { value: 'tips', label: 'Consejos', shortLabel: 'Tips', icon: LayoutTemplate },
];

export function ATSChecker() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ATSResult | null>(null);
    const [selectedIndustry, setSelectedIndustry] = useState('general');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState('issues');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const uploadedFile = acceptedFiles[0];
        if (uploadedFile) {
            if (uploadedFile.type !== 'application/pdf' &&
                !uploadedFile.name.endsWith('.docx') &&
                !uploadedFile.name.endsWith('.txt')) {
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

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const response = await fetch(`${apiUrl}/api/ats-check`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Analysis failed');
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

    const getGradeInfo = (grade: string) => {
        switch (grade) {
            case 'A': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' };
            case 'B': return { color: 'text-lime-500', bg: 'bg-lime-500/10', border: 'border-lime-500/30', glow: 'shadow-lime-500/20' };
            case 'C': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' };
            case 'D': return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' };
            case 'F': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', glow: 'shadow-red-500/20' };
            default: return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/30', glow: '' };
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-amber-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'medium': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            default: return <AlertCircle className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background effects - optimized for mobile performance */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-primary/5 rounded-full blur-[100px] sm:blur-[150px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-purple-500/5 rounded-full blur-[80px] sm:blur-[120px] translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Mobile-first container: reduced padding on mobile, increased on larger screens */}
            <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
                {/* Header - Mobile-first typography */}
                <motion.div
                    className="text-center mb-6 sm:mb-8 lg:mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 text-xs sm:text-sm font-bold mb-4 sm:mb-6">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            ATS Checker
                        </span>
                    </div>
                    {/* Mobile-first: text-2xl on smallest screens, scales up */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
                        ¿Tu CV pasa el{' '}
                        <span className="bg-gradient-to-r from-primary via-primary to-purple-500 bg-clip-text text-transparent">
                            filtro ATS?
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2 sm:px-0">
                        Subí tu CV y te analizamos como lo haría un sistema de contratación real.
                        Descubrí qué keywords faltan y cómo mejorarlo.
                    </p>
                </motion.div>

                {/* Industry Selection - Mobile-first: 2 columns on smallest screens */}
                <motion.div
                    className="mb-6 sm:mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 sm:mb-4 block flex items-center gap-2">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                        ¿Para qué industria?
                    </label>
                    {/* Mobile-first grid: 2 cols on xs, 3 on sm, 6 on lg */}
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                        {industries.map((ind) => (
                            <button
                                key={ind.value}
                                onClick={() => setSelectedIndustry(ind.value)}
                                className={cn(
                                    // Mobile-first touch target: min-h-[64px] ensures 44px+ tap area
                                    "group relative p-3 sm:p-4 rounded-xl border-2 text-center transition-all duration-200 overflow-hidden min-h-[64px] sm:min-h-[72px] flex flex-col items-center justify-center",
                                    selectedIndustry === ind.value
                                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                                )}
                            >
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity",
                                    selectedIndustry === ind.value ? "opacity-100" : "group-hover:opacity-50"
                                )} />
                                <div className="relative">
                                    {/* Smaller icons on mobile */}
                                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{ind.icon}</div>
                                    <div className={cn(
                                        "text-xs font-bold transition-colors leading-tight",
                                        selectedIndustry === ind.value ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {/* Use shorter label on very small screens */}
                                        <span className="hidden xs:inline">{ind.label}</span>
                                        <span className="xs:hidden">{ind.shortLabel}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Upload Area - Mobile-first padding and sizing */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Card className="mb-6 sm:mb-8 bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
                        <CardContent className="p-4 sm:p-6">
                            <div
                                {...getRootProps()}
                                className={cn(
                                    // Mobile-first: reduced padding on small screens
                                    "relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 text-center cursor-pointer transition-all duration-300 min-h-[160px] sm:min-h-[200px] flex items-center justify-center",
                                    isDragActive
                                        ? "border-primary bg-primary/10 scale-[1.01]"
                                        : file
                                            ? "border-primary/30 bg-primary/5"
                                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                                )}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center gap-3 sm:gap-4">
                                    <div className={cn(
                                        // Smaller icon container on mobile
                                        "w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all",
                                        file
                                            ? "bg-primary/10 shadow-lg shadow-primary/20"
                                            : "bg-muted"
                                    )}>
                                        {file ? (
                                            <FileText className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary" />
                                        ) : (
                                            <Upload className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        {file ? (
                                            <div className="space-y-1">
                                                {/* Truncate filename on mobile */}
                                                <p className="font-bold text-base sm:text-lg max-w-[200px] sm:max-w-[300px] truncate">{file.name}</p>
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
                                                <p className="text-[10px] sm:text-xs text-muted-foreground/60">
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
                                                setFile(null);
                                                setResult(null);
                                            }}
                                            className="text-muted-foreground hover:text-foreground text-xs sm:text-sm h-8 sm:h-9"
                                        >
                                            Cambiar archivo
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Analyze Button - Mobile-first sizing */}
                {file && !result && (
                    <motion.div
                        className="text-center mb-8 sm:mb-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Button
                            size="lg"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            // Mobile-first: full width on small screens, auto on larger
                            className="gap-2 sm:gap-3 h-12 sm:h-14 px-6 sm:px-10 text-sm sm:text-base rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95 w-full sm:w-auto"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                    <span className="sm:hidden">Analizando...</span>
                                    <span className="hidden sm:inline">Analizando tu CV...</span>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Analizar CV
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}

                {/* Results */}
                {result && (
                    <motion.div
                        className="space-y-4 sm:space-y-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Score Overview - Mobile-first responsive layout */}
                        <Card className="overflow-hidden bg-white/5 backdrop-blur-xl border-white/10">
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                {/* Mobile: stacked vertically, Desktop: side by side */}
                                <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                                    {/* Score Circle - Mobile-optimized sizing */}
                                    <div className="relative flex-shrink-0">
                                        <div className={cn(
                                            "absolute inset-0 blur-2xl opacity-50",
                                            getGradeInfo(result.grade).bg
                                        )} />
                                        <div className={cn(
                                            // Mobile-first: smaller circle on mobile
                                            "relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl",
                                            getGradeInfo(result.grade).border,
                                            getGradeInfo(result.grade).bg,
                                            getGradeInfo(result.grade).glow
                                        )}>
                                            <span className={cn("text-3xl sm:text-4xl font-black", getGradeInfo(result.grade).color)}>
                                                {result.ats_score}
                                            </span>
                                            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">/100</span>
                                        </div>
                                        {/* Grade Badge - Mobile-optimized */}
                                        <div className={cn(
                                            "absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-black text-sm sm:text-base lg:text-lg border-2",
                                            getGradeInfo(result.grade).bg,
                                            getGradeInfo(result.grade).border,
                                            getGradeInfo(result.grade).color
                                        )}>
                                            {result.grade}
                                        </div>
                                    </div>

                                    {/* Summary & Scores */}
                                    <div className="flex-1 text-center md:text-left w-full">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Análisis Completado</h2>
                                        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">{result.summary}</p>

                                        {/* Mobile-first: stacked on very small, 3-col on sm+ */}
                                        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
                                            {[
                                                { label: 'Formato', score: result.format_score, color: 'from-primary to-primary/80' },
                                                { label: 'Keywords', score: result.keyword_score, color: 'from-purple-500 to-purple-400' },
                                                { label: 'Completitud', score: result.completeness_score, color: 'from-amber-500 to-amber-400' },
                                            ].map((item, idx) => (
                                                <div key={item.label} className="space-y-1.5 sm:space-y-2">
                                                    <div className="flex justify-between text-xs sm:text-sm">
                                                        <span className="text-muted-foreground">{item.label}</span>
                                                        <span className={cn("font-bold", getScoreColor(item.score))}>
                                                            {item.score}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 sm:h-2 rounded-full bg-muted overflow-hidden">
                                                        <motion.div
                                                            className={cn("h-full bg-gradient-to-r rounded-full", item.color)}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${item.score}%` }}
                                                            transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mobile-first Tabs - Scrollable on mobile, grid on desktop */}
                        <div className="space-y-3 sm:space-y-4">
                            {/* Custom mobile-optimized tabs */}
                            <div className="relative">
                                {/* Mobile: Horizontal scrollable tabs */}
                                <div className="flex sm:grid sm:grid-cols-4 gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                                    {tabsConfig.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.value;
                                        return (
                                            <button
                                                key={tab.value}
                                                onClick={() => setActiveTab(tab.value)}
                                                className={cn(
                                                    // Mobile-first: min-w-[72px] ensures touch target, flex-shrink-0 prevents squishing
                                                    "flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 min-w-[72px] sm:min-w-0",
                                                    isActive
                                                        ? "bg-background shadow-lg shadow-black/5 text-foreground border border-border/50"
                                                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                )}
                                            >
                                                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                {/* Show short label on mobile, full on sm+ */}
                                                <span className="hidden sm:inline">{tab.label}</span>
                                                <span className="sm:hidden">{tab.shortLabel}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Fade indicator for mobile scroll */}
                                <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent sm:hidden pointer-events-none" />
                            </div>

                            {/* Tab Content with AnimatePresence for smooth transitions */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Issues Tab */}
                                    {activeTab === 'issues' && (
                                        <div className="space-y-2 sm:space-y-3">
                                            {result.issues.length === 0 ? (
                                                <Card className="bg-emerald-500/5 border-emerald-500/20">
                                                    <CardContent className="flex items-center gap-3 sm:gap-4 py-4 sm:py-6 px-4 sm:px-6">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-emerald-600 text-sm sm:text-base">¡Excelente!</h3>
                                                            <p className="text-xs sm:text-sm text-muted-foreground">No se detectaron problemas críticos en tu CV.</p>
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
                                                            <CardContent className="p-3 sm:p-4">
                                                                <div className="flex gap-3 sm:gap-4">
                                                                    <div className={cn(
                                                                        // Mobile-optimized icon container
                                                                        "w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0",
                                                                        issue.severity === 'high' ? 'bg-red-500/10' :
                                                                            issue.severity === 'medium' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                                                                    )}>
                                                                        {getSeverityIcon(issue.severity)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-sm sm:text-base mb-0.5 sm:mb-1">{issue.message}</p>
                                                                        <p className="text-xs sm:text-sm text-muted-foreground flex items-start gap-1.5 sm:gap-2">
                                                                            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary mt-0.5 flex-shrink-0" />
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
                                    )}

                                    {/* Keywords Tab */}
                                    {activeTab === 'keywords' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <Card className="bg-emerald-500/5 border-emerald-500/20">
                                                <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                                    <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                                                        </div>
                                                        <span className="truncate">Keywords encontradas</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                        {result.found_keywords.length === 0 ? (
                                                            <p className="text-muted-foreground text-xs sm:text-sm">No se detectaron keywords</p>
                                                        ) : (
                                                            result.found_keywords.map((kw, idx) => (
                                                                <Badge key={idx} className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 text-xs">
                                                                    {kw}
                                                                </Badge>
                                                            ))
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-amber-500/5 border-amber-500/20">
                                                <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                                                    <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                                            <Search className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                                                        </div>
                                                        <span className="truncate">Keywords faltantes</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                        {result.missing_keywords.length === 0 ? (
                                                            <p className="text-muted-foreground text-xs sm:text-sm">¡Tu CV tiene todas las keywords!</p>
                                                        ) : (
                                                            result.missing_keywords.map((kw, idx) => (
                                                                <Badge key={idx} variant="outline" className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10 text-xs">
                                                                    {kw}
                                                                </Badge>
                                                            ))
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Quick Wins Tab */}
                                    {activeTab === 'quick' && (
                                        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                                            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                                                <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                                    </div>
                                                    Acciones rápidas para mejorar
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                                <div className="space-y-2 sm:space-y-3">
                                                    {result.quick_wins.map((win, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                        >
                                                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 shrink-0" />
                                                            <span className="text-sm sm:text-base leading-relaxed">{win}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Tips Tab */}
                                    {activeTab === 'tips' && (
                                        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                                            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                                                <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                                        <LayoutTemplate className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                                                    </div>
                                                    Consejos detallados
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-sm sm:text-base">
                                                        {result.detailed_tips || 'No hay consejos adicionales disponibles.'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Analyze Another - Mobile-first button */}
                        <div className="text-center pt-4 sm:pt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFile(null);
                                    setResult(null);
                                }}
                                className="gap-2 rounded-xl text-sm sm:text-base h-10 sm:h-11 w-full sm:w-auto"
                            >
                                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Analizar otro CV
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
