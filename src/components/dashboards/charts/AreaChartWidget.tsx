"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Widget } from "@/types/custom-dashboards";

// =============================================================================
// TYPES
// =============================================================================

interface AreaChartWidgetProps {
  widget: Widget;
}

interface TimeSeriesDataPoint {
  date: string;
  value: number;
  value2?: number;
}

// =============================================================================
// MOCK DATA GENERATION
// =============================================================================

/**
 * Generate mock time-series data based on data binding configuration.
 * Creates realistic-looking data patterns based on source and field names.
 */
function generateMockData(source: string, field: string): TimeSeriesDataPoint[] {
  const dataPoints: TimeSeriesDataPoint[] = [];
  const now = new Date();

  // Determine base value and variation based on source type
  let baseValue = 1000;
  let variation = 0.3;
  let trend = 0.02; // slight upward trend

  switch (source) {
    case "traffic":
      baseValue = field.includes("pageviews") ? 50000 : 15000;
      variation = 0.25;
      break;
    case "revenue":
      baseValue = field.includes("mrr") ? 85000 : 12000;
      variation = 0.15;
      trend = 0.03;
      break;
    case "conversions":
      baseValue = 250;
      variation = 0.35;
      break;
    case "subscriptions":
      baseValue = field.includes("active") ? 2500 : 150;
      variation = 0.1;
      trend = 0.025;
      break;
    case "seo":
      baseValue = field.includes("impressions") ? 100000 : 5000;
      variation = 0.2;
      break;
    case "campaigns":
      baseValue = 8000;
      variation = 0.4;
      break;
    case "demographics":
      baseValue = 3000;
      variation = 0.15;
      break;
    case "predictions":
      baseValue = 10000;
      variation = 0.1;
      trend = 0.04;
      break;
    default:
      baseValue = 1000 + Math.random() * 5000;
      variation = 0.2;
  }

  // Generate 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Add some realistic patterns
    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;
    const trendFactor = 1 + trend * (29 - i);
    const randomVariation = 1 + (Math.random() - 0.5) * variation * 2;

    const value = Math.round(baseValue * weekendFactor * trendFactor * randomVariation);

    dataPoints.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value,
      // Add secondary value for stacked charts
      value2: Math.round(value * (0.3 + Math.random() * 0.4)),
    });
  }

  return dataPoints;
}

/**
 * Format large numbers for display on axes.
 */
function formatAxisValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toString();
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AreaChartWidget({ widget }: AreaChartWidgetProps) {
  const { dataBinding, chartOptions } = widget.config;

  // Extract options with defaults
  const showLegend = chartOptions?.showLegend ?? false;
  const showGrid = chartOptions?.showGrid ?? true;
  const smooth = chartOptions?.smooth ?? false;
  const stacked = chartOptions?.stacked ?? false;
  const animate = chartOptions?.animate ?? true;

  // Generate mock data based on data binding
  const data = generateMockData(dataBinding.source, dataBinding.field);

  // Area curve type
  const curveType = smooth ? "monotone" : "linear";

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />
          )}

          <XAxis
            dataKey="date"
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
            tickLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
            axisLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
            tickMargin={8}
          />

          <YAxis
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
            tickLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
            axisLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
            tickFormatter={formatAxisValue}
            width={45}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-primary, #1f2937)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            labelStyle={{
              color: "var(--text-primary)",
              fontWeight: 600,
              marginBottom: 4,
            }}
            itemStyle={{
              color: "var(--text-secondary)",
            }}
            formatter={(value) => {
              if (typeof value === "number") {
                return [formatAxisValue(value), dataBinding.field];
              }
              return [String(value ?? ""), dataBinding.field];
            }}
          />

          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: 10,
              }}
              formatter={(value) => (
                <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                  {value}
                </span>
              )}
            />
          )}

          <Area
            type={curveType}
            dataKey="value"
            name={dataBinding.field}
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
            strokeWidth={2}
            stackId={stacked ? "stack" : undefined}
            isAnimationActive={animate}
            animationDuration={300}
            animationEasing="ease-out"
          />

          {stacked && (
            <Area
              type={curveType}
              dataKey="value2"
              name="Secondary"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.3}
              strokeWidth={2}
              stackId="stack"
              isAnimationActive={animate}
              animationDuration={300}
              animationEasing="ease-out"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaChartWidget;
