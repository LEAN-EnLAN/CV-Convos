import React from 'react';
import { CVData } from '@/types/cv';
import { Phone, Mail, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';

/**
 * @component BianTemplate
 * @description Corporate-style CV template with grid-based sidebar layout.
 */

interface TemplateProps {
    data: CVData;
}

export const BianTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalInfo, experience, education, skills, languages, certifications, projects } = data;
    const config = data.config || DEFAULT_CONFIG;

    // Helper to format dates
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return dateString.replace(/(\d{4})-\d{2}.*/, '$1');
    };

    // Mapping density to padding
    const paddingMap = {
        compact: '1.5rem',
        standard: '2.5rem',
        relaxed: '3.5rem'
    };

    return (
        <div
            className="w-[794px] h-[1122px] max-h-[1122px] overflow-hidden bg-white text-slate-800 mx-auto"
            style={{
                fontFamily: config?.fonts?.body || 'Inter, sans-serif',
                padding: paddingMap[config.layout.density] || '2.5rem'
            }}
        >
            {/* Header Section */}
            <header
                className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8"
                style={{ marginBottom: `${config.layout.sectionGap}px` }}
            >
                <div className="flex-1 space-y-1">
                    <h1
                        className="text-4xl sm:text-5xl font-black uppercase text-slate-900 tracking-tight"
                        style={{ fontFamily: config?.fonts?.heading }}
                    >
                        {personalInfo.fullName}
                    </h1>
                    <p className="text-xl text-slate-500 font-medium">
                        {personalInfo.role}
                    </p>
                </div>

                <div className="flex flex-col gap-2 text-sm text-slate-600 sm:text-right min-w-[200px]">
                    {personalInfo.phone && (
                        <div className="flex items-center sm:justify-end gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{personalInfo.phone}</span>
                        </div>
                    )}
                    {personalInfo.email && (
                        <div className="flex items-center sm:justify-end gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span>{personalInfo.email}</span>
                        </div>
                    )}
                    {personalInfo.location && (
                        <div className="flex items-center sm:justify-end gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{personalInfo.location}</span>
                        </div>
                    )}
                    {personalInfo.linkedin && (
                        <div className="flex items-center sm:justify-end gap-2">
                            <Linkedin className="w-4 h-4 text-slate-400" />
                            <a href={personalInfo.linkedin} className="hover:text-black">LinkedIn</a>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex flex-col">

                {/* PROFESSIONAL SUMMARY */}
                {personalInfo.summary && config.sections.summary.visible && (
                    <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                        <div className="bg-slate-100 py-1.5 px-4" style={{ marginBottom: `${config.layout.contentGap}px` }}>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800" style={{ fontFamily: config?.fonts?.heading }}>
                                {config.sections.summary.title || 'Resumen Profesional'}
                            </h2>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed px-4">
                            {personalInfo.summary}
                        </p>
                    </section>
                )}

                {/* Experiencia Laboral */}
                {experience.length > 0 && (
                    <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                        <div className="bg-slate-100 py-2 px-4 mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800" style={{ fontFamily: config?.fonts?.heading }}>
                                Experiencia Laboral
                            </h2>
                        </div>
                        <div className="flex flex-col px-4" style={{ gap: `${config.layout.contentGap}px` }}>
                            {experience.map((exp) => (
                                <div key={exp.id} className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-8">
                                    <div className="text-sm text-slate-500 font-medium leading-relaxed">
                                        <p className="mb-0.5">{exp.company}</p>
                                        <p className="text-xs opacity-70">{exp.startDate} - {exp.current ? 'Presente' : exp.endDate}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-900 text-base">
                                            {exp.position}
                                        </h3>
                                        {exp.description && (
                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Estudios */}
                {education.length > 0 && (
                    <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                        <div className="bg-slate-100 py-2 px-4 mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800" style={{ fontFamily: config?.fonts?.heading }}>
                                Estudio
                            </h2>
                        </div>
                        <div className="flex flex-col px-4" style={{ gap: `${config.layout.contentGap}px` }}>
                            {education.map((edu) => (
                                <div key={edu.id} className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 items-start">
                                    <div className="text-sm text-slate-500 font-medium pt-1">
                                        <p>{edu.degree}</p>
                                        <p className="text-xs opacity-70">Año {edu.endDate || edu.startDate}</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs shrink-0 mt-1">
                                            {edu.institution.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base">
                                                {edu.institution}
                                            </h3>
                                            <p className="text-sm text-slate-700 font-medium">
                                                {edu.fieldOfStudy}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills / Sistemas */}
                {skills.length > 0 && config.sections.skills.visible && (
                    <section className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 px-4" style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                        <div>
                            <div className="bg-slate-200 py-2 px-4 inline-block w-full text-center sm:text-left">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800" style={{ fontFamily: config?.fonts?.heading }}>
                                    {config.sections.skills.title || 'Skills'}
                                </h2>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {skills.map((skill) => (
                                <div key={skill.id} className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-700">{skill.name}</p>
                                    {skill.level && (
                                        <span className="text-xs text-slate-400 font-medium">
                                            — {skill.level}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects.length > 0 && config.sections.projects.visible && (
                    <section className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 px-4" style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                        <div>
                            <div className="bg-slate-200 py-2 px-4 inline-block w-full text-center sm:text-left">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800" style={{ fontFamily: config?.fonts?.heading }}>
                                    {config.sections.projects.title || 'Proyectos'}
                                </h2>
                            </div>
                        </div>

                        <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                            {projects.map((proj) => (
                                <div key={proj.id}>
                                    <p className="text-sm font-bold text-slate-900">{proj.name}</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">{proj.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Idiomas */}
                {languages.length > 0 && config.sections.languages.visible && (
                    <section className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 px-4" style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                        <div>
                            <div className="bg-slate-200 py-2 px-4 inline-block w-full text-center sm:text-left">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800" style={{ fontFamily: config?.fonts?.heading }}>
                                    {config?.sections.languages.title || 'Idiomas'}
                                </h2>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            {languages.map((lang) => (
                                <p key={lang.id} className="text-sm font-bold text-slate-700">
                                    {lang.language} <span className="text-slate-400 font-normal">- {lang.fluency}</span>
                                </p>
                            ))}
                        </div>
                    </section>
                )}

                {/* Herramientas */}
                {data.tools && data.tools.length > 0 && config.sections.tools?.visible && (
                    <section className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 px-4" style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                        <div>
                            <div className="bg-slate-200 py-2 px-4 inline-block w-full text-center sm:text-left">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800" style={{ fontFamily: config?.fonts?.heading }}>
                                    {config?.sections?.tools?.title || 'Herramientas'}
                                </h2>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {data.tools.map((tool, i) => (
                                <p key={i} className="text-sm font-bold text-slate-700 italic">
                                    {tool}
                                </p>
                            ))}
                        </div>
                    </section>
                )}

                {/* Intereses */}
                {data.interests && data.interests.length > 0 && config.sections.interests?.visible && (
                    <section className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 px-4" style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                        <div>
                            <div className="bg-slate-200 py-2 px-4 inline-block w-full text-center sm:text-left">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800" style={{ fontFamily: config?.fonts?.heading }}>
                                    {config?.sections?.interests?.title || 'Intereses'}
                                </h2>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {data.interests.map((interest) => (
                                <p key={interest.id} className="text-sm font-medium text-slate-600">
                                    • {interest.name}
                                </p>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};
