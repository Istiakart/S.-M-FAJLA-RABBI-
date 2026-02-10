
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Tools from './components/Tools';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import { PROJECTS as INITIAL_PROJECTS } from './constants';
import { Project, Visit } from './types';

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjects = () => {
    const storedProjects = localStorage.getItem('rabbi_portfolio_projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    } else {
      setProjects(INITIAL_PROJECTS);
      localStorage.setItem('rabbi_portfolio_projects', JSON.stringify(INITIAL_PROJECTS));
    }
  };

  useEffect(() => {
    loadProjects();

    // Visitor Tracking Logic
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
        onProjectsUpdate={loadProjects}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio projects={projects} />
        <Tools />
        <Contact />
      </main>
      <Footer onAdminLogin={() => setIsAdminMode(true)} />
    </div>
  );
};

export default App;
