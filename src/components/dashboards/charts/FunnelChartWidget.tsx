"use client";

import { FunnelChart, type FunnelDataItem } from "@/components/charts";
import type { Widget, DataSourceCategory } from "@/types/custom-dashboards";

interface FunnelChartWidgetProps {
  widget: Widget;
}

/**
 * Generates mock funnel data based on the data source and field.
 * Creates realistic funnel stages with descending values.
 */
function generateMockFunnelData(
  source: DataSourceCategory,
  field: string
): FunnelDataItem[] {
  // Generate a seed based on source and field for consistent mock data
  const seedString = `${source}-${field}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed += seedString.charCodeAt(i);
  }

  // Simple seeded random function
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Funnel stage templates by source category
  const funnelStages: Record<DataSourceCategory, string[]> = {
    traffic: ["Visitors", "Page Views", "Engaged", "Returning"],
    seo: ["Impressions", "Clicks", "Sessions", "Conversions"],
    conversions: ["Visitors", "Signups", "Trial", "Paid"],
    revenue: ["Leads", "Qualified", "Proposals", "Closed Won"],
    subscriptions: ["Visitors", "Free Trial", "Active", "Premium"],
    payments: ["Cart Started", "Checkout", "Payment", "Completed"],
    unitEconomics: ["Awareness", "Interest", "Decision", "Action"],
    demographics: ["Total Users", "Active", "Engaged", "Power Users"],
    segmentation: ["All Segments", "Target", "Qualified", "Converted"],
    campaigns: ["Impressions", "Clicks", "Leads", "Customers"],
    predictions: ["Prospects", "MQLs", "SQLs", "Opportunities", "Won"],
  };

  // Base value ranges by source category
  const baseRanges: Record<DataSourceCategory, { start: number; dropOff: number }> = {
    traffic: { start: 50000, dropOff: 0.35 },
    seo: { start: 100000, dropOff: 0.4 },
    conversions: { start: 10000, dropOff: 0.5 },
    revenue: { start: 5000, dropOff: 0.45 },
    subscriptions: { start: 8000, dropOff: 0.55 },
    payments: { start: 3000, dropOff: 0.3 },
    unitEconomics: { start: 20000, dropOff: 0.4 },
    demographics: { start: 100000, dropOff: 0.5 },
    segmentation: { start: 15000, dropOff: 0.45 },
    campaigns: { start: 200000, dropOff: 0.6 },
    predictions: { start: 10000, dropOff: 0.5 },
  };

  // Color palettes for different source categories
  const colorPalettes: Record<DataSourceCategory, string[]> = {
    traffic: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
    seo: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
    conversions: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"],
    revenue: ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a"],
    subscriptions: ["#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8"],
    payments: ["#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc"],
    unitEconomics: ["#84cc16", "#a3e635", "#bef264", "#d9f99d"],
    demographics: ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"],
    segmentation: ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3"],
    campaigns: ["#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4"],
    predictions: ["#f97316", "#fb923c", "#fdba74", "#fed7aa"],
  };

  const stages = funnelStages[source] || ["Stage 1", "Stage 2", "Stage 3", "Stage 4"];
  const range = baseRanges[source] || { start: 10000, dropOff: 0.4 };
  const colors = colorPalettes[source] || ["#3b82f6", "#06b6d4", "#22c55e", "#eab308"];

  // Apply some randomness to the starting value based on the field
  const startValue = Math.round(range.start * (0.7 + seededRandom() * 0.6));

  // Generate funnel data with descending values
  let currentValue = startValue;

  return stages.map((name, index) => {
    const value = Math.round(currentValue);

    // Calculate drop-off for next stage with some randomness
    const randomDropOff = range.dropOff * (0.7 + seededRandom() * 0.6);
    currentValue = currentValue * (1 - randomDropOff);

    return {
      name,
      value,
      color: colors[index % colors.length],
    };
  });
}

export function FunnelChartWidget({ widget }: FunnelChartWidgetProps) {
  const { dataBinding, chartOptions } = widget.config;

  // Extract options with defaults
  const showLabels = chartOptions?.showDataLabels ?? true;
  const orientation = chartOptions?.orientation ?? "vertical";

  // Generate mock data based on data binding
  const data = generateMockFunnelData(dataBinding.source, dataBinding.field);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <FunnelChart
        data={data}
        height={undefined}
        showLabels={showLabels}
        orientation={orientation}
      />
    </div>
  );
}

export default FunnelChartWidget;
