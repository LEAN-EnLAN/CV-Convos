import React from 'react';
import { TemplateProps } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { cleanUrl, getDensityPadding } from '@/lib/cv-templates/utils';
import { BaseTemplate } from './SharedComponents';

/**
 * @component CapitalTemplate
 * @description Financial Precision - Data-driven, structured, analytical elegance.
 * Now optimized for high-density "One-Pager" layouts suitable for investment banking.
 */

export function CapitalTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    
    // Financial institution color palette
    const capitalColors = {
        navy: '#0f172a',           // Deep navy (primary)
        gold: '#b8860b',           // Dark goldenrod (accent)
        copper: '#b87333',         // Copper secondary
        cream: '#fafaf9',          // Warm white background
        slate: '#334155',          // Dark slate text
        silver: '#64748b',         // Medium gray for meta
        lightBorder: '#e2e8f0',    // Light gray borders
        accentBg: '#f8fafc',       // Subtle highlight
    };

    const templateFonts = {
        heading: config.fonts.heading,
        body: config.fonts.body,
    };

    const capitalConfig = {
        ...config,
        colors: {
            primary: capitalColors.navy,
            secondary: capitalColors.gold,
            accent: capitalColors.copper,
            background: capitalColors.cream,
            text: capitalColors.slate,
        },
        fonts: templateFonts,
    };

    // Manual padding calculation
    const contentPadding = getDensityPadding(config.layout.density, 'cm');

    // Helper for metrics/stat display - Compact Version
    const MetricBox = ({ label, value }: { label: string; value: string }) => (
        <div 
            className="text-center py-1 px-2 border-r last:border-r-0 flex flex-col justify-center"
            style={{ borderColor: capitalColors.lightBorder }}
        >
            <span 
                className="uppercase tracking-wider text-slate-400 leading-none mb-0.5"
                style={{ fontSize: 'calc(8px * var(--scale-factor))' }}
            >
                {label}
            </span>
            <span 
                className="font-bold leading-none" 
                style={{ color: capitalColors.navy, fontSize: 'calc(10pt * var(--scale-factor))' }}
            >
                {value}
            </span>
        </div>
    );

    // Calculate years of experience
    const yearsOfExp = data.experience.length > 0 
        ? Math.max(...data.experience.map(exp => {
            const start = new Date(exp.startDate).getFullYear();
            const end = exp.current ? new Date().getFullYear() : new Date(exp.endDate || '').getFullYear();
            return end - start;
        }))
        : 0;

    return (
        <BaseTemplate
            config={capitalConfig}
            className="relative"
            paddingUnit="cm"
            style={{
                backgroundColor: capitalConfig.colors.background,
                fontFamily: templateFonts.body,
                padding: 0, // Disable base padding for robust A4 layout
                lineHeight: 1.4,
                fontSize: 'calc(9pt * var(--scale-factor))',
            }}
        >
            {/* Top accent bar - Full Width */}
            <div 
                className="absolute top-0 left-0 right-0 h-1 z-20"
                style={{ 
                    background: `linear-gradient(to right, ${capitalColors.navy} 60%, ${capitalColors.gold} 60%, ${capitalColors.gold} 80%, ${capitalColors.copper} 80%)`
                }}
            />

            {/* Content Container */}
            <div style={{ padding: contentPadding }}>
                {/* Executive Header - Ultra Compact */}
                <header className="mb-5 pt-4 border-b pb-4" style={{ borderColor: capitalColors.lightBorder }}>
                    <div className="flex justify-between items-end gap-4">
                        {/* Identity */}
                        <div className="flex-1">
                            <h1 
                                className="font-bold mb-1 leading-none"
                                style={{ 
                                    fontFamily: templateFonts.heading,
                                    color: capitalColors.navy,
                                    letterSpacing: '-0.02em',
                                    fontSize: 'calc(30pt * var(--scale-factor))'
                                }}
                            >
                                {data.personalInfo.fullName}
                            </h1>
                            <div className="flex items-center gap-3">
                                {data.personalInfo.role && (
                                    <span 
                                        className="font-medium tracking-wide uppercase"
                                        style={{ color: capitalColors.gold, fontSize: 'calc(8pt * var(--scale-factor))' }}
                                    >
                                        {data.personalInfo.role}
                                    </span>
                                )}
                                {/* Inline Contact */}
                                <div 
                                    className="flex items-center gap-2 text-slate-500"
                                    style={{ fontSize: 'calc(8.5pt * var(--scale-factor))' }}
                                >
                                    {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
                                    {data.personalInfo.email && <span>• {data.personalInfo.email}</span>}
                                    {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
                                </div>
                            </div>
                        </div>

                        {/* KPI Metrics */}
                        <div 
                            className="flex border rounded bg-white shadow-sm"
                            style={{ borderColor: capitalColors.lightBorder }}
                        >
                            <MetricBox label="Exp (Yrs)" value={`${yearsOfExp}+`} />
                            <MetricBox label="Roles" value={String(data.experience.length)} />
                            <MetricBox label="Skills" value={String(data.skills.length)} />
                        </div>
                    </div>
                </header>

                {/* Executive Summary */}
                {data.personalInfo.summary && config.sections.summary.visible && (
                    <section className="mb-5 break-inside-avoid">
                        <p 
                            className="leading-relaxed text-justify"
                            style={{ color: capitalColors.slate, fontSize: 'calc(9pt * var(--scale-factor))' }}
                        >
                            <span className="font-bold text-navy mr-1">EXECUTIVE PROFILE ▸</span>
                            {data.personalInfo.summary}
                        </p>
                    </section>
                )}

                {/* Main Grid Layout */}
                <div className="grid grid-cols-12 gap-5">
                    {/* Main Column */}
                    <main className="col-span-12 md:col-span-8">
                        {/* Experience */}
                        {data.experience.length > 0 && config.sections.experience.visible && (
                            <section className="mb-6">
                                <h2 
                                    className="font-bold uppercase tracking-widest mb-3 pb-1 border-b"
                                    style={{ 
                                        fontFamily: templateFonts.heading,
                                        color: capitalColors.navy,
                                        borderColor: capitalColors.navy,
                                        fontSize: 'calc(10pt * var(--scale-factor))'
                                    }}
                                >
                                    Professional Experience
                                </h2>
                                
                                <div className="space-y-4">
                                    {data.experience.map((exp) => (
                                        <article key={exp.id} className="break-inside-avoid">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h3 
                                                    className="font-bold text-slate-900"
                                                    style={{ fontSize: 'calc(10pt * var(--scale-factor))' }}
                                                >
                                                    {exp.position}
                                                </h3>
                                                <span 
                                                    className="text-slate-500"
                                                    style={{ fontSize: 'calc(8pt * var(--scale-factor))' }}
                                                >
                                                    {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span 
                                                    className="font-medium" 
                                                    style={{ color: capitalColors.copper, fontSize: 'calc(9pt * var(--scale-factor))' }}
                                                >
                                                    {exp.company}
                                                </span>
                                                {exp.location && (
                                                    <span style={{ fontSize: 'calc(8pt * var(--scale-factor))', color: '#94a3b8' }}>{exp.location}</span>
                                                )}
                                            </div>
                                            
                                            {exp.description && (
                                                <p 
                                                    className="leading-normal text-slate-600 text-justify"
                                                    style={{ fontSize: 'calc(8.5pt * var(--scale-factor))' }}
                                                >
                                                    {exp.description}
                                                </p>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Projects */}
                        {data.projects && data.projects.length > 0 && config.sections.projects.visible && (
                            <section className="mb-6">
                                <h2 
                                    className="font-bold uppercase tracking-widest mb-3 pb-1 border-b"
                                    style={{ 
                                        fontFamily: templateFonts.heading,
                                        color: capitalColors.navy,
                                        borderColor: capitalColors.navy,
                                        fontSize: 'calc(10pt * var(--scale-factor))'
                                    }}
                                >
                                    Key Deals & Projects
                                </h2>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    {data.projects.map((proj) => (
                                        <article 
                                            key={proj.id}
                                            className="p-3 border rounded-sm bg-slate-50/50 break-inside-avoid"
                                            style={{ borderColor: capitalColors.lightBorder }}
                                        >
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h3 
                                                    className="font-bold text-slate-900"
                                                    style={{ fontSize: 'calc(9pt * var(--scale-factor))' }}
                                                >
                                                    {proj.name}
                                                </h3>
                                            </div>
                                            <p 
                                                className="text-slate-600 leading-snug"
                                                style={{ fontSize: 'calc(8.5pt * var(--scale-factor))' }}
                                            >
                                                {proj.description}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="col-span-12 md:col-span-4 flex flex-col gap-5">
                        {/* Skills */}
                        {data.skills.length > 0 && config.sections.skills.visible && (
                            <section>
                                <h3 
                                    className="font-bold uppercase tracking-widest mb-2 pb-1 border-b"
                                    style={{ 
                                        fontFamily: templateFonts.heading,
                                        borderColor: capitalColors.lightBorder,
                                        color: capitalColors.navy,
                                        fontSize: 'calc(9pt * var(--scale-factor))'
                                    }}
                                >
                                    Competencies
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.skills.map((skill) => (
                                        <span 
                                            key={skill.id}
                                            className="inline-flex items-center px-2 py-0.5 rounded font-medium border bg-white"
                                            style={{ 
                                                borderColor: capitalColors.lightBorder,
                                                color: capitalColors.slate,
                                                fontSize: 'calc(8pt * var(--scale-factor))'
                                            }}
                                        >
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Education */}
                        {data.education.length > 0 && config.sections.education.visible && (
                            <section>
                                <h3 
                                    className="font-bold uppercase tracking-widest mb-2 pb-1 border-b"
                                    style={{ 
                                        fontFamily: templateFonts.heading,
                                        borderColor: capitalColors.lightBorder,
                                        color: capitalColors.navy,
                                        fontSize: 'calc(9pt * var(--scale-factor))'
                                    }}
                                >
                                    Education
                                </h3>
                                <div className="space-y-3">
                                    {data.education.map((edu) => (
                                        <div key={edu.id}>
                                            <p 
                                                className="font-bold text-slate-900 leading-tight"
                                                style={{ fontSize: 'calc(9pt * var(--scale-factor))' }}
                                            >
                                                {edu.institution}
                                            </p>
                                            <p 
                                                className="text-copper font-medium"
                                                style={{ fontSize: 'calc(8.5pt * var(--scale-factor))' }}
                                            >
                                                {edu.degree}
                                            </p>
                                            <div 
                                                className="flex justify-between text-slate-400 mt-0.5"
                                                style={{ fontSize: 'calc(8pt * var(--scale-factor))' }}
                                            >
                                                <span>{edu.endDate}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Certifications */}
                        {data.certifications && data.certifications.length > 0 && config.sections.certifications.visible && (
                            <section>
                                <h3 
                                    className="font-bold uppercase tracking-widest mb-2 pb-1 border-b"
                                    style={{ 
                                        fontFamily: templateFonts.heading,
                                        borderColor: capitalColors.lightBorder,
                                        color: capitalColors.navy,
                                        fontSize: 'calc(9pt * var(--scale-factor))'
                                    }}
                                >
                                    Certifications
                                </h3>
                                <ul className="space-y-1.5">
                                    {data.certifications.map((cert) => (
                                        <li 
                                            key={cert.id} 
                                            className="text-slate-600 flex justify-between"
                                            style={{ fontSize: 'calc(8.5pt * var(--scale-factor))' }}
                                        >
                                            <span className="font-medium truncate pr-2">{cert.name}</span>
                                            <span className="text-slate-400 shrink-0" style={{ fontSize: 'calc(8pt * var(--scale-factor))' }}>{cert.date}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Languages */}
                        {data.languages && data.languages.length > 0 && config.sections.languages.visible && (
                            <section>
                                <h3 
                                    className="font-bold uppercase tracking-widest mb-2 pb-1 border-b"
                                    style={{ 
                                        fontFamily: templateFonts.heading,
                                        borderColor: capitalColors.lightBorder,
                                        color: capitalColors.navy,
                                        fontSize: 'calc(9pt * var(--scale-factor))'
                                    }}
                                >
                                    Languages
                                </h3>
                                <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                                    {data.languages.map((lang) => (
                                        <div 
                                            key={lang.id} 
                                            className="flex justify-between items-center border-b border-dashed border-slate-200 pb-0.5"
                                            style={{ fontSize: 'calc(8.5pt * var(--scale-factor))' }}
                                        >
                                            <span className="font-medium text-slate-700">{lang.language}</span>
                                            <span className="text-slate-400" style={{ fontSize: 'calc(8pt * var(--scale-factor))' }}>{lang.fluency}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </aside>
                </div>

                {/* Footer */}
                <footer 
                    className="mt-6 pt-2 border-t text-center"
                    style={{ borderColor: capitalColors.lightBorder }}
                >
                    <p 
                        className="text-slate-400 uppercase tracking-widest"
                        style={{ fontSize: 'calc(7pt * var(--scale-factor))' }}
                    >
                        References available upon request
                    </p>
                </footer>
            </div>
        </BaseTemplate>
    );
}
