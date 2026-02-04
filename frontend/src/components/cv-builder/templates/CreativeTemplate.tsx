import React from 'react';
import { TemplateProps } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { cleanUrl, formatDateRange, getDensityPadding } from '@/lib/cv-templates/utils';
import { BaseTemplate, TemplateSection } from './SharedComponents';

/**
 * @component CreativeTemplate (Studio)
 * @description "The Modernist Manifesto" - A bold, editorial template for creatives.
 * Features massive typography, asymmetrical grids, and brutalist influences.
 */

// Studio Palette
const STUDIO_COLORS = {
    black: '#0a0a0a',
    white: '#ffffff',
    offWhite: '#f4f4f5',
    sidebarBg: '#fafafa',
    electricBlue: '#2563eb',
    gray: '#525252',
    border: '#e5e5e5',
};

export function CreativeTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const contentPadding = getDensityPadding(config.layout.density, 'cm');
    const studioFonts = {
        display: config.fonts.heading,
        body: config.fonts.body,
        mono: config.fonts.body,
    };

    return (
        <BaseTemplate
            config={config}
            paddingUnit="cm"
            style={{
                backgroundColor: STUDIO_COLORS.white,
                color: STUDIO_COLORS.black,
                fontFamily: studioFonts.body,
                padding: 0,
                fontSize: 'calc(10pt * var(--scale-factor))',
                lineHeight: '1.5',
            }}
        >
            {/* 1. THE MASTHEAD */}
            <header 
                className="relative flex flex-col justify-end"
                style={{ 
                    minHeight: '4.5cm',
                    backgroundColor: STUDIO_COLORS.offWhite,
                    paddingTop: '1.5cm',
                    paddingBottom: '1.5cm',
                    paddingLeft: contentPadding,
                    paddingRight: contentPadding,
                    borderBottom: `4px solid ${STUDIO_COLORS.black}`,
                }}
            >
                <div 
                    className="absolute top-0 right-0 h-full w-[2cm]"
                    style={{ backgroundColor: STUDIO_COLORS.electricBlue }}
                />

                <div className="relative z-10 max-w-[85%]">
                    <h1 
                        className="font-black tracking-tighter mb-2"
                        style={{ 
                            fontFamily: studioFonts.display, 
                            color: STUDIO_COLORS.black,
                            textTransform: 'uppercase',
                            fontSize: 'calc(42pt * var(--scale-factor))',
                            lineHeight: 0.9
                        }}
                    >
                        {data.personalInfo.fullName}
                    </h1>
                    
                    {data.personalInfo.role && (
                        <div className="flex items-center gap-3 mt-4">
                            <span 
                                className="px-3 py-1 font-bold text-white tracking-widest uppercase"
                                style={{ 
                                    backgroundColor: STUDIO_COLORS.black, 
                                    fontFamily: studioFonts.mono,
                                    fontSize: 'calc(9pt * var(--scale-factor))'
                                }}
                            >
                                {data.personalInfo.role}
                            </span>
                            <div className="h-px flex-1 bg-black/10" />
                        </div>
                    )}
                </div>
            </header>

            {/* 2. THE GRID CONTAINER */}
            <div 
                className="grid grid-cols-[35%_1fr] gap-0 min-h-[500px]"
                style={{ 
                    background: `linear-gradient(to right, ${STUDIO_COLORS.sidebarBg} 35%, ${STUDIO_COLORS.white} 35%)`
                }}
            >
                {/* LEFT COLUMN - Sidebar */}
                <aside 
                    className="border-r border-slate-200"
                    style={{ 
                        paddingTop: '1.5cm',
                        paddingLeft: contentPadding,
                        paddingRight: '1rem',
                        paddingBottom: contentPadding,
                    }}
                >
                    {/* Contact */}
                    <div
                        className="mb-10 space-y-3"
                        style={{ fontFamily: studioFonts.mono, fontSize: 'calc(9pt * var(--scale-factor))' }}
                    >
                        {[
                            data.personalInfo.email,
                            data.personalInfo.phone,
                            data.personalInfo.location
                        ].filter(Boolean).map((item, i) => (
                            <div key={i} className="flex items-center gap-2 break-all">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-none rotate-45 shrink-0" />
                                <span className="text-slate-600">{item}</span>
                            </div>
                        ))}
                        
                        {(data.personalInfo.linkedin || data.personalInfo.website) && (
                            <div className="pt-2 border-t border-slate-200 mt-2 space-y-2">
                                {[
                                    data.personalInfo.linkedin,
                                    data.personalInfo.website
                                ].filter(Boolean).map((url, i) => (
                                    <div key={i} className="break-all">
                                        <a href={url} className="underline decoration-blue-600/30 hover:decoration-blue-600 transition-all text-slate-800">
                                            {cleanUrl(url)}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Education */}
                    {data.education.length > 0 && config.sections.education.visible && (
                        <TemplateSection
                            visible={true}
                            title="Education"
                            sectionGap={32}
                            titleStyle={{
                                fontFamily: studioFonts.display,
                                fontSize: 'calc(14pt * var(--scale-factor))',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                color: STUDIO_COLORS.black,
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            className="break-inside-avoid"
                        >
                            <div className="space-y-6">
                                {data.education.map((edu) => (
                                    <div key={edu.id} className="relative pl-3 border-l-2 border-slate-200">
                                        <div className="font-bold leading-tight" style={{ fontSize: 'calc(10pt * var(--scale-factor))' }}>{edu.institution}</div>
                                        <div
                                            className="mt-1 text-slate-600 italic"
                                            style={{ fontFamily: studioFonts.display, fontSize: 'calc(9pt * var(--scale-factor))' }}
                                        >
                                            {edu.degree}
                                        </div>
                                        <div
                                            className="mt-2 text-slate-400"
                                            style={{ fontFamily: studioFonts.mono, fontSize: 'calc(8pt * var(--scale-factor))' }}
                                        >
                                            {edu.startDate} – {edu.endDate || 'Present'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TemplateSection>
                    )}

                    {/* Skills */}
                    {data.skills.length > 0 && config.sections.skills.visible && (
                        <TemplateSection
                            visible={true}
                            title="Skills"
                            sectionGap={32}
                            titleStyle={{
                                fontFamily: studioFonts.display,
                                fontSize: 'calc(14pt * var(--scale-factor))',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                color: STUDIO_COLORS.black,
                                marginBottom: '16px',
                            }}
                            className="break-inside-avoid"
                        >
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map((skill) => (
                                    <span 
                                        key={skill.id}
                                        className="px-2 py-1 font-bold border border-slate-900 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                        style={{ fontSize: 'calc(8pt * var(--scale-factor))' }}
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </TemplateSection>
                    )}
                </aside>

                {/* RIGHT COLUMN - Main Content */}
                <main 
                    style={{ 
                        paddingTop: '1.5cm',
                        paddingLeft: '1.5rem',
                        paddingRight: contentPadding,
                        paddingBottom: contentPadding,
                    }}
                >
                    {/* Summary */}
                    {data.personalInfo.summary && config.sections.summary.visible && (
                        <TemplateSection
                            visible={true}
                            title=""
                            sectionGap={40}
                            className="mb-10"
                        >
                            <p
                                className="leading-relaxed italic text-slate-800"
                                style={{ fontFamily: studioFonts.display, fontSize: 'calc(12pt * var(--scale-factor))' }}
                            >
                                {data.personalInfo.summary}
                            </p>
                        </TemplateSection>
                    )}

                    {/* Experience */}
                    {data.experience.length > 0 && config.sections.experience.visible && (
                        <TemplateSection
                            visible={true}
                            title="Experience"
                            sectionGap={40}
                            titleStyle={{
                                fontFamily: studioFonts.mono,
                                fontSize: 'calc(9pt * var(--scale-factor))',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                color: STUDIO_COLORS.electricBlue,
                                marginBottom: '24px',
                                borderBottom: `2px solid ${STUDIO_COLORS.electricBlue}`,
                                paddingBottom: '8px',
                                display: 'inline-block'
                            }}
                        >
                            <div className="space-y-10">
                                {data.experience.map((exp) => (
                                    <div key={exp.id} className="break-inside-avoid group">
                                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-3">
                                            <h3 
                                                className="font-black leading-none tracking-tight uppercase"
                                                style={{ fontSize: 'calc(16pt * var(--scale-factor))' }}
                                            >
                                                {exp.position}
                                            </h3>
                                            <span
                                                className="text-slate-400 shrink-0"
                                                style={{ fontFamily: studioFonts.mono, fontSize: 'calc(9pt * var(--scale-factor))' }}
                                            >
                                                {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                            </span>
                                        </div>
                                        
                                        <div 
                                            className="mb-4 font-medium text-blue-600 flex items-center gap-2"
                                            style={{ fontSize: 'calc(11pt * var(--scale-factor))' }}
                                        >
                                            {exp.company}
                                            {exp.location && <span className="text-slate-300 font-light text-sm">• {exp.location}</span>}
                                        </div>

                                        {exp.description && (
                                            <ul className="space-y-2">
                                                {exp.description
                                                    .split(/[.\n]+/)
                                                    .filter(s => s.trim().length > 0)
                                                    .map((item, i) => (
                                                        <li 
                                                            key={i} 
                                                            className="text-slate-600 leading-relaxed pl-4 border-l border-slate-300 hover:border-blue-500 transition-colors"
                                                            style={{ fontSize: 'calc(10pt * var(--scale-factor))' }}
                                                        >
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

                    {/* Selected Work */}
                    {data.projects && data.projects.length > 0 && config.sections.projects.visible && (
                        <TemplateSection
                            visible={true}
                            title="Selected Work"
                            sectionGap={40}
                            titleStyle={{
                                fontFamily: studioFonts.mono,
                                fontSize: 'calc(9pt * var(--scale-factor))',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                color: STUDIO_COLORS.electricBlue,
                                marginBottom: '24px',
                                borderBottom: `2px solid ${STUDIO_COLORS.electricBlue}`,
                                paddingBottom: '8px',
                                display: 'inline-block'
                            }}
                        >
                            <div className="grid grid-cols-1 gap-6">
                                {data.projects.map((proj) => (
                                    <div key={proj.id} className="bg-slate-50 p-5 border border-slate-100 break-inside-avoid relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-200" />
                                        <div className="flex justify-between items-start mb-2 pl-2">
                                            <h4 
                                                className="font-bold uppercase tracking-wide"
                                                style={{ fontSize: 'calc(11pt * var(--scale-factor))' }}
                                            >
                                                {proj.name}
                                            </h4>
                                            {proj.url && (
                                                <span
                                                    className="text-blue-600"
                                                    style={{ fontFamily: studioFonts.mono, fontSize: 'calc(8pt * var(--scale-factor))' }}
                                                >
                                                    {cleanUrl(proj.url)}
                                                </span>
                                            )}
                                        </div>
                                        <p 
                                            className="text-slate-600 pl-2 mb-3"
                                            style={{ fontSize: 'calc(9.5pt * var(--scale-factor))' }}
                                        >
                                            {proj.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </TemplateSection>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer
                className="absolute bottom-0 w-full text-center py-4 text-slate-400 uppercase tracking-widest border-t border-slate-100"
                style={{
                    backgroundColor: STUDIO_COLORS.white,
                    fontFamily: studioFonts.mono,
                    fontSize: 'calc(8pt * var(--scale-factor))'
                }}
            >
                Portfolio & References Available
            </footer>
        </BaseTemplate>
    );
}
