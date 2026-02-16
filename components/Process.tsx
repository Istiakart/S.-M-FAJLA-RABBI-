import React from 'react';
import { Search, Compass, Cpu, Zap } from 'lucide-react';

const Process: React.FC = () => {
  const steps = [
    {
      title: "Data Audit",
      description: "Analyzing historical data, pixel performance, and funnel bottlenecks to find untapped ROI.",
      icon: <Search className="w-6 h-6" />,
      color: "blue"
    },
    {
      title: "Growth Blueprint",
      description: "Architecting a multi-tier campaign structure and technical stack designed for aggressive scaling.",
      icon: <Compass className="w-6 h-6" />,
      color: "cyan"
    },
    {
      title: "Engineering",
      description: "Deploying high-speed web assets and server-side tracking to minimize data loss.",
      icon: <Cpu className="w-6 h-6" />,
      color: "indigo"
    },
    {
      title: "Optimization",
      description: "Iterative testing and AI-driven budget allocation to maximize efficiency and ROAS.",
      icon: <Zap className="w-6 h-6" />,
      color: "emerald"
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            Methodology
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
            The Scaling <span className="text-blue-600">Blueprint.</span>
          </h2>
          <p className="max-w-xl mx-auto text-slate-500 font-medium">
            A battle-tested 4-step framework used to move brands from stagnant growth to profitable market domination.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-slate-100 -z-10"></div>
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className={`w-20 h-20 rounded-3xl bg-white border-4 border-slate-50 flex items-center justify-center text-blue-600 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 mb-8 relative z-10`}>
                {step.icon}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full text-xs font-black flex items-center justify-center border-4 border-white">
                  0{idx + 1}
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;