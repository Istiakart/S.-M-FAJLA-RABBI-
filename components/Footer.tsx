
import React from 'react';

interface FooterProps {
  onAdminLogin?: () => void;
  logoUrl?: string;
}

const Footer: React.FC<FooterProps> = ({ onAdminLogin, logoUrl }) => {
  const currentYear = new Date().getFullYear();
  const EMAIL_ADDRESS = "istiakrobbi25@gmail.com";
  const WHATSAPP_NUMBER = "8801956358439";

  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600 shadow-lg cursor-pointer" onClick={onAdminLogin}>
                <img src={logoUrl} className="w-full h-full object-cover object-top" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight leading-none">
                  S M FAJLA <span className="text-blue-500">RABBI</span>
                </span>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">
                  Digital Marketer & Full Stack Web Designer
                </span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              Crafting high-performance websites and ROI-driven marketing ecosystems that help brands profitably scale.
            </p>
            <div className="flex gap-4">
              {/* WhatsApp Icon */}
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-500 transition-colors group"
                title="WhatsApp Me"
              >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-3.313l.369.218c1.12.665 2.408 1.015 3.731 1.016 5.142 0 9.324-4.181 9.326-9.323.001-2.491-.972-4.833-2.733-6.595s-4.102-2.733-6.596-2.733c-5.142 0-9.324 4.183-9.327 9.325-.001 1.485.352 2.933 1.025 4.205l.237.447-.937 3.422 3.502-.922zm9.646-5.835c-.267-.134-1.579-.779-1.824-.868-.246-.088-.425-.133-.604.134-.179.267-.691.868-.848 1.046-.156.178-.313.199-.579.066-.267-.133-1.125-.415-2.144-1.325-.792-.707-1.328-1.58-1.483-1.847-.156-.267-.016-.411.117-.544.121-.119.267-.312.4-.467.133-.156.178-.267.267-.445.088-.178.044-.334-.022-.467-.067-.134-.604-1.458-.828-2.002-.218-.528-.439-.456-.604-.464-.156-.008-.335-.01-.514-.01s-.469.067-.714.334c-.246.267-.938.913-.938 2.226 0 1.313.959 2.581 1.092 2.759.134.178 1.888 2.883 4.574 4.041.64.276 1.139.44 1.526.563.642.204 1.226.175 1.688.107.514-.077 1.579-.645 1.803-1.268.223-.623.223-1.157.156-1.268-.067-.111-.246-.178-.513-.312z"/>
                </svg>
              </a>
              {/* Mail Icon */}
              <a 
                href={`mailto:${EMAIL_ADDRESS}`} 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-500 transition-colors group"
                title="Send me a Mail"
              >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </a>
              {/* LinkedIn Icon */}
              <a 
                href="https://www.linkedin.com/in/s-m-fajla-rabbi-0ba589367/" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors group"
                title="LinkedIn Profile"
              >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Explore</h4>
            <ul className="space-y-4 text-slate-400 font-medium text-sm">
              <li><a href="#about" className="hover:text-blue-400 transition-colors">About Me</a></li>
              <li><a href="#services" className="hover:text-blue-400 transition-colors">Services</a></li>
              <li><a href="#portfolio" className="hover:text-blue-400 transition-colors">Portfolio</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Tech Stack</h4>
            <ul className="space-y-4 text-slate-400 font-medium text-sm">
              <li>React & Next.js</li>
              <li>Tailwind CSS</li>
              <li>TypeScript / Node.js</li>
              <li>Meta Ads Manager</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Get In Touch</h4>
            <div className="space-y-4">
              <a 
                href={`mailto:${EMAIL_ADDRESS}`}
                className="text-slate-400 flex items-center gap-3 text-sm hover:text-blue-400 transition-colors"
              >
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {EMAIL_ADDRESS}
              </a>
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={onAdminLogin}
                  className="text-[10px] font-black text-slate-700 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Admin Portal
                </button>
                <button 
                  onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                  className="flex items-center gap-2 text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors group uppercase tracking-widest"
                >
                  BACK TO TOP
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm font-medium text-center md:text-left">
            <p>© {currentYear} S M Fajla Rabbi. All Rights Reserved.</p>
            <p className="mt-1 text-slate-600 text-xs">Partner at <span className="text-slate-400">ClickNova IT Agency</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
