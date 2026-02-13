
import React from 'react';
import { FileDown } from 'lucide-react';

interface ContactProps {
  profileImageUrl: string;
  onDownloadCv?: () => void;
}

const Contact: React.FC<ContactProps> = ({ profileImageUrl, onDownloadCv }) => {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-[3rem] overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 px-8 py-20 md:p-20 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center lg:text-left">
              <h2 className="text-white text-4xl md:text-5xl font-black mb-6 leading-tight">Ready to scale your <br className="hidden md:block" />performance?</h2>
              <p className="text-blue-50 text-xl md:text-2xl leading-relaxed font-medium">
                Successfully generated <span className="text-white font-bold">142 leads</span> at an optimized cost of only <span className="text-white font-bold">BDT 8.20</span> per messaging conversation. 
              </p>
              <p className="mt-4 text-blue-100 text-lg opacity-90">
                Let's discuss how we can replicate these results for your brand with Meta Ads precision.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-80 shrink-0">
              <a 
                href="https://wa.me/8801956358439" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white text-blue-600 px-8 py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-xl active:scale-95 w-full"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-3.313l.369.218c1.12.665 2.408 1.015 3.731 1.016 5.142 0 9.324-4.181 9.326-9.323.001-2.491-.972-4.833-2.733-6.595s-4.102-2.733-6.596-2.733c-5.142 0-9.324 4.183-9.327 9.325-.001 1.485.352 2.933 1.025 4.205l.237.447-.937 3.422 3.502-.922zm9.646-5.835c-.267-.134-1.579-.779-1.824-.868-.246-.088-.425-.133-.604.134-.179.267-.691.868-.848 1.046-.156.178-.313.199-.579.066-.267-.133-1.125-.415-2.144-1.325-.792-.707-1.328-1.58-1.483-1.847-.156-.267-.016-.411.117-.544.121-.119.267-.312.4-.467.133-.156.178-.267.267-.445.088-.178.044-.334-.022-.467-.067-.134-.604-1.458-.828-2.002-.218-.528-.439-.456-.604-.464-.156-.008-.335-.01-.514-.01s-.469.067-.714.334c-.246.267-.938.913-.938 2.226 0 1.313.959 2.581 1.092 2.759.134.178 1.888 2.883 4.574 4.041.64.276 1.139.44 1.526.563.642.204 1.226.175 1.688.107.514-.077 1.579-.645 1.803-1.268.223-.623.223-1.157.156-1.268-.067-.111-.246-.178-.513-.312z"/></svg>
                WhatsApp Me
              </a>
              <button 
                onClick={onDownloadCv}
                className="bg-slate-900 text-white border border-slate-700 px-8 py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 w-full"
              >
                <FileDown size={20} />
                Download My CV
              </button>
              <a 
                href="https://www.linkedin.com/in/s-m-fajla-rabbi-0ba589367/" 
                target="_blank" 
                rel="noreferrer"
                className="bg-blue-700 text-white border border-blue-500 px-8 py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl active:scale-95 w-full"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
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
              Digital Marketing Strategist
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
