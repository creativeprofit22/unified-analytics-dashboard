"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export interface HeatmapDataItem {
  x: number; // x index
  y: number; // y index
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapDataItem[];
  xLabels: string[]; // columns (e.g., months)
  yLabels: string[]; // rows (e.g., cohorts)
  height?: number; // default 300
  className?: string;
  colorRange?: [string, string]; // default ["#3b82f6", "#22c55e"]
  valueFormatter?: (value: number) => string;
  showValues?: boolean; // default true
}

function defaultValueFormatter(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  if (value % 1 !== 0) {
    return value.toFixed(1);
  }
  return value.toString();
}

export function HeatmapChart({
  data,
  xLabels,
  yLabels,
  height = 300,
  className,
  colorRange = ["#3b82f6", "#22c55e"],
  valueFormatter = defaultValueFormatter,
  showValues = true,
}: HeatmapChartProps) {
  // Calculate min/max for visual map
  const values = data.map((d) => d.value);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 100;

  // Transform data for ECharts heatmap format: [x, y, value]
  const seriesData = data.map((item) => [item.x, item.y, item.value]);

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
          data: [number, number, number];
          color: string;
        };
        const [xIndex, yIndex, value] = p.data;
        const xLabel = xLabels[xIndex] ?? `Column ${xIndex}`;
        const yLabel = yLabels[yIndex] ?? `Row ${yIndex}`;
        const formattedValue = valueFormatter(value);

        return `<div style="min-width: 140px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 2px; background: ${p.color};"></span>
            <span style="font-weight: 600;">${yLabel}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="color: var(--text-secondary);">${xLabel}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.1));">
            <span style="color: var(--text-secondary);">Value</span>
            <span style="font-weight: 600; color: ${p.color};">${formattedValue}</span>
          </div>
        </div>`;
      },
    },
    grid: {
      left: 80,
      right: 20,
      top: 10,
      bottom: 60,
    },
    xAxis: {
      type: "category",
      data: xLabels,
      position: "top",
      axisLabel: {
        color: "var(--text-secondary)",
        fontSize: 11,
      },
      axisLine: {
        lineStyle: {
          color: "var(--text-secondary)",
          opacity: 0.3,
        },
      },
      axisTick: {
        show: false,
      },
      splitArea: {
        show: false,
      },
    },
    yAxis: {
      type: "category",
      data: yLabels,
      inverse: true, // Cohort 0 at top
      axisLabel: {
        color: "var(--text-secondary)",
        fontSize: 11,
      },
      axisLine: {
        lineStyle: {
          color: "var(--text-secondary)",
          opacity: 0.3,
        },
      },
      axisTick: {
        show: false,
      },
      splitArea: {
        show: false,
      },
    },
    visualMap: {
      type: "continuous",
      min: minValue,
      max: maxValue,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 10,
      inRange: {
        color: colorRange,
      },
      textStyle: {
        color: "var(--text-secondary)",
        fontSize: 11,
      },
    },
    animation: true,
    animationDuration: 300,
    animationEasing: "cubicOut",
    series: [
      {
        type: "heatmap",
        data: seriesData,
        label: {
          show: showValues,
          formatter: (params: unknown) => {
            const p = params as { data: [number, number, number] };
            return valueFormatter(p.data[2]);
          },
          color: "var(--text-primary)",
          fontSize: 11,
          fontWeight: 500,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        itemStyle: {
          borderColor: "var(--bg-primary, #1f2937)",
          borderWidth: 2,
          borderRadius: 4,
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

export default HeatmapChart;
