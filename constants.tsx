
import React from 'react';
import { 
  Globe, 
  Share2, 
  Megaphone, 
  Search, 
  PenTool,
  TrendingUp, 
  Filter, 
  Zap 
} from 'lucide-react';
import { Project, Service, Tool } from './types';

/**
 * Core services provided by S M Fajla Rabbi.
 * Updated to reflect the 5 main categories and sub-options requested.
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
 * Real-world campaign results synchronized across Hero, Portfolio, and Case Study sections.
 */
export const PROJECTS: Project[] = [
  {
    id: "web-build-1",
    title: "Meta-Optimized E-commerce Hub",
    category: "Website Build",
    results: "Live Platform",
    efficiency: "98% PageSpeed",
    description: "Developed a high-performance business platform engineered specifically for Meta Ads compatibility. Features lightning-fast load times and deep GTM/Meta Pixel integration to ensure zero data loss during scaling.",
    imageUrls: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"],
    link: "https://example.com",
    metrics: [
      { label: "Load Time", value: "< 1.2s", description: "LCP Optimization" },
      { label: "SEO Score", value: "100/100", description: "Lighthouse Audit" },
      { label: "Mobile Score", value: "96%", description: "Core Web Vitals" },
      { label: "Tech Stack", value: "React/Tailwind", description: "Modern Architecture" }
    ],
    chartData: [
      { name: 'Before', value: 45 },
      { name: 'After Optimization', value: 98 },
    ],
    demographics: "Fully responsive across all modern browsers and mobile devices. Engineered for global access."
  },
  {
    id: "hoodie-sales",
    title: "E-commerce Clothing Scale-up",
    category: "E-commerce",
    results: "142 Messages",
    efficiency: "BDT 8.20/Conv",
    description: "Achieved high-volume customer inquiries for a premium clothing brand. By implementing a messaging-first funnel, we reduced the cost per conversion by 65% compared to standard website traffic ads.",
    imageUrls: ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop"],
    metrics: [
      { label: "Sales Conv.", value: "142", description: "Direct leads generated" },
      { label: "Cost/Message", value: "BDT 8.20", description: "Target achieved" },
      { label: "Reach", value: "38,142", description: "Unique audience reach" },
      { label: "Conv. Rate", value: "12.4%", description: "Lead-to-sale potential" }
    ],
    chartData: [
      { name: 'Week 1', value: 18 },
      { name: 'Week 2', value: 32 },
      { name: 'Week 3', value: 45 },
      { name: 'Week 4', value: 47 },
    ],
    demographics: "Targeted: 18-24 Year Olds in Dhaka and Chittagong. Data-driven targeting focused on shopping interests."
  },
  {
    id: "tasbih-engagement",
    title: "Tasbih Shop Awareness",
    category: "Engagement",
    results: "6.5K+ Engagements",
    efficiency: "$0.0003/Res",
    description: "Strategic engagement campaign that maximized social proof for a niche lifestyle shop. The campaign utilized viral creative hooks and precise interest-stacking to achieve record-low interaction costs.",
    imageUrls: ["https://images.unsplash.com/photo-1590059367464-918967b5398d?q=80&w=2070&auto=format&fit=crop"],
    metrics: [
      { label: "Total Eng.", value: "6,587", description: "Likes, Shares, Comments" },
      { label: "Cost/Result", value: "$0.0003", description: "Highly optimized spend" },
      { label: "CTR (All)", value: "48.32%", description: "Exceeded relevance benchmark" },
      { label: "Impressions", value: "28.5K", description: "Brand visibility" }
    ],
    chartData: [
      { name: 'Day 1', value: 850 },
      { name: 'Day 2', value: 1420 },
      { name: 'Day 3', value: 2100 },
      { name: 'Day 4', value: 2217 },
    ],
    demographics: "Nationwide targeting with a focus on religious and lifestyle segments. High resonance across mobile users."
  },
  {
    id: "luxury-watch-leadgen",
    title: "Luxury Watch Lead Generation",
    category: "Leads",
    results: "85 High-Ticket Leads",
    efficiency: "BDT 45/Lead",
    description: "Generated qualified leads for luxury retail. Focusing on high-net-worth individual interest profiles, we filtered for quality over quantity, resulting in an 8.4x return on ad spend.",
    imageUrls: ["https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1974&auto=format&fit=crop"],
    metrics: [
      { label: "Verified Leads", value: "85", description: "Phone-verified inquiries" },
      { label: "ROAS", value: "8.4x", description: "Return on Ad Spend" },
      { label: "Ad Spend", value: "BDT 3,825", description: "Efficient budget use" },
      { label: "CPC", value: "BDT 12", description: "Premium placement" }
    ],
    chartData: [
      { name: 'Ad Spend', value: 3825 },
      { name: 'Revenue', value: 32130 },
    ],
    demographics: "Ages 30-55. Interested in Luxury Goods, Investing, and Business. Highly targeted placements."
  }
];

const AI_STUDIO_LOGO = "https://www.gstatic.com/lamda/images/gemini_sparkle_v2.svg";

export const TOOLS: Tool[] = [
  { 
    name: "WordPress", 
    icon: "https://www.vectorlogo.zone/logos/wordpress/wordpress-icon.svg" 
  },
  { 
    name: "Shopify", 
    icon: "https://www.vectorlogo.zone/logos/shopify/shopify-icon.svg" 
  },
  { 
    name: "Meta Ads Manager", 
    icon: "https://www.vectorlogo.zone/logos/facebook/facebook-official.svg" 
  },
  { 
    name: "Google Analytics 4", 
    icon: "https://www.vectorlogo.zone/logos/google_analytics/google_analytics-icon.svg" 
  },
  { 
    name: "Meta Pixel", 
    icon: "https://www.vectorlogo.zone/logos/facebook/facebook-icon.svg" 
  },
  { 
    name: "Google Tag Manager", 
    icon: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Google_Tag_Manager_Logo.svg" 
  },
  { 
    name: "AI Studio / GPT", 
    icon: AI_STUDIO_LOGO 
  }
];
