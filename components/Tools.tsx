
import React from 'react';

interface Tool {
  name: string;
  subtitle: string;
  icon: string;
}

const AI_STUDIO_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOAAAADhCAMAAAAJbSJIAAAAflBMVEUAAAD////g4OCLi4v5+flWVlbv7+96enr29vbj4+PJycnc3NyNjY3S0tKvr6/ExMS3t7c6Ojrp6enAwMClpaWFhYV1dXVycnJfX19paWkqKiqVlZWqqqpPT080NDQ/Pz+dnZ0VFRULCws9PT0cHBxFRUUjIyMtLS0XFxdjY2N8enhpAAAHGklEQVR4nO2d6XriOgxAMZS9QAa6QmmhM6W37/+CtywtIMuJLUtY5PP5XRKfQrvottRoXAOLTu8ldRtEaZlv7lK3QpLm1rCXuhWSmB3z1M2Qo703vE/dDjnu9oaz1O2Qo7k3rO+DuDYHlqlbIsX9j2Ftx4vRj+E0dUuEeDe/fKRuiwy3R8Nx6rbIMD0a3qRuiwhLc8JD6tZIMDk1HKZujQBrc0YN+5rxueEgdXv4MYDX1A3i5gUaTlK3iBsoaMyf1E3iZWYbjlK3iZU3W9CYr9St4qSJGXZSt4qRe0zwIouo+fOiGAw7/vRIAYh3XFC6s9m0Bj3Xnd18Um41cl1NcJ34vkCfjEpIvyvHb5R8PQ+WA5IecdHzWnbFNrfblvaQ6GdMl3K/Dvv/rJxX50NRDWnJU/F7YV9Greh+xvyVuGHB6vc6rbofd1seqy+7YBQs6dR8INxxWX1VYx7ZBIs4wVb4HdHpqM0Tk2BEF7OFMDqXjhOn8IwZtCE+phV/JC9u048UDI+rfIRcPn4lRR/lD/wLveNT2PVJk4kTJtW3KGcVesfgfjv4Dmcs3BduFqv7bjWhdxy77+giJjTVdlyzN+bqpyGkh2K6Id8PXwcOnxmVzmjfUAQNfexH4lzG9EXWLTus0Kg/tD0MaKd2y2x15CNq7tujPDfI+qxDCkZ4QehizgnvcFr2ReRisV3qE3hK6GLDvqfYG4On2InTgU7Q+9Nb6/NS77WeoudNR6YBvar1FPZl/B6Zvr8fOr6b356tj74L6G1WHM8f5MUrYGzFgQSG+W7kytNN02NQg5/hfgjnLTG9PcNF+TdpzfCDF0ElfHaL0lgoF71Zy/1KHP5IGfcirWODBkE4p3PwDxm/QuqbASKOOBiMdXE+hYQXVzE4pilwuOfsSBnHdx9WeCtghJRR0DcWyoQrlgn+z8wz7ofxhTqbaeGcqIJnZcVruOW5kH4eZ93/Su4P/lgmbLEcy0kWFQviDfh7sa1kXyJDx6g6wvcXfERK8Jt/d9x+hc/3Ad9tCRp+s+BcX3huYQBxUvHN1SWB5zC8jyhe2pAhDrVlsva+3+UNG6/RU51pyJGhBIbf6+E4wbBAWxLDxjpiTdwPHNDSGGLxPU+CD0GnMmy80WY54RH9ZIakbRHTsvmng4SG4eMGaXWe0jB0+KdFkJIaNh5CBIlbv9IaIvF2J9TXmYkNG1++guQD+qkNfXYmbqHvTkxu6DeFW9Gvn97QZ8duzBZaBYb4RpBTorZBazCs2hMZl0FChaHzwMyeuGMzKgzLNylGbknUYVi2Ryp2W4gSw4Zzl1R0Ghcths7t0NE7g7UYukbF+FxDagwdZ5/ir6vHEO1PGRJi6THEohocxysVGSKHSzh2YCsytOenLMfyNBnOoSHLLmxNhvBL5DlZqcoQDPs8CRVUGZ53p0z5FHQZnoXeCIcZMXQZnu19YbqkMsOTzQxc2S+VGX4em8J1YEeZ4TFkw5beU5vh78sato282gx/f6ZshwK1Gf4uE9kuqM7w8NqUb6uyOsPDoM93NFCd4WE7KF/yJH2GU+Z26DPcbTxn3Iytz3C3DmbMda3PsLG58zuR5olCQ2ay4fWTDRWz9DvqfL2GC8+Z3bUazvu+oaorNdxlgaix4Xq/27++hj/7xGpr+HtErKaGJ2Hxehqevp6qo2H77AhDDQ3BAcYaGvZrb9jMhhjZUBXZECUbqiIbomRDVWRDlGyoimyIkg1VkQ1RsqEqsiFKNlRFNkTJhqrIhijZUBXZECUbqiIbomRDVWRDlGyoimyIkg1VkQ1RsqEqsiEKrMgr3MY4QMozvxRLMIuYcBvjAMmy/JLxwQoenOfi2AFt9czuAj7FV6adn0/Q1je/j4HU6J5lMZIAM0d7VoAApRh4MhfJADKc+/b7khWtmAEdje+XAYsDxhYwlwNWAPPNDQLzwMmVyY0F5jj1riYLy/fIVTqOBLTTv1rqBHwwJrO0JLDmh39ORSt7v1jZrjjgby1gXIOGOp9EK9Ow53i/Bf5MVXancIUQlPizDT9s5mINJWNlqA1KYGPlYWbK58eInb016ON2dQJtczc48QpOBWYnKdaliJTcCSwdjpSYECqvTsLqCgl1rZCy7jeMSXCi2GDp2oOvYvXFpP+TCC2saYTxDC0u1Us/MLaRXxexl8AzoncYMoZH8Ogo7UEqHe4svzwprbUryGPhKlpKjCWVlOzpjYrVbety3K6KAf6b2kHOislSH/QCRCwMLlzNnkhUqv2I0pkXI3LKrF8xulhCZW2pxDBMlz0qhCWEJQG2d7W+BDAlaV9HV1wWohMQmKkARsF1wPvKyF5Sp2bEHeL8RBadCRlKrFXneiZxE7G1eFfDNG7Il/Ya5blAV6AXojPrer7mjeOjuyomo2HzcgxHg9ndvZY4USaTyWQymUwmk7H4HwfDWNxg+N+uAAAAAElFTkSuQmCC";

