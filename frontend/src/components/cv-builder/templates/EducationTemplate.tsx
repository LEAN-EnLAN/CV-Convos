import React from 'react';
import { CVData } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { BookOpen, GraduationCap, Award, Users, Clock, MapPin, Mail, Phone, Calendar, Globe } from 'lucide-react';

interface TemplateProps {
    data: CVData;
}

export function EducationTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const primaryColor = config.colors.primary;
    const secondaryColor = config.colors.secondary;
    const accentColor = config.colors.accent;

    return (
        <div
            className="w-[794px] h-[1122px] max-h-[1122px] overflow-hidden bg-white flex flex-col print:shadow-none"
            style={{
                fontFamily: "'Inter', 'Georgia', serif",
                color: secondaryColor,
                padding: '2.54cm'
            }}
        >
            {/* Header with book/academic theme */}
            <header className="flex items-center gap-6 mb-8 pb-6 border-b-2" style={{ borderColor: primaryColor }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: primaryColor }}>
                    <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {data.personalInfo.fullName || 'Tu Nombre'}
                    </h1>
                    {data.personalInfo.role && (
                        <p className="text-sm font-medium mt-1" style={{ color: primaryColor }}>
                            {data.personalInfo.role}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                        {data.personalInfo.email && (
                            <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span>{data.personalInfo.email}</span>
                            </div>
                        )}
                        {data.personalInfo.phone && (
                            <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{data.personalInfo.phone}</span>
                            </div>
                        )}
                        {data.personalInfo.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{data.personalInfo.location}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Professional Summary - Academic Focus */}
            {data.personalInfo.summary && (
                <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b" style={{ borderColor: `${primaryColor}30`, color: primaryColor }}>
                        Perfil Académico
                    </h2>
                    <p className="text-sm leading-relaxed text-justify">
                        {data.personalInfo.summary}
                    </p>
                </section>
            )}

            {/* Three column layout for education-focused */}
            <div className="flex gap-6">
                {/* Main Content - Experience */}
                <div className="flex-1 space-y-8">
                    {/* Academic/Professional Experience */}
                    {data.experience.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 pb-1 border-b" style={{ borderColor: `${primaryColor}30`, color: primaryColor }}>
                                Experiencia Académica/Profesional
                            </h2>
                            <div className="space-y-6">
                                {data.experience.map((exp) => (
                                    <div key={exp.id} className="break-inside-avoid">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-sm">{exp.position}</h3>
                                                <p className="text-sm font-semibold">{exp.company}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono text-gray-500 block">
                                                    {exp.startDate} – {exp.current ? 'Actual' : exp.endDate}
                                                </span>
                                                {exp.location && (
                                                    <span className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {exp.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {exp.description && (
                                            <p className="text-sm text-gray-600 leading-relaxed mt-2">{exp.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {data.projects && data.projects.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 pb-1 border-b" style={{ borderColor: `${primaryColor}30`, color: primaryColor }}>
                                Proyectos y Investigaciones
                            </h2>
                            <div className="space-y-4">
                                {data.projects.map((proj) => (
                                    <div key={proj.id} className="break-inside-avoid p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}08` }}>
                                        <h3 className="font-semibold text-sm">{proj.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{proj.description}</p>
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {proj.technologies.map((tech, idx) => (
                                                    <span key={idx} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
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

                {/* Right Sidebar - Education & Credentials */}
                <aside className="w-60 space-y-8">
                    {/* Education - Prominent */}
                    {data.education.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor }}>
                                <GraduationCap className="w-4 h-4" />
                                Formación
                            </h2>
                            <div className="space-y-4">
                                {data.education.map((edu) => (
                                    <div key={edu.id} className="break-inside-avoid">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                                                <GraduationCap className="w-5 h-5" style={{ color: primaryColor }} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-xs leading-tight">{edu.institution}</h3>
                                                <p className="text-xs text-gray-600 mt-0.5">{edu.degree}</p>
                                                {edu.fieldOfStudy && (
                                                    <p className="text-xs text-gray-500">{edu.fieldOfStudy}</p>
                                                )}
                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {edu.startDate} – {edu.endDate || 'Actual'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills & Areas of Expertise */}
                    {data.skills.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor }}>
                                <BookOpen className="w-4 h-4" />
                                Áreas de Expertise
                            </h2>
                            <div className="space-y-2">
                                {data.skills.map((skill) => (
                                    <div key={skill.id} className="text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                                            <span>{skill.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {data.certifications && data.certifications.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor }}>
                                <Award className="w-4 h-4" />
                                Certificaciones
                            </h2>
                            <div className="space-y-3">
                                {data.certifications.map((cert) => (
                                    <div key={cert.id} className="break-inside-avoid">
                                        <p className="text-xs font-medium">{cert.name}</p>
                                        <p className="text-xs text-gray-500">{cert.issuer}</p>
                                        <p className="text-[10px] text-gray-400">{cert.date}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages */}
                    {data.languages && data.languages.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor }}>
                                <Globe className="w-4 h-4" />
                                Idiomas
                            </h2>
                            <div className="space-y-2">
                                {data.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between text-xs">
                                        <span>{lang.language}</span>
                                        <span className="text-gray-500">{lang.fluency}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>
            </div>

            {/* Footer */}
            <footer className="mt-auto pt-6 border-t" style={{ borderColor: `${primaryColor}20` }}>
                <p className="text-[10px] text-center text-gray-400">
                    Generado por CV-ConVos
                </p>
            </footer>
        </div>
    );
}
