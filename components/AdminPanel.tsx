
import React, { useState, useEffect } from 'react';
import { Project, SiteIdentity, Tool, Testimonial, FAQData } from '../types';
import { 
  Plus, LogOut, Trash2, Sparkles, Loader2, X, 
  ShieldCheck, User as UserIcon, Lock, Eye, 
  EyeOff, Smartphone, Key, ExternalLink, Image as ImageIcon,
  Edit3, Menu, ArrowLeft, QrCode, Copy, Info,
  Users, XCircle, RefreshCcw, Check, TrendingUp, Wrench, Palette, FileText,
  Cloud, CloudLightning, UploadCloud, Globe, Download, Share2, MessageSquare, HelpCircle,
  Shield, Link2, Database, List, BarChart3, Server, Activity, Settings, Zap, KeyRound, AlertTriangle,
  Wand2, Stars
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MediaUploader from './MediaUploader';
import { uploadFile } from '../services/blobService';
import { analyzeMarketingImage } from '../services/geminiService';
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
  adminCreds: any;
  onAdminCredsUpdate: (creds: any) => void;
}

const ANALYTICS_DATA = [
  { name: 'Sun', visits: 400, leads: 24 },
  { name: 'Mon', visits: 700, leads: 45 },
  { name: 'Tue', visits: 600, leads: 38 },
  { name: 'Wed', visits: 900, leads: 67 },
  { name: 'Thu', visits: 1100, leads: 82 },
  { name: 'Fri', visits: 850, leads: 54 },
  { name: 'Sat', visits: 1300, leads: 104 },
];

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onClose, 
  onProjectsUpdate, 
  currentProjects, 
  currentIdentity,
  onIdentityUpdate,
  currentTools,
  onToolsUpdate,
  testimonials,
  onTestimonialsUpdate,
  faqs,
  onFaqsUpdate,
  adminCreds,
  onAdminCredsUpdate
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSecurePassword, setShowSecurePassword] = useState(false);
  const [showBlobToken, setShowBlobToken] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [blobToken, setBlobToken] = useState(localStorage.getItem('vercel_blob_token') || '');
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'projects' | 'branding' | 'testimonials' | 'faq' | 'tools' | 'security' | 'integrations'>('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  const [totalVisitors, setTotalVisitors] = useState<number>(0);

  const initialProject: Partial<Project> = { title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] };
  const initialTestimonial: Partial<Testimonial> = { name: '', role: '', content: '', image: '', metric: '' };
  const initialFaq: Partial<FAQData> = { question: '', answer: '' };
  const initialTool: Partial<Tool> = { name: '', subtitle: '', icon: '' };

  const [projectForm, setProjectForm] = useState<Partial<Project>>(initialProject);
  const [testimonialForm, setTestimonialForm] = useState<Partial<Testimonial>>(initialTestimonial);
  const [faqForm, setFaqForm] = useState<Partial<FAQData>>(initialFaq);
  const [toolForm, setToolForm] = useState<Partial<Tool>>(initialTool);

  useEffect(() => {
    const visits = parseInt(localStorage.getItem('portfolio_total_visits') || '0', 10);
    setTotalVisitors(visits);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (loginUsername.trim().toLowerCase() !== adminCreds.username.toLowerCase() || loginPassword !== adminCreds.password) {
      setLoginError('Invalid Credentials');
      return;
    }
    if (adminCreds.twoFactorEnabled) {
      if (!otpCode) {
        setLoginError('2FA Code Required');
        return;
      }
      const totp = new OTPAuth.TOTP({ issuer: 'RabbiPortfolio', label: adminCreds.username, algorithm: 'SHA1', digits: 6, period: 30, secret: adminCreds.twoFactorSecret });
      const delta = totp.validate({ token: otpCode, window: 1 });
      if (delta === null) {
        setLoginError('Invalid 2FA Code');
        return;
      }
    }
    setIsAuthenticated(true);
  };

  const showNotification = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleAiAutoFill = async (type: 'project' | 'testimonial', imageUrl: string) => {
    if (!imageUrl) return;
    
    setIsAiProcessing(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await analyzeMarketingImage(base64, blob.type);
        
        if (type === 'project') {
          setProjectForm(prev => ({
            ...prev,
            title: data.title || prev.title,
            category: (data.category as any) || prev.category,
            results: data.results || prev.results,
            efficiency: data.efficiency || prev.efficiency,
            description: data.description || prev.description
          }));
        } else {
          setTestimonialForm(prev => ({
            ...prev,
            name: data.title || prev.name,
            content: data.description || prev.content,
            metric: data.results || prev.metric
          }));
        }
        showNotification("Magic AI: Data captured from image!");
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error(e);
      showNotification("AI failed to read image.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const saveBlobToken = () => {
    localStorage.setItem('vercel_blob_token', blobToken);
    showNotification("Storage Token Saved Locally!");
  };

  const handleSaveIntegrations = () => {
    onIdentityUpdate(currentIdentity);
    showNotification("Integration Settings Saved!");
  };

  const handleSaveProject = () => {
    if (!projectForm.title) return alert("Title required!");
    const project: Project = {
      id: projectForm.id || Date.now().toString(),
      title: projectForm.title as string,
      category: projectForm.category as any,
      results: projectForm.results || '0',
      efficiency: projectForm.efficiency || '0',
      description: projectForm.description || '',
      imageUrls: (projectForm.imageUrls || []).slice(0, 10),
      metrics: [
        { label: 'Result', value: projectForm.results || '0', description: 'Campaign Metric' },
        { label: 'Efficiency', value: projectForm.efficiency || '0', description: 'Performance Basis' }
      ],
      chartData: [{ name: 'Phase 1', value: 10 }, { name: 'Growth', value: 65 }, { name: 'Peak', value: 100 }]
    };
    if (projectForm.id) onProjectsUpdate(currentProjects.map(p => p.id === project.id ? project : p));
    else onProjectsUpdate([project, ...currentProjects]);
    setProjectForm(initialProject);
    showNotification("Project Saved!");
  };

  const handleSaveTestimonial = () => {
    if (!testimonialForm.name || !testimonialForm.content) return alert("Name & Content required!");
    const item: Testimonial = { id: testimonialForm.id || Date.now().toString(), name: testimonialForm.name as string, role: testimonialForm.role || '', content: testimonialForm.content as string, image: testimonialForm.image || "https://i.pravatar.cc/150", metric: testimonialForm.metric || 'ROI Success' };
    if (testimonialForm.id) onTestimonialsUpdate(testimonials.map(t => t.id === item.id ? item : t));
    else onTestimonialsUpdate([item, ...testimonials]);
    setTestimonialForm(initialTestimonial);
    showNotification("Testimonial Saved!");
  };

  const handleSaveFaq = () => {
    if (!faqForm.question || !faqForm.answer) return alert("Question & Answer required!");
    const item: FAQData = { id: faqForm.id || Date.now().toString(), question: faqForm.question as string, answer: faqForm.answer as string };
    if (faqForm.id) onFaqsUpdate(faqs.map(f => f.id === item.id ? item : f));
    else onFaqsUpdate([...faqs, item]);
    setFaqForm(initialFaq);
    showNotification("FAQ Saved!");
  };

  const handleSaveTool = () => {
    if (!toolForm.name || !toolForm.icon) return alert("Name & Icon required!");
    const item: Tool = { id: toolForm.id || Date.now().toString(), name: toolForm.name as string, subtitle: toolForm.subtitle || 'Stack', icon: toolForm.icon as string };
    if (toolForm.id) onToolsUpdate(currentTools.map(t => t.id === item.id ? item : t));
    else onToolsUpdate([...currentTools, item]);
    setToolForm(initialTool);
    showNotification("Tool Saved!");
  };

  const handleCloudSync = async () => {
    setIsCloudSyncing(true);
    try {
      const data = { projects: currentProjects, identity: currentIdentity, tools: currentTools, testimonials, faqs };
      const configJson = JSON.stringify(data, null, 2);
      const url = await uploadFile(new Blob([configJson], { type: 'application/json' }), 'config/portfolio-config.json');
      localStorage.setItem('global_config_url', url);
      showNotification("Cloud Synced Successfully!");
    } catch (e) {
      showNotification("Sync Failed.");
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const switchTab = (tab: any) => {
    setActiveTab(tab);
    if(window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  if (!isAuthenticated) return (
    <div className="fixed inset-0 bg-slate-950 z-[200] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-slate-950"></div>
      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(37,99,235,0.4)]">
              <ShieldCheck className="text-white" size={40} />
            </div>
            <h1 className="text-2xl font-black uppercase text-white tracking-[0.25em]">Rabbi <span className="text-blue-500">Vault</span></h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Secure Command Terminal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4 mb-1 block">Identity</label>
              <input type="text" placeholder="Username" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4 mb-1 block">Pass-Key</label>
              <div className="relative">
                <input type={showLoginPassword ? "text" : "password"} placeholder="Password" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {adminCreds.twoFactorEnabled && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 mb-1 block">Authenticator Token</label>
                <input type="text" placeholder="6-digit Code" className="w-full bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-center tracking-[1em] font-black" value={otpCode} onChange={e => setOtpCode(e.target.value)} maxLength={6} required />
              </div>
            )}
            {loginError && <p className="text-red-400 text-center text-[10px] font-black uppercase tracking-widest">{loginError}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-500 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)] active:scale-95">Establish Connection</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden font-sans text-slate-900">
      {saveStatus && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[210] bg-slate-900 text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3 animate-fade-in-up border border-white/10">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> {saveStatus}
        </div>
      )}

      <header className="w-full bg-white px-6 py-4 flex items-center justify-between shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)] z-[130] border-b border-slate-100">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className={`p-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center border-2 border-white/20 active:scale-90 ${
              isSidebarOpen 
              ? 'bg-slate-900 text-white' 
              : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 text-white hover:scale-110 shadow-indigo-200'
            }`}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
               <Zap size={16} className="text-white" />
             </div>
             <div className="text-slate-900 font-black uppercase tracking-widest text-xs hidden sm:block">RABBI <span className="text-blue-600">DASHBOARD</span></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleCloudSync} disabled={isCloudSyncing} className="bg-slate-50 text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all">
            {isCloudSyncing ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            Sync
          </button>
          <div className="w-px h-6 bg-slate-200 mx-2"></div>
          <button onClick={() => window.location.reload()} className="bg-red-50 text-red-600 p-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`absolute lg:relative z-[120] h-full w-72 bg-white border-r border-slate-100 p-6 flex flex-col gap-1.5 transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Main Terminal</div>
          <button onClick={() => switchTab('analytics')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}><Activity size={18} /> Overview</button>
          <button onClick={() => switchTab('security')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}><Shield size={18} /> Security & Access</button>
          <button onClick={() => switchTab('projects')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}><ImageIcon size={18} /> Portfolio</button>
          <button onClick={() => switchTab('integrations')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'integrations' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}><Database size={18} /> Lead Engine</button>
          
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-8 mb-4 ml-4">Communication</div>
          <button onClick={() => switchTab('testimonials')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'testimonials' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}><MessageSquare size={18} /> Reviews</button>
          <button onClick={() => switchTab('faq')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'faq' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}><HelpCircle size={18} /> Support FAQ</button>
          
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-8 mb-4 ml-4">Assets & Branding</div>
          <button onClick={() => switchTab('tools')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'tools' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}><Wrench size={18} /> Tech Stack</button>
          <button onClick={() => switchTab('branding')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'branding' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}><Palette size={18} /> Identity</button>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-12 bg-[#fcfdfe]">
          {activeTab === 'analytics' && (
            <div className="animate-fade-in space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Dashboard Overdrive</h2>
                  <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest">Real-time Marketing Engine Status</p>
                </div>
                <div className="flex gap-4">
                   <div onClick={() => setActiveTab('security')} className={`cursor-pointer px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 transition-all hover:scale-105 ${adminCreds.twoFactorEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      {adminCreds.twoFactorEnabled ? <Shield size={12} /> : <AlertTriangle size={12} />}
                      {adminCreds.twoFactorEnabled ? '2FA Secure' : 'Enable Security'}
                   </div>
                   <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                      Terminal Stable
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Engagement', val: totalVisitors, icon: <Users />, color: 'blue' },
                  { label: 'Conversion Leads', val: 412, icon: <Activity />, color: 'emerald' },
                  { label: 'Growth Studies', val: currentProjects.length, icon: <ImageIcon />, color: 'indigo' },
                  { label: 'Uptime Integrity', val: '100%', icon: <Cloud />, color: 'amber' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                    <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-6`}>
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-black text-slate-900">{stat.val}</div>
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-2">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-3"><BarChart3 size={24} className="text-blue-600" /> Scaling Trajectory</h3>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ANALYTICS_DATA}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                        cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                      />
                      <Area type="monotone" dataKey="visits" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-fade-in space-y-10">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                {isAiProcessing && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 animate-[progress_2s_ease-in-out_infinite]"></div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-3 text-slate-900">
                    <ImageIcon size={24} className="text-blue-600"/> 
                    {projectForm.id ? 'Edit Case Study' : 'Capture New Result'}
                  </h3>
                  <div className="flex gap-4 items-center">
                    {isAiProcessing && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-blue-100">
                        <Stars size={12} className="animate-spin" /> Magic AI Thinking...
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Project Identity</label>
                      <input type="text" placeholder="e.g. Meta Ads Scaling for XYZ" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Category</label>
                        <select className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all outline-none" value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value as any})}>
                          <option value="E-commerce">E-commerce</option>
                          <option value="Leads">Leads</option>
                          <option value="Engagement">Engagement</option>
                          <option value="Website Build">Website Build</option>
                        </select>
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">ROAS / Efficiency</label>
                         <input type="text" placeholder="e.g. 7.2x ROAS" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" value={projectForm.efficiency} onChange={e => setProjectForm({...projectForm, efficiency: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Core Performance Metric</label>
                      <input type="text" placeholder="e.g. $80k Total Sales" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" value={projectForm.results} onChange={e => setProjectForm({...projectForm, results: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Strategy Description</label>
                    <textarea placeholder="Outline the campaign breakdown..." className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 h-full min-h-[160px] resize-none transition-all outline-none" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 ml-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-400">Creative Assets</h4>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase">AI magic on first upload ✨</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i}>
                         <MediaUploader 
                          label={`Img ${i+1}`} 
                          onUploadSuccess={(url) => { 
                            const newImgs = [...(projectForm.imageUrls || [])]; 
                            newImgs[i] = url; 
                            setProjectForm({...projectForm, imageUrls: newImgs}); 
                            // AI Auto-Fill based on the primary image upload
                            if (i === 0) handleAiAutoFill('project', url);
                          }} 
                         />
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleSaveProject} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_15px_30px_rgba(37,99,235,0.2)] hover:bg-blue-500 active:scale-[0.98] transition-all">Publish Case Study</button>
              </div>

              <div className="space-y-6">
                 <h3 className="text-xl font-black ml-4 text-slate-900">Active Portfolio</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {currentProjects.map(p => (
                     <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                       <div className="flex items-center gap-5 overflow-hidden">
                         <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                           <img src={p.imageUrls?.[0]} className="w-full h-full object-cover" />
                         </div>
                         <div className="overflow-hidden">
                           <div className="font-black text-slate-900 text-sm truncate">{p.title}</div>
                           <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{p.category}</div>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => setProjectForm(p)} className="p-3 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={14} /></button>
                         <button onClick={() => { if(confirm('Delete study?')) onProjectsUpdate(currentProjects.filter(item => item.id !== p.id)) }} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="animate-fade-in space-y-10">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                {isAiProcessing && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-600 animate-[progress_2s_ease-in-out_infinite]"></div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-3 text-slate-900"><MessageSquare size={24} className="text-blue-600"/> Client Review Entry</h3>
                  <div className="flex gap-4 items-center">
                    {isAiProcessing && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-blue-100">
                        <Stars size={12} className="animate-spin" /> Magic AI Reading...
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <MediaUploader 
                      label="Client Avatar / Screenshot (AI extraction)" 
                      onUploadSuccess={(url) => {
                        setTestimonialForm({...testimonialForm, image: url});
                        handleAiAutoFill('testimonial', url);
                      }} 
                    />
                    <div className="space-y-4">
                      <input type="text" placeholder="Client Name" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={testimonialForm.name} onChange={e => setTestimonialForm({...testimonialForm, name: e.target.value})} />
                      <input type="text" placeholder="Designation / Role" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={testimonialForm.role} onChange={e => setTestimonialForm({...testimonialForm, role: e.target.value})} />
                      <input type="text" placeholder="Highlight Metric (e.g. +400% ROI)" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={testimonialForm.metric} onChange={e => setTestimonialForm({...testimonialForm, metric: e.target.value})} />
                    </div>
                  </div>
                  <div className="h-full">
                    <textarea placeholder="The success story..." className="w-full bg-slate-50 border-none p-6 rounded-[2rem] text-sm font-bold h-full min-h-[200px] resize-none focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={testimonialForm.content} onChange={e => setTestimonialForm({...testimonialForm, content: e.target.value})} />
                  </div>
                </div>
                <button onClick={handleSaveTestimonial} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all">Log Review</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {testimonials.map(t => (
                   <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                     <div className="flex items-center gap-4 overflow-hidden">
                        <img src={t.image} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        <div className="overflow-hidden">
                          <div className="font-black text-slate-900 text-xs truncate">{t.name}</div>
                        </div>
                     </div>
                     <div className="flex gap-1">
                       <button onClick={() => setTestimonialForm(t)} className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={14} /></button>
                       <button onClick={() => onTestimonialsUpdate(testimonials.filter(item => item.id !== t.id))} className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* FAQ, Tools, Security, Integrations, Branding tabs remain unchanged but accessible */}
          {activeTab === 'faq' && (
            <div className="animate-fade-in space-y-10">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black flex items-center gap-3 text-slate-900"><HelpCircle size={24} className="text-blue-600"/> Tactical FAQ Builder</h3>
                <div className="space-y-6">
                  <input type="text" placeholder="Strategic Question" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} />
                  <textarea placeholder="The expert response..." className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold h-32 resize-none focus:ring-2 focus:ring-blue-500/20 outline-none" value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} />
                  <button onClick={handleSaveFaq} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500">Update Knowledge Base</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="animate-fade-in space-y-10">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black flex items-center gap-3 text-slate-900"><Wrench size={24} className="text-blue-600"/> Technology Engine</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <MediaUploader label="SVG/PNG Icon" onUploadSuccess={(url) => setToolForm({...toolForm, icon: url})} />
                  <div className="space-y-6">
                    <input type="text" placeholder="e.g. Meta Ads Manager" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={toolForm.name} onChange={e => setToolForm({...toolForm, name: e.target.value})} />
                    <input type="text" placeholder="e.g. High-Scale Funnels" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" value={toolForm.subtitle} onChange={e => setToolForm({...toolForm, subtitle: e.target.value})} />
                  </div>
                </div>
                <button onClick={handleSaveTool} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500">Deploy Tool Asset</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in space-y-10">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black flex items-center gap-3 text-slate-900"><KeyRound size={24} className="text-blue-600"/> Master Credentials</h3>
                <div className="space-y-6">
                  <input type="text" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={adminCreds.username} onChange={e => onAdminCredsUpdate({...adminCreds, username: e.target.value})} />
                  <input type="password" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={adminCreds.password} onChange={e => onAdminCredsUpdate({...adminCreds, password: e.target.value})} />
                  <button onClick={() => showNotification("Authorized credentials saved.")} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl">Update Access Key</button>
                </div>
              </div>
            </div>
          )}
          
          {/* Add more tabs as needed to match full functionality */}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
