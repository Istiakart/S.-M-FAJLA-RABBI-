
import React from 'react';

interface HeroProps {
  profileImageUrl: string;
}

const Hero: React.FC<HeroProps> = ({ profileImageUrl }) => {
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
              S M FAJLA RABBI | DATA-DRIVEN GROWTH SPECIALIST
            </div>
            
            <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
              Scaling Brands with <br className="hidden md:block" />
              <span className="gradient-text">Precision Marketing.</span>
            </h1>
            
            <p className="max-w-xl text-lg md:text-xl text-slate-600 mb-8 md:mb-10 leading-relaxed font-medium">
              Transforming ad spend into measurable ROI. I specialize in high-conversion Meta Ads and messaging funnels that drive real business growth.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a 
                href="#contact" 
                className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 text-center"
              >
                Get a Quote
              </a>
              <a 
                href="#portfolio" 
                className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-700 px-10 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 transition-all text-center"
              >
                View Performance
              </a>
            </div>
          </div>

          <div className="flex-1 relative animate-fade-in-up order-1 lg:order-2 w-full">
            <div className="relative z-10 w-full max-w-[320px] md:max-w-[480px] mx-auto">
              <div className="aspect-[1/1] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-[8px] md:border-[12px] border-white bg-slate-900 group">
                <img 
                  src={profileImageUrl} 
                  alt="S M Fajla Rabbi Professional Portrait" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519085184903-b811b1347343?q=80&w=1974&auto=format&fit=crop';
                  }}
                />
              </div>
              
              <div className="absolute -bottom-4 -left-2 md:-bottom-6 md:-left-6 bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-slate-100 animate-bounce-slow z-20">
                <div className="text-blue-600 font-black text-xl md:text-3xl">BDT 8.20</div>
                <div className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 md:mt-1">Cost Per Conversation</div>
              </div>
              <div className="absolute top-8 -right-2 md:top-12 md:-right-6 bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-slate-100 z-20">
                <div className="text-cyan-600 font-black text-xl md:text-3xl">$0.0003</div>
                <div className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 md:mt-1">Cost Per Engagement</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 border-t border-slate-200 pt-12 md:pt-16">
          <div className="text-center md:text-left">
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900">38K+</div>
            <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Ad Impressions</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900">142</div>
            <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Sales Conversations</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900">48.3%</div>
            <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Campaign CTR</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900">6.5K+</div>
            <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Engagement Results</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
