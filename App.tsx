
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { Project, SiteIdentity, Tool, Testimonial, FAQData, Lead } from './types';
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

const INITIAL_ADMIN_CREDS = {
  username: 'admin',
  password: 'password',
  twoFactorEnabled: false,
  twoFactorSecret: 'KVKFKR3TMRQXE3S2'
};

const App: React.FC = () => {
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const hasLoaded = React.useRef(false);
  
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [identity, setIdentity] = useState<SiteIdentity>(DEFAULT_IDENTITY);
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    INITIAL_TESTIMONIALS.map((t, i) => ({ ...t, id: (t as any).id || `test-${i}` } as Testimonial))
  );
  const [faqs, setFaqs] = useState<FAQData[]>(
    INITIAL_FAQS.map((f, i) => ({ ...f, id: (f as any).id || `faq-${i}` } as FAQData))
  );
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [adminCreds, setAdminCreds] = useState(INITIAL_ADMIN_CREDS);

  // Load data from server
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        if (data) {
          if (data.projects) {
            // Merge saved projects with initial projects to ensure new ones show up
            const merged = [...data.projects];
            INITIAL_PROJECTS.forEach(p => {
              if (!merged.find(mp => mp.id === p.id)) {
                merged.push(p);
              }
            });
            setProjects(merged);
          }
          if (data.identity) {
            setIdentity(data.identity);
            if (data.identity.blobToken) {
              localStorage.setItem('vercel_blob_token', data.identity.blobToken);
            }
          }
          if (data.tools) setTools(data.tools);
          if (data.testimonials) setTestimonials(data.testimonials);
          if (data.faqs) setFaqs(data.faqs);
          if (data.leads) setLeads(data.leads);
          if (data.adminCreds) setAdminCreds(data.adminCreds);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        hasLoaded.current = true;
        setIsSyncing(false);
      }
    };
    loadData();
  }, []);

  // Save data to server
  const saveData = async (updates: any) => {
    if (!hasLoaded.current) return;
    try {
      const currentData = {
        projects,
        identity,
        tools,
        testimonials,
        faqs,
        leads,
        adminCreds,
        ...updates
      };
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      });
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

  const handleProjectsUpdate = (newProjects: Project[]) => {
    setProjects(newProjects);
    saveData({ projects: newProjects });
  };

  const handleIdentityUpdate = (newIdentity: SiteIdentity) => {
    setIdentity(newIdentity);
    saveData({ identity: newIdentity });
  };

  const handleToolsUpdate = (newTools: Tool[]) => {
    setTools(newTools);
    saveData({ tools: newTools });
  };

  const handleTestimonialsUpdate = (newTestimonials: Testimonial[]) => {
    setTestimonials(newTestimonials);
    saveData({ testimonials: newTestimonials });
  };

  const handleFaqsUpdate = (newFaqs: FAQData[]) => {
    setFaqs(newFaqs);
    saveData({ faqs: newFaqs });
  };

  const handleLeadsUpdate = (newLeads: Lead[]) => {
    setLeads(newLeads);
    saveData({ leads: newLeads });
  };

  const handleAdminCredsUpdate = (newCreds: any) => {
    setAdminCreds(newCreds);
    saveData({ adminCreds: newCreds });
  };

  const handleLeadCapture = (leadData: Omit<Lead, 'id'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString()
    };
    const newLeads = [newLead, ...leads];
    setLeads(newLeads);
    saveData({ leads: newLeads });
  };

  useEffect(() => {
    const visits = parseInt(localStorage.getItem('portfolio_total_visits') || '0', 10);
    localStorage.setItem('portfolio_total_visits', (visits + 1).toString());
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            <Header 
              logoUrl={identity.profileImageUrl} 
              googleFormUrl={identity.googleFormUrl} 
            />
            
            <main>
              <Hero 
                profileImageUrl={identity.profileImageUrl} 
                onDownloadCv={() => setIsCvModalOpen(true)}
                googleFormUrl={identity.googleFormUrl}
              />
              <About profileImageUrl={identity.profileImageUrl} />
              <Services googleFormUrl={identity.googleFormUrl} />
              <Portfolio projects={projects} />
              <Tools tools={tools} />
              <Process />
              <Testimonials testimonials={testimonials} />
              <FAQ faqs={faqs} />
              <ZoomBooking googleFormUrl={identity.googleFormUrl} />
              <Contact 
                profileImageUrl={identity.profileImageUrl} 
                onDownloadCv={() => setIsCvModalOpen(true)}
                whatsAppNumber={identity.whatsAppNumber}
                linkedInUrl={identity.linkedInUrl}
              />
            </main>

            <Footer 
              onAdminLogin={() => {}} 
              logoUrl={identity.profileImageUrl}
            />

            <CVModal 
              isOpen={isCvModalOpen} 
              onClose={() => setIsCvModalOpen(false)} 
              cvUrl={identity.cvUrl} 
            />

            {isSyncing && (
              <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">Synchronizing Engine...</p>
              </div>
            )}
          </div>
        } />

        <Route path="/admin" element={
          <AdminPanel 
            onClose={() => window.location.href = '/'}
            currentProjects={projects}
            onProjectsUpdate={handleProjectsUpdate}
            currentIdentity={identity}
            onIdentityUpdate={handleIdentityUpdate}
            currentTools={tools}
            onToolsUpdate={handleToolsUpdate}
            testimonials={testimonials}
            onTestimonialsUpdate={handleTestimonialsUpdate}
            faqs={faqs}
            onFaqsUpdate={handleFaqsUpdate}
            leads={leads}
            onLeadsUpdate={handleLeadsUpdate}
            adminCreds={adminCreds}
            onAdminCredsUpdate={handleAdminCredsUpdate}
          />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
