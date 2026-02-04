import React from 'react';
import { TemplateProps } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { cleanUrl, formatDateRange, getDensityPadding } from '@/lib/cv-templates/utils';
import { BaseTemplate, TemplateSection } from './SharedComponents';

/**
 * @component ScholarTemplate
 * @description Plantilla academica con jerarquia tipografica sobria y legible.
 */

// Paleta inspirada en publicaciones academicas
const SCHOLAR_COLORS = {
    background: '#fbfaf7',
    ink: '#1b1b1b',
    primary: '#1f3a5f',
    accent: '#8c4b3e',
    muted: '#5f6b7a',
    rule: '#d9d2c3'
};

const splitIntoBullets = (text: string) => {
    return text
        .split(/[.\n]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 10);
};

const buildSkillsByCategory = (skills: TemplateProps['data']['skills']) => {
    return skills.reduce<Record<string, typeof skills>>((acc, skill) => {
        const category = skill.category?.trim() || 'Core';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill);
        return acc;
    }, {});
};

export function ScholarTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const contentPadding = getDensityPadding(config.layout.density, 'cm');
    const skillsByCategory = buildSkillsByCategory(data.skills);
    const templateFonts = {
        heading: config.fonts.heading,
        body: config.fonts.body,
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontFamily: templateFonts.heading,
        fontSize: 'calc(12px * var(--scale-factor))',
        fontWeight: 700,
        color: SCHOLAR_COLORS.primary,
        borderBottom: `1px solid ${SCHOLAR_COLORS.rule}`,
        paddingBottom: '4px',
        marginBottom: `${config.layout.contentGap}px`,
        letterSpacing: '0.4px',
        fontVariant: 'small-caps'
    };

    const sidebarTitleStyle: React.CSSProperties = {
        ...sectionTitleStyle,
        fontSize: 'calc(11px * var(--scale-factor))'
    };

    return (
        <BaseTemplate
            config={config}
            paddingUnit="cm"
            style={{
                backgroundColor: SCHOLAR_COLORS.background,
                color: SCHOLAR_COLORS.ink,
                fontFamily: templateFonts.body,
                padding: 0,
                fontSize: 'calc(11px * var(--scale-factor))',
                lineHeight: '1.55'
            }}
        >
            <div style={{ padding: contentPadding }}>
                {/* Encabezado academico */}
                <header
                    className="mb-6 pb-4"
                    style={{ borderBottom: `2px solid ${SCHOLAR_COLORS.primary}` }}
                >
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <h1
                                className="mb-2"
                                style={{
                                    fontFamily: templateFonts.heading,
                                    color: SCHOLAR_COLORS.primary,
                                    fontSize: 'calc(28px * var(--scale-factor))',
                                    fontWeight: 700,
                                    letterSpacing: '0.4px'
                                }}
                            >
                                {data.personalInfo.fullName}
                            </h1>
                            {data.personalInfo.role && (
                                <p
                                    className="italic"
                                    style={{
                                        fontFamily: templateFonts.heading,
                                        fontSize: 'calc(13px * var(--scale-factor))',
                                        color: SCHOLAR_COLORS.accent
                                    }}
                                >
                                    {data.personalInfo.role}
                                </p>
                            )}
                        </div>
                        <div
                            className="text-right space-y-1"
                            style={{ fontSize: 'calc(10px * var(--scale-factor))', color: SCHOLAR_COLORS.muted }}
                        >
                            {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                            {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                            {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                            {data.personalInfo.website && <div>{cleanUrl(data.personalInfo.website)}</div>}
                            {data.personalInfo.linkedin && <div>{cleanUrl(data.personalInfo.linkedin)}</div>}
                            {data.personalInfo.github && <div>{cleanUrl(data.personalInfo.github)}</div>}
                            {data.personalInfo.twitter && <div>{cleanUrl(data.personalInfo.twitter)}</div>}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-[1fr_2.2fr] gap-6">
                    <aside className="space-y-5">
                        {/* Habilidades y herramientas */}
                        {data.skills.length > 0 && config.sections.skills.visible && (
                            <TemplateSection
                                visible={true}
                                title={config.sections.skills.title || 'Research & Technical Skills'}
                                sectionGap={config.layout.sectionGap}
                                titleStyle={sidebarTitleStyle}
                                className="break-inside-avoid"
                            >
                                <div className="space-y-2" style={{ fontSize: 'calc(10px * var(--scale-factor))' }}>
                                    {Object.entries(skillsByCategory).map(([category, skills]) => (
                                        <div key={category}>
                                            <span className="font-semibold" style={{ color: SCHOLAR_COLORS.primary }}>
                                                {category}:
                                            </span>{' '}
                                            {skills.map((skill, index) => (
                                                <React.Fragment key={skill.id}>
                                                    {skill.name}
                                                    {index < skills.length - 1 ? ', ' : ''}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </TemplateSection>
                        )}

                        {data.tools && data.tools.length > 0 && config.sections.tools.visible && (
                            <TemplateSection
                                visible={true}
                                title={config.sections.tools.title || 'Tools & Systems'}
                                sectionGap={config.layout.sectionGap}
                                titleStyle={sidebarTitleStyle}
                                className="break-inside-avoid"
                            >
                                <p style={{ fontSize: 'calc(10px * var(--scale-factor))' }}>
                                    {data.tools.join(', ')}
                                </p>
                            </TemplateSection>
                        )}

                        {data.languages.length > 0 && config.sections.languages.visible && (
                            <TemplateSection
                                visible={true}
                                title={config.sections.languages.title || 'Languages'}
                                sectionGap={config.layout.sectionGap}
                                titleStyle={sidebarTitleStyle}
                                className="break-inside-avoid"
                            >
                                <div className="space-y-1" style={{ fontSize: 'calc(10px * var(--scale-factor))' }}>
                                    {data.languages.map((language) => (
                                        <div key={language.id} className="flex justify-between">
                                            <span>{language.language}</span>
                                            <span style={{ color: SCHOLAR_COLORS.muted }}>{language.fluency}</span>
                                        </div>
                                    ))}
                                </div>
                            </TemplateSection>
                        )}

                        {data.certifications.length > 0 && config.sections.certifications.visible && (
                            <TemplateSection
                                visible={true}
                                title={config.sections.certifications.title || 'Certifications'}
                                sectionGap={config.layout.sectionGap}
                                titleStyle={sidebarTitleStyle}
                                className="break-inside-avoid"
                            >
                                <div className="space-y-2" style={{ fontSize: 'calc(10px * var(--scale-factor))' }}>
                                    {data.certifications.map((cert) => (
                                        <div key={cert.id}>
                                            <div className="font-semibold" style={{ color: SCHOLAR_COLORS.primary }}>
                                                {cert.name}
                                            </div>
                                            <div className="italic" style={{ color: SCHOLAR_COLORS.muted }}>
                                                {cert.issuer} · {cert.date}
                                            </div>
                                            {cert.url && <div>{cleanUrl(cert.url)}</div>}
                                        </div>
                                    ))}
                                </div>
                            </TemplateSection>
                        )}

                        {data.interests.length > 0 && config.sections.interests.visible && (
                            <TemplateSection
                                visible={true}
                                title={config.sections.interests.title || 'Research Interests'}
                                sectionGap={config.layout.sectionGap}
                                titleStyle={sidebarTitleStyle}
                                className="break-inside-avoid"
                            >
                                <div className="space-y-2" style={{ fontSize: 'calc(10px * var(--scale-factor))' }}>
                                    {data.interests.map((interest) => (
                                        <div key={interest.id}>
                                            <span className="font-semibold" style={{ color: SCHOLAR_COLORS.primary }}>
                                                {interest.name}
                                            </span>
                                            {interest.keywords && interest.keywords.length > 0 && (
                                                <div style={{ color: SCHOLAR_COLORS.muted }}>
                                                    {interest.keywords.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </TemplateSection>
                        )}
                    </aside>

                    <main className="space-y-5">
                        {/* Perfil academico */}
                        {data.personalInfo.summary && config.sections.summary.visible && (
                            <TemplateSection
                                visible={true}
                                title={config.sections.summary.title || 'Research Profile'}
                                sectionGap={config.layout.sectionGap}
                                titleStyle={sectionTitleStyle}
                                className="break-inside-avoid"
                            >
                                <p className="text-justify leading-relaxed">
                                    {data.personalInfo.summary}
                                </p>
                            </TemplateSection>
                        )}

                        {/* Educacion */}
                        {data.education.length > 0 && config.sections.education.visible && (
                            <TemplateSection
                                visible={true}
                                title={config.sections.education.title || 'Education'}
                                sectionGap={config.layout.sectionGap}
                                titleStyle={sectionTitleStyle}
                            >
                                <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                                    {data.education.map((edu) => (
                                        <div key={edu.id} className="break-inside-avoid">
                                            <div className="flex justify-between items-baseline">
                                                <span
                                                    className="font-semibold"
                                                    style={{
                                                        fontFamily: templateFonts.heading,
                                                        fontSize: 'calc(12px * var(--scale-factor))'
                                                    }}
                                                >
                                                    {edu.institution}
                                                </span>
                                                <span style={{ fontSize: 'calc(10px * var(--scale-factor))', color: SCHOLAR_COLORS.muted }}>
                                                    {edu.location}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-baseline">
                                                <span className="italic" style={{ fontSize: 'calc(11px * var(--scale-factor))' }}>
                                                    {edu.degree}
                                                    {edu.fieldOfStudy && (
                                                        <span style={{ color: SCHOLAR_COLORS.accent }}> · {edu.fieldOfStudy}</span>
                                                    )}
                                                </span>
                                                <span style={{ fontSize: 'calc(10px * var(--scale-factor))', color: SCHOLAR_COLORS.muted }}>
                                                    {formatDateRange(edu.startDate, edu.endDate)}
                                                </span>
                                            </div>
                                            {edu.description && (
                                                <p className="mt-1 text-justify" style={{ fontSize: 'calc(10px * var(--scale-factor))' }}>
                                                    {edu.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </TemplateSection>
                        )}

                        {/* Experiencia */}
                        {data.experience.length > 0 && config.sections.experience.visible && (
                            <TemplateSection
                                visible={true}
                                title={config.sections.experience.title || 'Academic Appointments'}
                                sectionGap={config.layout.sectionGap}
                                titleStyle={sectionTitleStyle}
                            >
                                <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                                    {data.experience.map((exp) => (
                                        <div key={exp.id} className="break-inside-avoid">
                                            <div className="flex justify-between items-baseline">
                                                <span
                                                    className="font-semibold"
                                                    style={{
                                                        fontFamily: templateFonts.heading,
                                                        fontSize: 'calc(12px * var(--scale-factor))'
                                                    }}
                                                >
                                                    {exp.company}
                                                </span>
                                                <span style={{ fontSize: 'calc(10px * var(--scale-factor))', color: SCHOLAR_COLORS.muted }}>
                                                    {exp.location}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-baseline mb-1.5">
                                                <span className="italic" style={{ color: SCHOLAR_COLORS.accent, fontSize: 'calc(11px * var(--scale-factor))' }}>
                                                    {exp.position}
                                                </span>
                                                <span style={{ fontSize: 'calc(10px * var(--scale-factor))', color: SCHOLAR_COLORS.muted }}>
                                                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                                </span>
                                            </div>
                                            {exp.description && (
                                                <ul
                                                    className="list-disc ml-4 space-y-1"
                                                    style={{ fontSize: 'calc(10px * var(--scale-factor))' }}
                                                >
                                                    {splitIntoBullets(exp.description).map((item, index) => (
                                                        <li key={index} className="leading-relaxed text-justify">
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </TemplateSection>
                        )}

                        {/* Proyectos o publicaciones */}
                        {data.projects.length > 0 && config.sections.projects.visible && (
                            <TemplateSection
                                visible={true}
                                title={config.sections.projects.title || 'Research & Publications'}
                                sectionGap={config.layout.sectionGap}
                                titleStyle={sectionTitleStyle}
                            >
                                <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                                    {data.projects.map((project) => (
                                        <div key={project.id} className="break-inside-avoid">
                                            <div className="flex justify-between items-baseline">
                                                <span
                                                    className="font-semibold"
                                                    style={{
                                                        fontFamily: templateFonts.heading,
                                                        fontSize: 'calc(11.5px * var(--scale-factor))'
                                                    }}
                                                >
                                                    {project.name}
                                                </span>
                                                {project.url && (
                                                    <span style={{ fontSize: 'calc(10px * var(--scale-factor))', color: SCHOLAR_COLORS.muted }}>
                                                        {cleanUrl(project.url)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-justify" style={{ fontSize: 'calc(10px * var(--scale-factor))' }}>
                                                {project.description}
                                            </p>
                                            {project.technologies.length > 0 && (
                                                <div style={{ fontSize: 'calc(9.5px * var(--scale-factor))', color: SCHOLAR_COLORS.muted }}>
                                                    {project.technologies.join(' · ')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </TemplateSection>
                        )}
                    </main>
                </div>
            </div>
        </BaseTemplate>
    );
}
