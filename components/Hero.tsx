
import React from 'react';
import { FileDown, Code2 } from 'lucide-react';

interface HeroProps {
  profileImageUrl: string;
  onDownloadCv?: () => void;
}

const Hero: React.FC<HeroProps> = ({ profileImageUrl, onDownloadCv }) => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-slate-50">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-cyan-100 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 text-left">
          <div className="flex-1 animate-fade-in order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-white border border-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs md:text-sm font-bold mb-6 md:mb-8 shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              FULL-STACK WEB DESIGNER & DIGITAL MARKETER
            </div>
            
            <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
              Crafting Performance <br className="hidden md:block" />
              <span className="gradient-text">Websites & Brands.</span>
            </h1>
            
            <p className="max-w-xl text-lg md:text-xl text-slate-600 mb-8 md:mb-10 leading-relaxed font-medium">
              I bridge the gap between aesthetic design and profitable growth. Specializing in high-speed web apps and ROI-focused marketing scaling.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a 
                href="#contact" 
                className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 text-center"
              >
                Start My Project
              </a>
              <div className="flex gap-4 w-full sm:w-auto">
                <button 
                  onClick={onDownloadCv}
                  className="flex-1 sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-black transition-all text-center flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-95"
                >
                  <FileDown size={20} />
                  Download CV
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 relative animate-fade-in-up order-1 lg:order-2 w-full">
            <div className="relative z-10 w-full max-w-[320px] md:max-w-[480px] mx-auto">
              <div className="aspect-[1/1] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-[8px] md:border-[12px] border-white bg-slate-900 group">
                <img 
                  src={profileImageUrl} 
                  alt="S M Fajla Rabbi Professional Portrait" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              <div className="absolute -bottom-4 -left-2 md:-bottom-6 md:-left-6 bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-slate-100 animate-bounce-slow z-20">
                <div className="text-blue-600 font-black text-xl md:text-3xl">100/100</div>
                <div className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 md:mt-1">Lighthouse Performance</div>
              </div>
              <div className="absolute top-8 -right-2 md:top-12 md:-right-6 bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-slate-100 z-20">
                <div className="text-cyan-600 font-black text-xl md:text-3xl">6.4x</div>
                <div className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 md:mt-1">Average ROAS Scaling</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
