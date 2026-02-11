
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
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
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

const AI_STUDIO_LOGO = "data:image/png;base64,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";

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
