
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  logoUrl: string;
  googleFormUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ logoUrl, googleFormUrl }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Reviews', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Zoom Meeting', href: '#zoom-booking' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-sm py-4 border-b border-slate-100' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600 shadow-md ring-2 ring-blue-50 shrink-0">
            <img 
              src={logoUrl} 
              alt="S M Fajla Rabbi Logo" 
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://img.icons8.com/fluency/96/user-male-circle.png';
              }}
            />
          </div>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            S M FAJLA <span className="text-blue-600">RABBI</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="hover:text-blue-600 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a 
            href={googleFormUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-100 animate-attention"
          >
            Contact
          </a>
        </nav>

        <button 
          className="md:hidden text-slate-900 p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl transition-all duration-300 ease-in-out transform ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col p-6 gap-4">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-semibold text-slate-600 hover:text-blue-600 py-2 transition-colors border-b border-slate-50 last:border-0"
            >
              {link.name}
            </a>
          ))}
          <a 
            href={googleFormUrl} 
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-2 bg-blue-600 text-white px-6 py-4 rounded-xl text-center font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 animate-attention"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
