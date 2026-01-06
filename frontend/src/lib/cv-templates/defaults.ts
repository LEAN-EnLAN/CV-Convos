import { TemplateConfig } from '@/types/cv';

export const DEFAULT_CONFIG: TemplateConfig = {
    colors: {
        primary: '#059669', // Emerald 600
        secondary: '#0f172a', // Slate 900
        accent: '#10b981', // Emerald 500
        background: '#ffffff',
        text: '#1e293b', // Slate 800
    },
    fonts: {
        heading: 'Inter',
        body: 'Inter',
    },
    layout: {
        sidebarWidth: 280,
        contentGap: 24,
        sectionGap: 32,
        density: 'standard',
        showExpertiseBar: true,
        expertiseBarStyle: 'gradient',
    },
    sections: {
        summary: { visible: true, title: 'Sobre Mí' },
        experience: { visible: true, title: 'Experiencia Laboral' },
        education: { visible: true, title: 'Educación' },
        skills: { visible: true, title: 'Habilidades' },
        projects: { visible: true, title: 'Proyectos' },
        languages: { visible: true, title: 'Idiomas' },
        certifications: { visible: true, title: 'Certificaciones' },
        interests: { visible: true, title: 'Intereses' },
    },
};

export const BRUTALIST_CONFIG: TemplateConfig = {
    colors: {
        primary: '#000000',
        secondary: '#000000',
        accent: '#ffffff',
        background: '#ffffff',
        text: '#000000',
    },
    fonts: {
        heading: 'Space Mono',
        body: 'Space Mono',
    },
    layout: {
        sidebarWidth: 300,
        contentGap: 0,
        sectionGap: 0,
        density: 'compact',
        showExpertiseBar: false,
        expertiseBarStyle: 'solid',
    },
    sections: {
        summary: { visible: true, title: 'SUMMARY' },
        experience: { visible: true, title: 'EXPERIENCE' },
        education: { visible: true, title: 'EDUCATION' },
        skills: { visible: true, title: 'SKILLS' },
        projects: { visible: true, title: 'PROJECTS' },
        languages: { visible: true, title: 'LANGUAGES' },
        certifications: { visible: true, title: 'CERTIFICATIONS' },
        interests: { visible: true, title: 'INTERESTS' },
    },
};
