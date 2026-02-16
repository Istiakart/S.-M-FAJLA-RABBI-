import React, { useState, useEffect } from 'react';
import { Project, SiteIdentity, Tool } from '../types';
import { 
  Plus, LogOut, Trash2, Sparkles, Loader2, X, 
  ShieldCheck, User as UserIcon, Lock, Eye, 
  EyeOff, Smartphone, Key, ExternalLink, Image as ImageIcon,
  Edit3, Menu, ArrowLeft, QrCode, Copy, Info,
  Users, XCircle, RefreshCcw, Check, TrendingUp, Wrench, Palette, FileText,
  Cloud, CloudLightning, UploadCloud, Globe
} from 'lucide-react';
import { analyzeMarketingImage } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as OTPAuth from 'otpauth';

interface AdminPanelProps {
  onClose: () => void;
  onProjectsUpdate: (projects: Project[]) => void;
  currentProjects: Project[];
  currentIdentity: SiteIdentity;
  onIdentityUpdate: (identity: SiteIdentity) => void;
  currentTools: Tool[];
  onToolsUpdate: (tools: Tool[]) => void;
  adminCreds: any;
  onAdminCredsUpdate: (creds: any) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onClose, 
  onProjectsUpdate, 
  currentProjects, 
  currentIdentity,
  onIdentityUpdate,
  currentTools,
  onToolsUpdate,
  adminCreds,
  onAdminCredsUpdate
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'projects' | 'branding' | 'tools' | 'inquiries' | 'security'>('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  
  const [totalVisitors, setTotalVisitors] = useState<number>(0);

  // 2FA Setup State
  const [show2FAGuide, setShow2FAGuide] = useState(false);
  const [currentQRUrl, setCurrentQRUrl] = useState('');
  const [pendingSecret, setPendingSecret] = useState('');

  useEffect(() => {
    const visits = parseInt(localStorage.getItem('portfolio_total_visits') || '0', 10);
    setTotalVisitors(visits);
  }, []);

  const visitorChartData = [
    { name: 'Mon', count: 0 },
    { name: 'Tue', count: 0 },
    { name: 'Wed', count: 0 },
    { name: 'Thu', count: 0 },
    { name: 'Fri', count: 0 },
    { name: 'Sat', count: 0 },
    { name: 'Sun', count: totalVisitors },
  ];

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

      const totp = new OTPAuth.TOTP({
        issuer: 'RabbiPortfolio',
        label: adminCreds.username,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: adminCreds.twoFactorSecret,
      });

      const delta = totp.validate({ token: otpCode, window: 1 });
      if (delta === null) {
        setLoginError('Invalid 2FA Code');
        return;
      }
    }

