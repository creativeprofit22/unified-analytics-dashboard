"use client";

import { RadarChart, type RadarIndicator, type RadarSeriesData } from "@/components/charts";
import type { Widget, DataSourceCategory } from "@/types/custom-dashboards";

// =============================================================================
// TYPES
// =============================================================================

interface RadarChartWidgetProps {
  widget: Widget;
}

interface RadarMockData {
  indicators: RadarIndicator[];
  series: RadarSeriesData[];
}

// =============================================================================
// SEEDED RANDOM
// =============================================================================

/**
 * Simple seeded random number generator for consistent mock data.
 */
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

/**
 * Generate a random value within a range using seeded random.
 */
function randomInRange(random: () => number, min: number, max: number): number {
  return Math.round(min + random() * (max - min));
}

// =============================================================================
// MOCK DATA GENERATION
// =============================================================================

/**
 * Generate realistic mock radar data based on the widget's data binding configuration.
 * Returns indicators and series data depending on the source and field names.
 */
function generateMockRadarData(source: DataSourceCategory, field: string): RadarMockData {
  const seed = `${source}-${field}`;
  const random = seededRandom(seed);

  // Traffic-related radar data
  if (source === "traffic") {
    const indicators: RadarIndicator[] = [
      { name: "Page Views", max: 100000 },
      { name: "Unique Visitors", max: 50000 },
      { name: "Bounce Rate", max: 100 },
      { name: "Session Duration", max: 600 },
      { name: "Pages/Session", max: 10 },
      { name: "Return Rate", max: 100 },
    ];
    return {
      indicators,
      series: [
        {
          name: "This Month",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.6, ind.max * 0.95)),
          color: "#3b82f6",
        },
        {
          name: "Last Month",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.5, ind.max * 0.85)),
          color: "#94a3b8",
        },
      ],
    };
  }

  // SEO-related radar data
  if (source === "seo") {
    const indicators: RadarIndicator[] = [
      { name: "Performance", max: 100 },
      { name: "Accessibility", max: 100 },
      { name: "Best Practices", max: 100 },
      { name: "SEO Score", max: 100 },
      { name: "Core Web Vitals", max: 100 },
    ];
    return {
      indicators,
      series: [
        {
          name: "Current",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.65, ind.max * 0.98)),
          color: "#22c55e",
        },
        {
          name: "Target",
          values: indicators.map(() => 90),
          color: "#f59e0b",
          areaOpacity: 0.1,
        },
      ],
    };
  }

  // Revenue-related radar data
  if (source === "revenue") {
    const indicators: RadarIndicator[] = [
      { name: "Gross Revenue", max: 100000 },
      { name: "Net Revenue", max: 80000 },
      { name: "Recurring Revenue", max: 60000 },
      { name: "New Sales", max: 40000 },
      { name: "Upsells", max: 20000 },
      { name: "Renewals", max: 50000 },
    ];
    return {
      indicators,
      series: [
        {
          name: "Actual",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.6, ind.max * 0.95)),
          color: "#8b5cf6",
        },
        {
          name: "Forecast",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.7, ind.max)),
          color: "#06b6d4",
          areaOpacity: 0.1,
        },
      ],
    };
  }

  // Subscriptions-related radar data
  if (source === "subscriptions") {
    const indicators: RadarIndicator[] = [
      { name: "Active Users", max: 10000 },
      { name: "Trial Conversions", max: 100 },
      { name: "Churn Rate", max: 100 },
      { name: "Upgrade Rate", max: 100 },
      { name: "Engagement Score", max: 100 },
    ];
    return {
      indicators,
      series: [
        {
          name: "Current",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.6, ind.max * 0.9)),
          color: "#ef4444",
        },
        {
          name: "Industry Avg",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.5, ind.max * 0.7)),
          color: "#94a3b8",
          areaOpacity: 0.1,
        },
      ],
    };
  }

  // Conversions-related radar data
  if (source === "conversions") {
    const indicators: RadarIndicator[] = [
      { name: "Landing Page", max: 100 },
      { name: "Sign Up Form", max: 100 },
      { name: "Checkout", max: 100 },
      { name: "Email Capture", max: 100 },
      { name: "Free Trial", max: 100 },
      { name: "Demo Request", max: 100 },
    ];
    return {
      indicators,
      series: [
        {
          name: "Conversion Rate",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.3, ind.max * 0.8)),
          color: "#f59e0b",
        },
      ],
    };
  }

  // Campaigns-related radar data
  if (source === "campaigns") {
    const indicators: RadarIndicator[] = [
      { name: "Reach", max: 100000 },
      { name: "Engagement", max: 10000 },
      { name: "Click Rate", max: 100 },
      { name: "Conversion", max: 100 },
      { name: "ROI", max: 500 },
    ];
    return {
      indicators,
      series: [
        {
          name: "Campaign A",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.5, ind.max * 0.9)),
          color: "#3b82f6",
        },
        {
          name: "Campaign B",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.4, ind.max * 0.85)),
          color: "#22c55e",
        },
      ],
    };
  }

  // Demographics-related radar data
  if (source === "demographics") {
    const indicators: RadarIndicator[] = [
      { name: "18-24", max: 100 },
      { name: "25-34", max: 100 },
      { name: "35-44", max: 100 },
      { name: "45-54", max: 100 },
      { name: "55+", max: 100 },
    ];
    return {
      indicators,
      series: [
        {
          name: "User Distribution",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.2, ind.max * 0.8)),
          color: "#8b5cf6",
        },
      ],
    };
  }

  // Payments-related radar data
  if (source === "payments") {
    const indicators: RadarIndicator[] = [
      { name: "Success Rate", max: 100 },
      { name: "Processing Speed", max: 100 },
      { name: "Fraud Detection", max: 100 },
      { name: "Dispute Rate", max: 100 },
      { name: "Refund Rate", max: 100 },
    ];
    return {
      indicators,
      series: [
        {
          name: "Current",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.7, ind.max * 0.98)),
          color: "#22c55e",
        },
        {
          name: "Benchmark",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.8, ind.max * 0.95)),
          color: "#94a3b8",
          areaOpacity: 0.1,
        },
      ],
    };
  }

  // Unit economics radar data
  if (source === "unitEconomics") {
    const indicators: RadarIndicator[] = [
      { name: "CAC", max: 500 },
      { name: "LTV", max: 5000 },
      { name: "LTV:CAC Ratio", max: 10 },
      { name: "Payback Period", max: 24 },
      { name: "Gross Margin", max: 100 },
      { name: "Net Margin", max: 100 },
    ];
    return {
      indicators,
      series: [
        {
          name: "Actual",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.5, ind.max * 0.9)),
          color: "#06b6d4",
        },
        {
          name: "Target",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.7, ind.max * 0.95)),
          color: "#f59e0b",
          areaOpacity: 0.1,
        },
      ],
    };
  }

  // Segmentation radar data
  if (source === "segmentation") {
    const indicators: RadarIndicator[] = [
      { name: "Engagement", max: 100 },
      { name: "Retention", max: 100 },
      { name: "Monetization", max: 100 },
      { name: "Advocacy", max: 100 },
      { name: "Growth Potential", max: 100 },
    ];
    return {
      indicators,
      series: [
        {
          name: "Power Users",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.75, ind.max * 0.98)),
          color: "#3b82f6",
        },
        {
          name: "Regular Users",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.4, ind.max * 0.7)),
          color: "#94a3b8",
        },
      ],
    };
  }

  // Predictions radar data
  if (source === "predictions") {
    const indicators: RadarIndicator[] = [
      { name: "Accuracy", max: 100 },
      { name: "Precision", max: 100 },
      { name: "Recall", max: 100 },
      { name: "F1 Score", max: 100 },
      { name: "Confidence", max: 100 },
    ];
    return {
      indicators,
      series: [
        {
          name: "Model Performance",
          values: indicators.map((ind) => randomInRange(random, ind.max * 0.7, ind.max * 0.95)),
          color: "#8b5cf6",
        },
      ],
    };
  }

  // Default fallback - generic performance metrics
  const indicators: RadarIndicator[] = [
    { name: "Performance", max: 100 },
    { name: "Security", max: 100 },
    { name: "SEO", max: 100 },
    { name: "UX", max: 100 },
    { name: "Speed", max: 100 },
    { name: "Reliability", max: 100 },
  ];
  return {
    indicators,
    series: [
      {
        name: "Current",
        values: indicators.map((ind) => randomInRange(random, ind.max * 0.6, ind.max * 0.95)),
        color: "#3b82f6",
      },
      {
        name: "Target",
        values: indicators.map(() => 85),
        color: "#f59e0b",
        areaOpacity: 0.1,
      },
    ],
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export function RadarChartWidget({ widget }: RadarChartWidgetProps) {
  const { dataBinding, chartOptions } = widget.config;

  // Extract options with defaults
  const showLegend = chartOptions?.showLegend ?? true;

  // Generate mock data based on data binding
  const { indicators, series } = generateMockRadarData(
    dataBinding.source,
    dataBinding.field
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <RadarChart
        indicators={indicators}
        series={series}
        showLegend={showLegend}
      />
    </div>
  );
}

export default RadarChartWidget;
