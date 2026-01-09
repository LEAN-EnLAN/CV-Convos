import React from 'react';
import { CVData } from '@/types/cv';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';
import { Heart, Shield, Award, GraduationCap, Users, Clock, MapPin, Mail, Phone } from 'lucide-react';

interface TemplateProps {
    data: CVData;
}

export function HealthTemplate({ data }: TemplateProps) {
    const config = data.config || DEFAULT_CONFIG;
    const primaryColor = config.colors.primary;
    const secondaryColor = config.colors.secondary;
    const accentColor = config.colors.accent;

    return (
        <div
            className="w-[794px] h-[1122px] max-h-[1122px] overflow-hidden bg-white flex flex-col print:shadow-none"
            style={{
                fontFamily: config.fonts.body,
                color: secondaryColor,
                padding: '2.54cm'
            }}
        >
            {/* Header with soft teal/blue accent */}
            <header className="mb-8 pb-6 border-b-2" style={{ borderColor: primaryColor }}>
                <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                        <Heart className="w-8 h-8" style={{ color: primaryColor }} />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ fontFamily: config.fonts.heading }}>
                            {data.personalInfo.fullName || 'Tu Nombre'}
                        </h1>
                        {data.personalInfo.role && (
                            <p className="text-sm font-medium" style={{ color: primaryColor }}>
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
                </div>
            </header>

            {/* Professional Summary */}
            {data.personalInfo.summary && (
                <section className="mb-8 p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}08` }}>
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: primaryColor, fontFamily: config.fonts.heading }}>
                        <Heart className="w-4 h-4" />
                        Perfil Profesional
                    </h2>
                    <p className="text-sm leading-relaxed text-justify">
                        {data.personalInfo.summary}
                    </p>
                </section>
            )}

            {/* Two column layout */}
            <div className="flex gap-8">
                {/* Left Column - Experience & Education */}
                <div className="flex-1 space-y-8">
                    {/* Experience */}
                    {data.experience.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor, fontFamily: config.fonts.heading }}>
                                <Shield className="w-4 h-4" />
                                Experiencia Clínica
                            </h2>
                            <div className="space-y-6">
                                {data.experience.map((exp) => (
                                    <div key={exp.id} className="break-inside-avoid">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-sm">{exp.position}</h3>
                                            <span className="text-xs font-mono text-gray-500">
                                                {exp.startDate} – {exp.current ? 'Actual' : exp.endDate}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-sm font-semibold">{exp.company}</span>
                                            {exp.location && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {exp.location}
                                                </span>
                                            )}
                                        </div>
                                        {exp.description && (
                                            <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {data.education.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor, fontFamily: config.fonts.heading }}>
                                <GraduationCap className="w-4 h-4" />
                                Formación Académica
                            </h2>
                            <div className="space-y-4">
                                {data.education.map((edu) => (
                                    <div key={edu.id} className="break-inside-avoid flex gap-4">
                                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: primaryColor }} />
                                        <div>
                                            <h3 className="font-semibold text-sm">{edu.institution}</h3>
                                            <p className="text-sm text-gray-600">
                                                {edu.degree}{edu.fieldOfStudy && ` en ${edu.fieldOfStudy}`}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {edu.startDate} – {edu.endDate || 'Actual'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {data.projects && data.projects.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor, fontFamily: config.fonts.heading }}>
                                <Users className="w-4 h-4" />
                                Proyectos de Salud
                            </h2>
                            <div className="space-y-4">
                                {data.projects.map((proj) => (
                                    <div key={proj.id} className="break-inside-avoid p-3 rounded border border-gray-100">
                                        <h3 className="font-semibold text-sm">{proj.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{proj.description}</p>
                                        {proj.technologies && proj.technologies.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                <span className="font-medium">Áreas:</span> {proj.technologies.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column - Skills & Certifications */}
                <aside className="w-56 space-y-8">
                    {/* Core Competencies */}
                    {data.skills.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor, fontFamily: config.fonts.heading }}>
                                <Award className="w-4 h-4" />
                                Competencias
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map((skill) => (
                                    <span
                                        key={skill.id}
                                        className="text-xs px-3 py-1.5 rounded-full"
                                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {data.certifications && data.certifications.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor, fontFamily: config.fonts.heading }}>
                                <Shield className="w-4 h-4" />
                                Certificaciones
                            </h2>
                            <div className="space-y-3">
                                {data.certifications.map((cert) => (
                                    <div key={cert.id} className="break-inside-avoid p-2 rounded border-l-2" style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}05` }}>
                                        <p className="text-xs font-medium">{cert.name}</p>
                                        <p className="text-xs text-gray-500">{cert.issuer}</p>
                                        <p className="text-xs text-gray-400">{cert.date}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages */}
                    {data.languages && data.languages.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: primaryColor, fontFamily: config.fonts.heading }}>
                                <Users className="w-4 h-4" />
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
