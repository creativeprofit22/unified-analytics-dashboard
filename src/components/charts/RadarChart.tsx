"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export interface RadarIndicator {
  name: string;
  max: number;
  min?: number;
}

export interface RadarSeriesData {
  name: string;
  values: number[];
  color?: string;
  areaOpacity?: number;
}

interface RadarChartProps {
  indicators: RadarIndicator[];
  series: RadarSeriesData[];
  height?: number;
  className?: string;
  shape?: "polygon" | "circle";
  showLegend?: boolean;
}

// Default colors for multiple series
const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
];

function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toFixed(1).replace(/\.0$/, "");
}

export function RadarChart({
  indicators,
  series,
  height = 300,
  className,
  shape = "polygon",
  showLegend,
}: RadarChartProps) {
  // Default showLegend to true when multiple series
  const shouldShowLegend = showLegend ?? series.length > 1;

  // Build radar indicator config
  const radarIndicators = indicators.map((ind) => ({
    name: ind.name,
    max: ind.max,
    min: ind.min ?? 0,
  }));

  // Build series data with colors
  const seriesData = series.map((s, idx) => {
    const color = s.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
    return {
      name: s.name,
      value: s.values,
      itemStyle: {
        color: color,
      },
      lineStyle: {
        color: color,
        width: 2,
      },
      areaStyle: {
        color: color,
        opacity: s.areaOpacity ?? 0.2,
      },
    };
  });

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
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
      formatter: (params: unknown) => {
        const p = params as {
          name: string;
          value: number[];
          color: string;
        };
        const values = p.value;
        const seriesName = p.name;
        const color = p.color;

        // Build indicator rows
        const indicatorRows = indicators
          .map((ind, idx) => {
            const val = values[idx] ?? 0;
            const percentage = ind.max > 0 ? ((val / ind.max) * 100).toFixed(0) : "0";
            return `<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
              <span style="color: var(--text-secondary);">${ind.name}</span>
              <span style="font-weight: 500; margin-left: 16px;">
                ${formatValue(val)} / ${formatValue(ind.max)}
                <span style="color: var(--text-secondary); font-size: 11px; margin-left: 4px;">(${percentage}%)</span>
              </span>
            </div>`;
          })
          .join("");

        return `<div style="min-width: 180px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1));">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px;"></span>
            <span style="font-weight: 600;">${seriesName}</span>
          </div>
          ${indicatorRows}
        </div>`;
      },
    },
    legend: shouldShowLegend
      ? {
          show: true,
          bottom: 0,
          left: "center",
          textStyle: {
            color: "var(--text-secondary)",
            fontSize: 12,
          },
          itemWidth: 14,
          itemHeight: 10,
          itemGap: 16,
          data: series.map((s, idx) => ({
            name: s.name,
            itemStyle: {
              color: s.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
            },
          })),
        }
      : { show: false },
    radar: {
      shape: shape,
      indicator: radarIndicators,
      center: ["50%", shouldShowLegend ? "45%" : "50%"],
      radius: shouldShowLegend ? "60%" : "70%",
      axisName: {
        color: "var(--text-secondary)",
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: "var(--border-color, rgba(255,255,255,0.2))",
        },
      },
      splitLine: {
        lineStyle: {
          color: "var(--border-color, rgba(255,255,255,0.15))",
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ["transparent", "var(--bg-primary, rgba(255,255,255,0.02))"],
        },
      },
    },
    animation: true,
    animationDuration: 300,
    animationEasing: "cubicOut",
    series: [
      {
        type: "radar",
        symbol: "circle",
        symbolSize: 6,
        emphasis: {
          disabled: false,
          focus: "self",
          itemStyle: {
            shadowColor: "rgba(0, 0, 0, 0.3)",
            shadowBlur: 8,
          },
          lineStyle: {
            width: 3,
          },
          areaStyle: {
            opacity: 0.4,
          },
        },
        data: seriesData,
      },
    ],
  };

  return (
    <div className={className}>
      <ReactECharts
        option={option}
        style={{ height, width: "100%" }}
        opts={{ renderer: "svg" }}
      />
    </div>
  );
}

export default RadarChart;