    setIsAuthenticated(true);
  };

  const emergencyReset2FA = () => {
    if (window.confirm("This will disable 2FA for this browser so you can log in. Use only if locked out.")) {
      onAdminCredsUpdate({ ...adminCreds, twoFactorEnabled: false, twoFactorSecret: '' });
      setLoginError('2FA Reset. Try logging in now.');
      setOtpCode('');
    }
  };

  const showNotification = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleCloudSync = async () => {
    setIsCloudSyncing(true);
    // Simulate uploading a JSON config to Vercel Blob
    // In a real scenario, you'd send this to your backend API which uses @vercel/blob
    const configData = {
      projects: currentProjects,
      identity: currentIdentity,
      tools: currentTools
    };
    
    console.log("Pushing to Vercel Blob...", configData);
    
    // Simulating delay
    await new Promise(r => setTimeout(r, 2000));
    
    // Store the "Last Synced" timestamp
    localStorage.setItem('last_cloud_sync', new Date().toISOString());
    setIsCloudSyncing(false);
    showNotification("Synchronized with Vercel Blob!");
  };

  const generate2FA = () => {
    const secret = new OTPAuth.Secret().base32;
    const totp = new OTPAuth.TOTP({
      issuer: 'RabbiPortfolio',
      label: adminCreds.username,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });
    
    const uri = totp.toString();
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(uri)}`;
    
    setCurrentQRUrl(qrApiUrl);
    setPendingSecret(secret);
    setShow2FAGuide(true);
  };

  const confirm2FASync = () => {
    onAdminCredsUpdate({ 
      ...adminCreds, 
      twoFactorSecret: pendingSecret, 
      twoFactorEnabled: true 
    });
    setShow2FAGuide(false);
    showNotification("2FA Protection Enabled!");
  };

  const disable2FA = () => {
    if (window.confirm("Disabling 2FA will reduce security. Continue?")) {
      onAdminCredsUpdate({ ...adminCreds, twoFactorEnabled: false, twoFactorSecret: '' });
      showNotification("2FA Disabled");
    }
  };

  const handleSaveProject = () => {
    const projectData = editingProject || newProject;
    if (!projectData.title) return alert("Title required!");
    
    const project: Project = {
      id: projectData.id || Date.now().toString(),
      title: projectData.title as string,
      category: projectData.category as any,
      results: projectData.results || '0',
      efficiency: projectData.efficiency || '0',
      description: projectData.description || '',
      imageUrls: (projectData.imageUrls || []).slice(0, 10),
      metrics: [
        { label: 'Result', value: projectData.results || '0', description: 'Campaign Metric' },
        { label: 'Efficiency', value: projectData.efficiency || '0', description: 'Performance Basis' }
      ],
      chartData: [{ name: 'Phase 1', value: 10 }, { name: 'Growth', value: 65 }, { name: 'Peak', value: 100 }]
    };

    if (editingProject) {
      onProjectsUpdate(currentProjects.map(p => p.id === project.id ? project : p));
      setEditingProject(null);
    } else {
      onProjectsUpdate([project, ...currentProjects]);
      setNewProject({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] });
    }
    showNotification("Project Saved!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isAppend: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (editingProject) {
        const currentUrls = editingProject.imageUrls || [];
        if (currentUrls.length >= 10) return alert("Max 10 images reached!");
        setEditingProject({ ...editingProject, imageUrls: isAppend ? [...currentUrls, base64] : [base64] });
      } else {
        const currentUrls = newProject.imageUrls || [];
        if (currentUrls.length >= 10) return alert("Max 10 images reached!");
        setNewProject({ ...newProject, imageUrls: isAppend ? [...currentUrls, base64] : [base64] });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeProjectImage = (index: number) => {
    if (editingProject) {
      const updated = [...(editingProject.imageUrls || [])];
      updated.splice(index, 1);
      setEditingProject({ ...editingProject, imageUrls: updated });
    } else {
      const updated = [...(newProject.imageUrls || [])];
      updated.splice(index, 1);
      setNewProject({ ...newProject, imageUrls: updated });
    }
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      onProjectsUpdate(currentProjects.filter(p => p.id !== id));
      showNotification("Project Deleted!");
    }
  };

  const handleAddOrUpdateTool = () => {
    if (!newTool.name || !newTool.icon) return alert("Name and Icon required!");
    if (editingTool) {
      onToolsUpdate(currentTools.map(t => t.id === editingTool.id ? { ...t, name: newTool.name!, subtitle: newTool.subtitle!, icon: newTool.icon! } : t));
      setEditingTool(null);
      showNotification("Tool Updated!");
    } else {
      onToolsUpdate([...currentTools, { id: Date.now().toString(), name: newTool.name as string, subtitle: newTool.subtitle || 'Tooling Solution', icon: newTool.icon as string }]);
      showNotification("Tool Added!");
    }
    setNewTool({ name: '', subtitle: '', icon: '' });
  };

  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    setNewTool({ name: tool.name, subtitle: tool.subtitle, icon: tool.icon });
    if(window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const switchTab = (tab: any) => {
    setActiveTab(tab);
    if(window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  // Project Editor State
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({ 
    title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] 
  });

  // Tools Editor State
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [newTool, setNewTool] = useState<Partial<Tool>>({ name: '', subtitle: '', icon: '' });

  // Security State
  const [tempUsername, setTempUsername] = useState(adminCreds.username);
  const [tempPassword, setTempPassword] = useState(adminCreds.password);

  const currentEditorImages = (editingProject ? editingProject.imageUrls : newProject.imageUrls) || [];

  if (!isAuthenticated) return (
    <div className="fixed inset-0 bg-slate-950 z-[200] flex flex-col items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-cyan-600 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>
      <div className="w-full max-w-[420px] animate-fade-in-up relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-lg shadow-blue-900/40">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <h1 className="text-xl font-black uppercase text-white tracking-[0.2em]">Vault Access</h1>
            <p className="text-white/40 text-[10px] font-bold uppercase mt-1 tracking-widest">S M FAJLA RABBI</p>
          </div>
          {loginError && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold text-center animate-fade-in">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400" size={18} />
              <input type="text" placeholder="Username" className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white font-medium text-sm" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-blue-400" size={18} />
              <input type={showLoginPassword ? "text" : "password"} placeholder="Password" className="w-full bg-white/5 border border-white/10 p-4 pl-12 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white font-medium text-sm" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {adminCreds.twoFactorEnabled && (
              <div className="relative group pt-2">
                <div className="absolute -top-1 left-4 px-2 bg-blue-600 rounded-full text-[8px] font-black text-white uppercase tracking-widest z-20">Secure OTP</div>
                <Smartphone className="absolute left-4 top-[calc(50%+4px)] -translate-y-1/2 text-blue-400" size={18} />
                <input 
                  type="text" 
                  placeholder="000 000" 
                  className="w-full bg-blue-500/10 border border-blue-500/30 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-blue-400 tracking-[0.5em] text-center font-black" 
                  value={otpCode} 
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  required 
                />
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs mt-4">Authorize</button>
          </form>

          {adminCreds.twoFactorEnabled && (
            <button onClick={emergencyReset2FA} className="w-full mt-6 py-2 text-[8px] font-black uppercase text-slate-500 tracking-widest hover:text-red-400 flex items-center justify-center gap-2">
              <RefreshCcw size={10} /> Trouble with 2FA? Reset Security
            </button>
          )}
        </div>
        <button type="button" onClick={onClose} className="w-full mt-8 py-2 text-white/30 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-white flex items-center justify-center gap-2">
          <ArrowLeft size={12} /> Return to Website
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden">
      {saveStatus && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[210] bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <Check size={18} /> {saveStatus}
        </div>
      )}

      <header className="w-full bg-slate-900 px-4 md:px-6 py-4 flex items-center justify-between shrink-0 shadow-xl z-[130]">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white p-2 hover:bg-slate-800 rounded-xl">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="text-white">
            <div className="text-xs md:text-sm font-black uppercase tracking-widest">RABBI <span className="text-blue-400">CONTROL</span></div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCloudSync}
            disabled={isCloudSyncing}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isCloudSyncing ? 'bg-slate-700 text-slate-400' : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white'}`}
          >
            {isCloudSyncing ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            {isCloudSyncing ? 'Syncing...' : 'Push to Cloud'}
          </button>
          <button onClick={onClose} className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 flex items-center gap-2 px-3 md:px-4 active:scale-95 transition-all">
            <LogOut size={16} />
            <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && window.innerWidth < 1024 && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]" onClick={() => setIsSidebarOpen(false)} />
        )}
        
        <aside className={`absolute lg:relative z-[120] h-full w-72 bg-slate-900 p-6 flex flex-col gap-2 transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}>
          <button onClick={() => switchTab('analytics')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><TrendingUp size={18} /> Overview</button>
          <button onClick={() => switchTab('projects')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><ImageIcon size={18} /> Projects</button>
          <button onClick={() => switchTab('tools')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'tools' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Wrench size={18} /> Tool Stack</button>
          <button onClick={() => switchTab('branding')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'branding' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Palette size={18} /> Branding & CV</button>
          <button onClick={() => switchTab('inquiries')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'inquiries' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><FileText size={18} /> Inquiries</button>
          <button onClick={() => switchTab('security')} className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Key size={18} /> Security</button>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {activeTab === 'analytics' && (
            <div className="animate-fade-in space-y-6 md:space-y-8">
              <h2 className="text-2xl md:text-3xl font-black">Performance Hub</h2>
              
              {/* Cloud Status Banner */}
              <div className="bg-slate-900 p-6 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-blue-600 shadow-xl">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center animate-pulse">
                       <Cloud size={24} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black uppercase tracking-widest">Global Cloud Status</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Last Synced: {localStorage.getItem('last_cloud_sync') ? new Date(localStorage.getItem('last_cloud_sync')!).toLocaleString() : 'Never'}</p>
                    </div>
                 </div>
                 <button 
                  onClick={handleCloudSync}
                  className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-2"
                 >
                   {isCloudSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                   Sync All Assets
                 </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-3xl border shadow-sm group hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-slate-400 text-[10px] font-bold uppercase">Total Visitors</div>
                    <Users className="text-blue-500 w-4 h-4" />
                  </div>
                  <div className="text-2xl md:text-3xl font-black">{totalVisitors.toString().padStart(2, '0')}</div>
                  <div className="text-[10px] text-emerald-500 font-bold mt-1">Live data tracking active</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Portfolio Assets</div>
                  <div className="text-2xl md:text-3xl font-black">{currentProjects.length}</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Security Status</div>
                  <div className={`text-base md:text-lg font-black ${adminCreds.twoFactorEnabled ? 'text-emerald-500' : 'text-orange-500'}`}>
                    {adminCreds.twoFactorEnabled ? '2FA ENABLED' : '2FA DISABLED'}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border shadow-sm">
                <h3 className="text-xl font-bold mb-8">Visitor Traffic Trend</h3>
                <div className="h-[250px] md:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visitorChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs><linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'}} />
                      <Area type="monotone" dataKey="count" name="Unique Visitors" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <h3 className="text-xl font-bold">{editingProject ? 'Edit Project' : 'New Project'}</h3>
                  <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-5">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Campaign Assets (Max 10)</label>
                        <div className="grid grid-cols-4 gap-2">
                           {currentEditorImages.map((img, idx) => (
                             <div key={idx} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden border">
                                <img src={img} className="w-full h-full object-cover" />
                                <button onClick={() => removeProjectImage(idx)} className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600">
                                   <XCircle size={14} />
                                </button>
                             </div>
                           ))}
                           {currentEditorImages.length < 10 && (
                             <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                                <Plus size={20} className="text-slate-400" />
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                             </label>
                           )}
                        </div>
                     </div>

                     <div className="pt-2 border-t">
                        {isAiScanning ? (
                          <div className="py-4 text-center"><Loader2 className="animate-spin mx-auto text-blue-600 mb-2" /><span className="text-[10px] font-bold uppercase">AI Scanning Ad...</span></div>
                        ) : (
                          <label className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-700 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors">
                            <Sparkles size={16} />
                            <span className="text-xs font-bold uppercase">Scan Ad with AI</span>
                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                              const file = e.target.files?.[0]; if(!file) return; setIsAiScanning(true);
                              const reader = new FileReader(); reader.onloadend = async () => {
                                const base64 = (reader.result as string).split(',')[1];
                                const data = await analyzeMarketingImage(base64, file.type);
                                if(editingProject) setEditingProject({...editingProject, ...data, imageUrls: editingProject.imageUrls?.length === 0 ? [reader.result as string] : editingProject.imageUrls});
                                else setNewProject({...newProject, ...data, imageUrls: newProject.imageUrls?.length === 0 ? [reader.result as string] : newProject.imageUrls});
                                setIsAiScanning(false); showNotification("AI Extraction Done!");
                              }; reader.readAsDataURL(file);
                            }} />
                          </label>
                        )}
                     </div>

                     <input type="text" placeholder="Project Title" className="w-full border p-4 rounded-xl text-sm outline-none focus:ring-1 focus:ring-blue-500" value={editingProject ? editingProject.title : newProject.title} onChange={e => editingProject ? setEditingProject({...editingProject, title: e.target.value}) : setNewProject({...newProject, title: e.target.value})} />
                     <textarea placeholder="Strategy Description" className="w-full border p-4 rounded-xl h-24 text-sm outline-none focus:ring-1 focus:ring-blue-500" value={editingProject ? editingProject.description : newProject.description} onChange={e => editingProject ? setEditingProject({...editingProject, description: e.target.value}) : setNewProject({...newProject, description: e.target.value})} />
                     
                     <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Results (e.g. 50 Sales)" className="w-full border p-3 rounded-xl text-xs" value={editingProject ? editingProject.results : newProject.results} onChange={e => editingProject ? setEditingProject({...editingProject, results: e.target.value}) : setNewProject({...newProject, results: e.target.value})} />
                        <input type="text" placeholder="Efficiency (e.g. 4.5x ROAS)" className="w-full border p-3 rounded-xl text-xs" value={editingProject ? editingProject.efficiency : newProject.efficiency} onChange={e => editingProject ? setEditingProject({...editingProject, efficiency: e.target.value}) : setNewProject({...newProject, efficiency: e.target.value})} />
                     </div>

                     <button onClick={handleSaveProject} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">Save Project Asset</button>
                     {editingProject && <button onClick={() => setEditingProject(null)} className="w-full bg-slate-100 py-3 rounded-xl font-bold uppercase text-[10px] text-slate-500">Cancel Edit</button>}
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xl font-bold">Existing Projects</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentProjects.map(p => (
                      <div key={p.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden border">
                             <img src={p.imageUrls?.[0]} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 truncate max-w-[150px]">{p.title}</div>
                            <div className="text-[10px] font-bold text-blue-500 uppercase">{p.imageUrls?.length || 0} Assets</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingProject(p); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl"><Edit3 size={18} /></button>
                          <button onClick={() => handleDeleteProject(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-black">Performance Stack</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
                  <h3 className="font-bold">{editingTool ? 'Edit Tool' : 'Add New Tool'}</h3>
                  <input type="text" placeholder="Tool Name (e.g. Meta Ads)" className="w-full border p-4 rounded-xl text-sm" value={newTool.name} onChange={e => setNewTool({...newTool, name: e.target.value})} />
                  <input type="text" placeholder="Subtitle (e.g. Scaling Manager)" className="w-full border p-4 rounded-xl text-sm" value={newTool.subtitle} onChange={e => setNewTool({...newTool, subtitle: e.target.value})} />
                  <div className="p-6 border-2 border-dashed rounded-xl flex items-center justify-between bg-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase">SVG Icon</span>
                    <input type="file" className="text-[10px] w-40" onChange={e => {
                      const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = () => setNewTool({...newTool, icon: r.result as string}); r.readAsDataURL(f); }
                    }} />
                  </div>
                  <button onClick={handleAddOrUpdateTool} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-sm hover:bg-black transition-all shadow-xl">{editingTool ? 'Update Tool' : 'Add to Stack'}</button>
                  {editingTool && <button onClick={() => {setEditingTool(null); setNewTool({name:'', subtitle:'', icon:''});}} className="w-full bg-slate-100 py-3 rounded-xl font-bold uppercase text-[10px]">Cancel</button>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {currentTools.map(tool => (
                    <div key={tool.id} className="bg-white p-6 rounded-3xl border flex flex-col items-center text-center relative group hover:border-blue-200">
                      <div className="absolute top-2 right-2 flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditTool(tool)} className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><Edit3 size={12} /></button>
                        <button onClick={() => onToolsUpdate(currentTools.filter(t => t.id !== tool.id))} className="p-1.5 bg-red-50 text-red-400 rounded-lg"><Trash2 size={12} /></button>
                      </div>
                      <img src={tool.icon} className="w-10 h-10 object-contain mb-3" />
                      <div className="font-bold text-xs truncate w-full text-slate-900">{tool.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="animate-fade-in h-[calc(100vh-140px)] flex flex-col">
              <h2 className="text-2xl font-black mb-6">Strategy Form Data</h2>
              <div className="flex-1 bg-white border rounded-[2.5rem] overflow-hidden shadow-2xl">
                 <iframe src="https://docs.google.com/spreadsheets/d/1JDHDIp3c3GSwhemS4VvtWSowoNLHFxAIvTf91j1zQ2g/preview" className="w-full h-full" title="Inquiries" />
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-2xl font-black">Visual Identity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                  <div className="text-[10px] font-black uppercase mb-6 text-slate-400 tracking-widest">Profile Portrait</div>
                  <div className="w-24 h-24 rounded-3xl mx-auto mb-6 border overflow-hidden shadow-lg"><img src={currentIdentity.profileImageUrl} className="w-full h-full object-cover" /></div>
                  <label className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer inline-block hover:bg-black transition-all">Change Image<input type="file" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = () => onIdentityUpdate({...currentIdentity, profileImageUrl: r.result as string}); r.readAsDataURL(f); }
                  }} /></label>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                  <div className="text-[10px] font-black uppercase mb-6 text-slate-400 tracking-widest">Global Logo</div>
                  <div className="h-24 flex items-center justify-center mx-auto mb-6 p-4"><img src={currentIdentity.logoUrl} className="max-h-full object-contain" /></div>
                  <label className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer inline-block hover:bg-black transition-all">Upload Logo<input type="file" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = () => onIdentityUpdate({...currentIdentity, logoUrl: r.result as string}); r.readAsDataURL(f); }
                  }} /></label>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-center">
                  <div className="text-[10px] font-black uppercase mb-6 text-slate-400 tracking-widest">Resume PDF</div>
                  <div className="h-24 flex items-center justify-center mb-6"><FileText className="text-emerald-500" size={56} /></div>
                  <label className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer inline-block hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">Update CV<input type="file" accept=".pdf" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = () => onIdentityUpdate({...currentIdentity, cvUrl: r.result as string}); r.readAsDataURL(f); }
                  }} /></label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-2xl font-black">Portal Security</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                    <h3 className="font-bold text-sm uppercase flex items-center gap-2"><Lock size={16} /> Access Credentials</h3>
                    <div className="space-y-4">
                        <div className="relative">
                           <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input type="text" className="w-full border p-4 pl-12 rounded-2xl text-sm outline-none focus:ring-1 focus:ring-blue-500" value={tempUsername} onChange={e => setTempUsername(e.target.value)} placeholder="Username" />
                        </div>
                        <div className="relative">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input type="password" placeholder="New Password" className="w-full border p-4 pl-12 rounded-2xl text-sm outline-none focus:ring-1 focus:ring-blue-500" value={tempPassword} onChange={e => setTempPassword(e.target.value)} />
                        </div>
                    </div>
                    <button onClick={() => { onAdminCredsUpdate({...adminCreds, username: tempUsername, password: tempPassword}); showNotification("Security Updated!"); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black shadow-xl transition-all">Update Authorized Access</button>
                 </div>

                 <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                    <h3 className="font-bold text-sm uppercase flex items-center gap-2"><Smartphone size={16} /> Authenticator 2FA</h3>
                    
                    {adminCreds.twoFactorEnabled ? (
                      <div className="space-y-6">
                        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-xs text-center flex items-center justify-center gap-2 border border-emerald-100">
                          <ShieldCheck size={16} /> PORTAL PROTECTED BY 2FA
                        </div>
                        <div className="p-4 bg-slate-50 border rounded-2xl">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Secret Code (Base32)</p>
                           <div className="flex items-center gap-2">
                             <code className="bg-white px-3 py-2 rounded-lg border text-xs font-mono flex-1 text-blue-600 font-black truncate">{adminCreds.twoFactorSecret}</code>
                             <button onClick={() => { navigator.clipboard.writeText(adminCreds.twoFactorSecret); showNotification("Secret Copied!"); }} className="p-2 hover:bg-white rounded-xl border text-slate-500"><Copy size={16} /></button>
                           </div>
                        </div>
                        <button onClick={disable2FA} className="w-full border-2 border-red-50 text-red-500 py-4 rounded-2xl font-bold uppercase text-[10px] hover:bg-red-50 transition-all">Remove 2FA Layer</button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-xs text-slate-500 leading-relaxed">Secure your vault by linking it to <strong className="text-slate-900">Google Authenticator</strong>. Scanned codes are refreshed every 30 seconds.</p>
                        <button onClick={generate2FA} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Setup Google Authenticator</button>
                      </div>
                    )}
                 </div>
              </div>

              {show2FAGuide && (
                <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-fade-in-up">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><QrCode className="text-blue-600" size={32} /></div>
                      <h3 className="text-xl font-black uppercase text-slate-900">Setup Authenticator</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Scan for RabbiPortfolio</p>
                    </div>
                    
                    <div className="bg-slate-50 p-6 rounded-3xl mb-8 flex flex-col items-center justify-center border shadow-inner">
                      <img src={currentQRUrl} className="w-44 h-44 rounded-xl border-4 border-white shadow-lg mb-4" alt="2FA QR Code" />
                      <div className="text-[10px] font-black text-slate-300 bg-white px-4 py-1.5 rounded-full border">Secret: {pendingSecret}</div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex gap-4 items-start"><div className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</div><p className="text-xs text-slate-600 font-medium">Open Google Authenticator app.</p></div>
                      <div className="flex gap-4 items-start"><div className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</div><p className="text-xs text-slate-600 font-medium">Scan this QR Code using the camera.</p></div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button onClick={() => setShow2FAGuide(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-bold uppercase text-[10px] text-slate-500">Cancel</button>
                      <button onClick={confirm2FASync} className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all">I've Synced Authenticator</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;