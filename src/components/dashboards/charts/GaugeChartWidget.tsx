"use client";

import { GaugeChart, type GaugeThreshold } from "@/components/charts";
import type { Widget, DataSourceCategory } from "@/types/custom-dashboards";

// =============================================================================
// TYPES
// =============================================================================

interface GaugeChartWidgetProps {
  widget: Widget;
}

// =============================================================================
// THRESHOLD CONFIGURATIONS
// =============================================================================

/**
 * Get appropriate thresholds based on data source and field.
 * Different metrics have different "good" and "bad" ranges.
 */
function getThresholdsForSource(
  source: DataSourceCategory,
  field: string
): GaugeThreshold[] {
  const fieldLower = field.toLowerCase();

  // Conversion rates: Higher is better
  if (source === "conversions" || fieldLower.includes("conversion")) {
    return [
      { value: 30, color: "#ef4444", label: "Poor" },
      { value: 60, color: "#eab308", label: "Medium" },
      { value: 100, color: "#22c55e", label: "Good" },
    ];
  }

  // SEO scores: Higher is better
  if (source === "seo") {
    if (fieldLower.includes("speed") || fieldLower.includes("performance")) {
      return [
        { value: 50, color: "#ef4444", label: "Slow" },
        { value: 75, color: "#eab308", label: "Moderate" },
        { value: 100, color: "#22c55e", label: "Fast" },
      ];
    }
    return [
      { value: 40, color: "#ef4444", label: "Needs Work" },
      { value: 70, color: "#eab308", label: "Average" },
      { value: 100, color: "#22c55e", label: "Excellent" },
    ];
  }

  // Traffic metrics: Bounce rate - Lower is better (inverted)
  if (source === "traffic" && fieldLower.includes("bounce")) {
    return [
      { value: 35, color: "#22c55e", label: "Excellent" },
      { value: 55, color: "#eab308", label: "Average" },
      { value: 100, color: "#ef4444", label: "High" },
    ];
  }

  // Revenue/subscriptions health scores
  if (source === "revenue" || source === "subscriptions") {
    if (fieldLower.includes("health") || fieldLower.includes("score")) {
      return [
        { value: 40, color: "#ef4444", label: "At Risk" },
        { value: 70, color: "#eab308", label: "Stable" },
        { value: 100, color: "#22c55e", label: "Healthy" },
      ];
    }
    if (fieldLower.includes("churn")) {
      // Lower churn is better
      return [
        { value: 5, color: "#22c55e", label: "Low" },
        { value: 15, color: "#eab308", label: "Moderate" },
        { value: 100, color: "#ef4444", label: "High" },
      ];
    }
    return [
      { value: 33, color: "#ef4444", label: "Below Target" },
      { value: 66, color: "#eab308", label: "On Track" },
      { value: 100, color: "#22c55e", label: "Exceeding" },
    ];
  }

  // Payments success rate
  if (source === "payments") {
    if (fieldLower.includes("success") || fieldLower.includes("rate")) {
      return [
        { value: 85, color: "#ef4444", label: "Critical" },
        { value: 95, color: "#eab308", label: "Warning" },
        { value: 100, color: "#22c55e", label: "Healthy" },
      ];
    }
    return [
      { value: 33, color: "#ef4444", label: "Low" },
      { value: 66, color: "#eab308", label: "Medium" },
      { value: 100, color: "#22c55e", label: "High" },
    ];
  }

  // Unit economics: LTV/CAC ratio
  if (source === "unitEconomics") {
    if (fieldLower.includes("ltv") || fieldLower.includes("ratio")) {
      return [
        { value: 30, color: "#ef4444", label: "Unprofitable" },
        { value: 60, color: "#eab308", label: "Break-even" },
        { value: 100, color: "#22c55e", label: "Profitable" },
      ];
    }
    return [
      { value: 33, color: "#ef4444", label: "Poor" },
      { value: 66, color: "#eab308", label: "Fair" },
      { value: 100, color: "#22c55e", label: "Good" },
    ];
  }

  // Demographics engagement
  if (source === "demographics" || source === "segmentation") {
    return [
      { value: 25, color: "#ef4444", label: "Low" },
      { value: 50, color: "#eab308", label: "Medium" },
      { value: 75, color: "#3b82f6", label: "High" },
      { value: 100, color: "#22c55e", label: "Very High" },
    ];
  }

  // Campaigns performance
  if (source === "campaigns") {
    if (fieldLower.includes("roi") || fieldLower.includes("roas")) {
      return [
        { value: 25, color: "#ef4444", label: "Negative" },
        { value: 50, color: "#eab308", label: "Break-even" },
        { value: 100, color: "#22c55e", label: "Profitable" },
      ];
    }
    return [
      { value: 30, color: "#ef4444", label: "Underperforming" },
      { value: 60, color: "#eab308", label: "Average" },
      { value: 100, color: "#22c55e", label: "High Performing" },
    ];
  }

  // Predictions confidence
  if (source === "predictions") {
    return [
      { value: 40, color: "#ef4444", label: "Low Confidence" },
      { value: 70, color: "#eab308", label: "Medium" },
      { value: 100, color: "#22c55e", label: "High Confidence" },
    ];
  }

  // Default thresholds
  return [
    { value: 33, color: "#ef4444", label: "Poor" },
    { value: 66, color: "#eab308", label: "Medium" },
    { value: 100, color: "#22c55e", label: "Good" },
  ];
}

