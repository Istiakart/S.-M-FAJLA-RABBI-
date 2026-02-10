
import React from 'react';
import { TrendingUp, Filter, Zap, ArrowRight } from 'lucide-react';

interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const SERVICES: Service[] = [
  {
    title: 'Meta Ads Scaling',
    icon: <TrendingUp className="w-6 h-6" />,
    description: 'Data-backed Facebook & Instagram ad campaigns focused on ROI. Specializing in interest-stacking as taught in ClickNova IT Agency.'
  },
  {
    title: 'Sales Funnel Design',
    icon: <Filter className="w-6 h-6" />,
    description: 'Building high-converting messaging funnels that turn clicks into conversations. Achieved costs as low as BDT 8.20 per lead.'
  },
  {
    title: 'AI-Enhanced Marketing',
    icon: <Zap className="w-6 h-6" />,
    description: 'Leveraging AI tools for creative testing and audience analysis to minimize ad spend and maximize engagement.'
  }
];

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
            How I Grow Your Business
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 font-medium leading-relaxed">
            Combining psychological triggers with advanced data analytics to build 
            sustainable growth systems for your brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <div 
              key={index} 
              style={{ animationDelay: `${index * 150}ms` }}
              className="group bg-white p-10 rounded-3xl shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:bg-gradient-to-br hover:from-white hover:to-blue-50/50 animate-fade-in-up"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-3 group-hover:scale-110 shadow-sm">
                {service.icon || <Zap className="w-6 h-6" />}
              </div>
              
              <h4 className="text-2xl font-bold text-slate-900 mb-4 transition-colors group-hover:text-blue-600">
                {service.title}
              </h4>
              
              <p className="text-slate-600 leading-relaxed mb-8 font-medium">
                {service.description}
              </p>
              
              <a 
                href="#contact" 
                className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all"
              >
                Explore Solution 
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 md:p-12 rounded-[2.5rem] bg-blue-900 text-white relative overflow-hidden shadow-2xl animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <h4 className="text-2xl md:text-3xl font-bold mb-4">Looking for a custom growth plan?</h4>
              <p className="text-blue-100 font-medium">
                Every business is unique. I offer a free 15-minute audit to identify your biggest ROI leaks and map out a scaling strategy tailored to your industry.
              </p>
            </div>
            <a 
              href="https://wa.me/8801956358439" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-xl shadow-blue-950/20 active:scale-95 whitespace-nowrap text-center flex items-center justify-center gap-2"
            >
              Book Free Strategy Call
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-3.313l.369.218c1.12.665 2.408 1.015 3.731 1.016 5.142 0 9.324-4.181 9.326-9.323.001-2.491-.972-4.833-2.733-6.595s-4.102-2.733-6.596-2.733c-5.142 0-9.324 4.183-9.327 9.325-.001 1.485.352 2.933 1.025 4.205l.237.447-.937 3.422 3.502-.922zm9.646-5.835c-.267-.134-1.579-.779-1.824-.868-.246-.088-.425-.133-.604.134-.179.267-.691.868-.848 1.046-.156.178-.313.199-.579.066-.267-.133-1.125-.415-2.144-1.325-.792-.707-1.328-1.58-1.483-1.847-.156-.267-.016-.411.117-.544.121-.119.267-.312.4-.467.133-.156.178-.267.267-.445.088-.178.044-.334-.022-.467-.067-.134-.604-1.458-.828-2.002-.218-.528-.439-.456-.604-.464-.156-.008-.335-.01-.514-.01s-.469.067-.714.334c-.246.267-.938.913-.938 2.226 0 1.313.959 2.581 1.092 2.759.134.178 1.888 2.883 4.574 4.041.64.276 1.139.44 1.526.563.642.204 1.226.175 1.688.107.514-.077 1.579-.645 1.803-1.268.223-.623.223-1.157.156-1.268-.067-.111-.246-.178-.513-.312z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
