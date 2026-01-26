
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Project } from '../types';
import { generateCaseStudySummary } from '../services/geminiService';
import { Sparkles, BrainCircuit } from 'lucide-react';

/**
 * Verified real-world marketing data for S M Fajla Rabbi.
 */
const PROJECTS: Project[] = [
  {
    id: "apparel-growth",
    title: "Apparel Brand Growth",
    category: "E-commerce",
    results: "142 Messages",
    efficiency: "92% Reduction in CPL",
    description: "Successfully scaled a local apparel brand using high-intent messaging funnels on Meta Ads. By moving away from standard traffic ads, we achieved record-high ROI.",
    metrics: [
      { label: "Cost", value: "BDT 8.20", description: "Per message" },
      { label: "CTR", value: "4.8%", description: "Link click-through" },
      { label: "Impressions", value: "38K", description: "Targeted reach" },
      { label: "Audience", value: "18-24", description: "Primary demographic" }
    ],
    chartData: [
      { name: 'Week 1', value: 12 },
      { name: 'Week 2', value: 34 },
      { name: 'Week 3', value: 89 },
      { name: 'Week 4', value: 142 },
    ],
    demographics: "Ages 18-24, interests in Fashion and Online Shopping in Dhaka."
  },
  {
    id: "tasbih-awareness",
    title: "Tasbih Shop Awareness",
    category: "Engagement",
    results: "6.5K Likes",
    efficiency: "Highest Micro-cost Engagement",
    description: "Maximized brand social proof for a niche spiritual lifestyle shop. Focused on building a massive engagement foundation to support future sales campaigns.",
    metrics: [
      { label: "CPC", value: "$0.0003", description: "Engagement cost" },
      { label: "Reach", value: "12K", description: "Unique users" },
      { label: "Saves", value: "450", description: "High-intent saves" },
      { label: "Shares", value: "120", description: "Viral expansion" }
    ],
    chartData: [
      { name: 'Day 1', value: 800 },
      { name: 'Day 2', value: 1800 },
      { name: 'Day 3', value: 4200 },
      { name: 'Day 4', value: 6500 },
    ],
    demographics: "Religious and lifestyle segments nationwide with high mobile usage."
  }
];

interface PortfolioProps {
  projects?: Project[];
}

