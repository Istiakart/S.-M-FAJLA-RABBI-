
import React from 'react';

/**
 * Interface representing a marketing case study project.
 * Includes data for results, efficiency metrics, and performance charts.
 * Optimized with optional parameters for flexible project documentation.
 */
export interface Project {
  id: string;
  title: string;
  category: string;
  results: string;
  efficiency: string;
  description: string;
  /**
   * Array of core KPIs (e.g., CPC, CTR, Reach).
   * Optional to allow for projects in early stages or with restricted data.
   */
  metrics?: {
    label: string;
    value: string;
    description: string;
  }[];
  /**
   * Data for the Recharts performance visualization.
   * Value supports number | string for flexible data reporting (e.g., percentages or currency strings).
   */
  chartData?: { 
    name: string; 
    value: number | string; 
  }[];
  /**
   * Target audience and geographic breakdown.
   */
  demographics?: string;
}

/**
 * Interface for core services offered.
 * icon property accepts ReactNode to handle Lucide components, SVGs, or custom images.
 */
export interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * Interface for technical tools in the marketing stack.
 */
export interface Tool {
  name: string;
  icon: string;
}
