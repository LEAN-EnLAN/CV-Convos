import React from 'react';
import { CVData } from '@/types/cv';

interface TemplateProps {
    data: CVData;
}

export function ModernTemplate({ data }: TemplateProps) {
    const config = data.config!;

    return (
        <div className="bg-white text-slate-900 min-h-[1122px] w-[794px] font-sans flex overflow-hidden print:shadow-none print:rounded-none"
            style={{ backgroundColor: config.colors.background }}>
            {/* Sidebar */}
            <aside
                className="p-8 flex flex-col gap-8 print:shadow-none shrink-0"
                style={{
                    backgroundColor: config.colors.secondary,
                    color: '#ffffff',
                    width: `${config.layout.sidebarWidth || 280}px`
                }}
            >
                {/* Header */}
                <div>
                    <h1 className="font-extrabold leading-tight mb-2 tracking-tight text-3xl" style={{ color: '#ffffff' }}>
                        {data.personalInfo.fullName || 'Tu Nombre'}
                    </h1>
                    <p className="text-sm font-medium opacity-80" style={{ color: config.colors.accent }}>
                        {data.experience[0]?.position || 'Profesional'}
                    </p>
                </div>

                {/* Contacto */}
                <section className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-2 opacity-70" style={{ borderColor: config.colors.primary }}>
                        Contacto
                    </h2>
                    <div className="space-y-3 text-sm opacity-90">
                        {data.personalInfo.email && (
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="break-all text-xs">{data.personalInfo.email}</span>
                            </div>
                        )}
                        {data.personalInfo.phone && (
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-xs">{data.personalInfo.phone}</span>
                            </div>
                        )}
                        {data.personalInfo.location && (
                            <div className="flex items-start gap-2 text-xs">
                                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{data.personalInfo.location}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Habilidades */}
                {data.skills.length > 0 && config.sections.skills.visible && (
                    <section className="space-y-4 text-sm">
                        <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-2 opacity-70" style={{ borderColor: config.colors.primary }}>
                            {config.sections.skills.title || 'Habilidades'}
                        </h2>
                        <div className="space-y-3">
                            {data.skills.map((skill) => (
                                <div key={skill.id} className="space-y-1.5">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="font-medium">{skill.name}</span>
                                        <span className="text-[10px] opacity-70">
                                            {skill.level}
                                        </span>
                                    </div>
                                    {config.layout.showExpertiseBar && (
                                        config.layout.expertiseBarStyle === 'dots' ? (
                                            <div className="text-[10px] tracking-[2px] opacity-60 leading-none">
                                                {skill.level === 'Beginner' ? '•' :
                                                    skill.level === 'Intermediate' ? '••' :
                                                        skill.level === 'Advanced' ? '•••' : '••••'}
                                            </div>
                                        ) : (
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000"
                                                    style={{
                                                        width: `${skill.proficiency || 0}%`,
                                                        background: config.layout.expertiseBarStyle === 'gradient'
                                                            ? `linear-gradient(to right, ${config.colors.accent}, #ffffff)`
                                                            : config.colors.accent
                                                    }}
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Idiomas */}
                {data.languages.length > 0 && config.sections.languages.visible && (
                    <section className="space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-2 opacity-70" style={{ borderColor: config.colors.primary }}>
                            {config.sections.languages.title || 'Idiomas'}
                        </h2>
                        <div className="space-y-2 text-sm">
                            {data.languages.map((lang) => (
                                <div key={lang.id} className="flex justify-between items-center">
                                    <span className="font-medium text-xs">{lang.language}</span>
                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                    >
                                        {lang.fluency}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer - Branding */}
                <div className="mt-auto pt-4 border-t border-white/10">
                    <p className="text-[9px] text-center opacity-40">
                        Creado con CV-ConVos
                    </p>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main
                className="flex-1 flex flex-col p-10"
                style={{
                    gap: 'var(--cv-section-gap)',
                    backgroundColor: config.colors.background,
                    fontSize: 'var(--cv-font-size-base)'
                }}
            >
                {/* Sobre Mí */}
                {data.personalInfo.summary && config.sections.summary.visible && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest border-l-4 pl-3 mb-4" style={{ borderColor: config.colors.primary, color: config.colors.secondary }}>
                            {config.sections.summary.title || 'Sobre Mí'}
                        </h2>
                        <p className="leading-relaxed text-sm" style={{ color: config.colors.text }}>
                            {data.personalInfo.summary}
                        </p>
                    </section>
                )}

                {/* Experiencia */}
                {data.experience.length > 0 && config.sections.experience.visible && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest border-l-4 pl-3 mb-6" style={{ borderColor: config.colors.primary, color: config.colors.secondary }}>
                            {config.sections.experience.title || 'Experiencia Laboral'}
                        </h2>
                        <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                            {data.experience.map((exp) => (
                                <div key={exp.id} className="relative pl-6 border-l-2 border-slate-200 py-1 break-inside-avoid">
                                    <div
                                        className="absolute -left-[7px] top-2 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                        style={{ backgroundColor: config.colors.primary }}
                                    />
                                    <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                                        <h3 className="font-bold text-base" style={{ color: config.colors.secondary }}>{exp.position}</h3>
                                        <span
                                            className="text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                                            style={{ backgroundColor: `${config.colors.primary}15`, color: config.colors.primary }}
                                        >
                                            {exp.startDate} – {exp.current ? 'Actual' : exp.endDate}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold mb-2" style={{ color: config.colors.primary }}>
                                        {exp.company}
                                        {exp.location && <span className="opacity-60 font-normal text-slate-500"> • {exp.location}</span>}
                                    </p>
                                    {exp.description && (
                                        <p className="text-sm opacity-80 leading-relaxed" style={{ color: config.colors.text }}>{exp.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Proyectos */}
                {data.projects.length > 0 && config.sections.projects.visible && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest border-l-4 pl-3 mb-6" style={{ borderColor: config.colors.primary, color: config.colors.secondary }}>
                            {config.sections.projects.title || 'Proyectos'}
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {data.projects.map((proj) => (
                                <div key={proj.id} className="p-4 rounded-xl border-2 transition-all hover:shadow-md" style={{ borderColor: `${config.colors.primary}10`, backgroundColor: `${config.colors.primary}05` }}>
                                    <h3 className="font-bold text-sm mb-1" style={{ color: config.colors.primary }}>{proj.name}</h3>
                                    <p className="text-xs opacity-70 mb-3" style={{ color: config.colors.text }}>{proj.description}</p>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {proj.technologies.map((tech, idx) => (
                                                <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: `${config.colors.primary}10`, color: config.colors.primary }}>
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

                {/* Educación */}
                {data.education.length > 0 && config.sections.education.visible && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest border-l-4 pl-3 mb-6" style={{ borderColor: config.colors.primary, color: config.colors.secondary }}>
                            {config.sections.education.title || 'Educación'}
                        </h2>
                        <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                            {data.education.map((edu) => (
                                <div key={edu.id} className="flex items-start gap-3 break-inside-avoid">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${config.colors.primary}15` }}
                                    >
                                        <svg className="w-5 h-5" style={{ color: config.colors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm" style={{ color: config.colors.secondary }}>
                                            {edu.degree}
                                            {edu.fieldOfStudy && <span style={{ color: config.colors.primary }}> en {edu.fieldOfStudy}</span>}
                                        </h3>
                                        <p className="text-xs opacity-60 font-medium">
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

                {/* Certificaciones */}
                {data.certifications.length > 0 && config.sections.certifications.visible && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest border-l-4 pl-3 mb-6" style={{ borderColor: config.colors.primary, color: config.colors.secondary }}>
                            {config.sections.certifications.title || 'Certificaciones'}
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {data.certifications.map((cert) => (
                                <div key={cert.id} className="flex gap-3 items-center p-2 rounded-lg border border-slate-100" style={{ backgroundColor: `${config.colors.primary}02` }}>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.colors.primary }} />
                                    <div>
                                        <p className="text-xs font-bold" style={{ color: config.colors.secondary }}>{cert.name}</p>
                                        <p className="text-[10px] opacity-60">{cert.issuer} • {cert.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Intereses */}
                {data.interests.length > 0 && config.sections.interests.visible && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest border-l-4 pl-3 mb-4" style={{ borderColor: config.colors.primary, color: config.colors.secondary }}>
                            {config.sections.interests.title || 'Intereses'}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {data.interests.map((interest) => (
                                <span key={interest.id} className="text-xs px-3 py-1 rounded-full border border-slate-200 opacity-80" style={{ color: config.colors.text }}>
                                    {interest.name}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
