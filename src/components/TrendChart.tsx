"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { cn } from "@/utils/cn";

export interface TrendDataPoint {
  date: string; // ISO 8601 date string
  value: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  height?: number;
  color?: string;
  className?: string;
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
  return value.toLocaleString();
}

export function TrendChart({
  data,
  height = 120,
  color = "#3b82f6",
  className,
}: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-[var(--text-muted,#6b7280)]",
          className
        )}
        style={{ height }}
      >
        <span className="text-sm">No data available</span>
      </div>
    );
  }

  const dates = data.map((d) => d.date);
  const values = data.map((d) => d.value);

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
        type: "cross",
        crossStyle: {
          color: "var(--text-secondary)",
          opacity: 0.5,
        },
        lineStyle: {
          color: color,
          opacity: 0.6,
          type: "dashed",
        },
      },
      formatter: (params: unknown) => {
        const p = Array.isArray(params) ? params[0] : params;
        const typedP = p as { axisValue: string; value: number; dataIndex: number };
        const date = new Date(typedP.axisValue);
        const dayOfWeek = date.toLocaleDateString(undefined, { weekday: "long" });
        const formattedDate = date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        // Calculate comparison to previous data point
        let comparisonHtml = "";
        const prevIndex = typedP.dataIndex - 1;
        if (prevIndex >= 0 && prevIndex < values.length) {
          const prevValue = values[prevIndex]!;
          const diff = typedP.value - prevValue;
          const percentChange = prevValue !== 0 ? ((diff / prevValue) * 100).toFixed(1) : "0.0";
          const arrow = diff >= 0 ? "↑" : "↓";
          const changeColor = diff >= 0 ? "#22c55e" : "#ef4444";
          comparisonHtml = `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.1));">
            <span style="color: var(--text-secondary); font-size: 12px;">vs previous:</span>
            <span style="color: ${changeColor}; margin-left: 8px; font-weight: 500;">${arrow} ${Math.abs(Number(percentChange))}%</span>
          </div>`;
        }

        return `<div style="min-width: 140px;">
          <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">${dayOfWeek}</div>
          <div style="font-weight: 600; margin-bottom: 8px;">${formattedDate}</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-secondary);">Value</span>
            <span style="font-weight: 600; color: ${color};">${formatValue(typedP.value)}</span>
          </div>${comparisonHtml}
        </div>`;
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
      splitLine: { show: false },
    },
    animation: true,
    animationDuration: 300,
    animationEasing: "cubicOut",
    series: [
      {
        type: "line",
        data: values,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: false,
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
          disabled: false,
          focus: "series",
          scale: true,
          itemStyle: {
            color: "var(--bg-primary, #1f2937)",
            borderColor: color,
            borderWidth: 3,
            shadowColor: `${color}80`,
            shadowBlur: 8,
          },
          lineStyle: {
            width: 3,
          },
        },
      },
    ],
  };

  return (
    <div className={cn("w-full", className)}>
      <ReactECharts
        option={option}
        style={{ height, width: "100%" }}
        opts={{ renderer: "svg" }}
      />
    </div>
  );
}

export default TrendChart;
