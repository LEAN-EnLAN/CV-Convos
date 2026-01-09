import React from 'react';
import { CVData } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';

/**
 * @component CreativeTemplate
 * @description Bold editorial/magazine style CV with asymmetric colored sidebar.
 */

interface TemplateProps {
    data: CVData;
}

export function CreativeTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const primaryColor = config.colors.primary;
    const secondaryColor = config.colors.secondary;

    // Mapping density to padding
    const paddingMap = {
        compact: '1.5rem',
        standard: '2rem',
        relaxed: '3rem'
    };

    const sectionPadding = paddingMap[config.layout.density] || '2rem';

    return (
        <div
            className="w-[794px] h-[1122px] max-h-[1122px] overflow-hidden flex print:shadow-none bg-background relative mx-auto"
            style={{ fontFamily: config.fonts.body, color: config.colors.text }}
        >
            {/* Background Accent - Decorative circle or shape */}
            <div
                className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full blur-3xl opacity-10"
                style={{ backgroundColor: primaryColor }}
            />

            {/* LEFT SIDEBAR (Bold Color) - 30% */}
            <aside
                aria-label="Contacto y Habilidades"
                className="w-[30%] flex flex-col shrink-0 text-white relative z-10"
                style={{ backgroundColor: primaryColor, padding: sectionPadding, gap: `${config.layout.sectionGap}px` }}
            >
                {/* Contact Block */}
                <div>
                    <h2 className="text-[9px] font-black uppercase tracking-[0.2em] mb-4 opacity-60">Información</h2>
                    <div className="flex flex-col text-xs font-medium" style={{ gap: `${config.layout.contentGap / 2}px` }}>
                        <div className="group">
                            <p className="opacity-50 text-[9px] uppercase mb-0.5">Correo</p>
                            <p className="break-all">{data.personalInfo.email}</p>
                        </div>
                        <div className="group">
                            <p className="opacity-50 text-[9px] uppercase mb-0.5">Teléfono</p>
                            <p>{data.personalInfo.phone}</p>
                        </div>
                        <div className="group">
                            <p className="opacity-50 text-[9px] uppercase mb-0.5">Ubicación</p>
                            <p>{data.personalInfo.location}</p>
                        </div>
                    </div>
                </div>

                {/* Skills - Bold Tags */}
                {data.skills.length > 0 && config.sections.skills.visible && (
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">
                            {config.sections.skills.title || 'Habilidades'}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill) => (
                                <div
                                    key={skill.id}
                                    className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-[10px] border border-white/20"
                                >
                                    {skill.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {data.languages && data.languages.length > 0 && config.sections.languages.visible && (
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">
                            {config.sections.languages.title || 'Idiomas'}
                        </h2>
                        <div className="flex flex-col font-medium" style={{ gap: `${config.layout.contentGap / 2}px` }}>
                            {data.languages.map(lang => (
                                <div key={lang.id} className="text-xs flex justify-between">
                                    <span>{lang.language}</span>
                                    <span className="opacity-60">{lang.fluency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tools - Systems */}
                {data.tools && data.tools.length > 0 && config.sections.tools?.visible && (
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">
                            {config.sections.tools?.title || 'Herramientas'}
                        </h2>
                        <div className="flex flex-wrap gap-2 text-[10px] font-medium opacity-80 leading-relaxed italic">
                            {data.tools.join(' • ')}
                        </div>
                    </div>
                )}

                {/* Interests */}
                {data.interests && data.interests.length > 0 && config.sections.interests?.visible && (
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">
                            {config.sections.interests?.title || 'Intereses'}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {data.interests.map((interest) => (
                                <span key={interest.id} className="text-[10px] opacity-70">
                                    #{interest.name.toLowerCase().replace(/\s+/g, '')}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Social links at bottom */}
                <div className="mt-auto pt-10">
                    <div className="flex flex-col gap-2 text-[10px] opacity-70 italic">
                        {data.personalInfo.linkedin && <p>In/ {data.personalInfo.linkedin.split('/').pop()}</p>}
                        {data.personalInfo.github && <p>Git/ {data.personalInfo.github.split('/').pop()}</p>}
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT - 70% */}
            <main
                className="flex-1 flex flex-col bg-white"
                style={{ padding: `3.5rem ${sectionPadding}`, gap: `${config.layout.sectionGap}px` }}
            >
                {/* Header Section */}
                <header>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-0.5 w-12" style={{ backgroundColor: secondaryColor }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: secondaryColor }}>Portafolio</span>
                    </div>
                    <h1
                        className="text-6xl font-black leading-none uppercase tracking-tighter mb-6"
                        style={{ color: '#1a1a1a', fontFamily: config.fonts.heading }}
                    >
                        {data.personalInfo.fullName.split(' ').map((name, i) => (
                            <span key={i} className="block">
                                {i === 1 ? <span style={{ color: primaryColor }}>{name}</span> : name}
                            </span>
                        ))}
                    </h1>
                    {data.personalInfo.summary && config.sections.summary.visible && (
                        <p className="text-sm text-gray-500 leading-relaxed font-medium border-l-4 pl-6" style={{ borderColor: `${primaryColor}30` }}>
                            {data.personalInfo.summary}
                        </p>
                    )}
                </header>

                {/* Experience Block */}
                {data.experience.length > 0 && config.sections.experience.visible && (
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] bg-black text-white px-3 py-1">
                                {config.sections.experience.title || 'Experiencia'}
                            </h2>
                        </div>
                        <div className="flex flex-col" style={{ gap: `${config.layout.contentGap * 1.5}px` }}>
                            {data.experience.map((exp) => (
                                <div key={exp.id} className="relative pl-8 border-l-2 italic" style={{ borderColor: `${primaryColor}30` }}>
                                    <div
                                        className="absolute left-[-6px] top-1.5 w-3 h-3 rounded-full border-2 border-white"
                                        style={{ backgroundColor: primaryColor }}
                                    />
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className="text-xl font-black not-italic" style={{ fontFamily: config.fonts.heading }}>{exp.position}</h3>
                                        <span className="text-[10px] font-bold not-italic text-gray-400">
                                            {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold not-italic mb-3 opacity-60 uppercase tracking-widest">{exp.company}</p>
                                    <p className="text-sm not-italic text-gray-600 leading-relaxed">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects/Education Grid */}
                <div className="grid grid-cols-2 gap-8 mt-auto">
                    {/* Education */}
                    {data.education.length > 0 && config.sections.education.visible && (
                        <section>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] mb-6" style={{ fontFamily: config.fonts.heading }}>
                                {config.sections.education.title || 'Educación'}
                            </h2>
                            <div className="flex flex-col" style={{ gap: `${config.layout.contentGap / 2}px` }}>
                                {data.education.map(edu => (
                                    <div key={edu.id}>
                                        <p className="text-xs font-black">{edu.degree}</p>
                                        <p className="text-[10px] text-gray-500">{edu.institution}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                    {/* Projects */}
                    {data.projects && data.projects.length > 0 && config.sections.projects.visible && (
                        <section>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] mb-6" style={{ fontFamily: config.fonts.heading }}>
                                {config.sections.projects.title || 'Proyectos'}
                            </h2>
                            <div className="flex flex-col" style={{ gap: `${config.layout.contentGap / 2}px` }}>
                                {data.projects.slice(0, 3).map(proj => (
                                    <div key={proj.id}>
                                        <p className="text-xs font-black">{proj.name}</p>
                                        <p className="text-[10px] text-gray-500 line-clamp-2">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Page Number Decoration */}
            <div className="absolute bottom-10 right-10 text-[60px] font-black text-gray-50 select-none -z-0">
                01
            </div>
        </div>
    );
}
