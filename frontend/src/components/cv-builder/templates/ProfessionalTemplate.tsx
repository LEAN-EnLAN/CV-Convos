import React from 'react';
import { CVData } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';

/**
 * @component ProfessionalTemplate
 * @description Classic refined CV template with elegant typography and subtle icons.
 */

interface TemplateProps {
    data: CVData;
}

export function ProfessionalTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;

    // Mapping density to padding
    const paddingMap = {
        compact: '1.5rem 40px',
        standard: '2.5rem 40px',
        relaxed: '3.5rem 40px'
    };

    return (
        <div
            className="bg-white w-[794px] h-[1122px] max-h-[1122px] overflow-hidden print:shadow-none flex flex-col mx-auto"
            style={{
                fontFamily: config.fonts.body,
                minHeight: '1122px',
                padding: paddingMap[config.layout.density] || '2.5rem 40px',
                backgroundColor: config.colors.background,
                color: config.colors.text,
                gap: `${config.layout.sectionGap}px`,
                fontSize: '12px'
            }}
        >
            {/* Header - Estilo clásico refinado */}
            <header className="border-b-2 pb-6 text-center" style={{ borderColor: config.colors.primary, marginBottom: `${config.layout.sectionGap / 2}px` }}>
                <h1 className="font-bold uppercase tracking-[0.2em] mb-3 text-3xl" style={{ color: config.colors.secondary, fontFamily: config.fonts.heading }}>
                    {data.personalInfo.fullName || 'Tu Nombre'}
                </h1>
                <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 text-sm opacity-80">
                    {data.personalInfo.email && (
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" style={{ color: config.colors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {data.personalInfo.email}
                        </span>
                    )}
                    {data.personalInfo.phone && (
                        <>
                            <span className="opacity-40">•</span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" style={{ color: config.colors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {data.personalInfo.phone}
                            </span>
                        </>
                    )}
                    {data.personalInfo.location && (
                        <>
                            <span className="opacity-40">•</span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" style={{ color: config.colors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {data.personalInfo.location}
                            </span>
                        </>
                    )}
                </div>
                {(data.personalInfo.linkedin || data.personalInfo.website || data.personalInfo.github) && (
                    <div className="flex justify-center gap-4 text-xs mt-3 font-medium uppercase tracking-widest" style={{ color: config.colors.primary }}>
                        {data.personalInfo.linkedin && <span className="border-b border-transparent hover:border-current cursor-pointer">{data.personalInfo.linkedin.replace('https://', '')}</span>}
                        {data.personalInfo.github && <span className="border-b border-transparent hover:border-current cursor-pointer">{data.personalInfo.github.replace('https://', '')}</span>}
                    </div>
                )}
            </header>

            {/* Resumen Profesional */}
            {data.personalInfo.summary && config.sections.summary.visible && (
                <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: config.colors.primary, borderColor: `${config.colors.primary}30`, fontFamily: config.fonts.heading }}>
                        {config.sections.summary.title || 'Perfil Profesional'}
                    </h2>
                    <p className="leading-relaxed text-justify opacity-90 text-sm">
                        {data.personalInfo.summary}
                    </p>
                </section>
            )}

            {/* Experiencia */}
            {data.experience.length > 0 && config.sections.experience.visible && (
                <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: config.colors.primary, borderColor: `${config.colors.primary}30`, fontFamily: config.fonts.heading }}>
                        {config.sections.experience.title || 'Experiencia Profesional'}
                    </h2>
                    <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                        {data.experience.map((exp) => (
                            <div key={exp.id} className="relative break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-base" style={{ color: config.colors.secondary }}>{exp.position}</h3>
                                    <span className="text-xs font-mono opacity-60">
                                        {exp.startDate} – {exp.current ? 'Actual' : exp.endDate}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-sm font-semibold uppercase tracking-tight" style={{ color: config.colors.primary }}>{exp.company}</span>
                                    {exp.location && <span className="text-xs opacity-50 italic">{exp.location}</span>}
                                </div>
                                {exp.description && (
                                    <p className="text-sm opacity-80 leading-relaxed">{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Educación */}
            {data.education.length > 0 && config.sections.education.visible && (
                <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: config.colors.primary, borderColor: `${config.colors.primary}30`, fontFamily: config.fonts.heading }}>
                        {config.sections.education.title || 'Formación Académica'}
                    </h2>
                    <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                        {data.education.map((edu) => (
                            <div key={edu.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-sm" style={{ color: config.colors.secondary }}>{edu.institution}</h3>
                                    {(edu.startDate || edu.endDate) && (
                                        <span className="text-xs font-medium opacity-60">
                                            {edu.startDate} – {edu.endDate}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm opacity-90 italic">
                                        {edu.degree}
                                        {edu.fieldOfStudy && <span style={{ color: config.colors.primary }}> en {edu.fieldOfStudy}</span>}
                                    </span>
                                    {edu.location && <span className="text-xs opacity-50">{edu.location}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Proyectos */}
            {data.projects && data.projects.length > 0 && config.sections.projects.visible && (
                <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: config.colors.primary, borderColor: `${config.colors.primary}30`, fontFamily: config.fonts.heading }}>
                        {config.sections.projects.title || 'Proyectos Destacados'}
                    </h2>
                    <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="break-inside-avoid border-l-2 pl-4 py-1" style={{ borderColor: `${config.colors.primary}20` }}>
                                <h3 className="font-bold text-sm" style={{ color: config.colors.secondary }}>{proj.name}</h3>
                                <p className="text-sm opacity-80 mb-2">{proj.description}</p>
                                {proj.technologies && (
                                    <div className="flex gap-2">
                                        {proj.technologies.slice(0, 5).map((t, idx) => (
                                            <span key={idx} className="text-[10px] font-mono opacity-50">#{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Habilidades */}
            {data.skills.length > 0 && config.sections.skills.visible && (
                <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: config.colors.primary, borderColor: `${config.colors.primary}30`, fontFamily: config.fonts.heading }}>
                        {config.sections.skills.title || 'Habilidades y Competencias'}
                    </h2>
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {data.skills.map((skill) => (
                            <div key={skill.id} className="flex flex-col gap-1 min-w-[120px]">
                                <span className="text-sm font-semibold" style={{ color: config.colors.secondary }}>{skill.name}</span>
                                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-200"
                                        style={{
                                            width: `${skill.proficiency || 0}%`,
                                            backgroundColor: config.colors.primary,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Certificaciones */}
            {data.certifications && data.certifications.length > 0 && config.sections.certifications.visible && (
                <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: config.colors.primary, borderColor: `${config.colors.primary}30`, fontFamily: config.fonts.heading }}>
                        {config.sections.certifications.title || 'Certificaciones'}
                    </h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {data.certifications.map((cert) => (
                            <div key={cert.id} className="text-sm flex justify-between gap-2 border-b border-dashed border-slate-100 pb-1">
                                <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{cert.name}</span>
                                <span className="text-[10px] opacity-50 shrink-0 uppercase">{cert.date}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Idiomas, Herramientas & Intereses */}
            <div className="grid grid-cols-2 gap-8" style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                    {data.languages && data.languages.length > 0 && config.sections.languages.visible && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: config.colors.primary, borderColor: `${config.colors.primary}30`, fontFamily: config.fonts.heading }}>
                                {config.sections.languages.title || 'Idiomas'}
                            </h2>
                            <div className="flex flex-col gap-2 font-medium px-1">
                                {data.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between items-center text-sm">
                                        <span className="font-semibold">{lang.language}</span>
                                        <span className="text-[10px] opacity-60 uppercase">{lang.fluency}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                    {data.tools && data.tools.length > 0 && config.sections.tools?.visible && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: config.colors.primary, borderColor: `${config.colors.primary}30`, fontFamily: config.fonts.heading }}>
                                {config.sections.tools?.title || 'Herramientas'}
                            </h2>
                            <div className="flex flex-wrap gap-2 text-xs opacity-80 leading-relaxed italic px-1">
                                {data.tools.join(' • ')}
                            </div>
                        </section>
                    )}
                </div>
                {data.interests && data.interests.length > 0 && config.sections.interests?.visible && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: config.colors.primary, borderColor: `${config.colors.primary}30`, fontFamily: config.fonts.heading }}>
                            {config.sections.interests?.title || 'Intereses'}
                        </h2>
                        <div className="flex flex-wrap gap-2 px-1">
                            {data.interests.map((interest) => (
                                <span key={interest.id} className="text-xs opacity-70">
                                    • {interest.name}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Footer - Branding sutil */}
            <footer className="mt-auto pt-8 text-center border-t border-slate-50 opacity-40">
                <p className="text-[9px] tracking-[0.2em] font-medium uppercase">
                    Documento Generado por CV-ConVos
                </p>
            </footer>
        </div>
    );
}
