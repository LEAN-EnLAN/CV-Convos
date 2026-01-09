'use client';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { WizardSteps } from './WizardSteps';
import { StepInfoPersonal } from './StepInfoPersonal';
import { StepExperiencia } from './StepExperiencia';
import { StepSkills } from './StepSkills';
import { PersonalInfo, Experience, Skill } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { CVData } from '@/types/cv';

interface WizardLayoutProps {
    onComplete: (data: CVData) => void;
    onBack: () => void;
}

const steps = [
    { label: 'Info Personal', description: 'Datos básicos' },
    { label: 'Experiencia', description: 'Trayectoria' },
    { label: 'Skills', description: 'Habilidades' }
];

export function WizardLayout({ onComplete, onBack }: WizardLayoutProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: ''
    });
    const [experience, setExperience] = useState<Experience[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);

    const handlePersonalInfoComplete = (data: PersonalInfo) => {
        setPersonalInfo(data);
        setCurrentStep(2);
    };

    const handleExperienceComplete = (data: Experience[]) => {
        setExperience(data);
        setCurrentStep(3);
    };

    const handleSkillsComplete = (data: Skill[]) => {
        setSkills(data);
        const cvData: CVData = {
            personalInfo,
            experience,
            skills: data,
            education: [],
            projects: [],
            languages: [],
            certifications: [],
            interests: []
        };
        onComplete(cvData);
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            onBack();
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="relative overflow-hidden flex-1">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={goBack}
                            className="mb-6 px-0 hover:bg-transparent hover:text-primary"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Button>

                        <WizardSteps
                            currentStep={currentStep}
                            steps={steps}
                            className="mb-8"
                        />
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                        {currentStep === 1 && (
                            <StepInfoPersonal
                                data={personalInfo}
                                onUpdate={handlePersonalInfoComplete}
                                onNext={() => setCurrentStep(2)}
                            />
                        )}

                        {currentStep === 2 && (
                            <StepExperiencia
                                data={experience}
                                onUpdate={handleExperienceComplete}
                                onNext={() => setCurrentStep(3)}
                                onBack={() => setCurrentStep(1)}
                            />
                        )}

                        {currentStep === 3 && (
                            <StepSkills
                                data={skills}
                                onUpdate={setSkills}
                                onNext={() => {}}
                                onBack={() => setCurrentStep(2)}
                                onComplete={() => handleSkillsComplete(skills)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
