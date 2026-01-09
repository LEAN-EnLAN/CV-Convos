'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStepsProps {
    currentStep: number;
    steps: { label: string; description?: string }[];
    className?: string;
}

export function WizardSteps({ currentStep, steps, className }: WizardStepsProps) {
    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <React.Fragment key={step.label}>
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className={cn(
                                        "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                                        isCompleted && "bg-primary text-primary-foreground",
                                        isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                                        !isCompleted && !isCurrent && "bg-white/10 text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-bold">{stepNumber}</span>
                                    )}
                                </div>
                                <div className="flex flex-col items-center">
                                    <span
                                        className={cn(
                                            "text-sm font-semibold transition-colors duration-300",
                                            isCurrent ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                    {step.description && (
                                        <span className="text-xs text-muted-foreground/70">
                                            {step.description}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 mx-4">
                                    <div className="h-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full bg-primary transition-all duration-500",
                                                stepNumber < currentStep ? "w-full" : "w-0"
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
