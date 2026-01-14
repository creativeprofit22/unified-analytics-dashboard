"use client";

import { memo, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { cn } from "@/utils/cn";

// =============================================================================
// TYPES
// =============================================================================

export type AttributionModel = "first-touch" | "last-touch" | "linear" | "time-decay";
export type Channel =
  | "email"
  | "paid-search"
  | "organic-search"
  | "social"
  | "direct"
  | "referral"
  | "display"
  | "affiliate";

export interface ChannelAttribution {
  channel: Channel;
  conversions: number;
  attributedRevenue: number;
  percentOfTotal: number;
  avgTouchpoints: number;
}

export interface TouchpointPath {
  from: Channel | "start";
  to: Channel | "conversion";
  count: number;
  value: number;
}

export interface TouchpointChartProps {
  channelAttributions: ChannelAttribution[];
  paths?: TouchpointPath[];
  selectedModel: AttributionModel;
  chartType?: "bar" | "sankey";
  height?: number;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CHANNEL_COLORS: Record<Channel | "start" | "conversion", string> = {
  email: "#3b82f6", // blue
  "paid-search": "#f59e0b", // amber
  "organic-search": "#22c55e", // green
  social: "#ec4899", // pink
  direct: "#8b5cf6", // violet
  referral: "#06b6d4", // cyan
  display: "#f97316", // orange
  affiliate: "#84cc16", // lime
  start: "#6b7280", // gray
  conversion: "#10b981", // emerald
};

const CHANNEL_LABELS: Record<Channel | "start" | "conversion", string> = {
  email: "Email",
  "paid-search": "Paid Search",
  "organic-search": "Organic Search",
  social: "Social",
  direct: "Direct",
  referral: "Referral",
  display: "Display",
  affiliate: "Affiliate",
  start: "Journey Start",
  conversion: "Conversion",
};

const MODEL_LABELS: Record<AttributionModel, string> = {
  "first-touch": "First Touch",
  "last-touch": "Last Touch",
  linear: "Linear",
  "time-decay": "Time Decay",
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

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toFixed(0);
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface BarChartProps {
  channelAttributions: ChannelAttribution[];
  selectedModel: AttributionModel;
  height: number;
}

function BarChart({ channelAttributions, selectedModel, height }: BarChartProps) {
  // Sort by attributed revenue descending
  const sortedData = useMemo(() => {
    return [...channelAttributions].sort((a, b) => b.attributedRevenue - a.attributedRevenue);
  }, [channelAttributions]);

  const option: EChartsOption = useMemo(() => {
    const channels = sortedData.map((d) => CHANNEL_LABELS[d.channel]);
    const revenues = sortedData.map((d) => d.attributedRevenue);
    const colors = sortedData.map((d) => CHANNEL_COLORS[d.channel]);
    const totalRevenue = revenues.reduce((sum, v) => sum + v, 0);

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
          const p = Array.isArray(params) ? params[0] : params;
          const typedP = p as { name: string; value: number; dataIndex: number };
          const data = sortedData[typedP.dataIndex];
          if (!data) return "";
          const percentage = totalRevenue > 0 ? ((data.attributedRevenue / totalRevenue) * 100).toFixed(1) : "0.0";
          const channelColor = CHANNEL_COLORS[data.channel];

          return `<div style="min-width: 180px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background: ${channelColor};"></span>
              <span style="font-weight: 600; font-size: 14px;">${CHANNEL_LABELS[data.channel]}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="color: var(--text-secondary);">Revenue</span>
              <span style="font-weight: 600; color: ${channelColor};">${formatCurrency(data.attributedRevenue)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="color: var(--text-secondary);">Share</span>
              <span style="font-weight: 500;">${percentage}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="color: var(--text-secondary);">Conversions</span>
              <span style="font-weight: 500;">${formatNumber(data.conversions)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Avg Touchpoints</span>
              <span style="font-weight: 500;">${data.avgTouchpoints.toFixed(1)}</span>
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
          formatter: (value: number) => formatCurrency(value),
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
        data: channels,
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
          data: revenues.map((value, index) => ({
            value,
            itemStyle: {
              color: colors[index],
              borderRadius: [0, 4, 4, 0],
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
              return formatCurrency(value);
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
  }, [sortedData]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      opts={{ renderer: "svg" }}
    />
  );
}

interface SankeyChartProps {
  paths: TouchpointPath[];
  height: number;
}

function SankeyChart({ paths, height }: SankeyChartProps) {
  // Filter paths to create a DAG (no cycles allowed in Sankey)
  // Assign tiers: start=0, channels=1, conversion=2
  // Only allow forward flow (lower tier → higher tier) and same-tier to conversion
  const filteredPaths = useMemo(() => {
    const getTier = (node: string): number => {
      if (node === "start") return 0;
      if (node === "conversion") return 2;
      return 1; // all channels are tier 1
    };

    // Filter: only keep paths that flow forward (or from channel to conversion)
    // Remove self-loops and backward flows
    return paths.filter((p) => {
      // Remove self-loops
      if (p.from === p.to) return false;

      const fromTier = getTier(p.from);
      const toTier = getTier(p.to);

      // Only allow: start→channel, channel→conversion, start→conversion
      // Disallow: channel→channel (creates potential cycles), channel→start, conversion→anything
      return toTier > fromTier;
    });
  }, [paths]);

  // Build unique nodes from filtered paths
  const nodes = useMemo(() => {
    const nodeSet = new Set<string>();
    filteredPaths.forEach((p) => {
      nodeSet.add(p.from);
      nodeSet.add(p.to);
    });

    return Array.from(nodeSet).map((name) => ({
      name: CHANNEL_LABELS[name as Channel | "start" | "conversion"] || name,
      itemStyle: {
        color: CHANNEL_COLORS[name as Channel | "start" | "conversion"] || "#6b7280",
        borderColor: "var(--bg-primary, #1f2937)",
        borderWidth: 1,
      },
    }));
  }, [filteredPaths]);

  // Build links
  const links = useMemo(() => {
    const nodeColorMap = new Map<string, string>();
    nodes.forEach((node) => {
      nodeColorMap.set(node.name, node.itemStyle.color);
    });

    return filteredPaths.map((p) => {
      const sourceName = CHANNEL_LABELS[p.from as Channel | "start" | "conversion"] || p.from;
      const targetName = CHANNEL_LABELS[p.to as Channel | "start" | "conversion"] || p.to;
      const sourceColor = nodeColorMap.get(sourceName) || "#6b7280";
      const targetColor = nodeColorMap.get(targetName) || "#6b7280";

      return {
        source: sourceName,
        target: targetName,
        value: p.value,
        lineStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0.5,
            x2: 1,
            y2: 0.5,
            colorStops: [
              { offset: 0, color: `${sourceColor}99` },
              { offset: 1, color: `${targetColor}99` },
            ],
          },
        },
      };
    });
  }, [filteredPaths, nodes]);

  const option: EChartsOption = useMemo(() => {
    // Calculate totalValue inside useMemo to avoid recalculating on every render
    const totalValue = paths.reduce((sum, p) => sum + p.value, 0);

    return {
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
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
          const p = params as {
            dataType: string;
            data: { source?: string; target?: string; value?: number; name?: string };
            name?: string;
            value?: number;
          };

          if (p.dataType === "edge") {
            const source = p.data.source || "";
            const target = p.data.target || "";
            const value = p.data.value || 0;
            const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : "0.0";

            return `<div style="min-width: 160px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-weight: 500;">${source}</span>
                <span style="color: var(--text-secondary);">&#8594;</span>
                <span style="font-weight: 500;">${target}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.1));">
                <span style="color: var(--text-secondary);">Value</span>
                <span style="font-weight: 600;">${formatCurrency(value)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span style="color: var(--text-secondary);">% of Total</span>
                <span style="font-weight: 500;">${percentage}%</span>
              </div>
            </div>`;
          } else {
            const nodeName = p.name || "";
            const nodeValue = p.value || 0;

            return `<div style="min-width: 140px;">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${nodeName}</div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-secondary);">Total Value</span>
                <span style="font-weight: 600;">${formatCurrency(nodeValue)}</span>
              </div>
            </div>`;
          }
        },
      },
      animation: true,
      animationDuration: 500,
      animationEasing: "cubicOut",
      series: [
        {
          type: "sankey",
          orient: "horizontal",
          nodeWidth: 20,
          nodeGap: 12,
          draggable: true,
          layoutIterations: 32,
          emphasis: {
            focus: "adjacency",
            lineStyle: {
              opacity: 0.8,
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: "var(--text-primary, #ffffff)",
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.3)",
            },
          },
          blur: {
            lineStyle: {
              opacity: 0.1,
            },
            itemStyle: {
              opacity: 0.3,
            },
          },
          lineStyle: {
            curveness: 0.5,
            opacity: 0.6,
          },
          label: {
            show: true,
            position: "right",
            color: "var(--text-primary)",
            fontSize: 12,
            fontWeight: 500,
            distance: 5,
          },
          labelLayout: {
            hideOverlap: true,
          },
          data: nodes,
          links: links,
        },
      ],
    };
  }, [nodes, links, paths]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      opts={{ renderer: "svg" }}
    />
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function TouchpointChartComponent({
  channelAttributions,
  paths = [],
  selectedModel,
  chartType: initialChartType = "bar",
  height = 350,
  className,
}: TouchpointChartProps) {
  const [chartType, setChartType] = useState<"bar" | "sankey">(initialChartType);
  const hasPaths = paths.length > 0;

  return (
    <div
      className={cn("rounded-lg border p-4", className)}
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4
            className="text-sm font-medium"
            style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
          >
            Channel Attribution
          </h4>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            {MODEL_LABELS[selectedModel]} Model
          </p>
        </div>

        {/* Chart Type Toggle */}
        {hasPaths && (
          <div
            className="flex items-center gap-1 p-1 rounded-lg"
            style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))" }}
          >
            <button
              onClick={() => setChartType("bar")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                chartType === "bar"
                  ? "bg-[var(--bg-secondary,rgba(255,255,255,0.1))]"
                  : ""
              )}
              style={{
                color:
                  chartType === "bar"
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType("sankey")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                chartType === "sankey"
                  ? "bg-[var(--bg-secondary,rgba(255,255,255,0.1))]"
                  : ""
              )}
              style={{
                color:
                  chartType === "sankey"
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              Flow Diagram
            </button>
          </div>
        )}
      </div>

      {/* Chart */}
      {chartType === "bar" || !hasPaths ? (
        <BarChart
          channelAttributions={channelAttributions}
          selectedModel={selectedModel}
          height={height}
        />
      ) : (
        <SankeyChart paths={paths} height={height} />
      )}

      {/* Legend for Bar Chart */}
      {chartType === "bar" && (
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t" style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}>
          {channelAttributions.slice(0, 4).map((attr) => (
            <div key={attr.channel} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: CHANNEL_COLORS[attr.channel] }}
              />
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
              >
                {CHANNEL_LABELS[attr.channel]}
              </span>
            </div>
          ))}
          {channelAttributions.length > 4 && (
            <span
              className="text-xs"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.5))" }}
            >
              +{channelAttributions.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const TouchpointChart = memo(TouchpointChartComponent);
export default TouchpointChart;
