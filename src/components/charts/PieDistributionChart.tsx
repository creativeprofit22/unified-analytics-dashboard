"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export interface PieDataItem {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

interface PieDistributionChartProps {
  data: PieDataItem[];
  height?: number;
  className?: string;
  showLegend?: boolean;
  innerRadius?: number;
}

const DEFAULT_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString();
}

export function PieDistributionChart({
  data,
  height = 200,
  className,
  showLegend = true,
  innerRadius = 0,
}: PieDistributionChartProps) {
  const chartColors = data.map(
    (item, index) => item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  ) as string[];

  // Calculate total for context
  const total = data.reduce((sum, item) => sum + item.value, 0);

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
        const p = params as { name: string; value: number; percent: number; color: string };
        return `<div style="min-width: 140px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${p.color};"></span>
            <span style="font-weight: 600;">${p.name}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="color: var(--text-secondary);">Value</span>
            <span style="font-weight: 600;">${formatValue(p.value)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="color: var(--text-secondary);">Share</span>
            <span style="font-weight: 600; color: ${p.color};">${p.percent.toFixed(1)}%</span>
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.1)); display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-secondary); font-size: 12px;">Total</span>
            <span style="font-size: 12px;">${formatValue(total)}</span>
          </div>
        </div>`;
      },
    },
    legend: showLegend
      ? {
          orient: "vertical",
          right: 10,
          top: "center",
          textStyle: {
            color: "var(--text-secondary)",
          },
        }
      : undefined,
    color: chartColors,
    animation: true,
    animationDuration: 300,
    animationEasing: "cubicOut",
    series: [
      {
        type: "pie",
        radius: innerRadius > 0 ? [`${innerRadius}%`, "80%"] : ["0%", "80%"],
        center: showLegend ? ["40%", "50%"] : ["50%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: "var(--bg-primary)",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          disabled: false,
          scale: true,
          scaleSize: 8,
          focus: "self",
          label: {
            show: true,
            fontWeight: "bold",
            fontSize: 14,
            color: "var(--text-primary)",
          },
          itemStyle: {
            shadowColor: "rgba(0, 0, 0, 0.4)",
            shadowBlur: 15,
            shadowOffsetY: 5,
          },
        },
        data: data.map((item) => ({
          name: item.name,
          value: item.value,
        })),
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
