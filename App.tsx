
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

/**
 * 📢 GLOBAL SYNC ID CONFIGURATION
 * -------------------------------------------
 * ১. অ্যাডমিন প্যানেল (Sync & Security) থেকে ID জেনারেট করুন।
 * ২. সেই ID টি নিচের "PASTE_YOUR_ID_HERE" এর জায়গায় বসান।
 * ৩. এরপর সাইট হোস্ট করলে আপনার সব আপডেট ক্লায়েন্ট অটোমেটিক দেখতে পাবে।
 */
const PUBLIC_SYNC_ID = "PASTE_YOUR_ID_HERE"; 

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
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const pullLatestData = useCallback(async (syncId: string) => {
    if (!syncId || syncId === "PASTE_YOUR_ID_HERE" || syncId.length < 5) return false;
    try {
      const response = await fetch(`https://jsonblob.com/api/jsonBlob/${syncId}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.projects) setProjects(data.projects);
        if (data.tools) setTools(data.tools);
        if (data.identity) setIdentity(data.identity);
        return true;
      }
    } catch (e) {
      console.warn("Cloud sync ignored (Invalid ID or connection issues)");
    }
    return false;
  }, []);

  const loadSiteData = useCallback(async () => {
    // 1. Try Global Sync (Public View)
    const fetchedGlobally = await pullLatestData(PUBLIC_SYNC_ID);
    if (fetchedGlobally) {
      setIsDataLoaded(true);
      return;
    }

    // 2. Try Local Sync ID (Admin's private session)
    const privateSyncId = localStorage.getItem('rabbi_sync_blob_id');
    if (privateSyncId) {
      await pullLatestData(privateSyncId);
    }

    // 3. Fallback to LocalStorage
    const storedProjects = localStorage.getItem('rabbi_portfolio_projects');
    if (storedProjects) setProjects(JSON.parse(storedProjects));
    else setProjects(INITIAL_PROJECTS);

    const storedTools = localStorage.getItem('rabbi_portfolio_tools');
    if (storedTools) setTools(JSON.parse(storedTools));
    else setTools(INITIAL_TOOLS);

    const storedIdentity = localStorage.getItem('rabbi_site_identity');
    if (storedIdentity) setIdentity(prev => ({ ...prev, ...JSON.parse(storedIdentity) }));
    
    setIsDataLoaded(true);
  }, [pullLatestData]);

  useEffect(() => {
    loadSiteData();
    const logVisit = () => {
      const visits = JSON.parse(localStorage.getItem('rabbi_portfolio_visits') || '[]');
      const newVisit = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: (navigator as any).platform || 'Unknown',
        page: window.location.hash || 'Home'
      };
      localStorage.setItem('rabbi_portfolio_visits', JSON.stringify([newVisit, ...visits].slice(0, 500)));
    };
    logVisit();
    window.addEventListener('hashchange', logVisit);
    return () => window.removeEventListener('hashchange', logVisit);
  }, [loadSiteData]);

  if (isAdminMode) return <AdminPanel onClose={() => setIsAdminMode(false)} onProjectsUpdate={loadSiteData} />;

  if (!isDataLoaded) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] animate-pulse">Syncing Portfolio Data...</div>
      </div>
    </div>
  );

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
