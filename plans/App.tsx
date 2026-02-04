import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from './services/geminiService';
import { Message, ResumeData, ChatStatus, TemplateConfig } from './types';
import { ResumePreview } from './components/ResumePreview';
import { UpdateApprovalModal } from './components/UpdateApprovalModal';

const StudioIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>;
const SendIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>;
const ZoomInIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>;
const ZoomOutIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>;
const ResetZoomIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;

const INITIAL_RESUME: ResumeData = {
  personalInfo: { fullName: '', role: '', email: '', phone: '', location: '', linkedin: '', website: '' },
  summary: '',
  experience: [],
  education: [],
  skills: { hard: [], soft: [] },
  languages: []
};

const INITIAL_CONFIG: TemplateConfig = {
  templateId: 'professional',
  colors: { primary: '#0f172a', accent: '#10b981', background: '#ffffff' },
  fonts: { heading: 'Playfair Display', body: 'Montserrat' },
  layout: { density: 'standard' }
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME);
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>(INITIAL_CONFIG);
  const [pendingResumeUpdate, setPendingResumeUpdate] = useState<Partial<ResumeData> | null>(null);
  const [isResumeUpdating, setIsResumeUpdating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [zoom, setZoom] = useState(0.75);
  const [hasStarted, setHasStarted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (!hasStarted) {
      const initMsg = "¡Bienvenido a su Studio Personal de Carrera! Construiremos una narrativa profesional impecable. ¿Hacia qué cima corporativa apuntamos hoy?";
      setMessages([{ id: 'init', role: 'model', text: initMsg }]);
      setHasStarted(true);
    }
  }, [hasStarted]);

  useEffect(() => scrollToBottom(), [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setStatus('thinking');

    try {
      const responseText = await geminiService.sendMessage(
        inputValue, 
        (data) => setPendingResumeUpdate(data),
        (config) => setTemplateConfig(prev => ({ ...prev, ...config }))
      );
      const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMsg]);
      setStatus('idle');
    } catch (error) {
      console.error(error);
      setStatus('idle');
    }
  };

  const applyUpdate = () => {
    if (!pendingResumeUpdate) return;
    setIsResumeUpdating(true);
    setResumeData(prev => ({
      ...prev, ...pendingResumeUpdate,
      personalInfo: { ...prev.personalInfo, ...(pendingResumeUpdate.personalInfo || {}) },
      skills: { ...prev.skills, ...(pendingResumeUpdate.skills || {}) }
    }));
    setPendingResumeUpdate(null);
    setTimeout(() => setIsResumeUpdating(false), 800);
  };

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 1.5));
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-[420px] flex flex-col bg-white border-r border-slate-200 z-50 shadow-2xl relative">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/80 glass sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <StudioIcon />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-widest uppercase text-slate-900">CV Architect <span className="text-emerald-500">2.0</span></h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Sistema Activo
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 scroll-smooth bg-gradient-to-b from-white to-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-in-right`}>
              <div className={`px-6 py-4 rounded-3xl text-[14px] leading-relaxed max-w-[90%] shadow-sm ${
                msg.role === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none font-medium' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none font-serif text-[16px] italic'
              }`}>
                {msg.text}
              </div>
              <span className="mt-2 text-[8px] font-black text-slate-300 uppercase tracking-widest px-2">
                {msg.role === 'user' ? 'Candidato' : 'Estratega'}
              </span>
            </div>
          ))}
          {status === 'thinking' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full w-max animate-pulse">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-[9px] font-black uppercase text-slate-400">Analizando trayectoria...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-8 border-t border-slate-100 bg-white shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.02)]">
          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => setTemplateConfig(prev => ({ ...prev, templateId: 'terminal' }))}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Terminal
            </button>
            <button 
              onClick={() => setTemplateConfig(prev => ({ ...prev, templateId: 'creative' }))}
              className="px-4 py-2 bg-slate-100 hover:bg-emerald-500 hover:text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Creative
            </button>
          </div>

          <div className="relative group">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Refine su narrativa aquí..."
              className="w-full bg-slate-100 rounded-2xl px-6 py-4 pr-14 text-sm focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:outline-none transition-all placeholder-slate-400 font-medium"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || status !== 'idle'}
              className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-10"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* DESK VIEW */}
      <main className="flex-1 relative overflow-hidden bg-[#E2E8F0]">
        
        {/* ZOOM CONTROLS */}
        <div className="fixed top-8 right-8 flex items-center gap-2 z-[60] bg-white/80 glass px-4 py-2 rounded-full shadow-lg border border-slate-200">
          <button onClick={() => adjustZoom(-0.1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors" title="Zoom Out"><ZoomOutIcon /></button>
          <span className="text-[10px] font-black text-slate-500 w-12 text-center uppercase tracking-tighter">{Math.round(zoom * 100)}%</span>
          <button onClick={() => adjustZoom(0.1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors" title="Zoom In"><ZoomInIcon /></button>
          <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
          <button onClick={() => setZoom(0.75)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors" title="Reset Zoom"><ResetZoomIcon /></button>
          <div className="w-[1px] h-4 bg-slate-200 mx-1"></div>
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-100 rounded-full"
          >
            {showPreview ? 'Ocultar' : 'Abrir'}
          </button>
        </div>

        {/* SCROLLABLE DESK AREA */}
        <div className={`h-full w-full overflow-auto scroll-smooth transition-all duration-700 ${showPreview ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div 
            className="flex justify-center p-20 min-h-full"
            style={{ 
              transformOrigin: 'top center',
              width: '100%'
            }}
          >
            <div 
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <ResumePreview data={resumeData} config={templateConfig} isUpdating={isResumeUpdating} />
            </div>
          </div>
        </div>
      </main>

      {pendingResumeUpdate && (
        <UpdateApprovalModal 
          pendingData={pendingResumeUpdate} 
          onAccept={applyUpdate} 
          onDeny={() => setPendingResumeUpdate(null)} 
        />
      )}
    </div>
  );
};

export default App;