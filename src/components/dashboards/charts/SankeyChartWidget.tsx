"use client";

import { SankeyChart, type SankeyNode, type SankeyLink } from "@/components/charts";
import type { Widget, DataSourceCategory } from "@/types/custom-dashboards";

interface SankeyChartWidgetProps {
  widget: Widget;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

/**
 * Seeded random number generator for deterministic mock data.
 * Uses a simple linear congruential generator (LCG).
 */
function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Generates mock Sankey data based on the data source and field.
 * Creates a 3-level flow diagram with appropriate nodes for each source type.
 */
function generateMockSankeyData(
  source: DataSourceCategory | string,
  field: string
): SankeyData {
  // Create deterministic seed from source and field
  const seedString = `${source}-${field}-sankey`;
  const seed = seedString.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = createSeededRandom(seed);

  // Define node configurations for different data sources
  const sourceConfigs: Record<
    string,
    {
      level1: { name: string; color: string }[];
      level2: { name: string; color: string }[];
      level3: { name: string; color: string }[];
    }
  > = {
    traffic: {
      // Source channels → Page types → Conversion outcomes
      level1: [
        { name: "Organic Search", color: "#22c55e" },
        { name: "Direct", color: "#3b82f6" },
        { name: "Social Media", color: "#ec4899" },
        { name: "Email", color: "#f59e0b" },
        { name: "Paid Ads", color: "#8b5cf6" },
      ],
      level2: [
        { name: "Landing Page", color: "#06b6d4" },
        { name: "Product Page", color: "#14b8a6" },
        { name: "Blog Post", color: "#84cc16" },
        { name: "Pricing Page", color: "#f97316" },
      ],
      level3: [
        { name: "Converted", color: "#22c55e" },
        { name: "Bounced", color: "#ef4444" },
        { name: "Engaged", color: "#3b82f6" },
      ],
    },
    conversions: {
      // Entry points → Steps → Exit/Convert
      level1: [
        { name: "Homepage", color: "#3b82f6" },
        { name: "Product Listing", color: "#8b5cf6" },
        { name: "Search Results", color: "#06b6d4" },
        { name: "Campaign Landing", color: "#f59e0b" },
      ],
      level2: [
        { name: "Add to Cart", color: "#22c55e" },
        { name: "View Details", color: "#14b8a6" },
        { name: "Compare", color: "#84cc16" },
        { name: "Wishlist", color: "#ec4899" },
      ],
      level3: [
        { name: "Checkout Complete", color: "#22c55e" },
        { name: "Cart Abandoned", color: "#ef4444" },
        { name: "Return Visit", color: "#f97316" },
      ],
    },
    revenue: {
      // Revenue sources → Products → Outcomes
      level1: [
        { name: "Subscriptions", color: "#3b82f6" },
        { name: "One-time Sales", color: "#22c55e" },
        { name: "Upsells", color: "#8b5cf6" },
        { name: "Renewals", color: "#f59e0b" },
      ],
      level2: [
        { name: "Basic Plan", color: "#06b6d4" },
        { name: "Pro Plan", color: "#14b8a6" },
        { name: "Enterprise", color: "#ec4899" },
        { name: "Add-ons", color: "#84cc16" },
      ],
      level3: [
        { name: "Active", color: "#22c55e" },
        { name: "Churned", color: "#ef4444" },
        { name: "Upgraded", color: "#3b82f6" },
      ],
    },
    subscriptions: {
      // Acquisition → Plan → Status
      level1: [
        { name: "Trial Start", color: "#3b82f6" },
        { name: "Direct Signup", color: "#22c55e" },
        { name: "Upgrade Path", color: "#8b5cf6" },
      ],
      level2: [
        { name: "Starter", color: "#06b6d4" },
        { name: "Growth", color: "#14b8a6" },
        { name: "Scale", color: "#f59e0b" },
        { name: "Enterprise", color: "#ec4899" },
      ],
      level3: [
        { name: "Active Subscriber", color: "#22c55e" },
        { name: "Cancelled", color: "#ef4444" },
        { name: "Paused", color: "#f97316" },
        { name: "Downgraded", color: "#eab308" },
      ],
    },
    campaigns: {
      // Campaign types → Channels → Results
      level1: [
        { name: "Brand Awareness", color: "#8b5cf6" },
        { name: "Lead Gen", color: "#3b82f6" },
        { name: "Retargeting", color: "#f59e0b" },
        { name: "Seasonal", color: "#ec4899" },
      ],
      level2: [
        { name: "Email", color: "#22c55e" },
        { name: "Social", color: "#06b6d4" },
        { name: "Display", color: "#14b8a6" },
        { name: "Search", color: "#84cc16" },
      ],
      level3: [
        { name: "Converted", color: "#22c55e" },
        { name: "Engaged", color: "#3b82f6" },
        { name: "Ignored", color: "#6b7280" },
      ],
    },
    segmentation: {
      // User types → Behaviors → Outcomes
      level1: [
        { name: "New Users", color: "#3b82f6" },
        { name: "Returning", color: "#22c55e" },
        { name: "Power Users", color: "#8b5cf6" },
        { name: "At Risk", color: "#f59e0b" },
      ],
      level2: [
        { name: "Browse Only", color: "#6b7280" },
        { name: "Light Usage", color: "#06b6d4" },
        { name: "Regular Usage", color: "#14b8a6" },
        { name: "Heavy Usage", color: "#ec4899" },
      ],
      level3: [
        { name: "Retained", color: "#22c55e" },
        { name: "Churned", color: "#ef4444" },
        { name: "Upgraded", color: "#3b82f6" },
      ],
    },
  };

  // Default configuration for unrecognized sources
  const defaultConfig = {
    level1: [
      { name: "Source A", color: "#3b82f6" },
      { name: "Source B", color: "#22c55e" },
      { name: "Source C", color: "#8b5cf6" },
      { name: "Source D", color: "#f59e0b" },
    ],
    level2: [
      { name: "Process 1", color: "#06b6d4" },
      { name: "Process 2", color: "#14b8a6" },
      { name: "Process 3", color: "#ec4899" },
    ],
    level3: [
      { name: "Outcome X", color: "#22c55e" },
      { name: "Outcome Y", color: "#ef4444" },
      { name: "Outcome Z", color: "#84cc16" },
    ],
  };

  const config = sourceConfigs[source] || defaultConfig;

  // Build nodes with colors
  const nodes: SankeyNode[] = [
    ...config.level1.map((n) => ({ name: n.name, itemStyle: { color: n.color } })),
    ...config.level2.map((n) => ({ name: n.name, itemStyle: { color: n.color } })),
    ...config.level3.map((n) => ({ name: n.name, itemStyle: { color: n.color } })),
  ];

  // Generate links between levels with seeded random values
  const links: SankeyLink[] = [];

  // Level 1 → Level 2 links
  for (const source of config.level1) {
    // Each level 1 node connects to 2-3 level 2 nodes
    const numConnections = 2 + Math.floor(random() * 2);
    const shuffledLevel2 = [...config.level2].sort(() => random() - 0.5);

    for (let i = 0; i < Math.min(numConnections, shuffledLevel2.length); i++) {
      const target = shuffledLevel2[i];
      if (!target) continue;
      const value = Math.floor(random() * 4000) + 500;
      links.push({
        source: source.name,
        target: target.name,
        value,
      });
    }
  }

  // Level 2 → Level 3 links
  for (const source of config.level2) {
    // Each level 2 node connects to 1-2 level 3 nodes
    const numConnections = 1 + Math.floor(random() * 2);
    const shuffledLevel3 = [...config.level3].sort(() => random() - 0.5);

    for (let i = 0; i < Math.min(numConnections, shuffledLevel3.length); i++) {
      const target = shuffledLevel3[i];
      if (!target) continue;
      const value = Math.floor(random() * 3000) + 300;
      links.push({
        source: source.name,
        target: target.name,
        value,
      });
    }
  }

  return { nodes, links };
}

export function SankeyChartWidget({ widget }: SankeyChartWidgetProps) {
  const { dataBinding, chartOptions } = widget.config;

  // Extract orientation from chart options
  const orientation = chartOptions?.orientation ?? "horizontal";

  // Generate mock Sankey data based on data binding
  const { nodes, links } = generateMockSankeyData(dataBinding.source, dataBinding.field);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <SankeyChart
        nodes={nodes}
        links={links}
        height={undefined}
        className="h-full"
        orientation={orientation}
      />
    </div>
  );
}

export default SankeyChartWidget;
