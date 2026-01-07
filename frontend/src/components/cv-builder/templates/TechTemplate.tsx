import React from 'react';
import { CVData } from '@/types/cv';
import { Terminal, Globe, Github, Linkedin, Mail, MapPin } from 'lucide-react';

interface TemplateProps {
    data: CVData;
}

/**
 * TechTemplate - ONE-PAGE optimized for developers
 * 
 * Design: Ultra-compact, 2-column layout, Fira Code monospace
 * Target: ≤1122px height for A4 printing
 * Spacing: Minimal gaps, tight padding, small fonts for metadata
 */
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';

export function TechTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const primaryColor = config.colors.primary;

    return (
        <div
            className="w-[794px] min-h-[1122px] bg-white flex flex-col print:shadow-none"
            style={{
                fontFamily: "'Fira Code', monospace",
                color: '#111827',
                padding: '2.54cm' // 1 inch margins
            }}
        >
            {/* COMPACT HEADER */}
            <header className="flex justify-between items-start mb-6 pb-3 border-b border-gray-200">
                <div className="flex-1">
                    <h1 className="text-2xl font-extrabold tracking-tight mb-1">
                        {data.personalInfo.fullName}
                    </h1>
                    {data.personalInfo.summary && (
                        <p className="text-xs text-gray-600 leading-snug max-w-md">
                            {data.personalInfo.summary}
                        </p>
                    )}
                </div>

                {/* Compact Contact Info */}
                <div className="w-48 text-[10px] font-mono space-y-0.5 text-right">
                    {data.personalInfo.email && (
                        <div className="flex items-center justify-end gap-1">
                            <Mail className="w-2.5 h-2.5 text-gray-400" />
                            <span className="truncate">{data.personalInfo.email}</span>
                        </div>
                    )}
                    {data.personalInfo.phone && (
                        <div className="flex items-center justify-end gap-1">
                            <Globe className="w-2.5 h-2.5 text-gray-400" />
                            <span>{data.personalInfo.phone}</span>
                        </div>
                    )}
                    {data.personalInfo.location && (
                        <div className="flex items-center justify-end gap-1">
                            <MapPin className="w-2.5 h-2.5 text-gray-400" />
                            <span>{data.personalInfo.location}</span>
                        </div>
                    )}
                    <div className="flex gap-2 justify-end mt-1">
                        {data.personalInfo.github && <Github className="w-3 h-3 text-black" />}
                        {data.personalInfo.linkedin && <Linkedin className="w-3 h-3 text-blue-600" />}
                    </div>
                </div>
            </header>

            <div className="flex gap-6 flex-1">
                {/* MAIN COLUMN: Experience & Projects */}
                <div className="flex-1 space-y-5">
                    {/* Experience Section */}
                    {data.experience.length > 0 && (
                        <section className="break-inside-avoid">
                            <h2 className="text-[10px] font-black uppercase tracking-widest mb-3 text-gray-900 flex items-center gap-2">
                                <span className="w-6 h-px bg-gray-300" /> Professional Experience
                            </h2>
                            <div className="space-y-4">
                                {data.experience.map((exp) => (
                                    <div key={exp.id} className="break-inside-avoid">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-sm">{exp.position}</h3>
                                            <span className="text-[9px] font-mono bg-gray-900 text-white px-1.5 py-0.5 rounded">
                                                {exp.startDate} - {exp.current ? 'NOW' : exp.endDate}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                                            {exp.company} • {exp.location}
                                        </p>
                                        <p className="text-xs leading-relaxed text-gray-600">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects Section - Compact Grid */}
                    {data.projects && data.projects.length > 0 && (
                        <section className="break-inside-avoid">
                            <h2 className="text-[10px] font-black uppercase tracking-widest mb-3 text-gray-900 flex items-center gap-2">
                                <span className="w-6 h-px bg-gray-300" /> Key Projects
                            </h2>
                            <div className="space-y-3">
                                {data.projects.map((proj) => (
                                    <div key={proj.id} className="break-inside-avoid">
                                        <h3 className="font-bold text-xs mb-0.5">{proj.name}</h3>
                                        <p className="text-[10px] text-gray-500 leading-normal mb-1.5">
                                            {proj.description}
                                        </p>
                                        {proj.technologies && (
                                            <div className="flex flex-wrap gap-1">
                                                {proj.technologies.map((tech, i) => (
                                                    <span key={i} className="text-[8px] font-mono px-1 py-0.5 bg-gray-50 rounded border border-gray-100">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education - Compact */}
                    {data.education.length > 0 && (
                        <section className="break-inside-avoid">
                            <h2 className="text-[10px] font-black uppercase tracking-widest mb-2.5 text-gray-900 flex items-center gap-2">
                                <span className="w-6 h-px bg-gray-300" /> Education
                            </h2>
                            <div className="space-y-2.5">
                                {data.education.map(edu => (
                                    <div key={edu.id} className="break-inside-avoid">
                                        <p className="text-xs font-bold">{edu.degree}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">{edu.institution}</p>
                                        <p className="text-[9px] font-mono text-gray-400">
                                            {edu.startDate} - {edu.endDate}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* SIDEBAR: Skills & Languages */}
                <div className="w-44 shrink-0 space-y-5">
                    {/* Skills - Ultra Compact */}
                    {data.skills.length > 0 && (
                        <section className="break-inside-avoid">
                            <h3 className="text-[9px] font-black uppercase mb-3 tracking-widest text-gray-900">Tech Stack</h3>
                            <div className="space-y-2.5" role="list">
                                {data.skills.map(skill => (
                                    <div key={skill.id} className="space-y-0.5">
                                        <div className="flex justify-between text-[10px] font-medium">
                                            <span className="truncate">{skill.name}</span>
                                            <span className="text-[8px] opacity-40 font-mono ml-1">{skill.level}</span>
                                        </div>
                                        <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${skill.proficiency || 50}%`,
                                                    backgroundColor: primaryColor
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages */}
                    {data.languages && data.languages.length > 0 && (
                        <section className="break-inside-avoid">
                            <h3 className="text-[9px] font-black uppercase mb-2.5 tracking-widest text-gray-900">Languages</h3>
                            <div className="space-y-1.5">
                                {data.languages.map(lang => (
                                    <div key={lang.id} className="text-[10px] flex justify-between">
                                        <span className="font-medium">{lang.language}</span>
                                        <span className="text-gray-400 text-[9px]">{lang.fluency}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {data.certifications && data.certifications.length > 0 && (
                        <section className="break-inside-avoid">
                            <h3 className="text-[9px] font-black uppercase mb-2.5 tracking-widest text-gray-900">Certifications</h3>
                            <div className="space-y-2">
                                {data.certifications.map(cert => (
                                    <div key={cert.id} className="break-inside-avoid">
                                        <div className="text-[10px] font-bold leading-tight">{cert.name}</div>
                                        <div className="text-[8px] text-gray-400">{cert.issuer} • {cert.date}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Meta Footer */}
                    <div className="pt-4 mt-auto">
                        <div className="p-2 bg-gray-50 rounded border border-gray-100">
                            <p className="text-[8px] font-mono text-gray-400 leading-relaxed uppercase tracking-tighter">
                                build: cv-convos-v1<br />
                                template: tech
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
