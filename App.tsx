
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Tools from './components/Tools';
import Process from './components/Process';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import ZoomBooking from './components/ZoomBooking';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import CVModal from './components/CVModal';
import { Loader2 } from 'lucide-react';
import { Project, SiteIdentity, Tool, Testimonial, FAQData } from './types';
import { PROJECTS as INITIAL_PROJECTS, INITIAL_TOOLS, TESTIMONIALS as INITIAL_TESTIMONIALS, FAQS as INITIAL_FAQS } from './constants';

const DEFAULT_IDENTITY: SiteIdentity = {
  logoUrl: "https://vutsekzfzgvv08nc.public.blob.vercel-storage.com/Global%20Logo/Gemini_Generated_Image_lxbxgblxbxgblxbx%20%281%29.png",
  profileImageUrl: "https://media.licdn.com/dms/image/v2/D5603AQE_fwNq-orBwQ/profile-displayphoto-crop_800_800/B56Zv2bSypKkAI-/0/1769365909615?e=1772064000&v=beta&t=IwBiTqYtuTzrpjLaMJshM6rhwMQ0bX2R6lT8IrNo5BA",
  cvUrl: "",
  googleFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeBhaQwxVKtQn3ibvqPZ7-FGnUkml9EO6P5EYBZIvWCnCoJeg/viewform",
  googleSheetUrl: "https://docs.google.com/spreadsheets/d/1JDHDIp3c3GSwhemS4VvtWSowoNLHFxAIvTf91j1zQ2g/edit?gid=1373341915#gid=1373341915",
  whatsAppNumber: "8801956358439",
  linkedInUrl: "https://www.linkedin.com/in/s-m-fajla-rabbi-0ba589367/"
};

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [identity, setIdentity] = useState<SiteIdentity>(DEFAULT_IDENTITY);
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS.map((t, i) => ({ ...t, id: `t-${i}` })));
  const [faqs, setFaqs] = useState<FAQData[]>(INITIAL_FAQS.map((f, i) => ({ ...f, id: `f-${i}` })));

  const [adminCreds, setAdminCreds] = useState(() => {
    const saved = localStorage.getItem('portfolio_admin_creds');
    return saved ? JSON.parse(saved) : { 
      username: 'admin', 
      password: 'admin123', 
      twoFactorSecret: 'JBSWY3DPEHPK3PXP', 
      twoFactorEnabled: false 
    };
  });

  useEffect(() => {
    const initializeData = async () => {
      setIsSyncing(true);
      const urlParams = new URLSearchParams(window.location.search);
      let cloudUrl = urlParams.get('config') || localStorage.getItem('global_config_url');

      if (cloudUrl) {
        try {
          const response = await fetch(cloudUrl);
          if (response.ok) {
            const cloudData = await response.json();
            if (cloudData.projects) setProjects(cloudData.projects);
            if (cloudData.identity) setIdentity({ ...DEFAULT_IDENTITY, ...cloudData.identity });
            if (cloudData.tools) setTools(cloudData.tools);
            if (cloudData.testimonials) setTestimonials(cloudData.testimonials);
            if (cloudData.faqs) setFaqs(cloudData.faqs);
            localStorage.setItem('global_config_url', cloudUrl);
            setIsSyncing(false);
            return;
          }
        } catch (e) {
          console.error("Failed to fetch cloud config:", e);
        }
      }

      const savedProjects = localStorage.getItem('portfolio_projects');
      const savedIdentity = localStorage.getItem('portfolio_identity');
      const savedTools = localStorage.getItem('portfolio_tools');
      const savedTestimonials = localStorage.getItem('portfolio_testimonials');
      const savedFaqs = localStorage.getItem('portfolio_faqs');

      if (savedProjects) setProjects(JSON.parse(savedProjects));
      if (savedIdentity) setIdentity({ ...DEFAULT_IDENTITY, ...JSON.parse(savedIdentity) });
      if (savedTools) setTools(JSON.parse(savedTools));
      if (savedTestimonials) setTestimonials(JSON.parse(savedTestimonials));
      if (savedFaqs) setFaqs(JSON.parse(savedFaqs));
      
      setIsSyncing(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    localStorage.setItem('portfolio_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('portfolio_identity', JSON.stringify(identity));
    localStorage.setItem('portfolio_testimonials', JSON.stringify(testimonials));
    localStorage.setItem('portfolio_faqs', JSON.stringify(faqs));
  }, [identity, testimonials, faqs]);

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
        testimonials={testimonials}
        onTestimonialsUpdate={setTestimonials}
        faqs={faqs}
        onFaqsUpdate={setFaqs}
        adminCreds={adminCreds}
        onAdminCredsUpdate={setAdminCreds}
      />
    );
  }

  return (
    <div className="min-h-screen animate-fade-in bg-slate-50">
      <Header logoUrl={identity.logoUrl} googleFormUrl={identity.googleFormUrl} />
      <main>
        <Hero 
          profileImageUrl={identity.profileImageUrl} 
          onDownloadCv={() => setIsCvModalOpen(true)} 
          googleFormUrl={identity.googleFormUrl} 
        />
        <About profileImageUrl={identity.profileImageUrl} />
        <Process />
        <Services googleFormUrl={identity.googleFormUrl} />
        <Portfolio projects={projects} />
        <Testimonials testimonials={testimonials} />
        <Tools tools={tools} />
        <FAQ faqs={faqs} />
        <ZoomBooking googleFormUrl={identity.googleFormUrl} />
        <Contact 
          profileImageUrl={identity.profileImageUrl} 
          onDownloadCv={() => setIsCvModalOpen(true)}
          whatsAppNumber={identity.whatsAppNumber}
          linkedInUrl={identity.linkedInUrl}
        />
      </main>
      <Footer logoUrl={identity.logoUrl} onAdminLogin={() => setIsAdminMode(true)} />
      <CVModal isOpen={isCvModalOpen} onClose={() => setIsCvModalOpen(false)} cvUrl={identity.cvUrl} />
      
      {isSyncing && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in z-[100] border border-white/10">
          <Loader2 className="animate-spin text-blue-400" size={16} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Global Sync</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">Retrieving Cloud Data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