// =============================================================================
// UNIT MAPPING
// =============================================================================

/**
 * Get the appropriate unit suffix for a given data source and field.
 */
function getUnitForSource(source: DataSourceCategory, field: string): string {
  const fieldLower = field.toLowerCase();

  // Percentage-based metrics
  if (
    fieldLower.includes("rate") ||
    fieldLower.includes("percent") ||
    fieldLower.includes("conversion") ||
    fieldLower.includes("bounce") ||
    fieldLower.includes("churn") ||
    fieldLower.includes("retention") ||
    fieldLower.includes("growth")
  ) {
    return "%";
  }

  // Time-based metrics
  if (
    fieldLower.includes("time") ||
    fieldLower.includes("duration") ||
    fieldLower.includes("latency")
  ) {
    return "ms";
  }

  // Speed/performance scores (typically 0-100)
  if (
    fieldLower.includes("speed") ||
    fieldLower.includes("performance") ||
    fieldLower.includes("score")
  ) {
    return "";
  }

  // Ratio metrics
  if (fieldLower.includes("ratio") || fieldLower.includes("ltv")) {
    return "x";
  }

  // Source-specific defaults
  switch (source) {
    case "conversions":
      return "%";
    case "seo":
      return "";
    case "payments":
      return "%";
    case "unitEconomics":
      return "";
    case "predictions":
      return "%";
    default:
      return "";
  }
}

// =============================================================================
// MOCK DATA GENERATION
// =============================================================================

/**
 * Generate a deterministic mock gauge value based on source and field.
 * Uses a seeded random approach to ensure consistent values across renders.
 */
function generateMockGaugeValue(
  source: DataSourceCategory,
  field: string
): number {
  // Create a simple hash from source+field for deterministic "random" values
  const seed = (source + field)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Use the seed to generate a value between 0 and 100
  // Apply some variation based on source type for more realistic values
  const baseValue = (seed * 7919) % 100; // Prime number for better distribution

  // Adjust ranges based on source to make values more realistic
  const fieldLower = field.toLowerCase();

  // Conversion rates typically 1-15%
  if (source === "conversions" || fieldLower.includes("conversion")) {
    return Math.round(5 + (baseValue % 60));
  }

  // SEO scores typically 40-95
  if (source === "seo") {
    return Math.round(40 + (baseValue % 55));
  }

  // Bounce rates typically 25-70%
  if (source === "traffic" && fieldLower.includes("bounce")) {
    return Math.round(25 + (baseValue % 45));
  }

  // Payment success rates should be high 90-99%
  if (source === "payments" && fieldLower.includes("success")) {
    return Math.round(90 + (baseValue % 9));
  }

  // Churn rates typically 2-15%
  if (fieldLower.includes("churn")) {
    return Math.round(2 + (baseValue % 13));
  }

  // Health scores 40-95
  if (fieldLower.includes("health") || fieldLower.includes("score")) {
    return Math.round(40 + (baseValue % 55));
  }

  // Prediction confidence 30-90
  if (source === "predictions") {
    return Math.round(30 + (baseValue % 60));
  }

  // Default: full range with slight bias towards middle
  return Math.round(20 + (baseValue % 65));
}

// =============================================================================
// COMPONENT
// =============================================================================

export function GaugeChartWidget({ widget }: GaugeChartWidgetProps) {
  const { config, title } = widget;
  const { dataBinding } = config;

  // Generate mock value based on data binding
  const value = generateMockGaugeValue(dataBinding.source, dataBinding.field);

  // Get appropriate thresholds and unit for this data source
  const thresholds = getThresholdsForSource(
    dataBinding.source,
    dataBinding.field
  );
  const unit = getUnitForSource(dataBinding.source, dataBinding.field);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <GaugeChart
        value={value}
        min={0}
        max={100}
        title={title}
        unit={unit}
        thresholds={thresholds}
        showPointer={true}
      />
    </div>
  );
}

export default GaugeChartWidget;
