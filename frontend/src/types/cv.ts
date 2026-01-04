export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
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
}

export interface CVData {
    personalInfo: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    languages: Language[];
    certifications: Certification[];
}

export type CVTemplate = 'professional' | 'modern' | 'minimalist' | 'creative';
