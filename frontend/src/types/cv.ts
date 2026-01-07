export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    availability?: string;
    role?: string; // Titulo/Subtitulo (ej: Senior Frontend Developer)
    summary: string;
}

export interface Experience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    location: string;
    description: string;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    location: string;
    description?: string;
}

export interface Skill {
    id: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    proficiency: number; // 0-100
    category?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    url?: string;
    technologies: string[];
}

export interface Language {
    id: string;
    language: string;
    fluency: 'Native' | 'Fluent' | 'Conversational' | 'Basic';
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
}

export interface Interest {
    id: string;
    name: string;
    keywords?: string[]; // Para palabras clave relacionadas
}

export type CVTemplate = 'professional' | 'harvard' | 'minimal' | 'creative' | 'tech' | 'bian';

export interface SectionConfig {
    visible: boolean;
    title?: string;
    layout?: 'standard' | 'compact' | 'grid';
}

export interface TemplateConfig {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
    layout: {
        sidebarWidth?: number;
        contentGap: number;
        sectionGap: number;
        density: 'compact' | 'standard' | 'relaxed';
        showExpertiseBar: boolean;
        expertiseBarStyle: 'solid' | 'gradient' | 'dots';
    };
    sections: {
        summary: SectionConfig;
        experience: SectionConfig;
        education: SectionConfig;
        skills: SectionConfig;
        projects: SectionConfig;
        languages: SectionConfig;
        certifications: SectionConfig;
        interests: SectionConfig;
    };
}

export interface CVData {
    personalInfo: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    languages: Language[];
    certifications: Certification[];
    interests: Interest[];
    tools?: string[]; // Herramientas y sistemas (ej: Git, Jira, AWS)
    config?: TemplateConfig;
}

export interface ImprovementCard {
    id: string;
    target_field: string;
    category: 'Impact' | 'Brevity' | 'Grammar' | 'Formatting';
    severity: 'Critical' | 'Suggested' | 'Nitpick';
    title: string;
    description: string;
    impact_reason: string;
    original_text: string;
    suggested_text: string;
}

export interface CritiqueResponse {
    score: number;
    one_page_viable: boolean;
    word_count_estimate: number;
    overall_verdict: string;
    critique: ImprovementCard[];
}
