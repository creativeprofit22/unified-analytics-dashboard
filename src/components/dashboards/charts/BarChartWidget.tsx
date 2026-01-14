"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Widget } from "@/types/custom-dashboards";

interface BarChartWidgetProps {
  widget: Widget;
}

interface MockDataItem {
  name: string;
  value: number;
}

/**
 * Generates mock categorical data based on the data source and field.
 * In production, this would be replaced with actual data fetching.
 */
function generateMockData(source: string, field: string): MockDataItem[] {
  // Create deterministic but varied data based on source and field
  const seedString = `${source}-${field}`;
  const seed = seedString.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const categoryMaps: Record<string, string[]> = {
    traffic: ["Direct", "Organic", "Referral", "Social", "Email", "Paid"],
    seo: ["Google", "Bing", "Yahoo", "DuckDuckGo", "Other"],
    conversions: ["Landing Page", "Product Page", "Checkout", "Cart", "Thank You"],
    revenue: ["Q1", "Q2", "Q3", "Q4"],
    subscriptions: ["Basic", "Pro", "Enterprise", "Trial"],
    payments: ["Credit Card", "PayPal", "Bank Transfer", "Crypto"],
    unitEconomics: ["CAC", "LTV", "ARPU", "MRR", "Churn"],
    demographics: ["18-24", "25-34", "35-44", "45-54", "55+"],
    segmentation: ["New Users", "Returning", "Power Users", "Dormant"],
    campaigns: ["Email", "Social", "PPC", "Content", "Affiliate"],
    predictions: ["Week 1", "Week 2", "Week 3", "Week 4"],
  };

  const categories = categoryMaps[source] || ["Category A", "Category B", "Category C", "Category D", "Category E"];

  return categories.map((name, index) => {
    // Generate pseudo-random value based on seed and index
    const pseudoRandom = ((seed * (index + 1) * 17) % 900) + 100;
    return {
      name,
      value: pseudoRandom,
    };
  });
}

export function BarChartWidget({ widget }: BarChartWidgetProps) {
  const { dataBinding, chartOptions } = widget.config;

  // Extract options with defaults
  const showLegend = chartOptions?.showLegend ?? false;
  const showGrid = chartOptions?.showGrid ?? true;
  const stacked = chartOptions?.stacked ?? false;
  const orientation = chartOptions?.orientation ?? "vertical";
  const animate = chartOptions?.animate ?? true;

  // Generate mock data based on data binding
  const data = generateMockData(dataBinding.source, dataBinding.field);

  // Bar color
  const barColor = "#82ca9d";

  // Determine layout based on orientation
  // 'vertical' = bars go up (standard), 'horizontal' = bars go sideways
  const layout = orientation === "horizontal" ? "vertical" : "horizontal";

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={orientation === "vertical"}
              horizontal={orientation === "horizontal" || orientation === "vertical"}
            />
          )}

          {orientation === "horizontal" ? (
            <>
              <XAxis
                type="category"
                dataKey="name"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                type="number"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                width={80}
              />
            </>
          )}

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-primary, #1f2937)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "var(--text-primary, #fff)",
            }}
            labelStyle={{ color: "var(--text-primary, #fff)" }}
            itemStyle={{ color: "var(--text-secondary, #9ca3af)" }}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
          />

          {showLegend && (
            <Legend
              wrapperStyle={{ color: "var(--text-secondary)" }}
            />
          )}

          <Bar
            dataKey="value"
            fill={barColor}
            isAnimationActive={animate}
            animationDuration={300}
            animationEasing="ease-out"
            stackId={stacked ? "stack" : undefined}
            radius={orientation === "vertical" ? [4, 4, 0, 0] : [0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartWidget;
