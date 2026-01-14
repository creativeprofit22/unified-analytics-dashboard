"use client";

import type { Widget } from "@/types/custom-dashboards";

// =============================================================================
// TYPES
// =============================================================================

interface MetricCardWidgetProps {
  widget: Widget;
}

interface MockMetricData {
  value: number;
  change: number;
  changePercent: number;
}

// =============================================================================
// MOCK DATA GENERATION
// =============================================================================

/**
 * Generate mock metric data based on data source and field.
 * Uses a deterministic seed based on source+field to ensure consistent values.
 */
function generateMockMetric(source: string, field: string): MockMetricData {
  // Create a simple hash from source+field for deterministic "random" values
  const seed = (source + field).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Generate base value based on field type
  const fieldLower = field.toLowerCase();
  let baseValue: number;

  if (fieldLower.includes("revenue") || fieldLower.includes("sales") || fieldLower.includes("mrr")) {
    baseValue = 50000 + (seed % 100000);
  } else if (fieldLower.includes("rate") || fieldLower.includes("conversion") || fieldLower.includes("ctr")) {
    baseValue = 1 + (seed % 50);
  } else if (fieldLower.includes("users") || fieldLower.includes("visitors") || fieldLower.includes("sessions")) {
    baseValue = 10000 + (seed % 90000);
  } else if (fieldLower.includes("count") || fieldLower.includes("total")) {
    baseValue = 100 + (seed % 5000);
  } else if (fieldLower.includes("ltv") || fieldLower.includes("arpu") || fieldLower.includes("cac")) {
    baseValue = 50 + (seed % 500);
  } else {
    baseValue = 1000 + (seed % 10000);
  }

  // Generate change percentage (-30% to +50%)
  const changePercent = ((seed * 7) % 80) - 30;
  const change = baseValue * (changePercent / 100);

  return {
    value: Math.round(baseValue * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
  };
}

// =============================================================================
// VALUE FORMATTING
// =============================================================================

/**
 * Format a numeric value based on the specified format type.
 */
function formatValue(
  value: number,
  format: "number" | "currency" | "percent",
  prefix?: string,
  suffix?: string
): string {
  let formatted: string;

  switch (format) {
    case "currency":
      // Format with commas and 2 decimal places
      formatted = value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      // Use provided prefix or default to $
      formatted = (prefix ?? "$") + formatted;
      break;

    case "percent":
      formatted = value.toLocaleString("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      // Use provided suffix or default to %
      formatted = formatted + (suffix ?? "%");
      break;

    case "number":
    default:
      // Smart formatting: use K/M suffix for large numbers
      if (value >= 1000000) {
        formatted = (value / 1000000).toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }) + "M";
      } else if (value >= 10000) {
        formatted = (value / 1000).toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }) + "K";
      } else {
        formatted = value.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
      // Apply custom prefix/suffix if provided
      if (prefix) formatted = prefix + formatted;
      if (suffix) formatted = formatted + suffix;
      break;
  }

  return formatted;
}

// =============================================================================
// TREND ICONS
// =============================================================================

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

// =============================================================================
// METRIC CARD WIDGET COMPONENT
// =============================================================================

export function MetricCardWidget({ widget }: MetricCardWidgetProps) {
  const { config, title } = widget;
  const { dataBinding, metricOptions } = config;

  // Generate mock data
  const metricData = generateMockMetric(dataBinding.source, dataBinding.field);

  // Get formatting options with defaults
  const format = metricOptions?.format ?? "number";
  const showComparison = metricOptions?.showComparison ?? false;
  const showTrend = metricOptions?.showTrend ?? false;
  const prefix = metricOptions?.prefix;
  const suffix = metricOptions?.suffix;

  // Format the main value
  const formattedValue = formatValue(metricData.value, format, prefix, suffix);

  // Determine trend direction
  const isPositive = metricData.changePercent >= 0;

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full"
      style={{
        minHeight: "100%",
      }}
    >
      {/* Main metric value */}
      <div
        className="text-3xl font-bold tracking-tight"
        style={{
          color: "var(--text-primary)",
        }}
      >
        {formattedValue}
      </div>

      {/* Trend indicator */}
      {showTrend && (
        <div
          className="flex items-center gap-1 mt-2"
          style={{
            color: isPositive ? "#22c55e" : "#ef4444",
          }}
        >
          {isPositive ? (
            <TrendUpIcon className="w-4 h-4" />
          ) : (
            <TrendDownIcon className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isPositive ? "+" : ""}
            {metricData.changePercent}%
          </span>
        </div>
      )}

      {/* Comparison text */}
      {showComparison && (
        <div
          className="mt-1 text-xs"
          style={{
            color: isPositive ? "#22c55e" : "#ef4444",
          }}
        >
          {isPositive ? "+" : ""}
          {metricData.changePercent}% vs last period
        </div>
      )}

      {/* Widget title */}
      <div
        className="mt-3 text-sm font-medium"
        style={{
          color: "var(--text-secondary)",
        }}
      >
        {title}
      </div>
    </div>
  );
}

export default MetricCardWidget;
