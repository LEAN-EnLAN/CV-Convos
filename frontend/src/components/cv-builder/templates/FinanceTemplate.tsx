import React from 'react';
import { CVData } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { Building2, TrendingUp, Award, Briefcase, GraduationCap, Globe, Mail, Phone, MapPin, BookOpen } from 'lucide-react';

interface TemplateProps {
    data: CVData;
}

export function FinanceTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const primaryColor = config.colors.primary;
    const secondaryColor = config.colors.secondary;
    const accentColor = config.colors.accent;

    return (
        <div
            className="w-[794px] h-[1122px] max-h-[1122px] overflow-hidden bg-white flex flex-col print:shadow-none mx-auto"
            style={{
                fontFamily: config.fonts.body,
                color: secondaryColor,
                padding: '2.54cm'
            }}
        >
            {/* Header with navy blue accent */}
            <header className="flex items-start mb-8 pb-6 border-b-2" style={{ borderColor: primaryColor }}>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: config.fonts.heading }}>
                                {data.personalInfo.fullName || 'Tu Nombre'}
                            </h1>
                            {data.personalInfo.role && (
                                <p className="text-sm font-medium" style={{ color: primaryColor }}>
                                    {data.personalInfo.role}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right text-xs space-y-1">
                    {data.personalInfo.email && (
                        <div className="flex items-center justify-end gap-1">
                            <span>{data.personalInfo.email}</span>
                            <Mail className="w-3 h-3" style={{ color: primaryColor }} />
                        </div>
                    )}
                    {data.personalInfo.phone && (
                        <div className="flex items-center justify-end gap-1">
                            <span>{data.personalInfo.phone}</span>
                            <Phone className="w-3 h-3" style={{ color: primaryColor }} />
                        </div>
                    )}
                    {data.personalInfo.location && (
                        <div className="flex items-center justify-end gap-1">
                            <span>{data.personalInfo.location}</span>
                            <MapPin className="w-3 h-3" style={{ color: primaryColor }} />
                        </div>
                    )}
                </div>
            </header>

            {/* Professional Summary */}
            {data.personalInfo.summary && (
                <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b" style={{ borderColor: `${primaryColor}30`, color: primaryColor, fontFamily: config.fonts.heading }}>
                        Perfil Profesional
                    </h2>
                    <p className="text-sm leading-relaxed text-justify">
                        {data.personalInfo.summary}
                    </p>
                </section>
            )}

            <div className="flex gap-8">
                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    {/* Academic/Professional Experience */}
                    {data.experience.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 pb-1 border-b" style={{ borderColor: `${primaryColor}30`, color: primaryColor, fontFamily: config.fonts.heading }}>
                                Experiencia Académica/Profesional
                            </h2>
                            <div className="space-y-6">
                                {data.experience.map((exp) => (
                                    <div key={exp.id} className="break-inside-avoid">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-sm">{exp.position}</h3>
                                            <span className="text-xs font-mono">
                                                {exp.startDate} – {exp.current ? 'Presente' : exp.endDate}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-sm font-semibold">{exp.company}</span>
                                            {exp.location && <span className="text-xs text-gray-500">{exp.location}</span>}
                                        </div>
                                        {exp.description && (
                                            <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education - Prominent */}
                    {data.education.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor, fontFamily: config.fonts.heading }}>
                                <GraduationCap className="w-4 h-4" />
                                Formación
                            </h2>
                            <div className="space-y-4">
                                {data.education.map((edu) => (
                                    <div key={edu.id} className="break-inside-avoid">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-semibold text-sm">{edu.institution}</h3>
                                            <span className="text-xs font-mono">
                                                {edu.startDate} – {edu.endDate || 'Presente'}
                                            </span>
                                        </div>
                                        <p className="text-sm">
                                            {edu.degree}{edu.fieldOfStudy && ` en ${edu.fieldOfStudy}`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {data.projects && data.projects.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 pb-1 border-b" style={{ borderColor: `${primaryColor}30`, color: primaryColor, fontFamily: config.fonts.heading }}>
                                Proyectos y Investigaciones
                            </h2>
                            <div className="space-y-4">
                                {data.projects.map((proj) => (
                                    <div key={proj.id} className="break-inside-avoid">
                                        <h3 className="font-semibold text-sm">{proj.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{proj.description}</p>
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {proj.technologies.join(' • ')}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="w-52 space-y-8">
                    {/* Skills & Areas of Expertise */}
                    {data.skills.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor, fontFamily: config.fonts.heading }}>
                                <BookOpen className="w-4 h-4" />
                                Áreas de Expertise
                            </h2>
                            <div className="space-y-2">
                                {data.skills.map((skill) => (
                                    <div key={skill.id} className="text-xs">
                                        <div className="flex justify-between mb-1">
                                            <span>{skill.name}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
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

                    {/* Certifications */}
                    {data.certifications && data.certifications.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor, fontFamily: config.fonts.heading }}>
                                <Award className="w-4 h-4" />
                                Certificaciones
                            </h2>
                            <div className="space-y-2">
                                {data.certifications.map((cert) => (
                                    <div key={cert.id} className="text-xs break-inside-avoid">
                                        <p className="font-medium">{cert.name}</p>
                                        <p className="text-gray-500">{cert.issuer} • {cert.date}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages */}
                    {data.languages && data.languages.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor, fontFamily: config.fonts.heading }}>
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
