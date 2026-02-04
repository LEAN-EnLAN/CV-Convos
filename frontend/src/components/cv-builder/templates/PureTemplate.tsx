import React from 'react';
import { TemplateProps } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { cleanUrl, formatDateRange, getDensityPadding } from '@/lib/cv-templates/utils';
import { BaseTemplate } from './SharedComponents';

/**
 * @component PureTemplate
 * @description Swiss Minimalism.
 */

export function PureTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const templateFonts = {
        heading: config.fonts.heading,
        body: config.fonts.body,
    };

    const swissConfig = {
        ...config,
        colors: {
            primary: '#1a1a1a',
            secondary: '#4a4a4a',
            accent: '#ff6b35',
            background: '#fafafa',
            text: '#1a1a1a',
        },
        fonts: templateFonts,
    };

    const contentPadding = getDensityPadding(config.layout.density, 'cm');
    const sectionTitleStyle: React.CSSProperties = {
        fontFamily: templateFonts.heading,
        textTransform: 'uppercase',
        letterSpacing: '0.24em',
        fontSize: 'calc(9pt * var(--scale-factor))',
        color: swissConfig.colors.primary,
        borderBottom: `1px solid ${swissConfig.colors.secondary}`,
        paddingBottom: '4px',
        marginBottom: '8px'
    };

    return (
        <BaseTemplate
            config={swissConfig}
            paddingUnit="cm"
            style={{
                backgroundColor: swissConfig.colors.background,
                fontFamily: templateFonts.body,
                padding: 0,
                fontSize: 'calc(10.5pt * var(--scale-factor))',
            }}
        >
            <div
                className="grid grid-cols-12 gap-x-10 gap-y-10"
                style={{ padding: contentPadding }}
            >
                <aside className="col-span-12 md:col-span-4 flex flex-col gap-8">
                    <div className="space-y-3">
                        <h1
                            className="font-light tracking-tight leading-none"
                            style={{
                                fontFamily: templateFonts.heading,
                                color: swissConfig.colors.text,
                                letterSpacing: '-0.04em',
                                fontSize: 'calc(40pt * var(--scale-factor))'
                            }}
                        >
                            {data.personalInfo.fullName.split(' ').map((part, i, arr) => (
                                <span key={i}>
                                    {part}
                                    {i < arr.length - 1 && <br />}
                                </span>
                            ))}
                        </h1>
                        {data.personalInfo.role && (
                            <p style={{ fontSize: 'calc(12pt * var(--scale-factor))', color: swissConfig.colors.secondary }}>
                                {data.personalInfo.role}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 text-sm">
                        {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                        {data.personalInfo.website && <div>{cleanUrl(data.personalInfo.website)}</div>}
                        {data.personalInfo.linkedin && <div>{cleanUrl(data.personalInfo.linkedin)}</div>}
                        {data.personalInfo.github && <div>{cleanUrl(data.personalInfo.github)}</div>}
                    </div>

                    {data.skills.length > 0 && config.sections.skills.visible && (
                        <section>
                            <h2 style={sectionTitleStyle}>{config.sections.skills.title || 'Skills'}</h2>
                            <div className="flex flex-wrap gap-2 text-[10pt]">
                                {data.skills.map((skill) => (
                                    <span key={skill.id} className="px-2 py-1 border border-neutral-300">
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.languages.length > 0 && config.sections.languages.visible && (
                        <section>
                            <h2 style={sectionTitleStyle}>{config.sections.languages.title || 'Languages'}</h2>
                            <div className="space-y-2 text-[10pt]">
                                {data.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between">
                                        <span>{lang.language}</span>
                                        <span className="text-neutral-500">{lang.fluency}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.tools && data.tools.length > 0 && config.sections.tools.visible && (
                        <section>
                            <h2 style={sectionTitleStyle}>{config.sections.tools.title || 'Tools'}</h2>
                            <div className="flex flex-wrap gap-2 text-[10pt]">
                                {data.tools.map((tool) => (
                                    <span key={tool} className="px-2 py-1 border border-neutral-200">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.interests.length > 0 && config.sections.interests.visible && (
                        <section>
                            <h2 style={sectionTitleStyle}>{config.sections.interests.title || 'Interests'}</h2>
                            <div className="flex flex-wrap gap-2 text-[10pt]">
                                {data.interests.map((interest) => (
                                    <span key={interest.id} className="px-2 py-1 border border-neutral-200">
                                        {interest.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>

                <main className="col-span-12 md:col-span-8 space-y-8">
                    {data.personalInfo.summary && config.sections.summary.visible && (
                        <section className="break-inside-avoid">
                            <h2 style={sectionTitleStyle}>{config.sections.summary.title || 'Summary'}</h2>
                            <p className="leading-relaxed text-[10.5pt]">{data.personalInfo.summary}</p>
                        </section>
                    )}

                    {data.experience.length > 0 && config.sections.experience.visible && (
                        <section>
                            <h2 style={sectionTitleStyle}>{config.sections.experience.title || 'Experience'}</h2>
                            <div className="space-y-4">
                                {data.experience.map((exp) => (
                                    <div key={exp.id} className="break-inside-avoid">
                                        <div className="flex justify-between items-baseline">
                                            <div className="font-semibold">{exp.position}</div>
                                            <div className="text-neutral-500 text-[9pt]">
                                                {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                            </div>
                                        </div>
                                        <div className="text-neutral-600 text-[9.5pt]">{exp.company}</div>
                                        {exp.description && (
                                            <ul className="list-disc ml-4 mt-2 space-y-1 text-[9.5pt]">
                                                {exp.description
                                                    .split(/[.\n]+/)
                                                    .filter(item => item.trim().length > 10)
                                                    .map((item, i) => (
                                                        <li key={i}>{item.trim()}</li>
                                                    ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.education.length > 0 && config.sections.education.visible && (
                        <section>
                            <h2 style={sectionTitleStyle}>{config.sections.education.title || 'Education'}</h2>
                            <div className="space-y-4">
                                {data.education.map((edu) => (
                                    <div key={edu.id} className="break-inside-avoid">
                                        <div className="flex justify-between items-baseline">
                                            <div className="font-semibold">{edu.institution}</div>
                                            <div className="text-neutral-500 text-[9pt]">
                                                {formatDateRange(edu.startDate, edu.endDate, false)}
                                            </div>
                                        </div>
                                        <div className="text-[9.5pt] text-neutral-600">
                                            {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                                        </div>
                                        {edu.location && (
                                            <div className="text-[9pt] text-neutral-500">{edu.location}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.projects.length > 0 && config.sections.projects.visible && (
                        <section>
                            <h2 style={sectionTitleStyle}>{config.sections.projects.title || 'Projects'}</h2>
                            <div className="space-y-4">
                                {data.projects.map((project) => (
                                    <div key={project.id} className="break-inside-avoid">
                                        <div className="font-semibold">{project.name}</div>
                                        <div className="text-[9.5pt] text-neutral-600">{project.description}</div>
                                        {project.technologies.length > 0 && (
                                            <div className="text-[9pt] text-neutral-500 mt-1">
                                                {project.technologies.join(' • ')}
                                            </div>
                                        )}
                                        {project.url && (
                                            <div className="text-[9pt] text-neutral-500">{cleanUrl(project.url)}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.certifications.length > 0 && config.sections.certifications.visible && (
                        <section>
                            <h2 style={sectionTitleStyle}>{config.sections.certifications.title || 'Certifications'}</h2>
                            <div className="space-y-3 text-[9.5pt]">
                                {data.certifications.map((cert) => (
                                    <div key={cert.id} className="flex justify-between">
                                        <div>{cert.name} · {cert.issuer}</div>
                                        <div className="text-neutral-500">{cert.date}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </BaseTemplate>
    );
}
