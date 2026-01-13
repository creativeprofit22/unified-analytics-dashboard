"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export interface BarComparisonDataItem {
  label: string;
  value: number;
  color?: string;
}

interface BarComparisonChartProps {
  data: BarComparisonDataItem[];
  height?: number;
  color?: string;
  className?: string;
  layout?: "vertical" | "horizontal";
}

function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toString();
}

export function BarComparisonChart({
  data,
  height = 200,
  color = "#3b82f6",
  className,
  layout = "horizontal",
}: BarComparisonChartProps) {
  const isVertical = layout === "vertical";
  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);
  const colors = data.map((d) => d.color || color);

  // Calculate total for percentage display
  const total = values.reduce((sum, v) => sum + v, 0);

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
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
      axisPointer: {
        type: "shadow",
        shadowStyle: {
          color: "rgba(255,255,255,0.05)",
        },
      },
      formatter: (params: unknown) => {
        const p = Array.isArray(params) ? params[0] : params;
        const typedP = p as { name: string; value: number; dataIndex: number; color: string };
        const percentage = total > 0 ? ((typedP.value / total) * 100).toFixed(1) : "0.0";
        const barColor = colors[typedP.dataIndex] || color;

        return `<div style="min-width: 140px;">
          <div style="font-weight: 600; margin-bottom: 8px;">${typedP.name}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="color: var(--text-secondary);">Value</span>
            <span style="font-weight: 600; color: ${barColor};">${formatValue(typedP.value)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-secondary);">Share</span>
            <span style="font-weight: 500;">${percentage}%</span>
          </div>
        </div>`;
      },
    },
    grid: {
      left: isVertical ? 90 : 50,
      right: 20,
      top: 10,
      bottom: 30,
      containLabel: false,
    },
    xAxis: isVertical
      ? {
          type: "value",
          axisLabel: {
            color: "var(--text-secondary)",
            fontSize: 12,
            formatter: (value: number) => formatValue(value),
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
              opacity: 0.2,
              type: "dashed",
            },
          },
        }
      : {
          type: "category",
          data: labels,
          axisLabel: {
            color: "var(--text-secondary)",
            fontSize: 12,
          },
          axisLine: {
            lineStyle: {
              color: "var(--text-secondary)",
              opacity: 0.3,
            },
          },
        },
    yAxis: isVertical
      ? {
          type: "category",
          data: labels,
          axisLabel: {
            color: "var(--text-secondary)",
            fontSize: 12,
          },
          axisLine: {
            lineStyle: {
              color: "var(--text-secondary)",
              opacity: 0.3,
            },
          },
        }
      : {
          type: "value",
          axisLabel: {
            color: "var(--text-secondary)",
            fontSize: 12,
            formatter: (value: number) => formatValue(value),
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
              opacity: 0.2,
              type: "dashed",
            },
          },
        },
    animation: true,
    animationDuration: 300,
    animationEasing: "cubicOut",
    series: [
      {
        type: "bar",
        data: values.map((value, index) => ({
          value,
          itemStyle: {
            color: colors[index],
            borderRadius: isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 40,
        emphasis: {
          disabled: false,
          focus: "series",
          itemStyle: {
            shadowColor: "rgba(0, 0, 0, 0.3)",
            shadowBlur: 10,
            shadowOffsetY: 4,
          },
        },
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
