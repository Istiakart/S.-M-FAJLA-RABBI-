
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Tools from './components/Tools';
import Contact from './components/Contact';
import AILab from './components/AILab';
import Footer from './components/Footer';
import { PROJECTS } from './constants';

const App: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Lead with Vision */}
        <Hero />
        
        {/* Follow with Trust (Who & What) */}
        <About />
        <Services />
        
        {/* Prove with Results */}
        <Portfolio projects={PROJECTS} />
        
        {/* Support with Technical Stack */}
        <Tools />
        
        {/* Engage with Future Tech */}
        <AILab />
        
        {/* Close with Action */}
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
