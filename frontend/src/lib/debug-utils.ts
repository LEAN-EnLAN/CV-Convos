
import { CVData } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';

export const LOREM_CV_DATA: CVData = {
    personalInfo: {
        fullName: "Leandro Palombo",
        role: "Frontend Developer",
        email: "leandro.palombo@email.com",
        phone: "+54 9 341 2008643",
        location: "Rosario, Santa Fe",
        website: "leandrop.dev",
        linkedin: "linkedin.com/in/leandropalombo",
        github: "github.com/leandrop",
        summary: "Frontend developer focused on React, performance, and clean design systems. 5+ years building accessible web apps and collaborating with product teams to ship maintainable UI.",
    },
    experience: [
        {
            id: '1',
            company: "Rosario Tecno",
            position: "Frontend Developer",
            startDate: "2022-01",
            current: true,
            location: "Rosario",
            description: "Built reusable UI components that reduced feature delivery time by 30%. Led a redesign of the onboarding flow, improving activation by 18%."
        },
        {
            id: '2',
            company: "Freelancer",
            position: "Frontend Consultant",
            startDate: "2019-04",
            endDate: "2021-12",
            current: false,
            location: "Remote",
            description: "Maintained a component library used across four products. Partnered with backend teams to optimize API usage and reduce load times by 25%."
        }
    ],
    education: [
        {
            id: '1',
            institution: "Colegio San José",
            degree: "Tecnicatura",
            fieldOfStudy: "Desarrollo de Software",
            startDate: "2018-03",
            endDate: "2021-12",
            location: "Rosario, Santa Fe",
            description: "Énfasis en desarrollo web y arquitectura de frontend."
        }
    ],
    skills: [
        { id: '1', name: "React", level: "Expert", proficiency: 95 },
        { id: '2', name: "TypeScript", level: "Advanced", proficiency: 88 },
        { id: '3', name: "Next.js", level: "Advanced", proficiency: 85 },
        { id: '4', name: "CSS/Tailwind", level: "Advanced", proficiency: 90 },
        { id: '5', name: "Testing Library", level: "Intermediate", proficiency: 70 },
        { id: '6', name: "Accessibility", level: "Advanced", proficiency: 82 },
        { id: '7', name: "Design Systems", level: "Advanced", proficiency: 86 },
    ],
    projects: [
        {
            id: '1',
            name: "Product Onboarding Revamp",
            description: "Rebuilt onboarding UX with reusable steps, reducing drop-off and improving time-to-value.",
            technologies: ["React", "TypeScript", "Next.js"],
            url: "onboarding.demo.app"
        }
    ],
    languages: [
        { id: '1', language: "Español", fluency: "Native" },
        { id: '2', language: "Inglés", fluency: "Conversational" }
    ],
    certifications: [
        {
            id: '1',
            name: "React Advanced",
            issuer: "Platzi",
            date: "2021",
            url: "platzi.com/cert/react"
        }
    ],
    interests: [
        { id: '1', name: "Fotografía" },
        { id: '2', name: "Ciclismo" }
    ],
    tools: ["Git", "Jira", "Figma"],
    config: DEFAULT_CONFIG
};

export const getDebugData = (): CVData => {
    // Return a deep copy to avoid reference issues
    return JSON.parse(JSON.stringify(LOREM_CV_DATA));
};
