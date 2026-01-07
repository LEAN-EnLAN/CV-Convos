import React from 'react';
import { CVData } from '@/types/cv';
import { Terminal, Globe, Github, Linkedin, Mail, MapPin, ExternalLink, Calendar } from 'lucide-react';

interface TemplateProps {
    data: CVData;
}

/**
 * TechTemplate - Diseño optimizado para perfiles tecnológicos y developers
 * 
 * Basado en estéticas de SaaS modernos (Linear, GitHub, Vercel)
 * - Tipografía: Inter (Body) + JetBrains Mono / Space Mono (Details)
 * - Estética: Layout de rejilla, bordes sutiles, estética "Clean & Minimal"
 * - Elementos: Badges tipo chip para skills, iconos Lucide
 */
export function TechTemplate({ data }: TemplateProps) {
    const config = data.config!;
    const primaryColor = config.colors.primary;

    return (
        <div
            className="w-[794px] min-h-[1122px] bg-[#fcfcfc] flex flex-col print:shadow-none p-12"
            style={{ fontFamily: "'Inter', sans-serif", color: '#111827' }}
        >
            {/* Header: GitHub-like Profile Section */}
            <header className="flex justify-between items-start mb-12 pb-10 border-b border-gray-200">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-gray-100 text-[10px] font-mono mb-4 text-gray-500 border border-gray-200">
                        <Terminal className="w-3 h-3" />
                        <span>developer_profile_v2.0</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                        {data.personalInfo.fullName}
                    </h1>
                    <p className="text-lg font-medium text-gray-600 max-w-2xl leading-relaxed">
                        {data.personalInfo.summary}
                    </p>
                </div>

                {/* Contact Grid */}
                <div className="w-64 grid grid-cols-1 gap-3 text-[11px] font-medium font-mono bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    {data.personalInfo.email && (
                        <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{data.personalInfo.email}</span>
                        </div>
                    )}
                    {data.personalInfo.phone && (
                        <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            <span>{data.personalInfo.phone}</span>
                        </div>
                    )}
                    {data.personalInfo.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{data.personalInfo.location}</span>
                        </div>
                    )}
                    <div className="h-px bg-gray-100 my-1" />
                    <div className="flex gap-4">
                        {data.personalInfo.github && <Github className="w-4 h-4 text-black" />}
                        {data.personalInfo.linkedin && <Linkedin className="w-4 h-4 text-blue-600" />}
                    </div>
                </div>
            </header>

            <div className="flex gap-12 flex-1">
                {/* RIGHT COLUMN: Experience & Projects */}
                <div className="flex-1 space-y-12">
                    {/* Experience Section */}
                    {data.experience.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-gray-400 flex items-center gap-3">
                                <span className="w-8 h-px bg-gray-200" /> Professional Experience
                            </h2>
                            <div className="space-y-10">
                                {data.experience.map((exp) => (
                                    <div key={exp.id} className="relative group">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-md transition-all">
                                                <Terminal className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-lg">{exp.position}</h3>
                                                    <span className="text-[10px] font-mono bg-gray-900 text-white px-2 py-0.5 rounded">
                                                        {exp.startDate} - {exp.current ? 'PRESENT' : exp.endDate}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                                    {exp.company} <span className="text-[10px] opacity-40">•</span> {exp.location}
                                                </p>
                                                <p className="text-sm leading-relaxed text-gray-600 border-l-2 border-gray-100 pl-4 py-1">
                                                    {exp.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects Section - Grid layout */}
                    {data.projects && data.projects.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 text-gray-400 flex items-center gap-3">
                                <span className="w-8 h-px bg-gray-200" /> Key Projects
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {data.projects.map((proj) => (
                                    <div key={proj.id} className="p-5 rounded-xl border border-gray-200 bg-white hover:border-gray-900 transition-colors group">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-sm group-hover:translate-x-1 transition-transform">{proj.name}</h3>
                                            <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-normal mb-4">
                                            {proj.description}
                                        </p>
                                        {proj.technologies && (
                                            <div className="flex flex-wrap gap-1.5 mt-auto">
                                                {proj.technologies.map((tech, i) => (
                                                    <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">
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
                </div>

                {/* LEFT SIDEBAR: Skills & Education */}
                <div className="w-56 shrink-0 space-y-12">
                    {/* Skills: Matrix View */}
                    {data.skills.length > 0 && (
                        <section>
                            <h3 className="text-[10px] font-black uppercase mb-6 tracking-widest text-gray-400">Stack & Skills</h3>
                            <div className="space-y-4">
                                {data.skills.map(skill => (
                                    <div key={skill.id} className="space-y-1.5">
                                        <div className="flex justify-between text-[11px] font-medium">
                                            <span>{skill.name}</span>
                                            <span className="text-[10px] opacity-40 font-mono">{skill.level}</span>
                                        </div>
                                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
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

                    {/* Education */}
                    {data.education.length > 0 && (
                        <section>
                            <h3 className="text-[10px] font-black uppercase mb-6 tracking-widest text-gray-400">Education</h3>
                            <div className="space-y-6">
                                {data.education.map(edu => (
                                    <div key={edu.id} className="space-y-1">
                                        <p className="text-xs font-bold">{edu.degree}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">{edu.institution}</p>
                                        <p className="text-[9px] font-mono text-gray-400 flex items-center gap-1 mt-1">
                                            <Calendar className="w-3 h-3" /> {edu.startDate} - {edu.endDate}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Meta info footer */}
                    <div className="pt-20">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-[10px] font-mono text-gray-400 leading-relaxed uppercase tracking-tighter">
                                build_hash: {Math.random().toString(36).substring(7)}<br />
                                engine: cv-convos-v1
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
