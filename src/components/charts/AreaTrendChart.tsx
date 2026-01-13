"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

// Re-export TrendDataPoint from TrendChart for convenience
export type { TrendDataPoint } from "../TrendChart";

interface AreaTrendChartProps {
  data: { date: string; value: number }[];
  height?: number;
  color?: string;
  className?: string;
  showGrid?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
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

export function AreaTrendChart({
  data,
  height = 150,
  color = "#3b82f6",
  className,
  showGrid = false,
}: AreaTrendChartProps) {
  const dates = data.map((d) => d.date);
  const values = data.map((d) => d.value);

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "var(--bg-primary, #1f2937)",
      borderColor: "var(--text-secondary)",
      textStyle: {
        color: "var(--text-primary)",
      },
      formatter: (params: unknown) => {
        const p = Array.isArray(params) ? params[0] : params;
        const typedP = p as { axisValue: string; value: number };
        const date = new Date(typedP.axisValue);
        const formattedDate = date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        return `${formattedDate}<br/>Value: ${formatValue(typedP.value)}`;
      },
    },
    grid: {
      left: 40,
      right: 10,
      top: 10,
      bottom: 30,
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: {
        color: "var(--text-secondary)",
        fontSize: 11,
        formatter: (value: string) => formatDate(value),
      },
      axisLine: {
        lineStyle: {
          color: "var(--text-secondary)",
          opacity: 0.3,
        },
      },
      axisTick: {
        lineStyle: {
          color: "var(--text-secondary)",
          opacity: 0.3,
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "var(--text-secondary)",
        fontSize: 11,
        formatter: (value: number) => formatValue(value),
      },
      axisLine: {
        lineStyle: {
          color: "var(--text-secondary)",
          opacity: 0.3,
        },
      },
      splitLine: showGrid
        ? {
            lineStyle: {
              color: "var(--text-secondary)",
              opacity: 0.2,
              type: "dashed",
            },
          }
        : { show: false },
    },
    series: [
      {
        type: "line",
        data: values,
        smooth: true,
        symbol: "none",
        lineStyle: {
          color: color,
          width: 2,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}66` },
              { offset: 1, color: `${color}0D` },
            ],
          },
        },
        emphasis: {
          focus: "series",
          itemStyle: {
            color: "var(--bg-primary, #1f2937)",
            borderColor: color,
            borderWidth: 2,
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

export default AreaTrendChart;
