import { TemplateConfig } from '@/types/cv';

export const DEFAULT_CONFIG: TemplateConfig = {
    colors: {
        primary: 'oklch(0.55 0.18 155)', // Sentinel Emerald
        secondary: 'oklch(0.15 0.02 280)', // Sentinel Slate
        accent: 'oklch(0.70 0.12 175)', // Sentinel Teal
        background: 'oklch(1 0 0)', // White
        text: 'oklch(0.15 0.02 280)', // Sentinel Slate
    },
    fonts: {
        heading: '"Inter"',
        body: '"Inter"',
    },
    layout: {
        sidebarWidth: 280,
        contentGap: 24,
        sectionGap: 32,
        density: 'standard',
        showExpertiseBar: true,
        expertiseBarStyle: 'bars',
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
        tools: { visible: true, title: 'Herramientas' },
    },
};

export const BRUTALIST_CONFIG: TemplateConfig = {
    colors: {
        primary: 'oklch(0.55 0.18 155)', // Sentinel Emerald
        secondary: 'oklch(0.15 0.02 280)', // Sentinel Slate
        accent: 'oklch(0.70 0.12 175)', // Sentinel Teal
        background: 'oklch(1 0 0)', // White
        text: 'oklch(0.15 0.02 280)', // Sentinel Slate
    },
    fonts: {
        heading: '"Space Mono"',
        body: '"Space Mono"',
    },
    layout: {
        sidebarWidth: 300,
        contentGap: 0,
        sectionGap: 0,
        density: 'compact',
        showExpertiseBar: false,
        expertiseBarStyle: 'bars',
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
        tools: { visible: true, title: 'TOOLS' },
    },
};
