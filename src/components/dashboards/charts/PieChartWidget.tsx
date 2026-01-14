"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Widget } from "@/types/custom-dashboards";
import type { PieLabelRenderProps } from "recharts";

// =============================================================================
// TYPES
// =============================================================================

interface PieChartWidgetProps {
  widget: Widget;
}

interface PieDataItem {
  name: string;
  value: number;
  [key: string]: unknown;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F"];
const RADIAN = Math.PI / 180;

// =============================================================================
// MOCK DATA GENERATION
// =============================================================================

/**
 * Generate realistic mock data based on the widget's data binding configuration.
 * Returns different datasets depending on the source and field names.
 */
function generateMockData(source: string, field: string): PieDataItem[] {
  // Traffic-related data
  if (source === "traffic") {
    if (field.includes("source") || field.includes("channel")) {
      return [
        { name: "Organic Search", value: 4200 },
        { name: "Direct", value: 2800 },
        { name: "Social Media", value: 1900 },
        { name: "Referral", value: 1200 },
        { name: "Email", value: 800 },
      ];
    }
    if (field.includes("device")) {
      return [
        { name: "Desktop", value: 5200 },
        { name: "Mobile", value: 3800 },
        { name: "Tablet", value: 900 },
      ];
    }
    if (field.includes("browser")) {
      return [
        { name: "Chrome", value: 5400 },
        { name: "Safari", value: 2100 },
        { name: "Firefox", value: 1200 },
        { name: "Edge", value: 800 },
        { name: "Other", value: 400 },
      ];
    }
    // Default traffic data
    return [
      { name: "New Visitors", value: 6200 },
      { name: "Returning", value: 3800 },
    ];
  }

  // Revenue-related data
  if (source === "revenue") {
    if (field.includes("product") || field.includes("category")) {
      return [
        { name: "SaaS Subscriptions", value: 45000 },
        { name: "One-time Purchases", value: 28000 },
        { name: "Add-ons", value: 15000 },
        { name: "Services", value: 9000 },
        { name: "Other", value: 3000 },
      ];
    }
    if (field.includes("region") || field.includes("geo")) {
      return [
        { name: "North America", value: 52000 },
        { name: "Europe", value: 31000 },
        { name: "Asia Pacific", value: 18000 },
        { name: "Latin America", value: 6000 },
        { name: "Other", value: 3000 },
      ];
    }
    // Default revenue data
    return [
      { name: "Enterprise", value: 65000 },
      { name: "Pro", value: 28000 },
      { name: "Starter", value: 12000 },
    ];
  }

  // Subscriptions data
  if (source === "subscriptions") {
    if (field.includes("plan") || field.includes("tier")) {
      return [
        { name: "Enterprise", value: 320 },
        { name: "Pro", value: 890 },
        { name: "Basic", value: 1450 },
        { name: "Free Trial", value: 640 },
      ];
    }
    if (field.includes("status")) {
      return [
        { name: "Active", value: 2800 },
        { name: "Churned", value: 420 },
        { name: "Paused", value: 180 },
      ];
    }
    // Default subscriptions data
    return [
      { name: "Monthly", value: 1850 },
      { name: "Annual", value: 1250 },
    ];
  }

  // Conversions data
  if (source === "conversions") {
    if (field.includes("source") || field.includes("channel")) {
      return [
        { name: "Landing Page A", value: 420 },
        { name: "Landing Page B", value: 380 },
        { name: "Blog Posts", value: 290 },
        { name: "Product Pages", value: 210 },
        { name: "Pricing Page", value: 150 },
      ];
    }
    // Default conversions data
    return [
      { name: "Completed", value: 1250 },
      { name: "Abandoned", value: 3800 },
      { name: "In Progress", value: 450 },
    ];
  }

  // Demographics data
  if (source === "demographics") {
    if (field.includes("age")) {
      return [
        { name: "18-24", value: 1200 },
        { name: "25-34", value: 3200 },
        { name: "35-44", value: 2800 },
        { name: "45-54", value: 1600 },
        { name: "55+", value: 900 },
      ];
    }
    if (field.includes("gender")) {
      return [
        { name: "Male", value: 5200 },
        { name: "Female", value: 4300 },
        { name: "Other", value: 400 },
      ];
    }
    // Default demographics data
    return [
      { name: "B2B", value: 4200 },
      { name: "B2C", value: 3100 },
      { name: "Enterprise", value: 1800 },
    ];
  }

  // Campaigns data
  if (source === "campaigns") {
    if (field.includes("type")) {
      return [
        { name: "Email", value: 3200 },
        { name: "Social", value: 2800 },
        { name: "PPC", value: 2100 },
        { name: "Content", value: 1600 },
        { name: "Affiliate", value: 900 },
      ];
    }
    if (field.includes("status")) {
      return [
        { name: "Active", value: 12 },
        { name: "Scheduled", value: 5 },
        { name: "Completed", value: 28 },
        { name: "Draft", value: 8 },
      ];
    }
    // Default campaigns data
    return [
      { name: "Q1 Campaign", value: 45000 },
      { name: "Q2 Campaign", value: 62000 },
      { name: "Q3 Campaign", value: 38000 },
      { name: "Q4 Campaign", value: 55000 },
    ];
  }

  // SEO data
  if (source === "seo") {
    if (field.includes("keyword") || field.includes("ranking")) {
      return [
        { name: "Top 3", value: 45 },
        { name: "4-10", value: 82 },
        { name: "11-20", value: 120 },
        { name: "21-50", value: 210 },
        { name: "51+", value: 340 },
      ];
    }
    // Default SEO data
    return [
      { name: "Indexed", value: 1250 },
      { name: "Not Indexed", value: 180 },
      { name: "Errors", value: 35 },
    ];
  }

  // Payments data
  if (source === "payments") {
    if (field.includes("method")) {
      return [
        { name: "Credit Card", value: 6200 },
        { name: "PayPal", value: 2100 },
        { name: "Bank Transfer", value: 1400 },
        { name: "Crypto", value: 450 },
        { name: "Other", value: 280 },
      ];
    }
    if (field.includes("status")) {
      return [
        { name: "Successful", value: 9200 },
        { name: "Failed", value: 380 },
        { name: "Pending", value: 220 },
        { name: "Refunded", value: 180 },
      ];
    }
    // Default payments data
    return [
      { name: "One-time", value: 4800 },
      { name: "Recurring", value: 5400 },
    ];
  }

  // Unit economics data
  if (source === "unitEconomics") {
    return [
      { name: "Customer Acquisition", value: 12000 },
      { name: "Customer Retention", value: 8000 },
      { name: "Product Development", value: 15000 },
      { name: "Operations", value: 6000 },
      { name: "Marketing", value: 9000 },
    ];
  }

  // Segmentation data
  if (source === "segmentation") {
    return [
      { name: "Power Users", value: 850 },
      { name: "Regular Users", value: 3200 },
      { name: "Occasional Users", value: 4500 },
      { name: "At Risk", value: 1200 },
      { name: "Churned", value: 680 },
    ];
  }

  // Predictions data
  if (source === "predictions") {
    return [
      { name: "High Confidence", value: 420 },
      { name: "Medium Confidence", value: 680 },
      { name: "Low Confidence", value: 290 },
    ];
  }

  // Default fallback data
  return [
    { name: "Category A", value: 400 },
    { name: "Category B", value: 300 },
    { name: "Category C", value: 200 },
    { name: "Category D", value: 150 },
    { name: "Category E", value: 100 },
  ];
}

// =============================================================================
// CUSTOM LABEL RENDERER
// =============================================================================

/**
 * Renders percentage labels inside pie slices.
 * Only shows labels for slices with >= 5% share to avoid clutter.
 */
function renderCustomLabel(props: PieLabelRenderProps): React.ReactNode {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

  // Skip labels for very small slices
  if (typeof percent !== "number" || percent < 0.05) return null;

  // Ensure required numeric values are present
  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof innerRadius !== "number" ||
    typeof outerRadius !== "number"
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="var(--text-primary)"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: "12px", fontWeight: 500 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PieChartWidget({ widget }: PieChartWidgetProps) {
  const { dataBinding, chartOptions } = widget.config;

  // Extract options with defaults
  const showLegend = chartOptions?.showLegend ?? true;
  const showDataLabels = chartOptions?.showDataLabels ?? false;
  const innerRadius = chartOptions?.innerRadius ?? 0;
  const animate = chartOptions?.animate ?? true;

  // Generate mock data based on data binding
  const data = generateMockData(dataBinding.source, dataBinding.field);

  // Convert innerRadius from 0-1 range to percentage string
  const innerRadiusPercent = `${innerRadius * 100}%`;
  const outerRadiusPercent = "80%";

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadiusPercent}
            outerRadius={outerRadiusPercent}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            isAnimationActive={animate}
            animationDuration={800}
            animationEasing="ease-out"
            label={showDataLabels ? renderCustomLabel : undefined}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-secondary, #1f2937)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "var(--text-primary, #fff)",
            }}
            labelStyle={{ color: "var(--text-primary, #fff)" }}
            itemStyle={{ color: "var(--text-secondary, #9ca3af)" }}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{
                paddingTop: "16px",
              }}
              formatter={(value) => (
                <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                  {value}
                </span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChartWidget;
