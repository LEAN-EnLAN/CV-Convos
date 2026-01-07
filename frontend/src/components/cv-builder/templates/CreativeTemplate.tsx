import React from 'react';
import { CVData } from '@/types/cv';

interface TemplateProps {
    data: CVData;
}

/**
 * CreativeTemplate - Diseño audaz estilo Editorial / Magazine
 * 
 * Inspiración: Dribbble/Canva
 * - Tipografía: Inter / Montserrat (Bold)
 * - Layout: Asimétrico con Sidebar de color
 * - Elementos: Bloques de color sólido, tipografía masiva, espaciado generoso
 */
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';

export function CreativeTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const primaryColor = config.colors.primary;
    const secondaryColor = config.colors.secondary;

    return (
        <div
            className="w-[794px] min-h-[1122px] flex print:shadow-none bg-white relative overflow-hidden"
            style={{ fontFamily: "'Raleway', sans-serif" }}
        >
            {/* Background Accent - Decorative circle or shape */}
            <div
                className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full blur-3xl opacity-10"
                style={{ backgroundColor: primaryColor }}
            />

            {/* LEFT SIDEBAR (Bold Color) - 35% */}
            <aside
                aria-label="Contact and Skills"
                className="w-[35%] flex flex-col shrink-0 p-10 text-white relative z-10"
                style={{ backgroundColor: primaryColor }}
            >
                {/* Contact Block */}
                <div className="mb-12">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">Info</h2>
                    <div className="space-y-4 text-xs font-medium">
                        <div className="group">
                            <p className="opacity-50 text-[9px] uppercase mb-0.5">Mail</p>
                            <p className="break-all">{data.personalInfo.email}</p>
                        </div>
                        <div className="group">
                            <p className="opacity-50 text-[9px] uppercase mb-0.5">Phone</p>
                            <p>{data.personalInfo.phone}</p>
                        </div>
                        <div className="group">
                            <p className="opacity-50 text-[9px] uppercase mb-0.5">Location</p>
                            <p>{data.personalInfo.location}</p>
                        </div>
                    </div>
                </div>

                {/* Skills - Bold Tags */}
                {data.skills.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">
                            {config.sections.skills.title || 'Skills'}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill) => (
                                <div
                                    key={skill.id}
                                    className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-[10px] border border-white/20"
                                >
                                    {skill.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-60">
                            {config.sections.languages.title || 'Languages'}
                        </h2>
                        <div className="space-y-3 font-medium">
                            {data.languages.map(lang => (
                                <div key={lang.id} className="text-xs flex justify-between">
                                    <span>{lang.language}</span>
                                    <span className="opacity-60">{lang.fluency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Social links at bottom */}
                <div className="mt-auto pt-10">
                    <div className="flex flex-col gap-2 text-[10px] opacity-70 italic">
                        {data.personalInfo.linkedin && <p>In/ {data.personalInfo.linkedin.split('/').pop()}</p>}
                        {data.personalInfo.github && <p>Git/ {data.personalInfo.github.split('/').pop()}</p>}
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT - 65% */}
            <main className="flex-1 p-14 flex flex-col bg-white">
                {/* Header Section */}
                <div className="mb-16">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-0.5 w-12" style={{ backgroundColor: secondaryColor }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: secondaryColor }}>Portfolio</span>
                    </div>
                    <h1
                        className="text-6xl font-black leading-none uppercase tracking-tighter mb-6"
                        style={{ color: '#1a1a1a', fontFamily: "'Playfair Display', serif" }}
                    >
                        {data.personalInfo.fullName.split(' ').map((name, i) => (
                            <span key={i} className="block">
                                {i === 1 ? <span style={{ color: primaryColor }}>{name}</span> : name}
                            </span>
                        ))}
                    </h1>
                    {data.personalInfo.summary && (
                        <p className="text-sm text-gray-500 leading-relaxed font-medium border-l-4 pl-6" style={{ borderColor: `${primaryColor}30` }}>
                            {data.personalInfo.summary}
                        </p>
                    )}
                </div>

                {/* Experience Block */}
                {data.experience.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] bg-black text-white px-3 py-1">Experience</h2>
                        </div>
                        <div className="space-y-10">
                            {data.experience.map((exp) => (
                                <div key={exp.id} className="relative pl-8 border-l-2 italic" style={{ borderColor: `${primaryColor}30` }}>
                                    <div
                                        className="absolute left-[-6px] top-1.5 w-3 h-3 rounded-full border-2 border-white"
                                        style={{ backgroundColor: primaryColor }}
                                    />
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className="text-xl font-black not-italic">{exp.position}</h3>
                                        <span className="text-[10px] font-bold not-italic text-gray-400">
                                            {exp.startDate} - {exp.current ? 'Now' : exp.endDate}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold not-italic mb-3 opacity-60 uppercase tracking-widest">{exp.company}</p>
                                    <p className="text-sm not-italic text-gray-600 leading-relaxed">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects/Education Grid */}
                <div className="grid grid-cols-2 gap-8 mt-auto">
                    {/* Education */}
                    {data.education.length > 0 && (
                        <section>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] mb-6">Education</h2>
                            <div className="space-y-4">
                                {data.education.map(edu => (
                                    <div key={edu.id}>
                                        <p className="text-xs font-black">{edu.degree}</p>
                                        <p className="text-[10px] text-gray-500">{edu.institution}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                    {/* Projects */}
                    {data.projects && data.projects.length > 0 && (
                        <section>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] mb-6">Projects</h2>
                            <div className="space-y-4">
                                {data.projects.slice(0, 2).map(proj => (
                                    <div key={proj.id}>
                                        <p className="text-xs font-black">{proj.name}</p>
                                        <p className="text-[10px] text-gray-500 line-clamp-2">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Page Number Decoration */}
            <div className="absolute bottom-10 right-10 text-[60px] font-black text-gray-50 select-none -z-0">
                01
            </div>
        </div>
    );
}
