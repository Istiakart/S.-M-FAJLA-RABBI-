
import React from 'react';
import { 
  Globe, 
  Layout, 
  Code2, 
  Megaphone, 
  Rocket,
  Smartphone
} from 'lucide-react';
import { Project, Service, Tool } from './types';

/**
 * Core services provided by S M Fajla Rabbi.
 */
export const SERVICES: Service[] = [
  {
    title: "Full-Stack Web Development",
    description: "Building fast, scalable, and modern web applications with cutting-edge technologies.",
    icon: <Code2 className="w-6 h-6" />,
    subServices: [
      "React & Next.js Development",
      "Full-Stack Systems (Node/Firebase)",
      "API Integration & Management",
      "Custom Dashboard Design"
    ]
  },
  {
    title: "Conversion-Focused UI/UX",
    description: "Designing user interfaces that are not only beautiful but engineered for maximum conversion.",
    icon: <Layout className="w-6 h-6" />,
    subServices: [
      "Modern Web Design",
      "User Experience Optimization",
      "Wireframing & Prototyping",
      "Mobile-First Approach"
    ]
  },
  {
    title: "Performance Marketing (Ads)",
    description: "Data-driven ad campaigns to drive traffic to your high-performance website.",
    icon: <Megaphone className="w-6 h-6" />,
    subServices: [
      "Facebook & Instagram Ads Scaling",
      "Meta Pixel & Conversion API",
      "ROAS-Driven Strategy",
      "Advanced Retargeting Funnels"
    ]
  },
  {
    title: "E-commerce Solutions",
    description: "End-to-end online store setup with optimized checkout flows and tracking.",
    icon: <Smartphone className="w-6 h-6" />,
    subServices: [
      "Shopify & WordPress Stores",
      "Inventory Management Sync",
      "Payment Gateway Integration",
      "Store SEO & Optimization"
    ]
  },
  {
    title: "Brand Growth Strategy",
    description: "Holistic approach to growing your online brand from zero to profitable scaling.",
    icon: <Rocket className="w-6 h-6" />,
    subServices: [
      "Digital Marketing Consultation",
      "Competitor Analysis",
      "Content Planning",
      "ROI Tracking Setup"
    ]
  }
];

/**
 * Professional Portfolio Projects.
 */
export const PROJECTS: Project[] = [
  {
    id: "proj-web-1",
    title: "SaaS Analytics Dashboard",
    category: "Website Build",
    results: "Live Platform",
    efficiency: "99% Lighthouse",
    description: "A high-performance React dashboard built with Tailwind CSS, featuring real-time data visualization and secure authentication.",
    imageUrls: ["https://images.unsplash.com/photo-1551288049-bbbda5366392?q=80&w=2070&auto=format&fit=crop"],
    metrics: [
      { label: "Performance", value: "99/100", description: "Core Web Vitals" },
      { label: "Load Time", value: "0.8s", description: "LCP Optimization" },
      { label: "Framework", value: "React/TS", description: "Next Generation Tech" }
    ],
    chartData: [{ name: 'Jan', value: 20 }, { name: 'Feb', value: 45 }, { name: 'Mar', value: 99 }]
  },
  {
    id: "proj-mkt-1",
    title: "Fashion Brand Scale-Up",
    category: "E-commerce",
    results: "$52,000 Sales",
    efficiency: "6.4x ROAS",
    description: "Scaled a local fashion store by combining a custom fast-loading website with a high-performance Meta Ads retargeting funnel.",
    imageUrls: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"],
    metrics: [
      { label: "Revenue", value: "$52,000", description: "Monthly Growth" },
      { label: "ROAS", value: "6.4x", description: "Ad Efficiency" },
      { label: "CTR", value: "4.2%", description: "Creative Engagement" }
    ],
    chartData: [{ name: 'W1', value: 5000 }, { name: 'W2', value: 12000 }, { name: 'W3', value: 28000 }, { name: 'W4', value: 52000 }]
  },
  {
    id: "proj-web-2",
    title: "Luxury Real Estate Portal",
    category: "Website Build",
    results: "Interactive Site",
    efficiency: "SEO 100/100",
    description: "Developed a visually stunning real estate portal with custom filtering, interactive maps, and lead capture automation.",
    imageUrls: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop"],
    metrics: [
      { label: "SEO", value: "100/100", description: "Search Visibility" },
      { label: "Leads", value: "350+", description: "Monthly Inquiries" },
      { label: "Response", value: "Instant", description: "Automated Funnel" }
    ],
    chartData: [{ name: 'Before', value: 30 }, { name: 'After', value: 100 }]
  }
];

const AI_STUDIO_LOGO = "https://www.gstatic.com/lamda/images/gemini_sparkle_v2.svg";

export const INITIAL_TOOLS: Tool[] = [
  { 
    id: "t1",
    name: "React & Next.js", 
    subtitle: "Web Apps", 
    icon: "https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg" 
  },
  { 
    id: "t2",
    name: "Tailwind CSS", 
    subtitle: "Modern Design", 
    icon: "https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" 
  },
  { 
    id: "t3",
    name: "TypeScript", 
    subtitle: "Reliable Code", 
    icon: "https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-icon.svg" 
  },
  { 
    id: "t4",
    name: "Node.js", 
    subtitle: "Backend Systems", 
    icon: "https://www.vectorlogo.zone/logos/nodejs/nodejs-icon.svg" 
  },
  { 
    id: "t5",
    name: "Meta Ads Manager", 
    subtitle: "Growth Scaling", 
    icon: "https://www.vectorlogo.zone/logos/facebook/facebook-official.svg" 
  },
  { 
    id: "t6",
    name: "Figma", 
    subtitle: "UI/UX Design", 
    icon: "https://www.vectorlogo.zone/logos/figma/figma-icon.svg" 
  },
  { 
    id: "t7",
    name: "WordPress", 
    subtitle: "CMS Development", 
    icon: "https://www.vectorlogo.zone/logos/wordpress/wordpress-icon.svg" 
  },
  { 
    id: "t8",
    name: "AI Strategy", 
    subtitle: "Copy & Planning", 
    icon: AI_STUDIO_LOGO 
  }
];
