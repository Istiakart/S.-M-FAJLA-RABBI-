
import React from 'react';
import { 
  Globe, 
  Share2, 
  Megaphone, 
  Search, 
  PenTool
} from 'lucide-react';
import { Project, Service, Tool } from './types';

/**
 * Core services provided by S M Fajla Rabbi.
 */
export const SERVICES: Service[] = [
  {
    title: "Web Design & Development",
    description: "Custom, fast, and mobile-responsive websites that turn visitors into customers.",
    icon: <Globe className="w-6 h-6" />,
    subServices: [
      "WordPress & Shopify Development",
      "Landing Page Design",
      "E-commerce Solutions",
      "Website Speed Optimization"
    ]
  },
  {
    title: "Social Media Marketing (SMM)",
    description: "Building your brand presence where your customers spend most of their time.",
    icon: <Share2 className="w-6 h-6" />,
    subServices: [
      "Social Media Management (FB, IG, LinkedIn)",
      "Content Creation & Planning",
      "Community Engagement"
    ]
  },
  {
    title: "Paid Advertising (Ads)",
    description: "Data-driven ad campaigns to get immediate results and high ROI.",
    icon: <Megaphone className="w-6 h-6" />,
    subServices: [
      "Facebook & Instagram Ads",
      "Google Search & Display Ads",
      "YouTube Advertising"
    ]
  },
  {
    title: "Search Engine Optimization (SEO)",
    description: "Helping your business rank on the first page of Google organically.",
    icon: <Search className="w-6 h-6" />,
    subServices: [
      "Keyword Research & Strategy",
      "On-Page & Technical SEO",
      "Backlink Building"
    ]
  },
  {
    title: "Content & Copywriting",
    description: "Compelling words that sell your story and your products.",
    icon: <PenTool className="w-6 h-6" />,
    subServices: [
      "Ad Copywriting",
      "SEO Blog Writing",
      "Email Newsletters"
    ]
  }
];

/**
 * Professional Portfolio Projects (Restored with realistic data).
 */
export const PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Real Estate High-Ticket Lead Gen",
    category: "Leads",
    results: "215 Qualified Leads",
    efficiency: "BDT 85.20 / Lead",
    description: "Engineered an interest-stacking targeting strategy for a luxury real estate developer, resulting in high-intent leads with a 15% conversion rate to site visits.",
    imageUrls: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop"],
    metrics: [
      { label: "Leads", value: "215", description: "Meta Form Submissions" },
      { label: "CPL", value: "BDT 85.20", description: "Cost per Lead" },
      { label: "Reach", value: "48K+", description: "Targeted Impressions" }
    ],
    chartData: [{ name: 'Week 1', value: 20 }, { name: 'Week 2', value: 45 }, { name: 'Week 3', value: 85 }, { name: 'Week 4', value: 215 }]
  },
  {
    id: "proj-2",
    title: "Fashion E-commerce ROAS Scaling",
    category: "E-commerce",
    results: "$42,500 Sales",
    efficiency: "5.2x ROAS",
    description: "Implemented dynamic product ads (DPA) and a 3-tier retargeting funnel for a local fashion house, achieving consistent growth over 3 months.",
    imageUrls: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"],
    metrics: [
      { label: "Sales", value: "$42,500", description: "Total Revenue" },
      { label: "ROAS", value: "5.2x", description: "Return on Ad Spend" },
      { label: "Orders", value: "840+", description: "Total Conversions" }
    ],
    chartData: [{ name: 'Month 1', value: 5000 }, { name: 'Month 2', value: 15000 }, { name: 'Month 3', value: 42500 }]
  },
  {
    id: "proj-3",
    title: "Messaging Funnel for Local Services",
    category: "Engagement",
    results: "1,240 Conversations",
    efficiency: "BDT 4.50 / Msg",
    description: "Built an automated WhatsApp and Messenger marketing funnel for a dental clinic, drastically reducing wait times and increasing appointments by 40%.",
    imageUrls: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop"],
    metrics: [
      { label: "Convos", value: "1,240", description: "Direct Inquiries" },
      { label: "CPM", value: "BDT 120", description: "Cost per 1k Reach" },
      { label: "Appointments", value: "185", description: "Booked via Chat" }
    ],
    chartData: [{ name: 'M1', value: 200 }, { name: 'M2', value: 650 }, { name: 'M3', value: 1240 }]
  },
  {
    id: "proj-4",
    title: "SaaS Beta User Acquisition",
    category: "Leads",
    results: "850 Signups",
    efficiency: "$1.15 / User",
    description: "Executed a LinkedIn and Meta cross-channel strategy to acquire beta testers for a new productivity tool, focusing on B2B professional targeting.",
    imageUrls: ["https://images.unsplash.com/photo-1551288049-bbbda5366392?q=80&w=2070&auto=format&fit=crop"],
    metrics: [
      { label: "Signups", value: "850", description: "Beta Registrations" },
      { label: "CPA", value: "$1.15", description: "Acquisition Cost" },
      { label: "Conversion", value: "12.4%", description: "Landing Page Rate" }
    ],
    chartData: [{ name: 'W1', value: 100 }, { name: 'W2', value: 300 }, { name: 'W3', value: 550 }, { name: 'W4', value: 850 }]
  },
  {
    id: "proj-5",
    title: "Meta-Optimized E-commerce Hub",
    category: "Website Build",
    results: "Live Platform",
    efficiency: "98% PageSpeed",
    description: "Developed a high-performance business platform engineered specifically for Meta Ads compatibility and fast mobile rendering.",
    imageUrls: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"],
    metrics: [
      { label: "Load Time", value: "< 1.2s", description: "LCP Optimization" },
      { label: "SEO Score", value: "100/100", description: "Lighthouse Audit" },
      { label: "Perf", value: "98/100", description: "Speed Performance" }
    ],
    chartData: [{ name: 'Before', value: 45 }, { name: 'After', value: 98 }]
  }
];

const AI_STUDIO_LOGO = "https://www.gstatic.com/lamda/images/gemini_sparkle_v2.svg";

export const INITIAL_TOOLS: Tool[] = [
  { 
    id: "t1",
    name: "WordPress", 
    subtitle: "CMS & Development", 
    icon: "https://www.vectorlogo.zone/logos/wordpress/wordpress-icon.svg" 
  },
  { 
    id: "t2",
    name: "Shopify", 
    subtitle: "E-commerce Builds", 
    icon: "https://www.vectorlogo.zone/logos/shopify/shopify-icon.svg" 
  },
  { 
    id: "t3",
    name: "Meta Ads Manager", 
    subtitle: "Scaling & Tracking", 
    icon: "https://www.vectorlogo.zone/logos/facebook/facebook-official.svg" 
  },
  { 
    id: "t4",
    name: "Google Analytics 4", 
    subtitle: "Conversion Data", 
    icon: "https://www.vectorlogo.zone/logos/google_analytics/google_analytics-icon.svg" 
  },
  { 
    id: "t5",
    name: "Meta Pixel", 
    subtitle: "Advanced Retargeting", 
    icon: "https://www.vectorlogo.zone/logos/facebook/facebook-icon.svg" 
  },
  { 
    id: "t6",
    name: "Google Tag Manager", 
    subtitle: "Server-side Tracking", 
    icon: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Google_Tag_Manager_Logo.svg" 
  },
  { 
    id: "t7",
    name: "AI Studio & GPT", 
    subtitle: "Copy & Strategy", 
    icon: AI_STUDIO_LOGO 
  }
];
