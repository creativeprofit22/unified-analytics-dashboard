"use client";

import { memo, useMemo } from "react";
import { cn } from "@/utils/cn";
import { ROIComparisonChart } from "./ROIComparisonChart";
import { ChannelCostTable } from "./ChannelCostTable";
import type { ROIData, ChannelROIMetrics } from "@/types/roi";
import type { Channel } from "@/types/attribution";

// =============================================================================
// TYPES
// =============================================================================

export interface ROICalculatorProps {
  data: ROIData;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email",
  "paid-search": "Paid Search",
  "organic-search": "Organic Search",
  social: "Social",
  direct: "Direct",
  referral: "Referral",
  display: "Display",
  affiliate: "Affiliate",
};

const CHANNEL_COLORS: Record<Channel, string> = {
  email: "#3b82f6",
  "paid-search": "#f59e0b",
  "organic-search": "#22c55e",
  social: "#ec4899",
  direct: "#8b5cf6",
  referral: "#06b6d4",
  display: "#f97316",
  affiliate: "#84cc16",
};

// =============================================================================
// UTILITIES
// =============================================================================

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
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

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SummaryCardsProps {
  summary: ROIData["summary"];
}

const SummaryCards = memo(function SummaryCards({ summary }: SummaryCardsProps) {
  const overallRoiColor = summary.overallROI >= 0 ? "#22c55e" : "#ef4444";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Spend */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))" }}
      >
        <p
          className="text-xs mb-1"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Total Spend
        </p>
        <p
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
        >
          {formatCurrency(summary.totalSpend)}
        </p>
      </div>

      {/* Total Revenue */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))" }}
      >
        <p
          className="text-xs mb-1"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Total Revenue
        </p>
        <p className="text-xl font-semibold" style={{ color: "#22c55e" }}>
          {formatCurrency(summary.totalRevenue)}
        </p>
      </div>

      {/* Overall ROI */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))" }}
      >
        <p
          className="text-xs mb-1"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Overall ROI
        </p>
        <p className="text-xl font-semibold" style={{ color: overallRoiColor }}>
          {formatPercent(summary.overallROI)}
        </p>
      </div>

      {/* Best Channel */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))" }}
      >
        <p
          className="text-xs mb-1"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Best Channel
        </p>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: CHANNEL_COLORS[summary.topROIChannel] }}
          />
          <p
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
          >
            {CHANNEL_LABELS[summary.topROIChannel]}
          </p>
        </div>
      </div>
    </div>
  );
});

interface LtvCacComparisonProps {
  channels: ChannelROIMetrics[];
}

const LtvCacComparison = memo(function LtvCacComparison({ channels }: LtvCacComparisonProps) {
  // Sort by LTV:CAC ratio descending
  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => b.ltvCacRatio - a.ltvCacRatio);
  }, [channels]);

  // Pre-compute maxRatio once instead of inside map loop (was O(N^2), now O(N))
  const maxRatio = useMemo(() => {
    return Math.max(...sortedChannels.map((c) => c.ltvCacRatio));
  }, [sortedChannels]);

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      <h4
        className="text-sm font-medium mb-4"
        style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
      >
        LTV:CAC Comparison
      </h4>

      <div className="space-y-3">
        {sortedChannels.map((channel) => {
          const ltvCacColor =
            channel.ltvCacRatio >= 3
              ? "#22c55e"
              : channel.ltvCacRatio >= 1
                ? "#f59e0b"
                : "#ef4444";
          const barWidth = maxRatio > 0 ? (channel.ltvCacRatio / maxRatio) * 100 : 0;

          return (
            <div key={channel.channel} className="flex items-center gap-3">
              {/* Channel Label */}
              <div className="w-28 flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded"
                  style={{ backgroundColor: CHANNEL_COLORS[channel.channel] }}
                />
                <span
                  className="text-xs truncate"
                  style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
                >
                  {CHANNEL_LABELS[channel.channel]}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex-1">
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.1))" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(barWidth, 100)}%`,
                      backgroundColor: ltvCacColor,
                    }}
                  />
                </div>
              </div>

              {/* Value */}
              <div className="w-16 text-right">
                <span
                  className="text-xs font-semibold"
                  style={{ color: ltvCacColor }}
                >
                  {channel.ltvCacRatio.toFixed(1)}x
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-4 mt-4 pt-4 border-t"
        style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22c55e" }} />
          <span
            className="text-xs"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.5))" }}
          >
            Healthy (3x+)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
          <span
            className="text-xs"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.5))" }}
          >
            Moderate (1-3x)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ef4444" }} />
          <span
            className="text-xs"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.5))" }}
          >
            Poor (&lt;1x)
          </span>
        </div>
      </div>
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ROICalculatorComponent({ data, className }: ROICalculatorProps) {
  const { channels, summary } = data;

  // Early return if no channel data available
  if (channels.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <p style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}>
          No ROI data available.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div>
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
        >
          ROI Calculator
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Analyze channel return on investment and cost efficiency
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI Comparison Chart */}
        <ROIComparisonChart channels={channels} height={320} />

        {/* LTV:CAC Comparison */}
        <LtvCacComparison channels={channels} />
      </div>

      {/* Channel Cost Table */}
      <div>
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
        >
          Cost & Revenue Breakdown
        </h3>
        <ChannelCostTable channels={channels} />
      </div>

      {/* Efficiency Insights */}
      <div
        className="rounded-lg border p-4"
        style={{
          backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
          borderColor: "var(--border-color, rgba(255,255,255,0.1))",
        }}
      >
        <h4
          className="text-sm font-medium mb-3"
          style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
        >
          Efficiency Insights
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Lowest CAC */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))" }}
          >
            <p
              className="text-xs mb-1"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
            >
              Lowest CAC
            </p>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded"
                style={{ backgroundColor: CHANNEL_COLORS[summary.lowestCACChannel] }}
              />
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
              >
                {CHANNEL_LABELS[summary.lowestCACChannel]}
              </p>
            </div>
          </div>

          {/* Best LTV:CAC */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))" }}
          >
            <p
              className="text-xs mb-1"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
            >
              Best LTV:CAC
            </p>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded"
                style={{ backgroundColor: CHANNEL_COLORS[summary.bestLtvCacChannel] }}
              />
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
              >
                {CHANNEL_LABELS[summary.bestLtvCacChannel]}
              </p>
            </div>
          </div>

          {/* Average CAC */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))" }}
          >
            <p
              className="text-xs mb-1"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
            >
              Average CAC
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
            >
              {formatCurrency(summary.avgCAC)}
            </p>
          </div>

          {/* Avg LTV:CAC */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))" }}
          >
            <p
              className="text-xs mb-1"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
            >
              Avg LTV:CAC
            </p>
            <p
              className="text-sm font-semibold"
              style={{
                color:
                  summary.avgLtvCacRatio >= 3
                    ? "#22c55e"
                    : summary.avgLtvCacRatio >= 1
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            >
              {summary.avgLtvCacRatio.toFixed(1)}x
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ROICalculator = memo(ROICalculatorComponent);
export default ROICalculator;
