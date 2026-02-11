
import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SERVICES } from '../constants';

const Services: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            Specialized Solutions
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Comprehensive Growth Ecosystem
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 font-medium leading-relaxed">
            I don't just run ads; I build high-performance marketing engines that 
            dominate markets and deliver consistent ROI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <div 
              key={index} 
              style={{ animationDelay: `${index * 100}ms` }}
              className="group bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full animate-fade-in-up"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white shadow-sm">
                {service.icon}
              </div>
              
              <h4 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h4>
              
              <p className="text-slate-600 leading-relaxed mb-8 font-medium text-sm md:text-base">
                {service.description}
              </p>

              {service.subServices && (
                <div className="space-y-3 mb-10 mt-auto">
                  {service.subServices.map((sub, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                      <span className="text-sm font-semibold">{sub}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <a 
                href="#contact" 
                className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all"
              >
                Start Scaling 
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 md:p-12 rounded-[2.5rem] bg-blue-900 text-white relative overflow-hidden shadow-2xl animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <h4 className="text-2xl md:text-3xl font-bold mb-4">Ready to dominate your industry?</h4>
              <p className="text-blue-100 font-medium">
                My full-stack approach ensures that no lead is wasted and every BDT spent on ads returns maximum value to your business.
              </p>
            </div>
            <a 
              href="https://wa.me/8801956358439" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl shadow-blue-950/20 active:scale-95 whitespace-nowrap text-center flex items-center justify-center gap-2"
            >
              Get My Strategy Call
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
