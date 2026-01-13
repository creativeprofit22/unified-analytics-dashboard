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

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "var(--bg-primary)",
      borderColor: "var(--text-secondary)",
      textStyle: {
        color: "var(--text-primary)",
      },
      axisPointer: {
        type: "shadow",
      },
      formatter: (params: unknown) => {
        const p = Array.isArray(params) ? params[0] : params;
        const typedP = p as { name: string; value: number };
        return `${typedP.name}: ${formatValue(typedP.value)}`;
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
