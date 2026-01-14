"use client";

import { memo, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { cn } from "@/utils/cn";
import type { BenchmarkComparison as BenchmarkComparisonType } from "@/types/benchmarks";
import { PERFORMANCE_TIERS } from "@/types/benchmarks";

// =============================================================================
// PROPS
// =============================================================================

export interface BenchmarkComparisonProps {
  /** The benchmark comparison data */
  comparison: BenchmarkComparisonType;
  /** Height of the gauge chart */
  height?: number;
  /** Show detailed breakdown below the gauge */
  showDetails?: boolean;
  /** Custom class name */
  className?: string;
  /** Compact mode for smaller display */
  compact?: boolean;
}

// =============================================================================
// STATIC STYLES
// =============================================================================

const cardStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
};

const labelStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const valueStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getTierConfig(tier: BenchmarkComparisonType["tier"]) {
  const config = PERFORMANCE_TIERS.find((t) => t.tier === tier);
  // Default fallback - this should never be needed as all tiers are defined
  return config ?? {
    tier: "average" as const,
    label: "Average",
    color: "#f97316",
    icon: "minus",
    minPercentile: 25,
    maxPercentile: 50,
  };
}

function formatValue(value: number, format: string, unit: string): string {
  switch (format) {
    case "currency":
      return value >= 1000
        ? `$${(value / 1000).toFixed(1)}k`
        : `$${value.toFixed(0)}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "duration":
      return `${value.toFixed(1)}${unit}`;
    case "ratio":
      return `${value.toFixed(1)}${unit}`;
    default:
      return `${value.toFixed(1)}${unit}`;
  }
}

function getTierIcon(tier: BenchmarkComparisonType["tier"]): string {
  const icons: Record<BenchmarkComparisonType["tier"], string> = {
    below_average: "\u2193", // Down arrow
    average: "\u2194", // Left-right arrow
    above_average: "\u2191", // Up arrow
    top_quartile: "\u2605", // Star
    top_decile: "\u2728", // Sparkles
  };
  return icons[tier];
}

// =============================================================================
// PERCENTILE INDICATOR COMPONENT
// =============================================================================

interface PercentileIndicatorProps {
  percentile: number;
  tierColor: string;
  height?: number;
}

function PercentileIndicator({ percentile, tierColor, height = 8 }: PercentileIndicatorProps) {
  return (
    <div className="relative w-full" style={{ height }}>
      {/* Background track */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.1))" }}
      />
      {/* Filled portion */}
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
        style={{
          width: `${percentile}%`,
          backgroundColor: tierColor,
        }}
      />
      {/* Percentile markers */}
      <div className="absolute inset-0 flex items-center">
        {[25, 50, 75, 90].map((mark) => (
          <div
            key={mark}
            className="absolute w-0.5 h-full"
            style={{
              left: `${mark}%`,
              backgroundColor: "var(--bg-primary, rgba(0,0,0,0.3))",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// BENCHMARK GAUGE COMPONENT
// =============================================================================

interface BenchmarkGaugeProps {
  comparison: BenchmarkComparisonType;
  height: number;
}

function BenchmarkGauge({ comparison, height }: BenchmarkGaugeProps) {
  const tierConfig = getTierConfig(comparison.tier);
  const { percentileRank } = comparison;

  // Build gauge thresholds from performance tiers
  const gaugeColors: [number, string][] = PERFORMANCE_TIERS.map((tier) => [
    tier.maxPercentile / 100,
    tier.color,
  ]);

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        show: true,
        backgroundColor: "var(--bg-primary, #1f2937)",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
        borderWidth: 1,
        padding: [12, 16],
        textStyle: {
          color: "var(--text-primary)",
          fontSize: 13,
        },
        extraCssText:
          "border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);",
        formatter: () => {
          return `<div style="min-width: 140px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${comparison.metric.label}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">Your Value</span>
              <span style="font-weight: 600; color: ${tierConfig.color};">
                ${formatValue(comparison.userValue, comparison.metric.format, comparison.metric.unit)}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">Percentile</span>
              <span style="color: ${tierConfig.color};">Top ${100 - percentileRank}%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Tier</span>
              <span style="color: ${tierConfig.color};">${tierConfig.label}</span>
            </div>
          </div>`;
        },
      },
      animation: true,
      animationDuration: 800,
      animationEasing: "cubicOut",
      series: [
        {
          type: "gauge",
          min: 0,
          max: 100,
          startAngle: 180,
          endAngle: 0,
          center: ["50%", "75%"],
          radius: "95%",
          progress: {
            show: true,
            roundCap: true,
            width: 14,
            itemStyle: {
              color: tierConfig.color,
            },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 14,
              color: gaugeColors,
              opacity: 0.25,
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: {
            show: true,
            distance: 20,
            color: "var(--text-secondary)",
            fontSize: 10,
            formatter: (value: number) => {
              if (value === 0) return "0%";
              if (value === 50) return "50%";
              if (value === 100) return "100%";
              return "";
            },
          },
          pointer: {
            show: true,
            icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
            length: "55%",
            width: 6,
            offsetCenter: [0, "-10%"],
            itemStyle: {
              color: tierConfig.color,
              shadowColor: `${tierConfig.color}80`,
              shadowBlur: 6,
            },
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 12,
            itemStyle: {
              borderWidth: 3,
              borderColor: tierConfig.color,
              color: "var(--bg-primary, #1f2937)",
            },
          },
          title: { show: false },
          detail: {
            valueAnimation: true,
            fontSize: 18,
            fontWeight: 700,
            offsetCenter: [0, "15%"],
            formatter: () => `${percentileRank}%`,
            color: tierConfig.color,
          },
          data: [{ value: percentileRank }],
        },
      ],
    }),
    [comparison, percentileRank, tierConfig, gaugeColors]
  );

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      opts={{ renderer: "svg" }}
    />
  );
}

// =============================================================================
// BENCHMARK DETAILS COMPONENT
// =============================================================================

interface BenchmarkDetailsProps {
  comparison: BenchmarkComparisonType;
}

function BenchmarkDetails({ comparison }: BenchmarkDetailsProps) {
  const { benchmark, metric, userValue, diffFromMedian, diffFromMedianPercent } = comparison;
  const tierConfig = getTierConfig(comparison.tier);

  const isPositiveDiff = metric.higherIsBetter
    ? diffFromMedian >= 0
    : diffFromMedian <= 0;

  return (
    <div className="space-y-3 mt-3">
      {/* User vs Median */}
      <div className="flex justify-between items-center text-sm">
        <span style={labelStyle}>vs Median</span>
        <span
          className="font-medium"
          style={{ color: isPositiveDiff ? "#22c55e" : "#ef4444" }}
        >
          {diffFromMedian >= 0 ? "+" : ""}
          {formatValue(diffFromMedian, metric.format, metric.unit)}
          {" "}({diffFromMedianPercent >= 0 ? "+" : ""}{diffFromMedianPercent}%)
        </span>
      </div>

      {/* Percentile Benchmarks */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span style={labelStyle}>25th %ile</span>
          <span style={valueStyle}>
            {formatValue(benchmark.percentiles.p25, metric.format, metric.unit)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span style={labelStyle}>Median</span>
          <span style={valueStyle}>
            {formatValue(benchmark.percentiles.median, metric.format, metric.unit)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span style={labelStyle}>75th %ile</span>
          <span style={valueStyle}>
            {formatValue(benchmark.percentiles.p75, metric.format, metric.unit)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span style={labelStyle}>Top 10%</span>
          <span style={valueStyle}>
            {formatValue(benchmark.percentiles.p90, metric.format, metric.unit)}
          </span>
        </div>
      </div>

      {/* Next Tier Goal */}
      {comparison.valueToNextTier !== null && comparison.nextTier && (() => {
        const nextTierConfig = getTierConfig(comparison.nextTier);
        return (
          <div
            className="mt-3 pt-3 border-t text-xs"
            style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
          >
            <span style={labelStyle}>To reach </span>
            <span style={{ color: nextTierConfig.color }}>
              {nextTierConfig.label}
            </span>
            <span style={labelStyle}>: </span>
            <span style={valueStyle}>
              {metric.higherIsBetter ? "+" : "-"}
              {formatValue(comparison.valueToNextTier, metric.format, metric.unit)}
            </span>
          </div>
        );
      })()}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function BenchmarkComparisonComponent({
  comparison,
  height = 140,
  showDetails = true,
  className,
  compact = false,
}: BenchmarkComparisonProps) {
  const tierConfig = getTierConfig(comparison.tier);
  const { metric, userValue, percentileRank } = comparison;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        compact && "p-3",
        className
      )}
      style={cardStyle}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4
            className={cn("font-semibold", compact ? "text-sm" : "text-base")}
            style={valueStyle}
          >
            {metric.label}
          </h4>
          <p
            className="text-xs mt-0.5"
            style={labelStyle}
          >
            {metric.description}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            compact && "px-1.5 py-0.5"
          )}
          style={{
            backgroundColor: `${tierConfig.color}20`,
            color: tierConfig.color,
          }}
        >
          <span>{getTierIcon(comparison.tier)}</span>
          <span>{tierConfig.label}</span>
        </div>
      </div>

      {/* Your Value */}
      <div className="mb-2">
        <span className="text-xs" style={labelStyle}>Your Value: </span>
        <span
          className={cn("font-bold", compact ? "text-lg" : "text-xl")}
          style={{ color: tierConfig.color }}
        >
          {formatValue(userValue, metric.format, metric.unit)}
        </span>
      </div>

      {/* Gauge Chart */}
      <BenchmarkGauge comparison={comparison} height={compact ? 100 : height} />

      {/* Percentile Bar (alternative compact visualization) */}
      <div className="mt-2">
        <div className="flex justify-between items-center text-xs mb-1">
          <span style={labelStyle}>Percentile Rank</span>
          <span style={{ color: tierConfig.color }}>Top {100 - percentileRank}%</span>
        </div>
        <PercentileIndicator percentile={percentileRank} tierColor={tierConfig.color} />
      </div>

      {/* Details Section */}
      {showDetails && !compact && <BenchmarkDetails comparison={comparison} />}
    </div>
  );
}

export const BenchmarkComparison = memo(BenchmarkComparisonComponent);
export default BenchmarkComparison;
