import React from 'react';
import { CVData } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';

/**
 * @component HarvardTemplate
 * @description Official Harvard Business School CV format - ATS-optimized, no colors.
 * 
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🤖 AI AGENT GUARDRAILS - READ BEFORE EDITING                             ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║ 1. STRUCTURE: Single-column, strictly linear layout                      ║
 * ║    - Header: Centered name + contact (no sidebar)                        ║
 * ║    - Sections: EDUCATION first, then EXPERIENCE (Ivy League priority)    ║
 * ║                                                                          ║
 * ║ 2. FONTS: Times New Roman / Georgia (serif) - DO NOT CHANGE              ║
 * ║    - This is a formal academic format, serif fonts are required          ║
 * ║                                                                          ║
 * ║ 3. SECTION PATTERN:                                                      ║
 * ║    {data.arrayName.length > 0 && config.sections.name.visible && (       ║
 * ║      <section className="mb-6">                                          ║
 * ║        <h2 className="text-[14px] font-bold uppercase border-b">TITLE</h2>║
 * ║        <div>{data.arrayName.map(...)}</div>                              ║
 * ║      </section>                                                          ║
 * ║    )}                                                                    ║
 * ║                                                                          ║
 * ║ 4. CRITICAL RULES:                                                       ║
 * ║    - NO COLORS - This template uses only black/white for ATS compliance  ║
 * ║    - Margins: 2.54cm (1 inch) - do not change                            ║
 * ║    - Font size: 12px base - matches real 11-12pt for printing            ║
 * ║                                                                          ║
 * ║ 5. TESTING: Run `npx tsc --noEmit` after edits                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

interface TemplateProps {
    data: CVData;
}

export function HarvardTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;

    // Dynamic padding based on density
    const paddingMap = {
        compact: '1.5cm',
        standard: '2.54cm',
        relaxed: '3cm'
    };

    return (
        <div
            className="w-[794px] h-[1122px] max-h-[1122px] overflow-hidden text-[12px] leading-[1.4] print:shadow-none mx-auto"
            style={{
                fontFamily: config.fonts.body,
                backgroundColor: 'oklch(1 0 0)',
                color: 'oklch(0.15 0.02 280)',
                padding: paddingMap[config.layout.density] || '2.54cm',
                fontSize: '12px',
                '--section-gap': `${config.layout.sectionGap}px`,
                '--content-gap': `${config.layout.contentGap}px`
            } as React.CSSProperties}
        >
            {/* Header - Nombre masivo y centrado */}
            <header className="text-center border-b-2 border-foreground pb-4" style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-2" style={{ fontFamily: config.fonts.heading }}>
                    {data.personalInfo.fullName}
                </h1>
                <div className="text-[12px] flex flex-wrap justify-center gap-x-3 gap-y-1">
                    {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                    {data.personalInfo.phone && (
                        <>
                            <span className="opacity-50">|</span>
                            <span>{data.personalInfo.phone}</span>
                        </>
                    )}
                    {data.personalInfo.email && (
                        <>
                            <span className="opacity-50">|</span>
                            <span className="font-semibold">{data.personalInfo.email}</span>
                        </>
                    )}
                </div>
                {(data.personalInfo.linkedin || data.personalInfo.github || data.personalInfo.website) && (
                    <div className="text-[11px] flex flex-wrap justify-center gap-x-3 mt-2 font-serif italic">
                        {data.personalInfo.linkedin && (
                            <span>{data.personalInfo.linkedin.replace('https://', '').replace('www.', '')}</span>
                        )}
                        {data.personalInfo.github && (
                            <span>{data.personalInfo.github.replace('https://', '').replace('www.', '')}</span>
                        )}
                        {data.personalInfo.website && (
                            <span>{data.personalInfo.website.replace('https://', '').replace('www.', '')}</span>
                        )}
                    </div>
                )}
            </header>

            {/* PROFESSIONAL SUMMARY - "Sobre mí" */}
            {data.personalInfo.summary && config.sections.summary.visible && (
                <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                    <h2 className="text-[14px] font-bold uppercase border-b border-black pb-0.5 tracking-wider" style={{ marginBottom: `${config.layout.contentGap}px`, fontFamily: config.fonts.heading }}>
                        {config.sections.summary.title || 'PROFESSIONAL SUMMARY'}
                    </h2>
                    <p className="text-justify leading-relaxed">
                        {data.personalInfo.summary}
                    </p>
                </section>
            )}

            {/* EDUCATION - Jerarquía Ivy League */}
            {data.education.length > 0 && config.sections.education.visible && (
                <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                    <h2 className="text-[14px] font-bold uppercase border-b border-black pb-0.5 tracking-wider" style={{ marginBottom: `${config.layout.contentGap}px`, fontFamily: config.fonts.heading }}>
                        {config.sections.education.title || 'EDUCATION'}
                    </h2>
                    <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                        {data.education.map((edu) => (
                            <div key={edu.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold text-[13px]">{edu.institution}</span>
                                    <span className="font-bold">{edu.location}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="italic">{edu.degree}{edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}</span>
                                    <span className="italic">
                                        {edu.startDate} – {edu.endDate || 'Present'}
                                    </span>
                                </div>
                                {edu.description && (
                                    <p className="mt-1.5 text-justify">{edu.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* EXPERIENCE - STAR Method formatting */}
            {data.experience.length > 0 && config.sections.experience.visible && (
                <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                    <h2 className="text-[14px] font-bold uppercase border-b border-black pb-0.5 tracking-wider" style={{ marginBottom: `${config.layout.contentGap}px`, fontFamily: config.fonts.heading }}>
                        {config.sections.experience.title || 'PROFESSIONAL EXPERIENCE'}
                    </h2>
                    <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                        {data.experience.map((exp) => (
                            <div key={exp.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold text-[13px] uppercase">{exp.company}</span>
                                    <span className="font-bold">{exp.location}</span>
                                </div>
                                <div className="flex justify-between items-baseline mb-1.5">
                                    <span className="italic font-medium">{exp.position}</span>
                                    <span className="italic">
                                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <ul className="list-disc ml-5 space-y-1">
                                    {exp.description
                                        .split(/[.\n]/)
                                        .filter(s => s.trim().length > 5)
                                        .map((sentence, i) => (
                                            <li key={i} className="text-justify leading-snug">
                                                {sentence.trim()}{!sentence.trim().endsWith('.') && '.'}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ADDITIONAL INFORMATION */}
            {((data.skills.length > 0 && config.sections.skills.visible) ||
                (data.languages && data.languages.length > 0 && config.sections.languages.visible) ||
                (data.certifications && data.certifications.length > 0 && config.sections.certifications.visible) ||
                (data.tools && data.tools.length > 0 && config.sections.tools.visible) ||
                (data.interests && data.interests.length > 0 && config.sections.interests.visible)) && (
                    <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                        <h2 className="text-[14px] font-bold uppercase border-b border-black pb-0.5 tracking-wider" style={{ marginBottom: `${config.layout.contentGap / 2}px`, fontFamily: config.fonts.heading }}>
                            {config.sections.skills.title || 'ADDITIONAL INFORMATION'}
                        </h2>
                        <div className="flex flex-col" style={{ gap: `${config.layout.contentGap / 2}px` }}>
                            {data.skills.length > 0 && config.sections.skills.visible && (
                                <div className="flex tabular-nums">
                                    <span className="font-bold w-32 shrink-0">Technical Skills:</span>
                                    <span className="flex-1">
                                        {data.skills.map((s, i) => (
                                            <React.Fragment key={s.id}>
                                                {i > 0 && '; '}
                                                {s.name}
                                            </React.Fragment>
                                        ))}
                                    </span>
                                </div>
                            )}
                            {data.tools && data.tools.length > 0 && config.sections.tools?.visible && (
                                <div className="flex">
                                    <span className="font-bold w-32 shrink-0">Tools:</span>
                                    <span className="flex-1">
                                        {data.tools.join('; ')}
                                    </span>
                                </div>
                            )}
                            {data.languages && data.languages.length > 0 && config.sections.languages.visible && (
                                <div className="flex">
                                    <span className="font-bold w-32 shrink-0">Languages:</span>
                                    <span className="flex-1">
                                        {data.languages.map(l => `${l.language} (${l.fluency})`).join(', ')}
                                    </span>
                                </div>
                            )}
                            {data.certifications && data.certifications.length > 0 && config.sections.certifications.visible && (
                                <div className="flex">
                                    <span className="font-bold w-32 shrink-0">Certifications:</span>
                                    <span className="flex-1">
                                        {data.certifications.map(c => `${c.name} (${c.issuer})`).join('; ')}
                                    </span>
                                </div>
                            )}
                            {data.interests && data.interests.length > 0 && config.sections.interests?.visible && (
                                <div className="flex italic opacity-80">
                                    <span className="font-bold w-32 shrink-0 not-italic">Interests:</span>
                                    <span className="flex-1">
                                        {data.interests.map(i => i.name).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

            {/* PROJECTS */}
            {data.projects && data.projects.length > 0 && config.sections.projects.visible && (
                <section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
                    <h2 className="text-[14px] font-bold uppercase border-b border-black pb-0.5 tracking-wider" style={{ marginBottom: `${config.layout.contentGap}px`, fontFamily: config.fonts.heading }}>
                        {config.sections.projects.title || 'SELECTED PROJECTS'}
                    </h2>
                    <div className="flex flex-col" style={{ gap: `${config.layout.contentGap}px` }}>
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-[13px] italic">{proj.name}</span>
                                    {proj.url && <span className="text-[11px] underline">{proj.url.replace(/^https?:\/\//, '')}</span>}
                                </div>
                                <p className="text-justify leading-relaxed">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
