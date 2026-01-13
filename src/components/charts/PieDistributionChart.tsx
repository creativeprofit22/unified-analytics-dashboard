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

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "var(--bg-primary)",
      borderColor: "var(--text-secondary)",
      textStyle: {
        color: "var(--text-primary)",
      },
      formatter: "{b}: {c} ({d}%)",
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
          label: {
            show: true,
            fontWeight: "bold",
            color: "var(--text-primary)",
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
