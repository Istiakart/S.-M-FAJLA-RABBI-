
import React from 'react';
import { Quote, Star, ShieldCheck } from 'lucide-react';
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
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col relative group hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all duration-500">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <Quote className="text-blue-600/10 absolute top-8 right-8" size={48} />
              
              <p className="text-slate-600 font-medium leading-relaxed mb-8 relative z-10">
                "{t.content}"
              </p>

              <div className="mt-auto flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                    {t.name}
                    <ShieldCheck size={14} className="text-blue-500" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.role}</div>
                </div>
                <div className="ml-auto bg-blue-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
                  {t.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
