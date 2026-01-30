'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileUploader } from '@/components/cv-builder/FileUploader';
import { OnboardingSelection } from '@/components/cv-builder/onboarding/OnboardingSelection';
import { WizardLayout } from '@/components/cv-builder/wizard/WizardLayout';
import { TemplateGallery } from '@/components/cv-builder/templates/TemplateGallery';
import { Builder } from '@/components/cv-builder/Builder';
import { CVData, CVTemplate } from '@/types/cv';
import { Toaster } from 'sonner';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';

type FlowState = 'onboarding' | 'wizard' | 'template-gallery' | 'upload' | 'builder';

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
    const router = useRouter();
    const [flow, setFlow] = useState<FlowState>('onboarding');
    const [cvData, setCvData] = useState<CVData | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate>('creative');

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
            router.push('/chat');
        }
    };

    const handleWizardComplete = (data: CVData) => {
        setCvData(sanitizeData(data));
        setFlow('template-gallery');
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
        setFlow('template-gallery');
    };

    const handleReset = () => {
        setCvData(null);
        setFlow('onboarding');
        setSelectedTemplate('creative');
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
                    onBack={() => setFlow('wizard')}
                />
            )}

            {flow === 'upload' && (
                <FileUploader onSuccess={handleFileUploadSuccess} />
            )}

            {flow === 'builder' && cvData && (
                <Builder
                    initialData={{ ...cvData, config: cvData.config || { ...DEFAULT_CONFIG } }}
                    onReset={handleReset}
                    initialTemplate={selectedTemplate}
                />
            )}
        </main>
    );
}
