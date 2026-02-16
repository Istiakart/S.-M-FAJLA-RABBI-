import React from 'react';
import { 
  Globe, 
  Layout, 
  Code2, 
  Megaphone, 
  Rocket,
  Smartphone,
  BarChart3,
  Target,
  LineChart,
  Layers
} from 'lucide-react';
import { Project, Service, Tool } from './types';

/**
 * Core services provided by S M Fajla Rabbi.
 * Structured for a Performance Marketing & Growth persona.
 */
export const SERVICES: Service[] = [
  {
    title: "Performance Media Buying",
    description: "Architecting high-ROAS Meta and Google Ads funnels that turn cold traffic into loyal brand advocates.",
    icon: <Target className="w-6 h-6" />,
    subServices: [
      "Meta Ads Scaling (6x+ ROAS)",
      "Interest Stacking Strategy",
      "Dynamic Retargeting Funnels",
      "Advanced Creative Testing"
    ]
  },
  {
    title: "Conversion-Led Development",
    description: "Building ultra-fast React/Next.js interfaces engineered specifically to maximize checkout completion rates.",
    icon: <Layers className="w-6 h-6" />,
    subServices: [
      "Speed-Optimized Landers",
      "Headless E-commerce Builds",
      "Custom Checkout Experiences",
      "Mobile-First Scaling"
    ]
  },
  {
    title: "Data Infrastructure & Tracking",
    description: "Implementing server-side tracking and conversion APIs to ensure 100% data accuracy in a post-iOS14 world.",
    icon: <BarChart3 className="w-6 h-6" />,
    subServices: [
      "GTM & GA4 Configuration",
      "Meta Conversion API (CAPI)",
      "Pixel/Event Optimization",
      "ROI Attribution Modeling"
    ]
  },
  {
    title: "E-commerce Growth Strategy",
    description: "Holistic brand scaling covering everything from supply chain logic to customer lifetime value (LTV) optimization.",
    icon: <LineChart className="w-6 h-6" />,
    subServices: [
      "Retention & Email Marketing",
      "Competitor Market Intelligence",
      "Price Elasticity Strategy",
      "Funnel Performance Audits"
    ]
  }
];

export const PROJECTS: Project[] = [
  {
    id: "proj-mkt-1",
    title: "Lifestyle Brand Scale-Up",
    category: "E-commerce",
    results: "$84,200 Sales",
    efficiency: "7.2x ROAS",
    description: "Executed a comprehensive scaling strategy for a premium lifestyle brand, achieving record-breaking monthly revenue through a 3-tier funnel approach.",
    imageUrls: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"],
    metrics: [
      { label: "Growth", value: "312%", description: "Month-over-Month" },
      { label: "ROAS", value: "7.2x", description: "Blended Return" },
      { label: "CPA", value: "BDT 420", description: "Customer Acquisition" },
      { label: "AOV", value: "BDT 3,850", description: "Order Value" }
    ],
    chartData: [{ name: 'Phase 1', value: 12000 }, { name: 'Phase 2', value: 34000 }, { name: 'Scale', value: 84200 }]
  },
  {
    id: "proj-web-1",
    title: "Venture-Backed SaaS Lander",
    category: "Website Build",
    results: "24% Conv. Rate",
    efficiency: "0.6s FCP",
    description: "Re-engineered a SaaS landing page from scratch focusing on information hierarchy and technical performance to lower acquisition costs.",
    imageUrls: ["https://images.unsplash.com/photo-1551288049-bbbda5366392?q=80&w=2070&auto=format&fit=crop"],
    metrics: [
      { label: "Conversion", value: "24%", description: "Opt-in Rate" },
      { label: "Speed", value: "98/100", description: "Mobile Insight" },
      { label: "Time on Site", value: "4m 12s", description: "User Engagement" }
    ],
    chartData: [{ name: 'Before', value: 8 }, { name: 'After', value: 24 }]
  }
];

const AI_STUDIO_LOGO = "https://www.gstatic.com/lamda/images/gemini_sparkle_v2.svg";

export const INITIAL_TOOLS: Tool[] = [
  { id: "t1", name: "Meta Ads Manager", subtitle: "Growth Scaling", icon: "https://www.vectorlogo.zone/logos/facebook/facebook-official.svg" },
  { id: "t2", name: "Google Analytics 4", subtitle: "Data Intelligence", icon: "https://www.vectorlogo.zone/logos/google_analytics/google_analytics-icon.svg" },
  { id: "t3", name: "GTM / CAPI", subtitle: "Server Tracking", icon: "https://www.vectorlogo.zone/logos/googletagmanager/googletagmanager-icon.svg" },
  { id: "t4", name: "React / Next.js", subtitle: "High-Speed Web", icon: "https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg" },
  { id: "t5", name: "Shopify / Woo", subtitle: "E-comm Engine", icon: "https://www.vectorlogo.zone/logos/shopify/shopify-icon.svg" },
  { id: "t6", name: "Tailwind CSS", subtitle: "UX Architecture", icon: "https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" },
  { id: "t7", name: "Hotjar / Heatmaps", subtitle: "CRO Analysis", icon: "https://www.vectorlogo.zone/logos/hotjar/hotjar-icon.svg" },
  { id: "t8", name: "Gemini AI", subtitle: "Content Strategy", icon: AI_STUDIO_LOGO }
];