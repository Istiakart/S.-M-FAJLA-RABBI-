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

export const TESTIMONIALS = [
  {
    name: "Alex Rivera",
    role: "CEO, Nexa Brands",
    content: "Rabbi's interest-stacking strategy completely changed our CPA. We went from $15 to $4.20 in just 3 weeks. His technical depth in Meta CAPI setup is unmatched.",
    image: "https://i.pravatar.cc/150?u=alex",
    metric: "4.2x ROAS Increase"
  },
  {
    name: "Sarah Jenkins",
    role: "Marketing Director, Bloom Co.",
    content: "He didn't just build a website; he built a sales machine. Our checkout conversion rate jumped by 18% after the React migration. Truly a full-stack growth expert.",
    image: "https://i.pravatar.cc/150?u=sarah",
    metric: "+18% Conversion"
  },
  {
    name: "Mahmudul Hasan",
    role: "Founder, ClickNova Partner",
    content: "Working with Rabbi on performance campaigns has been seamless. His data-first approach ensures that every BDT spent is accounted for and optimized for ROI.",
    image: "https://i.pravatar.cc/150?u=mahmud",
    metric: "Scalable ROI"
  }
];

export const FAQS = [
  {
    question: "How do you ensure data accuracy after iOS 14 updates?",
    answer: "I implement server-side tracking via Meta Conversions API (CAPI) and GTM Server Container. This allows us to bypass browser restrictions and achieve up to 98% event match quality."
  },
  {
    question: "What's your minimum monthly ad spend for scaling?",
    answer: "For performance scaling, I typically work with brands spending at least BDT 50,000/month. This provides enough data for the algorithm to optimize creative testing effectively."
  },
  {
    question: "Do you offer both web development and ad management?",
    answer: "Yes. In fact, I prefer it. High-performing ads require a high-converting lander. By handling both, I ensure the transition from ad click to purchase is frictionless."
  },
  {
    question: "How quickly can we see results from a new campaign?",
    answer: "We usually see initial data trends within 72 hours. However, a full scaling cycle—including creative testing and interest validation—typically takes 14 to 21 days."
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