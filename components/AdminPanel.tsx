
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
  SmartphoneNfc
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
    imageUrl: '',
    link: ''
  });

  useEffect(() => {
    // Initialize Auth Defaults if not present
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
    
    // Generate current sync token
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
      // Verify TOTP
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
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await blobToBase64(file);
    setNewProject({ ...newProject, imageUrl: `data:${file.type};base64,${base64}` });
  };

  const handleAiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiScanning(true);
    try {
      const base64 = await blobToBase64(file);
      const data = await analyzeMarketingImage(base64, file.type);
      
      setNewProject({
        ...newProject,
        title: data.title || '',
        category: (['E-commerce', 'Leads', 'Engagement', 'Website Build'].includes(data.category) ? data.category : 'E-commerce') as any,
        results: data.results || '',
        efficiency: data.efficiency || '',
        description: data.description || '',
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
      imageUrl: '', 
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
      imageUrl: project.imageUrl || '',
      link: project.link || ''
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          
          <div className="mt-6 p-4 bg-slate-800/50 rounded-2xl border border-slate-700 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              SECURITY NOTE: Credentials are stored locally in your browser. <br/>
              Authenticator is highly recommended for high-stakes accounts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col md:flex-row overflow-hidden">
      <aside className="w-full md:w-72 bg-slate-900 p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <div className="text-white font-black uppercase tracking-tighter text-lg leading-none">
            Dashboard <br/><span className="text-[10px] text-blue-400">Control Center</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users size={20} /> Visitor Analytics
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Plus size={20} /> Manage Portfolio
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <SettingsIcon size={20} /> Login Security
          </button>
        </nav>

        <button 
          onClick={onClose}
          className="mt-auto flex items-center gap-3 p-4 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} /> Exit Dashboard
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 text-slate-900">
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-slate-900 mb-8">Visitor Traffic</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 text-xs font-bold uppercase mb-2">Total Visits</div>
                <div className="text-4xl font-black text-blue-600">{visits.length}</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 text-xs font-bold uppercase mb-2">Unique Devices</div>
                <div className="text-4xl font-black text-emerald-600">{new Set(visits.map(v => v.userAgent)).size}</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 text-xs font-bold uppercase mb-2">Data Points</div>
                <div className="text-4xl font-black text-cyan-600">{visits.length * 5}</div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Activity Log</h3>
                <span className="text-xs text-slate-400 font-bold uppercase">Showing last 50 entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Platform</th>
                      <th className="px-6 py-4">Browser Context</th>
                      <th className="px-6 py-4">Interaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visits.slice(0, 50).map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-600 whitespace-nowrap">{new Date(v.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4"><div className="flex items-center gap-2"><Smartphone size={14} className="text-blue-400" /><span className="text-xs font-medium text-slate-500">{v.platform}</span></div></td>
                        <td className="px-6 py-4"><span className="text-[10px] text-slate-400 font-mono truncate max-w-xs block">{v.userAgent}</span></td>
                        <td className="px-6 py-4 text-right"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold">{v.page}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="animate-fade-in grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1" ref={formRef}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-slate-900">{editingProjectId ? 'Edit Project' : 'Add Project'}</h2>
                {editingProjectId && (
                  <button onClick={resetForm} className="flex items-center gap-1 text-xs font-bold text-red-500 uppercase tracking-widest hover:underline">
                    <X size={14} /> Cancel Edit
                  </button>
                )}
              </div>
              
              <div className={`mb-6 p-6 rounded-[2rem] border-2 border-dashed transition-all ${isAiScanning ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 border-slate-200 hover:border-blue-400 group'}`}>
                {isAiScanning ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <div className="text-center">
                      <div className="font-black text-blue-600 uppercase tracking-tighter">AI Scanning...</div>
                      <div className="text-[10px] text-slate-400 font-bold">Reading metrics from screenshot</div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-3 cursor-pointer py-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                      <Sparkles size={24} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-slate-900">AI Magic Upload</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auto-fill via Ad Screenshot</div>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAiUpload} />
                  </label>
                )}
              </div>

              <div className={`bg-white p-8 rounded-[2rem] border transition-all duration-500 shadow-lg space-y-6 ${editingProjectId ? 'border-blue-400 ring-4 ring-blue-50 shadow-blue-100' : 'border-slate-200'}`}>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Project Title</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Category</label>
                  <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none" value={newProject.category} onChange={(e) => setNewProject({...newProject, category: e.target.value as any})}>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Leads">Leads</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Website Build">Website Build</option>
                  </select>
                </div>

                <div>
                   <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Work Image (Optional)</label>
                   <div className="flex gap-4 items-center">
                     {newProject.imageUrl ? (
                       <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                         <img src={newProject.imageUrl} className="w-full h-full object-cover" />
                         <button 
                           onClick={() => setNewProject({...newProject, imageUrl: ''})}
                           className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                         >
                           <X size={12} />
                         </button>
                       </div>
                     ) : (
                       <label className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 border-dashed p-3 rounded-xl cursor-pointer hover:bg-slate-100 transition-all text-slate-400">
                         <ImageIcon size={18} />
                         <span className="text-xs font-bold uppercase tracking-wider">Upload Image</span>
                         <input type="file" accept="image/*" className="hidden" onChange={handleProjectImageUpload} />
                       </label>
                     )}
                   </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Project Link (URL)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="url" 
                      placeholder="https://example.com"
                      className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl outline-none" 
                      value={newProject.link} 
                      onChange={(e) => setNewProject({...newProject, link: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Results</label>
                    <input type="text" placeholder="e.g. 142 Messages" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none" value={newProject.results} onChange={(e) => setNewProject({...newProject, results: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Efficiency</label>
                    <input type="text" placeholder="e.g. BDT 8.20/Lead" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none" value={newProject.efficiency} onChange={(e) => setNewProject({...newProject, efficiency: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Description</label>
                  <textarea className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl h-24 outline-none resize-none" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
                </div>
                <button 
                  onClick={handleAddOrUpdateProject} 
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${
                    editingProjectId 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                  }`}
                >
                  <Save size={18} /> {editingProjectId ? 'Update Project' : 'Publish to Portfolio'}
                </button>
              </div>
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-black text-slate-900 mb-8">Active Portfolio</h2>
              <div className="space-y-4">
                {projects.map((p) => (
                  <div key={p.id} className={`bg-white p-6 rounded-3xl border transition-all duration-300 flex items-center justify-between group ${editingProjectId === p.id ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 hover:border-blue-200'}`}>
                    <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-colors ${editingProjectId === p.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          p.category.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{p.title}</div>
                        <div className="text-xs text-slate-400 font-medium">{p.category} • {p.results}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(p)} 
                        className={`p-3 rounded-xl transition-all ${
                          editingProjectId === p.id 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                        }`}
                        title="Edit Project"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteProject(p.id)} 
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Delete Project"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white">
                    <Plus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">No projects found. Add your first one!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fade-in max-w-4xl grid lg:grid-cols-2 gap-12">
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">Security Settings</h2>
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="text-blue-600 w-5 h-5 mt-1 shrink-0" />
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                      <strong>Device Sync:</strong> Always use the <strong>Sync Token</strong> to transfer settings (including 2FA) to new devices.
                    </p>
                  </div>
                </div>
              </div>

              {updateSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 animate-fade-in">
                  <CheckCircle2 size={20} />
                  <span className="font-bold">Settings updated!</span>
                </div>
              )}

              <form onSubmit={handleUpdateCredentials} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 size={18} className="text-blue-600" />
                  Basic Credentials
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Username</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase mb-2 block">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl"
                >
                  <Save size={18} /> Save Credentials
                </button>
              </form>

              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Smartphone size={18} className="text-blue-400" />
                  Cross-Device Sync
                </h3>
                <div className="bg-slate-800 p-4 rounded-xl break-all font-mono text-[10px] text-blue-300 border border-slate-700 relative">
                  {syncToken}
                  <button 
                    onClick={() => copyToClipboard(syncToken)}
                    className="absolute top-2 right-2 p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all text-white"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    2FA Security
                  </h3>
                  {JSON.parse(localStorage.getItem('admin_credentials') || '{}').twoFactorSecret ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded-full">Active</span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black uppercase rounded-full">Disabled</span>
                  )}
                </div>

                {!isSettingUp2FA ? (
                   <div>
                     {JSON.parse(localStorage.getItem('admin_credentials') || '{}').twoFactorSecret ? (
                       <div className="space-y-6">
                         <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                           <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                             <CheckCircle2 size={24} />
                           </div>
                           <p className="text-xs font-medium text-emerald-800">
                             Your account is protected with Google Authenticator. Login will require a 6-digit code.
                           </p>
                         </div>
                         <button 
                           onClick={disable2FA}
                           className="w-full py-4 border-2 border-red-50 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all"
                         >
                           Disable 2FA
                         </button>
                       </div>
                     ) : (
                       <div className="space-y-6 text-center">
                         <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
                            <QrCode size={40} />
                         </div>
                         <p className="text-sm text-slate-500 leading-relaxed font-medium">
                           Add an extra layer of security. Use Google Authenticator or any TOTP app to protect your dashboard.
                         </p>
                         <button 
                           onClick={initiate2FASetup}
                           className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                         >
                           <QrCode size={18} /> Setup Authenticator
                         </button>
                       </div>
                     )}
                   </div>
                ) : (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center space-y-6">
                      <h4 className="font-bold text-slate-800">Step 1: Scan QR Code</h4>
                      <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-inner inline-block">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`otpauth://totp/Rabbi Portfolio:${newUsername}?secret=${tempSecret}&issuer=Rabbi Portfolio`)}`} 
                          alt="2FA QR Code" 
                          className="w-40 h-40"
                        />
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest break-all px-6">
                        Secret Key: {tempSecret}
                      </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="font-bold text-slate-800 text-center">Step 2: Enter 6-digit Code</h4>
                       <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500"
                        value={setupCode}
                        onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                       />
                       <div className="flex gap-4 pt-4">
                         <button onClick={() => setIsSettingUp2FA(false)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
                         <button 
                           onClick={confirm2FASetup}
                           disabled={setupCode.length !== 6}
                           className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-xl disabled:opacity-50"
                         >
                           Enable 2FA
                         </button>
                       </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-blue-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-300" />
                  Security Tips
                </h3>
                <ul className="text-xs space-y-4 text-blue-100 font-medium">
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-black">•</span>
                    Always download your 2FA app recovery codes.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-black">•</span>
                    If you lose access, clear your browser's local storage to reset everything.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-black">•</span>
                    Use a different password than your social accounts.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