const TOOLS: Tool[] = [
  { 
    name: "WordPress", 
    subtitle: "CMS & Development", 
    icon: "https://www.vectorlogo.zone/logos/wordpress/wordpress-icon.svg" 
  },
  { 
    name: "Shopify", 
    subtitle: "E-commerce Builds", 
    icon: "https://www.vectorlogo.zone/logos/shopify/shopify-icon.svg" 
  },
  { 
    name: "Meta Ads Manager", 
    subtitle: "Scaling & Tracking", 
    icon: "https://www.vectorlogo.zone/logos/facebook/facebook-official.svg" 
  },
  { 
    name: "Google Analytics 4", 
    subtitle: "Conversion Data", 
    icon: "https://www.vectorlogo.zone/logos/google_analytics/google_analytics-icon.svg" 
  },
  { 
    name: "Meta Pixel", 
    subtitle: "Advanced Retargeting", 
    icon: "https://www.vectorlogo.zone/logos/facebook/facebook-icon.svg" 
  },
  { 
    name: "Google Tag Manager", 
    subtitle: "Server-side Tracking", 
    icon: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Google_Tag_Manager_Logo.svg" 
  },
  { 
    name: "AI Studio & GPT", 
    subtitle: "Copy & Strategy", 
    icon: AI_STUDIO_LOGO 
  },
  { 
    name: "PageSpeed", 
    subtitle: "Speed Optimization", 
    icon: "https://www.vectorlogo.zone/logos/google/google-icon.svg" 
  }
];

const Tools: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Agency-Grade Tech Stack
            </span>
          </div>
          <h4 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center">
            My Performance Stack
          </h4>
          
          <div className="mt-6 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span className="text-xs font-bold text-slate-600">
              Verified Methodology at <span className="text-blue-600">ClickNova IT Agency</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {TOOLS.map((tool, i) => (
            <div 
              key={i} 
              className="group bg-white p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100"></div>
                <div className="h-12 w-12 flex items-center justify-center relative z-10">
                  <img 
                    src={tool.icon} 
                    alt={`${tool.name} logo`} 
                    className="max-h-full max-w-full object-contain transition-all duration-500 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </div>
              
              <div className="text-center mt-2">
                <span className="block text-base font-bold text-slate-800 transition-colors group-hover:text-blue-600">
                  {tool.name}
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  {tool.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm font-medium italic">
            "We don't just use tools; we master them to drive BDT 8.20 cost-per-conversations."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Tools;
