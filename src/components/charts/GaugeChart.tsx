"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export interface GaugeThreshold {
  value: number; // end value of this zone (start is previous zone's end or min)
  color: string;
  label?: string; // e.g., "Poor", "Good", "Excellent"
}

interface GaugeChartProps {
  value: number;
  min?: number; // default 0
  max?: number; // default 100
  height?: number; // default 200
  className?: string;
  title?: string;
  unit?: string; // e.g., "%", "ms", "x"
  thresholds?: GaugeThreshold[]; // colored zones
  showPointer?: boolean; // default true
}

const DEFAULT_THRESHOLDS: GaugeThreshold[] = [
  { value: 33, color: "#ef4444", label: "Poor" },
  { value: 66, color: "#eab308", label: "Medium" },
  { value: 100, color: "#22c55e", label: "Good" },
];

function buildAxisLineColors(
  thresholds: GaugeThreshold[],
  min: number,
  max: number
): [number, string][] {
  const range = max - min;
  const colors: [number, string][] = [];

  for (const threshold of thresholds) {
    const normalizedValue = (threshold.value - min) / range;
    colors.push([Math.min(1, Math.max(0, normalizedValue)), threshold.color]);
  }

  return colors;
}

function getValueColor(
  value: number,
  thresholds: GaugeThreshold[],
  min: number
): string {
  let prevEnd = min;
  for (const threshold of thresholds) {
    if (value <= threshold.value && value >= prevEnd) {
      return threshold.color;
    }
    prevEnd = threshold.value;
  }
  // Return last threshold color if value exceeds all thresholds
  return thresholds[thresholds.length - 1]?.color ?? "#22c55e";
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  height = 200,
  className,
  title,
  unit = "",
  thresholds = DEFAULT_THRESHOLDS,
  showPointer = true,
}: GaugeChartProps) {
  const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);
  const axisLineColors = buildAxisLineColors(sortedThresholds, min, max);
  const valueColor = getValueColor(value, sortedThresholds, min);

  const option: EChartsOption = {
    tooltip: {
      show: true,
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
      formatter: () => {
        const currentThreshold = sortedThresholds.find(
          (t, i) =>
            value <= t.value &&
            value >= (i > 0 ? sortedThresholds[i - 1]!.value : min)
        );
        const statusLabel = currentThreshold?.label ?? "";
        const statusHtml = statusLabel
          ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.1));">
              <span style="color: var(--text-secondary); font-size: 12px;">Status:</span>
              <span style="color: ${valueColor}; margin-left: 8px; font-weight: 500;">${statusLabel}</span>
            </div>`
          : "";

        return `<div style="min-width: 120px;">
          ${title ? `<div style="font-weight: 600; margin-bottom: 8px;">${title}</div>` : ""}
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-secondary);">Value</span>
            <span style="font-weight: 600; color: ${valueColor};">${value}${unit}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <span style="color: var(--text-secondary);">Range</span>
            <span style="color: var(--text-secondary);">${min} - ${max}${unit}</span>
          </div>${statusHtml}
        </div>`;
      },
    },
    animation: true,
    animationDuration: 300,
    animationEasing: "cubicOut",
    series: [
      {
        type: "gauge",
        min: min,
        max: max,
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "70%"],
        radius: "90%",
        progress: {
          show: true,
          roundCap: true,
          width: 18,
          itemStyle: {
            color: valueColor,
          },
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 18,
            color: axisLineColors,
            opacity: 0.3,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: true,
          distance: 25,
          color: "var(--text-secondary)",
          fontSize: 11,
          formatter: (value: number) => {
            if (value === min || value === max) {
              return `${value}${unit}`;
            }
            // Show threshold values
            const isThreshold = sortedThresholds.some(
              (t) => Math.abs(t.value - value) < (max - min) * 0.01
            );
            return isThreshold ? `${value}` : "";
          },
        },
        pointer: {
          show: showPointer,
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "60%",
          width: 8,
          offsetCenter: [0, "-10%"],
          itemStyle: {
            color: valueColor,
            shadowColor: `${valueColor}80`,
            shadowBlur: 8,
          },
        },
        anchor: {
          show: showPointer,
          showAbove: true,
          size: 16,
          itemStyle: {
            borderWidth: 4,
            borderColor: valueColor,
            color: "var(--bg-primary, #1f2937)",
            shadowColor: `${valueColor}40`,
            shadowBlur: 4,
          },
        },
        title: {
          show: !!title,
          offsetCenter: [0, "35%"],
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text-secondary)",
        },
        detail: {
          valueAnimation: true,
          fontSize: 24,
          fontWeight: 700,
          offsetCenter: [0, "10%"],
          formatter: (value: number) => `${value}${unit}`,
          color: valueColor,
        },
        data: [
          {
            value: value,
            name: title ?? "",
          },
        ],
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

export default GaugeChart;
