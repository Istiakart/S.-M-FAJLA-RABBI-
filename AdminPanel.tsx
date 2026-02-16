
import React, { useState, useEffect, useRef } from 'react';
import { Project, SiteIdentity, Tool, Testimonial, FAQData } from '../types';
import { 
  Trash2, X, ImageIcon, Edit3, Menu, MessageSquare, HelpCircle,
  Shield, Activity, Zap, Stars, Wrench, Palette, Save, Lock, Smartphone,
  LayoutDashboard, FolderKanban, Quote, Fingerprint, Globe, ChevronRight,
  TrendingUp, Database, Bell, Star, Cloud, CheckCircle2, ShieldCheck, BarChart3, Plus,
  ImagePlus, AlertTriangle, HardDrive, Sparkles, BrainCircuit, Loader2, User, Eye, EyeOff, ExternalLink, FileText, Upload
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import MediaUploader from './MediaUploader';
import { analyzeMarketingImage } from '../services/geminiService';
import { uploadFile } from '../services/blobService';

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
  adminCreds: any;
  onAdminCredsUpdate: (creds: any) => void;
}

const CLICK_DATA = [
  { name: 'Campaign A', clicks: 450 },
  { name: 'Campaign B', clicks: 890 },
  { name: 'Campaign C', clicks: 320 },
  { name: 'Campaign D', clicks: 610 },
  { name: 'Campaign E', clicks: 750 },
];

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onClose, onProjectsUpdate, currentProjects, currentIdentity, onIdentityUpdate,
  currentTools, onToolsUpdate, testimonials, onTestimonialsUpdate, faqs, onFaqsUpdate,
  adminCreds, onAdminCredsUpdate
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'reviews' | 'faq' | 'stack' | 'identity' | 'security'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [blobToken, setBlobToken] = useState(localStorage.getItem('vercel_blob_token') || '');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [isCvUploading, setIsCvUploading] = useState(false);

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Form States
  const [projectForm, setProjectForm] = useState<Partial<Project>>({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] });
  const [reviewForm, setReviewForm] = useState<Partial<Testimonial>>({ name: '', role: '', content: '', metric: '', image: '', imageUrls: [] });
  const [faqForm, setFaqForm] = useState<Partial<FAQData>>({ question: '', answer: '' });
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
    if (loginUsername.trim().toLowerCase() === adminCreds.username.toLowerCase() && loginPassword === adminCreds.password) {
      setIsAuthenticated(true);
    } else {
      setLoginError('Access Denied: Invalid Credentials');
    }
  };

  // --- REVIEWS LOGIC ---
  const handleReviewImageAdd = (url: string) => {
    if (!url) return;
    const currentImages = reviewForm.imageUrls || [];
    if (currentImages.length < 2) {
      const updatedImages = [...currentImages, url];
      setReviewForm({ ...reviewForm, imageUrls: updatedImages, image: updatedImages[0] });
      notify(`Proof #${updatedImages.length} locked.`);
    }
  };

  const handleSaveReview = () => {
    if (!reviewForm.name || !reviewForm.content) return alert("Name and Content are required.");
    const final: Testimonial = {
      id: reviewForm.id || Date.now().toString(),
      name: reviewForm.name as string,
      role: reviewForm.role || 'Client',
      content: reviewForm.content as string,
      metric: reviewForm.metric || 'Scalable ROI',
      image: reviewForm.imageUrls?.[0] || '',
      imageUrls: reviewForm.imageUrls || []
    };
    if (reviewForm.id) onTestimonialsUpdate(testimonials.map(t => t.id === final.id ? final : t));
    else onTestimonialsUpdate([final, ...testimonials]);
    setReviewForm({ name: '', role: '', content: '', metric: '', image: '', imageUrls: [] });
    notify("System Update: Review Verified.");
  };

  // --- FAQ LOGIC ---
  const handleSaveFaq = () => {
    if (!faqForm.question || !faqForm.answer) return alert("All fields are required.");
    const final: FAQData = {
      id: faqForm.id || Date.now().toString(),
      question: faqForm.question as string,
      answer: faqForm.answer as string
    };
    if (faqForm.id) onFaqsUpdate(faqs.map(f => f.id === final.id ? final : f));
    else onFaqsUpdate([final, ...faqs]);
    setFaqForm({ question: '', answer: '' });
    notify("FAQ Protocol Updated.");
  };

  // --- TECH STACK LOGIC ---
  const handleSaveTool = () => {
    if (!toolForm.name) return alert("Tool Name is required.");
    const final: Tool = {
      id: toolForm.id || Date.now().toString(),
      name: toolForm.name as string,
      subtitle: toolForm.subtitle || '',
      icon: toolForm.icon || 'https://img.icons8.com/fluency/96/wrench.png'
    };
    if (toolForm.id) onToolsUpdate(currentTools.map(t => t.id === final.id ? final : t));
    else onToolsUpdate([final, ...currentTools]);
    setToolForm({ name: '', subtitle: '', icon: '' });
    notify("Tech Stack Realigned.");
  };

  // --- PROJECT LOGIC ---
  const handleAiAutoFill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAiAnalyzing(true);
    notify("AI Engine initializing analysis...");
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const result = await analyzeMarketingImage(base64Data, file.type);
        setProjectForm(prev => ({
          ...prev,
          title: result.title || prev.title,
          category: (['E-commerce', 'Leads', 'Engagement', 'Website Build'].includes(result.category) ? result.category : 'E-commerce') as any,
          results: result.results || prev.results,
          efficiency: result.efficiency || prev.efficiency,
          description: result.description || prev.description
        }));
        notify("AI Analysis Successful: Form Populated");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      notify("AI Error: Failed to parse image.");
    } finally {
      setIsAiAnalyzing(false);
      if (aiFileInputRef.current) aiFileInputRef.current.value = '';
    }
  };

  const handleGalleryImageAdd = (url: string) => {
    if (!url) return;
    const currentImages = projectForm.imageUrls || [];
    if (currentImages.length < 10) {
      setProjectForm({ ...projectForm, imageUrls: [...currentImages, url] });
      notify(`Asset #${currentImages.length + 1} synchronized.`);
    }
  };

  const handleSaveProject = () => {
    if (!projectForm.title) return alert("Title is mandatory.");
    const final: Project = {
      id: projectForm.id || Date.now().toString(),
      title: projectForm.title as string,
      category: projectForm.category as any,
      results: projectForm.results || '',
      efficiency: projectForm.efficiency || '',
      description: projectForm.description || '',
      imageUrls: projectForm.imageUrls || [],
    };
    if (projectForm.id) onProjectsUpdate(currentProjects.map(p => p.id === final.id ? final : p));
    else onProjectsUpdate([final, ...currentProjects]);
    setProjectForm({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] });
    notify("Command: Portfolio Deployed");
  };

  // --- CV LOGIC ---
  const handleCvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCvUploading(true);
    notify("Uploading CV Protocol...");
    try {
      const url = await uploadFile(file, 'cv');
      setIdentityForm(prev => ({ ...prev, cvUrl: url }));
      notify("CV Profile Synchronized");
    } catch (err) {
      console.error(err);
      notify("CV Upload Failed");
    } finally {
      setIsCvUploading(false);
      if (cvInputRef.current) cvInputRef.current.value = '';
    }
  };

  if (!isAuthenticated) return (
    <div className="fixed inset-0 bg-slate-950 z-[200] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Fingerprint className="text-white" size={32} />
          </div>
          <h1 className="text-white font-black uppercase tracking-widest text-lg">Identity Lock</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="Admin ID" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all font-mono" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Cipher" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all font-mono" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {loginError && <p className="text-rose-500 text-center text-[10px] font-bold uppercase tracking-widest">{loginError}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 active:scale-95 transition-all">Authorize Access</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex text-slate-300 font-sans selection:bg-blue-500/30 overflow-hidden">
      {saveStatus && <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[210] bg-white text-slate-950 px-8 py-3 rounded-2xl font-black text-[10px] shadow-2xl animate-fade-in-up border border-white/10 flex items-center gap-2 tracking-widest uppercase"><CheckCircle2 size={14} className="text-emerald-500" /> {saveStatus}</div>}

      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        className="fixed top-8 left-8 z-[150] p-3 bg-white text-slate-950 rounded-2xl shadow-2xl hover:scale-110 active:scale-90 transition-all"
      >
        <Menu size={20} />
      </button>

      <aside className={`fixed top-6 bottom-6 transition-all duration-500 ease-in-out bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col z-[120] overflow-hidden ${isSidebarOpen ? 'left-6 w-72 translate-x-0' : '-translate-x-[200%] w-0'}`}>
        <div className="p-10 flex items-center gap-3 mt-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Zap className="text-white" size={20} /></div>
          <div>
            <div className="text-white font-black uppercase text-sm leading-none tracking-tighter">Command</div>
            <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">v3.5 Multi-Node</div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
            { id: 'projects', icon: FolderKanban, label: 'Portfolios' },
            { id: 'reviews', icon: Quote, label: 'Reviews' },
            { id: 'faq', icon: HelpCircle, label: 'FAQs' },
            { id: 'stack', icon: Wrench, label: 'Tech Stack' },
            { id: 'identity', icon: Globe, label: 'Identity' },
            { id: 'security', icon: Lock, label: 'Security' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'hover:bg-white/5 text-slate-500 hover:text-slate-200'}`}
            >
              <item.icon size={18} />
              <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
              {activeTab === item.id && <ChevronRight className="ml-auto opacity-50" size={14} />}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-white/5">
            <a 
              href="https://docs.google.com/spreadsheets/d/1JDHDIp3c3GSwhemS4VvtWSowoNLHFxAIvTf91j1zQ2g/edit?gid=1373341915#gid=1373341915" 
              target="_blank" 
              rel="noreferrer"
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-emerald-500 hover:bg-emerald-500/10 transition-all"
            >
              <Database size={18} />
              <span className="font-bold text-xs uppercase tracking-widest">Zoom Leads</span>
              <ExternalLink className="ml-auto opacity-50" size={12} />
            </a>
          </div>
        </nav>

        <div className="p-8">
          <button onClick={onClose} className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
            <X size={16} /> Close Terminal
          </button>
        </div>
      </aside>

      <main ref={mainScrollRef} className={`flex-1 transition-all duration-500 mr-6 my-6 overflow-y-auto rounded-[3rem] bg-slate-900/30 border border-white/5 relative p-10 md:p-16 no-scrollbar ${isSidebarOpen ? 'ml-80' : 'ml-6'}`}>
        <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none rounded-t-[3rem]"></div>
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in space-y-12 relative z-10">
            <div>
              <h2 className="text-5xl font-black text-white tracking-tighter mb-2">Systems Overview</h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Active Performance Node</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] hover:bg-white/10 transition-all">
                <FolderKanban className="text-blue-500 mb-6" size={24} />
                <div className="text-5xl font-black text-white mb-2 tracking-tighter">{currentProjects.length}</div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Portfolios</div>
              </div>
              <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] hover:bg-white/10 transition-all">
                <Quote className="text-emerald-500 mb-6" size={24} />
                <div className="text-5xl font-black text-white mb-2 tracking-tighter">{testimonials.length}</div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Reviews</div>
              </div>
              <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] hover:bg-white/10 transition-all">
                <HelpCircle className="text-indigo-500 mb-6" size={24} />
                <div className="text-5xl font-black text-white mb-2 tracking-tighter">{faqs.length}</div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Active FAQs</div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 p-12 rounded-[4rem]">
              <div className="flex items-center gap-3 mb-10">
                <BarChart3 className="text-blue-500" size={20} />
                <h4 className="text-white font-black text-lg uppercase tracking-widest">Node Activity</h4>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CLICK_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                    <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px', fontWeight: 'bold'}} />
                    <Bar dataKey="clicks" radius={[10, 10, 0, 0]}>
                      {CLICK_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
           <div className="animate-fade-in space-y-12 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <h2 className="text-5xl font-black text-white tracking-tighter">Portfolio Architect</h2>
                 <div className="relative group">
                    <input type="file" ref={aiFileInputRef} onChange={handleAiAutoFill} className="hidden" accept="image/*" />
                    <button onClick={() => aiFileInputRef.current?.click()} disabled={isAiAnalyzing} className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-900/30 hover:scale-105 active:scale-95 transition-all">
                      {isAiAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles className="animate-pulse" size={16} />}
                      AI Auto-Fill
                    </button>
                 </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Campaign Identity</label>
                       <input type="text" placeholder="Project Name" className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Niche Sector</label>
                         <select className="w-full bg-slate-900 border border-white/10 p-5 rounded-2xl text-white outline-none font-bold" value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value as any})}>
                           <option value="E-commerce">E-commerce</option>
                           <option value="Leads">Leads</option>
                           <option value="Engagement">Engagement</option>
                           <option value="Website Build">Website Build</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Results Metric</label>
                         <input type="text" placeholder="e.g. BDT 50k Sales" className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-blue-500 font-bold" value={projectForm.results} onChange={e => setProjectForm({...projectForm, results: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Strategy Description</label>
                       <textarea placeholder="Describe strategy..." className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none h-40 resize-none focus:border-blue-500" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2 flex items-center gap-2">
                      <ImageIcon size={12} className="text-blue-500" /> Gallery Assets ({projectForm.imageUrls?.length || 0}/10)
                    </h4>
                    <div className="grid grid-cols-5 gap-3">
                      {projectForm.imageUrls?.map((url, i) => (
                        <div key={i} className="group relative aspect-square bg-slate-900 rounded-xl overflow-hidden border border-white/10">
                          <img src={url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <button onClick={() => setProjectForm({...projectForm, imageUrls: projectForm.imageUrls?.filter((_, idx) => idx !== i)})} className="text-white"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                      {(projectForm.imageUrls?.length || 0) < 10 && <MediaUploader compact label="+" onUploadSuccess={handleGalleryImageAdd} />}
                    </div>
                  </div>
                </div>
                <button onClick={handleSaveProject} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-2xl active:scale-95">Authorize & Deploy Campaign</button>
              </div>

              {/* LIST OF PROJECTS */}
              <div className="space-y-6">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                   <FolderKanban className="text-blue-500" size={24} /> System Library
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProjects.map(p => (
                      <div key={p.id} className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] group hover:border-blue-500/30 transition-all flex flex-col">
                        <div className="aspect-video bg-slate-800 rounded-2xl mb-4 overflow-hidden border border-white/5">
                           <img src={p.imageUrls?.[0] || 'https://via.placeholder.com/300x200'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                           <div className="text-white font-black text-lg mb-1 truncate">{p.title}</div>
                           <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-4">{p.category}</div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => { setProjectForm(p); scrollToTop(); }} className="flex-1 py-3 bg-blue-500/10 text-blue-500 rounded-xl font-black uppercase text-[10px] hover:bg-blue-600 hover:text-white transition-all">Edit Node</button>
                           <button onClick={() => onProjectsUpdate(currentProjects.filter(x => x.id !== p.id))} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="animate-fade-in space-y-12 relative z-10">
            <h2 className="text-5xl font-black text-white tracking-tighter">Review Console</h2>
            <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Client Name</label>
                       <input type="text" placeholder="Client Name" className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-emerald-500" value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Role/Company</label>
                       <input type="text" placeholder="CEO, Nexa Brands" className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-emerald-500" value={reviewForm.role} onChange={e => setReviewForm({...reviewForm, role: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Impact Badge</label>
                     <input type="text" placeholder="Growth Metric (Badge)" className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-emerald-500" value={reviewForm.metric} onChange={e => setReviewForm({...reviewForm, metric: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Testimonial Content</label>
                     <textarea placeholder="Paste testimonial..." className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none h-40 resize-none focus:border-emerald-500" value={reviewForm.content} onChange={e => setReviewForm({...reviewForm, content: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2 flex items-center gap-2">
                    <ImageIcon size={12} className="text-emerald-500" /> Proof Assets ({reviewForm.imageUrls?.length || 0}/2)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {reviewForm.imageUrls?.map((url, i) => (
                      <div key={i} className="group relative aspect-square bg-slate-900 rounded-3xl overflow-hidden border border-white/10">
                        <img src={url} className="w-full h-full object-cover" />
                        <button onClick={() => setReviewForm({...reviewForm, imageUrls: reviewForm.imageUrls?.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-xl hover:scale-110 transition-all"><Trash2 size={14} /></button>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-[8px] font-black text-white rounded uppercase tracking-widest">{i === 0 ? 'Avatar' : 'Proof'}</div>
                      </div>
                    ))}
                    {(reviewForm.imageUrls?.length || 0) < 2 && <MediaUploader compact label="Add Assets" onUploadSuccess={handleReviewImageAdd} />}
                  </div>
                </div>
              </div>
              <button onClick={handleSaveReview} className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/20 active:scale-95">Publish Review Node</button>
            </div>

            {/* LIST OF REVIEWS */}
            <div className="space-y-6">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                 <Quote className="text-emerald-500" size={24} /> Client Feed
               </h3>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {testimonials.map(t => (
                   <div key={t.id} className="bg-white/5 border border-white/5 p-8 rounded-[3rem] group hover:border-emerald-500/30 transition-all flex flex-col gap-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden shadow-lg">
                           <img src={t.image || t.imageUrls?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <div className="text-white font-black text-base mb-0.5">{t.name}</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.role}</div>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => { setReviewForm(t); scrollToTop(); }} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={16} /></button>
                         <button onClick={() => onTestimonialsUpdate(testimonials.filter(x => x.id !== t.id))} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                       </div>
                     </div>
                     <p className="text-slate-400 text-xs italic line-clamp-2">"{t.content}"</p>
                     <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20 w-fit">
                        {t.metric}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* FAQS TAB */}
        {activeTab === 'faq' && (
           <div className="animate-fade-in space-y-12 relative z-10">
              <h2 className="text-5xl font-black text-white tracking-tighter">FAQ Core</h2>
              <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] space-y-10">
                 <div className="space-y-6">
                    <input type="text" placeholder="Question Text" className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none focus:border-indigo-500" value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} />
                    <textarea placeholder="Answer Data..." className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none h-40 resize-none focus:border-indigo-500" value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} />
                 </div>
                 <button onClick={handleSaveFaq} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all shadow-2xl">Synchronize FAQ</button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 {faqs.map(f => (
                   <div key={f.id} className="bg-white/5 border border-white/5 p-8 rounded-3xl flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                      <div className="truncate pr-8">
                         <div className="text-white font-bold text-base mb-1 truncate">{f.question}</div>
                         <div className="text-slate-500 text-xs truncate italic">{f.answer}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                         <button onClick={() => { setFaqForm(f); scrollToTop(); }} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={16} /></button>
                         <button onClick={() => onFaqsUpdate(faqs.filter(x => x.id !== f.id))} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {/* TECH STACK TAB */}
        {activeTab === 'stack' && (
           <div className="animate-fade-in space-y-12 relative z-10">
              <h2 className="text-5xl font-black text-white tracking-tighter">Stack Registry</h2>
              <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] space-y-10">
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <input type="text" placeholder="Tool Name (e.g. Meta Ads)" className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none" value={toolForm.name} onChange={e => setToolForm({...toolForm, name: e.target.value})} />
                       <input type="text" placeholder="Subtitle (e.g. Scaling & ROI)" className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none" value={toolForm.subtitle} onChange={e => setToolForm({...toolForm, subtitle: e.target.value})} />
                       <input type="text" placeholder="Icon URL (SVG/PNG)" className="w-full bg-slate-900/50 border border-white/10 p-5 rounded-2xl text-white outline-none" value={toolForm.icon} onChange={e => setToolForm({...toolForm, icon: e.target.value})} />
                    </div>
                    <div className="flex flex-col items-center justify-center bg-slate-900/50 rounded-[3rem] border border-white/5 p-10">
                       <div className="w-24 h-24 rounded-3xl bg-white p-4 flex items-center justify-center mb-6 shadow-xl">
                          <img src={toolForm.icon || 'https://img.icons8.com/fluency/96/wrench.png'} className="max-w-full max-h-full object-contain" />
                       </div>
                       <div className="text-white font-black text-xl">{toolForm.name || 'Tool Name'}</div>
                       <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">{toolForm.subtitle || 'Tooling Solution'}</div>
                    </div>
                 </div>
                 <button onClick={handleSaveTool} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-2xl">Authorize Tooling</button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {currentTools.map(t => (
                   <div key={t.id} className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center group relative overflow-hidden transition-all hover:bg-white/10">
                      <div className="w-12 h-12 mb-4"><img src={t.icon} className="w-full h-full object-contain" /></div>
                      <div className="text-white font-bold text-sm mb-1">{t.name}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest">{t.subtitle}</div>
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                        <button onClick={() => { setToolForm(t); scrollToTop(); }} className="p-3 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={14} /></button>
                        <button onClick={() => onToolsUpdate(currentTools.filter(x => x.id !== t.id))} className="p-3 bg-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {/* IDENTITY TAB */}
        {activeTab === 'identity' && (
          <div className="animate-fade-in space-y-12 relative z-10">
            <h2 className="text-5xl font-black text-white tracking-tighter">Identity Matrix</h2>
            <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] space-y-10 max-w-4xl">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Profile Image</label>
                    <MediaUploader initialUrl={identityForm.profileImageUrl} onUploadSuccess={u => setIdentityForm({...identityForm, profileImageUrl: u})} />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Agency Logo</label>
                    <MediaUploader initialUrl={identityForm.logoUrl} onUploadSuccess={u => setIdentityForm({...identityForm, logoUrl: u})} />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">CV PDF Protocol</label>
                    <div className="flex flex-col gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Manual URL</label>
                        <input type="text" placeholder="https://..." className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white text-xs font-mono" value={identityForm.cvUrl} onChange={e => setIdentityForm({...identityForm, cvUrl: e.target.value})} />
                      </div>
                      <div 
                        onClick={() => cvInputRef.current?.click()}
                        className={`relative p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-white/5 group hover:border-blue-500 transition-all cursor-pointer ${isCvUploading ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        <input type="file" ref={cvInputRef} onChange={handleCvFileUpload} className="hidden" accept=".pdf" />
                        {isCvUploading ? (
                          <Loader2 size={24} className="text-blue-500 animate-spin mb-2" />
                        ) : (
                          <FileText size={24} className="text-slate-500 mb-2 group-hover:text-blue-500" />
                        )}
                        <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-blue-500 tracking-widest">
                          {isCvUploading ? 'Syncing...' : 'Upload PDF'}
                        </span>
                      </div>
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <input type="text" placeholder="WhatsApp Number" className="w-full bg-slate-900 border border-white/10 p-5 rounded-2xl text-white outline-none" value={identityForm.whatsAppNumber} onChange={e => setIdentityForm({...identityForm, whatsAppNumber: e.target.value})} />
                 <input type="text" placeholder="LinkedIn URL" className="w-full bg-slate-900 border border-white/10 p-5 rounded-2xl text-white outline-none" value={identityForm.linkedInUrl} onChange={e => setIdentityForm({...identityForm, linkedInUrl: e.target.value})} />
              </div>
              <button onClick={() => { onIdentityUpdate(identityForm); notify("Identity Matrix Updated."); }} className="w-full bg-white text-slate-900 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all shadow-2xl">Broadcast Global Identity</button>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="animate-fade-in space-y-12 relative z-10">
            <h2 className="text-5xl font-black text-white tracking-tighter">Security Protocols</h2>
            <div className="grid lg:grid-cols-2 gap-10">
              <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] space-y-8">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-500" size={24} />
                  <h3 className="text-xl font-black text-white uppercase tracking-widest">Access Credentials</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Admin Username</label>
                    <input type="text" className="w-full bg-slate-900 border border-white/10 p-5 rounded-2xl text-white font-mono" value={securityForm.username} onChange={e => setSecurityForm({...securityForm, username: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Admin Password</label>
                    <div className="relative">
                      <input type={showCurrentPassword ? "text" : "password"} className="w-full bg-slate-900 border border-white/10 p-5 rounded-2xl text-white font-mono" value={securityForm.password} onChange={e => setSecurityForm({...securityForm, password: e.target.value})} />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => { onAdminCredsUpdate(securityForm); notify("Access Credentials Saved."); }} 
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
                  >
                    Save Credentials
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-white/5 p-12 rounded-[4rem] space-y-8">
                <div className="flex items-center gap-3">
                  <Cloud className="text-blue-500" size={24} />
                  <h3 className="text-xl font-black text-white uppercase tracking-widest">Cloud Nexus (Vercel)</h3>
                </div>
                <div className="space-y-6">
                  <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-widest">Submit your Vercel BLOB token to enable persistent cloud storage.</p>
                  <input type="password" placeholder="BLOB_READ_WRITE_TOKEN" className="w-full bg-slate-950 border border-white/10 p-5 rounded-2xl text-white font-mono text-xs" value={blobToken} onChange={e => setBlobToken(e.target.value)} />
                  <button onClick={() => { localStorage.setItem('vercel_blob_token', blobToken); notify("Vercel Token Secured."); }} className="w-full bg-white text-slate-950 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all shadow-lg active:scale-95">Submit Token</button>
                </div>
              </div>
              
              <div className="lg:col-span-2 bg-white/5 border border-white/10 p-12 rounded-[4rem] space-y-10 relative overflow-hidden group shadow-2xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="text-indigo-500" size={24} />
                  <h3 className="text-xl font-black text-white uppercase tracking-widest">2FA Google Authenticator</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                   <div className="p-8 bg-white rounded-3xl flex flex-col items-center animate-pulse">
                      <div className="w-48 h-48 bg-slate-100 rounded-2xl border-2 border-slate-50 flex items-center justify-center p-4">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/RabbiPortfolio:Admin?secret=${securityForm.twoFactorSecret}&issuer=RabbiPortfolio`} className="w-full h-full object-contain" alt="QR Code" />
                      </div>
                      <code className="mt-4 text-xs font-mono font-black text-slate-900 tracking-[0.2em]">{securityForm.twoFactorSecret}</code>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 transition-all hover:bg-white/10">
                        <div className="text-sm font-black text-white uppercase tracking-widest">Auth Protocol</div>
                        <button onClick={() => setSecurityForm({...securityForm, twoFactorEnabled: !securityForm.twoFactorEnabled})} className={`w-14 h-8 rounded-full transition-all relative ${securityForm.twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                          <div className={`absolute top-1.5 w-5 h-5 rounded-full bg-white transition-all ${securityForm.twoFactorEnabled ? 'left-8' : 'left-1.5'}`} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest">Scan the QR code with your Google Authenticator app to link the node. Keep the secret key in a secure vault.</p>
                      <button onClick={() => { onAdminCredsUpdate(securityForm); notify("Security Core Updated."); }} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all shadow-xl active:scale-95">Update Security Matrix</button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
