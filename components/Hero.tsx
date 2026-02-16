import React from 'react';
import { FileDown, Code2, TrendingUp } from 'lucide-react';

interface HeroProps {
  profileImageUrl: string;
  onDownloadCv?: () => void;
}

const Hero: React.FC<HeroProps> = ({ profileImageUrl, onDownloadCv }) => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-slate-50">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-cyan-100 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 text-center lg:text-left">
          <div className="flex-1 animate-fade-in order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-white border border-blue-100 text-blue-700 px-4 py-2 rounded-full text-[10px] md:text-sm font-bold mb-6 md:mb-8 shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              GROWTH ARCHITECT & PERFORMANCE MARKETER
            </div>
            
            <h1 className="text-3xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
              Scaling Brands via <br className="hidden md:block" />
              <span className="gradient-text">Precision Systems.</span>
            </h1>
            
            <p className="max-w-xl mx-auto lg:mx-0 text-base md:text-xl text-slate-600 mb-8 md:mb-10 leading-relaxed font-medium">
              I combine conversion-engineered web architecture with high-ROAS Meta Ads scaling to deliver predictable brand growth. 
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a 
                href="#contact" 
                className="w-full sm:w-auto bg-blue-600 text-white px-8 md:px-10 py-4 rounded-xl text-base md:text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 text-center flex items-center justify-center gap-2"
              >
                Start Scaling Now
              </a>
              <button 
                onClick={onDownloadCv}
                className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl text-base md:text-lg font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                <FileDown size={20} />
                Download Deck
              </button>
            </div>
          </div>

          <div className="flex-1 relative animate-fade-in-up order-1 lg:order-2 w-full max-w-[280px] md:max-w-[480px]">
            <div className="relative z-10">
              <div className="aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-[6px] md:border-[12px] border-white bg-slate-900 group">
                <img 
                  src={profileImageUrl} 
                  alt="S M Fajla Rabbi" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-white p-3 md:p-6 rounded-xl shadow-xl border border-slate-100 animate-bounce-slow z-20">
                <div className="text-blue-600 font-black text-lg md:text-3xl">7.2x</div>
                <div className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Avg ROAS</div>
              </div>
              <div className="absolute top-6 -right-4 md:top-12 md:-right-6 bg-white p-3 md:p-6 rounded-xl shadow-xl border border-slate-100 z-20">
                <div className="text-cyan-600 font-black text-lg md:text-3xl">312%</div>
                <div className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Growth</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;