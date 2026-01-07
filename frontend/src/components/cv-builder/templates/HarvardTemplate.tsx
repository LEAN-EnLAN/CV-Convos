import React from 'react';
import { CVData } from '@/types/cv';

interface TemplateProps {
    data: CVData;
}

/**
 * HarvardTemplate - Formato oficial de CV estilo Harvard Business School (Corregido)
 * 
 * Características:
 * - Tipografía: Times New Roman / Georgia (Serif)
 * - Tamaño base: 12px (aprox 11-12pt real)
 * - Márgenes: Estandarizados para impresión A4
 * - Sin colores: Protocolo estricto Ivy League
 * - ATS-Optimized: Estructura lineal y jerárquica
 */
export function HarvardTemplate({ data }: TemplateProps) {
    const config = data.config!;

    return (
        <div
            className="w-[794px] min-h-[1122px] text-[12px] leading-[1.4] print:shadow-none mx-auto"
            style={{
                fontFamily: "'Times New Roman', Georgia, serif",
                backgroundColor: '#ffffff',
                color: '#000000',
                padding: 'var(--cv-gap) 2.54cm', // 1 inch actual margins
                fontSize: '12px',
            }}
        >
            {/* Header - Nombre masivo y centrado */}
            <header className="text-center mb-8 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">
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

            {/* EDUCATION - Jerarquía Ivy League */}
            {data.education.length > 0 && config.sections.education.visible && (
                <section className="mb-6">
                    <h2 className="text-[14px] font-bold uppercase border-b border-black mb-3 pb-0.5 tracking-wider">
                        {config.sections.education.title || 'EDUCATION'}
                    </h2>
                    <div className="space-y-4">
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
                <section className="mb-6">
                    <h2 className="text-[14px] font-bold uppercase border-b border-black mb-3 pb-0.5 tracking-wider">
                        {config.sections.experience.title || 'PROFESSIONAL EXPERIENCE'}
                    </h2>
                    <div className="space-y-5">
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
                (data.certifications && data.certifications.length > 0 && config.sections.certifications.visible)) && (
                    <section className="mb-6">
                        <h2 className="text-[14px] font-bold uppercase border-b border-black mb-2 pb-0.5 tracking-wider">
                            {config.sections.skills.title || 'ADDITIONAL INFORMATION'}
                        </h2>
                        <div className="space-y-2">
                            {data.skills.length > 0 && config.sections.skills.visible && (
                                <div className="flex tabular-nums">
                                    <span className="font-bold w-32 shrink-0">Technical Skills:</span>
                                    <span className="flex-1">
                                        {data.skills.map((s, i) => (
                                            <React.Fragment key={s.id}>
                                                {i > 0 && '; '}
                                                {s.name}{config.layout.showExpertiseBar && ` (${s.level})`}
                                            </React.Fragment>
                                        ))}
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
                        </div>
                    </section>
                )}

            {/* PROJECTS */}
            {data.projects && data.projects.length > 0 && config.sections.projects.visible && (
                <section className="mb-6">
                    <h2 className="text-[14px] font-bold uppercase border-b border-black mb-3 pb-0.5 tracking-wider">
                        {config.sections.projects.title || 'SELECTED PROJECTS'}
                    </h2>
                    <div className="space-y-3">
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
