'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    X,
    Minimize2,
    Save,
    Download,
    FileText,
    ChevronRight,
    ChevronDown,
    Circle,
    RotateCcw,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';

interface SectionProgress {
    name: string;
    completed: boolean;
    progress: number;
}

interface FloatingProgressProps {
    percentage: number;
    sections: SectionProgress[];
    isSaving: boolean;
    lastSaved: Date | null;
    onSave?: () => void;
    onDownload?: () => void;
    onPreview?: () => void;
}

// ============================================
// ANIMATION CONFIGURATION - PREMIUM TIMING
// ============================================
const ANIMATION = {
    // Spring physics for organic, fluid motion
    spring: {
        gentle: { type: 'spring', stiffness: 120, damping: 15, mass: 0.8 },
        bouncy: { type: 'spring', stiffness: 180, damping: 12, mass: 0.6 },
        elastic: { type: 'spring', stiffness: 200, damping: 10, mass: 0.5 },
        snappy: { type: 'spring', stiffness: 300, damping: 25, mass: 0.4 },
        smooth: { type: 'spring', stiffness: 80, damping: 20, mass: 1 },
    },
    // Orchestrated timing delays
    stagger: {
        fast: 0.03,
        normal: 0.05,
        slow: 0.08,
        cascade: 0.1,
    },
    // Easing curves
    ease: {
        outExpo: [0.16, 1, 0.3, 1],
        outQuart: [0.25, 1, 0.5, 1],
        outBack: [0.34, 1.56, 0.64, 1],
        inOutQuint: [0.83, 0, 0.17, 1],
    }
} as const;

// ============================================
// ANIMATED PROGRESS BAR COMPONENT
// ============================================
function AnimatedProgressBar({
    value,
    isComplete
}: {
    value: number;
    isComplete: boolean;
}) {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        stiffness: 60,
        damping: 20,
        mass: 0.8,
    });

    const width = useTransform(springValue, [0, 100], ['0%', '100%']);
    const glowOpacity = useTransform(springValue, [0, 50, 100], [0, 0.3, 0.6]);

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    return (
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/60">
            {/* Track background with subtle gradient */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40" />

            {/* Animated fill */}
            <motion.div
                className={cn(
                    "absolute inset-y-0 left-0 rounded-full",
                    isComplete
                        ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500"
                        : "bg-gradient-to-r from-primary via-primary/90 to-primary"
                )}
                style={{ width }}
            >
                {/* Shimmer effect */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                        opacity: glowOpacity,
                    }}
                    animate={{
                        x: ['-100%', '200%'],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                        repeatDelay: 1,
                    }}
                />

                {/* Leading edge glow */}
                <div
                    className={cn(
                        "absolute right-0 top-1/2 -translate-y-1/2 w-4 h-full blur-sm",
                        isComplete ? "bg-emerald-400" : "bg-primary/60"
                    )}
                />
            </motion.div>

            {/* Completion sparkle */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={ANIMATION.spring.bouncy}
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                    >
                        <Sparkles className="w-3 h-3 text-white" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================
// CHECKLIST ITEM COMPONENT
// ============================================
function ChecklistItem({
    section,
    index,
    isExpanded
}: {
    section: SectionProgress;
    index: number;
    isExpanded: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
                ...ANIMATION.spring.gentle,
                delay: index * ANIMATION.stagger.normal,
            }}
            className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "transition-colors duration-200",
                "hover:bg-muted/60",
                section.completed
                    ? "bg-emerald-500/[0.03]"
                    : "bg-muted/20"
            )}
        >
            {/* Animated status indicator */}
            <div className="relative shrink-0">
                <AnimatePresence mode="wait">
                    {section.completed ? (
                        <motion.div
                            key="completed"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={ANIMATION.spring.elastic}
                            className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25"
                        >
                            <motion.svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <motion.path
                                    d="M2.5 7L5.5 10L11.5 4"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.3, delay: 0.15 }}
                                />
                            </motion.svg>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="pending"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={ANIMATION.spring.gentle}
                            className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center group-hover:border-muted-foreground/40 transition-colors"
                        >
                            <Circle className="w-2.5 h-2.5 text-muted-foreground/40" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Section name */}
            <span className={cn(
                "text-sm flex-1 truncate transition-all duration-200",
                section.completed
                    ? "text-foreground font-medium"
                    : "text-muted-foreground group-hover:text-foreground/80"
            )}>
                {section.name}
            </span>

            {/* Progress percentage */}
            <motion.span
                className={cn(
                    "text-xs font-semibold tabular-nums transition-colors duration-200",
                    section.completed
                        ? "text-emerald-600"
                        : "text-muted-foreground/60"
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * ANIMATION.stagger.normal + 0.1 }}
            >
                {Math.round(section.progress)}%
            </motion.span>
        </motion.div>
    );
}

