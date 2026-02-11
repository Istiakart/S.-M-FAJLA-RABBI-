
import React from 'react';

export interface Project {
  id: string;
  title: string;
  category: 'E-commerce' | 'Leads' | 'Engagement' | 'Website Build';
  results: string;
  efficiency: string;
  description: string;
  imageUrl?: string;
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
  name: string;
  icon: string;
}
