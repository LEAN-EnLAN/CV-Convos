'use client';

import React, { useState, useCallback } from 'react';
import { Wand2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CVData, CVTemplate } from '@/types/cv';
import {
    generateCompleteCV,
    CVGeneratorApiError,
    getSupportedTemplates,
    isValidTemplateType,
} from '@/lib/api/cv-generator';
import { GenerateCompleteCVResponse } from '@/types/cv-generator';
import { cn } from '@/lib/utils';

/**
 * GeneratorButton Component
 * 
 * A button component that triggers CV generation with AI enhancement.
 * Displays loading state, success/error feedback, and handles retries.
 */

interface GeneratorButtonProps {
    /** Current CV data to enhance */
    cvData: CVData;
    /** Selected template type */
    templateType: CVTemplate;
    /** Callback when generation is successful */
    onSuccess?: (response: GenerateCompleteCVResponse) => void;
    /** Callback when generation fails */
    onError?: (error: Error) => void;
    /** Additional CSS classes */
    className?: string;
    /** Button variant */
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
    /** Button size */
    size?: 'default' | 'sm' | 'lg' | 'icon';
    /** Whether the button is disabled */
    disabled?: boolean;
}

type GeneratorState = 'idle' | 'loading' | 'success' | 'error';

export function GeneratorButton({
    cvData,
    templateType,
    onSuccess,
    onError,
    className,
    variant = 'default',
    size = 'default',
    disabled = false,
}: GeneratorButtonProps) {
    const [state, setState] = useState<GeneratorState>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleClick = useCallback(async () => {
        // Validate template type
        if (!isValidTemplateType(templateType)) {
            const error = new Error(`Invalid template type: ${templateType}`);
            setErrorMessage(`Invalid template type: ${templateType}`);
            setState('error');
            onError?.(error);
            return;
        }

        // Validate CV data
        if (!cvData || !cvData.personalInfo) {
            const error = new Error('CV data is required');
            setErrorMessage('Please fill in your personal information first');
            setState('error');
            onError?.(error);
            return;
        }

        setState('loading');
        setErrorMessage(null);

        try {
            const response = await generateCompleteCV(cvData, templateType, {
                signal: undefined, // Could add AbortController support
            });

            setState('success');
            onSuccess?.(response);

            // Reset success state after 3 seconds
            setTimeout(() => {
                setState('idle');
            }, 3000);
        } catch (error) {
            const apiError = error as CVGeneratorApiError;
            const message = apiError.message || 'Failed to generate CV. Please try again.';
            
            setErrorMessage(message);
            setState('error');
            onError?.(apiError);

            // Reset error state after 5 seconds
            setTimeout(() => {
                setState('idle');
                setErrorMessage(null);
            }, 5000);
        }
    }, [cvData, templateType, onSuccess, onError]);

    const getButtonContent = () => {
        switch (state) {
            case 'loading':
                return (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                    </>
                );
            case 'success':
                return (
                    <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Generated!</span>
                    </>
                );
            case 'error':
                return (
                    <>
                        <AlertCircle className="h-4 w-4" />
                        <span>Error</span>
                    </>
                );
            default:
                return (
                    <>
                        <Wand2 className="h-4 w-4" />
                        <span>Generate CV</span>
                    </>
                );
        }
    };

    const isDisabled = disabled || state === 'loading';

    return (
        <div className="flex flex-col gap-2">
            <Button
                variant={state === 'error' ? 'destructive' : variant}
                size={size}
                onClick={handleClick}
                disabled={isDisabled}
                className={cn(
                    'min-w-[140px] transition-all duration-200',
                    state === 'success' && 'bg-green-600 hover:bg-green-700',
                    className
                )}
            >
                {getButtonContent()}
            </Button>
            
            {state === 'error' && errorMessage && (
                <p className="text-sm text-destructive px-2">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}

/**
 * GeneratorStatus Component
 * Displays the current generation status and metadata
 */
interface GeneratorStatusProps {
    response: GenerateCompleteCVResponse | null;
    className?: string;
}

export function GeneratorStatus({ response, className }: GeneratorStatusProps) {
    if (!response) {
        return null;
    }

    const { metadata } = response;

    return (
        <div className={cn('flex flex-wrap gap-4 text-sm text-muted-foreground', className)}>
            <div className="flex items-center gap-2">
                <span className="font-medium">Completeness:</span>
                <span>{metadata.completeness_score}%</span>
            </div>
            
            <div className="flex items-center gap-2">
                <span className="font-medium">Sections:</span>
                <span>{metadata.sections.length}</span>
            </div>
            
            <div className="flex items-center gap-2">
                <span className="font-medium">Template:</span>
                <span className="capitalize">{metadata.template_type}</span>
            </div>
        </div>
    );
}

/**
 * GeneratorWithPreview Component
 * Combines generator button with preview and status
 */
interface GeneratorWithPreviewProps {
    cvData: CVData;
    templateType: CVTemplate;
    onSuccess?: (response: GenerateCompleteCVResponse) => void;
    onError?: (error: Error) => void;
}

export function GeneratorWithPreview({
    cvData,
    templateType,
    onSuccess,
    onError,
}: GeneratorWithPreviewProps) {
    const [response, setResponse] = useState<GenerateCompleteCVResponse | null>(null);

    const handleSuccess = useCallback((result: GenerateCompleteCVResponse) => {
        setResponse(result);
        onSuccess?.(result);
    }, [onSuccess]);

    const handleError = useCallback((error: Error) => {
        onError?.(error);
    }, [onError]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <GeneratorButton
                    cvData={cvData}
                    templateType={templateType}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
                <GeneratorStatus response={response} />
            </div>
        </div>
    );
}

export default GeneratorButton;
