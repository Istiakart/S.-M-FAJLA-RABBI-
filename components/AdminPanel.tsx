
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Project, Visit, SiteIdentity, Tool } from '../types';
import * as OTPAuth from 'otpauth';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Plus, Users, LogOut, Trash2, Save, Sparkles, Loader2, Edit3, X, 
  Settings as SettingsIcon, ShieldCheck, User as UserIcon, Lock, Eye, 
  EyeOff, CheckCircle2, Image as ImageIcon, Copy, KeyRound, RefreshCw, 
  Menu, Camera, Palette, Wrench, TrendingUp, FileSpreadsheet, ExternalLink, 
  SmartphoneNfc, FileText, Upload, Cloud, Zap, Globe, ShieldAlert, Table,
  Link as LinkIcon
} from 'lucide-react';
import { analyzeMarketingImage } from '../services/geminiService';

interface AdminPanelProps {
  onClose: () => void;
  onProjectsUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onProjectsUpdate }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginStep, setLoginStep] = useState<'creds' | '2fa'>('creds');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // UI Navigation State
  const [activeTab, setActiveTab] = useState<'analytics' | 'projects' | 'tools' | 'branding' | 'settings' | 'sheet'>('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  
  // Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [identity, setIdentity] = useState<SiteIdentity>({ logoUrl: '', profileImageUrl: '', cvUrl: '' });
  const [syncId, setSyncId] = useState(localStorage.getItem('rabbi_sync_blob_id') || '');
  const [syncToken, setSyncToken] = useState(localStorage.getItem('rabbi_sync_token') || '');
  const [sheetLink, setSheetLink] = useState(localStorage.getItem('rabbi_sheet_link') || '');
  
  // Forms State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] });
  const [newTool, setNewTool] = useState<Partial<Tool>>({ name: '', subtitle: '', icon: '' });
  
  // 2FA Setup State
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [tempSecret, setTempSecret] = useState('');
  const [setupCode, setSetupCode] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('admin_credentials')) {
      localStorage.setItem('admin_credentials', JSON.stringify({ username: 'admin', password: 'password123', twoFactorSecret: null }));
    }
    const creds = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
    setNewUsername(creds.username || 'admin');
    
    setProjects(JSON.parse(localStorage.getItem('rabbi_portfolio_projects') || '[]'));
    setTools(JSON.parse(localStorage.getItem('rabbi_portfolio_tools') || '[]'));
    setVisits(JSON.parse(localStorage.getItem('rabbi_portfolio_visits') || '[]'));
    setIdentity(JSON.parse(localStorage.getItem('rabbi_site_identity') || '{"logoUrl":"","profileImageUrl":"","cvUrl":""}'));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
    if (loginStep === 'creds') {
      if (loginUsername === creds.username && loginPassword === creds.password) {
        if (creds.twoFactorSecret) { setLoginStep('2fa'); } else { setIsAuthenticated(true); }
      } else { alert('Incorrect credentials!'); }
    } else {
      const totp = new OTPAuth.TOTP({ secret: creds.twoFactorSecret });
      if (totp.validate({ token: twoFactorCode, window: 1 }) !== null) {
        setIsAuthenticated(true);
      } else { alert('Invalid 2FA code!'); }
    }
  };

  const handleUpdateCreds = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
    const updated = { ...creds, username: newUsername, password: newPassword || creds.password };
    localStorage.setItem('admin_credentials', JSON.stringify(updated));
    alert("Login credentials updated locally.");
  };

  const compressImage = (file: File, maxWidth = 1200): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleAiScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsAiScanning(true);
    try {
      const compressed = await compressImage(file, 1000);
      const base64 = compressed.split(',')[1];
      const data = await analyzeMarketingImage(base64, 'image/jpeg');
      setNewProject(prev => ({ ...prev, ...data, imageUrls: [compressed] }));
    } catch (e) { alert("AI Scan failed."); } finally { setIsAiScanning(false); }
  };

  const handleSaveProject = () => {
    if (!newProject.title) return alert("Title required!");
    const project: Project = {
      ...newProject as Project,
      id: editingProjectId || Date.now().toString(),
      metrics: [
        { label: 'Result', value: newProject.results || '0', description: 'Success Metric' },
        { label: 'Efficiency', value: newProject.efficiency || '0', description: 'Cost Basis' }
      ],
      chartData: [{ name: 'Start', value: 10 }, { name: 'Peak', value: 90 }]
    };
    const updated = editingProjectId 
      ? projects.map(p => p.id === editingProjectId ? project : p)
      : [project, ...projects];
    setProjects(updated);
    localStorage.setItem('rabbi_portfolio_projects', JSON.stringify(updated));
    onProjectsUpdate();
    setEditingProjectId(null);
    setNewProject({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] });
  };

  const handleIdentityUpload = async (type: 'logo'|'profile', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const compressed = await compressImage(file, 800);
    setIdentity(prev => {
      const updated = { ...prev, [type === 'logo' ? 'logoUrl' : 'profileImageUrl']: compressed };
      localStorage.setItem('rabbi_site_identity', JSON.stringify(updated));
      return updated;
    });
    onProjectsUpdate();
  };

  // Cloud Sync Logic
  const handleInitializeSync = async () => {
    setIsSyncing(true);
    try {
      const data = { 
        projects, 
        tools, 
        identity, 
        credentials: JSON.parse(localStorage.getItem('admin_credentials') || '{}') 
      };
      
      const res = await fetch('https://jsonblob.com/api/jsonBlob', {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const location = res.headers.get('Location');
      let id = "";
      
      if (location) {
        id = location.split('/').pop() || "";
      } else {
        // Some browsers don't expose Location header, try parsing the body
        const body = await res.json();
        id = body.id || "";
      }

      if (id) {
        // Update all related state instantly
        setSyncId(id); 
        setSyncToken(id);
        
        // Persist
        localStorage.setItem('rabbi_sync_blob_id', id);
        localStorage.setItem('rabbi_sync_token', id);
        
        alert(`Success! Generated Sync ID: ${id}. It is now saved in the Master Token field.`);
      } else {
        throw new Error("Could not extract Sync ID. Please try again.");
      }
    } catch (e: any) { 
      console.error("Cloud Sync Error:", e);
      alert(`Error: ${e.message === 'Failed to fetch' ? 'Network Error: jsonblob.com is not responding. Please check your internet or try again later.' : e.message}`); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  const pushToCloud = async () => {
    if (!syncId) return alert("Generate Sync ID first!");
    setIsSyncing(true);
    try {
      const data = { projects, tools, identity, credentials: JSON.parse(localStorage.getItem('admin_credentials') || '{}') };
      const res = await fetch(`https://jsonblob.com/api/jsonBlob/${syncId}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Sync update failed.");
      alert("Pushed Successfully!");
    } catch (e: any) { 
      console.error(e);
      alert(`Push failed: ${e.message}`); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  const pullFromCloud = async () => {
    if (!syncId) return alert("Provide Sync ID!");
    setIsSyncing(true);
    try {
      const res = await fetch(`https://jsonblob.com/api/jsonBlob/${syncId}`);
      if (!res.ok) throw new Error("Sync data not found.");
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
      if (data.tools) setTools(data.tools);
      if (data.identity) setIdentity(data.identity);
      alert("Pulled Successfully!");
    } catch (e: any) { 
      console.error(e);
      alert(`Pull failed: ${e.message}`); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  const trafficChartData = useMemo(() => {
    const map: { [key: string]: number } = {};
    visits.forEach(v => {
      const d = new Date(v.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).slice(0, 7).reverse();
  }, [visits]);

  if (!isAuthenticated) return (
    <div className="fixed inset-0 bg-slate-900 z-[200] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-blue-200">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-2">Authentication Required</p>
        </div>
        <div className="space-y-4 mb-8">
          {loginStep === 'creds' ? (
            <>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Username" className="w-full bg-slate-50 border p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type={showLoginPassword ? "text" : "password"} placeholder="Password" className="w-full bg-slate-50 border p-4 pl-12 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-xs font-bold text-blue-600 mb-4 uppercase tracking-widest">Enter Security Token</p>
              <input type="text" maxLength={6} placeholder="000 000" className="w-full bg-slate-50 border p-5 rounded-2xl text-center text-4xl font-black tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} required />
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-xs">Cancel</button>
          <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 px-8 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest text-sm">Continue</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden font-sans">
      <header className="w-full bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0 shadow-2xl z-[130]">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2 hover:bg-slate-800 rounded-xl transition-all"><Menu size={24} /></button>
          <div className="text-white flex flex-col">
            <div className="text-sm font-black uppercase tracking-tighter">S M FAJLA <span className="text-blue-400">RABBI</span></div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Administrator</div>
          </div>
        </div>
        <button onClick={onClose} className="bg-red-500/10 text-red-400 p-2.5 rounded-xl hover:bg-red-500/20 transition-all"><LogOut size={18} /></button>
      </header>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-[140] backdrop-blur-md" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-[150] w-72 bg-slate-900 p-8 flex flex-col transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-slate-800 shadow-2xl`}>
        <div className="flex items-center justify-between mb-12">
           <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Master Control</div>
           <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><TrendingUp size={20} /> Traffic Insight</button>
          <button onClick={() => { setActiveTab('sheet'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'sheet' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><FileSpreadsheet size={20} /> Sheet Data</button>
          <button onClick={() => { setActiveTab('projects'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Plus size={20} /> Portfolio Lab</button>
          <button onClick={() => { setActiveTab('tools'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'tools' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Wrench size={20} /> Tech Stack</button>
          <button onClick={() => { setActiveTab('branding'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'branding' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Palette size={20} /> Branding Suite</button>
          <div className="pt-8 mt-4 border-t border-slate-800">
            <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-indigo-400 hover:bg-indigo-900/20'}`}><ShieldCheck size={20} /> Sync & Security</button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'analytics' && (
            <div className="animate-fade-in space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Traffic Insight</h2>
                <div className="bg-white p-6 rounded-3xl border flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><Users size={24} /></div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Impressions</div>
                    <div className="text-2xl font-black">{visits.length}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border shadow-xl h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficChartData}>
                    <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'sheet' && (
            <div className="animate-fade-in space-y-8">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-4xl font-black tracking-tighter">Zoom Meeting Responses</h2>
                  <div className="flex gap-2">
                    {sheetLink && (
                      <a href={sheetLink} target="_blank" rel="noreferrer" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                        <ExternalLink size={16} /> Open Google Sheet
                      </a>
                    )}
                    <button onClick={() => { if(confirm("Clear traffic logs?")) { setVisits([]); localStorage.setItem('rabbi_portfolio_visits', '[]'); } }} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold text-xs uppercase hover:bg-red-100 transition-all">Clear Visit Logs</button>
                  </div>
               </div>

               <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><LinkIcon className="text-blue-600" /> Response Link Management</h3>
                    <p className="text-xs text-slate-500 font-medium">Zoom মিটিং এর ফর্ম ডাটা যেখানে জমা হচ্ছে (Google Sheet Link) তা এখানে সেভ করে রাখুন।</p>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Google Sheet URL</label>
                       <input 
                         type="text" 
                         placeholder="https://docs.google.com/spreadsheets/d/..." 
                         className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" 
                         value={sheetLink} 
                         onChange={e => { setSheetLink(e.target.value); localStorage.setItem('rabbi_sheet_link', e.target.value); }}
                       />
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                       <ShieldAlert className="text-blue-600 shrink-0" size={18} />
                       <p className="text-[10px] text-blue-900 leading-relaxed font-medium">এই লিঙ্কটি শুধুমাত্র আপনি অ্যাডমিন প্যানেল থেকে দেখতে পারবেন। এটি ভিজিটরদের জন্য গোপন থাকবে।</p>
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center"><Table size={32} /></div>
                    <div>
                       <h4 className="font-bold text-slate-900">Visit Analytics Collected</h4>
                       <p className="text-sm text-slate-500 mt-1">Local visits logs tracking site performance.</p>
                    </div>
                    <div className="text-3xl font-black text-blue-600">{visits.length} Logs</div>
                 </div>
               </div>

               <div className="bg-white rounded-[2.5rem] border shadow-xl overflow-hidden">
                  <div className="px-8 py-6 border-b flex items-center justify-between">
                     <h3 className="font-bold uppercase text-xs tracking-widest">Recent Visit Logs</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-500 text-[9px] uppercase font-black tracking-widest border-b">
                        <tr>
                          <th className="p-6">Time & Date</th>
                          <th className="p-6">Section</th>
                          <th className="p-6">Platform info</th>
                          <th className="p-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visits.slice(0, 10).map((v) => (
                          <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-6 text-xs font-bold text-slate-600">{new Date(v.timestamp).toLocaleString()}</td>
                            <td className="p-6 text-xs font-black text-blue-600">{v.page}</td>
                            <td className="p-6 text-[9px] font-bold text-slate-400 uppercase tracking-tight">{v.userAgent.split('(')[1]?.split(')')[0] || 'Unknown Device'}</td>
                            <td className="p-6"><span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-md text-[8px] font-black uppercase">Recorded</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {visits.length === 0 && <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest italic">No Visit Data Yet</div>}
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in space-y-12 pb-24">
              <div className="text-center">
                <h2 className="text-5xl font-black tracking-tighter">Sync & Security</h2>
                <p className="text-slate-500 font-medium">Manage global data persistence and access protocols.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Cloud Sync Section */}
                <div className="bg-white p-8 md:p-10 rounded-[3rem] border shadow-xl space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0"><Cloud size={28} /></div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Cloud Synergy</h3>
                  </div>
                  <div className="space-y-6">
                    <button 
                      onClick={handleInitializeSync} 
                      disabled={isSyncing} 
                      className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95"
                    >
                       {isSyncing ? <Loader2 className="animate-spin" /> : <Zap />} Initialize Cloud Sync
                    </button>
                    
                    {syncId && (
                      <div className="p-6 bg-slate-900 rounded-3xl border border-slate-700 animate-fade-in-up space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Sync ID</span>
                           <button 
                            onClick={() => { navigator.clipboard.writeText(syncId); alert("Sync ID Copied!"); }} 
                            className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] font-black uppercase transition-colors"
                           >
                            <Copy size={12}/> Copy Code
                           </button>
                        </div>
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 select-all">
                           <div className="text-white font-mono text-xs break-all leading-relaxed opacity-90">{syncId}</div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={pushToCloud} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Push Updates</button>
                           <button onClick={pullFromCloud} className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all">Pull Data</button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-4 border-t border-slate-100">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Sync Token</label>
                       <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Personal Access Token" 
                            className="w-full bg-slate-50 border p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20" 
                            value={syncToken} 
                            onChange={e => { setSyncToken(e.target.value); localStorage.setItem('rabbi_sync_token', e.target.value); }} 
                          />
                       </div>
                       <p className="text-[9px] text-slate-400 italic">Advanced: ইউজারের ব্রাউজারে ডাটা ম্যানুয়ালি ওভাররাইড করার জন্য এই কোডটি PUBLIC_SYNC_ID তে বসান।</p>
                    </div>
                  </div>
                </div>

                {/* Login Security Section */}
                <div className="bg-white p-8 md:p-10 rounded-[3rem] border shadow-xl space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center shrink-0"><UserIcon size={28} /></div>
                    <h3 className="text-xl font-bold uppercase tracking-tight">Access Protocol</h3>
                  </div>
                  <form onSubmit={handleUpdateCreds} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Username</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" className="w-full bg-slate-50 border p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type={showNewPassword ? "text" : "password"} placeholder="Leave blank to keep current" className="w-full bg-slate-50 border p-4 pl-12 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black active:scale-95 transition-all mt-4">Update Access Keys</button>
                  </form>
                </div>
              </div>

              {/* 2FA Shield Setup */}
              <div className="bg-white p-8 md:p-12 rounded-[4rem] border shadow-xl max-w-2xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><SmartphoneNfc size={28} /></div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Security Shield (2FA)</h3>
                </div>
                
                {JSON.parse(localStorage.getItem('admin_credentials') || '{}').twoFactorSecret ? (
                  <div className="bg-emerald-50 p-10 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center gap-6 text-center">
                    <CheckCircle2 size={64} className="text-emerald-500" />
                    <div>
                      <h4 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter">Biometric Shield Active</h4>
                      <p className="text-emerald-700 text-sm mt-1 font-medium italic">Your session is protected by a 6-digit rotation token.</p>
                    </div>
                    <button onClick={() => { if(confirm("Disable security shield?")){ const c=JSON.parse(localStorage.getItem('admin_credentials')||'{}'); c.twoFactorSecret=null; localStorage.setItem('admin_credentials', JSON.stringify(c)); window.location.reload(); } }} className="bg-white px-8 py-3 border border-red-200 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">Disable Security</button>
                  </div>
                ) : !isSettingUp2FA ? (
                  <div className="space-y-6">
                    <p className="text-slate-500 font-medium leading-relaxed">অ্যাডমিন লগইন আরও নিরাপদ করতে 2FA ইনাবল করুন। এটি আপনার স্মার্টভোনের Google Authenticator অ্যাপের সাথে কানেক্ট হবে।</p>
                    <button onClick={() => { setTempSecret(new OTPAuth.Secret().base32); setIsSettingUp2FA(true); }} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest"><KeyRound size={20} /> Deploy 2FA Shield</button>
                  </div>
                ) : (
                  <div className="space-y-8 animate-fade-in text-center">
                    <div className="p-8 bg-white border-[12px] border-slate-50 rounded-[4rem] shadow-sm inline-block">
                       <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`otpauth://totp/RabbiAdmin:${newUsername}?secret=${tempSecret}&issuer=RabbiPortfolio`)}&size=200x200`} className="w-48 h-48" />
                    </div>
                    <div className="space-y-4 max-w-xs mx-auto">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verify with App Code</p>
                      <input type="text" maxLength={6} placeholder="000 000" className="w-full bg-slate-50 border p-5 rounded-2xl text-center text-4xl font-black tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20" value={setupCode} onChange={e => setSetupCode(e.target.value)} />
                      <div className="flex gap-4">
                        <button onClick={() => setIsSettingUp2FA(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                        <button onClick={() => {
                          const totp = new OTPAuth.TOTP({ secret: tempSecret });
                          if(totp.validate({token: setupCode, window: 1}) !== null) {
                            const c = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
                            c.twoFactorSecret = tempSecret;
                            localStorage.setItem('admin_credentials', JSON.stringify(c));
                            setIsSettingUp2FA(false); setSetupCode('');
                            alert("Security Shield Deployed!");
                          } else { alert("Verification failed. Incorrect code."); }
                        }} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100">Verify & Activate</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-fade-in grid md:grid-cols-5 gap-12">
              <div className="md:col-span-2 space-y-8">
                <h3 className="text-2xl font-black tracking-tight">{editingProjectId ? 'Edit Global Asset' : 'Inject New Asset'}</h3>
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl space-y-6">
                  <div className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${isAiScanning ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200'}`}>
                    {isAiScanning ? <Loader2 className="animate-spin text-blue-600" /> : (
                      <label className="cursor-pointer text-center group w-full">
                        <Sparkles className="mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                        <div className="text-[10px] font-black uppercase tracking-widest">AI Vision Scan Ads</div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleAiScan} />
                      </label>
                    )}
                  </div>
                  <input type="text" placeholder="Campaign Title" className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
                  <input type="text" placeholder="Total Results (e.g. 150 Sales)" className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={newProject.results} onChange={e => setNewProject({...newProject, results: e.target.value})} />
                  <input type="text" placeholder="ROI Efficiency (e.g. 6.4x ROAS)" className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={newProject.efficiency} onChange={e => setNewProject({...newProject, efficiency: e.target.value})} />
                  <textarea placeholder="Technical Strategy Description" className="w-full bg-slate-50 border p-4 rounded-xl h-24 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                  <button onClick={handleSaveProject} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest">Deploy to Portfolio</button>
                  {editingProjectId && <button onClick={() => { setEditingProjectId(null); setNewProject({}); }} className="w-full text-slate-400 font-bold uppercase text-[10px]">Cancel Editing</button>}
                </div>
              </div>
              <div className="md:col-span-3 space-y-6">
                 <h3 className="text-2xl font-black">Performance Catalog ({projects.length})</h3>
                 <div className="grid sm:grid-cols-2 gap-4">
                    {projects.map(p => (
                      <div key={p.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col gap-4 group hover:shadow-xl transition-all">
                        <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 relative">
                           {p.imageUrls?.[0] ? <img src={p.imageUrls[0]} className="w-full h-full object-contain" /> : <div className="flex items-center justify-center h-full text-slate-700 font-black italic">NO PREVIEW</div>}
                           <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[8px] font-black uppercase text-blue-600">{p.category}</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 truncate tracking-tight">{p.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{p.results} | {p.efficiency}</p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => { setEditingProjectId(p.id); setNewProject(p); }} className="flex-1 py-2.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">Modify</button>
                           <button onClick={() => { if(confirm("Permanently delete this growth asset?")){ const u=projects.filter(pr=>pr.id!==p.id); setProjects(u); localStorage.setItem('rabbi_portfolio_projects', JSON.stringify(u)); } }} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
             <div className="animate-fade-in space-y-12">
               <div className="flex items-center justify-between">
                 <h2 className="text-4xl font-black tracking-tighter">Stack Lab</h2>
                 <p className="text-slate-500 font-medium">Verify agency-grade tooling solutions.</p>
               </div>
               <div className="grid md:grid-cols-5 gap-12">
                  <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-xl space-y-6">
                    <h3 className="font-black uppercase tracking-widest text-xs text-slate-400">Register New Tool</h3>
                    <input type="text" placeholder="Tool Identity (e.g. Next.js)" className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={newTool.name} onChange={e => setNewTool({...newTool, name: e.target.value})} />
                    <input type="text" placeholder="Subtitle Context (e.g. Speed Optimization)" className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={newTool.subtitle} onChange={e => setNewTool({...newTool, subtitle: e.target.value})} />
                    <div className="p-4 bg-slate-50 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3">
                       {newTool.icon ? <img src={newTool.icon} className="h-10" /> : <ImageIcon size={24} className="text-slate-300" />}
                       <label className="text-[10px] font-black uppercase text-blue-600 cursor-pointer hover:underline">
                          Upload SVG/PNG Icon <input type="file" className="hidden" onChange={async e => { const f=e.target.files?.[0]; if(f) setNewTool({...newTool, icon: await compressImage(f, 400)}) }} />
                       </label>
                    </div>
                    <button onClick={async () => {
                      if(!newTool.name) return;
                      const tool: Tool = { ...newTool as Tool, id: Date.now().toString() };
                      const updated = [...tools, tool];
                      setTools(updated); localStorage.setItem('rabbi_portfolio_tools', JSON.stringify(updated));
                      setNewTool({name:'', subtitle:'', icon:''});
                    }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200">Commit Tool</button>
                  </div>
                  <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {tools.map(t => (
                      <div key={t.id} className="bg-white p-5 rounded-2xl border flex flex-col items-center text-center gap-3 group relative overflow-hidden">
                         <div className="h-10 flex items-center justify-center"><img src={t.icon} className="max-h-full" /></div>
                         <div>
                            <div className="font-bold text-xs">{t.name}</div>
                            <div className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{t.subtitle}</div>
                         </div>
                         <button onClick={() => { if(confirm("Remove tool?")){ const u=tools.filter(x=>x.id!==t.id); setTools(u); localStorage.setItem('rabbi_portfolio_tools', JSON.stringify(u)); } }} className="absolute top-2 right-2 text-red-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          )}

          {activeTab === 'branding' && (
             <div className="animate-fade-in space-y-12">
                <div className="text-center">
                  <h2 className="text-5xl font-black tracking-tighter">Branding Matrix</h2>
                  <p className="text-slate-500 font-medium">Control the visual DNA of your professional identity.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                   <div className="bg-white p-10 rounded-[3rem] border shadow-xl flex flex-col items-center gap-6 group">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avatar Signature</h4>
                      <div className="w-40 h-40 rounded-full overflow-hidden border-[6px] border-slate-50 bg-slate-100 shadow-inner relative">
                        <img src={identity.profileImageUrl} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                          <Camera className="text-white" />
                          <input type="file" className="hidden" onChange={e => handleIdentityUpload('profile', e)} />
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-400 text-center font-medium italic">High-res portrait for hero and about sections.</p>
                   </div>
                   
                   <div className="bg-white p-10 rounded-[3rem] border shadow-xl flex flex-col items-center gap-6 group">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Brand Mark (Logo)</h4>
                      <div className="w-40 h-40 rounded-3xl overflow-hidden border-[6px] border-slate-50 bg-slate-50 flex items-center justify-center relative">
                        <img src={identity.logoUrl} className="w-24 h-24 object-contain" />
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                          <Upload className="text-white" />
                          <input type="file" className="hidden" onChange={e => handleIdentityUpload('logo', e)} />
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-400 text-center font-medium italic">Vector or PNG signature used in headers/footers.</p>
                   </div>

                   <div className="bg-white p-10 rounded-[3rem] border shadow-xl flex flex-col items-center gap-6 group">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Document Vault (CV)</h4>
                      <div className="w-40 h-40 rounded-3xl border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center relative">
                        <FileText size={48} className={identity.cvUrl ? "text-blue-600" : "text-slate-200"} />
                        <span className="text-[9px] font-black uppercase text-slate-400 mt-2">{identity.cvUrl ? "PDF READY" : "EMPTY"}</span>
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white text-[10px] font-black uppercase tracking-widest">
                          Inject PDF
                          <input type="file" className="hidden" accept=".pdf" onChange={e => {
                            const f=e.target.files?.[0]; if(!f) return;
                            const r=new FileReader(); r.readAsDataURL(f);
                            r.onload=()=>{
                              const u={...identity, cvUrl: r.result as string};
                              setIdentity(u); localStorage.setItem('rabbi_site_identity', JSON.stringify(u));
                            };
                          }} />
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-400 text-center font-medium italic">Optimized CV for potential high-ticket clients.</p>
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
