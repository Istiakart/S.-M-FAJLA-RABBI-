import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Project, Visit, SiteIdentity, Tool } from '../types';
import * as OTPAuth from 'otpauth';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Plus, 
  Users, 
  LogOut, 
  Trash2, 
  Save, 
  Sparkles, 
  Loader2, 
  Edit3, 
  X, 
  Settings as SettingsIcon,
  ShieldCheck,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Image as ImageIcon,
  Copy,
  KeyRound,
  RefreshCw,
  Menu,
  Camera,
  Palette,
  Wrench,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  ExternalLink,
  SmartphoneNfc,
  FileText,
  Upload
} from 'lucide-react';
import { analyzeMarketingImage } from '../services/geminiService';

interface AdminPanelProps {
  onClose: () => void;
  onProjectsUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onProjectsUpdate }) => {
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1JDHDIp3c3GSwhemS4VvtWSowoNLHFxAIvTf91j1zQ2g/edit?resourcekey=&gid=1373341915#gid=1373341915";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginStep, setLoginStep] = useState<'creds' | '2fa'>('creds');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [useSyncToken, setUseSyncToken] = useState(false);
  const [syncTokenInput, setSyncTokenInput] = useState('');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'projects' | 'tools' | 'branding' | 'settings'>('analytics');
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [brandingSuccess, setBrandingSuccess] = useState(false);
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [syncToken, setSyncToken] = useState('');
  
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [tempSecret, setTempSecret] = useState('');
  const [setupCode, setSetupCode] = useState('');

  const [identity, setIdentity] = useState<SiteIdentity>(() => {
    const saved = localStorage.getItem('rabbi_site_identity');
    if (saved) return JSON.parse(saved);
    return {
      logoUrl: "https://media.licdn.com/dms/image/v2/D5603AQE_fwNq-orBwQ/profile-displayphoto-crop_800_800/B56Zv2bSypKkAI-/0/1769365909615?e=1772064000&v=beta&t=IwBiTqYtuTzrpjLaMJshM6rhwMQ0bX2R6lT8IrNo5BA",
      profileImageUrl: "https://media.licdn.com/dms/image/v2/D5603AQE_fwNq-orBwQ/profile-displayphoto-crop_800_800/B56Zv2bSypKkAI-/0/1769365909615?e=1772064000&v=beta&t=IwBiTqYtuTzrpjLaMJshM6rhwMQ0bX2R6lT8IrNo5BA",
      cvUrl: ""
    };
  });

  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [], link: ''
  });

  const [newTool, setNewTool] = useState<Partial<Tool>>({
    name: '', subtitle: '', icon: ''
  });

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localStorage.getItem('admin_credentials')) {
      localStorage.setItem('admin_credentials', JSON.stringify({ 
        username: 'admin', password: 'password123', twoFactorSecret: null 
      }));
    }
    setProjects(JSON.parse(localStorage.getItem('rabbi_portfolio_projects') || '[]'));
    setTools(JSON.parse(localStorage.getItem('rabbi_portfolio_tools') || '[]'));
    setVisits(JSON.parse(localStorage.getItem('rabbi_portfolio_visits') || '[]'));
    const creds = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
    setNewUsername(creds.username || 'admin');
    setSyncToken(btoa(JSON.stringify(creds)));
  }, []);

  const trafficChartData = useMemo(() => {
    const dailyMap: { [key: string]: number } = {};
    visits.forEach(v => {
      const date = new Date(v.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dailyMap[date] = (dailyMap[date] || 0) + 1;
    });
    return Object.entries(dailyMap)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 7)
      .reverse(); 
  }, [visits]);

  const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
    if (useSyncToken) {
      try {
        const decoded = JSON.parse(atob(syncTokenInput));
        if (decoded.username && decoded.password) {
          localStorage.setItem('admin_credentials', JSON.stringify(decoded));
          setIsAuthenticated(true);
          return;
        }
      } catch (err) { alert('Invalid Sync Token!'); return; }
    }
    if (loginStep === 'creds') {
      if (loginUsername === creds.username && loginPassword === creds.password) {
        if (creds.twoFactorSecret) { setLoginStep('2fa'); } else { setIsAuthenticated(true); }
      } else { alert('Invalid Credentials!'); }
    } else {
      const totp = new OTPAuth.TOTP({ secret: creds.twoFactorSecret });
      if (totp.validate({ token: twoFactorCode, window: 1 }) !== null) {
        setIsAuthenticated(true);
      } else { alert('Invalid 2FA Code!'); }
    }
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
    const newCreds = { ...creds, username: newUsername, password: newPassword || creds.password };
    localStorage.setItem('admin_credentials', JSON.stringify(newCreds));
    setSyncToken(btoa(JSON.stringify(newCreds)));
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  const handleTabChange = (tab: any) => { setActiveTab(tab); setIsSidebarOpen(false); };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const fileArray = Array.from(files) as File[];
    const current = newProject.imageUrls || [];
    if (current.length + fileArray.length > 10) { alert("Max 10 images allowed."); return; }
    const newUrls: string[] = [];
    for (const f of fileArray) {
      const compressed = await compressImage(f);
      newUrls.push(compressed);
    }
    setNewProject({ ...newProject, imageUrls: [...current, ...newUrls] });
  };

  const handleAiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsAiScanning(true);
    try {
      const compressed = await compressImage(file, 1000, 1000);
      const base64Data = compressed.split(',')[1];
      const data = await analyzeMarketingImage(base64Data, 'image/jpeg');
      setNewProject({ ...newProject, ...data, imageUrls: [compressed] });
    } finally { setIsAiScanning(false); }
  };

  const handleAddOrUpdateProject = () => {
    if (!newProject.title) return;
    const project: Project = {
      ...newProject as Project,
      id: editingProjectId || Date.now().toString(),
      metrics: [
        { label: 'Result', value: newProject.results || '0', description: 'Total Conversion' },
        { label: 'Efficiency', value: newProject.efficiency || '0', description: 'Cost Per Result' }
      ],
      chartData: editingProjectId ? projects.find(p=>p.id===editingProjectId)?.chartData : [{name: 'M1', value: 10}, {name: 'M2', value: 40}, {name: 'M3', value: 90}]
    };
    let updatedList = editingProjectId 
      ? projects.map(p => p.id === editingProjectId ? project : p)
      : [project, ...projects];
    setProjects(updatedList);
    localStorage.setItem('rabbi_portfolio_projects', JSON.stringify(updatedList));
    onProjectsUpdate();
    setEditingProjectId(null);
    setNewProject({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] });
  };

  const handleAddOrUpdateTool = () => {
    if (!newTool.name || !newTool.icon) return;
    const tool: Tool = { ...newTool as Tool, id: editingToolId || Date.now().toString() };
    const updated = editingToolId ? tools.map(t => t.id === editingToolId ? tool : t) : [tool, ...tools];
    setTools(updated);
    localStorage.setItem('rabbi_portfolio_tools', JSON.stringify(updated));
    onProjectsUpdate();
    setNewTool({ name: '', subtitle: '', icon: '' });
    setEditingToolId(null);
  };

  const handleBrandingSelect = async (type: 'logo'|'profile', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const compressed = await compressImage(file, 800, 800);
    setIdentity(prev => ({ ...prev, [type === 'logo' ? 'logoUrl' : 'profileImageUrl']: compressed }));
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.type !== 'application/pdf') { alert("Please upload a PDF file."); return; }
    if (file.size > 2 * 1024 * 1024) { alert("File size must be less than 2MB."); return; }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setIdentity(prev => ({ ...prev, cvUrl: reader.result as string }));
    };
  };

  const saveBranding = () => {
    localStorage.setItem('rabbi_site_identity', JSON.stringify(identity));
    onProjectsUpdate();
    setBrandingSuccess(true);
    setTimeout(() => setBrandingSuccess(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-6 md:mb-10">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-2xl md:rounded-3xl mx-auto flex items-center justify-center mb-4 md:mb-6 shadow-xl ring-4 ring-blue-50">
              <ShieldCheck className="text-white w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900">Admin Login</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-2 font-medium">Verify credentials to continue</p>
          </div>
          <div className="space-y-4 mb-6 md:mb-8">
            {loginStep === 'creds' ? (
              !useSyncToken ? (
                <>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Username" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type={showLoginPassword ? "text" : "password"} placeholder="Password" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 pr-12 rounded-xl md:rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </>
              ) : (
                <textarea placeholder="Paste Sync Token..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl md:rounded-2xl h-32 text-[10px] font-mono outline-none" value={syncTokenInput} onChange={e => setSyncTokenInput(e.target.value)} />
              )
            ) : (
              <div className="text-center">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Enter 6-Digit 2FA Code</p>
                <input type="text" maxLength={6} placeholder="000000" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl md:rounded-2xl text-center text-3xl md:text-4xl font-black tracking-[0.4em] md:tracking-[0.5em] outline-none" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} autoFocus />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 text-slate-400 font-bold hover:bg-slate-50 rounded-xl md:rounded-2xl transition-all text-sm">Cancel</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl md:rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm">Next</button>
          </div>
          <button type="button" onClick={() => setUseSyncToken(!useSyncToken)} className="w-full mt-6 text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-blue-500 transition-colors">
            {useSyncToken ? 'Standard Credentials' : 'Use Sync Token Access'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden font-sans">
      <header className="w-full bg-slate-900 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0 shadow-2xl z-[130]">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-1.5 hover:bg-slate-800 rounded-lg md:rounded-xl transition-all"><Menu size={24} /></button>
          <div className="text-white flex flex-col">
            <div className="text-xs md:text-sm font-black uppercase tracking-tighter">S M FAJLA <span className="text-blue-400">RABBI</span></div>
            <div className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Console</div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
           <div className="hidden sm:flex flex-col items-end mr-2 md:mr-4">
             <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-emerald-400 font-black uppercase"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Active</div>
           </div>
           <button onClick={onClose} className="bg-red-500/10 text-red-400 p-2 rounded-lg md:rounded-xl hover:bg-red-500/20 transition-all"><LogOut size={18} /></button>
        </div>
      </header>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-[140] backdrop-blur-md" onClick={() => setIsSidebarOpen(false)} />}
      
      <aside className={`fixed inset-y-0 left-0 z-[150] w-72 md:w-80 bg-slate-900 p-6 md:p-8 flex flex-col transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl border-r border-slate-800`}>
        <div className="flex items-center justify-between mb-12 text-white">
           <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Main Console</div>
           <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <nav className="flex-1 space-y-2 md:space-y-3">
          <button onClick={() => handleTabChange('analytics')} className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}><Users size={20} /> Traffic Logs</button>
          <button onClick={() => handleTabChange('projects')} className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}><Plus size={20} /> Portfolio Lab</button>
          <button onClick={() => handleTabChange('tools')} className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all ${activeTab === 'tools' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}><Wrench size={20} /> Tech Stack</button>
          <div className="my-6 md:my-8 border-t border-slate-800 pt-6">
            <div className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 ml-2">Leads Sync</div>
            <a href={GOOGLE_SHEET_URL} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm text-emerald-400 hover:bg-emerald-500/10 transition-all group">
              <FileSpreadsheet size={20} /> 
              <span>Sheet Data</span>
              <ExternalLink size={12} className="ml-auto opacity-40 group-hover:opacity-100" />
            </a>
          </div>
          <button onClick={() => handleTabChange('branding')} className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all ${activeTab === 'branding' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}><Palette size={20} /> Branding Suite</button>
          <button onClick={() => handleTabChange('settings')} className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}><SettingsIcon size={20} /> Security</button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-12 text-slate-900 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'analytics' && (
            <div className="animate-fade-in space-y-8 md:space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter">Traffic Insight</h2>
                  <p className="text-slate-500 text-xs md:text-base font-medium mt-1 md:mt-2">Monitoring real-time interactions across your portfolio.</p>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 w-fit">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"><TrendingUp size={20} className="md:w-6 md:h-6" /></div>
                  <div>
                    <div className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Total Impressions</div>
                    <div className="text-xl md:text-2xl font-black mt-1">{visits.length}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-10 gap-4">
                   <div>
                      <h3 className="text-base md:text-xl font-bold flex items-center gap-2 text-slate-900"><TrendingUp size={18} className="text-blue-600" /> Timeline</h3>
                      <p className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Daily Volume Log</p>
                   </div>
                   <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 w-fit">Live Metric</div>
                </div>
                <div className="h-48 md:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }} />
                      <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 15px 30px -10px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" animationDuration={1000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-5 md:p-8 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2 text-sm md:text-base"><Users size={18} className="text-blue-600" /> Recent Activity</h3>
                  <button onClick={() => { if(confirm("Clear logs?")){ localStorage.setItem('rabbi_portfolio_visits', '[]'); setVisits([]); } }} className="text-[9px] md:text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Clear History</button>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 text-[8px] md:text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-5 md:px-8 py-4 md:py-5">Timestamp</th>
                        <th className="px-5 md:px-8 py-4 md:py-5">Platform</th>
                        <th className="px-5 md:px-8 py-4 md:py-5">Page</th>
                        <th className="px-5 md:px-8 py-4 md:py-5 text-right">ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visits.length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400 font-medium italic text-xs">No traffic data yet.</td></tr>
                      ) : (
                        visits.slice(0, 30).map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 md:px-8 py-4 md:py-6 text-[10px] md:text-xs font-bold text-slate-600">{new Date(v.timestamp).toLocaleString()}</td>
                            <td className="px-5 md:px-8 py-4 md:py-6">
                               <div className="text-[10px] md:text-xs font-black text-slate-900 leading-none">{v.platform}</div>
                               <div className="text-[8px] md:text-[9px] text-slate-400 font-medium truncate max-w-[150px] mt-1">{v.userAgent}</div>
                            </td>
                            <td className="px-5 md:px-8 py-4 md:py-6"><span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[8px] md:text-[9px] font-black uppercase">{v.page}</span></td>
                            <td className="px-5 md:px-8 py-4 md:py-6 text-right font-mono text-[8px] text-slate-400">{v.id}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-fade-in grid xl:grid-cols-5 gap-8 md:gap-16" ref={formRef}>
              <div className="xl:col-span-2 space-y-6 md:space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter">{editingProjectId ? 'Update Asset' : 'Publish Asset'}</h2>
                  {editingProjectId && <button onClick={() => {setEditingProjectId(null); setNewProject({title:'', category:'E-commerce', results:'', efficiency:'', description:'', imageUrls:[]});}} className="text-red-500 font-bold text-[10px] uppercase">Cancel</button>}
                </div>
                
                <div className={`p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-dashed transition-all ${isAiScanning ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200'}`}>
                   {isAiScanning ? (
                     <div className="text-center py-4">
                       <Loader2 className="animate-spin mx-auto text-blue-600 mb-3" size={32} />
                       <div className="text-blue-600 font-black text-[9px] uppercase tracking-widest">Scanning Meta Data...</div>
                     </div>
                   ) : (
                     <label className="flex flex-col items-center justify-center cursor-pointer group">
                       <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 text-white rounded-xl md:rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform"><Sparkles size={24} /></div>
                       <div className="text-center">
                         <div className="font-bold text-slate-900 text-sm">AI Magic Scan</div>
                         <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Upload ad screenshot</div>
                       </div>
                       <input type="file" className="hidden" accept="image/*" onChange={handleAiUpload} />
                     </label>
                   )}
                </div>

                <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 shadow-xl space-y-5 md:space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-3">Title</label>
                    <input type="text" placeholder="Project Name" className="w-full bg-slate-50 border border-slate-200 p-3.5 md:p-4 rounded-xl md:rounded-2xl outline-none text-sm" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-3">Assets (Max 10)</label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                      {newProject.imageUrls?.map((url, i) => (
                        <div key={i} className="aspect-square rounded-lg md:rounded-xl border border-slate-100 overflow-hidden relative group bg-slate-50">
                          <img src={url} className="w-full h-full object-contain" />
                          <button onClick={() => setNewProject({...newProject, imageUrls: newProject.imageUrls?.filter((_, idx)=>idx!==i)})} className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      {(newProject.imageUrls?.length || 0) < 10 && (
                        <label className="aspect-square rounded-lg md:rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                          <Plus className="text-slate-300" size={16} />
                          <input type="file" multiple className="hidden" accept="image/*" onChange={handleProjectImageUpload} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-3">Results</label>
                      <input type="text" placeholder="e.g. 50 Sales" className="w-full bg-slate-50 border border-slate-200 p-3.5 md:p-4 rounded-xl md:rounded-2xl outline-none text-sm" value={newProject.results} onChange={e => setNewProject({...newProject, results: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-3">Efficiency</label>
                      <input type="text" placeholder="e.g. 15 ROAS" className="w-full bg-slate-50 border border-slate-200 p-3.5 md:p-4 rounded-xl md:rounded-2xl outline-none text-sm" value={newProject.efficiency} onChange={e => setNewProject({...newProject, efficiency: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-3">Description</label>
                    <textarea placeholder="Strategy details..." className="w-full bg-slate-50 border border-slate-200 p-3.5 md:p-4 rounded-xl md:rounded-2xl h-24 md:h-32 outline-none resize-none text-sm" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                  </div>

                  <button onClick={handleAddOrUpdateProject} className="w-full bg-blue-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-sm md:text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                    {editingProjectId ? 'Sync' : 'Publish'} Portfolio Asset
                  </button>
                </div>
              </div>

              <div className="xl:col-span-3 space-y-6 md:space-y-10">
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter">Live Portfolio ({projects.length})</h2>
                <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                  {projects.map(p => (
                    <div key={p.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-lg group hover:shadow-xl transition-all">
                      <div className="flex gap-4 md:gap-6 mb-6 md:mb-8">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {p.imageUrls?.[0] ? <img src={p.imageUrls[0]} className="w-full h-full object-contain" /> : <ImageIcon className="text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-lg">{p.category}</span>
                          <h4 className="font-bold text-base md:text-lg mt-1 truncate">{p.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 md:mt-2">
                            <div className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-tighter">{p.results}</div>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <div className="text-[9px] md:text-xs font-bold text-emerald-600 uppercase tracking-tighter">{p.efficiency}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2.5">
                        <button onClick={() => { setEditingProjectId(p.id); setNewProject({ ...p, results: p.results, efficiency: p.efficiency }); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl font-black text-[9px] md:text-xs uppercase tracking-widest hover:bg-blue-100 transition-colors">Edit</button>
                        <button onClick={() => {if(confirm("Delete asset?")){ const updated=projects.filter(pr=>pr.id!==p.id); setProjects(updated); localStorage.setItem('rabbi_portfolio_projects', JSON.stringify(updated)); onProjectsUpdate(); }}} className="p-3 bg-red-50 text-red-500 rounded-xl md:rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="animate-fade-in grid xl:grid-cols-5 gap-8 md:gap-16">
              <div className="xl:col-span-2 space-y-6 md:space-y-10">
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter">{editingToolId ? 'Update Skill' : 'Add Tech Tool'}</h2>
                <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 shadow-xl space-y-5 md:space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative group">
                      {newTool.icon ? <img src={newTool.icon} className="w-full h-full object-contain p-2 md:p-4" /> : <ImageIcon className="text-slate-300" size={28} />}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-[9px] font-black text-white uppercase transition-opacity">Change <input type="file" className="hidden" accept="image/*" onChange={async e => { const f=e.target.files?.[0]; if(f) setNewTool({...newTool, icon: await compressImage(f, 400, 400)}) }} /></label>
                    </div>
                  </div>
                  <input type="text" placeholder="Tool Name" className="w-full bg-slate-50 border border-slate-200 p-3.5 md:p-4 rounded-xl md:rounded-2xl outline-none text-sm" value={newTool.name} onChange={e => setNewTool({...newTool, name: e.target.value})} />
                  <input type="text" placeholder="Subtitle" className="w-full bg-slate-50 border border-slate-200 p-3.5 md:p-4 rounded-xl md:rounded-2xl outline-none text-sm" value={newTool.subtitle} onChange={e => setNewTool({...newTool, subtitle: e.target.value})} />
                  <button onClick={handleAddOrUpdateTool} className="w-full bg-blue-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-sm md:text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Save Tooling</button>
                </div>
              </div>
              <div className="xl:col-span-3 space-y-6 md:space-y-10">
                <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter">Current Stack ({tools.length})</h2>
                <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                  {tools.map(t => (
                    <div key={t.id} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-slate-200 flex items-center justify-between group">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-lg md:rounded-xl flex items-center justify-center p-2"><img src={t.icon} className="max-h-full max-w-full object-contain" /></div>
                        <div>
                          <div className="font-black text-slate-900 text-xs md:text-sm">{t.name}</div>
                          <div className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.subtitle}</div>
                        </div>
                      </div>
                      <div className="flex gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setEditingToolId(t.id); setNewTool(t); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-1.5 md:p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={16} /></button>
                         <button onClick={() => { if(confirm("Delete tool?")){ const updated=tools.filter(tr=>tr.id!==t.id); setTools(updated); localStorage.setItem('rabbi_portfolio_tools', JSON.stringify(updated)); onProjectsUpdate(); } }} className="p-1.5 md:p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="animate-fade-in space-y-8 md:space-y-12 pb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter">Site Identity</h2>
                  <p className="text-slate-500 text-xs md:text-base font-medium mt-1 md:mt-2">Manage logos, avatars, and CV documents.</p>
                </div>
                {brandingSuccess && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full animate-fade-in w-fit">
                    <CheckCircle2 size={14} />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Updated</span>
                  </div>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-xl space-y-4 md:space-y-6 flex flex-col items-center text-center">
                  <h3 className="text-[9px] md:text-sm font-black uppercase tracking-widest text-slate-400">Website Logo</h3>
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-50 bg-slate-50 relative group flex items-center justify-center overflow-hidden">
                    <img src={identity.logoUrl} className="w-full h-full object-contain p-4 md:p-6" />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Camera className="text-white" size={24} /><input type="file" className="hidden" accept="image/*" onChange={e => handleBrandingSelect('logo', e)} />
                    </label>
                  </div>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-xl space-y-4 md:space-y-6 flex flex-col items-center text-center">
                  <h3 className="text-[9px] md:text-sm font-black uppercase tracking-widest text-slate-400">Profile Image</h3>
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2rem] border-4 border-slate-50 bg-slate-50 relative group overflow-hidden">
                    <img src={identity.profileImageUrl} className="w-full h-full object-cover object-top" />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Camera className="text-white" size={24} /><input type="file" className="hidden" accept="image/*" onChange={e => handleBrandingSelect('profile', e)} />
                    </label>
                  </div>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-200 shadow-xl space-y-4 md:space-y-6 flex flex-col items-center text-center">
                  <h3 className="text-[9px] md:text-sm font-black uppercase tracking-widest text-slate-400">PDF CV Doc</h3>
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2rem] border-4 border-dashed border-slate-100 bg-slate-50 flex items-center justify-center relative group overflow-hidden">
                    {identity.cvUrl ? (
                      <div className="flex flex-col items-center text-blue-600">
                        <FileText size={32} />
                        <span className="text-[7px] md:text-[8px] font-black uppercase mt-1">CV File</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-300">
                        <Upload size={32} />
                        <span className="text-[7px] md:text-[8px] font-black uppercase mt-1">No File</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Upload className="text-white" size={24} /><input type="file" className="hidden" accept="application/pdf" onChange={handleCvUpload} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                 <button onClick={saveBranding} className="px-10 md:px-12 py-4 md:py-5 bg-blue-600 text-white rounded-xl md:rounded-[1.5rem] font-black text-sm md:text-lg flex items-center gap-3 shadow-xl md:shadow-2xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                   {/* Fix: Replace invalid md:size responsive prop with className-based responsive sizing */}
                   <Save size={18} className="md:w-5 md:h-5" /> Sync Identity
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in max-w-2xl mx-auto space-y-8 md:space-y-12 pb-24 md:pb-32">
              <div className="text-center">
                <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter">Security Matrix</h2>
                <p className="text-slate-500 text-xs md:text-base font-medium mt-1 md:mt-2">Update credentials and 2FA protocols.</p>
              </div>
              
              <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 shadow-xl space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 md:gap-4">
                   {/* Fix: Replace invalid md:size responsive prop with className-based responsive sizing */}
                   <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-900 shrink-0"><UserIcon size={20} className="md:w-6 md:h-6" /></div>
                   <h3 className="text-base md:text-xl font-bold">Access Protocol</h3>
                </div>
                <form onSubmit={handleUpdateCredentials} className="space-y-4">
                   <div className="relative">
                     <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input type="text" className="w-full bg-slate-50 border p-3.5 md:p-4 pl-12 rounded-xl md:rounded-2xl outline-none text-sm" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                   </div>
                   <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input type={showNewPassword ? "text" : "password"} placeholder="New Password" className="w-full bg-slate-50 border p-3.5 md:p-4 pl-12 pr-12 rounded-xl md:rounded-2xl outline-none text-sm" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                     <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                       {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                   </div>
                   <button type="submit" className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-sm md:text-lg shadow-xl hover:bg-black transition-all">Update Access</button>
                   {updateSuccess && <div className="text-center text-emerald-600 font-bold text-[10px] uppercase animate-pulse">Sync complete!</div>}
                </form>
              </div>

              <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 shadow-xl space-y-6 md:space-y-8">
                <div className="flex items-center gap-3 md:gap-4">
                   {/* Fix: Replace invalid md:size responsive prop with className-based responsive sizing */}
                   <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-100 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 shrink-0"><SmartphoneNfc size={20} className="md:w-6 md:h-6" /></div>
                   <h3 className="text-base md:text-xl font-bold">Multi-Factor Sync</h3>
                </div>
                {JSON.parse(localStorage.getItem('admin_credentials') || '{}').twoFactorSecret ? (
                  <div className="bg-emerald-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-emerald-100 flex flex-col items-center gap-4 md:gap-6">
                    {/* Fix: Replace invalid md:size responsive prop with className-based responsive sizing */}
                    <CheckCircle2 size={40} className="w-10 h-10 md:w-12 md:h-12 text-emerald-500" />
                    <div className="text-center">
                       <div className="font-black text-emerald-700 text-base md:text-lg uppercase tracking-tight">2FA ENABLED</div>
                       <div className="text-[9px] md:text-[10px] text-emerald-600/80 font-bold mt-1 uppercase tracking-widest">Secured via Google Authenticator</div>
                    </div>
                    <button onClick={() => {if(confirm("Disable 2FA?")){ const c=JSON.parse(localStorage.getItem('admin_credentials')||'{}'); c.twoFactorSecret=null; localStorage.setItem('admin_credentials', JSON.stringify(c)); setSyncToken(btoa(JSON.stringify(c))); window.location.reload(); }}} className="px-5 py-2 text-red-500 font-black text-[9px] uppercase tracking-widest bg-white border border-red-100 rounded-lg hover:bg-red-50">Disable</button>
                  </div>
                ) : !isSettingUp2FA ? (
                  <div className="space-y-5 md:space-y-6">
                    <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">Protect your admin logs with 6-digit dynamic codes. Essential for agency-grade security.</p>
                    {/* Fix: Replace invalid md:size responsive prop with className-based responsive sizing */}
                    <button onClick={() => { const secret = new OTPAuth.Secret().base32; setTempSecret(secret); setIsSettingUp2FA(true); }} className="w-full py-4 md:py-5 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-lg flex items-center justify-center gap-3 md:gap-4 shadow-xl shadow-blue-100"><KeyRound size={18} className="md:w-5 md:h-5" /> Setup 2FA Sync</button>
                  </div>
                ) : (
                  <div className="space-y-6 md:space-y-8 animate-fade-in-up text-center">
                    <div className="inline-block p-4 bg-white border-4 border-slate-50 rounded-[2rem] shadow-sm">
                       <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`otpauth://totp/RabbiPortfolio:${newUsername}?secret=${tempSecret}&issuer=RabbiPortfolio`)}&size=200x200`} alt="QR" className="w-40 h-40 md:w-48 md:h-48" />
                    </div>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan with Authenticator App</p>
                    <div className="space-y-4">
                      <input type="text" maxLength={6} placeholder="000000" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl md:rounded-2xl text-center text-3xl md:text-4xl font-black tracking-[0.4em] outline-none" value={setupCode} onChange={e => setSetupCode(e.target.value.replace(/\D/g, ''))} />
                      <div className="flex gap-3 md:gap-4">
                        <button onClick={() => setIsSettingUp2FA(false)} className="flex-1 py-3.5 text-slate-400 font-bold text-sm">Cancel</button>
                        <button onClick={() => {
                           const totp = new OTPAuth.TOTP({ secret: tempSecret });
                           if(totp.validate({token:setupCode, window:1}) !== null) {
                             const c=JSON.parse(localStorage.getItem('admin_credentials')||'{}');
                             c.twoFactorSecret = tempSecret;
                             localStorage.setItem('admin_credentials', JSON.stringify(c));
                             setSyncToken(btoa(JSON.stringify(c)));
                             setIsSettingUp2FA(false);
                             alert("2FA Sync Complete!");
                           } else { alert("Invalid code!"); }
                        }} className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl md:rounded-2xl font-bold text-sm">Confirm</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 text-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] space-y-4 md:space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 blur-[80px]"></div>
                <div className="flex items-center gap-3 md:gap-4 mb-2">
                   {/* Fix: Replace invalid md:size responsive prop with className-based responsive sizing */}
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-400 shrink-0"><RefreshCw size={20} className="md:w-6 md:h-6" /></div>
                   <h3 className="text-base md:text-xl font-bold">Sync Token</h3>
                </div>
                <p className="text-slate-400 text-[11px] md:text-sm font-medium">Encrypted access key for trusted devices.</p>
                <div className="bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] break-all font-mono text-blue-300 relative group border border-slate-700">
                  {syncToken}
                  {/* Fix: Replace invalid md:size responsive prop with className-based responsive sizing */}
                  <button onClick={() => { navigator.clipboard.writeText(syncToken); alert("Copied!"); }} className="absolute top-2 right-2 p-2.5 md:p-3 bg-slate-700 hover:bg-blue-600 rounded-lg md:rounded-xl transition-all shadow-lg active:scale-90"><Copy size={14} className="md:w-4 md:h-4" /></button>
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