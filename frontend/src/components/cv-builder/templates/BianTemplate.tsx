import React from 'react';
import { CVData } from '@/types/cv';
import { Phone, Mail, MapPin, Linkedin, Github, Globe } from 'lucide-react';

interface TemplateProps {
    data: CVData;
}

export const BianTemplate: React.FC<TemplateProps> = ({ data }) => {
    const { personalInfo, experience, education, skills, languages, certifications, projects, config } = data;

    // Helper to format dates
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        // If it's just a year "2024", return it. If it's "2024-01", return "2024".
        return dateString.replace(/(\d{4})-\d{2}.*/, '$1');
    };

    return (
        <div
            className="w-full h-full bg-white text-slate-800 p-8 sm:p-12 font-sans"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row justify-between items-start mb-12 gap-6">
                <div className="flex-1 space-y-1">
                    <h1 className="text-4xl sm:text-5xl font-black uppercase text-slate-900 tracking-tight">
                        {personalInfo.fullName}
                    </h1>
                    <p className="text-xl text-slate-500 font-medium">
                        {personalInfo.role}
                    </p>
                </div>

                <div className="flex flex-col gap-2 text-sm text-slate-600 sm:text-right min-w-[200px]">
                    {personalInfo.phone && (
                        <div className="flex items-center sm:justify-end gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{personalInfo.phone}</span>
                        </div>
                    )}
                    {personalInfo.email && (
                        <div className="flex items-center sm:justify-end gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span>{personalInfo.email}</span>
                        </div>
                    )}
                    {personalInfo.location && (
                        <div className="flex items-center sm:justify-end gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{personalInfo.location}</span>
                        </div>
                    )}
                    {personalInfo.linkedin && (
                        <div className="flex items-center sm:justify-end gap-2">
                            <Linkedin className="w-4 h-4 text-slate-400" />
                            <a href={personalInfo.linkedin} className="hover:text-black">LinkedIn</a>
                        </div>
                    )}
                </div>
            </header>

            <div className="space-y-10">

                {/* Experiencia Laboral */}
                {experience.length > 0 && (
                    <section>
                        <div className="bg-slate-100 py-2 px-4 mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                                Experiencia Laboral
                            </h2>
                        </div>
                        <div className="space-y-8">
                            {experience.map((exp) => (
                                <div key={exp.id} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 sm:gap-8">
                                    <div className="text-sm text-slate-500 font-medium leading-relaxed">
                                        <p className="mb-0.5">"{exp.company}"</p>
                                        <p>{exp.startDate} - {exp.current ? 'Presente' : exp.endDate}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-900 text-base">
                                            {exp.position}
                                        </h3>
                                        {exp.description && (
                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Estudios */}
                {education.length > 0 && (
                    <section>
                        <div className="bg-slate-100 py-2 px-4 mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                                Estudio
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {education.map((edu) => (
                                <div key={edu.id} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 sm:gap-8 items-start">
                                    <div className="text-sm text-slate-500 font-medium pt-1">
                                        <p>{edu.degree}</p>
                                        <p>Año {edu.endDate || edu.startDate}</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        {/* Simple Circle placeholder for logo interaction if visualized */}
                                        <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs shrink-0 mt-1">
                                            {edu.institution.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base">
                                                {edu.institution}
                                            </h3>
                                            <p className="text-sm text-slate-700 font-medium">
                                                {edu.fieldOfStudy}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills / Sistemas (Special Layout) */}
                {(skills.length > 0 || projects.length > 0) && (
                    <section className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 sm:gap-8 pt-4">
                        {/* Left Title Box Style */}
                        <div>
                            <div className="bg-slate-200 py-2 px-4 inline-block w-full text-center sm:text-left">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                                    Sistemas
                                </h2>
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="space-y-6">
                            {/* Skills List */}
                            {skills.length > 0 && (
                                <div className="space-y-1">
                                    {skills.map((skill) => (
                                        <div key={skill.id} className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-700">{skill.name}</p>
                                            {skill.proficiency && (
                                                <span className="text-xs text-slate-400 font-medium">
                                                    — {skill.level || `${skill.proficiency}%`}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Projects treated as 'Systems' or Portfolio items if skills are empty or mixed */}
                            {projects.length > 0 && (
                                <div className="space-y-4 mt-4">
                                    {projects.map((proj) => (
                                        <div key={proj.id}>
                                            <p className="text-sm font-bold text-slate-900">{proj.name}</p>
                                            <p className="text-xs text-slate-500">{proj.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Idiomas / Languages */}
                {languages.length > 0 && (
                    <section className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 sm:gap-8 pt-4">
                        <div>
                            <div className="bg-slate-200 py-2 px-4 inline-block w-full text-center sm:text-left">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                                    {config?.sections.languages.title || 'Idiomas'}
                                </h2>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            {languages.map((lang) => (
                                <p key={lang.id} className="text-sm font-bold text-slate-700">
                                    {lang.language} <span className="text-slate-400 font-normal">- {lang.fluency}</span>
                                </p>
                            ))}
                        </div>
                    </section>
                )}

                {/* Herramientas / Tools */}
                {data.tools && data.tools.length > 0 && config?.sections?.tools?.visible && (
                    <section className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 sm:gap-8 pt-4">
                        <div>
                            <div className="bg-slate-200 py-2 px-4 inline-block w-full text-center sm:text-left">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                                    {config?.sections?.tools?.title || 'Herramientas'}
                                </h2>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {data.tools.map((tool, i) => (
                                <p key={i} className="text-sm font-bold text-slate-700 italic">
                                    {tool}
                                </p>
                            ))}
                        </div>
                    </section>
                )}

                {/* Intereses / Interests */}
                {data.interests && data.interests.length > 0 && config?.sections?.interests?.visible && (
                    <section className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 sm:gap-8 pt-4">
                        <div>
                            <div className="bg-slate-200 py-2 px-4 inline-block w-full text-center sm:text-left">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                                    {config?.sections?.interests?.title || 'Intereses'}
                                </h2>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {data.interests.map((interest) => (
                                <p key={interest.id} className="text-sm font-medium text-slate-600">
                                    • {interest.name}
                                </p>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};