// ============================================
// SAVING INDICATOR COMPONENT
// ============================================
function SavingIndicator({ isSaving, lastSaved }: { isSaving: boolean; lastSaved: Date | null }) {
    return (
        <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
                {isSaving ? (
                    <motion.div
                        key="saving"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                    >
                        <div className="flex gap-0.5">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                    animate={{
                                        y: [0, -4, 0],
                                        opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        delay: i * 0.15,
                                        ease: 'easeInOut',
                                    }}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-medium text-emerald-600">Guardando...</span>
                    </motion.div>
                ) : lastSaved ? (
                    <motion.div
                        key="saved"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                    >
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.4 }}
                        />
                        <span className="text-xs text-muted-foreground">
                            Guardado {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                        <span className="text-xs text-muted-foreground/70">Sin cambios</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function FloatingProgress({
    percentage,
    sections,
    isSaving,
    lastSaved,
    onSave,
    onDownload,
    onPreview
}: FloatingProgressProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // Hydration safety
    useEffect(() => {
        setIsMounted(true);
        const saved = sessionStorage.getItem('cv-progress-visible');
        if (saved !== null) {
            setIsVisible(saved === 'true');
        }
    }, []);

    const handleHide = () => {
        setIsVisible(false);
        sessionStorage.setItem('cv-progress-visible', 'false');
    };

    const handleShow = () => {
        setIsVisible(true);
        sessionStorage.setItem('cv-progress-visible', 'true');
    };

    const isComplete = percentage >= 100;
    const completedCount = sections.filter(s => s.completed).length;
    const totalCount = sections.length;

    // Animated percentage counter
    const motionPercentage = useMotionValue(0);
    const springPercentage = useSpring(motionPercentage, {
        stiffness: 50,
        damping: 15,
    });
    const displayPercentage = useTransform(springPercentage, (v) => Math.round(v));
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        motionPercentage.set(percentage);
    }, [percentage, motionPercentage]);

    useEffect(() => {
        const unsubscribe = displayPercentage.on('change', (v) => setDisplayValue(v));
        return unsubscribe;
    }, [displayPercentage]);

    if (!isMounted) return null;

    // Hidden state: floating button to reopen
    if (!isVisible) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={ANIMATION.spring.elastic}
                            className="fixed bottom-6 right-6 z-40 no-print"
                        >
                            <Button
                                onClick={handleShow}
                                size="icon"
                                className={cn(
                                    "w-14 h-14 rounded-full",
                                    "shadow-2xl",
                                    "transition-all duration-300",
                                    "hover:scale-110 hover:shadow-emerald-500/20",
                                    "active:scale-95",
                                    isComplete
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30"
                                        : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25"
                                )}
                            >
                                <motion.div
                                    animate={{ rotate: [0, -360] }}
                                    transition={{ duration: 0.6, ease: ANIMATION.ease.outExpo }}
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </motion.div>
                            </Button>
                        </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="font-medium">
                        <p>Mostrar progreso</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider>
            <AnimatePresence mode="wait">
                {isMinimized ? (
                    // Minimized state: compact circle
                    <motion.div
                        key="minimized"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={ANIMATION.spring.bouncy}
                        layoutId="progress-widget"
                        className="fixed bottom-6 right-6 z-40 no-print"
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={() => setIsMinimized(false)}
                                        size="icon"
                                        className={cn(
                                            "w-14 h-14 rounded-full",
                                            "shadow-2xl",
                                            "transition-colors duration-300",
                                            isComplete
                                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30"
                                                : "bg-card hover:bg-card/90 text-foreground shadow-black/10 border border-border"
                                        )}
                                    >
                                        <motion.span
                                            className="text-sm font-bold"
                                            key={displayValue}
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={ANIMATION.spring.snappy}
                                        >
                                            {displayValue}%
                                        </motion.span>
                                    </Button>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="font-medium">
                                <p>Expandir progreso</p>
                            </TooltipContent>
                        </Tooltip>
                    </motion.div>
                ) : (
                    // Expanded state: full panel
                    <motion.div
                        key="expanded"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={ANIMATION.spring.gentle}
                        layoutId="progress-widget"
                        className={cn(
                            "fixed bottom-6 right-6 z-40 no-print",
                            "w-80 rounded-2xl",
                            "bg-card/95 backdrop-blur-xl",
                            "border shadow-2xl",
                            "overflow-hidden",
                            isComplete && "border-emerald-500/20 shadow-emerald-500/10"
                        )}
                    >
                        <div className="p-4 space-y-4">
                            {/* Header with percentage and controls */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    {/* Large percentage and status */}
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <motion.span
                                            className={cn(
                                                "text-4xl font-black tracking-tight",
                                                isComplete ? "text-emerald-600" : "text-foreground"
                                            )}
                                            key={displayValue}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={ANIMATION.spring.bouncy}
                                        >
                                            {displayValue}%
                                        </motion.span>
                                        <motion.span
                                            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            {isComplete ? 'Completado' : 'En progreso'}
                                        </motion.span>
                                    </div>

                                    {/* Animated progress bar */}
                                    <AnimatedProgressBar value={percentage} isComplete={isComplete} />

                                    {/* Section counter */}
                                    <motion.p
                                        className="text-xs text-muted-foreground mt-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {completedCount} de {totalCount} secciones completadas
                                    </motion.p>
                                </div>

                                {/* Control buttons */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 hover:bg-muted transition-colors"
                                                    onClick={() => setIsMinimized(true)}
                                                >
                                                    <Minimize2 className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Minimizar</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                    onClick={handleHide}
                                                >
                                                    <X className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Cerrar</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Checklist sections */}
                            <div className="space-y-2">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "w-full justify-between h-10 px-3 rounded-xl",
                                            "text-xs font-semibold uppercase tracking-wide",
                                            "hover:bg-muted/80 transition-all duration-200",
                                            "group"
                                        )}
                                        onClick={() => setIsExpanded(!isExpanded)}
                                    >
                                        <span>Secciones del CV</span>
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={ANIMATION.spring.snappy}
                                        >
                                            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </motion.div>
                                    </Button>
                                </motion.div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{
                                                height: { ...ANIMATION.spring.smooth },
                                                opacity: { duration: 0.2 },
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-1 pt-1">
                                                <AnimatePresence>
                                                    {sections.map((section, index) => (
                                                        <ChecklistItem
                                                            key={section.name}
                                                            section={section}
                                                            index={index}
                                                            isExpanded={isExpanded}
                                                        />
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Action buttons */}
                            <motion.div
                                className="flex items-center gap-2 pt-3 border-t border-border/50"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                {onSave && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-9 w-9 hover:bg-muted transition-colors"
                                                    onClick={onSave}
                                                    disabled={isSaving}
                                                >
                                                    <motion.div
                                                        animate={isSaving ? { rotate: 360 } : { rotate: 0 }}
                                                        transition={{ duration: 1, repeat: isSaving ? Infinity : 0, ease: 'linear' }}
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </motion.div>
                                                </Button>
                                            </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Guardar</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                                {onDownload && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-9 w-9 hover:bg-muted transition-colors"
                                                    onClick={onDownload}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Descargar PDF</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                                {onPreview && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-9 w-9 hover:bg-muted transition-colors"
                                                    onClick={onPreview}
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </Button>
                                            </motion.div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Previsualizar</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </motion.div>

                            {/* Footer with status */}
                            <motion.div
                                className="flex items-center justify-between pt-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <SavingIndicator isSaving={isSaving} lastSaved={lastSaved} />

                                <AnimatePresence>
                                    {isComplete && (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0, x: 20 }}
                                            animate={{ scale: 1, opacity: 1, x: 0 }}
                                            exit={{ scale: 0.8, opacity: 0, x: 20 }}
                                            transition={ANIMATION.spring.bouncy}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                                        >
                                            <motion.div
                                                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                                                Listo
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </TooltipProvider>
    );
}
