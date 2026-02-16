
import React, { useState, useEffect } from 'react';
import { Project, SiteIdentity, Tool, Testimonial, FAQData } from '../types';
import { 
  Plus, LogOut, Trash2, Sparkles, Loader2, X, 
  ShieldCheck, User as UserIcon, Lock, Eye, 
  EyeOff, Smartphone, Key, ExternalLink, Image as ImageIcon,
  Edit3, Menu, ArrowLeft, QrCode, Copy, Info,
  Users, XCircle, RefreshCcw, Check, TrendingUp, Wrench, Palette, FileText,
  Cloud, CloudLightning, UploadCloud, Globe, Download, Share2, MessageSquare, HelpCircle,
  Shield, Link2, Database, List, BarChart3, Server
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
      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <ShieldCheck className="text-blue-500 mx-auto mb-4" size={48} />
            <h1 className="text-xl font-black uppercase text-white tracking-[0.2em]">Vault Access</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Username" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required />
            <div className="relative">
              <input type={showLoginPassword ? "text" : "password"} placeholder="Password" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {adminCreds.twoFactorEnabled && (
              <input type="text" placeholder="6-digit 2FA Code" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500" value={otpCode} onChange={e => setOtpCode(e.target.value)} maxLength={6} required />
            )}
            {loginError && <p className="text-red-400 text-center text-xs font-bold uppercase">{loginError}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-500 transition-all">Authorize</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden font-sans">
      {saveStatus && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[210] bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <Check size={18} /> {saveStatus}
        </div>
      )}

      <header className="w-full bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0 shadow-xl z-[130]">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white p-2 hover:bg-slate-800 rounded-xl transition-colors">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="text-white font-black uppercase tracking-widest text-sm md:text-base">RABBI <span className="text-blue-400">CONTROL</span></div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleCloudSync} disabled={isCloudSyncing} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-500 disabled:opacity-50">
            {isCloudSyncing ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            Push to Cloud
          </button>
          <button onClick={() => window.location.reload()} className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 px-4 flex items-center gap-2">
            <LogOut size={16} /> <span className="hidden md:inline text-[10px] font-black uppercase">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`absolute lg:relative z-[120] h-full w-72 bg-slate-900 p-6 flex flex-col gap-2 transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}>
          <button onClick={() => switchTab('analytics')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><TrendingUp size={18} /> Overview</button>
          <button onClick={() => switchTab('projects')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><ImageIcon size={18} /> Projects</button>
          <button onClick={() => switchTab('integrations')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'integrations' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Database size={18} /> Leads & Sheet</button>
          <button onClick={() => switchTab('testimonials')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'testimonials' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><MessageSquare size={18} /> Testimonials</button>
          <button onClick={() => switchTab('faq')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'faq' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><HelpCircle size={18} /> FAQ</button>
          <button onClick={() => switchTab('tools')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'tools' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Wrench size={18} /> Tools Stack</button>
          <button onClick={() => switchTab('branding')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'branding' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Palette size={18} /> Branding</button>
          <button onClick={() => switchTab('security')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Shield size={18} /> Security</button>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {activeTab === 'analytics' && (
            <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
                   <div className="text-blue-500 mb-2 flex justify-center"><Users size={24}/></div>
                   <div className="text-2xl font-black">{totalVisitors}</div>
                   <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Total Visitors</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
                   <div className="text-emerald-500 mb-2 flex justify-center"><Check size={24}/></div>
                   <div className="text-2xl font-black">412</div>
                   <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Leads Captured</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
                   <div className="text-indigo-500 mb-2 flex justify-center"><ImageIcon size={24}/></div>
                   <div className="text-2xl font-black">{currentProjects.length}</div>
                   <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Case Studies</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
                   <div className="text-amber-500 mb-2 flex justify-center"><Cloud size={24}/></div>
                   <div className="text-2xl font-black">100%</div>
                   <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Cloud Status</div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
                <h3 className="text-xl font-bold flex items-center gap-2"><BarChart3 size={20} className="text-blue-500" /> Interaction Analytics (7 Days)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ANALYTICS_DATA}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                      <Area type="monotone" dataKey="visits" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                      <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorLeads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-fade-in space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><ImageIcon size={20}/> {projectForm.id ? 'Update Project' : 'Add New Project'}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input type="text" placeholder="Project Title" className="w-full border p-4 rounded-xl text-sm" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
                    <select className="w-full border p-4 rounded-xl text-sm" value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value as any})}>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Leads">Leads</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Website Build">Website Build</option>
                    </select>
                    <input type="text" placeholder="Results (e.g. $80k Sales)" className="w-full border p-4 rounded-xl text-sm" value={projectForm.results} onChange={e => setProjectForm({...projectForm, results: e.target.value})} />
                    <input type="text" placeholder="Efficiency (e.g. 7.2x ROAS)" className="w-full border p-4 rounded-xl text-sm" value={projectForm.efficiency} onChange={e => setProjectForm({...projectForm, efficiency: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <textarea placeholder="Work Details" className="w-full border p-4 rounded-xl text-sm h-44" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400">Assets (Add up to 10 Images)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="space-y-2">
                         <MediaUploader label={`Img ${i+1}`} onUploadSuccess={(url) => { const newImgs = [...(projectForm.imageUrls || [])]; newImgs[i] = url; setProjectForm({...projectForm, imageUrls: newImgs}); }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleSaveProject} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs">Save Strategy</button>
                  {projectForm.id && <button onClick={() => setProjectForm(initialProject)} className="bg-slate-200 text-slate-600 px-8 rounded-xl font-bold text-xs uppercase">Cancel</button>}
                </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-lg font-bold">Campaign Library</h3>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {currentProjects.map(p => (
                     <div key={p.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                         <img src={p.imageUrls?.[0]} className="w-12 h-12 object-cover rounded-xl" />
                         <div><div className="font-bold text-sm truncate w-32">{p.title}</div></div>
                       </div>
                       <div className="flex gap-1">
                         <button onClick={() => setProjectForm(p)} className="p-2 text-blue-500"><Edit3 size={14} /></button>
                         <button onClick={() => onProjectsUpdate(currentProjects.filter(item => item.id !== p.id))} className="p-2 text-red-500"><Trash2 size={14} /></button>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-2xl font-black">Leads & Sheet Connectivity</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                  <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2"><Database size={14}/> Google Systems</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Google Form/Lead Generation Link</label>
                      <input type="text" className="w-full border p-4 rounded-xl text-sm" value={currentIdentity.googleFormUrl || ''} onChange={e => onIdentityUpdate({...currentIdentity, googleFormUrl: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Google Sheets Data Hub Link</label>
                      <input type="text" className="w-full border p-4 rounded-xl text-sm" value={currentIdentity.googleSheetUrl || ''} onChange={e => onIdentityUpdate({...currentIdentity, googleSheetUrl: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                  <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2"><Link2 size={14}/> Social Bridge</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">WhatsApp Business Number</label>
                      <input type="text" className="w-full border p-4 rounded-xl text-sm" value={currentIdentity.whatsAppNumber || ''} onChange={e => onIdentityUpdate({...currentIdentity, whatsAppNumber: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">LinkedIn Professional URL</label>
                      <input type="text" className="w-full border p-4 rounded-xl text-sm" value={currentIdentity.linkedInUrl || ''} onChange={e => onIdentityUpdate({...currentIdentity, linkedInUrl: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
              {currentIdentity.googleSheetUrl && (
                <div className="bg-white p-4 rounded-[2.5rem] border shadow-xl overflow-hidden">
                   <div className="flex items-center justify-between p-4 mb-2">
                      <h3 className="text-lg font-bold">Live Lead Data</h3>
                      <a href={currentIdentity.googleSheetUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"><ExternalLink size={14} /> Open Full Sheet</a>
                   </div>
                   <div className="w-full aspect-[21/9] bg-slate-50 rounded-2xl border overflow-hidden">
                      <iframe src={currentIdentity.googleSheetUrl.replace('/edit', '/preview')} className="w-full h-full border-none" />
                   </div>
                </div>
              )}
              <button onClick={handleSaveIntegrations} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"><Check size={20}/> Save All Integration Settings</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Lock size={20} /> Access Security</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Admin Username</label>
                        <input type="text" placeholder="Username" className="w-full border p-4 rounded-xl text-sm" value={adminCreds.username} onChange={e => onAdminCredsUpdate({...adminCreds, username: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Admin Password</label>
                        <div className="relative">
                          <input type={showSecurePassword ? "text" : "password"} placeholder="Password" className="w-full border p-4 rounded-xl text-sm" value={adminCreds.password} onChange={e => onAdminCredsUpdate({...adminCreds, password: e.target.value})} />
                          <button type="button" onClick={() => setShowSecurePassword(!showSecurePassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showSecurePassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        </div>
                     </div>
                     <button onClick={() => showNotification("Credentials updated!")} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs">Update Secure Credentials</button>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Smartphone size={20} /> Two-Factor Auth</h3>
                    <button onClick={() => onAdminCredsUpdate({...adminCreds, twoFactorEnabled: !adminCreds.twoFactorEnabled})} className={`w-12 h-6 rounded-full transition-all relative ${adminCreds.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${adminCreds.twoFactorEnabled ? 'right-1' : 'left-1'}`} /></button>
                  </div>
                  {adminCreds.twoFactorEnabled ? (
                    <div className="space-y-6 animate-fade-in text-center">
                      <div className="bg-white p-2 rounded-2xl border shadow-sm mx-auto w-fit"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=otpauth://totp/RabbiPortfolio:${adminCreds.username}?secret=${adminCreds.twoFactorSecret}&issuer=RabbiPortfolio`} alt="2FA QR Code" className="w-40 h-40" /></div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-4">Scan with Google Authenticator</p>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 flex flex-col items-center"><ShieldCheck size={48} className="opacity-20 mb-4" /><p className="text-xs font-bold uppercase tracking-widest">2FA Protection is Disabled</p></div>
                  )}
                </div>
              </div>

              {/* Vercel Blob Token Setting */}
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6 max-w-xl">
                 <h3 className="text-xl font-bold flex items-center gap-2"><Server size={20} className="text-blue-500" /> Vercel Blob Settings</h3>
                 <div className="space-y-4">
                   <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Blob Read/Write Token</label>
                      <div className="relative">
                        <input type={showBlobToken ? "text" : "password"} className="w-full border p-4 rounded-xl text-sm" value={blobToken} onChange={e => setBlobToken(e.target.value)} placeholder="prj_..." />
                        <button type="button" onClick={() => setShowBlobToken(!showBlobToken)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showBlobToken ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold mt-2 leading-relaxed italic">* Get this from Vercel Dashboard -> Storage -> Blob -> Settings</p>
                   </div>
                   <button onClick={saveBlobToken} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs">Save Storage Token</button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="animate-fade-in space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                <h3 className="text-xl font-bold">{testimonialForm.id ? 'Edit Review' : 'Add Client Review'}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <MediaUploader label="Avatar" onUploadSuccess={(url) => setTestimonialForm({...testimonialForm, image: url})} />
                    <input type="text" placeholder="Client Name" className="w-full border p-4 rounded-xl text-sm" value={testimonialForm.name} onChange={e => setTestimonialForm({...testimonialForm, name: e.target.value})} />
                    <input type="text" placeholder="Client Role" className="w-full border p-4 rounded-xl text-sm" value={testimonialForm.role} onChange={e => setTestimonialForm({...testimonialForm, role: e.target.value})} />
                    <input type="text" placeholder="Metric" className="w-full border p-4 rounded-xl text-sm" value={testimonialForm.metric} onChange={e => setTestimonialForm({...testimonialForm, metric: e.target.value})} />
                  </div>
                  <textarea placeholder="Review Content" className="w-full border p-4 rounded-xl text-sm h-64" value={testimonialForm.content} onChange={e => setTestimonialForm({...testimonialForm, content: e.target.value})} />
                </div>
                <div className="flex gap-4"><button onClick={handleSaveTestimonial} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs">Save Review</button>{testimonialForm.id && <button onClick={() => setTestimonialForm(initialTestimonial)} className="bg-slate-200 text-slate-600 px-8 rounded-xl font-bold text-xs uppercase">Cancel</button>}</div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {testimonials.map(t => (
                   <div key={t.id} className="bg-white p-6 rounded-3xl border flex items-center justify-between group">
                     <div className="flex items-center gap-3"><img src={t.image} className="w-10 h-10 rounded-full object-cover" /><div><div className="font-bold text-xs">{t.name}</div></div></div>
                     <div className="flex gap-1"><button onClick={() => setTestimonialForm(t)} className="p-2 text-blue-500"><Edit3 size={14} /></button><button onClick={() => onTestimonialsUpdate(testimonials.filter(item => item.id !== t.id))} className="p-2 text-red-500"><Trash2 size={14} /></button></div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="animate-fade-in space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                <h3 className="text-xl font-bold">{faqForm.id ? 'Edit FAQ' : 'New FAQ'}</h3>
                <input type="text" placeholder="Question" className="w-full border p-4 rounded-xl text-sm" value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} />
                <textarea placeholder="Detailed Answer" className="w-full border p-4 rounded-xl text-sm h-32" value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} />
                <div className="flex gap-4"><button onClick={handleSaveFaq} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs">Save Question</button>{faqForm.id && <button onClick={() => setFaqForm(initialFaq)} className="bg-slate-200 text-slate-600 px-8 rounded-xl font-bold text-xs uppercase">Cancel</button>}</div>
              </div>
              <div className="space-y-4">
                {faqs.map(f => (
                  <div key={f.id} className="bg-white p-5 rounded-3xl border flex justify-between items-center group">
                    <div className="pr-4"><div className="font-bold text-xs mb-1">{f.question}</div></div>
                    <div className="flex gap-1 shrink-0"><button onClick={() => setFaqForm(f)} className="p-2 text-blue-500"><Edit3 size={14} /></button><button onClick={() => onFaqsUpdate(faqs.filter(item => item.id !== f.id))} className="p-2 text-red-500"><Trash2 size={14} /></button></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="animate-fade-in space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                <h3 className="text-xl font-bold">{toolForm.id ? 'Edit Tool' : 'Add Tech Tool'}</h3>
                <div className="grid md:grid-cols-2 gap-6"><MediaUploader label="Icon" onUploadSuccess={(url) => setToolForm({...toolForm, icon: url})} /><div className="space-y-4"><input type="text" placeholder="Tool Name" className="w-full border p-4 rounded-xl text-sm" value={toolForm.name} onChange={e => setToolForm({...toolForm, name: e.target.value})} /><input type="text" placeholder="Subtitle" className="w-full border p-4 rounded-xl text-sm" value={toolForm.subtitle} onChange={e => setToolForm({...toolForm, subtitle: e.target.value})} /></div></div>
                <div className="flex gap-4"><button onClick={handleSaveTool} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs">Save Tool</button>{toolForm.id && <button onClick={() => setToolForm(initialTool)} className="bg-slate-200 text-slate-600 px-8 rounded-xl font-bold text-xs uppercase">Cancel</button>}</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {currentTools.map(t => (
                   <div key={t.id} className="bg-white p-6 rounded-3xl border flex flex-col items-center relative group"><img src={t.icon} className="w-10 h-10 object-contain mb-3" /><div className="font-bold text-xs">{t.name}</div><div className="flex gap-1 absolute top-2 right-2"><button onClick={() => setToolForm(t)} className="p-1.5 text-blue-500"><Edit3 size={12} /></button><button onClick={() => onToolsUpdate(currentTools.filter(item => item.id !== t.id))} className="p-1.5 text-red-500"><Trash2 size={12} /></button></div></div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-2xl font-black">Visual Identity</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4"><h4 className="text-[10px] font-black uppercase text-slate-400">Logo</h4><MediaUploader label="Logo" onUploadSuccess={(url) => onIdentityUpdate({...currentIdentity, logoUrl: url})} /></div>
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4"><h4 className="text-[10px] font-black uppercase text-slate-400">Avatar</h4><MediaUploader label="Photo" onUploadSuccess={(url) => onIdentityUpdate({...currentIdentity, profileImageUrl: url})} /></div>
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4"><h4 className="text-[10px] font-black uppercase text-slate-400">CV Link</h4><MediaUploader label="CV PDF" accept="application/pdf" onUploadSuccess={(url) => onIdentityUpdate({...currentIdentity, cvUrl: url})} /></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
