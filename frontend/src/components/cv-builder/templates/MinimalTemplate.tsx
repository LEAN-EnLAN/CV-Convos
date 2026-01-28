import React from 'react';
import { TemplateProps } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { cleanUrl, getDensityPadding } from '@/lib/cv-templates/utils';
import { BaseTemplate } from './SharedComponents';

export function MinimalTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;

    return (
        <BaseTemplate 
            config={config} 
            className="flex"
            paddingUnit="rem"
        >
            {/* Sidebar (Left Column) - 30% */}
            <aside
                className="w-[30%] flex flex-col shrink-0"
                style={{
                    backgroundColor: `${config.colors.primary}10`, // 10% opacity of primary for sidebar
                    borderRight: `1px solid ${config.colors.primary}20`,
                    gap: `${config.layout.sectionGap}px`,
                    padding: '2rem' // Keep manual side padding for sidebar
                }}
            >
                {/* Contact */}
                <div className="flex flex-col" style={{ gap: `${config.layout.contentGap / 2}px` }}>
                    <h3 className="font-bold uppercase tracking-widest text-[10px]" style={{ color: config.colors.primary, fontFamily: config.fonts.heading, marginBottom: '4px' }}>Contact</h3>
                    {data.personalInfo.email && (
                        <div className="break-all font-medium opacity-80 text-xs">{data.personalInfo.email}</div>
                    )}
                    {data.personalInfo.phone && (
                        <div className="font-medium opacity-80 text-xs">{data.personalInfo.phone}</div>
                    )}
                    {data.personalInfo.location && (
                        <div className="font-medium opacity-80 text-xs">{data.personalInfo.location}</div>
                    )}
                </div>

                {/* Socials */}
                {(data.personalInfo.linkedin || data.personalInfo.github || data.personalInfo.website) && (
                    <div className="flex flex-col" style={{ gap: `${config.layout.contentGap / 2}px` }}>
                        <h3 className="font-bold uppercase tracking-widest text-[10px]" style={{ color: config.colors.primary, fontFamily: config.fonts.heading, marginBottom: '4px' }}>Social</h3>
                        {data.personalInfo.linkedin && (
                            <div className="break-all opacity-70 hover:opacity-100 transition-opacity text-xs">{cleanUrl(data.personalInfo.linkedin)}</div>
                        )}
                        {data.personalInfo.github && (
                            <div className="break-all opacity-70 hover:opacity-100 transition-opacity text-xs">{cleanUrl(data.personalInfo.github)}</div>
                        )}
                    </div>
                )}

                {/* Skills */}
                {data.skills.length > 0 && config.sections.skills.visible && (
                    <div className="flex flex-col" style={{ gap: `${config.layout.contentGap / 2}px` }}>
                        <h3 className="font-bold uppercase tracking-widest text-[10px]" style={{ color: config.colors.primary, fontFamily: config.fonts.heading, marginBottom: '4px' }}>
                            {config.sections.skills.title || 'Skills'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="text-[11px] font-medium px-2 py-1 rounded block w-full text-center relative overflow-hidden"
                                    style={{
                                        backgroundColor: config.colors.background,
                                        border: `1px solid ${config.colors.primary}30`,
                                        color: config.colors.text
                                    }}
                                >
                                    <div className="relative z-10 flex justify-between items-center w-full gap-2">
                                        <span>{skill.name}</span>
                                    </div>

                                    {config.layout.showExpertiseBar && (
                                        <div
                                            className="absolute bottom-0 left-0 h-0.5"
                                            style={{
                                                width: `${skill.proficiency || 0}%`,
                                                backgroundColor: config.colors.primary,
                                                opacity: 0.5
                                            }}
                                        />
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {data.languages && data.languages.length > 0 && config.sections.languages.visible && (
                    <div className="flex flex-col" style={{ gap: `${config.layout.contentGap / 2}px` }}>
                        <h3 className="font-bold uppercase tracking-widest text-[10px]" style={{ color: config.colors.primary, fontFamily: config.fonts.heading, marginBottom: '4px' }}>
                            {config.sections.languages.title || 'Languages'}
                        </h3>
                        <div className="flex flex-col" style={{ gap: '4px' }}>
                            {data.languages.map((lang) => (
                                <div key={lang.id} className="flex justify-between items-center text-[11px]">
                                    <span className="font-medium">{lang.language}</span>
                                    <span className="opacity-60 text-[10px]">{lang.fluency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tools */}
                {data.tools && data.tools.length > 0 && config.sections.tools?.visible && (
                    <div className="flex flex-col" style={{ gap: `${config.layout.contentGap / 2}px` }}>
                        <h3 className="font-bold uppercase tracking-widest text-[10px]" style={{ color: config.colors.primary, fontFamily: config.fonts.heading, marginBottom: '4px' }}>
                            {config.sections.tools?.title || 'Tools'}
                        </h3>
                        <div className="flex flex-wrap gap-1">
                            {data.tools.map((tool, i) => (
                                <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded italic opacity-70 border" style={{ borderColor: `${config.colors.primary}20` }}>
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Interests */}
                {data.interests && data.interests.length > 0 && config.sections.interests.visible && (
                    <div className="flex flex-col" style={{ gap: `${config.layout.contentGap / 2}px` }}>
                        <h3 className="font-bold uppercase tracking-widest text-[10px]" style={{ color: config.colors.primary, fontFamily: config.fonts.heading, marginBottom: '4px' }}>
                            {config.sections.interests.title || 'Interests'}
                        </h3>
                        <div className="flex flex-wrap gap-1">
                            {data.interests.map((interest) => (
                                <span key={interest.id} className="text-[10px] opacity-60 italic">
                                    #{interest.name.toLowerCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content (Right Column) - 70% */}
            <main
                className="flex-1 flex flex-col overflow-hidden"
                style={{
                    gap: `${config.layout.sectionGap}px`,
                    padding: getDensityPadding(config.layout.density, 'rem')
                }}
            >
                {/* Header */}
                <header>
                    <h1
                        className="text-4xl font-black tracking-tighter mb-2"
                        style={{ fontFamily: config.fonts.heading, color: config.colors.primary }}
                    >
                        {data.personalInfo.fullName.toUpperCase()}
                    </h1>
                    {data.personalInfo.summary && config.sections.summary.visible && (
                        <p className="text-sm leading-relaxed font-medium max-w-[500px] opacity-80" style={{ lineHeight: 1.6 }}>
                            {data.personalInfo.summary}
                        </p>
                    )}
                </header>

                {/* Experience */}
                {data.experience.length > 0 && config.sections.experience.visible && (
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: config.colors.secondary, fontFamily: config.fonts.heading }}>
                            <span className="w-1 h-3 block" style={{ backgroundColor: config.colors.primary }}></span>
                            {config.sections.experience.title || 'Experience'}
                        </h2>
                        <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                            {data.experience.map((exp) => (
                                <div key={exp.id} className="group break-inside-avoid">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-base group-hover:underline decoration-2 underline-offset-2" style={{ color: config.colors.primary }}>{exp.position}</h3>
                                        <span className="text-[10px] font-mono opacity-60 px-2 py-0.5 rounded" style={{ backgroundColor: `${config.colors.secondary}10` }}>
                                            {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                                        </span>
                                    </div>
                                    <div className="text-xs font-semibold mb-2 uppercase tracking-wide opacity-70">
                                        {exp.company} {exp.location && `• ${exp.location}`}
                                    </div>
                                    <p className="text-sm leading-relaxed font-normal opacity-90">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {data.projects && data.projects.length > 0 && config.sections.projects.visible && (
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: config.colors.secondary, fontFamily: config.fonts.heading }}>
                            <span className="w-1 h-3 block" style={{ backgroundColor: config.colors.primary }}></span>
                            {config.sections.projects.title || 'Projects'}
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {data.projects.map((proj) => (
                                <div key={proj.id} className="border p-3 rounded-lg hover:border-black transition-colors" style={{ borderColor: `${config.colors.primary}20` }}>
                                    <h3 className="font-bold text-sm mb-1" style={{ color: config.colors.primary }}>{proj.name}</h3>
                                    <p className="text-xs opacity-70 leading-relaxed mb-2">{proj.description}</p>
                                    {proj.technologies && (
                                        <div className="flex gap-1 flex-wrap">
                                            {proj.technologies.slice(0, 4).map((tech, i) => (
                                                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: config.colors.primary, color: config.colors.background }}>
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

                {/* Education */}
                {data.education.length > 0 && config.sections.education.visible && (
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: config.colors.secondary, fontFamily: config.fonts.heading }}>
                            <span className="w-1 h-3 block" style={{ backgroundColor: config.colors.primary }}></span>
                            {config.sections.education.title || 'Education'}
                        </h2>
                        <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                            {data.education.map((edu) => (
                                <div key={edu.id} className="break-inside-avoid">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-sm" style={{ color: config.colors.primary }}>{edu.institution}</h3>
                                        <span className="text-[10px] opacity-50 font-mono">
                                            {edu.startDate} - {edu.endDate}
                                        </span>
                                    </div>
                                    <div className="text-xs opacity-80">
                                        {edu.degree} in {edu.fieldOfStudy}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications (Main content if many) */}
                {data.certifications && data.certifications.length > 0 && config.sections.certifications.visible && (
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: config.colors.secondary, fontFamily: config.fonts.heading }}>
                            <span className="w-1 h-3 block" style={{ backgroundColor: config.colors.primary }}></span>
                            {config.sections.certifications.title || 'Certifications'}
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {data.certifications.map((cert) => (
                                <div key={cert.id} className="border-l-2 p-2" style={{ borderColor: config.colors.primary }}>
                                    <div className="font-bold text-xs">{cert.name}</div>
                                    <div className="opacity-60 text-[10px]">{cert.issuer} • {cert.date}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </BaseTemplate>
    );
}
