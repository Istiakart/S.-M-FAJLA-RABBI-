
import React from 'react';
import { Tool } from '../types';

interface ToolsProps {
  tools: Tool[];
}

const Tools: React.FC<ToolsProps> = ({ tools }) => {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Agency-Grade Tech Stack
            </span>
          </div>
          <h4 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center">
            My Performance Stack
          </h4>
          
          <div className="mt-6 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span className="text-xs font-bold text-slate-600">
              Verified Methodology at <span className="text-blue-600">ClickNova IT Agency</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              className="group bg-white p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100"></div>
                <div className="h-12 w-12 flex items-center justify-center relative z-10">
                  <img 
                    src={tool.icon} 
                    alt={`${tool.name} logo`} 
                    className="max-h-full max-w-full object-contain transition-all duration-500 ease-out group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://img.icons8.com/fluency/96/wrench.png";
                    }}
                  />
                </div>
              </div>
              
              <div className="text-center mt-2">
                <span className="block text-base font-bold text-slate-800 transition-colors group-hover:text-blue-600">
                  {tool.name}
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  {tool.subtitle || 'Tooling Solution'}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm font-medium italic">
            "Strategic mastery of industry-leading tools drives our performance benchmarks."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Tools;
