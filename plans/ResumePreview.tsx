import React from 'react';
import { ResumeData, TemplateConfig, TemplateId } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
  config: TemplateConfig;
  isUpdating?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, config, isUpdating }) => {
  const { templateId, colors, fonts } = config;
  const hasContent = data.personalInfo.fullName || data.experience.length > 0 || data.summary;

  const getTemplateStyles = (id: TemplateId) => {
    switch (id) {
      case 'harvard': return { paperClass: "font-classic", headerClass: "text-center border-b-2 border-slate-900 pb-8 mb-12", nameClass: "text-4xl font-bold tracking-tight", sectionHeader: "text-xs font-bold uppercase tracking-widest border-b border-slate-200 mb-6 pb-2" };
      case 'creative': return { paperClass: "font-modern", headerClass: "flex justify-between items-end mb-16", nameClass: "text-7xl font-black tracking-tighter leading-none", sectionHeader: "text-lg font-black uppercase text-accent mb-8" };
      case 'terminal': return { paperClass: "font-mono bg-slate-950 text-emerald-500 p-12", headerClass: "mb-12 border-b border-emerald-900 pb-8", nameClass: "text-3xl font-bold", sectionHeader: "text-sm font-bold text-emerald-400 mb-6" };
      case 'pure': return { paperClass: "font-modern bg-white p-24", headerClass: "mb-20", nameClass: "text-5xl font-light tracking-tight text-slate-900", sectionHeader: "text-[10px] font-black uppercase tracking-[0.5em] text-slate-200 mb-12" };
      case 'care': return { paperClass: "font-modern rounded-3xl", headerClass: "bg-emerald-50 -mx-[25mm] -mt-[35mm] px-[25mm] py-20 mb-12", nameClass: "text-4xl font-bold text-emerald-900", sectionHeader: "text-sm font-bold text-emerald-600 mb-4 bg-emerald-50 inline-block px-3 py-1 rounded-full" };
      default: return { paperClass: "font-serif", headerClass: "mb-16", nameClass: "text-6xl font-black tracking-tighter uppercase", sectionHeader: "text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 border-b border-slate-50 pb-2" };
    }
  };

  const styles = getTemplateStyles(templateId);

  if (!hasContent) {
    return (
      <div 
        className="bg-white shadow-2xl flex items-center justify-center text-slate-200 border border-slate-100 rounded-sm"
        style={{ width: '210mm', height: '297mm' }}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-1 bg-slate-100 mx-auto"></div>
          <p className="text-4xl font-serif italic">The Portfolio</p>
          <p className="text-[9px] font-sans font-black uppercase tracking-[0.5em]">Studio Architect</p>
        </div>
      </div>
    );
  }

  const primaryStyle = { color: colors.primary };
  const accentStyle = { color: colors.accent };
  const accentBgStyle = { backgroundColor: colors.accent };

  return (
    <div 
      className={`${styles.paperClass} bg-white shadow-[0_60px_120px_-20px_rgba(0,0,0,0.2)] relative flex-shrink-0 transition-all duration-1000 rounded-sm border border-slate-100 overflow-hidden ${isUpdating ? 'scale-[1.02] ring-8 ring-emerald-500/10' : ''}`}
      style={{ 
        width: '210mm', 
        minHeight: '297mm',
        padding: templateId === 'pure' ? '0' : '35mm 25mm',
        backgroundColor: templateId === 'terminal' ? '#020617' : '#ffffff'
      }}
    >
      <div className="relative flex flex-col h-full animate-fade-in">
        
        {/* HEADER */}
        <header className={styles.headerClass}>
          <div>
            <h1 className={styles.nameClass} style={primaryStyle}>
              {data.personalInfo.fullName || "Su Nombre"}
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest mt-2 opacity-60">
              {data.personalInfo.role || "Especialidad"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[10px] font-sans font-black uppercase tracking-[0.2em] text-slate-400 mt-6">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          </div>
        </header>

        {/* SUMMARY */}
        {data.summary && (
          <section className="mb-14">
            <h2 className={styles.sectionHeader}>Perfil</h2>
            <p className={`leading-relaxed italic opacity-90 ${templateId === 'pure' ? 'text-2xl font-light' : 'text-xl'}`}>
              "{data.summary}"
            </p>
          </section>
        )}

        {/* EXPERIENCE */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-14">
            <h2 className={styles.sectionHeader}>Trayectoria</h2>
            <div className="space-y-12">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-3">
                    <h3 className="font-bold text-2xl tracking-tight" style={primaryStyle}>{exp.role}</h3>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      {exp.startDate} — {exp.endDate || 'Actual'}
                    </span>
                  </div>
                  <div className="font-bold text-[10px] uppercase tracking-widest mb-4" style={accentStyle}>{exp.company}</div>
                  <ul className="space-y-4">
                    {exp.highlights && exp.highlights.map((point, pIdx) => (
                      <li key={pIdx} className="relative pl-8 text-[16px] leading-relaxed opacity-80">
                        <span className="absolute left-0 top-3 w-4 h-[1px]" style={accentBgStyle}></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION & FOOTER */}
        <div className="mt-auto pt-12 border-t border-slate-50 flex justify-between items-end">
          <div className="space-y-8">
            {data.education && data.education.length > 0 && (
              <section>
                <h2 className={styles.sectionHeader}>Academia</h2>
                {data.education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="font-bold text-lg">{edu.institution}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{edu.degree}</div>
                  </div>
                ))}
              </section>
            )}
          </div>

          <div className="text-right opacity-20">
            <p className="text-[9px] font-black uppercase tracking-[0.5em]">Studio Certified</p>
          </div>
        </div>

      </div>
    </div>
  );
};