
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, SiteIdentity, Tool, Testimonial, FAQData, Lead } from '../types';
import { 
  Trash2, X, ImageIcon, Edit3, Menu, MessageSquare, HelpCircle,
  Shield, Activity, Zap, Stars, Wrench, Palette, Save, Lock, Smartphone,
  LayoutDashboard, FolderKanban, Quote, Fingerprint, Globe, ChevronRight,
  TrendingUp, Database, Bell, Star, Cloud, CheckCircle2, ShieldCheck, BarChart3, Plus,
  ImagePlus, AlertTriangle, HardDrive, Sparkles, BrainCircuit, Loader2, User, Eye, EyeOff, ExternalLink, FileText, Upload,
  Settings, Layers, CreditCard, Box, Cpu, KeyRound, Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import MediaUploader from './MediaUploader';
import { analyzeMarketingImage } from '../services/geminiService';
import { uploadFile } from '../services/blobService';
import * as OTPAuth from 'otpauth';

interface AdminPanelProps {
  onClose: () => void;
  onProjectsUpdate: (projects: Project[]) => void;
  currentProjects: Project[];
  currentIdentity: SiteIdentity;
  onIdentityUpdate: (identity: SiteIdentity) => void;
  currentTools: Tool[];
  onToolsUpdate: (tools: Tool[]) => void;
  testimonials: Testimonial[];
  onTestimonialsUpdate: (testimonials: Testimonial[]) => void;
  faqs: FAQData[];
  onFaqsUpdate: (faqs: FAQData[]) => void;
  leads: Lead[];
  onLeadsUpdate: (leads: Lead[]) => void;
  adminCreds: any;
  onAdminCredsUpdate: (creds: any) => void;
}

const ANALYTICS_DATA = [
  { name: 'Mon', clicks: 450, conversions: 40 },
  { name: 'Tue', clicks: 890, conversions: 72 },
  { name: 'Wed', clicks: 320, conversions: 28 },
  { name: 'Thu', clicks: 610, conversions: 55 },
  { name: 'Fri', clicks: 750, conversions: 68 },
  { name: 'Sat', clicks: 920, conversions: 85 },
  { name: 'Sun', clicks: 540, conversions: 45 },
];

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onClose, onProjectsUpdate, currentProjects, currentIdentity, onIdentityUpdate,
  currentTools, onToolsUpdate, testimonials, onTestimonialsUpdate, faqs, onFaqsUpdate,
  leads, onLeadsUpdate, adminCreds, onAdminCredsUpdate
}) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'reviews' | 'faq' | 'stack' | 'identity' | 'security' | 'bookings' | 'leads'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [blobToken, setBlobToken] = useState(localStorage.getItem('vercel_blob_token') || '');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [isCvUploading, setIsCvUploading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Form States for Editing
  const [projectForm, setProjectForm] = useState<Partial<Project>>({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] });
  const [reviewForm, setReviewForm] = useState<Partial<Testimonial>>({ name: '', role: '', content: '', metric: '', image: '', imageUrls: [] });
  const [faqForm, setFaqDataForm] = useState<Partial<FAQData>>({ question: '', answer: '' });
  const [toolForm, setToolForm] = useState<Partial<Tool>>({ name: '', subtitle: '', icon: '' });
  const [identityForm, setIdentityForm] = useState<SiteIdentity>(currentIdentity);
  const [securityForm, setSecurityForm] = useState(adminCreds);

  const notify = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (loginUsername.trim().toLowerCase() !== adminCreds.username.toLowerCase() || loginPassword !== adminCreds.password) {
      setLoginError('Invalid credentials.');
      return;
    }
    if (adminCreds.twoFactorEnabled) {
      if (!otpCode) {
        setLoginError('2FA Code required.');
        return;
      }
      try {
        const totp = new OTPAuth.TOTP({ issuer: 'RabbiPortfolio', label: adminCreds.username, algorithm: 'SHA1', digits: 6, period: 30, secret: adminCreds.twoFactorSecret });
        const delta = totp.validate({ token: otpCode, window: 1 });
        if (delta === null) {
          setLoginError('Invalid 2FA code.');
          return;
        }
      } catch (err) {
        setLoginError('2FA error.');
        return;
      }
    }
    setIsAuthenticated(true);
  };

  // Save/Update Logic for Portfolio
  const handleSaveProject = () => {
    if (!projectForm.title) return alert("Title required.");
    const final: Project = {
      id: projectForm.id || Date.now().toString(),
      title: projectForm.title as string,
      category: projectForm.category as any,
      results: projectForm.results || '',
      efficiency: projectForm.efficiency || '',
      description: projectForm.description || '',
      imageUrls: projectForm.imageUrls || [],
    };
    if (projectForm.id) {
      onProjectsUpdate(currentProjects.map(p => p.id === final.id ? final : p));
      notify("Portfolio updated.");
    } else {
      onProjectsUpdate([final, ...currentProjects]);
      notify("Portfolio created.");
    }
    setProjectForm({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] });
  };

  // Save/Update Logic for Vouch List (Reviews)
  const handleSaveReview = () => {
    if (!reviewForm.name || !reviewForm.content) return alert("Required fields missing.");
    const final: Testimonial = {
      id: reviewForm.id || Date.now().toString(),
      name: reviewForm.name as string,
      role: reviewForm.role || 'Client',
      content: reviewForm.content as string,
      metric: reviewForm.metric || 'ROI Success',
      image: reviewForm.imageUrls?.[0] || '',
      imageUrls: reviewForm.imageUrls || []
    };
    if (reviewForm.id) {
      onTestimonialsUpdate(testimonials.map(t => t.id === final.id ? final : t));
      notify("Review updated.");
    } else {
      onTestimonialsUpdate([final, ...testimonials]);
      notify("Review added.");
    }
    setReviewForm({ name: '', role: '', content: '', metric: '', image: '', imageUrls: [] });
  };

  // Save/Update Logic for FAQ (KB Logic)
  const handleSaveFaq = () => {
    if (!faqForm.question || !faqForm.answer) return alert("Required fields missing.");
    const final: FAQData = {
      id: faqForm.id || Date.now().toString(),
      question: faqForm.question as string,
      answer: faqForm.answer as string
    };
    if (faqForm.id) {
      onFaqsUpdate(faqs.map(f => f.id === final.id ? final : f));
      notify("FAQ updated.");
    } else {
      onFaqsUpdate([final, ...faqs]);
      notify("FAQ created.");
    }
    setFaqDataForm({ question: '', answer: '' });
  };

  // Save/Update Logic for Tools (Toolbox)
  const handleSaveTool = () => {
    if (!toolForm.name) return alert("Tool name required.");
    const final: Tool = {
      id: toolForm.id || Date.now().toString(),
      name: toolForm.name as string,
      subtitle: toolForm.subtitle || '',
      icon: toolForm.icon || 'https://img.icons8.com/fluency/96/wrench.png'
    };
    if (toolForm.id) {
      onToolsUpdate(currentTools.map(t => t.id === final.id ? final : t));
      notify("Tool updated.");
    } else {
      onToolsUpdate([final, ...currentTools]);
      notify("Tool added.");
    }
    setToolForm({ name: '', subtitle: '', icon: '' });
  };

  // AI Fill Logic
  const handleAiAutoFill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsAiAnalyzing(true);
    notify("AI scanning marketing data...");
    
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await analyzeMarketingImage(base64Data, file.type);
      
      setProjectForm(prev => ({
        ...prev,
        title: result.title || prev.title,
        category: (['E-commerce', 'Leads', 'Engagement', 'Website Build'].includes(result.category) ? result.category : 'E-commerce') as any,
        results: result.results || prev.results,
        efficiency: result.efficiency || prev.efficiency,
        description: result.description || prev.description
      }));
      
      notify("AI insights applied.");
    } catch (err: any) {
      console.error("AI Auto-fill error:", err);
      notify(`AI failure: ${err.message || 'Unknown error'}`);
    } finally {
      setIsAiAnalyzing(false);
      if (aiFileInputRef.current) aiFileInputRef.current.value = '';
    }
  };

  const handleCvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCvUploading(true);
    notify("Uploading CV...");
    try {
      const url = await uploadFile(file, 'cv');
      setIdentityForm(prev => ({ ...prev, cvUrl: url }));
      notify("CV uploaded.");
    } catch (err) {
      notify("Upload failed.");
    } finally {
      setIsCvUploading(false);
    }
  };

  if (!isAuthenticated) return (
    <div className="fixed inset-0 bg-[#020617] z-[200] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-[#0f172a] border border-white/5 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Shield className="text-white" size={48} />
          </div>
          <h1 className="text-white font-black uppercase tracking-[0.2em] text-2xl">Elite Admin</h1>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-[0.4em] font-black">Authorized Portal v4.2.0</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity ID</label>
            <input type="text" placeholder="Username" className="w-full bg-[#1e293b] border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-mono" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Secret</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-[#1e293b] border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-mono" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {adminCreds.twoFactorEnabled && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">6-Digit Auth Code</label>
              <input type="text" maxLength={6} placeholder="000 000" className="w-full bg-[#1e293b] border border-indigo-500/30 p-5 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-mono text-center text-xl tracking-[0.5em]" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} />
            </div>
          )}
          {loginError && <p className="text-rose-500 text-center text-[10px] font-black uppercase tracking-widest">{loginError}</p>}
          <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-xl">Authorize Access</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#020617] z-[100] flex text-slate-300 font-sans overflow-hidden">
      {saveStatus && <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[210] bg-white text-slate-950 px-10 py-4 rounded-full font-black text-[11px] shadow-2xl animate-fade-in-up border border-indigo-100 flex items-center gap-3 tracking-widest uppercase"><CheckCircle2 size={16} className="text-emerald-500" /> {saveStatus}</div>}

      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        className="fixed top-8 left-8 z-[160] p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl hover:scale-110 transition-all flex items-center justify-center group border border-white/20"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed top-0 bottom-0 left-0 w-80 bg-[#0f172a] border-r border-white/5 shadow-2xl flex flex-col z-[150] transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-12 flex items-center gap-4 mt-20">
          <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20"><Cpu className="text-white" size={28} /></div>
          <div>
            <div className="text-white font-black uppercase text-lg leading-none tracking-tighter">Elite Node</div>
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">v4.2.0 - Active</div>
          </div>
        </div>
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto no-scrollbar py-8">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Systems' },
            { id: 'projects', icon: Box, label: 'Portfolio' },
            { id: 'reviews', icon: Quote, label: 'Vouch List' },
            { id: 'faq', icon: HelpCircle, label: 'KB Logic' },
            { id: 'stack', icon: Layers, label: 'Toolbox' },
            { id: 'bookings', icon: ExternalLink, label: 'Bookings' },
            { id: 'leads', icon: Users, label: 'AI Leads' },
            { id: 'identity', icon: User, label: 'Identity' },
            { id: 'security', icon: Lock, label: 'Security' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-5 rounded-3xl transition-all group ${activeTab === item.id ? 'bg-[#1e293b] text-white shadow-xl border border-white/5' : 'hover:bg-white/5 text-slate-500 hover:text-slate-300'}`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-indigo-400' : 'text-slate-600'} />
              <span className="font-black text-[12px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-10 border-t border-white/5">
          <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black text-[11px] uppercase tracking-widest">Terminate</button>
        </div>
      </aside>

      <main ref={mainScrollRef} className="flex-1 transition-all duration-500 overflow-y-auto bg-[#020617] relative no-scrollbar">
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[145]" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <div className="max-w-7xl mx-auto p-12 md:p-24 space-y-20">
          
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in space-y-20">
              <header>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
                  <p className="text-indigo-500 font-black uppercase tracking-[0.5em] text-[10px]">System Summary</p>
                </div>
                <h2 className="text-7xl font-black text-white tracking-tighter">Overview.</h2>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { label: 'Portfolios', count: currentProjects.length, icon: Box, color: 'indigo' },
                  { label: 'Vouch List', count: testimonials.length, icon: Quote, color: 'emerald' },
                  { label: 'AI Leads', count: leads.length, icon: Users, color: 'rose' },
                  { label: 'Toolbox', count: currentTools.length, icon: Layers, color: 'violet' }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#0f172a] border border-white/5 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group hover:border-indigo-500/20 transition-all">
                    <stat.icon className={`text-${stat.color}-500 mb-8`} size={40} />
                    <div className="text-7xl font-black text-white mb-4 tracking-tighter">{stat.count}</div>
                    <div className="text-slate-500 text-[12px] font-black uppercase tracking-[0.3em]">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-[#0f172a] border border-white/5 p-12 rounded-[4rem] shadow-2xl">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest">Performance Analytics</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clicks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conversions</span>
                    </div>
                  </div>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ANALYTICS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#475569" 
                        fontSize={10} 
                        fontWeight="900" 
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        fontWeight="900" 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem' }}
                        itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                      />
                      <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar dataKey="conversions" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* PORTFOLIO */}
          {activeTab === 'projects' && (
            <div className="animate-fade-in space-y-20">
              <header className="flex justify-between items-end">
                <div>
                  <p className="text-indigo-400 font-black uppercase tracking-[0.5em] text-[10px] mb-4">Case Study Node</p>
                  <h2 className="text-7xl font-black text-white tracking-tighter">{projectForm.id ? 'Edit Entry.' : 'New Entry.'}</h2>
                  {projectForm.id && (
                    <button 
                      onClick={() => setProjectForm({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] })}
                      className="flex items-center gap-2 bg-indigo-600/20 text-indigo-400 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all mt-4"
                    >
                      <Plus size={14} /> New Project
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input type="file" ref={aiFileInputRef} onChange={handleAiAutoFill} className="hidden" accept="image/*" />
                  <button onClick={() => aiFileInputRef.current?.click()} className="flex items-center gap-4 bg-white text-[#020617] px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-slate-200">
                    <Sparkles size={18} /> AI Auto-Fill
                  </button>
                </div>
              </header>

              <div className="bg-[#0f172a] border border-white/5 p-16 rounded-[4rem] shadow-2xl space-y-12">
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <input type="text" placeholder="Project Name" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-bold" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
                    <select className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-bold" value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value as any})}>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Leads">Leads</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Website Build">Website Build</option>
                    </select>
                    <input type="text" placeholder="Main Result (e.g. 8.2x ROAS)" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-bold" value={projectForm.results} onChange={e => setProjectForm({...projectForm, results: e.target.value})} />
                    <textarea placeholder="Strategy breakdown..." className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-medium h-48 resize-none" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                  </div>
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4 block">Asset Gallery ({projectForm.imageUrls?.length || 0}/10)</label>
                    <div className="grid grid-cols-3 gap-4">
                      {projectForm.imageUrls?.map((url, i) => (
                        <div key={i} className="aspect-square bg-[#020617] rounded-xl overflow-hidden relative group">
                          <img src={url} className="w-full h-full object-cover" />
                          <button onClick={() => setProjectForm({...projectForm, imageUrls: projectForm.imageUrls?.filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Trash2 size={20} /></button>
                        </div>
                      ))}
                      {(projectForm.imageUrls?.length || 0) < 10 && <MediaUploader compact label="Sync" onUploadSuccess={url => setProjectForm({...projectForm, imageUrls: [...(projectForm.imageUrls || []), url]})} />}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleSaveProject} className="flex-1 bg-indigo-600 text-white py-8 rounded-[2.5rem] font-black uppercase text-[14px] tracking-widest hover:bg-indigo-500 shadow-2xl">{projectForm.id ? 'Authorize Update' : 'Publish Case Study'}</button>
                  {projectForm.id && <button onClick={() => setProjectForm({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] })} className="px-12 bg-slate-800 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest">Cancel</button>}
                </div>
              </div>

              <div className="space-y-10">
                <h3 className="text-3xl font-black text-white tracking-tight">Active Portfolios.</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentProjects.map(p => (
                    <div key={p.id} className="bg-[#0f172a] border border-white/5 p-8 rounded-[3rem] shadow-xl group hover:border-indigo-500/30 transition-all flex flex-col">
                      <div className="aspect-video bg-[#020617] rounded-2xl mb-6 overflow-hidden"><img src={p.imageUrls?.[0]} className="w-full h-full object-cover" /></div>
                      <div className="flex-1">
                        <div className="text-white font-black text-xl mb-1">{p.title}</div>
                        <div className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{p.results}</div>
                      </div>
                      <div className="mt-8 flex gap-3">
                        <button onClick={() => { setProjectForm(p); scrollToTop(); }} className="flex-1 py-4 bg-white text-[#020617] rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200">Edit</button>
                        <button onClick={() => onProjectsUpdate(currentProjects.filter(x => x.id !== p.id))} className="p-4 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VOUCH LIST (REVIEWS) */}
          {activeTab === 'reviews' && (
            <div className="animate-fade-in space-y-20">
              <header>
                <p className="text-emerald-400 font-black uppercase tracking-[0.5em] text-[10px] mb-4">Verification Node</p>
                <h2 className="text-7xl font-black text-white tracking-tighter">{reviewForm.id ? 'Edit Vouch.' : 'Add Vouch.'}</h2>
                {reviewForm.id && (
                  <button 
                    onClick={() => setReviewForm({ name: '', role: '', content: '', metric: '', image: '', imageUrls: [] })}
                    className="flex items-center gap-2 bg-emerald-600/20 text-emerald-400 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all mt-4"
                  >
                    <Plus size={14} /> New Review
                  </button>
                )}
              </header>

              <div className="bg-[#0f172a] border border-white/5 p-16 rounded-[4rem] shadow-2xl space-y-12">
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <input type="text" placeholder="Client Name" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-bold" value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} />
                    <input type="text" placeholder="Role / Company" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-bold" value={reviewForm.role} onChange={e => setReviewForm({...reviewForm, role: e.target.value})} />
                    <input type="text" placeholder="Success Badge (e.g. 5x ROAS)" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-bold" value={reviewForm.metric} onChange={e => setReviewForm({...reviewForm, metric: e.target.value})} />
                    <textarea placeholder="Feedback content..." className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-medium h-40 resize-none" value={reviewForm.content} onChange={e => setReviewForm({...reviewForm, content: e.target.value})} />
                  </div>
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-4 block">Identity Assets ({reviewForm.imageUrls?.length || 0}/2)</label>
                    <div className="grid grid-cols-2 gap-4">
                      {reviewForm.imageUrls?.map((url, i) => (
                        <div key={i} className="aspect-square bg-[#020617] rounded-xl overflow-hidden relative group">
                          <img src={url} className="w-full h-full object-cover" />
                          <button onClick={() => setReviewForm({...reviewForm, imageUrls: reviewForm.imageUrls?.filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Trash2 size={24} /></button>
                        </div>
                      ))}
                      {(reviewForm.imageUrls?.length || 0) < 2 && <MediaUploader compact label="Avatar" onUploadSuccess={url => setReviewForm({...reviewForm, imageUrls: [...(reviewForm.imageUrls || []), url]})} />}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleSaveReview} className="flex-1 bg-emerald-600 text-white py-8 rounded-[2.5rem] font-black uppercase text-[14px] tracking-widest shadow-2xl hover:bg-emerald-500">{reviewForm.id ? 'Authorize Update' : 'Publish Review'}</button>
                  {reviewForm.id && <button onClick={() => setReviewForm({ name: '', role: '', content: '', metric: '', image: '', imageUrls: [] })} className="px-12 bg-slate-800 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest">Cancel</button>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {testimonials.map(t => (
                  <div key={t.id} className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-6 truncate">
                      <div className="w-20 h-20 rounded-2xl bg-[#020617] overflow-hidden"><img src={t.imageUrls?.[0]} className="w-full h-full object-cover" /></div>
                      <div className="truncate">
                        <div className="text-white font-black text-xl truncate">{t.name}</div>
                        <div className="text-emerald-400 font-bold text-xs uppercase tracking-widest">{t.metric}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setReviewForm(t); scrollToTop(); }} className="p-4 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Edit3 size={20} /></button>
                      <button onClick={() => onTestimonialsUpdate(testimonials.filter(x => x.id !== t.id))} className="p-4 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KB LOGIC (FAQ) */}
          {activeTab === 'faq' && (
            <div className="animate-fade-in space-y-20">
              <header>
                <p className="text-violet-400 font-black uppercase tracking-[0.5em] text-[10px] mb-4">Methodology Archive</p>
                <h2 className="text-7xl font-black text-white tracking-tighter">{faqForm.id ? 'Edit Logic.' : 'Add Logic.'}</h2>
                {faqForm.id && (
                  <button 
                    onClick={() => setFaqDataForm({ question: '', answer: '' })}
                    className="flex items-center gap-2 bg-indigo-600/20 text-indigo-400 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Plus size={14} /> New FAQ
                  </button>
                )}
              </header>
              <div className="bg-[#0f172a] border border-white/5 p-16 rounded-[4rem] shadow-2xl space-y-8">
                <input type="text" placeholder="Strategic Question" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-bold" value={faqForm.question} onChange={e => setFaqDataForm({...faqForm, question: e.target.value})} />
                <textarea placeholder="Logical Resolution..." className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-medium h-48 resize-none" value={faqForm.answer} onChange={e => setFaqDataForm({...faqForm, answer: e.target.value})} />
                <div className="flex gap-4">
                  <button onClick={handleSaveFaq} className="flex-1 bg-white text-[#020617] py-8 rounded-[2.5rem] font-black uppercase text-[14px] tracking-widest shadow-2xl hover:bg-slate-200">{faqForm.id ? 'Authorize Logic Update' : 'Deploy Knowledge Node'}</button>
                  {faqForm.id && <button onClick={() => setFaqDataForm({ question: '', answer: '' })} className="px-12 bg-slate-800 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest">Cancel</button>}
                </div>
              </div>
              <div className="space-y-6">
                {faqs.map(f => (
                  <div key={f.id} className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] flex items-center justify-between group hover:border-violet-500/30 transition-all">
                    <div className="truncate pr-12">
                      <div className="text-white font-black text-xl mb-1 truncate">{f.question}</div>
                      <div className="text-slate-500 text-sm truncate italic">"{f.answer}"</div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => { setFaqDataForm(f); scrollToTop(); }} className="p-4 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Edit3 size={20} /></button>
                      <button onClick={() => onFaqsUpdate(faqs.filter(x => x.id !== f.id))} className="p-4 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOOLBOX (TOOLS) */}
          {activeTab === 'stack' && (
            <div className="animate-fade-in space-y-20">
              <header>
                <p className="text-indigo-400 font-black uppercase tracking-[0.5em] text-[10px] mb-4">Resource Node</p>
                <h2 className="text-7xl font-black text-white tracking-tighter">{toolForm.id ? 'Edit Tool.' : 'Add Tool.'}</h2>
                {toolForm.id && (
                  <button 
                    onClick={() => setToolForm({ name: '', subtitle: '', icon: '' })}
                    className="flex items-center gap-2 bg-indigo-600/20 text-indigo-400 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Plus size={14} /> New Tool
                  </button>
                )}
              </header>
              <div className="bg-[#0f172a] border border-white/5 p-16 rounded-[4rem] shadow-2xl space-y-12">
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <input type="text" placeholder="Resource Name" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-bold" value={toolForm.name} onChange={e => setToolForm({...toolForm, name: e.target.value})} />
                    <input type="text" placeholder="Competency (Subtitle)" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-bold" value={toolForm.subtitle} onChange={e => setToolForm({...toolForm, subtitle: e.target.value})} />
                    <input type="text" placeholder="Icon URL (SVG/PNG)" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-mono text-xs" value={toolForm.icon} onChange={e => setToolForm({...toolForm, icon: e.target.value})} />
                  </div>
                  <div className="flex flex-col items-center justify-center bg-[#020617] rounded-[3rem] p-12 border border-white/5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-center mb-6">Tool Icon</label>
                    <MediaUploader initialUrl={toolForm.icon} onUploadSuccess={u => setToolForm({...toolForm, icon: u})} />
                    <div className="text-white font-black text-2xl mt-6">{toolForm.name || 'Tool Preview'}</div>
                    <div className="text-indigo-400 font-bold text-xs uppercase tracking-widest">{toolForm.subtitle || 'Competency'}</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleSaveTool} className="flex-1 bg-white text-[#020617] py-8 rounded-[2.5rem] font-black uppercase text-[14px] tracking-widest shadow-2xl hover:bg-slate-200">{toolForm.id ? 'Update Tool' : 'Register Tool'}</button>
                  {toolForm.id && <button onClick={() => setToolForm({ name: '', subtitle: '', icon: '' })} className="px-12 bg-slate-800 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-widest">Cancel</button>}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {currentTools.map(t => (
                  <div key={t.id} className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-xl flex flex-col items-center group relative overflow-hidden transition-all hover:border-indigo-500/30">
                    <img src={t.icon} className="w-12 h-12 object-contain mb-6" />
                    <div className="text-white font-black text-center text-sm mb-1">{t.name}</div>
                    <div className="text-slate-500 font-bold text-[9px] uppercase tracking-widest text-center">{t.subtitle}</div>
                    <div className="absolute inset-0 bg-[#020617]/95 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 backdrop-blur-md transition-all">
                      <button onClick={() => { setToolForm(t); scrollToTop(); }} className="p-4 bg-indigo-500 text-white rounded-xl hover:scale-110 transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => onToolsUpdate(currentTools.filter(x => x.id !== t.id))} className="p-4 bg-rose-500 text-white rounded-xl hover:scale-110 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="animate-fade-in space-y-20">
              <header>
                <p className="text-indigo-400 font-black uppercase tracking-[0.5em] text-[10px] mb-4">Lead Generation Node</p>
                <h2 className="text-7xl font-black text-white tracking-tighter">Bookings.</h2>
              </header>
              <div className="bg-[#0f172a] border border-white/5 p-20 rounded-[4rem] shadow-2xl flex flex-col items-center text-center space-y-10">
                <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center">
                  <Database className="text-indigo-500" size={48} />
                </div>
                <div className="space-y-4 max-w-2xl">
                  <h3 className="text-3xl font-black text-white">Zoom Meeting Database</h3>
                  <p className="text-slate-400 font-medium">All Zoom meeting requests and form submissions are synchronized to your master Google Sheet for real-time tracking and management.</p>
                </div>
                <div className="w-full p-10 bg-[#020617] rounded-[3rem] border border-white/5 flex flex-col items-center gap-6">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Master Link</div>
                  <code className="text-xs font-mono text-slate-500 break-all bg-white/5 p-4 rounded-xl w-full max-w-xl">
                    {currentIdentity.googleSheetUrl || "https://docs.google.com/spreadsheets/d/1JDHDIp3c3GSwhemS4VvtWSowoNLHFxAIvTf91j1zQ2g/edit?gid=1373341915#gid=1373341915"}
                  </code>
                  <a 
                    href={currentIdentity.googleSheetUrl || "https://docs.google.com/spreadsheets/d/1JDHDIp3c3GSwhemS4VvtWSowoNLHFxAIvTf91j1zQ2g/edit?gid=1373341915#gid=1373341915"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white text-[#020617] px-12 py-5 rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-slate-200 transition-all shadow-2xl"
                  >
                    Open Master Sheet <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* AI LEADS */}
          {activeTab === 'leads' && (
            <div className="animate-fade-in space-y-20">
              <header>
                <p className="text-rose-400 font-black uppercase tracking-[0.5em] text-[10px] mb-4">AI Assistant Intelligence</p>
                <h2 className="text-7xl font-black text-white tracking-tighter">AI Leads.</h2>
              </header>
              <div className="space-y-8">
                {leads.length === 0 ? (
                  <div className="bg-[#0f172a] border border-white/5 p-20 rounded-[4rem] text-center">
                    <Users className="text-slate-700 mx-auto mb-6" size={64} />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No leads captured yet by AI.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {leads.map(lead => (
                      <div key={lead.id} className="bg-[#0f172a] border border-white/5 p-10 rounded-[3rem] shadow-xl group hover:border-rose-500/30 transition-all">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                                <User className="text-rose-500" size={24} />
                              </div>
                              <div>
                                <h4 className="text-2xl font-black text-white">{lead.name}</h4>
                                <p className="text-rose-400 font-bold text-[10px] uppercase tracking-widest">{lead.businessName || 'Individual'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {lead.email && (
                                <div className="flex items-center gap-3 text-slate-400">
                                  <Globe size={16} className="text-slate-600" />
                                  <span className="font-mono">{lead.email}</span>
                                </div>
                              )}
                              {lead.phone && (
                                <div className="flex items-center gap-3 text-slate-400">
                                  <Smartphone size={16} className="text-slate-600" />
                                  <span className="font-mono">{lead.phone}</span>
                                </div>
                              )}
                            </div>
                            {lead.requirements && (
                              <div className="bg-[#020617] p-6 rounded-2xl border border-white/5">
                                <p className="text-slate-300 text-sm italic leading-relaxed">"{lead.requirements}"</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col justify-between items-end gap-6">
                            <div className="text-right">
                              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Captured On</div>
                              <div className="text-slate-400 font-mono text-xs">{new Date(lead.timestamp).toLocaleString()}</div>
                            </div>
                            <button 
                              onClick={() => onLeadsUpdate(leads.filter(l => l.id !== lead.id))}
                              className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IDENTITY */}
          {activeTab === 'identity' && (
            <div className="animate-fade-in space-y-20">
              <header>
                <p className="text-indigo-400 font-black uppercase tracking-[0.5em] text-[10px] mb-4">Core Branding Node</p>
                <h2 className="text-7xl font-black text-white tracking-tighter">Identity.</h2>
              </header>
              <div className="bg-[#0f172a] border border-white/5 p-20 rounded-[4rem] shadow-2xl space-y-16">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                  <div className="space-y-6"><label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-center">Profile Image</label><MediaUploader initialUrl={identityForm.profileImageUrl} onUploadSuccess={u => setIdentityForm({...identityForm, profileImageUrl: u})} /></div>
                  <div className="space-y-6"><label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-center">Global Logo</label><MediaUploader initialUrl={identityForm.logoUrl} onUploadSuccess={u => setIdentityForm({...identityForm, logoUrl: u})} /></div>
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-center">Master CV (PDF)</label>
                    <div className="flex flex-col gap-6">
                      <input type="text" placeholder="CV URI Link" className="w-full bg-[#020617] border border-white/5 p-5 rounded-2xl text-white font-mono text-xs" value={identityForm.cvUrl} onChange={e => setIdentityForm({...identityForm, cvUrl: e.target.value})} />
                      <div onClick={() => cvInputRef.current?.click()} className="p-10 border-2 border-dashed border-slate-700 rounded-3xl bg-[#020617] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all">
                        <input type="file" ref={cvInputRef} onChange={handleCvFileUpload} className="hidden" accept=".pdf" />
                        {isCvUploading ? <Loader2 className="animate-spin text-indigo-500" size={32} /> : <FileText className="text-slate-600" size={32} />}
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-4">Upload PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <input type="text" placeholder="WhatsApp Number" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-bold" value={identityForm.whatsAppNumber} onChange={e => setIdentityForm({...identityForm, whatsAppNumber: e.target.value})} />
                  <input type="text" placeholder="LinkedIn URL" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-bold" value={identityForm.linkedInUrl} onChange={e => setIdentityForm({...identityForm, linkedInUrl: e.target.value})} />
                </div>
                <button onClick={() => { onIdentityUpdate(identityForm); notify("Identity synchronized."); }} className="w-full bg-white text-[#020617] py-8 rounded-[3rem] font-black uppercase text-[14px] tracking-widest shadow-2xl hover:bg-slate-200">Deploy Branding Update</button>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div className="animate-fade-in space-y-20">
              <header>
                <p className="text-indigo-400 font-black uppercase tracking-[0.5em] text-[10px] mb-4">Integrity Infrastructure</p>
                <h2 className="text-7xl font-black text-white tracking-tighter">Security.</h2>
              </header>
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="bg-[#0f172a] border border-white/5 p-16 rounded-[4rem] shadow-2xl space-y-12">
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest">Access Nodes</h3>
                  <div className="space-y-6">
                    <input type="text" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-mono" value={securityForm.username} onChange={e => setSecurityForm({...securityForm, username: e.target.value})} />
                    <div className="relative">
                      <input type={showCurrentPassword ? "text" : "password"} className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-mono" value={securityForm.password} onChange={e => setSecurityForm({...securityForm, password: e.target.value})} />
                      <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                        {showCurrentPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                      </button>
                    </div>
                    <button onClick={() => { onAdminCredsUpdate(securityForm); notify("Master protocols secured."); }} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-emerald-500">Apply Protocols</button>
                  </div>
                </div>
                <div className="bg-[#0f172a] border border-white/5 p-16 rounded-[4rem] shadow-2xl space-y-12">
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest">Cloud Nexus</h3>
                  <div className="space-y-8">
                    <p className="text-sm text-slate-500 font-medium">Link your Vercel BLOB token for global asset persistence.</p>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="BLOB_READ_WRITE_TOKEN" className="w-full bg-[#020617] border border-white/5 p-7 rounded-2xl text-white font-mono text-xs" value={blobToken} onChange={e => setBlobToken(e.target.value)} />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                      </button>
                    </div>
                    <button onClick={() => { localStorage.setItem('vercel_blob_token', blobToken); notify("Nexus link established."); }} className="w-full bg-white text-[#020617] py-6 rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-slate-200 shadow-xl">Establish Cloud Nexus</button>
                  </div>
                </div>
                <div className="lg:col-span-2 bg-[#0f172a] border border-white/5 p-16 rounded-[4rem] shadow-2xl space-y-12">
                  <h3 className="text-2xl font-black text-white uppercase tracking-widest">2FA Matrix</h3>
                  <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="p-12 bg-white rounded-[3rem] flex flex-col items-center shadow-2xl">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=otpauth://totp/RabbiPortfolio:${securityForm.username}?secret=${securityForm.twoFactorSecret}&issuer=RabbiPortfolio`} className="w-48 h-48 mb-6" />
                      <code className="text-[11px] font-mono font-black text-[#020617] tracking-[0.3em] bg-slate-100 px-6 py-3 rounded-xl">{securityForm.twoFactorSecret}</code>
                    </div>
                    <div className="space-y-10">
                      <div className="flex items-center justify-between p-10 bg-[#020617] rounded-[3rem] border border-white/5">
                        <div className="text-xl font-black text-white uppercase tracking-widest">Auth Active</div>
                        <button onClick={() => setSecurityForm({...securityForm, twoFactorEnabled: !securityForm.twoFactorEnabled})} className={`w-20 h-10 rounded-full relative transition-all ${securityForm.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                          <div className={`absolute top-1.5 w-7 h-7 rounded-full bg-white transition-all ${securityForm.twoFactorEnabled ? 'left-11' : 'left-2'}`} />
                        </button>
                      </div>
                      <button onClick={() => { onAdminCredsUpdate(securityForm); notify("Security matrix updated."); }} className="w-full bg-indigo-600 text-white py-10 rounded-[3rem] font-black uppercase text-[14px] tracking-widest shadow-2xl hover:bg-indigo-500">Commit Matrix Settings</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
