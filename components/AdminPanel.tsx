import React, { useState, useEffect, useMemo } from 'react';
import { Project, Visit, SiteIdentity, Tool } from '../types';
import * as OTPAuth from 'otpauth';
import { db } from '../services/firebase';
import { 
  onSnapshot, 
  doc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Plus, Users, LogOut, Trash2, Save, Sparkles, Loader2, Edit3, X, 
  Settings as SettingsIcon, ShieldCheck, User as UserIcon, Lock, Eye, 
  EyeOff, CheckCircle2, ImageIcon, Copy, KeyRound, RefreshCw, 
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
  
  // Default Google Sheet Link
  const DEFAULT_SHEET_LINK = "https://docs.google.com/spreadsheets/d/1JDHDIp3c3GSwhemS4VvtWSowoNLHFxAIvTf91j1zQ2g/edit?gid=1373341915#gid=1373341915";
  const [sheetLink, setSheetLink] = useState(DEFAULT_SHEET_LINK);
  
  // Forms State
  const [newUsername, setNewUsername] = useState('admin');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] });
  const [newTool, setNewTool] = useState<Partial<Tool>>({ name: '', subtitle: '', icon: '' });
  
  // 2FA Setup State
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [tempSecret, setTempSecret] = useState('');
  const [setupCode, setSetupCode] = useState('');

  // 1. Sync with Firestore on Load
  useEffect(() => {
    // Identity Sync
    const unsubIdentity = onSnapshot(doc(db, "site_config", "identity"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIdentity(data as SiteIdentity);
        if (data.sheetLink) setSheetLink(data.sheetLink);
      }
    });

    // Admin Credentials Sync
    const unsubCreds = onSnapshot(doc(db, "site_config", "admin"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNewUsername(data.username || 'admin');
      }
    });

    // Projects Sync
    const unsubProjects = onSnapshot(collection(db, "projects"), (querySnap) => {
      const projs: Project[] = [];
      querySnap.forEach((doc) => projs.push({ id: doc.id, ...doc.data() } as Project));
      setProjects(projs.sort((a, b) => (b as any).createdAt?.seconds - (a as any).createdAt?.seconds));
    });

    // Tools Sync
    const unsubTools = onSnapshot(collection(db, "tools"), (querySnap) => {
      const tl: Tool[] = [];
      querySnap.forEach((doc) => tl.push({ id: doc.id, ...doc.data() } as Tool));
      setTools(tl);
    });

    // Visits Sync (Latest 50)
    const qVisits = query(collection(db, "visits"), orderBy("timestamp", "desc"), limit(50));
    const unsubVisits = onSnapshot(qVisits, (querySnap) => {
      const vs: Visit[] = [];
      querySnap.forEach((doc) => vs.push({ id: doc.id, ...doc.data() } as Visit));
      setVisits(vs);
    });

    return () => {
      unsubIdentity();
      unsubCreds();
      unsubProjects();
      unsubTools();
      unsubVisits();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      if (loginStep === 'creds') {
        const localCreds = JSON.parse(localStorage.getItem('admin_credentials') || '{"username":"admin","password":"password123"}');
        if (loginUsername === localCreds.username && loginPassword === localCreds.password) {
          if (localCreds.twoFactorSecret) { setLoginStep('2fa'); } else { setIsAuthenticated(true); }
        } else { alert('Incorrect credentials!'); }
      } else {
        const localCreds = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
        const totp = new OTPAuth.TOTP({ secret: localCreds.twoFactorSecret });
        if (totp.validate({ token: twoFactorCode, window: 1 }) !== null) {
          setIsAuthenticated(true);
        } else { alert('Invalid 2FA code!'); }
      }
    } catch (e) {
      alert("Login check failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateCreds = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { username: newUsername, password: newPassword || 'password123' };
    localStorage.setItem('admin_credentials', JSON.stringify(updated));
    setDoc(doc(db, "site_config", "admin"), updated, { merge: true });
    alert("Login keys updated across all devices.");
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

  const handleSaveProject = async () => {
    if (!newProject.title) return alert("Title required!");
    setIsSyncing(true);
    try {
      const projectData = {
        ...newProject,
        metrics: [
          { label: 'Result', value: newProject.results || '0', description: 'Success Metric' },
          { label: 'Efficiency', value: newProject.efficiency || '0', description: 'Cost Basis' }
        ],
        chartData: [{ name: 'Start', value: 10 }, { name: 'Peak', value: 90 }],
        createdAt: serverTimestamp()
      };

      if (editingProjectId) {
        await updateDoc(doc(db, "projects", editingProjectId), projectData);
      } else {
        await addDoc(collection(db, "projects"), projectData);
      }
      
      setEditingProjectId(null);
      setNewProject({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [] });
      alert("Project Synced Successfully!");
    } catch (e) {
      alert("Save failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleIdentityUpload = async (type: 'logo'|'profile', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsSyncing(true);
    try {
      const compressed = await compressImage(file, 800);
      const field = type === 'logo' ? 'logoUrl' : 'profileImageUrl';
      await setDoc(doc(db, "site_config", "identity"), { [field]: compressed }, { merge: true });
    } catch (e) {
      alert("Upload failed");
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
      <form onSubmit={handleLogin} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-m-md animate-fade-in-up">
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
          <button type="submit" disabled={isSyncing} className="flex-[2] bg-blue-600 text-white py-4 px-8 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center">
            {isSyncing ? <Loader2 className="animate-spin" /> : 'Continue'}
          </button>
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
        <div className="flex items-center gap-2">
          {isSyncing && <Loader2 className="animate-spin text-blue-400 mr-2" size={16} />}
          <button onClick={onClose} className="bg-red-500/10 text-red-400 p-2.5 rounded-xl hover:bg-red-500/20 transition-all"><LogOut size={18} /></button>
        </div>
      </header>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-[140] backdrop-blur-md" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-[150] w-72 bg-slate-900 p-8 flex flex-col transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-slate-800 shadow-2xl`}>
        <div className="flex items-center justify-between mb-12">
           <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Firebase Control</div>
           <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><TrendingUp size={20} /> Traffic Insight</button>
          <button onClick={() => { setActiveTab('sheet'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'sheet' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><FileSpreadsheet size={20} /> Sheet Data</button>
          <button onClick={() => { setActiveTab('projects'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Plus size={20} /> Portfolio Lab</button>
          <button onClick={() => { setActiveTab('tools'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'tools' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Wrench size={20} /> Tech Stack</button>
          <button onClick={() => { setActiveTab('branding'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'branding' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Palette size={20} /> Branding Suite</button>
          <div className="pt-8 mt-4 border-t border-slate-800">
            <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-indigo-400 hover:bg-indigo-900/20'}`}><ShieldCheck size={20} /> Firebase Security</button>
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
                    <button onClick={async () => { if(confirm("Clear traffic logs?")) { for (const v of visits) { await deleteDoc(doc(db, "visits", v.id)); } } }} className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold text-xs uppercase hover:bg-red-100 transition-all">Clear Cloud Logs</button>
                  </div>
               </div>

               <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><LinkIcon className="text-blue-600" /> Response Link Management</h3>
                    <p className="text-xs text-slate-500 font-medium">Zoom মিটিং এর ফর্ম ডাটা যেখানে জমা হচ্ছে তা ফায়ারবেসে সেভ হবে।</p>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Google Sheet URL</label>
                       <input 
                         type="text" 
                         placeholder="Paste Sheet URL" 
                         className="w-full bg-slate-50 border p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" 
                         value={sheetLink} 
                         onChange={e => { setSheetLink(e.target.value); setDoc(doc(db, "site_config", "identity"), { sheetLink: e.target.value }, { merge: true }); }}
                       />
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center"><Table size={32} /></div>
                    <div className="text-3xl font-black text-blue-600">{visits.length} Live Logs</div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-fade-in grid md:grid-cols-5 gap-12">
              <div className="md:col-span-2 space-y-8">
                <h3 className="text-2xl font-black tracking-tight">{editingProjectId ? 'Modify Cloud Asset' : 'Inject Cloud Asset'}</h3>
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
                  <input type="text" placeholder="Campaign Title" className="w-full bg-slate-50 border p-4 rounded-xl outline-none" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
                  <input type="text" placeholder="Total Results" className="w-full bg-slate-50 border p-4 rounded-xl outline-none" value={newProject.results} onChange={e => setNewProject({...newProject, results: e.target.value})} />
                  <input type="text" placeholder="ROI Efficiency" className="w-full bg-slate-50 border p-4 rounded-xl outline-none" value={newProject.efficiency} onChange={e => setNewProject({...newProject, efficiency: e.target.value})} />
                  <textarea placeholder="Description" className="w-full bg-slate-50 border p-4 rounded-xl h-24 outline-none resize-none" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                  <button onClick={handleSaveProject} disabled={isSyncing} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center">
                    {isSyncing ? <Loader2 className="animate-spin" /> : 'Push to Cloud'}
                  </button>
                </div>
              </div>
              <div className="md:col-span-3 space-y-6">
                 <h3 className="text-2xl font-black">Live Performance Catalog ({projects.length})</h3>
                 <div className="grid sm:grid-cols-2 gap-4">
                    {projects.map(p => (
                      <div key={p.id} className="bg-white p-5 rounded-[2rem] border group hover:shadow-xl transition-all">
                        <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative">
                           {p.imageUrls?.[0] ? <img src={p.imageUrls[0]} className="w-full h-full object-contain" /> : <div className="flex items-center justify-center h-full text-white/20">NO PREVIEW</div>}
                        </div>
                        <h4 className="font-bold text-slate-900 mt-4 truncate">{p.title}</h4>
                        <div className="flex gap-2 mt-4">
                           <button onClick={() => { setEditingProjectId(p.id); setNewProject(p); }} className="flex-1 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase">Modify</button>
                           <button onClick={async () => { if(confirm("Delete from Cloud?")){ await deleteDoc(doc(db, "projects", p.id)); } }} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
             <div className="animate-fade-in space-y-12">
                <div className="text-center">
                  <h2 className="text-5xl font-black tracking-tighter">Cloud Branding</h2>
                  <p className="text-slate-500">পরিবর্তন করলে সাথে সাথে সব ডিভাইসে প্রোফাইল ফটো আপডেট হবে।</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                   <div className="bg-white p-10 rounded-[3rem] border shadow-xl flex flex-col items-center gap-6 group">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-[6px] border-slate-50 bg-slate-100 relative">
                        <img src={identity.profileImageUrl} className="w-full h-full object-cover object-top" />
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                          <Camera className="text-white" />
                          <input type="file" className="hidden" onChange={e => handleIdentityUpload('profile', e)} />
                        </label>
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Profile Signature</h4>
                   </div>
                   
                   <div className="bg-white p-10 rounded-[3rem] border shadow-xl flex flex-col items-center gap-6 group">
                      <div className="w-40 h-40 rounded-3xl overflow-hidden border-[6px] border-slate-50 bg-slate-50 flex items-center justify-center relative">
                        <img src={identity.logoUrl} className="w-24 h-24 object-contain" />
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                          <Upload className="text-white" />
                          <input type="file" className="hidden" onChange={e => handleIdentityUpload('logo', e)} />
                        </label>
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Brand Mark</h4>
                   </div>

                   <div className="bg-white p-10 rounded-[3rem] border shadow-xl flex flex-col items-center gap-6 group">
                      <div className="w-40 h-40 rounded-3xl border-4 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center relative">
                        <FileText size={48} className={identity.cvUrl ? "text-blue-600" : "text-slate-200"} />
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-white text-[10px] font-black uppercase">
                          Upload PDF
                          <input type="file" className="hidden" accept=".pdf" onChange={e => {
                            const f=e.target.files?.[0]; if(!f) return;
                            const r=new FileReader(); r.readAsDataURL(f);
                            r.onload=async ()=>{
                              await setDoc(doc(db, "site_config", "identity"), { cvUrl: r.result as string }, { merge: true });
                            };
                          }} />
                        </label>
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">CV Vault</h4>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in max-w-2xl mx-auto space-y-12">
               <div className="bg-white p-8 md:p-10 rounded-[3rem] border shadow-xl space-y-8">
                  <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3"><ShieldCheck className="text-blue-600" /> Firebase Access Keys</h3>
                  <form onSubmit={handleUpdateCreds} className="space-y-4">
                    <input type="text" className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                    <input type={showNewPassword ? "text" : "password"} placeholder="New Cloud Password" className="w-full bg-slate-50 border p-4 rounded-2xl outline-none font-bold" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all">Update Cloud Keys</button>
                  </form>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;