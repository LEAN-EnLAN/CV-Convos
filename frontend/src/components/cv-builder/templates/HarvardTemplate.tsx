import React from 'react';
import { CVData } from '@/types/cv';

interface TemplateProps {
    data: CVData;
}

/**
 * HarvardTemplate - Formato oficial de CV estilo Harvard Business School
 * 
 * Características:
 * - Tipografía: Times New Roman / Georgia, 11pt
 * - Márgenes: 0.5" - 0.75" uniformes
 * - Orden: EDUCATION primero, luego EXPERIENCE
 * - Sin colores: Todo negro sobre blanco
 * - Bullets: Cuantificados con métricas STAR
 * - ATS-Optimized: Sin elementos decorativos
 */
export function HarvardTemplate({ data }: TemplateProps) {
    const config = data.config!;

    // Harvard ignora customización de colores intencionalmente
    const textColor = '#000000';
    const bgColor = '#ffffff';

    return (
        <div
            className="w-[794px] min-h-[1122px] text-[11px] leading-[1.4] print:shadow-none"
            style={{
                fontFamily: "'Times New Roman', Georgia, serif",
                backgroundColor: bgColor,
                color: textColor,
                padding: 'var(--cv-gap) 56px', // Dynamic margins
                fontSize: 'var(--cv-font-size-base)',
            }}
        >
            {/* Header - Nombre centrado */}
            <header className="text-center mb-4 border-b border-black pb-3">
                <h1 className="text-[18px] font-bold uppercase tracking-wide mb-1">
                    {data.personalInfo.fullName}
                </h1>
                <div className="text-[10px] flex flex-wrap justify-center gap-x-2">
                    {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                    {data.personalInfo.location && data.personalInfo.phone && <span>|</span>}
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo.phone && data.personalInfo.email && <span>|</span>}
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                </div>
                {(data.personalInfo.linkedin || data.personalInfo.github || data.personalInfo.website) && (
                    <div className="text-[10px] flex flex-wrap justify-center gap-x-2 mt-1">
                        {data.personalInfo.linkedin && (
                            <span>{data.personalInfo.linkedin.replace('https://', '').replace('www.', '')}</span>
                        )}
                        {data.personalInfo.linkedin && data.personalInfo.github && <span>|</span>}
                        {data.personalInfo.github && (
                            <span>{data.personalInfo.github.replace('https://', '').replace('www.', '')}</span>
                        )}
                    </div>
                )}
            </header>

            {/* EDUCATION - Primero según formato Harvard */}
            {data.education.length > 0 && config.sections.education.visible && (
                <section className="mb-4">
                    <h2 className="text-[12px] font-bold uppercase border-b border-black mb-2 pb-0.5">
                        {config.sections.education.title || 'EDUCATION'}
                    </h2>
                    <div className="space-y-3">
                        {data.education.map((edu) => (
                            <div key={edu.id}>
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold">{edu.institution}</span>
                                    <span className="text-[10px]">{edu.location}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="italic">{edu.degree}{edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}</span>
                                    <span className="text-[10px]">
                                        {edu.startDate} – {edu.endDate || 'Present'}
                                    </span>
                                </div>
                                {edu.description && (
                                    <p className="mt-1 text-[10px]">{edu.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* EXPERIENCE */}
            {data.experience.length > 0 && config.sections.experience.visible && (
                <section className="mb-4">
                    <h2 className="text-[12px] font-bold uppercase border-b border-black mb-2 pb-0.5">
                        {config.sections.experience.title || 'PROFESSIONAL EXPERIENCE'}
                    </h2>
                    <div className="space-y-4">
                        {data.experience.map((exp) => (
                            <div key={exp.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold">{exp.company}</span>
                                    <span className="text-[10px]">{exp.location}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="italic">{exp.position}</span>
                                    <span className="text-[10px]">
                                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <ul className="list-disc ml-5 mt-1 space-y-0.5">
                                    {exp.description
                                        .split(/[.\n]/)
                                        .filter(s => s.trim().length > 5)
                                        .map((sentence, i) => (
                                            <li key={i} className="text-[10.5px] leading-[1.3]">
                                                {sentence.trim()}{!sentence.trim().endsWith('.') && '.'}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ADDITIONAL INFORMATION / SKILLS */}
            {((data.skills.length > 0 && config.sections.skills.visible) ||
                (data.languages && data.languages.length > 0 && config.sections.languages.visible) ||
                (data.certifications && data.certifications.length > 0 && config.sections.certifications.visible)) && (
                    <section className="mb-4">
                        <h2 className="text-[12px] font-bold uppercase border-b border-black mb-2 pb-0.5">
                            {config.sections.skills.title || 'ADDITIONAL INFORMATION'}
                        </h2>
                        <div className="space-y-1.5">
                            {/* Skills */}
                            {data.skills.length > 0 && config.sections.skills.visible && (
                                <div className="flex">
                                    <span className="font-bold w-24 shrink-0">Skills:</span>
                                    <span className="flex-1">
                                        {data.skills.map((s, i) => (
                                            <React.Fragment key={s.id}>
                                                {i > 0 && ', '}
                                                {s.name}
                                                {config.layout.showExpertiseBar && (
                                                    <span className="text-[9px] ml-0.5">
                                                        ({s.level})
                                                    </span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </span>
                                </div>
                            )}

                            {/* Languages */}
                            {data.languages && data.languages.length > 0 && config.sections.languages.visible && (
                                <div className="flex">
                                    <span className="font-bold w-24 shrink-0">Languages:</span>
                                    <span className="flex-1">
                                        {data.languages.map(l => `${l.language} (${l.fluency})`).join(', ')}
                                    </span>
                                </div>
                            )}

                            {/* Certifications */}
                            {data.certifications && data.certifications.length > 0 && config.sections.certifications.visible && (
                                <div className="flex">
                                    <span className="font-bold w-24 shrink-0">Certifications:</span>
                                    <span className="flex-1">
                                        {data.certifications.map(c => `${c.name} (${c.issuer}, ${c.date})`).join('; ')}
                                    </span>
                                </div>
                            )}

                            {/* Interests */}
                            {data.interests && data.interests.length > 0 && config.sections.interests.visible && (
                                <div className="flex">
                                    <span className="font-bold w-24 shrink-0">Interests:</span>
                                    <span className="flex-1">
                                        {data.interests.map(i => i.name).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

            {/* PROJECTS - Solo si existen */}
            {data.projects && data.projects.length > 0 && config.sections.projects.visible && (
                <section className="mb-4">
                    <h2 className="text-[12px] font-bold uppercase border-b border-black mb-2 pb-0.5">
                        {config.sections.projects.title || 'PROJECTS'}
                    </h2>
                    <div className="space-y-2">
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold">{proj.name}</span>
                                    {proj.url && (
                                        <span className="text-[9px] italic">
                                            {proj.url.replace('https://', '').replace('www.', '')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10.5px] mt-0.5">{proj.description}</p>
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <p className="text-[9px] italic mt-0.5">
                                        Technologies: {proj.technologies.join(', ')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* SUMMARY - Al final (opcional en Harvard style) */}
            {data.personalInfo.summary && config.sections.summary.visible && (
                <section className="mb-4">
                    <h2 className="text-[12px] font-bold uppercase border-b border-black mb-2 pb-0.5">
                        {config.sections.summary.title || 'PROFESSIONAL SUMMARY'}
                    </h2>
                    <p className="text-justify text-[10.5px] leading-[1.4]">
                        {data.personalInfo.summary}
                    </p>
                </section>
            )}
        </div>
    );
}

