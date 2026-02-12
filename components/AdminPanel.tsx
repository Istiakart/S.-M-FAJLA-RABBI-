
import React, { useState, useEffect, useRef } from 'react';
import { Project, Visit, SiteIdentity } from '../types';
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
  FileSpreadsheet,
  Camera,
  Palette
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
  const [activeTab, setActiveTab] = useState<'analytics' | 'projects' | 'branding' | 'settings'>('analytics');
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [brandingSuccess, setBrandingSuccess] = useState(false);
  const [syncToken, setSyncToken] = useState('');
  
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [tempSecret, setTempSecret] = useState('');
  const [setupCode, setSetupCode] = useState('');

  // Initialize identity from localStorage immediately to prevent state reset issues
  const [identity, setIdentity] = useState<SiteIdentity>(() => {
    const saved = localStorage.getItem('rabbi_site_identity');
    if (saved) return JSON.parse(saved);
    return {
      logoUrl: "https://media.licdn.com/dms/image/v2/D5603AQE_fwNq-orBwQ/profile-displayphoto-crop_800_800/B56Zv2bSypKkAI-/0/1769365909615?e=1772064000&v=beta&t=IwBiTqYtuTzrpjLaMJshM6rhwMQ0bX2R6lT8IrNo5BA",
      profileImageUrl: "https://media.licdn.com/dms/image/v2/D5603AQE_fwNq-orBwQ/profile-displayphoto-crop_800_800/B56Zv2bSypKkAI-/0/1769365909615?e=1772064000&v=beta&t=IwBiTqYtuTzrpjLaMJshM6rhwMQ0bX2R6lT8IrNo5BA"
    };
  });

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

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const blobToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleIdentityImageSelect = async (type: 'logo' | 'profile', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await blobToBase64(file);
      setIdentity(prev => ({ 
        ...prev, 
        [type === 'logo' ? 'logoUrl' : 'profileImageUrl']: base64 
      }));
    } catch (err) {
      console.error("Image upload failed", err);
      alert("Failed to process image.");
    }
  };

  const saveBrandingIdentity = () => {
    try {
      localStorage.setItem('rabbi_site_identity', JSON.stringify(identity));
      onProjectsUpdate();
      setBrandingSuccess(true);
      setTimeout(() => setBrandingSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save branding", err);
      alert("Storage limit reached or failed to save. Try using smaller images.");
    }
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
      const base64 = await blobToBase64(file as File);
      newImageUrls.push(base64);
    }
    setNewProject({ ...newProject, imageUrls: [...currentImages, ...newImageUrls] });
  };

  const removeImage = (index: number) => {
    const currentImages = newProject.imageUrls || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setNewProject({ ...newProject, imageUrls: updatedImages });
  };

  const handleAiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsAiScanning(true);
    try {
      const base64 = await blobToBase64(file as File);
      const pureBase64 = base64.split(',')[1] || "";
      const data = await analyzeMarketingImage(pureBase64, (file as File).type);
      const currentImages = newProject.imageUrls || [];
      setNewProject({
        ...newProject,
        title: data.title || '',
        category: (['E-commerce', 'Leads', 'Engagement', 'Website Build'].includes(data.category) ? data.category : 'E-commerce') as any,
        results: data.results || '',
        efficiency: data.efficiency || '',
        description: data.description || '',
        imageUrls: currentImages.length === 0 ? [base64] : currentImages
      });
    } catch (err) {
      console.error(err);
      alert("AI could not read that image.");
    } finally {
      setIsAiScanning(false);
    }
  };

  const resetForm = () => {
    setNewProject({ title: '', category: 'E-commerce', results: '', efficiency: '', description: '', imageUrls: [], link: '' });
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

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <form onSubmit={handleLogin} className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg ring-4 ring-blue-50">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Admin Portal</h1>
              <p className="text-slate-500 text-sm font-medium">Login to manage identity & results</p>
            </div>
            <div className="space-y-4 mb-6">
              {loginStep === 'creds' ? (
                !useSyncToken ? (
                  <>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><UserIcon size={18}/></div>
                      <input type="text" placeholder="Username" className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={18}/></div>
                      <input 
                        type={showLoginPassword ? "text" : "password"} 
                        placeholder="Password" 
                        className="w-full bg-slate-50 border border-slate-200 pl-12 pr-12 py-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" 
                        value={loginPassword} 
                        onChange={(e) => setLoginPassword(e.target.value)} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showLoginPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </>
                ) : (
                  <textarea placeholder="Paste Sync Token..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl h-32 text-xs outline-none focus:ring-2 focus:ring-blue-500/20" value={syncTokenInput} onChange={(e) => setSyncTokenInput(e.target.value)} />
                )
              ) : (
                <div className="space-y-4 text-center">
                   <div className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Enter 2FA Code</div>
                   <input type="text" maxLength={6} placeholder="000000" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-center text-3xl font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500/20" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} autoFocus />
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">Next</button>
            </div>
            
            <button 
              type="button" 
              onClick={() => setUseSyncToken(!useSyncToken)}
              className="w-full mt-6 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-blue-400 transition-colors"
            >
              {useSyncToken ? 'Back to standard login' : 'Use Sync Token Access'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-hidden font-sans">
      <div className="w-full bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0 shadow-2xl z-[130]">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2 hover:bg-slate-800 rounded-xl transition-all"><Menu size={28} /></button>
          <div className="text-white">
            <div className="text-sm font-black uppercase tracking-tighter">S M FAJLA <span className="text-blue-400">RABBI</span></div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Control Center</div>
          </div>
        </div>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-[140] backdrop-blur-md" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-[150] w-80 bg-slate-900 p-8 flex flex-col transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl border-r border-slate-800`}>
        <div className="flex items-center justify-between mb-16 text-white">
           <div className="font-black">ADMIN MENU</div>
           <X onClick={() => setIsSidebarOpen(false)} className="cursor-pointer" />
        </div>
        <nav className="flex-1 space-y-3">
          <button onClick={() => handleTabChange('analytics')} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold transition-all text-sm ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Users size={22} /> Analytics</button>
          <button onClick={() => handleTabChange('projects')} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold transition-all text-sm ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Plus size={22} /> Portfolio</button>
          <button onClick={() => handleTabChange('branding')} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold transition-all text-sm ${activeTab === 'branding' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Palette size={22} /> Branding</button>
          <button onClick={() => handleTabChange('settings')} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold transition-all text-sm ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><SettingsIcon size={22} /> Security</button>
        </nav>
        <button onClick={onClose} className="w-full p-5 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 mt-auto flex items-center gap-4"><LogOut size={22} /> Logout</button>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 text-slate-900 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
          
          {activeTab === 'branding' && (
            <div className="animate-fade-in space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">Site Identity</h2>
                  <p className="text-slate-500 font-medium mt-2">Manage your professional appearance across the landing page.</p>
                </div>
                {brandingSuccess && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full animate-fade-in shadow-sm">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Settings Updated Successfully</span>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                {/* Logo Management */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><Camera size={24} /></div>
                    <h3 className="text-xl font-bold">Logo Configuration</h3>
                  </div>
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center relative group">
                      {identity.logoUrl ? (
                        <img src={identity.logoUrl} className="w-full h-full object-contain" alt="Logo Preview" />
                      ) : (
                        <div className="text-slate-300"><ImageIcon size={40} /></div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <Camera className="text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleIdentityImageSelect('logo', e)} />
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Header & Footer Logo</p>
                      <p className="text-[10px] text-slate-400">Click circle to change</p>
                    </div>
                  </div>
                </div>

                {/* Profile Picture Management */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600"><UserIcon size={24} /></div>
                    <h3 className="text-xl font-bold">Profile Portrait</h3>
                  </div>
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-slate-100 bg-slate-50 relative group">
                      {identity.profileImageUrl ? (
                        <img src={identity.profileImageUrl} className="w-full h-full object-cover object-top" alt="Profile Preview" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><UserIcon size={40} /></div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <Camera className="text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleIdentityImageSelect('profile', e)} />
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Hero & About Image</p>
                      <p className="text-[10px] text-slate-400">Recommended: High quality portrait</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                 <button 
                  onClick={saveBrandingIdentity}
                  className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 group"
                >
                  <Save size={24} className="group-hover:scale-110 transition-transform" />
                  Save Branding Settings
                </button>
              </div>
              
              <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white flex items-center gap-6 shadow-2xl">
                <Sparkles size={40} className="shrink-0" />
                <div>
                  <h4 className="font-bold text-lg">Branding Sync Active</h4>
                  <p className="text-blue-100 text-sm">After uploading images, click "Save Branding Settings" to apply changes globally across the site.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-12">Traffic Insight</h2>
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                      <tr><th className="px-8 py-5">Timestamp</th><th className="px-8 py-5">Source</th><th className="px-8 py-5 text-right">Node</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visits.slice(0, 50).map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-8 py-6 text-xs font-bold text-slate-600">{new Date(v.timestamp).toLocaleString()}</td>
                          <td className="px-8 py-6 text-xs font-bold text-slate-800">{v.platform}</td>
                          <td className="px-8 py-6 text-right"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black">{v.page}</span></td>
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
                <h2 className="text-3xl font-black mb-10">{editingProjectId ? 'Modify Project' : 'New Project'}</h2>
                <div className={`mb-8 p-10 rounded-[3rem] border-2 border-dashed ${isAiScanning ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200'}`}>
                  {isAiScanning ? <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-blue-600 mb-2" />Scanning...</div> : 
                  <label className="flex flex-col items-center cursor-pointer"><Sparkles className="text-blue-500 mb-2" /><span>AI Magic Upload</span><input type="file" accept="image/*" className="hidden" onChange={handleAiUpload} /></label>}
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl space-y-6">
                  <input type="text" placeholder="Project Title" className="w-full bg-slate-50 border p-4 rounded-2xl" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} />
                  <select className="w-full bg-slate-50 border p-4 rounded-2xl" value={newProject.category} onChange={(e) => setNewProject({...newProject, category: e.target.value as any})}>
                    <option value="E-commerce">E-commerce</option><option value="Leads">Leads</option><option value="Engagement">Engagement</option><option value="Website Build">Website Build</option>
                  </select>
                  <div className="grid grid-cols-5 gap-2">
                    {newProject.imageUrls?.map((url, i) => (
                      <div key={i} className="relative aspect-square border bg-slate-50 rounded-lg overflow-hidden group">
                        <img src={url} className="w-full h-full object-contain" />
                        <X onClick={() => removeImage(i)} className="absolute top-1 right-1 text-red-500 cursor-pointer opacity-0 group-hover:opacity-100" />
                      </div>
                    ))}
                    {(newProject.imageUrls?.length || 0) < 10 && <label className="aspect-square border-2 border-dashed flex items-center justify-center cursor-pointer rounded-lg"><Plus /><input type="file" multiple accept="image/*" className="hidden" onChange={handleProjectImageUpload} /></label>}
                  </div>
                  <input type="text" placeholder="Results (e.g. 142 Messages)" className="w-full bg-slate-50 border p-4 rounded-2xl" value={newProject.results} onChange={(e) => setNewProject({...newProject, results: e.target.value})} />
                  <input type="text" placeholder="Efficiency (e.g. BDT 8.20/Conv)" className="w-full bg-slate-50 border p-4 rounded-2xl" value={newProject.efficiency} onChange={(e) => setNewProject({...newProject, efficiency: e.target.value})} />
                  <textarea placeholder="Description" className="w-full bg-slate-50 border p-4 rounded-2xl h-32" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
                  <button onClick={handleAddOrUpdateProject} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold">{editingProjectId ? 'Sync Changes' : 'Publish Asset'}</button>
                </div>
              </div>
              <div className="xl:col-span-3">
                <h2 className="text-3xl font-black mb-10">Live Assets</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {projects.map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 group relative">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center">
                          {p.imageUrls && p.imageUrls[0] ? <img src={p.imageUrls[0]} className="w-full h-full object-contain" /> : p.category.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-lg">{p.title}</div>
                          <div className="text-xs text-slate-400 uppercase font-black">{p.category}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <button onClick={() => startEdit(p)} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold">Edit</button>
                        <button onClick={() => deleteProject(p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in max-w-2xl mx-auto space-y-12 pb-20">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Security Protocols</h2>
              
              {/* Access Credentials */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900"><UserIcon size={24} /></div>
                  <h3 className="text-xl font-bold">Access Credentials</h3>
                </div>
                <form onSubmit={handleUpdateCredentials} className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><UserIcon size={18}/></div>
                    <input type="text" className="w-full bg-slate-50 border p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={18}/></div>
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      placeholder="New Password" 
                      className="w-full bg-slate-50 border p-4 pl-12 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showNewPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-black transition-colors">Update Access</button>
                  {updateSuccess && <div className="text-center text-emerald-600 text-xs font-bold animate-pulse">Credentials updated successfully!</div>}
                </form>
              </div>

              {/* Google Authenticator (2FA) */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><SmartphoneNfc size={24} /></div>
                  <h3 className="text-xl font-bold">Two-Factor Authentication</h3>
                </div>
                
                {JSON.parse(localStorage.getItem('admin_credentials') || '{}').twoFactorSecret ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4 text-emerald-700">
                      <CheckCircle2 size={32} />
                      <div>
                        <div className="font-bold">2FA is Enabled</div>
                        <div className="text-xs">Your account is protected with Google Authenticator.</div>
                      </div>
                    </div>
                    <button onClick={disable2FA} className="w-full py-4 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors">Disable Authenticator</button>
                  </div>
                ) : !isSettingUp2FA ? (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500 leading-relaxed">Secure your admin panel with Google Authenticator. You will need to enter a 6-digit code every time you login.</p>
                    <button onClick={initiate2FASetup} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-100">
                      <KeyRound size={20}/>
                      Enable Google Authenticator
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8 animate-fade-in-up">
                    <div className="text-center space-y-4">
                      <div className="inline-block p-4 bg-white border-8 border-slate-50 rounded-[2rem] shadow-sm">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                            new OTPAuth.TOTP({
                              issuer: "Rabbi Portfolio",
                              label: newUsername,
                              algorithm: "SHA1",
                              digits: 6,
                              period: 30,
                              secret: tempSecret,
                            }).toString()
                          )}&size=200x200`} 
                          alt="2FA QR Code" 
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-xs font-bold text-slate-400">Scan this code with Google Authenticator app</p>
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Verification Code</div>
                      <input 
                        type="text" 
                        maxLength={6} 
                        className="w-full bg-slate-50 border p-4 rounded-2xl text-center text-3xl font-black tracking-[0.4em] outline-none focus:ring-2 focus:ring-blue-600/20" 
                        placeholder="000000"
                        value={setupCode}
                        onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                      />
                      <div className="flex gap-4">
                        <button onClick={() => setIsSettingUp2FA(false)} className="flex-1 py-4 text-slate-400 font-bold">Cancel</button>
                        <button onClick={confirm2FASetup} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold">Confirm</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sync Token Container */}
              <div className="bg-slate-900 text-white p-10 rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[80px]"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                   <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400"><RefreshCw size={24} /></div>
                   <h3 className="text-xl font-bold">Sync Token</h3>
                </div>
                <p className="text-slate-400 text-sm relative z-10">Use this token to quickly sync your admin session across different devices without entering credentials.</p>
                <div className="bg-slate-800 p-6 rounded-2xl text-[10px] break-all font-mono text-blue-300 relative group z-10 border border-slate-700">
                  {syncToken}
                  <button onClick={() => copyToClipboard(syncToken)} className="absolute top-2 right-2 p-3 bg-slate-700 hover:bg-blue-600 rounded-xl transition-all shadow-lg active:scale-90"><Copy size={16}/></button>
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
