import React from 'react';
import { TemplateProps } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { cleanUrl, formatDateRange, getDensityPadding } from '@/lib/cv-templates/utils';
import { BaseTemplate, TemplateSection } from './SharedComponents';

/**
 * @component HarvardTemplate
 * @description The gold standard for ATS-optimized traditional resumes.
 */

// Harvard-inspired colors
const HARVARD_COLORS = {
    navy: '#1e3a5f',
    black: '#000000',
    gold: '#c9a227',
    burgundy: '#722f37',
    gray: '#4a4a4a',
    lightGray: '#6b6b6b',
};

export function HarvardTemplate({ data }: TemplateProps) {
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
                backgroundColor: '#ffffff',
                color: HARVARD_COLORS.black,
                fontFamily: templateFonts.body,
                padding: 0,
                fontSize: 'calc(11pt * var(--scale-factor))',
                lineHeight: '1.4',
            }}
        >
            <div style={{ padding: contentPadding }}>
                
                {/* Header */}
                <header className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: HARVARD_COLORS.navy }}>
                    <h1 
                        className="uppercase tracking-wide mb-3"
                        style={{
                            fontFamily: templateFonts.heading,
                            color: HARVARD_COLORS.black,
                            fontSize: 'calc(26pt * var(--scale-factor))',
                            fontWeight: 'bold'
                        }}
                    >
                        {data.personalInfo.fullName}
                    </h1>

                    <div 
                        className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1"
                        style={{ fontSize: 'calc(10pt * var(--scale-factor))' }}
                    >
                        {data.personalInfo.location && (
                            <span>{data.personalInfo.location}</span>
                        )}
                        {data.personalInfo.phone && (
                            <>
                                <span style={{ color: HARVARD_COLORS.lightGray }}>|</span>
                                <span>{data.personalInfo.phone}</span>
                            </>
                        )}
                        {data.personalInfo.email && (
                            <>
                                <span style={{ color: HARVARD_COLORS.lightGray }}>|</span>
                                <span className="font-medium">{data.personalInfo.email}</span>
                            </>
                        )}
                    </div>

                    {(data.personalInfo.linkedin || data.personalInfo.website) && (
                        <div 
                            className="flex flex-wrap justify-center gap-x-4 mt-2"
                            style={{ fontSize: 'calc(9pt * var(--scale-factor))' }}
                        >
                            {data.personalInfo.linkedin && (
                                <span className="text-[#0077b5]">{cleanUrl(data.personalInfo.linkedin)}</span>
                            )}
                            {data.personalInfo.website && (
                                <span style={{ color: HARVARD_COLORS.gray }}>{cleanUrl(data.personalInfo.website)}</span>
                            )}
                        </div>
                    )}
                </header>

                {/* Summary */}
                {data.personalInfo.summary && config.sections.summary.visible && (
                    <TemplateSection
                        visible={true}
                        title={config.sections.summary.title || 'Professional Summary'}
                        sectionGap={config.layout.sectionGap}
                        titleStyle={{
                            fontFamily: templateFonts.heading,
                            fontSize: 'calc(12pt * var(--scale-factor))',
                            fontWeight: 'bold',
                            color: HARVARD_COLORS.navy,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: `1px solid ${HARVARD_COLORS.navy}`,
                            paddingBottom: '3px',
                            marginBottom: '10px',
                        }}
                        className="break-inside-avoid"
                    >
                        <p className="text-justify leading-relaxed">
                            {data.personalInfo.summary}
                        </p>
                    </TemplateSection>
                )}

                {/* Education */}
                {data.education.length > 0 && config.sections.education.visible && (
                    <TemplateSection
                        visible={true}
                        title={config.sections.education.title || 'Education'}
                        sectionGap={config.layout.sectionGap}
                        titleStyle={{
                            fontFamily: templateFonts.heading,
                            fontSize: 'calc(12pt * var(--scale-factor))',
                            fontWeight: 'bold',
                            color: HARVARD_COLORS.navy,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: `1px solid ${HARVARD_COLORS.navy}`,
                            paddingBottom: '3px',
                            marginBottom: '10px',
                        }}
                    >
                        <div className="flex flex-col" style={{ gap: '12px' }}>
                            {data.education.map((edu) => (
                                <div key={edu.id} className="break-inside-avoid">
                                    <div className="flex justify-between items-baseline">
                                        <span 
                                            className="font-bold"
                                            style={{ fontFamily: templateFonts.heading, fontSize: 'calc(11pt * var(--scale-factor))' }}
                                        >
                                            {edu.institution}
                                        </span>
                                        <span style={{ fontSize: 'calc(10pt * var(--scale-factor))', color: HARVARD_COLORS.gray, fontStyle: 'italic' }}>
                                            {edu.location}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span style={{ fontSize: 'calc(10pt * var(--scale-factor))', fontStyle: 'italic' }}>
                                            {edu.degree}
                                            {edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}
                                        </span>
                                        <span style={{ fontSize: 'calc(10pt * var(--scale-factor))', fontStyle: 'italic', color: HARVARD_COLORS.gray }}>
                                            {edu.startDate} – {edu.endDate || 'Present'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                            fontSize: 'calc(12pt * var(--scale-factor))',
                            fontWeight: 'bold',
                            color: HARVARD_COLORS.navy,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: `1px solid ${HARVARD_COLORS.navy}`,
                            paddingBottom: '3px',
                            marginBottom: '10px',
                        }}
                    >
                        <div className="flex flex-col" style={{ gap: '14px' }}>
                            {data.experience.map((exp) => (
                                <div key={exp.id} className="break-inside-avoid">
                                    <div className="flex justify-between items-baseline">
                                        <span 
                                            className="font-bold"
                                            style={{ fontFamily: templateFonts.heading, fontSize: 'calc(11pt * var(--scale-factor))' }}
                                        >
                                            {exp.company}
                                        </span>
                                        <span style={{ fontSize: 'calc(10pt * var(--scale-factor))', color: HARVARD_COLORS.gray, fontStyle: 'italic' }}>
                                            {exp.location}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span style={{ fontSize: 'calc(10pt * var(--scale-factor))', fontStyle: 'italic' }}>
                                            {exp.position}
                                        </span>
                                        <span style={{ fontSize: 'calc(10pt * var(--scale-factor))', color: HARVARD_COLORS.gray, fontStyle: 'italic' }}>
                                            {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                        </span>
                                    </div>
                                    {exp.description && (
                                        <ul 
                                            className="list-disc ml-5 space-y-1"
                                            style={{ fontSize: 'calc(10.5pt * var(--scale-factor))' }}
                                        >
                                            {exp.description
                                                .split(/[.\n]+/) 
                                                .filter(s => s.trim().length > 10)
                                                .map((item, i) => (
                                                    <li key={i} className="text-justify leading-snug">
                                                        {item.trim()}
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </TemplateSection>
                )}

                {/* Skills */}
                {data.skills.length > 0 && config.sections.skills.visible && (
                    <TemplateSection
                        visible={true}
                        title={config.sections.skills.title || 'Skills'}
                        sectionGap={config.layout.sectionGap}
                        titleStyle={{
                            fontFamily: templateFonts.heading,
                            fontSize: 'calc(12pt * var(--scale-factor))',
                            fontWeight: 'bold',
                            color: HARVARD_COLORS.navy,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: `1px solid ${HARVARD_COLORS.navy}`,
                            paddingBottom: '3px',
                            marginBottom: '10px',
                        }}
                        className="break-inside-avoid"
                    >
                        <div style={{ fontSize: 'calc(10.5pt * var(--scale-factor))' }}>
                            <span className="font-semibold">Technical: </span>
                            {data.skills.map((s, i) => (
                                <React.Fragment key={s.id}>
                                    {s.name}{i < data.skills.length - 1 ? ', ' : ''}
                                </React.Fragment>
                            ))}
                        </div>
                    </TemplateSection>
                )}

                {/* Additional sections follow same pattern if needed */}
            </div>
        </BaseTemplate>
    );
}
