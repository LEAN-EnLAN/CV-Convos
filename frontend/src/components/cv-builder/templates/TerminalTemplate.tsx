import React from 'react';
import { TemplateProps } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { cleanUrl, formatDateRange, getDensityPadding } from '@/lib/cv-templates/utils';
import { BaseTemplate } from './SharedComponents';

/**
 * @component TerminalTemplate
 * @description Technical Precision - Clean monospace elegance.
 */

export function TerminalTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const templateFonts = {
        heading: config.fonts.heading,
        body: config.fonts.body,
    };
    
    const codeColors = {
        comment: '#6b7280',
        keyword: '#c026d3',
        string: '#059669',
        function: '#2563eb',
        number: '#dc2626',
        operator: '#6b7280',
        background: '#fafaf9',
        text: '#1c1917',
        lineNumber: '#d6d3d1',
    };

    const terminalConfig = {
        ...config,
        colors: {
            primary: codeColors.function,
            secondary: codeColors.keyword,
            accent: codeColors.string,
            background: codeColors.background,
            text: codeColors.text,
        },
        fonts: templateFonts,
    };

    const contentPadding = getDensityPadding(config.layout.density, 'cm');
    const indent = (depth: number) => ({ paddingLeft: `${depth * 1.25}rem` });
    const contactFields = [
        { value: data.personalInfo.email, label: 'email' },
        { value: data.personalInfo.phone, label: 'phone' },
        { value: data.personalInfo.location, label: 'location' },
        { value: data.personalInfo.website ? cleanUrl(data.personalInfo.website) : '', label: 'website' },
        { value: data.personalInfo.linkedin ? cleanUrl(data.personalInfo.linkedin) : '', label: 'linkedin' },
        { value: data.personalInfo.github ? cleanUrl(data.personalInfo.github) : '', label: 'github' },
    ].filter(field => field.value);

    return (
        <BaseTemplate
            config={terminalConfig}
            paddingUnit="cm"
            style={{
                backgroundColor: terminalConfig.colors.background,
                fontFamily: templateFonts.body,
                padding: 0,
                fontSize: 'calc(12px * var(--scale-factor))',
                lineHeight: 1.6,
            }}
        >
            <div 
                className="absolute left-0 top-0 bottom-0 w-10 hidden print:hidden md:flex flex-col items-end pr-2 pt-8 select-none overflow-hidden"
                style={{ borderRight: `1px solid ${codeColors.lineNumber}`, left: 0, zIndex: 10 }}
            >
                {Array.from({ length: 80 }).map((_, i) => (
                    <span 
                        key={i} 
                        className="leading-6"
                        style={{ color: codeColors.lineNumber, fontSize: 'calc(10px * var(--scale-factor))' }}
                    >
                        {i + 1}
                    </span>
                ))}
            </div>

            <div
                style={{ 
                    paddingTop: contentPadding,
                    paddingBottom: contentPadding,
                    paddingRight: contentPadding,
                    paddingLeft: `calc(${contentPadding} + 2.5rem)`,
                    fontFamily: templateFonts.heading,
                }}
            >
                <header className="mb-8">
                    <div style={{ color: codeColors.comment }}>
                        <p style={{ fontSize: 'calc(12px * var(--scale-factor))' }}>/**</p>
                        <p style={{ fontSize: 'calc(12px * var(--scale-factor))' }}> * @file {data.personalInfo.fullName.toLowerCase().replace(/\s+/g, '_')}.cv</p>
                        <p style={{ fontSize: 'calc(12px * var(--scale-factor))' }}> * @author {data.personalInfo.fullName}</p>
                        <p style={{ fontSize: 'calc(12px * var(--scale-factor))' }}> */</p>
                    </div>
                </header>

                <section className="mb-6 break-inside-avoid">
                    <p className="mb-2" style={{ color: codeColors.keyword, fontSize: 'calc(12px * var(--scale-factor))' }}>
                        import <span style={{ color: codeColors.text }}>{'{'}</span>
                    </p>
                    <div style={indent(1)}>
                        {contactFields.map((field, index) => (
                            <p key={field.label} style={{ color: codeColors.text, fontSize: 'calc(12px * var(--scale-factor))' }}>
                                <span style={{ color: codeColors.string }}>"{field.value}"</span>
                                <span style={{ color: codeColors.operator }}>
                                    {` as ${field.label}${index < contactFields.length - 1 ? ',' : ''}`}
                                </span>
                            </p>
                        ))}
                    </div>
                    <p className="mt-1" style={{ color: codeColors.text, fontSize: 'calc(12px * var(--scale-factor))' }}>{'}'} from <span style={{ color: codeColors.string }}>"contact"</span>;</p>
                </section>

                {data.personalInfo.summary && config.sections.summary.visible && (
                    <section className="mb-8 break-inside-avoid">
                        <p className="mb-2" style={{ color: codeColors.comment, fontSize: 'calc(12px * var(--scale-factor))' }}>
                            // Summary
                        </p>
                        <div style={indent(1)}>
                            <p style={{ color: codeColors.text, fontSize: 'calc(12px * var(--scale-factor))' }}>
                                {`/* ${data.personalInfo.summary} */`}
                            </p>
                        </div>
                    </section>
                )}

                <section className="mb-8 break-inside-avoid">
                    <p className="mb-2" style={{ fontSize: 'calc(14px * var(--scale-factor))' }}>
                        <span style={{ color: codeColors.keyword }}>class</span>
                        <span style={{ color: codeColors.function }}> ProfessionalProfile </span>
                        <span style={{ color: codeColors.text }}>{'{'}</span>
                    </p>
                    
                    <div style={indent(1)}>
                        <p className="mb-1" style={{ fontSize: 'calc(12px * var(--scale-factor))' }}>
                            <span style={{ color: codeColors.keyword }}>constructor</span>
                            <span style={{ color: codeColors.text }}>() {'{'}</span>
                        </p>
                        <div style={indent(2)}>
                            <p style={{ fontSize: 'calc(12px * var(--scale-factor))' }}>
                                <span style={{ color: codeColors.keyword }}>this</span>.name = 
                                <span style={{ color: codeColors.string }}> "{data.personalInfo.fullName}"</span>;
                            </p>
                        </div>
                        <p style={{ ...indent(1), fontSize: 'calc(12px * var(--scale-factor))' }}>{'}'}</p>
                    </div>
                </section>

                {data.experience.length > 0 && config.sections.experience.visible && (
                    <section className="mb-8">
                    <p className="mb-3" style={{ color: codeColors.comment, fontSize: 'calc(12px * var(--scale-factor))' }}>
                        // Experience
                    </p>
                    
                    {data.experience.map((exp) => (
                        <div key={exp.id} className="mb-5 break-inside-avoid" style={indent(1)}>
                            <p style={{ fontSize: 'calc(14px * var(--scale-factor))' }}>
                                <span style={{ color: codeColors.keyword }}>async</span>
                                <span style={{ color: codeColors.function }}> {exp.position.replace(/[^a-zA-Z0-9]/g, '')}</span>
                                <span style={{ color: codeColors.text }}>() {'{'}</span>
                            </p>
                            <div style={indent(1)}>
                                <p style={{ fontSize: 'calc(12px * var(--scale-factor))', color: codeColors.text }}>
                                    return <span style={{ color: codeColors.string }}>`{exp.description}`</span>;
                                </p>
                                <p className="mt-1" style={{ fontSize: 'calc(11px * var(--scale-factor))', color: codeColors.comment }}>
                                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                </p>
                            </div>
                            <p style={{ ...indent(1), fontSize: 'calc(14px * var(--scale-factor))' }}>{'}'}</p>
                        </div>
                    ))}
                    </section>
                )}

                {data.skills.length > 0 && config.sections.skills.visible && (
                    <section className="mb-8 break-inside-avoid">
                        <p className="mb-3" style={{ color: codeColors.comment, fontSize: 'calc(12px * var(--scale-factor))' }}>
                            // Skills
                        </p>
                        <div style={indent(1)}>
                            <p style={{ fontSize: 'calc(12px * var(--scale-factor))' }}>
                                <span style={{ color: codeColors.keyword }}>const</span>
                                <span style={{ color: codeColors.function }}> skills </span>
                                <span style={{ color: codeColors.operator }}>=</span> [
                            </p>
                            <div style={indent(1)}>
                                <p style={{ color: codeColors.string, fontSize: 'calc(12px * var(--scale-factor))' }}>
                                    {data.skills.map(s => `"${s.name}"`).join(', ')}
                                </p>
                            </div>
                            <p style={{ fontSize: 'calc(12px * var(--scale-factor))' }}>];</p>
                        </div>
                    </section>
                )}

                {data.education.length > 0 && config.sections.education.visible && (
                    <section className="mb-8 break-inside-avoid">
                        <p className="mb-3" style={{ color: codeColors.comment, fontSize: 'calc(12px * var(--scale-factor))' }}>
                            // Education
                        </p>
                        <div style={indent(1)}>
                            <p style={{ fontSize: 'calc(12px * var(--scale-factor))' }}>
                                <span style={{ color: codeColors.keyword }}>const</span>
                                <span style={{ color: codeColors.function }}> education </span>
                                <span style={{ color: codeColors.operator }}>=</span> [
                            </p>
                            <div style={indent(1)}>
                                {data.education.map((edu) => (
                                    <p key={edu.id} style={{ color: codeColors.text, fontSize: 'calc(12px * var(--scale-factor))' }}>
                                        {'{ '}
                                        <span style={{ color: codeColors.string }}>institution: "{edu.institution}"</span>,{' '}
                                        <span style={{ color: codeColors.string }}>degree: "{edu.degree}"</span>,{' '}
                                        <span style={{ color: codeColors.string }}>dates: "{formatDateRange(edu.startDate, edu.endDate, false)}"</span>
                                        {' }'}
                                    </p>
                                ))}
                            </div>
                            <p style={{ fontSize: 'calc(12px * var(--scale-factor))' }}>];</p>
                        </div>
                    </section>
                )}

                {data.projects.length > 0 && config.sections.projects.visible && (
                    <section className="mb-8 break-inside-avoid">
                        <p className="mb-3" style={{ color: codeColors.comment, fontSize: 'calc(12px * var(--scale-factor))' }}>
                            // Projects
                        </p>
                        <div style={indent(1)}>
                            <p style={{ fontSize: 'calc(12px * var(--scale-factor))' }}>
                                <span style={{ color: codeColors.keyword }}>const</span>
                                <span style={{ color: codeColors.function }}> projects </span>
                                <span style={{ color: codeColors.operator }}>=</span> [
                            </p>
                            <div style={indent(1)}>
                                {data.projects.map((project) => (
                                    <p key={project.id} style={{ color: codeColors.text, fontSize: 'calc(12px * var(--scale-factor))' }}>
                                        {'{ '}
                                        <span style={{ color: codeColors.string }}>name: "{project.name}"</span>,{' '}
                                        <span style={{ color: codeColors.string }}>stack: "{project.technologies.join(', ')}"</span>
                                        {' }'}
                                    </p>
                                ))}
                            </div>
                            <p style={{ fontSize: 'calc(12px * var(--scale-factor))' }}>];</p>
                        </div>
                    </section>
                )}

                {data.languages.length > 0 && config.sections.languages.visible && (
                    <section className="mb-8 break-inside-avoid">
                        <p className="mb-3" style={{ color: codeColors.comment, fontSize: 'calc(12px * var(--scale-factor))' }}>
                            // Languages
                        </p>
                        <div style={indent(1)}>
                            {data.languages.map((lang) => (
                                <p key={lang.id} style={{ color: codeColors.text, fontSize: 'calc(12px * var(--scale-factor))' }}>
                                    <span style={{ color: codeColors.string }}>"{lang.language}"</span>
                                    <span style={{ color: codeColors.operator }}> ({lang.fluency})</span>
                                </p>
                            ))}
                        </div>
                    </section>
                )}

                {data.certifications.length > 0 && config.sections.certifications.visible && (
                    <section className="mb-8 break-inside-avoid">
                        <p className="mb-3" style={{ color: codeColors.comment, fontSize: 'calc(12px * var(--scale-factor))' }}>
                            // Certifications
                        </p>
                        <div style={indent(1)}>
                            {data.certifications.map((cert) => (
                                <p key={cert.id} style={{ color: codeColors.text, fontSize: 'calc(12px * var(--scale-factor))' }}>
                                    <span style={{ color: codeColors.string }}>"{cert.name}"</span>
                                    <span style={{ color: codeColors.operator }}> by {cert.issuer} ({cert.date})</span>
                                </p>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </BaseTemplate>
    );
}
