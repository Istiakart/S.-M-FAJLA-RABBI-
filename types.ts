
import React from 'react';

export interface Project {
  id: string;
  title: string;
  category: string;
  results: string;
  efficiency: string;
  description: string;
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
}

export interface Tool {
  name: string;
  icon: string;
}
