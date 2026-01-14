"use client";

import { memo, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { cn } from "@/utils/cn";
import type { Experiment } from "@/types/abtest";

// =============================================================================
// TYPES
// =============================================================================

export interface VariantComparisonProps {
  experiment: Experiment;
  height?: number;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SIGNIFICANCE_COLORS = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#6b7280",
};

// =============================================================================
// STATIC STYLES
// =============================================================================

const labelStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const valueStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

// =============================================================================
// UTILITIES
// =============================================================================

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatPValue(value: number): string {
  if (value < 0.001) {
    return "< 0.001";
  }
  return value.toFixed(3);
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString();
}

function getSignificanceColor(
  isSignificant: boolean,
  lift: number
): string {
  if (!isSignificant) {
    return SIGNIFICANCE_COLORS.neutral;
  }
  return lift >= 0 ? SIGNIFICANCE_COLORS.positive : SIGNIFICANCE_COLORS.negative;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface StatisticRowProps {
  label: string;
  value: string;
  color?: string;
}

const StatisticRow = memo(function StatisticRow({
  label,
  value,
  color,
}: StatisticRowProps) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-xs" style={labelStyle}>
        {label}
      </span>
      <span
        className="text-xs font-medium"
        style={{ color: color || "var(--text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
});

interface ConfidenceIntervalBarProps {
  low: number;
  high: number;
  isSignificant: boolean;
}

const ConfidenceIntervalBar = memo(function ConfidenceIntervalBar({
  low,
  high,
  isSignificant,
}: ConfidenceIntervalBarProps) {
  // Normalize the CI for display
  const range = Math.abs(high - low);
  const center = (low + high) / 2;
  const includesZero = low <= 0 && high >= 0;
  const color = isSignificant
    ? center >= 0
      ? SIGNIFICANCE_COLORS.positive
      : SIGNIFICANCE_COLORS.negative
    : SIGNIFICANCE_COLORS.neutral;

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={labelStyle}>
          95% Confidence Interval
        </span>
        <span className="text-xs font-medium" style={{ color }}>
          [{low >= 0 ? "+" : ""}{low.toFixed(2)}%, {high >= 0 ? "+" : ""}{high.toFixed(2)}%]
        </span>
      </div>
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.1))" }}
      >
        {/* Zero line indicator */}
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{
            left: "50%",
            backgroundColor: "var(--text-secondary, rgba(255,255,255,0.3))",
          }}
        />
        {/* CI bar */}
        <div
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            left: `${Math.max(0, 50 + (low / (range || 1)) * 25)}%`,
            width: `${Math.min(100, (range / Math.max(Math.abs(low), Math.abs(high), 1)) * 25)}%`,
            backgroundColor: color,
            opacity: 0.7,
          }}
        />
      </div>
      {includesZero && (
        <p className="text-xs mt-1" style={labelStyle}>
          Interval includes zero - result may not be significant
        </p>
      )}
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function VariantComparisonComponent({
  experiment,
  height = 320,
  className,
}: VariantComparisonProps) {
  const { comparison, variantMetrics, variants } = experiment;

  const controlMetrics = variantMetrics.find(
    (m) => m.variantId === comparison.controlId
  );
  const treatmentMetrics = variantMetrics.find(
    (m) => m.variantId === comparison.treatmentId
  );

  const controlVariant = variants.find((v) => v.isControl);
  const treatmentVariant = variants.find((v) => !v.isControl);

  const isSignificant = comparison.conversionSignificance.isSignificant;
  const significanceColor = getSignificanceColor(
    isSignificant,
    comparison.relativeLift
  );

  // Chart option for bar comparison
  const chartOption: EChartsOption = useMemo(() => {
    if (!controlMetrics || !treatmentMetrics) {
      return {};
    }

    const metrics = [
      {
        name: "Conversion Rate",
        control: controlMetrics.conversionRate,
        treatment: treatmentMetrics.conversionRate,
        format: (v: number) => `${v.toFixed(2)}%`,
      },
      {
        name: "Revenue/Visitor",
        control: controlMetrics.revenuePerVisitor,
        treatment: treatmentMetrics.revenuePerVisitor,
        format: (v: number) => `$${v.toFixed(2)}`,
      },
      {
        name: "Avg Order Value",
        control: controlMetrics.averageOrderValue,
        treatment: treatmentMetrics.averageOrderValue,
        format: (v: number) => `$${v.toFixed(0)}`,
      },
      {
        name: "Bounce Rate",
        control: controlMetrics.bounceRate,
        treatment: treatmentMetrics.bounceRate,
        format: (v: number) => `${v.toFixed(1)}%`,
      },
    ];

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          shadowStyle: {
            color: "rgba(255,255,255,0.05)",
          },
        },
        backgroundColor: "var(--bg-primary, #1f2937)",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
        borderWidth: 1,
        padding: [12, 16],
        textStyle: {
          color: "var(--text-primary)",
          fontSize: 13,
        },
        extraCssText: "border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);",
        formatter: (params: unknown) => {
          if (!params || !Array.isArray(params) || params.length < 2) return "";
          const [control, treatment] = params as Array<{
            name: string;
            value: number;
            seriesName: string;
            dataIndex: number;
          }>;
          if (!control || !treatment) return "";
          const metric = metrics[control.dataIndex];
          if (!metric) return "";

          return `<div style="min-width: 160px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${metric.name}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">${controlVariant?.name || "Control"}</span>
              <span style="font-weight: 500;">${metric.format(control.value)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">${treatmentVariant?.name || "Treatment"}</span>
              <span style="font-weight: 500;">${metric.format(treatment.value)}</span>
            </div>
          </div>`;
        },
      },
      legend: {
        data: [controlVariant?.name || "Control", treatmentVariant?.name || "Treatment"],
        bottom: 0,
        textStyle: {
          color: "var(--text-secondary)",
          fontSize: 11,
        },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 16,
      },
      grid: {
        left: 60,
        right: 20,
        top: 20,
        bottom: 40,
      },
      xAxis: {
        type: "category",
        data: metrics.map((m) => m.name),
        axisLabel: {
          color: "var(--text-secondary)",
          fontSize: 10,
          interval: 0,
          rotate: 0,
        },
        axisLine: {
          lineStyle: {
            color: "var(--text-secondary)",
            opacity: 0.3,
          },
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "var(--text-secondary)",
          fontSize: 10,
        },
        axisLine: {
          lineStyle: {
            color: "var(--text-secondary)",
            opacity: 0.3,
          },
        },
        splitLine: {
          lineStyle: {
            color: "var(--text-secondary)",
            opacity: 0.1,
            type: "dashed",
          },
        },
      },
      animation: true,
      animationDuration: 500,
      animationEasing: "cubicOut",
      series: [
        {
          name: controlVariant?.name || "Control",
          type: "bar",
          data: metrics.map((m) => m.control),
          itemStyle: {
            color: "#6b7280",
            borderRadius: [4, 4, 0, 0],
          },
          barGap: "10%",
          barMaxWidth: 40,
        },
        {
          name: treatmentVariant?.name || "Treatment",
          type: "bar",
          data: metrics.map((m) => m.treatment),
          itemStyle: {
            color: "#3b82f6",
            borderRadius: [4, 4, 0, 0],
          },
          barMaxWidth: 40,
        },
      ],
    };
  }, [controlMetrics, treatmentMetrics, controlVariant, treatmentVariant]);

  // Early return guard
  if (!controlMetrics || !treatmentMetrics) {
    return (
      <div className={cn("rounded-lg border p-4", className)} style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}>
        <p style={labelStyle}>No variant metrics available.</p>
      </div>
    );
  }

  const totalSampleSize =
    comparison.conversionSignificance.currentSampleSize;
  const requiredSampleSize =
    comparison.conversionSignificance.requiredSampleSize;
  const daysToSignificance =
    comparison.conversionSignificance.estimatedDaysToSignificance;

  return (
    <div
      className={cn("rounded-lg border p-4", className)}
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      {/* Chart */}
      <div className="mb-4">
        <h5 className="text-xs font-medium mb-2" style={valueStyle}>
          Metric Comparison
        </h5>
        <ReactECharts
          option={chartOption}
          style={{ height: height - 160, width: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </div>

      {/* Statistical Details */}
      <div
        className="border-t pt-4"
        style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
      >
        <h5 className="text-xs font-medium mb-3" style={valueStyle}>
          Statistical Analysis
        </h5>

        <div className="grid grid-cols-2 gap-4">
          {/* Left Column - Primary Stats */}
          <div>
            <StatisticRow
              label="P-Value"
              value={formatPValue(comparison.conversionSignificance.pValue)}
              color={
                comparison.conversionSignificance.pValue < 0.05
                  ? SIGNIFICANCE_COLORS.positive
                  : SIGNIFICANCE_COLORS.neutral
              }
            />
            <StatisticRow
              label="Confidence Level"
              value={`${comparison.conversionSignificance.confidenceLevel}%`}
            />
            <StatisticRow
              label="Prob. to be Best"
              value={formatPercent(comparison.probabilityToBeBest)}
              color={significanceColor}
            />
          </div>

          {/* Right Column - Sample Stats */}
          <div>
            <StatisticRow
              label="Sample Size"
              value={`${formatNumber(totalSampleSize)} / ${formatNumber(requiredSampleSize)}`}
            />
            <StatisticRow
              label="Days to Significance"
              value={
                daysToSignificance !== null
                  ? `~${daysToSignificance} days`
                  : "Reached"
              }
              color={
                daysToSignificance === null
                  ? SIGNIFICANCE_COLORS.positive
                  : undefined
              }
            />
            <StatisticRow
              label="Expected Loss"
              value={`$${comparison.expectedLoss.toFixed(2)}`}
            />
          </div>
        </div>

        {/* Confidence Interval Visualization */}
        <ConfidenceIntervalBar
          low={comparison.conversionSignificance.confidenceIntervalLow}
          high={comparison.conversionSignificance.confidenceIntervalHigh}
          isSignificant={isSignificant}
        />
      </div>
    </div>
  );
}

export const VariantComparison = memo(VariantComparisonComponent);
export default VariantComparison;
