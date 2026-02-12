
import React from 'react';

interface AboutProps {
  profileImageUrl: string;
}

const About: React.FC<AboutProps> = ({ profileImageUrl }) => {
  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[1/1] rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl relative group">
              <img 
                src={profileImageUrl} 
                alt="S M Fajla Rabbi" 
                className="w-full h-full object-cover object-top transition-all duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
            </div>
            
            <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-6 lg:p-10 rounded-[2rem] shadow-2xl z-20 hidden lg:block">
              <div className="text-5xl font-black mb-1">Results</div>
              <div className="text-blue-100 text-sm font-bold tracking-[0.2em] uppercase">Driven Marketer</div>
            </div>
            <div className="absolute top-10 -left-10 w-32 h-32 bg-blue-50 rounded-full -z-10 blur-3xl"></div>
          </div>

          <div className="animate-fade-in">
            <h2 className="text-blue-600 font-bold tracking-widest text-sm mb-4 uppercase">The Specialist behind the numbers</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 leading-tight">
              I am S M Fajla Rabbi — <br />
              Helping Brands <span className="text-blue-600">Profitably Scale.</span>
            </h3>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Digital Marketing is more than just reach; it’s about <strong>Revenue</strong>. Specialized in Meta Ads, I help brands scale by bridging the gap between creative storytelling and technical data.
            </p>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
              With a focus on <strong>Peak Conversion Optimization</strong>, I manage your campaigns with surgical precision. From audience segmentation to A/B testing, I ensure your marketing budget works tirelessly to deliver the highest possible Return on Ad Spend (ROAS).
            </p>
            
            <div className="grid grid-cols-2 gap-6 mt-10">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Performance Focus</h4>
                <p className="text-slate-500 text-sm">Every campaign is audited and optimized 24/7 to ensure peak conversion rates.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">Scalable Systems</h4>
                <p className="text-slate-500 text-sm">I build modular funnels designed to handle growth from 100 to 10,000+ leads.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
