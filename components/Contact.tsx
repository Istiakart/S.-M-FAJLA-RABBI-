
import React from 'react';
import { FileDown } from 'lucide-react';

interface ContactProps {
  profileImageUrl: string;
  onDownloadCv?: () => void;
  whatsAppNumber?: string;
  linkedInUrl?: string;
}

const Contact: React.FC<ContactProps> = ({ profileImageUrl, onDownloadCv, whatsAppNumber, linkedInUrl }) => {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-[3rem] overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 px-8 py-20 md:p-20 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center lg:text-left">
              <h2 className="text-white text-4xl md:text-5xl font-black mb-6 leading-tight">Ready to build your <br className="hidden md:block" />digital empire?</h2>
              <p className="text-blue-50 text-xl md:text-2xl leading-relaxed font-medium">
                Combining <strong>High-Speed Development</strong> with <strong>Meta Ads Precision</strong> to deliver results that exceed industry benchmarks.
              </p>
              <p className="mt-4 text-blue-100 text-lg opacity-90">
                Let's discuss your next big project and how we can achieve 6x ROAS scaling together.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-80 shrink-0">
              <a 
                href={`https://wa.me/${whatsAppNumber}`} 
                target="_blank" 
                rel="noreferrer"
                className="bg-white text-blue-600 px-8 py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-xl active:scale-95 w-full animate-attention"
              >
                WhatsApp Me
              </a>
              <button 
                onClick={onDownloadCv}
                className="bg-slate-900 text-white border border-slate-700 px-8 py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 w-full animate-attention"
              >
                <FileDown size={20} />
                Download CV
              </button>
              <a 
                href={linkedInUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-blue-700 text-white border border-blue-500 px-8 py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl active:scale-95 w-full animate-attention"
              >
                LinkedIn Profile
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-600 shadow-sm">
                <img src={profileImageUrl} className="w-full h-full object-cover object-top" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight uppercase">S M FAJLA RABBI</span>
            </div>
            <span className="hidden md:block w-px h-6 bg-slate-200"></span>
            <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
              Full-Stack Designer & Marketer
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} S M Fajla Rabbi. All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
