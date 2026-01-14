"use client";

import { HeatmapChart, type HeatmapDataItem } from "@/components/charts";
import type { Widget, DataSourceCategory } from "@/types/custom-dashboards";

interface HeatmapWidgetProps {
  widget: Widget;
}

interface MockHeatmapData {
  data: HeatmapDataItem[];
  xLabels: string[];
  yLabels: string[];
}

/**
 * Seeded pseudo-random number generator for consistent data generation.
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * Generates mock heatmap data based on the data source and field.
 * Creates cohort-style data with realistic decay patterns over time.
 */
function generateMockHeatmapData(
  source: DataSourceCategory | string,
  field: string
): MockHeatmapData {
  // Create deterministic seed from source and field
  const seedString = `${source}-${field}`;
  const seed = seedString
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);

  // Determine labels based on source type
  const labelConfigs: Record<
    string,
    { xLabels: string[]; yLabels: string[]; baseValue: number }
  > = {
    traffic: {
      xLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      yLabels: ["Cohort 1", "Cohort 2", "Cohort 3", "Cohort 4", "Cohort 5", "Cohort 6"],
      baseValue: 1000,
    },
    seo: {
      xLabels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"],
      yLabels: ["Organic", "Direct", "Referral", "Social", "Email", "Paid"],
      baseValue: 500,
    },
    conversions: {
      xLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      yLabels: ["New Users", "Returning", "Power Users", "Dormant", "Reactivated", "Trial"],
      baseValue: 200,
    },
    revenue: {
      xLabels: ["Q1W1", "Q1W2", "Q1W3", "Q1W4", "Q2W1", "Q2W2", "Q2W3", "Q2W4", "Q3W1", "Q3W2", "Q3W3", "Q3W4"],
      yLabels: ["Enterprise", "Pro", "Basic", "Starter", "Free Trial", "Churned"],
      baseValue: 5000,
    },
    subscriptions: {
      xLabels: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", "Month 7", "Month 8", "Month 9", "Month 10", "Month 11", "Month 12"],
      yLabels: ["Annual", "Monthly", "Quarterly", "Trial", "Paused", "Cancelled"],
      baseValue: 150,
    },
    payments: {
      xLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      yLabels: ["Credit Card", "PayPal", "Bank Transfer", "Crypto", "Invoice", "Other"],
      baseValue: 800,
    },
    unitEconomics: {
      xLabels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"],
      yLabels: ["CAC", "LTV", "ARPU", "MRR", "Churn Rate", "NRR"],
      baseValue: 100,
    },
    demographics: {
      xLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      yLabels: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
      baseValue: 300,
    },
    segmentation: {
      xLabels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"],
      yLabels: ["High Value", "Growing", "At Risk", "Dormant", "New", "Churned"],
      baseValue: 250,
    },
    campaigns: {
      xLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      yLabels: ["Email", "Social", "PPC", "Content", "Affiliate", "Display"],
      baseValue: 400,
    },
    predictions: {
      xLabels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"],
      yLabels: ["High Confidence", "Medium Confidence", "Low Confidence", "Uncertain", "Needs Review", "Excluded"],
      baseValue: 80,
    },
  };

  // Get config for source, or use default
  const config = labelConfigs[source] || {
    xLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    yLabels: ["Cohort 1", "Cohort 2", "Cohort 3", "Cohort 4", "Cohort 5", "Cohort 6"],
    baseValue: 500,
  };

  const { xLabels, yLabels, baseValue } = config;

  // Generate cohort-style data with decay over time
  // Higher values in early months, declining over time (realistic retention pattern)
  const data: HeatmapDataItem[] = [];

  for (let y = 0; y < yLabels.length; y++) {
    for (let x = 0; x < xLabels.length; x++) {
      // Calculate decay factor - values decrease as x increases
      // Each cohort (y) has slightly different decay rate
      const cohortFactor = 1 - y * 0.08; // Earlier cohorts retain better
      const timeDecay = Math.exp(-x * (0.15 + y * 0.02)); // Exponential decay over time
      const noise = 0.8 + random() * 0.4; // Add some randomness (80% to 120%)

      // For early periods in each cohort, values are higher
      // Also factor in seasonal variation
      const seasonalFactor = 1 + 0.2 * Math.sin((x / xLabels.length) * Math.PI * 2);

      const value = Math.round(
        baseValue * cohortFactor * timeDecay * noise * seasonalFactor
      );

      // Ensure value doesn't go below a minimum threshold
      data.push({
        x,
        y,
        value: Math.max(value, Math.round(baseValue * 0.02)),
      });
    }
  }

  return {
    data,
    xLabels,
    yLabels,
  };
}

export function HeatmapWidget({ widget }: HeatmapWidgetProps) {
  const { dataBinding, chartOptions } = widget.config;

  // Extract options with defaults
  const showValues = chartOptions?.showDataLabels ?? true;

  // Generate mock data based on data binding
  const { data, xLabels, yLabels } = generateMockHeatmapData(
    dataBinding.source,
    dataBinding.field
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <HeatmapChart
        data={data}
        xLabels={xLabels}
        yLabels={yLabels}
        height={300}
        showValues={showValues}
      />
    </div>
  );
}

export default HeatmapWidget;
