import React from 'react';
import { CVData } from '@/types/cv';
import { Terminal, Github, Linkedin, Mail, MapPin, Globe } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';

/**
 * @component TechTemplate
 * @description Ultra-compact developer CV optimized for one-page printing.
 * 
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🤖 AI AGENT GUARDRAILS - READ BEFORE EDITING                             ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║ 1. STRUCTURE: Two-column flex layout                                     ║
 * ║    - Left: Main content (Experience, Projects, Education)                ║
 * ║    - Right: Sidebar w-44 (Skills, Languages, Certifications, Tools)      ║
 * ║                                                                          ║
 * ║ 2. FONTS: Fira Code (monospace) - developer aesthetic                    ║
 * ║    - Ensure font is loaded in layout.tsx or globals.css                  ║
 * ║                                                                          ║
 * ║ 3. SIZE CONSTRAINTS: Optimized for A4 (1122px height max)                ║
 * ║    - Use tight spacing: text-[9px], text-[10px], gap-1, etc.             ║
 * ║    - Margins: 2.54cm (1 inch) for printing                               ║
 * ║                                                                          ║
 * ║ 4. SECTION PATTERN:                                                      ║
 * ║    {data.arrayName?.length > 0 && config.sections.name?.visible && (     ║
 * ║      <section className="break-inside-avoid">                            ║
 * ║        <h3 className="text-[9px] font-black uppercase">TITLE</h3>        ║
 * ║        <div>{...}</div>                                                  ║
 * ║      </section>                                                          ║
 * ║    )}                                                                    ║
 * ║                                                                          ║
 * ║ 5. CRITICAL RULES:                                                       ║
 * ║    - Lucide icons only: import from 'lucide-react'                       ║
 * ║    - primaryColor for skill bars and accents                             ║
 * ║    - Uses role="list" for accessibility on skill lists                   ║
 * ║                                                                          ║
 * ║ 6. TESTING: Run `npx tsc --noEmit` after edits                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

interface TemplateProps {
    data: CVData;
}

export function TechTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const primaryColor = config.colors.primary;

    return (
        <div
            className="w-[794px] h-[1122px] max-h-[1122px] overflow-hidden bg-white flex flex-col items-stretch print:shadow-none relative"
            style={{
                fontFamily: config.fonts.body,
                color: '#1a1a1a',
                padding: '2.54cm',
                lineHeight: '1.4'
            }}
        >
            {/* --- HEADER --- */}
            <header className="border-b-2 border-gray-900 mb-6 pb-4">
                <div className="flex justify-between items-end mb-2">
                    <h1 className="text-3xl font-bold tracking-tight uppercase text-gray-900" style={{ fontFamily: config.fonts.heading }}>
                        {data.personalInfo.fullName}
                    </h1>
                    {data.personalInfo.role && (
                        <span className="text-sm font-semibold bg-gray-900 text-white px-2 py-0.5 rounded-sm tracking-widest">
                            {data.personalInfo.role.toUpperCase()}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] items-center text-gray-600 font-medium">
                    {data.personalInfo.location && (
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-gray-900" /> {data.personalInfo.location}
                        </span>
                    )}
                    {data.personalInfo.email && (
                        <span className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-gray-900" /> {data.personalInfo.email}
                        </span>
                    )}
                    {data.personalInfo.phone && (
                        <span className="flex items-center gap-1.5">
                            <Globe className="w-3 h-3 text-gray-900" /> {data.personalInfo.phone}
                        </span>
                    )}
                    {data.personalInfo.linkedin && (
                        <span className="flex items-center gap-1.5">
                            <Linkedin className="w-3 h-3 text-gray-900" /> {data.personalInfo.linkedin.replace(/^https?:\/\//, '')}
                        </span>
                    )}
                    {data.personalInfo.github && (
                        <span className="flex items-center gap-1.5">
                            <Github className="w-3 h-3 text-gray-900" /> {data.personalInfo.github.replace(/^https?:\/\//, '')}
                        </span>
                    )}
                </div>
            </header>

            {/* --- SUMMARY --- */}
            {data.personalInfo.summary && config.sections.summary.visible && (
                <section className="mb-6">
                    <p className="text-[10px] text-gray-700 leading-relaxed text-justify">
                        {data.personalInfo.summary}
                    </p>
                </section>
            )}

            {/* --- SKILLS (TOP PRIORITY FOR TECH) --- */}
            {data.skills.length > 0 && config.sections.skills.visible && (
                <section className="mb-6">
                    <h2 className="text-xs font-black uppercase tracking-widest border-b border-gray-200 mb-2.5 pb-1 flex items-center gap-2" style={{ fontFamily: config.fonts.heading }}>
                        <Terminal className="w-3 h-3" /> Technical Skills
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                        {data.skills.map((skill) => (
                            <span
                                key={skill.id}
                                className="px-1.5 py-0.5 border border-gray-300 rounded text-[9px] font-semibold text-gray-800 bg-gray-50"
                            >
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* --- EXPERIENCE --- */}
            {data.experience.length > 0 && config.sections.experience.visible && (
                <section className="mb-6">
                    <h2 className="text-xs font-black uppercase tracking-widest border-b border-gray-200 mb-3 pb-1 flex items-center gap-2" style={{ fontFamily: config.fonts.heading }}>
                        <span className="text-gray-900">Experience</span>
                    </h2>
                    <div className="space-y-4">
                        {data.experience.map((exp) => (
                            <div key={exp.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-bold text-gray-900">{exp.position}</h3>
                                    <span className="text-[10px] font-mono whitespace-nowrap text-gray-500">
                                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[11px] font-semibold text-gray-800">{exp.company}</span>
                                    <span className="text-[9px] italic text-gray-400">{exp.location}</span>
                                </div>
                                <div className="text-[10px] text-gray-600 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-gray-100">
                                    {exp.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* --- PROJECTS --- */}
            {data.projects.length > 0 && config.sections.projects.visible && (
                <section className="mb-6">
                    <h2 className="text-xs font-black uppercase tracking-widest border-b border-gray-200 mb-3 pb-1" style={{ fontFamily: config.fonts.heading }}>
                        Key Projects
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="break-inside-avoid border border-gray-100 p-2.5 rounded hover:border-gray-200 transition-colors bg-white">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-[11px] font-bold text-gray-900">{proj.name}</h3>
                                    {proj.url && <span className="text-[9px] text-blue-600 underline decoration-dotted">{proj.url}</span>}
                                </div>
                                <p className="text-[10px] text-gray-600 leading-snug mb-2">
                                    {proj.description}
                                </p>
                                {proj.technologies && proj.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {proj.technologies.map((tech, i) => (
                                            <span key={i} className="text-[8px] font-mono text-gray-500 bg-gray-50 px-1 rounded">
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

            {/* --- EDUCATION --- */}
            {data.education.length > 0 && config.sections.education.visible && (
                <section className="mb-6">
                    <h2 className="text-xs font-black uppercase tracking-widest border-b border-gray-200 mb-3 pb-1" style={{ fontFamily: config.fonts.heading }}>
                        Education
                    </h2>
                    <div className="space-y-2">
                        {data.education.map((edu) => (
                            <div key={edu.id} className="flex justify-between items-baseline break-inside-avoid">
                                <div>
                                    <h3 className="text-[11px] font-bold text-gray-900">{edu.degree}</h3>
                                    <p className="text-[10px] text-gray-600">{edu.institution}</p>
                                </div>
                                <span className="text-[9px] font-mono text-gray-500">
                                    {edu.endDate}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* --- EXTRAS (Languages, Certs) --- */}
            <div className="grid grid-cols-2 gap-8">
                {data.languages.length > 0 && config.sections.languages.visible && (
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest border-b border-gray-200 mb-2 pb-1" style={{ fontFamily: config.fonts.heading }}>
                            Languages
                        </h2>
                        <div className="space-y-1">
                            {data.languages.map((lang) => (
                                <div key={lang.id} className="flex justify-between text-[10px]">
                                    <span className="font-semibold">{lang.language}</span>
                                    <span className="text-gray-400">{lang.fluency}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {data.certifications && data.certifications.length > 0 && config.sections.certifications.visible && (
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-widest border-b border-gray-200 mb-2 pb-1" style={{ fontFamily: config.fonts.heading }}>
                            Certifications
                        </h2>
                        <div className="space-y-1">
                            {data.certifications.map((cert) => (
                                <div key={cert.id} className="text-[10px]">
                                    <span className="font-bold">{cert.name}</span>
                                    <span className="text-gray-400 ml-1">({cert.date})</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <div className="mt-auto pt-6 text-[8px] text-gray-300 font-mono text-center uppercase tracking-widest">
                Generated with CV-Builder • {new Date().getFullYear()}
            </div>
        </div>
    );
}
