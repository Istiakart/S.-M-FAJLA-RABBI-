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
import { db } from './services/firebase';
import { 
  onSnapshot, 
  doc, 
  collection, 
  addDoc 
} from 'firebase/firestore';
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [identity, setIdentity] = useState<SiteIdentity>(DEFAULT_IDENTITY);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    // 1. Sync Site Identity
    const unsubIdentity = onSnapshot(doc(db, "site_config", "identity"), (docSnap) => {
      if (docSnap.exists()) {
        setIdentity(docSnap.data() as SiteIdentity);
      }
      setIsDataLoaded(true);
    }, (error) => {
      console.error("Identity sync failed", error);
      setIsDataLoaded(true); // Proceed anyway to show static content
    });

    // 2. Sync Projects
    const unsubProjects = onSnapshot(collection(db, "projects"), (querySnap) => {
      const projs: Project[] = [];
      querySnap.forEach((doc) => {
        projs.push({ id: doc.id, ...doc.data() } as Project);
      });
      if (projs.length > 0) {
        setProjects(projs.sort((a, b) => (b as any).createdAt?.seconds - (a as any).createdAt?.seconds));
      } else {
        setProjects(INITIAL_PROJECTS);
      }
    });

    // 3. Sync Tools
    const unsubTools = onSnapshot(collection(db, "tools"), (querySnap) => {
      const tl: Tool[] = [];
      querySnap.forEach((doc) => {
        tl.push({ id: doc.id, ...doc.data() } as Tool);
      });
      if (tl.length > 0) {
        setTools(tl);
      } else {
        setTools(INITIAL_TOOLS);
      }
    });

    // 4. Log Visit to Firestore
    const logVisit = async () => {
      try {
        await addDoc(collection(db, "visits"), {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          platform: (navigator as any).platform || 'Unknown',
          page: window.location.hash || 'Home'
        });
      } catch (e) {
        console.error("Visit log failed", e);
      }
    };
    logVisit();

    return () => {
      unsubIdentity();
      unsubProjects();
      unsubTools();
    };
  }, []);

  if (isAdminMode) return <AdminPanel onClose={() => setIsAdminMode(false)} onProjectsUpdate={() => {}} />;

  if (!isDataLoaded) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] animate-pulse">Initializing Ecosystem...</div>
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