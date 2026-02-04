import React from 'react';
import { TemplateProps } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { cleanUrl, formatDateRange, getDensityPadding } from '@/lib/cv-templates/utils';
import { BaseTemplate } from './SharedComponents';

/**
 * @component CareTemplate
 * @description Human-Centered Warmth.
 */

export function CareTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    
    const warmColors = {
        cream: '#fefcf8',
        sand: '#f5f0e8',
        terracotta: '#c17f59',
        sage: '#8b9a7d',
        stone: '#57534e',
        taupe: '#78716c',
        blush: '#e8ddd5',
        warmWhite: '#fffdfa',
    };

    const careFonts = {
        heading: config.fonts.heading,
        body: config.fonts.body,
    };

    const careConfig = {
        ...config,
        colors: {
            primary: config.colors?.primary || warmColors.terracotta,
            secondary: config.colors?.secondary || warmColors.sage,
            accent: config.colors?.accent || warmColors.terracotta,
            background: config.colors?.background || warmColors.cream,
            text: config.colors?.text || warmColors.stone,
        },
        fonts: careFonts,
    };

    const templateColors = {
        background: careConfig.colors.background,
        text: careConfig.colors.text,
        primary: careConfig.colors.primary,
        secondary: careConfig.colors.secondary,
        accent: careConfig.colors.accent,
        muted: careConfig.colors.secondary,
        card: warmColors.warmWhite,
        border: warmColors.blush,
        chip: warmColors.sand,
        chipAlt: warmColors.blush
    };

    const contentPadding = getDensityPadding(config.layout.density, 'cm');
    // Ajustes de densidad para conservar la personalidad y mejorar el fit en una pagina
    const densityScale = config.layout.density === 'compact' ? 0.82 : config.layout.density === 'relaxed' ? 1.04 : 0.93;
    const sectionGap = Math.max(8, Math.round(config.layout.sectionGap * 0.82));
    const contentGap = Math.max(6, Math.round(config.layout.contentGap * 0.8));
    const cardPadding = Math.max(12, Math.round(16 * densityScale));

    // Normaliza tamaños de texto para mayor consistencia visual
    const textSizes = {
        xs: 'calc(8.5pt * var(--scale-factor))',
        sm: 'calc(9pt * var(--scale-factor))',
        base: 'calc(9.5pt * var(--scale-factor))',
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontFamily: careConfig.fonts.heading,
        color: templateColors.primary,
        fontSize: 'calc(9.2pt * var(--scale-factor))',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: `${contentGap}px`,
        borderBottom: `1px solid ${templateColors.border}`,
        paddingBottom: '4px'
    };
    const cardStyle: React.CSSProperties = {
        backgroundColor: templateColors.card,
        boxShadow: '0 1px 8px rgba(0,0,0,0.03)',
        borderRadius: '1rem',
    };

    const compactList = (value: string) => (
        value
            .split(/[.\n]+/)
            .map(item => item.trim())
            .filter(item => item.length > 10)
    );

    return (
        <BaseTemplate
            config={careConfig}
            paddingUnit="cm"
            style={{
                backgroundColor: careConfig.colors.background,
                fontFamily: careConfig.fonts.body,
                padding: 0,
                fontSize: 'calc(9.8pt * var(--scale-factor))',
                lineHeight: '1.42',
                color: templateColors.text
            }}
        >
                <div style={{ padding: contentPadding }}>
                    <header className="relative" style={{ marginBottom: `${sectionGap}px` }}>
                        <div 
                            className="inline-block rounded-3xl"
                            style={{ 
                                backgroundColor: templateColors.card, 
                                boxShadow: '0 4px 16px rgba(193, 127, 89, 0.08)',
                                padding: `${Math.round(cardPadding * 0.9)}px ${Math.round(cardPadding * 1.2)}px`
                            }}
                    >
                        <h1 
                            className="font-semibold mb-3"
                            style={{ 
                                fontFamily: careConfig.fonts.heading,
                                color: templateColors.text,
                                letterSpacing: '-0.02em',
                                fontSize: 'calc(25pt * var(--scale-factor))'
                            }}
                        >
                            {data.personalInfo.fullName}
                        </h1>
                        {data.personalInfo.role && (
                            <p style={{ color: templateColors.accent, fontSize: 'calc(11pt * var(--scale-factor))' }}>
                                {data.personalInfo.role}
                            </p>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-12" style={{ gap: `${sectionGap}px` }}>
                    <div className="col-span-12 md:col-span-5 flex flex-col" style={{ gap: `${sectionGap}px` }}>
                        {data.personalInfo.summary && config.sections.summary.visible && (
                            <section 
                                className="break-inside-avoid"
                                style={{ ...cardStyle, padding: `${cardPadding}px` }}
                            >
                                <h2 style={sectionTitleStyle}>
                                    {config.sections.summary.title || 'Sobre Mí'}
                                </h2>
                                <p style={{ fontSize: textSizes.sm, lineHeight: 1.55, color: templateColors.muted }}>
                                    {data.personalInfo.summary}
                                </p>
                            </section>
                        )}

                        <section className="break-inside-avoid" style={{ ...cardStyle, padding: `${cardPadding}px` }}>
                            <h2 style={sectionTitleStyle}>Contacto</h2>
                            <div className="grid gap-y-1" style={{ fontSize: textSizes.sm }}>
                                {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                                {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                                {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                                {data.personalInfo.website && <div>{cleanUrl(data.personalInfo.website)}</div>}
                                {data.personalInfo.linkedin && <div>{cleanUrl(data.personalInfo.linkedin)}</div>}
                                {data.personalInfo.github && <div>{cleanUrl(data.personalInfo.github)}</div>}
                            </div>
                        </section>

                        {data.skills.length > 0 && config.sections.skills.visible && (
                            <section className="break-inside-avoid" style={{ ...cardStyle, padding: `${cardPadding}px` }}>
                                <h2 style={sectionTitleStyle}>{config.sections.skills.title || 'Habilidades'}</h2>
                                <div className="flex flex-wrap gap-2" style={{ fontSize: textSizes.sm }}>
                                    {data.skills.map((skill) => (
                                        <span
                                            key={skill.id}
                                            className="px-2 py-1 rounded-full"
                                            style={{ backgroundColor: templateColors.chipAlt, color: templateColors.text }}
                                        >
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {data.languages.length > 0 && config.sections.languages.visible && (
                            <section className="break-inside-avoid" style={{ ...cardStyle, padding: `${cardPadding}px` }}>
                                <h2 style={sectionTitleStyle}>{config.sections.languages.title || 'Idiomas'}</h2>
                                <div className="space-y-1" style={{ fontSize: textSizes.sm }}>
                                    {data.languages.map((lang) => (
                                        <div key={lang.id} className="flex justify-between">
                                            <span>{lang.language}</span>
                                            <span style={{ color: templateColors.muted }}>{lang.fluency}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {(data.tools && data.tools.length > 0) && config.sections.tools.visible && (
                            <section className="break-inside-avoid" style={{ ...cardStyle, padding: `${cardPadding}px` }}>
                                <h2 style={sectionTitleStyle}>{config.sections.tools.title || 'Herramientas'}</h2>
                                <div className="flex flex-wrap gap-2" style={{ fontSize: textSizes.sm }}>
                                    {data.tools.map((tool) => (
                                        <span key={tool} className="px-2 py-1 rounded-full" style={{ backgroundColor: templateColors.chip, color: templateColors.text }}>
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {data.interests.length > 0 && config.sections.interests.visible && (
                            <section className="break-inside-avoid" style={{ ...cardStyle, padding: `${cardPadding}px` }}>
                                <h2 style={sectionTitleStyle}>{config.sections.interests.title || 'Intereses'}</h2>
                                <div className="flex flex-wrap gap-2" style={{ fontSize: textSizes.sm }}>
                                    {data.interests.map((interest) => (
                                        <span key={interest.id} className="px-2 py-1 rounded-full" style={{ backgroundColor: templateColors.chip, color: templateColors.text }}>
                                            {interest.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="col-span-12 md:col-span-7 flex flex-col" style={{ gap: `${sectionGap}px` }}>
                        {data.experience.length > 0 && config.sections.experience.visible && (
                            <section className="break-inside-avoid" style={{ ...cardStyle, padding: `${cardPadding}px` }}>
                                <h2 style={sectionTitleStyle}>{config.sections.experience.title || 'Experiencia'}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: `${contentGap}px` }}>
                                    {data.experience.map((exp) => (
                                        <div key={exp.id} className="break-inside-avoid">
                                            <div className="flex justify-between items-baseline">
                                                <div className="font-semibold">{exp.position}</div>
                                                <div style={{ fontSize: textSizes.xs, color: templateColors.muted }}>
                                                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: textSizes.sm, color: templateColors.secondary }}>{exp.company}</div>
                                            {exp.description && (
                                                <ul className="list-disc ml-4 mt-2 space-y-1" style={{ fontSize: textSizes.sm, color: templateColors.muted }}>
                                                    {compactList(exp.description).map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {data.education.length > 0 && config.sections.education.visible && (
                            <section className="break-inside-avoid" style={{ ...cardStyle, padding: `${cardPadding}px` }}>
                                <h2 style={sectionTitleStyle}>{config.sections.education.title || 'Educación'}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: `${contentGap}px` }}>
                                    {data.education.map((edu) => (
                                        <div key={edu.id} className="break-inside-avoid">
                                            <div className="flex justify-between items-baseline">
                                                <div className="font-semibold">{edu.institution}</div>
                                                <div style={{ fontSize: textSizes.xs, color: templateColors.muted }}>
                                                    {formatDateRange(edu.startDate, edu.endDate, false)}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: textSizes.sm, color: templateColors.secondary }}>
                                                {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                                            </div>
                                            {edu.location && (
                                                <div style={{ fontSize: textSizes.xs, color: templateColors.muted }}>{edu.location}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {data.projects.length > 0 && config.sections.projects.visible && (
                            <section className="break-inside-avoid" style={{ ...cardStyle, padding: `${cardPadding}px` }}>
                                <h2 style={sectionTitleStyle}>{config.sections.projects.title || 'Proyectos'}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: `${contentGap}px`, fontSize: textSizes.sm }}>
                                    {data.projects.map((project) => (
                                        <div key={project.id} className="break-inside-avoid">
                                            <div className="font-semibold">{project.name}</div>
                                            <div style={{ color: templateColors.muted }}>{project.description}</div>
                                            {project.technologies.length > 0 && (
                                                <div className="mt-1" style={{ fontSize: textSizes.xs, color: templateColors.secondary }}>
                                                    {project.technologies.join(' · ')}
                                                </div>
                                            )}
                                            {project.url && (
                                                <div style={{ fontSize: textSizes.xs, color: templateColors.muted }}>
                                                    {cleanUrl(project.url)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {data.certifications.length > 0 && config.sections.certifications.visible && (
                            <section className="break-inside-avoid" style={{ ...cardStyle, padding: `${cardPadding}px` }}>
                                <h2 style={sectionTitleStyle}>{config.sections.certifications.title || 'Certificaciones'}</h2>
                                <div className="space-y-1" style={{ fontSize: textSizes.sm }}>
                                    {data.certifications.map((cert) => (
                                        <div key={cert.id} className="flex justify-between">
                                            <div>{cert.name} · {cert.issuer}</div>
                                            <div style={{ color: templateColors.muted }}>{cert.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </BaseTemplate>
    );
}