const CaseStudyCard: React.FC<{ project: Project }> = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGenerateAISummary = async () => {
    if (aiSummary || isGenerating) return;
    setIsGenerating(true);
    const metricsStr = project.metrics.map(m => `${m.label}: ${m.value}`).join(', ');
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

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
              {project.category}
            </span>
            <h4 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{project.title}</h4>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl md:text-2xl font-black text-indigo-600">{value}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{unit}</div>
          </div>
        </div>

        <p className="text-slate-600 mb-6 leading-relaxed text-sm md:text-base font-medium">
          {project.description}
        </p>

        {/* AI Insight Section */}
        <div className="mb-8">
          {!aiSummary && !isGenerating ? (
            <button 
              onClick={handleGenerateAISummary}
              className="group flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Generate AI ROI Insight
            </button>
          ) : (
            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl animate-fade-in relative overflow-hidden">
              {isGenerating && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_2s_infinite] -translate-x-full"></div>
              )}
              <div className="flex items-start gap-3">
                <BrainCircuit className={`w-4 h-4 mt-0.5 ${isGenerating ? 'text-indigo-300 animate-pulse' : 'text-indigo-600'}`} />
                <div>
                  <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Skill Room AI Summary</div>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
                    {isGenerating ? "Analyzing performance data via Gemini..." : aiSummary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
          {project.metrics.slice(0, 4).map((m, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{m.label}</div>
              <div className="text-lg font-bold text-slate-900">{m.value}</div>
              <div className="text-[9px] text-slate-400 font-medium leading-tight">{m.description}</div>
            </div>
          ))}
        </div>

        <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pt-4 pb-8">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Performance Timeline</h5>
            <div className="h-64 w-full">
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
                    {project.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === project.chartData.length - 1 ? '#4f46e5' : '#e2e8f0'} className="hover:fill-indigo-400 transition-colors" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-indigo-900 text-white p-6 rounded-2xl mt-8 shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h5 className="font-bold text-indigo-200 uppercase text-[10px] tracking-widest">Strategy Highlight</h5>
              </div>
              <div className="text-xl font-bold mb-3">Skill Room Bangladesh IT Method</div>
              <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                Implementing <strong>Interest-Stacking Techniques</strong> and granular behavior targeting optimized at <strong>Skill Room Bangladesh IT</strong>. We leverage advanced pixel data to ensure maximum budget efficiency: <span className="text-white font-bold">{project.efficiency}</span>.
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border-2 ${
            isExpanded 
              ? 'bg-slate-50 border-slate-200 text-slate-500' 
              : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-100 hover:text-indigo-600 shadow-sm'
          }`}
        >
          {isExpanded ? 'Hide Details' : 'Full Performance Breakdown'}
          <svg className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const Portfolio: React.FC<PortfolioProps> = ({ projects = PROJECTS }) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'E-commerce' | 'Leads' | 'Engagement'>('All');
  const [limit, setLimit] = useState(2);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => activeFilter === 'All' || p.category === activeFilter);
  }, [projects, activeFilter]);

  const displayedProjects = filteredProjects.slice(0, limit);
  const hasMore = limit < filteredProjects.length;

  const handleLoadMore = () => {
    setLimit(prev => Math.min(prev + 2, filteredProjects.length));
  };

  const filters: ('All' | 'E-commerce' | 'Leads' | 'Engagement')[] = ['All', 'E-commerce', 'Leads', 'Engagement'];

  return (
    <section id="portfolio" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Results & Case Studies
            </div>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">Data Speaks Louder <br className="hidden md:block"/>Than Words.</h3>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              Explore real growth metrics from recent campaigns executed with <strong>Skill Room Bangladesh IT</strong>. Precision targeting leads to measurable ROI.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
             {filters.map(filter => (
               <button 
                 key={filter}
                 onClick={() => { setActiveFilter(filter); setLimit(2); }}
                 className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all relative ${
                   activeFilter === filter 
                   ? 'bg-white text-indigo-600 shadow-md scale-105' 
                   : 'text-slate-500 hover:text-slate-800'
                 }`}
               >
                 {filter === 'All' ? 'All Results' : filter}
                 {activeFilter === filter && (
                   <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full animate-fade-in"></span>
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
              <h4 className="text-xl font-bold text-slate-500">No campaigns found in this category.</h4>
              <p className="text-slate-400 mt-2">Try a different filter to see more performance data.</p>
            </div>
          )}
          
          {hasMore && (
             <button 
               onClick={handleLoadMore}
               className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-indigo-300 hover:bg-white transition-all duration-300"
             >
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mb-6 group-hover:text-indigo-500 group-hover:scale-110 transition-all shadow-sm">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
               </div>
               <h4 className="text-xl font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Expand Portfolio</h4>
               <p className="text-slate-400 text-sm max-w-[200px] mt-2 font-medium">Load more verified campaign results.</p>
             </button>
          )}

          {!hasMore && displayedProjects.length > 0 && (
            <div className="bg-indigo-600 rounded-3xl flex flex-col items-center justify-center p-12 text-center shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
              <h4 className="text-2xl font-bold text-white mb-3">Your Brand Next?</h4>
              <p className="text-indigo-100 text-sm max-w-[240px] mb-8 font-medium">I am currently accepting <span className="text-white font-bold">2 new partners</span> for the next quarter.</p>
              <a 
                href="#contact" 
                className="bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg active:scale-95"
              >
                Discuss My Growth
              </a>
            </div>
          )}
        </div>

        <div className="mt-20 text-center">
          <a 
            href="#contact"
            className="inline-flex items-center gap-2 font-bold text-slate-600 hover:text-indigo-600 transition-all group py-2 px-4 rounded-full hover:bg-indigo-50"
          >
            <span>Request Detailed PDF Report</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </div>
      
      {/* Shimmer Animation for AI Loading */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
};

export default Portfolio;
