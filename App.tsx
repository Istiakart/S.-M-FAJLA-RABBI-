
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
import { PROJECTS as INITIAL_PROJECTS } from './constants';
import { Project, Visit, SiteIdentity } from './types';

const DEFAULT_IDENTITY: SiteIdentity = {
  logoUrl: "https://media.licdn.com/dms/image/v2/D5603AQE_fwNq-orBwQ/profile-displayphoto-crop_800_800/B56Zv2bSypKkAI-/0/1769365909615?e=1772064000&v=beta&t=IwBiTqYtuTzrpjLaMJshM6rhwMQ0bX2R6lT8IrNo5BA",
  profileImageUrl: "https://media.licdn.com/dms/image/v2/D5603AQE_fwNq-orBwQ/profile-displayphoto-crop_800_800/B56Zv2bSypKkAI-/0/1769365909615?e=1772064000&v=beta&t=IwBiTqYtuTzrpjLaMJshM6rhwMQ0bX2R6lT8IrNo5BA"
};

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [identity, setIdentity] = useState<SiteIdentity>(DEFAULT_IDENTITY);

  const loadSiteData = () => {
    // Load Projects
    const storedProjectsRaw = localStorage.getItem('rabbi_portfolio_projects');
    let currentProjects: Project[] = [];
    
    if (storedProjectsRaw) {
      currentProjects = JSON.parse(storedProjectsRaw);
      const currentIds = new Set(currentProjects.map(p => p.id));
      const missingProjects = INITIAL_PROJECTS.filter(p => !currentIds.has(p.id));
      if (missingProjects.length > 0) {
        currentProjects = [...currentProjects, ...missingProjects];
        localStorage.setItem('rabbi_portfolio_projects', JSON.stringify(currentProjects));
      }
    } else {
      currentProjects = INITIAL_PROJECTS;
      localStorage.setItem('rabbi_portfolio_projects', JSON.stringify(INITIAL_PROJECTS));
    }
    setProjects(currentProjects);

    // Load Identity
    const storedIdentity = localStorage.getItem('rabbi_site_identity');
    if (storedIdentity) {
      setIdentity(JSON.parse(storedIdentity));
    }
  };

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
  }, []);

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
        <Hero profileImageUrl={identity.profileImageUrl} />
        <About profileImageUrl={identity.profileImageUrl} />
        <Services />
        <Portfolio projects={projects} />
        <Tools />
        <ZoomBooking />
        <Contact profileImageUrl={identity.profileImageUrl} />
      </main>
      <Footer logoUrl={identity.logoUrl} onAdminLogin={() => setIsAdminMode(true)} />
    </div>
  );
};

export default App;
