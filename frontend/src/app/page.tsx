'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { OnboardingSelection } from '@/components/cv-builder/onboarding/OnboardingSelection';
import { ConversationalWizard } from '@/components/cv-builder/wizard/ConversationalWizard';
import { CVData, CVTemplate } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { getDebugData } from '@/lib/debug-utils';
import { DEBUG_UI_ENABLED } from '@/lib/debug-flags';
import { ChatProvider } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const WizardLayout = dynamic(
    () => import('@/components/cv-builder/wizard/WizardLayout').then((mod) => mod.WizardLayout),
    {
        loading: () => (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Cargando asistente...
            </div>
        )
    }
);

const TemplateGallery = dynamic(
    () => import('@/components/cv-builder/templates/TemplateGallery').then((mod) => mod.TemplateGallery),
    {
        loading: () => (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Cargando plantillas...
            </div>
        )
    }
);

const FileUploader = dynamic(
    () => import('@/components/cv-builder/FileUploader').then((mod) => mod.FileUploader),
    {
        loading: () => (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Preparando carga...
            </div>
        )
    }
);

const Builder = dynamic(
    () => import('@/components/cv-builder/Builder').then((mod) => mod.Builder),
    {
        loading: () => (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                Preparando editor...
            </div>
        )
    }
);

type FlowState = 'onboarding' | 'wizard' | 'chat' | 'template-gallery' | 'upload' | 'builder';

const emptyCV: CVData = {
    personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    certifications: [],
    interests: []
};

export default function Home() {
    const searchParams = useSearchParams();
    const [flow, setFlow] = useState<FlowState>('onboarding');
    const [cvData, setCvData] = useState<CVData | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate>('creative');
    const [templateGallerySource, setTemplateGallerySource] = useState<
        'upload' | 'wizard' | null
    >(null);

    // Debug Mode Bypass
    useEffect(() => {
        const isDebug = searchParams.get('debug') === 'true';
        if (isDebug && DEBUG_UI_ENABLED && flow === 'onboarding') {
            setCvData(getDebugData());
            setFlow('builder');
        }
    }, [searchParams, flow]);

    useEffect(() => {
        if (flow !== 'onboarding') return;

        const storedData = localStorage.getItem('cv_data');
        if (!storedData) return;

        try {
            const parsed = JSON.parse(storedData) as CVData;
            const storedTemplate = localStorage.getItem('cv_template') as CVTemplate | null;
            setCvData(sanitizeData(parsed));
            if (storedTemplate) {
                setSelectedTemplate(storedTemplate);
            }
            if (searchParams.get('flow') === 'builder' || parsed) {
                setFlow('builder');
            }
        } catch (error) {
            console.error('Error al leer los datos del CV desde localStorage', error);
        }
    }, [flow, sanitizeData, searchParams]);

    const sanitizeData = useCallback((data: CVData): CVData => {
        return {
            ...emptyCV,
            ...data,
            config: data.config || { ...DEFAULT_CONFIG },
            experience: (data.experience || []).map(e => ({
                ...e,
                id: e.id || Math.random().toString(36).substr(2, 9)
            })),
            education: (data.education || []).map(e => ({
                ...e,
                id: e.id || Math.random().toString(36).substr(2, 9)
            })),
            skills: (data.skills || []).map(e => ({
                ...e,
                id: e.id || Math.random().toString(36).substr(2, 9)
            })),
            projects: (data.projects || []).map(e => ({
                ...e,
                id: e.id || Math.random().toString(36).substr(2, 9)
            })),
            languages: (data.languages || []).map(e => ({
                ...e,
                id: e.id || Math.random().toString(36).substr(2, 9)
            })),
            certifications: (data.certifications || []).map(e => ({
                ...e,
                id: e.id || Math.random().toString(36).substr(2, 9)
            })),
            interests: (data.interests || []).map(e => ({
                ...e,
                id: e.id || Math.random().toString(36).substr(2, 9)
            }))
        };
    }, []);

    const handleOnboardingSelect = (option: 'existing' | 'new') => {
        if (option === 'existing') {
            setFlow('upload');
        } else {
            setFlow('wizard');
        }
    };

    const handleWizardComplete = (data: CVData) => {
        setCvData(sanitizeData(data));
        setTemplateGallerySource('wizard');
        setFlow('chat');
    };

    const handleTemplateSelect = (template: CVTemplate) => {
        setSelectedTemplate(template);
        if (cvData) {
            const finalData = {
                ...cvData,
                config: {
                    ...DEFAULT_CONFIG,
                    ...cvData.config,
                    sections: {
                        ...DEFAULT_CONFIG.sections,
                        ...cvData.config?.sections
                    }
                }
            };
            setCvData(finalData);
        }
        setFlow('builder');
    };

    const handleFileUploadSuccess = (data: CVData) => {
        setCvData(sanitizeData(data));
        setTemplateGallerySource('upload');
        setFlow('chat');
    };

    const handleChatDataUpdate = useCallback((data: Partial<CVData>) => {
        setCvData(prev => {
            const baseData = prev ?? { ...emptyCV, config: { ...DEFAULT_CONFIG } };
            return {
                ...baseData,
                ...data,
                config: data.config ?? baseData.config
            };
        });
    }, []);

    const handleChatComplete = (data: CVData) => {
        setCvData(sanitizeData(data));
        setFlow('template-gallery');
    };

    const handleChatBack = () => {
        setFlow(templateGallerySource ?? 'onboarding');
    };

    const handleReset = () => {
        setCvData(null);
        setFlow('onboarding');
        setSelectedTemplate('creative');
        setTemplateGallerySource(null);
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            {flow === 'onboarding' && (
                <OnboardingSelection onSelectOption={handleOnboardingSelect} />
            )}

            {flow === 'wizard' && (
                <WizardLayout
                    onComplete={handleWizardComplete}
                    onBack={() => setFlow('onboarding')}
                />
            )}

            {flow === 'template-gallery' && cvData && (
                <TemplateGallery
                    onSelect={handleTemplateSelect}
                    onBack={() => setFlow(templateGallerySource ?? 'onboarding')}
                />
            )}

            {flow === 'chat' && cvData && (
                <div className="relative h-screen">
                    <div className="absolute left-6 top-6 z-50">
                        <Button
                            variant="ghost"
                            onClick={handleChatBack}
                            className="px-3 hover:bg-muted"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </div>
                    <ChatProvider initialCVData={cvData} onCVDataUpdate={handleChatDataUpdate}>
                        <ConversationalWizard
                            initialData={cvData}
                            onComplete={handleChatComplete}
                            onBack={handleChatBack}
                            selectedTemplate={selectedTemplate}
                            onTemplateChange={setSelectedTemplate}
                            showCVPreview
                        />
                    </ChatProvider>
                </div>
            )}

            {flow === 'upload' && (
                <FileUploader onSuccess={handleFileUploadSuccess} />
            )}

            {flow === 'builder' && cvData && (
                <ChatProvider initialCVData={cvData} onCVDataUpdate={handleChatDataUpdate}>
                    <Builder
                        initialData={{ ...cvData, config: cvData.config || { ...DEFAULT_CONFIG } }}
                        onReset={handleReset}
                        initialTemplate={selectedTemplate}
                    />
                </ChatProvider>
            )}
        </main>
    );
}
