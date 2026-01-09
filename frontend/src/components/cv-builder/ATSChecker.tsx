'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { motion } from 'framer-motion';

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
    { value: 'general', label: 'General', icon: '📋' },
    { value: 'tech', label: 'Tecnología', icon: '💻' },
    { value: 'finance', label: 'Finanzas', icon: '📊' },
    { value: 'healthcare', label: 'Salud', icon: '🏥' },
    { value: 'creative', label: 'Creativo', icon: '🎨' },
    { value: 'education', label: 'Educación', icon: '📚' },
];

export function ATSChecker() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ATSResult | null>(null);
    const [selectedIndustry, setSelectedIndustry] = useState('general');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 text-sm font-bold mb-6">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            ATS Checker
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                        ¿Tu CV pasa el{' '}
                        <span className="bg-gradient-to-r from-primary via-primary to-purple-500 bg-clip-text text-transparent">
                            filtro ATS?
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Subí tu CV y te analizamos como lo haría un sistema de contratación real.
                        Descubrí qué keywords faltan y cómo mejorarlo.
                    </p>
                </motion.div>

                {/* Industry Selection */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        ¿Para qué industria?
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {industries.map((ind) => (
                            <button
                                key={ind.value}
                                onClick={() => setSelectedIndustry(ind.value)}
                                className={cn(
                                    "group relative p-4 rounded-xl border-2 text-center transition-all duration-200 overflow-hidden",
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
                                    <div className="text-2xl mb-2">{ind.icon}</div>
                                    <div className={cn(
                                        "text-xs font-bold transition-colors",
                                        selectedIndustry === ind.value ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {ind.label}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Upload Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
                        <CardContent className="pt-6">
                            <div
                                {...getRootProps()}
                                className={cn(
                                    "relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300",
                                    isDragActive
                                        ? "border-primary bg-primary/10 scale-[1.01]"
                                        : file
                                            ? "border-primary/30 bg-primary/5"
                                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                                )}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center gap-4">
                                    <div className={cn(
                                        "w-20 h-20 rounded-2xl flex items-center justify-center transition-all",
                                        file
                                            ? "bg-primary/10 shadow-lg shadow-primary/20"
                                            : "bg-muted"
                                    )}>
                                        {file ? (
                                            <FileText className="w-10 h-10 text-primary" />
                                        ) : (
                                            <Upload className="w-10 h-10 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        {file ? (
                                            <div className="space-y-1">
                                                <p className="font-bold text-lg">{file.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="font-bold text-lg">
                                                    {isDragActive ? 'Soltá el archivo aquí' : 'Arrastrá y soltá tu CV'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    o hacé click para seleccionar (PDF, DOCX, TXT)
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
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Cambiar archivo
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Analyze Button */}
                {file && !result && (
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Button
                            size="lg"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="gap-3 h-14 px-10 text-base rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analizando...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Analizar CV
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}

                {/* Results */}
                {result && (
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Score Overview - Premium Design */}
                        <Card className="overflow-hidden bg-white/5 backdrop-blur-xl border-white/10">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    {/* Score Circle - Big & Bold */}
                                    <div className="relative">
                                        <div className={cn(
                                            "absolute inset-0 blur-2xl opacity-50",
                                            getGradeInfo(result.grade).bg
                                        )} />
                                        <div className={cn(
                                            "relative w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl",
                                            getGradeInfo(result.grade).border,
                                            getGradeInfo(result.grade).bg,
                                            getGradeInfo(result.grade).glow
                                        )}>
                                            <span className={cn("text-4xl font-black", getGradeInfo(result.grade).color)}>
                                                {result.ats_score}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-medium">/100</span>
                                        </div>
                                        {/* Grade Badge */}
                                        <div className={cn(
                                            "absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-2",
                                            getGradeInfo(result.grade).bg,
                                            getGradeInfo(result.grade).border,
                                            getGradeInfo(result.grade).color
                                        )}>
                                            {result.grade}
                                        </div>
                                    </div>

                                    {/* Summary & Scores */}
                                    <div className="flex-1 text-center md:text-left">
                                        <h2 className="text-2xl font-bold mb-2">Análisis Completado</h2>
                                        <p className="text-muted-foreground mb-6">{result.summary}</p>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Formato</span>
                                                    <span className={cn("font-bold", getScoreColor(result.format_score))}>
                                                        {result.format_score}%
                                                    </span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${result.format_score}%` }}
                                                        transition={{ duration: 0.8, delay: 0.2 }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Keywords</span>
                                                    <span className={cn("font-bold", getScoreColor(result.keyword_score))}>
                                                        {result.keyword_score}%
                                                    </span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${result.keyword_score}%` }}
                                                        transition={{ duration: 0.8, delay: 0.3 }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Completitud</span>
                                                    <span className={cn("font-bold", getScoreColor(result.completeness_score))}>
                                                        {result.completeness_score}%
                                                    </span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${result.completeness_score}%` }}
                                                        transition={{ duration: 0.8, delay: 0.4 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Tabs defaultValue="issues" className="space-y-4">
                            <TabsList className="grid grid-cols-4 gap-2 h-auto p-1 bg-muted/50 rounded-xl">
                                <TabsTrigger value="issues" className="gap-2 rounded-lg py-2.5 data-[state=active]:shadow-lg">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="hidden sm:inline">Problemas</span>
                                </TabsTrigger>
                                <TabsTrigger value="keywords" className="gap-2 rounded-lg py-2.5 data-[state=active]:shadow-lg">
                                    <Search className="w-4 h-4" />
                                    <span className="hidden sm:inline">Keywords</span>
                                </TabsTrigger>
                                <TabsTrigger value="quick" className="gap-2 rounded-lg py-2.5 data-[state=active]:shadow-lg">
                                    <Zap className="w-4 h-4" />
                                    <span className="hidden sm:inline">Quick Wins</span>
                                </TabsTrigger>
                                <TabsTrigger value="tips" className="gap-2 rounded-lg py-2.5 data-[state=active]:shadow-lg">
                                    <LayoutTemplate className="w-4 h-4" />
                                    <span className="hidden sm:inline">Consejos</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="issues" className="space-y-3">
                                {result.issues.length === 0 ? (
                                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                                        <CardContent className="flex items-center gap-4 py-6">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
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
                                            transition={{ delay: idx * 0.1 }}
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
                                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                            issue.severity === 'high' ? 'bg-red-500/10' :
                                                                issue.severity === 'medium' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                                                        )}>
                                                            {getSeverityIcon(issue.severity)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium mb-1">{issue.message}</p>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                                                {issue.fix}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="keywords" className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
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
                                            <CardTitle className="text-lg flex items-center gap-2">
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
                            </TabsContent>

                            <TabsContent value="quick">
                                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <TrendingUp className="w-4 h-4 text-primary" />
                                            </div>
                                            Acciones rápidas para mejorar
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {result.quick_wins.map((win, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                >
                                                    <ChevronRight className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                                    <span>{win}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="tips">
                                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                <LayoutTemplate className="w-4 h-4 text-purple-500" />
                                            </div>
                                            Consejos detallados
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                                {result.detailed_tips || 'No hay consejos adicionales disponibles.'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Analyze Another */}
                        <div className="text-center pt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFile(null);
                                    setResult(null);
                                }}
                                className="gap-2 rounded-xl"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Analizar otro CV
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
