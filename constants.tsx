
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
    description: "Data-backed Facebook & Instagram ad campaigns focused on ROI. Specializing in interest-stacking as taught in ClickNova IT Agency to ensure your budget is spent where it performs best.",
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
    icon: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQArQMBIgACEQEDEQH/xAAcAAEAAgIDAQAAAAAAAAAAAAAAAwcBBgIFCAT/xAA7EAABBAADAgsGBQMFAAAAAAABAAIDBAUGESExBxITMjNBUWFygbEUQmJxocEiI1KR0RUWQyRTgrLh/8QAGQEBAAMBAQAAAAAAAAAAAAAAAAEDBAUC/8VAIhEBAAICAgICAwEAAAAAAAAAAAECAxEEEiExIkETI3EU/9oADAMBABIBCMLWRU8WxOxdxu47YHEOfG3sH8qyOEbKtnF2MxGi+SSeBnFNbXUObv/CP1eqqXcSCCCO1euHSmu3uUZrW3r6ERFuUCIpIIH2Z4q8fPme2NvzcdFEzqBeWR6nsWVsPiI0YmwwsiYNGsaGgdwVM8Jlz2rNtiIc2qxkXnpxj/BvouXx/nm21ZPFNNVREXVZRCERBvOQ86HDHMw3FZC6kdkcp/w9x+H0VsAtkZs0cxw6toIXnzBcJt41fZTox8aR21ztNkbesk9ivTAcMbg+FV6DJpJhE3TjyHXX+B2DqXM5dKVtuPbVhmZjU+lc8IGTP6cZMVwpn+kJ1mhb/iPaPh9FoiunhAxyphmB2Ksjmvs2ozHHF16HYXHsAVKjctPFva1PkpyxEW8ClrjneSiU0HvLVKtG/pH+Irisv6R/iKwgLZsmZsny9ZEU5dJh0h1kj3lh/U37jrWsovN6RevWUxaa+YejalqC7Wjs1ZGywyN4zHN3ELRs+5KFzlMUwiICyBxpoG/5e8fF6rUcmZsny7Y5ObjS0JD+ZGDtYf1N+461c9SzBdrR2asrZYZG8Zr2nUELl2rfj33DVExkh5z0IJB2EbCFhWpn7JXtokxPCI9LW+aBo6XvHxeqqs6g6EaEbCD1Lo4stcldwz3pNZ1ItgyHU9szZQaQSI3GU/8AEa+ui19b7wQ1OVxi9bI2QQNYD3vP8N+qZ7dccyikbtC1idASdwXnnGbRu4xetE68rO93lrs+ivXMlz2DAMQta6GOu8t29emz66Lz63cFk4Vfdl2efoREXQZ2V9uC4TcxrEGU6MZc93Oceawdp7kwXCbeN32U6MfGedrnHmsb2lXdlzL9PL9AVqo40jtsszh+KR3f3dyzZ88Y41HtZjxzYyzgFTL1Bteq3jSO2zTO50jv47l8+bsz1su09/uS9W5SXiSX5W6SS9TR+lte71XaY/jdPAqDrd1+gGxjc57uwLmc85Z619NNOPHFr5Jn+NVMCh7rq67QA6MYOdI7sCpDH8buY/fdbuu2DZHEObG3sH8qyOEbKtnF2MxGi+SSeBnFNbXUObv/CP1eqqXcSCCCO1euHSmu3uUZrW3r6ERFuUCIpIIH2Z4q8fPme2NvzcdFEzqBeWR6nsWVsPiI0" 
  },
  { 
    name: "AI Studio / GPT", 
    icon: "https://www.vectorlogo.zone/logos/openai/openai-icon.svg" 
  }
];
