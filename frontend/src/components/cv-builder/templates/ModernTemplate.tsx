import React from 'react';
import { CVData } from '@/types/cv';

interface TemplateProps {
    data: CVData;
}

export function ModernTemplate({ data }: TemplateProps) {
    return (
        <div className="bg-white text-slate-900 min-h-[1122px] w-[794px] font-sans flex overflow-hidden print:shadow-none print:rounded-none">
            {/* Sidebar - Color primario de CV-ConVos */}
            <aside className="w-[280px] bg-gradient-to-b from-emerald-700 to-emerald-900 text-white p-8 flex flex-col gap-8 print:bg-emerald-800">
                {/* Header */}
                <div>
                    <h1 className="font-extrabold leading-none mb-2 tracking-tight" style={{ fontSize: 'var(--cv-font-size-name)' }}>
                        {data.personalInfo.fullName || 'Tu Nombre'}
                    </h1>
                    <p className="text-emerald-200 text-sm font-medium">
                        {data.experience[0]?.position || 'Profesional'}
                    </p>
                </div>

                {/* Contacto */}
                <section className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-300 border-b border-emerald-600 pb-2">
                        Contacto
                    </h2>
                    <div className="space-y-3 text-sm text-emerald-100">
                        {data.personalInfo.email && (
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="break-all text-xs">{data.personalInfo.email}</span>
                            </div>
                        )}
                        {data.personalInfo.phone && (
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-xs">{data.personalInfo.phone}</span>
                            </div>
                        )}
                        {data.personalInfo.location && (
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-xs">{data.personalInfo.location}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Habilidades */}
                {data.skills.length > 0 && (
                    <section className="space-y-4 text-sm">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-300 border-b border-emerald-600 pb-2">
                            Habilidades
                        </h2>
                        <div className="space-y-3">
                            {data.skills.map((skill) => (
                                <div key={skill.id} className="space-y-1.5">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="font-medium">{skill.name}</span>
                                        <span className="text-emerald-300 text-[10px]">
                                            {skill.level === 'Beginner' ? 'Básico' :
                                                skill.level === 'Intermediate' ? 'Intermedio' :
                                                    skill.level === 'Advanced' ? 'Avanzado' : 'Experto'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-emerald-800/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-200 to-white rounded-full transition-all duration-1000"
                                            style={{
                                                width: skill.level === 'Expert' ? '100%' :
                                                    skill.level === 'Advanced' ? '75%' :
                                                        skill.level === 'Intermediate' ? '50%' : '25%'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Idiomas */}
                {data.languages.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-300 border-b border-emerald-600 pb-2">
                            Idiomas
                        </h2>
                        <div className="space-y-2 text-sm">
                            {data.languages.map((lang) => (
                                <div key={lang.id} className="flex justify-between items-center">
                                    <span className="font-medium text-xs">{lang.language}</span>
                                    <span className="text-emerald-300 text-[10px] bg-emerald-800/50 px-2 py-0.5 rounded">
                                        {lang.fluency}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer - Branding */}
                <div className="mt-auto pt-4 border-t border-emerald-600/50">
                    <p className="text-[9px] text-emerald-400 text-center opacity-60">
                        Creado con CV-ConVos
                    </p>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 space-y-8 bg-gradient-to-br from-white to-slate-50" style={{ padding: 'var(--cv-gap)', gap: 'var(--cv-section-gap)' }}>
                {/* Sobre Mí */}
                {data.personalInfo.summary && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest border-l-4 border-emerald-600 pl-3 mb-4 text-slate-700">
                            Sobre Mí
                        </h2>
                        <p className="text-slate-600 leading-relaxed" style={{ fontSize: 'var(--cv-font-size-base)' }}>
                            {data.personalInfo.summary}
                        </p>
                    </section>
                )}

                {/* Experiencia */}
                {data.experience.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest border-l-4 border-emerald-600 pl-3 mb-6 text-slate-700">
                            Experiencia Laboral
                        </h2>
                        <div className="space-y-6" style={{ gap: 'var(--cv-gap)' }}>
                            {data.experience.map((exp, index) => (
                                <div key={exp.id} className="relative pl-6 border-l-2 border-slate-200 py-1 break-inside-avoid">
                                    <div className="absolute -left-[7px] top-2 w-3 h-3 bg-emerald-600 rounded-full border-2 border-white shadow-sm" />
                                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                        <h3 className="font-bold text-base text-slate-800">{exp.position}</h3>
                                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                                            {exp.startDate} – {exp.current ? 'Actual' : exp.endDate}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-emerald-700 mb-2">
                                        {exp.company}
                                        {exp.location && <span className="text-slate-400 font-normal"> • {exp.location}</span>}
                                    </p>
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
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest border-l-4 border-emerald-600 pl-3 mb-6 text-slate-700">
                            Educación
                        </h2>
                        <div className="space-y-4">
                            {data.education.map((edu) => (
                                <div key={edu.id} className="flex items-start gap-3 break-inside-avoid">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-800">
                                            {edu.degree}
                                            {edu.fieldOfStudy && <span className="text-emerald-600"> en {edu.fieldOfStudy}</span>}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {edu.institution}
                                            {(edu.startDate || edu.endDate) && (
                                                <span> • {edu.startDate}{edu.endDate && `-${edu.endDate}`}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Proyectos */}
                {data.projects.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest border-l-4 border-emerald-600 pl-3 mb-6 text-slate-700">
                            Proyectos Destacados
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {data.projects.map((proj) => (
                                <div
                                    key={proj.id}
                                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow break-inside-avoid"
                                >
                                    <h3 className="font-bold text-xs mb-1.5 text-slate-800">{proj.name}</h3>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                        {proj.description}
                                    </p>
                                    {proj.technologies && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {proj.technologies.slice(0, 3).map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
