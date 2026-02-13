
import React, { useState, useEffect, useCallback } from 'react';
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
import { PROJECTS as INITIAL_PROJECTS, INITIAL_TOOLS } from './constants';
import { Project, Visit, SiteIdentity, Tool } from './types';

const DEFAULT_IDENTITY: SiteIdentity = {
  logoUrl: "https://media.licdn.com/dms/image/v2/D5603AQE_fwNq-orBwQ/profile-displayphoto-crop_800_800/B56Zv2bSypKkAI-/0/1769365909615?e=1772064000&v=beta&t=IwBiTqYtuTzrpjLaMJshM6rhwMQ0bX2R6lT8IrNo5BA",
  profileImageUrl: "https://media.licdn.com/dms/image/v2/D5603AQE_fwNq-orBwQ/profile-displayphoto-crop_800_800/B56Zv2bSypKkAI-/0/1769365909615?e=1772064000&v=beta&t=IwBiTqYtuTzrpjLaMJshM6rhwMQ0bX2R6lT8IrNo5BA",
  cvUrl: ""
};

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [identity, setIdentity] = useState<SiteIdentity>(DEFAULT_IDENTITY);

  const loadSiteData = useCallback(() => {
    // Load Projects with Merge Logic
    const storedProjectsRaw = localStorage.getItem('rabbi_portfolio_projects');
    if (storedProjectsRaw) {
      const stored = JSON.parse(storedProjectsRaw);
      if (stored.length < 3) {
        const merged = [...INITIAL_PROJECTS];
        stored.forEach((p: Project) => {
          if (!merged.find(m => m.id === p.id)) merged.unshift(p);
        });
        setProjects(merged);
        localStorage.setItem('rabbi_portfolio_projects', JSON.stringify(merged));
      } else {
        setProjects(stored);
      }
    } else {
      setProjects(INITIAL_PROJECTS);
      localStorage.setItem('rabbi_portfolio_projects', JSON.stringify(INITIAL_PROJECTS));
    }

    // Load Tools
    const storedToolsRaw = localStorage.getItem('rabbi_portfolio_tools');
    if (storedToolsRaw) {
      setTools(JSON.parse(storedToolsRaw));
    } else {
      setTools(INITIAL_TOOLS);
      localStorage.setItem('rabbi_portfolio_tools', JSON.stringify(INITIAL_TOOLS));
    }

    // Load Identity
    const storedIdentity = localStorage.getItem('rabbi_site_identity');
    if (storedIdentity) {
      try {
        const parsedIdentity = JSON.parse(storedIdentity);
        setIdentity(prev => ({ ...prev, ...parsedIdentity }));
      } catch (e) {
        console.error("Failed to parse identity", e);
      }
    }
  }, []);

  useEffect(() => {
    loadSiteData();

    const logVisit = () => {
      const visits: Visit[] = JSON.parse(localStorage.getItem('rabbi_portfolio_visits') || '[]');
      const newVisit: Visit = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: (navigator as any).platform || 'Unknown',
        page: window.location.hash || 'Home'
      };
      const updatedVisits = [newVisit, ...visits].slice(0, 500);
      localStorage.setItem('rabbi_portfolio_visits', JSON.stringify(updatedVisits));
    };

    logVisit();
    window.addEventListener('hashchange', logVisit);
    return () => window.removeEventListener('hashchange', logVisit);
  }, [loadSiteData]);

  if (isAdminMode) {
    return (
      <AdminPanel 
        onClose={() => setIsAdminMode(false)} 
        onProjectsUpdate={loadSiteData}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Header logoUrl={identity.logoUrl} />
      <main>
        <Hero 
          profileImageUrl={identity.profileImageUrl} 
          onDownloadCv={() => setIsCvModalOpen(true)} 
        />
        <About profileImageUrl={identity.profileImageUrl} />
        <Services />
        <Portfolio projects={projects} />
        <Tools tools={tools} />
        <ZoomBooking />
        <Contact 
          profileImageUrl={identity.profileImageUrl} 
          onDownloadCv={() => setIsCvModalOpen(true)}
        />
      </main>
      <Footer logoUrl={identity.logoUrl} onAdminLogin={() => setIsAdminMode(true)} />
      
      <CVModal 
        isOpen={isCvModalOpen} 
        onClose={() => setIsCvModalOpen(false)} 
        cvUrl={identity.cvUrl} 
      />
    </div>
  );
};

export default App;
