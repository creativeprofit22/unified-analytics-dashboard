"use client";

import { memo, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { cn } from "@/utils/cn";
import type { ChannelROIMetrics } from "@/types/roi";
import type { Channel } from "@/types/attribution";

// =============================================================================
// TYPES
// =============================================================================

export interface ROIComparisonChartProps {
  channels: ChannelROIMetrics[];
  height?: number;
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

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ROIComparisonChartComponent({
  channels,
  height = 320,
  className,
}: ROIComparisonChartProps) {
  // Sort by ROI descending
  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => b.roi - a.roi);
  }, [channels]);

  const option: EChartsOption = useMemo(() => {
    const channelNames = sortedChannels.map((c) => CHANNEL_LABELS[c.channel]);
    const roiValues = sortedChannels.map((c) => c.roi);
    const colors = sortedChannels.map((c) => CHANNEL_COLORS[c.channel]);

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
          if (!params) return "";
          const p = Array.isArray(params) ? params[0] : params;
          if (!p) return "";
          const typedP = p as { name: string; value: number; dataIndex: number };
          if (typedP.dataIndex < 0 || typedP.dataIndex >= sortedChannels.length) return "";
          const data = sortedChannels[typedP.dataIndex];
          if (!data) return "";
          const channelColor = CHANNEL_COLORS[data.channel];
          const roiColor = data.roi >= 0 ? "#22c55e" : "#ef4444";

          return `<div style="min-width: 180px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: ${channelColor};"></span>
              <span style="font-weight: 600; font-size: 14px;">${CHANNEL_LABELS[data.channel]}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="color: var(--text-secondary);">ROI</span>
              <span style="font-weight: 600; color: ${roiColor};">${formatPercent(data.roi)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="color: var(--text-secondary);">Revenue</span>
              <span style="font-weight: 500;">${formatCurrency(data.revenue)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Total Cost</span>
              <span style="font-weight: 500;">${formatCurrency(data.costs.totalCost)}</span>
            </div>
          </div>`;
        },
      },
      grid: {
        left: 120,
        right: 60,
        top: 20,
        bottom: 20,
      },
      xAxis: {
        type: "value",
        axisLabel: {
          color: "var(--text-secondary)",
          fontSize: 11,
          formatter: (value: number) => `${value}%`,
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
      yAxis: {
        type: "category",
        data: channelNames,
        inverse: true,
        axisLabel: {
          color: "var(--text-secondary)",
          fontSize: 12,
          fontWeight: 500,
        },
        axisLine: {
          lineStyle: {
            color: "var(--text-secondary)",
            opacity: 0.3,
          },
        },
        axisTick: { show: false },
      },
      animation: true,
      animationDuration: 500,
      animationEasing: "cubicOut",
      series: [
        {
          type: "bar",
          data: roiValues.map((value, index) => ({
            value,
            itemStyle: {
              color: value >= 0 ? colors[index] : "#ef4444",
              borderRadius: value >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
            },
          })),
          barMaxWidth: 32,
          label: {
            show: true,
            position: "right",
            color: "var(--text-secondary)",
            fontSize: 11,
            formatter: (params: unknown) => {
              const p = params as { value: number | string | undefined };
              const value = typeof p.value === "number" ? p.value : 0;
              return formatPercent(value);
            },
          },
          emphasis: {
            disabled: false,
            focus: "series",
            itemStyle: {
              shadowColor: "rgba(0, 0, 0, 0.3)",
              shadowBlur: 10,
              shadowOffsetX: 4,
            },
          },
        },
      ],
    };
  }, [sortedChannels]);

  return (
    <div
      className={cn("rounded-lg border p-4", className)}
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h4
          className="text-sm font-medium"
          style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
        >
          ROI by Channel
        </h4>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Return on investment percentage
        </p>
      </div>

      {/* Chart */}
      <ReactECharts
        option={option}
        style={{ height, width: "100%" }}
        opts={{ renderer: "svg" }}
      />

      {/* Legend */}
      <div
        className="flex flex-wrap gap-4 mt-4 pt-4 border-t"
        style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
      >
        {sortedChannels.slice(0, 4).map((channel) => (
          <div key={channel.channel} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: CHANNEL_COLORS[channel.channel] }}
            />
            <span
              className="text-xs"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
            >
              {CHANNEL_LABELS[channel.channel]}
            </span>
          </div>
        ))}
        {sortedChannels.length > 4 && (
          <span
            className="text-xs"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.5))" }}
          >
            +{sortedChannels.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
}

export const ROIComparisonChart = memo(ROIComparisonChartComponent);
export default ROIComparisonChart;
