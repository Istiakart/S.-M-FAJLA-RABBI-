
import React, { useState, useEffect } from 'react';
import { Project, SiteIdentity, Tool } from '../types';
import { 
  Plus, LogOut, Trash2, Sparkles, Loader2, X, 
  Settings as SettingsIcon, ShieldCheck, User as UserIcon, Lock, Eye, 
  EyeOff, Camera, Palette, Wrench, TrendingUp, FileText, Upload, Globe, 
  Table, Check, Smartphone, Key, ExternalLink, Image as ImageIcon,
  ChevronRight, ChevronLeft, Edit3, Menu
} from 'lucide-react';
import { analyzeMarketingImage } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as OTPAuth from 'otpauth';

// Mock traffic data for the Overview chart
const VISIT_DATA = [
  { name: 'Mon', visits: 120 },
  { name: 'Tue', visits: 250 },
  { name: 'Wed', visits: 180 },
  { name: 'Thu', visits: 390 },
  { name: 'Fri', visits: 410 },
  { name: 'Sat', visits: 280 },
  { name: 'Sun', visits: 520 },
];

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginUsername.trim().toLowerCase() !== adminCreds.username.toLowerCase() || loginPassword !== adminCreds.password) {
      setLoginError('Invalid Username or Password');
      return;
    }

    if (adminCreds.twoFactorEnabled) {
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

  const showNotification = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
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

  // Fix: Added handleDeleteProject to resolve the missing function error on line 374
  const handleDeleteProject = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      onProjectsUpdate(currentProjects.filter(p => p.id !== id));
      showNotification("Project Deleted!");
    }
  };

  const handleAddOrUpdateTool = () => {
    if (!newTool.name || !newTool.icon) return alert("Name and Icon required!");
    
    if (editingTool) {
      const updatedTools = currentTools.map(t => 
        t.id === editingTool.id ? { ...t, name: newTool.name!, subtitle: newTool.subtitle!, icon: newTool.icon! } : t
      );
      onToolsUpdate(updatedTools);
      setEditingTool(null);
      showNotification("Tool Updated!");
    } else {
      const tool: Tool = {
        id: Date.now().toString(),
        name: newTool.name as string,
        subtitle: newTool.subtitle || 'Tooling Solution',
        icon: newTool.icon as string
      };
      onToolsUpdate([...currentTools, tool]);
      showNotification("Tool Added!");
    }
    setNewTool({ name: '', subtitle: '', icon: '' });
  };

  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    setNewTool({ name: tool.name, subtitle: tool.subtitle, icon: tool.icon });
    if(window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const generate2FA = () => {
    const secret = new OTPAuth.Secret().base32;
    onAdminCredsUpdate({ ...adminCreds, twoFactorSecret: secret, twoFactorEnabled: true });
    alert(`2FA Enabled! Secret: ${secret}`);
  };

  // Close sidebar on mobile when tab changes
  const switchTab = (tab: any) => {
    setActiveTab(tab);
    if(window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  if (!isAuthenticated) return (
    <div className="fixed inset-0 bg-slate-900 z-[200] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-blue-200">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Admin Access</h1>
        </div>

        {loginError && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center">
            {loginError}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full bg-slate-50 border p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
              value={loginUsername} 
              onChange={e => setLoginUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type={showLoginPassword ? "text" : "password"} 
              placeholder="Password" 
              className="w-full bg-slate-50 border p-4 pl-12 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" 
              value={loginPassword} 
              onChange={e => setLoginPassword(e.target.value)} 
              required 
            />
            <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {adminCreds.twoFactorEnabled && (
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
              <input 
                type="text" 
                placeholder="6-Digit 2FA Code" 
                className="w-full bg-blue-50 border-blue-100 border p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black tracking-[0.5em] text-center" 
                value={otpCode} 
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                required 
              />
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 uppercase tracking-widest text-sm">
          Login
        </button>

        <button type="button" onClick={onClose} className="w-full mt-4 py-2 text-slate-400 font-bold text-xs uppercase hover:text-slate-900">
          Back to Site
        </button>
      </form>
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
            <div className="text-xs md:text-sm font-black uppercase">RABBI <span className="text-blue-400">CONTROL</span></div>
          </div>
        </div>
        <button onClick={onClose} className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 flex items-center gap-2 px-3 md:px-4">
          <LogOut size={16} />
          <span className="hidden md:inline text-xs font-bold uppercase">Logout</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar with overlay for mobile */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Portfolio Assets</div>
                  <div className="text-2xl md:text-3xl font-black">{currentProjects.length}</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Tech Stack</div>
                  <div className="text-2xl md:text-3xl font-black">{currentTools.length} Tools</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Security</div>
                  <div className={`text-base md:text-lg font-black ${adminCreds.twoFactorEnabled ? 'text-emerald-500' : 'text-orange-500'}`}>{adminCreds.twoFactorEnabled ? '2FA ENABLED' : '2FA DISABLED'}</div>
                </div>
              </div>

              {/* Traffic Chart with responsive behavior */}
              <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h3 className="text-xl font-bold">Traffic Trends</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Visits per Day</p>
                  </div>
                </div>
                <div className="h-[250px] md:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={VISIT_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'}} />
                      <Area type="monotone" dataKey="visits" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <h3 className="text-xl font-bold">{editingProject ? 'Edit Project' : 'New Project'}</h3>
                <div className="bg-white p-5 md:p-6 rounded-3xl border shadow-sm space-y-4">
                   <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                     {isAiScanning ? (
                       <div className="py-2"><Loader2 className="animate-spin mx-auto text-blue-600 mb-2" /><span className="text-[10px] font-bold uppercase">AI Scanning...</span></div>
                     ) : (
                       <label className="cursor-pointer block">
                         <Sparkles className="mx-auto mb-2 text-blue-600" size={24} />
                         <span className="text-[10px] font-black uppercase text-slate-500">Scan Ad Screenshot</span>
                         <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                           const file = e.target.files?.[0]; if(!file) return; setIsAiScanning(true);
                           const reader = new FileReader(); reader.onloadend = async () => {
                             const base64 = (reader.result as string).split(',')[1];
                             const data = await analyzeMarketingImage(base64, file.type);
                             if(editingProject) setEditingProject({...editingProject, ...data, imageUrls: [reader.result as string]});
                             else setNewProject({...newProject, ...data, imageUrls: [reader.result as string]});
                             setIsAiScanning(false); showNotification("AI Scanned!");
                           }; reader.readAsDataURL(file);
                         }} />
                       </label>
                     )}
                   </div>
                   <input type="text" placeholder="Title" className="w-full border p-4 rounded-xl outline-none text-sm" value={editingProject ? editingProject.title : newProject.title} onChange={e => editingProject ? setEditingProject({...editingProject, title: e.target.value}) : setNewProject({...newProject, title: e.target.value})} />
                   <textarea placeholder="Description" className="w-full border p-4 rounded-xl h-24 text-sm" value={editingProject ? editingProject.description : newProject.description} onChange={e => editingProject ? setEditingProject({...editingProject, description: e.target.value}) : setNewProject({...newProject, description: e.target.value})} />
                   <button onClick={handleSaveProject} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest">Save Asset</button>
                   {editingProject && <button onClick={() => setEditingProject(null)} className="w-full bg-slate-100 py-3 rounded-xl font-bold uppercase text-[10px]">Cancel</button>}
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-bold">Project List</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentProjects.map(p => (
                    <div key={p.id} className="bg-white p-3 rounded-2xl border flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrls?.[0]} className="w-10 h-10 rounded-lg object-cover border" />
                        <div className="font-bold text-xs truncate max-w-[120px]">{p.title}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingProject(p); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={14} /></button>
                        <button onClick={() => handleDeleteProject(p.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl md:text-3xl font-black">Manage Tools</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                  <h3 className="font-bold">{editingTool ? 'Edit Tool' : 'Add Tool'}</h3>
                  <input type="text" placeholder="Name" className="w-full border p-4 rounded-xl text-sm" value={newTool.name} onChange={e => setNewTool({...newTool, name: e.target.value})} />
                  <input type="text" placeholder="Subtitle" className="w-full border p-4 rounded-xl text-sm" value={newTool.subtitle} onChange={e => setNewTool({...newTool, subtitle: e.target.value})} />
                  <div className="p-4 border rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Icon</span>
                    <input type="file" className="text-[10px] w-40" onChange={e => {
                      const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = () => setNewTool({...newTool, icon: r.result as string}); r.readAsDataURL(f); }
                    }} />
                  </div>
                  <button onClick={handleAddOrUpdateTool} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-sm">{editingTool ? 'Update Tool' : 'Add to Stack'}</button>
                  {editingTool && <button onClick={() => {setEditingTool(null); setNewTool({name:'', subtitle:'', icon:''});}} className="w-full bg-slate-100 py-3 rounded-xl font-bold uppercase text-xs">Cancel</button>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentTools.map(tool => (
                    <div key={tool.id} className="bg-white p-4 rounded-2xl border flex flex-col items-center text-center relative group">
                      <div className="absolute top-1 right-1 flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditTool(tool)} className="p-1 bg-blue-50 text-blue-500 rounded"><Edit3 size={10} /></button>
                        <button onClick={() => onToolsUpdate(currentTools.filter(t => t.id !== tool.id))} className="p-1 bg-red-50 text-red-400 rounded"><Trash2 size={10} /></button>
                      </div>
                      <img src={tool.icon} className="w-8 h-8 object-contain mb-2" />
                      <div className="font-bold text-[10px] truncate w-full">{tool.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="animate-fade-in flex flex-col h-[calc(100vh-140px)]">
              <h2 className="text-2xl font-black mb-4">Zoom Meeting Data</h2>
              <div className="flex-1 bg-white border rounded-3xl overflow-hidden shadow-sm">
                 <iframe 
                   src="https://docs.google.com/spreadsheets/d/1JDHDIp3c3GSwhemS4VvtWSowoNLHFxAIvTf91j1zQ2g/preview"
                   className="w-full h-full"
                   title="Inquiries"
                 />
              </div>
            </div>
          )}

          {/* Other tabs remain fully functional and responsive by using similar grid/flex patterns */}
          {activeTab === 'branding' && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-black">Site Identity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
                  <div className="text-[10px] font-black uppercase mb-4 text-slate-400">Portrait</div>
                  <img src={currentIdentity.profileImageUrl} className="w-20 h-20 rounded-full mx-auto mb-4 border" />
                  <label className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer inline-block">Upload<input type="file" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = () => onIdentityUpdate({...currentIdentity, profileImageUrl: r.result as string}); r.readAsDataURL(f); }
                  }} /></label>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
                  <div className="text-[10px] font-black uppercase mb-4 text-slate-400">Site Logo</div>
                  <img src={currentIdentity.logoUrl} className="h-20 mx-auto mb-4 object-contain p-2" />
                  <label className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer inline-block">Upload<input type="file" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = () => onIdentityUpdate({...currentIdentity, logoUrl: r.result as string}); r.readAsDataURL(f); }
                  }} /></label>
                </div>
                <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
                  <div className="text-[10px] font-black uppercase mb-4 text-slate-400">CV PDF</div>
                  <FileText className="mx-auto text-blue-500 mb-4" size={40} />
                  <label className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer inline-block">Upload PDF<input type="file" accept=".pdf" className="hidden" onChange={e => {
                    const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = () => onIdentityUpdate({...currentIdentity, cvUrl: r.result as string}); r.readAsDataURL(f); }
                  }} /></label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-black">Security Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                    <h3 className="font-bold text-sm uppercase">Login Credentials</h3>
                    <input type="text" className="w-full border p-4 rounded-xl text-sm" value={tempUsername} onChange={e => setTempUsername(e.target.value)} />
                    <input type="password" placeholder="New Password" className="w-full border p-4 rounded-xl text-sm" value={tempPassword} onChange={e => setTempPassword(e.target.value)} />
                    <button onClick={() => { onAdminCredsUpdate({...adminCreds, username: tempUsername, password: tempPassword}); showNotification("Updated!"); }} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase text-xs">Update Access</button>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                    <h3 className="font-bold text-sm uppercase flex items-center gap-2"><Smartphone size={16} /> Google 2FA</h3>
                    {adminCreds.twoFactorEnabled ? (
                      <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs text-center">2FA IS ACTIVE ✅</div>
                    ) : (
                      <button onClick={generate2FA} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase text-xs">Enable 2FA</button>
                    )}
                    <p className="text-[10px] text-slate-400 italic">Always keep a backup of your secret code.</p>
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
