
import React from 'react';
import { Quote, Star, ShieldCheck, ImageIcon } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  return (
    <section id="testimonials" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            Client Success
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Voices of <span className="text-blue-600">ROI.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-500 font-medium leading-relaxed">
            Verified feedback from industry leaders who scaled their digital presence through our precision marketing systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col relative group hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all duration-500 animate-fade-in-up">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <Quote className="text-blue-600/10 absolute top-8 right-8" size={48} />
              
              <div className="flex-1 relative z-10">
                <p className="text-slate-600 font-medium leading-relaxed mb-8 italic">
                  "{t.content}"
                </p>
                
                {/* Optional secondary image (Proof/Badge) if available */}
                {t.imageUrls && t.imageUrls.length > 1 && (
                  <div className="mb-8 w-full h-32 rounded-2xl overflow-hidden border border-slate-200 bg-white group/proof relative cursor-pointer">
                    <img src={t.imageUrls[1]} className="w-full h-full object-cover grayscale group-hover/proof:grayscale-0 transition-all duration-700" alt="Proof Asset" />
                    <div className="absolute top-2 right-2 p-1.5 bg-blue-600 rounded-lg text-white opacity-0 group-hover/proof:opacity-100 transition-opacity">
                      <ShieldCheck size={12} />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-200 shrink-0">
                  <img 
                    src={t.image || t.imageUrls?.[0] || 'https://via.placeholder.com/150'} 
                    alt={t.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="truncate">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1 truncate">
                    {t.name}
                    <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{t.role}</div>
                </div>
                <div className="ml-auto bg-blue-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 shrink-0">
                  {t.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 p-10 bg-slate-900 rounded-[3rem] text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
           <h4 className="text-white font-black text-xl md:text-2xl mb-4 tracking-tighter italic">"Precision leads to results, data leads to scaling."</h4>
           <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">ClickNova Methodology Verified</div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
