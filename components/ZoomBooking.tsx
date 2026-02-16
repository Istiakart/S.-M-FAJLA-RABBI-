
import React from 'react';
import { Video, Calendar, Clock, CheckCircle2 } from 'lucide-react';

// Added interface to accept googleFormUrl prop from App.tsx
interface ZoomBookingProps {
  googleFormUrl?: string;
}

const ZoomBooking: React.FC<ZoomBookingProps> = ({ googleFormUrl }) => {
  // Use passed googleFormUrl as the primary link, with the legacy link as a fallback
  const GOOGLE_FORM_URL = googleFormUrl || "https://docs.google.com/forms/d/e/1FAIpQLSeBhaQwxVKtQn3ibvqPZ7-FGnUkml9EO6P5EYBZIvWCnCoJeg/viewform?usp=publish-editor";

  return (
    <section id="zoom-booking" className="py-24 bg-blue-900 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 p-8 md:p-16 lg:p-20 shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/20 rounded-full text-blue-300 text-xs font-black uppercase tracking-widest mb-8">
                <Video className="w-4 h-4" /> Strategic Consultation
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tighter">
                Scale Your Brand via <br />
                <span className="text-blue-400">Zoom Strategy Call.</span>
              </h2>
              <p className="text-xl text-blue-100/80 mb-10 leading-relaxed font-medium">
                Let's discuss how my "Interest-Stacking" and ROI-focused Meta Ads methodology can double your performance in 30 days. 
              </p>

              <div className="space-y-6 mb-12">
                {[
                  "15-Minute Technical Audit of current Ads",
                  "Identification of ROI Leaks in your Funnel",
                  "Personalized Meta Scaling Blueprint",
                  "Data-Driven Growth Roadmap"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-white">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                <div className="flex items-center gap-3 text-blue-200">
                  <Clock className="w-5 h-5" />
                  <span className="font-black text-sm uppercase tracking-widest">15-30 Min Session</span>
                </div>
                <div className="flex items-center gap-3 text-blue-200">
                  <Calendar className="w-5 h-5" />
                  <span className="font-black text-sm uppercase tracking-widest">Available Mon-Sat</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in-up">
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150 duration-700"></div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Video className="text-blue-600 w-8 h-8" />
                  Ready to Grow?
                </h3>
                <p className="text-slate-500 font-medium mb-10">
                  Fill out my 1-minute strategy form. I'll receive a notification instantly and we'll sync up via your preferred contact method.
                </p>

                <a 
                  href={GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 mb-6 animate-attention"
                >
                  Book My Zoom Meeting
                </a>
                
                <div className="text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Powered by Google Cloud Sync
                  </span>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <Video size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 uppercase">Secure Link</div>
                    <div className="text-[10px] font-bold text-slate-400">Meeting details sent via Email</div>
                  </div>
                </div>
              </div>

              {/* Decorative Element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-400 rounded-3xl -z-10 blur-2xl opacity-40"></div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ZoomBooking;
