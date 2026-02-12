
import React, { useState, useEffect, useRef } from 'react';
import { Project, Visit } from '../types';
import * as OTPAuth from 'otpauth';
import { 
  LayoutDashboard, 
  Plus, 
  Users, 
  LogOut, 
  Trash2, 
  Save, 
  Smartphone, 
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
  Link as LinkIcon,
  Copy,
  KeyRound,
  RefreshCw,
  QrCode,
  SmartphoneNfc,
  Menu,
  FileSpreadsheet
} from 'lucide-react';
import { analyzeMarketingImage } from '../services/geminiService';

interface AdminPanelProps {
  onClose: () => void;
  onProjectsUpdate: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onProjectsUpdate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginStep, setLoginStep] = useState<'creds' | '2fa'>('creds');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [useSyncToken, setUseSyncToken] = useState(false);
  const [syncTokenInput, setSyncTokenInput] = useState('');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'projects' | 'settings'>('analytics');
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  
  // Sidebar State for all devices
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Settings state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [syncToken, setSyncToken] = useState('');
  
  // 2FA Setup state
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [tempSecret, setTempSecret] = useState('');
  const [setupCode, setSetupCode] = useState('');

  const formRef = useRef<HTMLDivElement>(null);

  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    category: 'E-commerce',
    results: '',
    efficiency: '',
    description: '',
    imageUrls: [],
    link: ''
  });

  useEffect(() => {
    if (!localStorage.getItem('admin_credentials')) {
      localStorage.setItem('admin_credentials', JSON.stringify({ 
        username: 'admin', 
        password: 'password123',
        twoFactorSecret: null 
      }));
    }

    const storedProjects = JSON.parse(localStorage.getItem('rabbi_portfolio_projects') || '[]');
    const storedVisits = JSON.parse(localStorage.getItem('rabbi_portfolio_visits') || '[]');
    setProjects(storedProjects);
    setVisits(storedVisits);

    const creds = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
    setNewUsername(creds.username || 'admin');
    
    const token = btoa(JSON.stringify(creds));
    setSyncToken(token);
  }, []);

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
      } catch (err) {
        alert('Invalid Sync Token!');
        return;
      }
    }

    if (loginStep === 'creds') {
      if (loginUsername === creds.username && loginPassword === creds.password) {
        if (creds.twoFactorSecret) {
          setLoginStep('2fa');
        } else {
          setIsAuthenticated(true);
        }
      } else {
        alert('Invalid Username or Password!');
      }
    } else {
      const totp = new OTPAuth.TOTP({
        issuer: "Rabbi Portfolio",
        label: creds.username,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: creds.twoFactorSecret,
      });

      const delta = totp.validate({ token: twoFactorCode, window: 1 });
      if (delta !== null) {
        setIsAuthenticated(true);
      } else {
        alert('Invalid 2FA Code!');
      }
    }
  };

  const handleTabChange = (tab: 'analytics' | 'projects' | 'settings') => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const initiate2FASetup = () => {
    const secret = new OTPAuth.Secret().base32;
    setTempSecret(secret);
    setIsSettingUp2FA(true);
  };

  const confirm2FASetup = () => {
    const totp = new OTPAuth.TOTP({
      issuer: "Rabbi Portfolio",
      label: newUsername,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: tempSecret,
    });

    const delta = totp.validate({ token: setupCode, window: 1 });
    if (delta !== null) {
      const creds = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
      const updatedCreds = { ...creds, twoFactorSecret: tempSecret };
      localStorage.setItem('admin_credentials', JSON.stringify(updatedCreds));
      setSyncToken(btoa(JSON.stringify(updatedCreds)));
      setIsSettingUp2FA(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } else {
      alert("Invalid code. Please try again.");
    }
  };

  const disable2FA = () => {
    if (confirm("Are you sure you want to disable Google Authenticator?")) {
      const creds = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
      const updatedCreds = { ...creds, twoFactorSecret: null };
      localStorage.setItem('admin_credentials', JSON.stringify(updatedCreds));
      setSyncToken(btoa(JSON.stringify(updatedCreds)));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      alert("Please enter both a new username and password.");
      return;
    }
    const creds = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
    const newCreds = { ...creds, username: newUsername, password: newPassword };
    localStorage.setItem('admin_credentials', JSON.stringify(newCreds));
    setSyncToken(btoa(JSON.stringify(newCreds)));
    setUpdateSuccess(true);
    setNewPassword('');
    setTimeout(() => setUpdateSuccess(false), 5000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const blobToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = newProject.imageUrls || [];
    const remainingSlots = 10 - currentImages.length;
    if (remainingSlots <= 0) {
      alert("You can only upload up to 10 images.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newImageUrls: string[] = [];

    for (const file of filesToProcess) {
      const base64 = await blobToBase64(file);
      newImageUrls.push(`data:${file.type};base64,${base64}`);
    }

    setNewProject({ 
      ...newProject, 
      imageUrls: [...currentImages, ...newImageUrls] 
    });
  };

  const removeImage = (index: number) => {
    const currentImages = newProject.imageUrls || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setNewProject({ ...newProject, imageUrls: updatedImages });
  };

  const handleAiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiScanning(true);
    try {
      const base64 = await blobToBase64(file);
      const data = await analyzeMarketingImage(base64, file.type);
      
      const currentImages = newProject.imageUrls || [];
      const aiImage = `data:${file.type};base64,${base64}`;

      setNewProject({
        ...newProject,
        title: data.title || '',
        category: (['E-commerce', 'Leads', 'Engagement', 'Website Build'].includes(data.category) ? data.category : 'E-commerce') as any,
        results: data.results || '',
        efficiency: data.efficiency || '',
        description: data.description || '',
        // Populate first slot with the scanned image if empty
        imageUrls: currentImages.length === 0 ? [aiImage] : currentImages
      });
      
    } catch (err) {
      console.error(err);
      alert("AI could not read that image. Please ensure it's a clear screenshot of ad results.");
    } finally {
      setIsAiScanning(false);
    }
  };

  const resetForm = () => {
    setNewProject({ 
      title: '', 
      category: 'E-commerce', 
      results: '', 
      efficiency: '', 
      description: '', 
      imageUrls: [], 
      link: '' 
    });
    setEditingProjectId(null);
  };

  const handleAddOrUpdateProject = () => {
    if (!newProject.title || !newProject.description) return;

    let updatedList: Project[] = [];
    if (editingProjectId) {
      updatedList = projects.map(p => {
        if (p.id === editingProjectId) {
          return {
            ...p,
            ...newProject,
            metrics: [
              { label: 'Result', value: newProject.results || 'N/A', description: 'Primary KPI' },
              { label: 'Efficiency', value: newProject.efficiency || 'N/A', description: 'ROI/Cost' }
            ]
          } as Project;
        }
        return p;
      });
    } else {
      const project: Project = {
        ...newProject as Project,
        id: Date.now().toString(),
        metrics: [
          { label: 'Result', value: newProject.results || 'N/A', description: 'Primary KPI' },
          { label: 'Efficiency', value: newProject.efficiency || 'N/A', description: 'ROI/Cost' }
        ],
        chartData: [
          { name: 'Initial', value: 10 },
          { name: 'Midway', value: 45 },
          { name: 'Final', value: 100 },
        ]
      };
      updatedList = [project, ...projects];
    }
    
    setProjects(updatedList);
    localStorage.setItem('rabbi_portfolio_projects', JSON.stringify(updatedList));
    onProjectsUpdate(); 
    resetForm();
  };

  const startEdit = (project: Project) => {
    setEditingProjectId(project.id);
    setNewProject({
      title: project.title,
      category: project.category as any,
      results: project.results,
      efficiency: project.efficiency,
      description: project.description,
      imageUrls: project.imageUrls || [],
      link: project.link || ''
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsSidebarOpen(false);
  };

  const deleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('rabbi_portfolio_projects', JSON.stringify(updated));
      onProjectsUpdate();
      if (editingProjectId === id) resetForm();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <form onSubmit={handleLogin} className="bg-white p-8 rounded-[2rem] shadow-2xl w-full animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg ring-4 ring-blue-50">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Admin Portal</h1>
              <p className="text-slate-500 text-sm font-medium">
                {loginStep === 'creds' ? (useSyncToken ? 'Paste token from another device' : 'Enter your credentials') : 'Verify Authenticator Code'}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {loginStep === 'creds' ? (
                !useSyncToken ? (
                  <>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Username" 
                        className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type={showLoginPassword ? "text" : "password"} 
                        placeholder="Password" 
                        className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                    <textarea 
                      placeholder="Paste Sync Token here..." 
                      className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all h-32 resize-none text-xs"
                      value={syncTokenInput}
                      onChange={(e) => setSyncTokenInput(e.target.value)}
                    />
                  </div>
                )
              ) : (
                <div className="relative">
                  <SmartphoneNfc className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="6-digit code" 
                    className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-center text-2xl tracking-[0.5em] transition-all"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {loginStep === 'creds' && (
              <button 
                type="button" 
                onClick={() => { setUseSyncToken(!useSyncToken); setSyncTokenInput(''); }}
                className="w-full text-center text-xs font-bold text-blue-600 uppercase tracking-widest mb-6 hover:underline"
              >
                {useSyncToken ? 'Back to standard login' : 'Login with Sync Token'}
              </button>
            )}

            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => loginStep === 'creds' ? onClose() : setLoginStep('creds')} 
                className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                {loginStep === 'creds' ? 'Cancel' : 'Back'}
              </button>
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                {loginStep === 'creds' ? (useSyncToken ? 'Sync & Login' : 'Next') : 'Verify'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden font-sans">
      
      {/* Persistent Universal Top Header */}
      <div className="w-full bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0 shadow-2xl z-[130]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-white p-2 hover:bg-slate-800 rounded-xl transition-all active:scale-90"
          >
            <Menu size={28} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <div className="text-white">
              <div className="text-sm font-black uppercase tracking-tighter leading-none">S M FAJLA <span className="text-blue-400">RABBI</span></div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Admin Dashboard</div>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-6">
           <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             Live System
           </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-[140] backdrop-blur-md transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[150] w-80 bg-slate-900 p-8 flex flex-col shrink-0
        transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-2xl border-r border-slate-800
      `}>
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-black uppercase tracking-tighter text-lg leading-none">S M FAJLA <span className="text-blue-400">RABBI</span></div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Growth Specialist</div>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X size={28} />
          </button>
        </div>

        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => handleTabChange('analytics')}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold transition-all text-sm group ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Users size={22} className={activeTab === 'analytics' ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} /> 
            Visitor Analytics
          </button>
          <button 
            onClick={() => handleTabChange('projects')}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold transition-all text-sm group ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Plus size={22} className={activeTab === 'projects' ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} /> 
            Manage Portfolio
          </button>
          <a 
            href="https://docs.google.com/spreadsheets" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-4 p-5 rounded-2xl font-bold transition-all text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 group"
          >
            <FileSpreadsheet size={22} className="text-slate-500 group-hover:text-emerald-400" />
            Meeting Leads
          </a>
          <button 
            onClick={() => handleTabChange('settings')}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold transition-all text-sm group ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <SettingsIcon size={22} className={activeTab === 'settings' ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} /> 
            Login Security
          </button>
        </nav>

        <div className="pt-8 border-t border-slate-800 mt-auto">
          <button 
            onClick={onClose}
            className="w-full flex items-center gap-4 p-5 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all text-sm active:scale-95"
          >
            <LogOut size={22} /> Logout Session
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 text-slate-900 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'analytics' && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">Traffic Insight</h2>
                  <p className="text-slate-500 font-medium mt-2">Monitoring real-time audience interaction across your platform.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm self-start">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Online</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-[0.2em]">Total Impressions</div>
                  <div className="text-4xl md:text-5xl font-black text-blue-600 tracking-tighter">{visits.length}</div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-[0.2em]">Unique Devices</div>
                  <div className="text-4xl md:text-5xl font-black text-emerald-600 tracking-tighter">{new Set(visits.map(v => v.userAgent)).size}</div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-[0.2em]">Retention Rate</div>
                  <div className="text-4xl md:text-5xl font-black text-cyan-600 tracking-tighter">98%</div>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden mb-20">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter">Activity Stream</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Last 50 interactions</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                      <tr>
                        <th className="px-8 py-5">Timestamp</th>
                        <th className="px-8 py-5">Source Platform</th>
                        <th className="px-8 py-5">Landing Node</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visits.slice(0, 50).map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-8 py-6 text-xs font-bold text-slate-600 whitespace-nowrap">{new Date(v.timestamp).toLocaleString()}</td>
                          <td className="px-8 py-6"><div className="flex items-center gap-3"><Smartphone size={16} className="text-blue-500" /><span className="text-xs font-bold text-slate-800">{v.platform}</span></div></td>
                          <td className="px-8 py-6 text-right"><span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-tighter">{v.page}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-fade-in grid xl:grid-cols-5 gap-16">
              <div className="xl:col-span-2" ref={formRef}>
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">{editingProjectId ? 'Modify Project' : 'New Project'}</h2>
                  {editingProjectId && (
                    <button onClick={resetForm} className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline transition-all">
                      <X size={16} /> Discard Changes
                    </button>
                  )}
                </div>
                
                <div className={`mb-8 p-10 rounded-[3rem] border-2 border-dashed transition-all duration-500 ${isAiScanning ? 'bg-blue-50 border-blue-500 ring-8 ring-blue-50' : 'bg-slate-50 border-slate-200 hover:border-blue-400 group'}`}>
                  {isAiScanning ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-4">
                      <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                      <div className="text-center">
                        <div className="font-black text-blue-600 uppercase tracking-tighter text-xl">AI Engine Scanning...</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Deep learning image analysis</div>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-4 cursor-pointer py-4">
                      <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center shadow-md text-slate-400 group-hover:text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <Sparkles size={32} />
                      </div>
                      <div className="text-center">
                        <div className="font-black text-slate-900 text-lg">AI Magic Upload</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Auto-fill from Ad Screenshot</div>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAiUpload} />
                    </label>
                  )}
                </div>

                <div className={`bg-white p-10 rounded-[3rem] border transition-all duration-700 shadow-2xl space-y-8 ${editingProjectId ? 'border-blue-500 ring-8 ring-blue-50' : 'border-slate-200'}`}>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em]">Project Label</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-black text-lg transition-all" placeholder="e.g. E-commerce Scale-up" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em]">Campaign Vertical</label>
                      <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-black text-lg" value={newProject.category} onChange={(e) => setNewProject({...newProject, category: e.target.value as any})}>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Leads">Leads</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Website Build">Website Build</option>
                      </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em]">Creative Assets (Up to 10)</label>
                       <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                         {(newProject.imageUrls || []).map((url, idx) => (
                           <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                             <img src={url} className="w-full h-full object-cover" />
                             <button 
                               onClick={() => removeImage(idx)} 
                               className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <X size={12} />
                             </button>
                           </div>
                         ))}
                         {(newProject.imageUrls || []).length < 10 && (
                           <label className="aspect-square flex flex-col items-center justify-center gap-1 bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-slate-100 transition-all text-slate-400 group">
                             <Plus size={20} className="group-hover:text-blue-500 transition-colors" />
                             <span className="text-[8px] font-black uppercase tracking-widest">Add Image</span>
                             <input 
                               type="file" 
                               multiple 
                               accept="image/*" 
                               className="hidden" 
                               onChange={handleProjectImageUpload} 
                             />
                           </label>
                         )}
                       </div>
                       <p className="mt-3 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                         {newProject.imageUrls?.length || 0} / 10 images uploaded
                       </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em]">Primary Result</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-black text-lg" placeholder="142 Messages" value={newProject.results} onChange={(e) => setNewProject({...newProject, results: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em]">CPA / ROI</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none font-black text-lg" placeholder="BDT 8.20/Conv" value={newProject.efficiency} onChange={(e) => setNewProject({...newProject, efficiency: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em]">Strategy Case Summary</label>
                      <textarea className="w-full bg-slate-50 border border-slate-200 p-5 rounded-[2rem] h-32 outline-none resize-none font-medium leading-relaxed" placeholder="Describe your precision strategy..." value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
                    </div>
                  </div>
                  <button 
                    onClick={handleAddOrUpdateProject} 
                    className="w-full py-6 rounded-[2rem] font-black text-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-2xl shadow-blue-300 active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    <Save size={24} /> {editingProjectId ? 'Sync Changes' : 'Publish Asset'}
                  </button>
                </div>
              </div>

              <div className="xl:col-span-3">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-12 tracking-tighter">Live Portfolio</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {projects.map((p) => (
                    <div key={p.id} className={`bg-white p-8 rounded-[3rem] border transition-all duration-500 group flex flex-col justify-between ${editingProjectId === p.id ? 'border-blue-500 bg-blue-50/20 ring-4 ring-blue-50' : 'border-slate-200 hover:border-blue-200 hover:shadow-2xl hover:-translate-y-1'}`}>
                      <div className="flex gap-6 items-start">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-2xl shrink-0 overflow-hidden shadow-inner ${editingProjectId === p.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-600'}`}>
                          {p.imageUrls && p.imageUrls.length > 0 ? (
                            <div className="relative w-full h-full">
                              <img src={p.imageUrls[0]} className="w-full h-full object-cover" />
                              {p.imageUrls.length > 1 && (
                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                  +{p.imageUrls.length - 1}
                                </div>
                              )}
                            </div>
                          ) : p.category.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-slate-900 text-xl leading-tight mb-2">{p.title}</div>
                          <div className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full">{p.category}</div>
                          <div className="mt-4 grid grid-cols-2 gap-4">
                             <div>
                               <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Results</div>
                               <div className="font-black text-slate-900 text-sm">{p.results}</div>
                             </div>
                             <div>
                               <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Efficiency</div>
                               <div className="font-black text-blue-600 text-sm">{p.efficiency}</div>
                             </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-8 pt-8 border-t border-slate-50">
                        <button onClick={() => startEdit(p)} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all ${editingProjectId === p.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                          <Edit3 size={18} /> Edit Case
                        </button>
                        <button onClick={() => deleteProject(p.id)} className="flex items-center justify-center p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-200 rounded-[4rem] bg-white/50">
                      <Plus className="w-20 h-20 text-slate-300 mx-auto mb-6 opacity-50" />
                      <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-sm">Portfolio empty — Ready for growth</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in max-w-6xl mx-auto grid lg:grid-cols-2 gap-20">
              <div className="space-y-12">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tighter">Security Protocols</h2>
                  <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="flex items-start gap-4">
                      <RefreshCw className="text-blue-200 w-8 h-8 shrink-0 animate-spin-slow" />
                      <div>
                        <p className="text-lg font-bold leading-tight">Cross-Device Synchronization</p>
                        <p className="text-blue-100 text-sm mt-3 leading-relaxed opacity-90">
                          To manage this dashboard from your phone or tablet, simply copy the **Sync Token** and use it on the login screen of that device.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {updateSuccess && (
                  <div className="p-6 bg-emerald-50 border-2 border-emerald-100 text-emerald-700 rounded-3xl flex items-center gap-4 animate-fade-in shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                    <span className="font-black uppercase tracking-widest text-sm">System credentials updated!</span>
                  </div>
                )}

                <form onSubmit={handleUpdateCredentials} className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-2xl space-y-8">
                  <h3 className="font-black text-slate-900 text-xl flex items-center gap-3">
                    <Edit3 size={24} className="text-blue-600" />
                    Modify Access
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em]">System Username</label>
                      <div className="relative">
                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 p-5 pl-14 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-black text-lg transition-all"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-[0.2em]">New Secure Password</label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 p-5 pl-14 pr-14 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-black text-lg transition-all"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                          {showNewPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95">
                    <Save size={24} /> Confirm Security Update
                  </button>
                </form>

                <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl space-y-8">
                  <h3 className="font-black text-white text-xl flex items-center gap-3">
                    <Smartphone size={24} className="text-blue-400" />
                    Sync Token Generation
                  </h3>
                  <div className="bg-slate-800 p-6 rounded-[2rem] break-all font-mono text-[11px] text-blue-300 border border-slate-700 relative group">
                    {syncToken}
                    <button onClick={() => copyToClipboard(syncToken)} className="absolute top-3 right-3 p-3 bg-slate-700 rounded-xl hover:bg-blue-600 transition-all text-white shadow-lg active:scale-90">
                      <Copy size={18} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Token contains encrypted device configuration & 2FA keys.
                  </p>
                </div>
              </div>

              <div className="space-y-12">
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-2xl">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="font-black text-slate-900 text-xl flex items-center gap-3">
                      <ShieldCheck size={28} className="text-emerald-500" />
                      Google Authenticator
                    </h3>
                    {JSON.parse(localStorage.getItem('admin_credentials') || '{}').twoFactorSecret ? (
                      <span className="px-4 py-1.5 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">Verified 2FA</span>
                    ) : (
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">Inactive</span>
                    )}
                  </div>

                  {!isSettingUp2FA ? (
                     <div>
                       {JSON.parse(localStorage.getItem('admin_credentials') || '{}').twoFactorSecret ? (
                         <div className="space-y-8 text-center">
                           <div className="p-8 bg-emerald-50 border-2 border-emerald-100 rounded-[3rem] flex flex-col items-center gap-6">
                             <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200"><CheckCircle2 size={40} /></div>
                             <p className="text-sm font-bold text-emerald-900 uppercase tracking-widest leading-relaxed">System protected by <br/>time-based OTP</p>
                           </div>
                           <button onClick={disable2FA} className="w-full py-6 border-2 border-red-50 text-red-500 font-black rounded-[2rem] hover:bg-red-50 transition-all text-lg active:scale-95">Disable 2FA Protection</button>
                         </div>
                       ) : (
                         <div className="space-y-8 text-center">
                           <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-300 shadow-inner"><QrCode size={48} /></div>
                           <p className="text-slate-500 font-medium leading-relaxed px-4">Secure your dashboard with military-grade 2FA. Recommended for professional portfolio integrity.</p>
                           <button onClick={initiate2FASetup} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 shadow-2xl shadow-blue-200 active:scale-95"><QrCode size={24} /> Initialize Setup</button>
                         </div>
                       )}
                     </div>
                  ) : (
                    <div className="space-y-10 animate-fade-in">
                      <div className="text-center space-y-8">
                        <h4 className="font-black text-slate-900 text-lg uppercase tracking-tighter">Step 1: Scan Matrix</h4>
                        <div className="bg-white p-6 border border-slate-100 rounded-[2.5rem] shadow-xl inline-block ring-8 ring-slate-50">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`otpauth://totp/Rabbi Portfolio:${newUsername}?secret=${tempSecret}&issuer=Rabbi Portfolio`)}`} alt="2FA QR Code" className="w-48 h-48" />
                        </div>
                      </div>
                      <div className="space-y-6">
                         <h4 className="font-black text-slate-900 text-lg text-center uppercase tracking-tighter">Step 2: Verification</h4>
                         <input type="text" maxLength={6} className="w-full bg-slate-50 border border-slate-200 p-6 rounded-3xl text-center text-4xl font-black tracking-[0.5em] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="000000" value={setupCode} onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))} />
                         <div className="flex gap-4 pt-6">
                           <button onClick={() => setIsSettingUp2FA(false)} className="flex-1 py-5 font-black text-slate-400 uppercase tracking-widest text-sm hover:text-slate-900 transition-colors">Abort</button>
                           <button onClick={confirm2FASetup} disabled={setupCode.length !== 6} className="flex-1 bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 shadow-xl disabled:opacity-50 active:scale-95">Enable 2FA</button>
                         </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-10 bg-indigo-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                  <h3 className="font-black text-xl mb-6 flex items-center gap-3">
                    <Sparkles size={24} className="text-blue-300" />
                    Security Protocol
                  </h3>
                  <ul className="text-sm space-y-5 text-indigo-100 font-medium">
                    <li className="flex gap-4">
                      <span className="w-6 h-6 bg-indigo-500/30 rounded-full flex items-center justify-center text-xs shrink-0">1</span>
                      2FA codes change every 30 seconds for absolute security.
                    </li>
                    <li className="flex gap-4">
                      <span className="w-6 h-6 bg-indigo-500/30 rounded-full flex items-center justify-center text-xs shrink-0">2</span>
                      Sync Token transfer is mandatory for multi-device login.
                    </li>
                    <li className="flex gap-4">
                      <span className="w-6 h-6 bg-indigo-500/30 rounded-full flex items-center justify-center text-xs shrink-0">3</span>
                      System logs every admin interaction for auditing.
                    </li>
                  </ul>
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
