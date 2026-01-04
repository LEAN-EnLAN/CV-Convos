import React from 'react';
import { CVData } from '@/types/cv';

interface TemplateProps {
    data: CVData;
}

export function ProfessionalTemplate({ data }: TemplateProps) {
    return (
        <div className="bg-white text-slate-800 w-[794px] print:shadow-none" style={{ minHeight: '1122px', padding: 'var(--cv-gap)' }}>
            {/* Header - Estilo clásico refinado */}
            <header className="border-b-2 border-emerald-700 pb-6 mb-8 text-center">
                <h1 className="font-bold uppercase tracking-[0.2em] mb-3 text-slate-900" style={{ fontSize: 'var(--cv-font-size-name)' }}>
                    {data.personalInfo.fullName || 'Tu Nombre'}
                </h1>
                <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                    {data.personalInfo.email && (
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {data.personalInfo.email}
                        </span>
                    )}
                    {data.personalInfo.phone && (
                        <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {data.personalInfo.phone}
                            </span>
                        </>
                    )}
                    {data.personalInfo.location && (
                        <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {data.personalInfo.location}
                            </span>
                        </>
                    )}
                </div>
                {(data.personalInfo.linkedin || data.personalInfo.website || data.personalInfo.github) && (
                    <div className="flex justify-center gap-4 text-xs mt-3 text-emerald-700 font-medium">
                        {data.personalInfo.linkedin && <span>LinkedIn</span>}
                        {data.personalInfo.website && <span>Portfolio</span>}
                        {data.personalInfo.github && <span>GitHub</span>}
                    </div>
                )}
            </header>

            {/* Resumen Profesional */}
            {data.personalInfo.summary && (
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 border-b border-slate-200 pb-2 mb-4">
                        Perfil Profesional
                    </h2>
                    <p className="leading-relaxed text-slate-700 text-justify" style={{ fontSize: 'var(--cv-font-size-base)' }}>
                        {data.personalInfo.summary}
                    </p>
                </section>
            )}

            {/* Experiencia */}
            {data.experience.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 border-b border-slate-200 pb-2 mb-4">
                        Experiencia Profesional
                    </h2>
                    <div className="space-y-5">
                        {data.experience.map((exp) => (
                            <div key={exp.id} className="relative break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-base text-slate-900">{exp.position}</h3>
                                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                                        {exp.startDate} – {exp.current ? 'Actual' : exp.endDate}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-sm font-semibold text-emerald-700">{exp.company}</span>
                                    {exp.location && <span className="text-xs text-slate-400">{exp.location}</span>}
                                </div>
                                {exp.description && (
                                    <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Educación */}
            {data.education.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 border-b border-slate-200 pb-2 mb-4">
                        Formación Académica
                    </h2>
                    <div className="space-y-4">
                        {data.education.map((edu) => (
                            <div key={edu.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-sm text-slate-900">{edu.institution}</h3>
                                    {(edu.startDate || edu.endDate) && (
                                        <span className="text-xs text-slate-500 font-medium">
                                            {edu.startDate} – {edu.endDate}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-slate-700">
                                        {edu.degree}
                                        {edu.fieldOfStudy && <span className="text-emerald-600"> en {edu.fieldOfStudy}</span>}
                                    </span>
                                    {edu.location && <span className="text-xs text-slate-400">{edu.location}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Habilidades */}
            {data.skills.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 border-b border-slate-200 pb-2 mb-4">
                        Habilidades y Competencias
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill) => (
                            <span
                                key={skill.id}
                                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                            >
                                <span className="font-semibold text-slate-800">{skill.name}</span>
                                <span className="text-xs text-slate-400">
                                    {skill.level === 'Beginner' ? '•' :
                                        skill.level === 'Intermediate' ? '••' :
                                            skill.level === 'Advanced' ? '•••' : '••••'}
                                </span>
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Proyectos */}
            {data.projects && data.projects.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 border-b border-slate-200 pb-2 mb-4">
                        Proyectos Destacados
                    </h2>
                    <div className="space-y-3">
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="break-inside-avoid">
                                <h3 className="font-bold text-sm text-slate-900">{proj.name}</h3>
                                <p className="text-sm text-slate-600">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Idiomas */}
            {data.languages && data.languages.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 border-b border-slate-200 pb-2 mb-4">
                        Idiomas
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        {data.languages.map((lang) => (
                            <div key={lang.id} className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-slate-800">{lang.language}</span>
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                    {lang.fluency}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Footer - Branding sutil */}
            <footer className="mt-auto pt-8 text-center">
                <p className="text-[9px] text-slate-300 tracking-wider">
                    Creado con CV-ConVos • cvconvos.com
                </p>
            </footer>
        </div>
    );
}
