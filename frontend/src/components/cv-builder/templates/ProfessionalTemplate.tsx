import React from 'react';
import { TemplateProps } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { cleanUrl, formatDateRange, getDensityPadding } from '@/lib/cv-templates/utils';
import { BaseTemplate, TemplateSection } from './SharedComponents';

/**
 * @component ProfessionalTemplate
 * @description CEO/C-Suite executive template.
 * Design Philosophy: "Invisible Design" - pure typography, perfect spacing, and absolute clarity.
 */

// Executive color palette
const CEO_COLORS = {
    black: '#000000',
    charcoal: '#1a1a1a',
    slate: '#334155',
    lightGray: '#94a3b8',
    white: '#ffffff',
    border: '#e2e8f0',
    bannerBg: '#111827',
};

export function ProfessionalTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const contentPadding = getDensityPadding(config.layout.density, 'cm');
    const templateFonts = {
        heading: config.fonts.heading,
        body: config.fonts.body,
    };

    return (
        <BaseTemplate
            config={config}
            paddingUnit="cm"
            style={{
                backgroundColor: CEO_COLORS.white,
                color: CEO_COLORS.charcoal,
                fontFamily: templateFonts.body,
                padding: 0,
                // Base font size responds to scale factor
                fontSize: 'calc(10.5pt * var(--scale-factor))',
                lineHeight: '1.6',
            }}
        >
            {/* Header: Full-Width Banner Masthead */}
            <header 
                className="flex flex-col justify-center text-center"
                style={{ 
                    backgroundColor: CEO_COLORS.bannerBg,
                    color: CEO_COLORS.white,
                    paddingTop: '2.5cm',
                    paddingBottom: '2cm',
                    paddingLeft: contentPadding,
                    paddingRight: contentPadding,
                    marginBottom: '2rem'
                }}
            >
                <h1 
                    className="leading-none mb-4"
                    style={{ 
                        fontFamily: templateFonts.heading,
                        color: CEO_COLORS.white,
                        fontWeight: 400,
                        letterSpacing: '0.02em',
                        fontSize: 'calc(36pt * var(--scale-factor))'
                    }}
                >
                    {data.personalInfo.fullName}
                </h1>

                {data.personalInfo.role && (
                    <p 
                        className="uppercase tracking-[0.25em] font-medium opacity-90"
                        style={{ 
                            color: CEO_COLORS.lightGray,
                            fontSize: 'calc(12pt * var(--scale-factor))'
                        }}
                    >
                        {data.personalInfo.role}
                    </p>
                )}
            </header>

            {/* Content Container */}
            <div style={{ paddingLeft: contentPadding, paddingRight: contentPadding, paddingBottom: contentPadding }}>
                
                {/* Contact Info */}
                <div 
                    className="flex flex-wrap justify-center items-center gap-x-5 mb-10 pb-6 border-b border-slate-100" 
                    style={{ 
                        color: CEO_COLORS.slate,
                        fontSize: 'calc(9.5pt * var(--scale-factor))'
                    }}
                >
                    {[ 
                        data.personalInfo.email,
                        data.personalInfo.phone,
                        data.personalInfo.location
                    ].filter(Boolean).map((item, idx, arr) => (
                        <React.Fragment key={idx}>
                            <span>{item}</span>
                            {idx < arr.length - 1 && <span className="text-slate-300">•</span>}
                        </React.Fragment>
                    ))}
                    
                    {(data.personalInfo.linkedin || data.personalInfo.website) && (
                        <>
                            <span className="text-slate-300">•</span>
                            {[ 
                                data.personalInfo.linkedin ? cleanUrl(data.personalInfo.linkedin) : null,
                                data.personalInfo.website ? cleanUrl(data.personalInfo.website) : null
                            ].filter(Boolean).map((item, idx, arr) => (
                                <React.Fragment key={idx + 10}>
                                    <span className="font-medium text-slate-700 hover:text-black transition-colors">{item}</span>
                                    {idx < arr.length - 1 && <span className="text-slate-300">•</span>}
                                </React.Fragment>
                            ))}
                        </>
                    )}
                </div>

                {/* Executive Summary */}
                {data.personalInfo.summary && config.sections.summary.visible && (
                    <TemplateSection
                        visible={true}
                        title=""
                        sectionGap={config.layout.sectionGap}
                        className="mb-8 break-inside-avoid"
                    >
                        <p 
                            className="leading-relaxed text-justify italic"
                            style={{ 
                                fontFamily: templateFonts.heading,
                                color: CEO_COLORS.charcoal,
                                fontSize: 'calc(11pt * var(--scale-factor))'
                            }}
                        >
                            {data.personalInfo.summary}
                        </p>
                    </TemplateSection>
                )}

                {/* Experience */}
                {data.experience.length > 0 && config.sections.experience.visible && (
                    <TemplateSection
                        visible={true}
                        title={config.sections.experience.title || 'Professional Experience'}
                        sectionGap={config.layout.sectionGap}
                        titleStyle={{
                            fontFamily: templateFonts.heading,
                            fontSize: 'calc(14pt * var(--scale-factor))',
                            fontWeight: '400',
                            color: CEO_COLORS.black,
                            borderBottom: `1px solid ${CEO_COLORS.black}`,
                            paddingBottom: '4px',
                            marginBottom: '20px',
                        }}
                    >
                        <div className="flex flex-col gap-8">
                            {data.experience.map((exp) => (
                                <div key={exp.id} className="break-inside-avoid">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 
                                            className="font-bold"
                                        style={{ 
                                            color: CEO_COLORS.black, 
                                            fontFamily: templateFonts.heading,
                                            fontSize: 'calc(13pt * var(--scale-factor))'
                                        }}
                                    >
                                            {exp.position}
                                        </h3>
                                        <span 
                                            className="font-medium"
                                            style={{ 
                                                color: CEO_COLORS.slate,
                                                fontSize: 'calc(10pt * var(--scale-factor))'
                                            }}
                                        >
                                            {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                        </span>
                                    </div>
                                    
                                    <div 
                                        className="mb-3 italic" 
                                    style={{ 
                                        fontFamily: templateFonts.heading, 
                                        color: CEO_COLORS.slate,
                                        fontSize: 'calc(11pt * var(--scale-factor))'
                                    }}
                                    >
                                        {exp.company}
                                        {exp.location && <span> — {exp.location}</span>}
                                    </div>

                                    {exp.description && (
                                        <ul className="space-y-2">
                                            {exp.description
                                                .split(/[.\n]+/) 
                                                .filter(s => s.trim().length > 0)
                                                .map((item, i) => (
                                                    <li 
                                                        key={i} 
                                                        className="flex items-start gap-3"
                                                        style={{ fontSize: 'calc(10.5pt * var(--scale-factor))' }}
                                                    >
                                                        <span className="mt-2 w-1 h-1 bg-slate-800 rounded-full shrink-0" />
                                                        <span className="text-justify">{item.trim()}</span>
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </TemplateSection>
                )}

                {/* Grid for Bottom Sections */}
                <div className="grid grid-cols-[1fr_1fr] gap-8 mt-6">
                    <div className="flex flex-col gap-6">
                        {/* Education */}
                        {data.education.length > 0 && config.sections.education.visible && (
                            <TemplateSection
                                visible={true}
                                title={config.sections.education.title || 'Education'}
                                sectionGap={config.layout.sectionGap}
                                titleStyle={{
                                    fontFamily: templateFonts.heading,
                                    fontSize: 'calc(12pt * var(--scale-factor))',
                                    fontWeight: '700',
                                    color: CEO_COLORS.black,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: `1px solid ${CEO_COLORS.border}`,
                                    paddingBottom: '4px',
                                    marginBottom: '12px',
                                }}
                                className="break-inside-avoid"
                            >
                                <div className="space-y-4">
                                    {data.education.map((edu) => (
                                        <div key={edu.id}>
                                            <div className="font-bold" style={{ fontSize: 'calc(10.5pt * var(--scale-factor))' }}>{edu.institution}</div>
                                            <div className="italic" style={{ fontFamily: templateFonts.heading, fontSize: 'calc(10pt * var(--scale-factor))' }}>{edu.degree}</div>
                                            <div className="text-slate-500 mt-0.5" style={{ fontSize: 'calc(9pt * var(--scale-factor))' }}>
                                                {edu.startDate} – {edu.endDate || 'Present'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TemplateSection>
                        )}

                        {/* Projects */}
                        {data.projects && data.projects.length > 0 && config.sections.projects.visible && (
                            <TemplateSection
                                visible={true}
                                title="Board & Advisory"
                                sectionGap={config.layout.sectionGap}
                                titleStyle={{
                                    fontFamily: templateFonts.heading,
                                    fontSize: 'calc(12pt * var(--scale-factor))',
                                    fontWeight: '700',
                                    color: CEO_COLORS.black,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: `1px solid ${CEO_COLORS.border}`,
                                    paddingBottom: '4px',
                                    marginBottom: '12px',
                                }}
                                className="break-inside-avoid"
                            >
                                <div className="space-y-3">
                                    {data.projects.map((proj) => (
                                        <div key={proj.id}>
                                            <div className="font-bold" style={{ fontSize: 'calc(10.5pt * var(--scale-factor))' }}>{proj.name}</div>
                                            <div className="leading-snug text-slate-600 mt-1" style={{ fontSize: 'calc(9.5pt * var(--scale-factor))' }}>
                                                {proj.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TemplateSection>
                        )}
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Skills */}
                        {data.skills.length > 0 && config.sections.skills.visible && (
                            <TemplateSection
                                visible={true}
                                title={config.sections.skills.title || 'Core Competencies'}
                                sectionGap={config.layout.sectionGap}
                                titleStyle={{
                                    fontFamily: templateFonts.heading,
                                    fontSize: 'calc(12pt * var(--scale-factor))',
                                    fontWeight: '700',
                                    color: CEO_COLORS.black,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: `1px solid ${CEO_COLORS.border}`,
                                    paddingBottom: '4px',
                                    marginBottom: '12px',
                                }}
                                className="break-inside-avoid"
                            >
                                <div 
                                    className="leading-relaxed text-justify"
                                    style={{ fontSize: 'calc(10pt * var(--scale-factor))' }}
                                >
                                    {data.skills.map((skill, index) => (
                                        <React.Fragment key={skill.id}>
                                            <span className="inline-block whitespace-nowrap text-slate-800">
                                                {skill.name}
                                            </span>
                                            {index < data.skills.length - 1 && (
                                                <span className="mx-2 text-slate-300 select-none">•</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </TemplateSection>
                        )}

                        {/* Credentials */}
                        {((data.certifications && data.certifications.length > 0) || (data.languages && data.languages.length > 0)) && (
                            <TemplateSection
                                visible={true}
                                title="Credentials"
                                sectionGap={config.layout.sectionGap}
                                titleStyle={{
                                    fontFamily: templateFonts.heading,
                                    fontSize: 'calc(12pt * var(--scale-factor))',
                                    fontWeight: '700',
                                    color: CEO_COLORS.black,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: `1px solid ${CEO_COLORS.border}`,
                                    paddingBottom: '4px',
                                    marginBottom: '12px',
                                }}
                                className="break-inside-avoid"
                            >
                                <div className="space-y-4">
                                    {data.certifications && data.certifications.length > 0 && config.sections.certifications.visible && (
                                        <div className="space-y-2">
                                            <div className="font-bold text-slate-400 uppercase tracking-wider" style={{ fontSize: 'calc(9pt * var(--scale-factor))' }}>Certifications</div>
                                            {data.certifications.slice(0, 3).map((cert) => (
                                                <div key={cert.id} style={{ fontSize: 'calc(10pt * var(--scale-factor))' }}>
                                                    <span className="font-medium">{cert.name}</span>
                                                    {cert.issuer && <span className="text-slate-500">, {cert.issuer}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {data.languages && data.languages.length > 0 && config.sections.languages.visible && (
                                        <div className="space-y-2">
                                            <div className="font-bold text-slate-400 uppercase tracking-wider" style={{ fontSize: 'calc(9pt * var(--scale-factor))' }}>Languages</div>
                                            {data.languages.map((lang) => (
                                                <div key={lang.id} className="flex justify-between" style={{ fontSize: 'calc(10pt * var(--scale-factor))' }}>
                                                    <span className="font-medium">{lang.language}</span>
                                            <span className="text-slate-500 italic" style={{ fontFamily: templateFonts.heading }}>{lang.fluency}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TemplateSection>
                        )}
                    </div>
                </div>
            </div>
        </BaseTemplate>
    );
}
