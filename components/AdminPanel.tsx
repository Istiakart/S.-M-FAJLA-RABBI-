
import React, { useState, useEffect } from 'react';
import { Project, SiteIdentity, Tool, Testimonial, FAQData } from '../types';
import { 
  Plus, LogOut, Trash2, Sparkles, Loader2, X, 
  ShieldCheck, User as UserIcon, Lock, Eye, 
  EyeOff, Smartphone, Key, ExternalLink, Image as ImageIcon,
  Edit3, Menu, ArrowLeft, QrCode, Copy, Info,
  Users, XCircle, RefreshCcw, Check, TrendingUp, Wrench, Palette, FileText,
  Cloud, CloudLightning, UploadCloud, Globe, Download, Share2, MessageSquare, HelpCircle,
  Shield, Link2, Database, List, BarChart3, Server, Activity, Settings, Zap, KeyRound, AlertTriangle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MediaUploader from './MediaUploader';
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
  
  const [totalVisitors, setTotalVisitors] = useState<number>(0);
  const [globalConfigUrl, setGlobalConfigUrl] = useState(localStorage.getItem('global_config_url') || '');

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
      setGlobalConfigUrl(url);
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
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 p-2 hover:bg-slate-50 rounded-xl transition-colors">
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

              {/* Enhanced Security Awareness Card */}
              {!adminCreds.twoFactorEnabled && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                         <Shield size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest">Critical: Security Upgrade Available</h4>
                        <p className="text-[11px] text-amber-700 font-bold mt-1 uppercase">Two-Factor Authentication is currently disabled. Protect your brand data now.</p>
                      </div>
                   </div>
                   <button onClick={() => setActiveTab('security')} className="bg-amber-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-700 transition-all">Go to Security</button>
                </div>
              )}

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
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-[9px] font-black uppercase text-slate-400">Traffic</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-[9px] font-black uppercase text-slate-400">Leads</span>
                    </div>
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ANALYTICS_DATA}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                        cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                      />
                      <Area type="monotone" dataKey="visits" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                      <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorLeads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Security & Access Control</h2>
                  <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest">Hardened Protection for your Terminal</p>
                </div>
                <div className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase ${adminCreds.twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {adminCreds.twoFactorEnabled ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                  {adminCreds.twoFactorEnabled ? 'System Secure' : 'At Risk'}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Admin Credentials */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-xl font-black flex items-center gap-3 text-slate-900"><KeyRound size={24} className="text-blue-600"/> Master Credentials</h3>
                  <div className="space-y-6">
                     <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Administrative Username</label>
                        <input type="text" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={adminCreds.username} onChange={e => onAdminCredsUpdate({...adminCreds, username: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Encrypted Access Pass</label>
                        <div className="relative">
                          <input type={showSecurePassword ? "text" : "password"} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={adminCreds.password} onChange={e => onAdminCredsUpdate({...adminCreds, password: e.target.value})} />
                          <button type="button" onClick={() => setShowSecurePassword(!showSecurePassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                            {showSecurePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                     </div>
                     <button onClick={() => showNotification("Authorized credentials saved.")} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl">Update Access Key</button>
                  </div>
                </div>

                {/* 2FA Section */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black flex items-center gap-3 text-slate-900"><Smartphone size={24} className="text-blue-600"/> Multi-Factor (2FA)</h3>
                    <button onClick={() => onAdminCredsUpdate({...adminCreds, twoFactorEnabled: !adminCreds.twoFactorEnabled})} className={`w-14 h-7 rounded-full transition-all relative ${adminCreds.twoFactorEnabled ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${adminCreds.twoFactorEnabled ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  {adminCreds.twoFactorEnabled ? (
                    <div className="space-y-8 animate-fade-in text-center">
                      <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 mx-auto w-fit shadow-inner group">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=otpauth://totp/RabbiPortfolio:${adminCreds.username}?secret=${adminCreds.twoFactorSecret}&issuer=RabbiPortfolio`} 
                          alt="2FA QR Code" 
                          className="w-40 h-40 mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Authenticator Registration Secret</p>
                        <div className="bg-slate-900 text-blue-400 p-4 rounded-xl font-mono text-xs select-all border border-white/5 flex items-center justify-between">
                          <span>{adminCreds.twoFactorSecret}</span>
                          <Copy size={14} className="opacity-40 cursor-pointer hover:opacity-100" onClick={() => { navigator.clipboard.writeText(adminCreds.twoFactorSecret); showNotification("Secret Copied!"); }} />
                        </div>
                        <p className="text-[9px] text-slate-400 italic">Scan QR with Google Authenticator or Microsoft Authenticator</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center">
                       <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                         <ShieldCheck size={48} />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Multi-factor Authentication is currently <br/> inactive for this terminal.</p>
                       <button onClick={() => onAdminCredsUpdate({...adminCreds, twoFactorEnabled: true})} className="mt-6 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">Activate 2FA Protection</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Vercel Blob Token */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 max-w-2xl">
                 <h3 className="text-xl font-black flex items-center gap-3 text-slate-900"><Server size={24} className="text-blue-600" /> Cloud Storage Credentials</h3>
                 <div className="space-y-6">
                   <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-start gap-4 text-blue-800">
                     <Info className="shrink-0 mt-1" size={18} />
                     <p className="text-[11px] font-bold leading-relaxed uppercase tracking-wider">This token is required for the <strong>Media Uploader</strong>. Keep it confidential.</p>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Vercel Blob Read/Write Token</label>
                      <div className="relative">
                        <input type={showBlobToken ? "text" : "password"} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold placeholder:text-slate-300" value={blobToken} onChange={(e) => setBlobToken(e.target.value)} placeholder="prj_AbC123..." />
                        <button type="button" onClick={() => setShowBlobToken(!showBlobToken)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                          {showBlobToken ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold mt-3 ml-4 italic">* Found in Vercel Dashboard &rarr; Storage &rarr; Blob &rarr; Settings</p>
                   </div>
                   <button onClick={saveBlobToken} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all">Persist Storage Access</button>
                 </div>
              </div>
            </div>
          )}

          {/* ... Other Tabs remain the same ... */}
          {activeTab === 'projects' && (
            <div className="animate-fade-in space-y-10">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <ImageIcon size={24} className="text-blue-600"/> 
                    {projectForm.id ? 'Edit Case Study' : 'Capture New Result'}
                  </h3>
                  {projectForm.id && (
                    <button onClick={() => setProjectForm(initialProject)} className="text-xs font-black uppercase text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">Cancel Edit</button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Project Identity</label>
                      <input type="text" placeholder="e.g. Meta Ads Scaling for XYZ" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Category</label>
                        <select className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 appearance-none" value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value as any})}>
                          <option value="E-commerce">E-commerce</option>
                          <option value="Leads">Leads</option>
                          <option value="Engagement">Engagement</option>
                          <option value="Website Build">Website Build</option>
                        </select>
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">ROAS / Efficiency</label>
                         <input type="text" placeholder="e.g. 7.2x ROAS" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" value={projectForm.efficiency} onChange={e => setProjectForm({...projectForm, efficiency: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Core Performance Metric</label>
                      <input type="text" placeholder="e.g. $80k Total Sales" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" value={projectForm.results} onChange={e => setProjectForm({...projectForm, results: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Strategy Description</label>
                    <textarea placeholder="Outline the campaign breakdown..." className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 h-full min-h-[160px] resize-none" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 ml-4">Creative Assets (Support up to 10)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i}>
                         <MediaUploader label={`Img ${i+1}`} onUploadSuccess={(url) => { 
                           const newImgs = [...(projectForm.imageUrls || [])]; 
                           newImgs[i] = url; 
                           setProjectForm({...projectForm, imageUrls: newImgs}); 
                         }} />
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleSaveProject} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_15px_30px_rgba(37,99,235,0.2)] hover:bg-blue-500 active:scale-[0.98] transition-all">Publish Growth Study</button>
              </div>

              <div className="space-y-6">
                 <h3 className="text-xl font-black ml-4">Active Repository</h3>
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

          {activeTab === 'integrations' && (
            <div className="animate-fade-in space-y-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Lead Infrastructure</h2>
                <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest">Connect Data Sources & CRM</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <h4 className="text-xs font-black uppercase text-blue-600 flex items-center gap-3"><Database size={16}/> Google Data Hub</h4>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Google Form Integration</label>
                      <input type="text" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={currentIdentity.googleFormUrl || ''} onChange={e => onIdentityUpdate({...currentIdentity, googleFormUrl: e.target.value})} placeholder="https://docs.google.com/forms/..." />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Google Sheets Lead Tracker</label>
                      <input type="text" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={currentIdentity.googleSheetUrl || ''} onChange={e => onIdentityUpdate({...currentIdentity, googleSheetUrl: e.target.value})} placeholder="https://docs.google.com/spreadsheets/..." />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <h4 className="text-xs font-black uppercase text-blue-600 flex items-center gap-3"><Link2 size={16}/> Direct Reach Channels</h4>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">WhatsApp Business Bridge</label>
                      <input type="text" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={currentIdentity.whatsAppNumber || ''} onChange={e => onIdentityUpdate({...currentIdentity, whatsAppNumber: e.target.value})} placeholder="880195..." />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">LinkedIn Professional Network</label>
                      <input type="text" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={currentIdentity.linkedInUrl || ''} onChange={e => onIdentityUpdate({...currentIdentity, linkedInUrl: e.target.value})} placeholder="https://linkedin.com/in/..." />
                    </div>
                  </div>
                </div>
              </div>

              {currentIdentity.googleSheetUrl && (
                <div className="bg-white p-2 rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden group">
                   <div className="flex items-center justify-between p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <List size={20} />
                        </div>
                        <h3 className="text-xl font-black">Lead Real-Time Feed</h3>
                      </div>
                      <a href={currentIdentity.googleSheetUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                        Launch Spreadsheet <ExternalLink size={14} />
                      </a>
                   </div>
                   <div className="w-full aspect-[21/10] bg-slate-100 rounded-[2.5rem] border border-white/20 overflow-hidden shadow-inner">
                      <iframe src={currentIdentity.googleSheetUrl.replace('/edit', '/preview')} className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity" />
                   </div>
                </div>
              )}

              <button onClick={handleSaveIntegrations} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-sm shadow-[0_20px_40px_-5px_rgba(37,99,235,0.3)] hover:bg-blue-500 active:scale-[0.99] transition-all">Update Infrastructure Settings</button>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="animate-fade-in space-y-10">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black flex items-center gap-3"><MessageSquare size={24} className="text-blue-600"/> Client Review Entry</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <MediaUploader label="Client Avatar" onUploadSuccess={(url) => setTestimonialForm({...testimonialForm, image: url})} />
                    <div className="space-y-4">
                      <input type="text" placeholder="Client Name" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={testimonialForm.name} onChange={e => setTestimonialForm({...testimonialForm, name: e.target.value})} />
                      <input type="text" placeholder="Designation / Role" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={testimonialForm.role} onChange={e => setTestimonialForm({...testimonialForm, role: e.target.value})} />
                      <input type="text" placeholder="Highlight Metric (e.g. +400% ROI)" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={testimonialForm.metric} onChange={e => setTestimonialForm({...testimonialForm, metric: e.target.value})} />
                    </div>
                  </div>
                  <div className="h-full">
                    <textarea placeholder="The success story..." className="w-full bg-slate-50 border-none p-6 rounded-[2rem] text-sm font-bold h-full min-h-[200px] resize-none" value={testimonialForm.content} onChange={e => setTestimonialForm({...testimonialForm, content: e.target.value})} />
                  </div>
                </div>
                <button onClick={handleSaveTestimonial} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500">Log Review</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {testimonials.map(t => (
                   <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                     <div className="flex items-center gap-4 overflow-hidden">
                        <img src={t.image} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        <div className="overflow-hidden">
                          <div className="font-black text-slate-900 text-xs truncate">{t.name}</div>
                          <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-0.5">{t.metric}</div>
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

          {activeTab === 'faq' && (
            <div className="animate-fade-in space-y-10">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black flex items-center gap-3"><HelpCircle size={24} className="text-blue-600"/> Tactical FAQ Builder</h3>
                <div className="space-y-6">
                  <input type="text" placeholder="Strategic Question" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} />
                  <textarea placeholder="The expert response..." className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold h-32 resize-none" value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} />
                  <button onClick={handleSaveFaq} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500">Update Knowledge Base</button>
                </div>
              </div>

              <div className="space-y-4">
                {faqs.map(f => (
                  <div key={f.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
                    <div className="pr-10 overflow-hidden">
                      <div className="font-black text-sm text-slate-900 truncate">{f.question}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setFaqForm(f)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={14} /></button>
                      <button onClick={() => onFaqsUpdate(faqs.filter(item => item.id !== f.id))} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="animate-fade-in space-y-10">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black flex items-center gap-3"><Wrench size={24} className="text-blue-600"/> Technology Engine</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <MediaUploader label="SVG/PNG Icon" onUploadSuccess={(url) => setToolForm({...toolForm, icon: url})} />
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Platform Name</label>
                      <input type="text" placeholder="e.g. Meta Ads Manager" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={toolForm.name} onChange={e => setToolForm({...toolForm, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Capability Description</label>
                      <input type="text" placeholder="e.g. High-Scale Funnels" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" value={toolForm.subtitle} onChange={e => setToolForm({...toolForm, subtitle: e.target.value})} />
                    </div>
                  </div>
                </div>
                <button onClick={handleSaveTool} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-500/10 transition-all">Deploy Tool Asset</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                 {currentTools.map(t => (
                   <div key={t.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center relative group shadow-sm hover:shadow-md transition-all">
                     <div className="w-12 h-12 flex items-center justify-center mb-4 p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-all">
                        <img src={t.icon} className="max-h-full max-w-full object-contain" />
                     </div>
                     <div className="font-black text-[11px] text-slate-900 text-center uppercase tracking-widest">{t.name}</div>
                     <div className="flex gap-1 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => setToolForm(t)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white"><Edit3 size={10} /></button>
                       <button onClick={() => onToolsUpdate(currentTools.filter(item => item.id !== t.id))} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 size={10} /></button>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="animate-fade-in space-y-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Brand Parameters</h2>
                <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest">Manage Visual DNA & Documentation</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { label: 'Master Logo', key: 'logoUrl', icon: <Zap size={14}/> },
                  { label: 'Professional Profile', key: 'profileImageUrl', icon: <UserIcon size={14}/> },
                  { label: 'Carrier CV (PDF)', key: 'cvUrl', icon: <FileText size={14}/>, accept: 'application/pdf' }
                ].map((asset, i) => (
                  <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 group hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                       {asset.icon} {asset.label}
                    </div>
                    <MediaUploader label={`Upload ${asset.label}`} accept={asset.accept} onUploadSuccess={(url) => onIdentityUpdate({...currentIdentity, [asset.key]: url})} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
