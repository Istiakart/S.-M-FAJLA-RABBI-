
import React from 'react';
import { TrendingUp, Filter, Zap } from 'lucide-react';
import { Project, Service, Tool } from './types';

/**
 * Core services provided by S M Fajla Rabbi.
 * Icons match the set used in the Services component for visual consistency.
 */
export const SERVICES: Service[] = [
  {
    title: "Meta Ads Scaling",
    description: "Data-backed Facebook & Instagram ad campaigns focused on ROI. Specializing in interest-stacking as taught in Skill Room Bangladesh IT to ensure your budget is spent where it performs best.",
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    title: "Sales Funnel Design",
    description: "Building high-converting messaging funnels that turn clicks into conversations. I optimize the entire customer journey to lower CAC and increase lifetime value.",
    icon: <Filter className="w-6 h-6" />
  },
  {
    title: "AI-Enhanced Marketing",
    description: "Leveraging AI tools for creative testing and audience analysis to minimize ad spend and maximize engagement. We use GPT for copy and strategy to stay ahead of the curve.",
    icon: <Zap className="w-6 h-6" />
  }
];

/**
 * Real-world campaign results synchronized across Hero, Portfolio, and Case Study sections.
 */
export const PROJECTS: Project[] = [
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

/**
 * High-performance agency-grade tool stack.
 */
export const TOOLS: Tool[] = [
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
    icon: "https://www.vectorlogo.zone/logos/meta/meta-icon.svg" 
  },
  { 
    name: "AI Studio / GPT", 
    icon: "https://www.vectorlogo.zone/logos/openai/openai-icon.svg" 
  }
];
