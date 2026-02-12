
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Project } from '../types';
import { generateCaseStudySummary } from '../services/geminiService';
import { Sparkles, BrainCircuit, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const CaseStudyCard: React.FC<{ project: Project }> = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setAiSummary(null);
    setIsExpanded(false);
    setActiveImageIdx(0);
  }, [project.id]);

  const handleGenerateAISummary = async () => {
    if (aiSummary || isGenerating) return;
    setIsGenerating(true);
    const metricsStr = project.metrics?.map(m => `${m.label}: ${m.value}`).join(', ') || '';
    const summary = await generateCaseStudySummary(metricsStr);
    setAiSummary(summary);
    setIsGenerating(false);
  };

  const splitResults = (res: string) => {
    if (!res || typeof res !== 'string') return { value: '0', unit: '' };
    const parts = res.trim().split(/\s+/);
    if (parts.length < 1) return { value: '0', unit: '' };
    return {
      value: parts[0],
      unit: parts.slice(1).join(' ')
    };
  };

  const { value, unit } = splitResults(project.results);

  const images = project.imageUrls || [];

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full animate-fade-in">
      {images.length > 0 && (
        <div className="w-full aspect-[16/9] overflow-hidden bg-slate-100 relative group">
          <img 
            src={images[activeImageIdx]} 
            alt={project.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          {/* Gallery Controls */}
          {images.length > 1 && (
            <>
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setActiveImageIdx(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-900 shadow-lg hover:bg-white transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setActiveImageIdx(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-900 shadow-lg hover:bg-white transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full">
                {images.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImageIdx ? 'bg-white scale-125' : 'bg-white/40'}`}></div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
              {project.category}
            </span>
            <h4 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{project.title}</h4>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl md:text-2xl font-black text-blue-600">{value}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{unit}</div>
          </div>
        </div>

        <p className="text-slate-600 mb-6 leading-relaxed text-sm md:text-base font-medium">
          {project.description}
        </p>

        {project.category !== 'Website Build' && (
          <div className="mb-8">
            {!aiSummary && !isGenerating ? (
              <button 
                onClick={handleGenerateAISummary}
                className="group flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Generate AI ROI Insight
              </button>
            ) : (
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl animate-fade-in relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <BrainCircuit className={`w-4 h-4 mt-0.5 ${isGenerating ? 'text-blue-300 animate-pulse' : 'text-blue-600'}`} />
                  <div>
                    <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">ClickNova AI Summary</div>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
                      {isGenerating ? "Analyzing performance data via Gemini..." : aiSummary}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
          {project.metrics?.slice(0, 4).map((m, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{m.label}</div>
              <div className="text-lg font-bold text-slate-900">{m.value}</div>
              <div className="text-[9px] text-slate-400 font-medium leading-tight">{m.description}</div>
            </div>
          ))}
        </div>

        <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pt-4 pb-8">
            {project.category !== 'Website Build' && (
              <>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Performance Timeline</h5>
                <div className="h-64 w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={project.chartData} 
                      margin={{ top: 10, right: 10, left: isMobile ? -40 : -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                        {project.chartData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === (project.chartData?.length || 0) - 1 ? '#2563eb' : '#e2e8f0'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
            
            <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h5 className="font-bold text-blue-200 uppercase text-[10px] tracking-widest">Strategy Highlight</h5>
              </div>
              <div className="text-xl font-bold mb-3">ClickNova Methodology</div>
              <p className="text-blue-100 text-sm leading-relaxed font-medium">
                Implementing <strong>conversion-focused systems</strong> optimized at <strong>ClickNova IT Agency</strong>. We leverage precise technical execution to ensure maximum ROI: <span className="text-white font-bold">{project.efficiency}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex gap-3">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border-2 ${
              isExpanded 
                ? 'bg-slate-50 border-slate-200 text-slate-500' 
                : 'bg-white border-slate-100 text-slate-700 hover:border-blue-100 hover:text-blue-600 shadow-sm'
            }`}
          >
            {isExpanded ? 'Hide Details' : 'View Breakdown'}
            <svg className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {project.link && (
            <a 
              href={project.link} 
              target="_blank" 
              rel="noreferrer"
              className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center"
              title="Visit Project"
            >
              <ExternalLink size={20} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

interface PortfolioProps {
  projects: Project[];
}

const Portfolio: React.FC<PortfolioProps> = ({ projects }) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'E-commerce' | 'Leads' | 'Engagement' | 'Website Build'>('All');
  const [limit, setLimit] = useState(4);

  const filteredProjects = useMemo(() => {
    const sorted = [...projects].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    return sorted.filter(p => activeFilter === 'All' || p.category === activeFilter);
  }, [projects, activeFilter]);

  const displayedProjects = filteredProjects.slice(0, limit);
  const hasMore = limit < filteredProjects.length;

  const handleLoadMore = () => {
    setLimit(prev => Math.min(prev + 4, filteredProjects.length));
  };

  const filters: ('All' | 'E-commerce' | 'Leads' | 'Engagement' | 'Website Build')[] = ['All', 'E-commerce', 'Leads', 'Engagement', 'Website Build'];

  return (
    <section id="portfolio" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Results & Case Studies
            </div>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">Data Speaks Louder <br className="hidden md:block"/>Than Words.</h3>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Explore real growth metrics and digital assets executed with <strong>ClickNova IT Agency</strong>. Precision scaling leads to measurable success.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
             {filters.map(filter => (
               <button 
                 key={filter}
                 onClick={() => { setActiveFilter(filter); setLimit(4); }}
                 className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all relative ${
                   activeFilter === filter 
                   ? 'bg-white text-blue-600 shadow-md scale-105' 
                   : 'text-slate-500 hover:text-slate-800'
                 }`}
               >
                 {filter === 'All' ? 'All Results' : filter}
                 {activeFilter === filter && (
                   <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full animate-fade-in"></span>
                 )}
               </button>
             ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {displayedProjects.length > 0 ? (
            displayedProjects.map(project => (
              <CaseStudyCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="text-4xl mb-4">📈</div>
              <h4 className="text-xl font-bold text-slate-500">No projects found in this category.</h4>
            </div>
          )}
        </div>

        {hasMore && (
           <div className="mt-16 text-center">
             <button 
               onClick={handleLoadMore}
               className="bg-slate-50 text-slate-700 px-10 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-200 shadow-sm"
             >
               Load More Projects
             </button>
           </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
