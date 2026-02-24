
import React from 'react';

export interface Project {
  id: string;
  title: string;
  category: 'E-commerce' | 'Leads' | 'Engagement' | 'Website Build';
  results: string;
  efficiency: string;
  description: string;
  imageUrls?: string[];
  link?: string;
  metrics?: {
    label: string;
    value: string;
    description: string;
  }[];
  chartData?: { 
    name: string; 
    value: number | string; 
  }[];
  demographics?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string; // Primary avatar image
  imageUrls?: string[]; // Support for multiple proof images (max 2)
  metric: string;
}

export interface FAQData {
  id: string;
  question: string;
  answer: string;
}

export interface Visit {
  id: string;
  timestamp: string;
  userAgent: string;
  platform: string;
  page: string;
}

export interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
  subServices?: string[];
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  subtitle?: string;
}

export interface SiteIdentity {
  logoUrl: string;
  profileImageUrl: string;
  cvUrl?: string;
  googleFormUrl?: string;
  googleSheetUrl?: string;
  whatsAppNumber?: string;
  linkedInUrl?: string;
  blobToken?: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  businessName?: string;
  requirements?: string;
  timestamp: string;
}
