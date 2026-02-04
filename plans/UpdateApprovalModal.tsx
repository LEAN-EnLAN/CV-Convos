import React from 'react';
import { ResumeData } from '../types';

interface UpdateApprovalModalProps {
  pendingData: Partial<ResumeData>;
  onAccept: () => void;
  onDeny: () => void;
}

export const UpdateApprovalModal: React.FC<UpdateApprovalModalProps> = ({ pendingData, onAccept, onDeny }) => {
  const changes = [];
  if (pendingData.personalInfo && Object.keys(pendingData.personalInfo).length > 0) changes.push("Identity");
  if (pendingData.summary) changes.push("Narrative");
  if (pendingData.experience && pendingData.experience.length > 0) changes.push("Milestones");
  if (pendingData.education && pendingData.education.length > 0) changes.push("Academia");
  if (pendingData.skills) changes.push("Skills");

  return (
    <div className="fixed bottom-12 right-12 z-[200] animate-fade-in w-full max-w-sm">
      <div className="bg-white rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden">
        
        {/* Dynamic Accent Line */}
        <div className="h-1.5 w-full bg-emerald-600"></div>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z"/></svg>
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Optimization Available</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mentor is proposing revisions</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-10">
            {changes.map((c, i) => (
              <span key={i} className="px-3.5 py-1.5 bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-600 rounded-lg border border-slate-100">
                {c}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onDeny}
              className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all border border-transparent"
            >
              Ignorar
            </button>
            <button 
              onClick={onAccept}
              className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-200 active:scale-95"
            >
              Aplicar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};