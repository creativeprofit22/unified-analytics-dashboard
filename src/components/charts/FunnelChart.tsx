"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export interface FunnelDataItem {
  name: string;
  value: number;
  color?: string;
}

interface FunnelChartProps {
  data: FunnelDataItem[];
  height?: number;
  className?: string;
  showLabels?: boolean;
  orientation?: "vertical" | "horizontal";
}

const DEFAULT_COLORS = ["#3b82f6", "#06b6d4", "#22c55e", "#eab308"];

function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString();
}

export function FunnelChart({
  data,
  height = 300,
  className,
  showLabels = true,
  orientation = "vertical",
}: FunnelChartProps) {
  const chartColors = data.map(
    (item, index) => item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  ) as string[];

  // Get first step value for percentage calculations
  const firstValue = data.length > 0 ? data[0]!.value : 0;

  // Build data with colors for the series
  const seriesData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    itemStyle: {
      color: {
        type: "linear" as const,
        x: orientation === "horizontal" ? 0 : 0,
        y: orientation === "horizontal" ? 0 : 0,
        x2: orientation === "horizontal" ? 1 : 0,
        y2: orientation === "horizontal" ? 0 : 1,
        colorStops: [
          { offset: 0, color: chartColors[index]! },
          {
            offset: 1,
            color:
              index < data.length - 1
                ? chartColors[index + 1]!
                : chartColors[index]!,
          },
        ],
      },
      borderColor: "var(--bg-primary, #1f2937)",
      borderWidth: 1,
    },
  }));

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
          value: number;
          dataIndex: number;
          color: string;
        };
        const percentOfFirst =
          firstValue > 0 ? ((p.value / firstValue) * 100).toFixed(1) : "0.0";

        // Calculate drop-off from previous step
        let dropOffHtml = "";
        if (p.dataIndex > 0) {
          const prevValue = data[p.dataIndex - 1]!.value;
          const dropOff = prevValue - p.value;
          const dropOffPercent =
            prevValue > 0 ? ((dropOff / prevValue) * 100).toFixed(1) : "0.0";
          dropOffHtml = `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.1));">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary); font-size: 12px;">Drop-off</span>
              <span style="color: #ef4444; font-weight: 500;">-${dropOffPercent}%</span>
            </div>
          </div>`;
        }

        return `<div style="min-width: 160px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${chartColors[p.dataIndex]};"></span>
            <span style="font-weight: 600;">${p.name}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="color: var(--text-secondary);">Value</span>
            <span style="font-weight: 600;">${formatValue(p.value)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-secondary);">% of First</span>
            <span style="font-weight: 600; color: ${chartColors[p.dataIndex]};">${percentOfFirst}%</span>
          </div>${dropOffHtml}
        </div>`;
      },
    },
    animation: true,
    animationDuration: 300,
    animationEasing: "cubicOut",
    series: [
      {
        type: "funnel",
        left: "10%",
        right: "10%",
        top: 10,
        bottom: 10,
        width: "80%",
        min: 0,
        minSize: "10%",
        maxSize: "100%",
        sort: "descending",
        gap: 2,
        orient: orientation,
        funnelAlign: "center",
        label: showLabels
          ? {
              show: true,
              position: orientation === "horizontal" ? "inside" : "inside",
              formatter: (params: unknown) => {
                const p = params as { name: string; value: number };
                return `{name|${p.name}}\n{value|${formatValue(p.value)}}`;
              },
              rich: {
                name: {
                  fontSize: 12,
                  color: "var(--text-primary)",
                  fontWeight: 500,
                  lineHeight: 18,
                },
                value: {
                  fontSize: 14,
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  lineHeight: 20,
                },
              },
            }
          : { show: false },
        labelLine: {
          show: false,
        },
        emphasis: {
          disabled: false,
          focus: "self",
          label: {
            show: showLabels,
            fontSize: 14,
          },
          itemStyle: {
            shadowColor: "rgba(0, 0, 0, 0.4)",
            shadowBlur: 15,
            shadowOffsetY: 5,
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

export default FunnelChart;
