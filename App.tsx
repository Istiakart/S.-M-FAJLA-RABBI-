import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Tools from './components/Tools';
import ZoomBooking from './components/ZoomBooking';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import CVModal from './components/CVModal';
import { Project, SiteIdentity, Tool } from './types';
import { PROJECTS as INITIAL_PROJECTS, INITIAL_TOOLS } from './constants';

const DEFAULT_IDENTITY: SiteIdentity = {
  logoUrl: "https://media.licdn.com/dms/image/v2/D5603AQE_fwNq-orBwQ/profile-displayphoto-crop_800_800/B56Zv2bSypKkAI-/0/1769365909615?e=1772064000&v=beta&t=IwBiTqYtuTzrpjLaMJshM6rhwMQ0bX2R6lT8IrNo5BA",
  profileImageUrl: "https://media.licdn.com/dms/image/v2/D5603AQE_fwNq-orBwQ/profile-displayphoto-crop_800_800/B56Zv2bSypKkAI-/0/1769365909615?e=1772064000&v=beta&t=IwBiTqYtuTzrpjLaMJshM6rhwMQ0bX2R6lT8IrNo5BA",
  cvUrl: ""
};

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('portfolio_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [identity, setIdentity] = useState<SiteIdentity>(() => {
    const saved = localStorage.getItem('portfolio_identity');
    return saved ? JSON.parse(saved) : DEFAULT_IDENTITY;
  });

  const [tools, setTools] = useState<Tool[]>(() => {
    const saved = localStorage.getItem('portfolio_tools');
    return saved ? JSON.parse(saved) : INITIAL_TOOLS;
  });

  const [adminCreds, setAdminCreds] = useState(() => {
    const saved = localStorage.getItem('portfolio_admin_creds');
    return saved ? JSON.parse(saved) : { 
      username: 'admin', 
      password: 'admin123', 
      twoFactorSecret: 'JBSWY3DPEHPK3PXP', 
      twoFactorEnabled: false 
    };
  });

  // Real-time Visitor Tracking Logic
  useEffect(() => {
    const trackVisit = () => {
      const currentVisits = parseInt(localStorage.getItem('portfolio_total_visits') || '0', 10);
      localStorage.setItem('portfolio_total_visits', (currentVisits + 1).toString());
    };
    
    // Only track if not in admin mode to avoid counting self-admin actions as unique visits
    if (!isAdminMode) {
      trackVisit();
    }
  }, [isAdminMode]);

  useEffect(() => {
    localStorage.setItem('portfolio_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('portfolio_identity', JSON.stringify(identity));
  }, [identity]);

  useEffect(() => {
    localStorage.setItem('portfolio_tools', JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    localStorage.setItem('portfolio_admin_creds', JSON.stringify(adminCreds));
  }, [adminCreds]);

  if (isAdminMode) {
    return (
      <AdminPanel 
        onClose={() => setIsAdminMode(false)} 
        onProjectsUpdate={setProjects} 
        currentProjects={projects}
        currentIdentity={identity}
        onIdentityUpdate={setIdentity}
        currentTools={tools}
        onToolsUpdate={setTools}
        adminCreds={adminCreds}
        onAdminCredsUpdate={setAdminCreds}
      />
    );
  }

  return (
    <div className="min-h-screen animate-fade-in bg-slate-50">
      <Header logoUrl={identity.logoUrl} />
      <main>
        <Hero profileImageUrl={identity.profileImageUrl} onDownloadCv={() => setIsCvModalOpen(true)} />
        <About profileImageUrl={identity.profileImageUrl} />
        <Services />
        <Portfolio projects={projects} />
        <Tools tools={tools} />
        <ZoomBooking />
        <Contact profileImageUrl={identity.profileImageUrl} onDownloadCv={() => setIsCvModalOpen(true)} />
      </main>
      <Footer logoUrl={identity.logoUrl} onAdminLogin={() => setIsAdminMode(true)} />
      <CVModal isOpen={isCvModalOpen} onClose={() => setIsCvModalOpen(false)} cvUrl={identity.cvUrl} />
    </div>
  );
};

export default App;