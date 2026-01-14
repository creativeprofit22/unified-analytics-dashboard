"use client";

import { memo, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { RevenueForecast } from "@/types";
import { cn } from "@/utils/cn";

// =============================================================================
// PROPS
// =============================================================================

export interface ForecastChartProps {
  forecast: RevenueForecast;
  height?: number;
  className?: string;
}

// =============================================================================
// UTILITIES
// =============================================================================

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTrendIcon(trend: string): string {
  switch (trend) {
    case "growing":
      return "\u2191";
    case "declining":
      return "\u2193";
    default:
      return "\u2192";
  }
}

function getTrendColor(trend: string): string {
  switch (trend) {
    case "growing":
      return "#22c55e";
    case "declining":
      return "#ef4444";
    default:
      return "#eab308";
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

function ForecastChartComponent({
  forecast,
  height = 300,
  className,
}: ForecastChartProps) {
  const {
    metric,
    currentValue,
    forecastedValue,
    changePercent,
    confidence,
    trend,
    dataPoints,
    forecastPeriod,
  } = forecast;

  // Build series data
  const allDates = useMemo(() => dataPoints.map((d) => d.date), [dataPoints]);

  // Find the transition point (where actual data ends)
  const transitionIndex = useMemo(() => {
    const lastActualIndex = dataPoints.findIndex((d) => d.actual === undefined);
    return lastActualIndex === -1 ? dataPoints.length - 1 : lastActualIndex - 1;
  }, [dataPoints]);

  // Historical actuals (solid line)
  const historicalValues = useMemo(() => {
    return dataPoints.map((d, i) => {
      if (i <= transitionIndex && d.actual !== undefined) {
        return d.actual;
      }
      return null;
    });
  }, [dataPoints, transitionIndex]);

  // Predictions (dashed line) - includes overlap point for continuity
  const predictionValues = useMemo(() => {
    return dataPoints.map((d, i) => {
      if (i >= transitionIndex) {
        return d.predicted;
      }
      return null;
    });
  }, [dataPoints, transitionIndex]);

  // Confidence interval bands
  const upperBand = useMemo(() => {
    return dataPoints.map((d, i) => (i > transitionIndex ? d.upper : null));
  }, [dataPoints, transitionIndex]);

  const lowerBand = useMemo(() => {
    return dataPoints.map((d, i) => (i > transitionIndex ? d.lower : null));
  }, [dataPoints, transitionIndex]);

  const option: EChartsOption = useMemo(
    () => ({
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
        formatter: (params: unknown) => {
          const items = params as Array<{
            axisValue: string;
            seriesName: string;
            value: number | null;
            color: string;
          }>;
          const date = items[0]?.axisValue;
          if (!date) return "";

          const actual = items.find((i) => i.seriesName === "Actual");
          const predicted = items.find((i) => i.seriesName === "Forecast");
          const upper = items.find((i) => i.seriesName === "Upper Bound");
          const lower = items.find((i) => i.seriesName === "Lower Bound");

          let html = `<div style="min-width: 180px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${formatFullDate(date)}</div>`;

          if (actual?.value != null) {
            html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">Actual</span>
              <span style="font-weight: 600; color: #3b82f6;">${formatCurrency(actual.value)}</span>
            </div>`;
          }

          if (predicted?.value != null) {
            html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">Forecast</span>
              <span style="font-weight: 600; color: #22c55e;">${formatCurrency(predicted.value)}</span>
            </div>`;

            if (upper?.value != null && lower?.value != null) {
              html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.1));">
                <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Confidence Range</div>
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span style="color: var(--text-secondary);">${formatCurrency(lower.value)}</span>
                  <span style="color: var(--text-secondary);">to</span>
                  <span style="color: var(--text-secondary);">${formatCurrency(upper.value)}</span>
                </div>
              </div>`;
            }
          }

          html += "</div>";
          return html;
        },
      },
      grid: {
        left: 60,
        right: 20,
        top: 40,
        bottom: 40,
      },
      xAxis: {
        type: "category",
        data: allDates,
        axisLabel: {
          color: "var(--text-secondary)",
          fontSize: 11,
          formatter: (value: string) => formatDate(value),
          interval: Math.floor(allDates.length / 6),
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
          formatter: (value: number) => formatCurrency(value),
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
            opacity: 0.1,
            type: "dashed",
          },
        },
      },
      animation: true,
      animationDuration: 500,
      animationEasing: "cubicOut",
      series: [
        // Confidence interval area (rendered first, behind lines)
        {
          name: "Upper Bound",
          type: "line",
          data: upperBand,
          lineStyle: { opacity: 0 },
          areaStyle: { opacity: 0 },
          symbol: "none",
          stack: "confidence",
          z: 1,
        },
        {
          name: "Lower Bound",
          type: "line",
          data: lowerBand.map((val, i) => {
            if (val == null || upperBand[i] == null) return null;
            return upperBand[i]! - val;
          }),
          lineStyle: { opacity: 0 },
          areaStyle: {
            color: "rgba(34, 197, 94, 0.15)",
          },
          symbol: "none",
          stack: "confidence",
          z: 1,
        },
        // Historical actuals (solid line)
        {
          name: "Actual",
          type: "line",
          data: historicalValues,
          smooth: true,
          symbol: "circle",
          symbolSize: 4,
          showSymbol: false,
          lineStyle: {
            color: "#3b82f6",
            width: 2,
          },
          itemStyle: {
            color: "#3b82f6",
          },
          emphasis: {
            disabled: false,
            focus: "series",
            itemStyle: {
              borderColor: "#3b82f6",
              borderWidth: 3,
              shadowColor: "rgba(59, 130, 246, 0.5)",
              shadowBlur: 8,
            },
          },
          z: 3,
        },
        // Predictions (dashed line)
        {
          name: "Forecast",
          type: "line",
          data: predictionValues,
          smooth: true,
          symbol: "circle",
          symbolSize: 4,
          showSymbol: false,
          lineStyle: {
            color: "#22c55e",
            width: 2,
            type: "dashed",
          },
          itemStyle: {
            color: "#22c55e",
          },
          emphasis: {
            disabled: false,
            focus: "series",
            itemStyle: {
              borderColor: "#22c55e",
              borderWidth: 3,
              shadowColor: "rgba(34, 197, 94, 0.5)",
              shadowBlur: 8,
            },
          },
          z: 3,
        },
        // Current value marker
        {
          name: "Current",
          type: "scatter",
          data: transitionIndex >= 0 ? [[allDates[transitionIndex], currentValue]] : [],
          symbol: "circle",
          symbolSize: 12,
          itemStyle: {
            color: "#3b82f6",
            borderColor: "#fff",
            borderWidth: 2,
            shadowColor: "rgba(59, 130, 246, 0.5)",
            shadowBlur: 8,
          },
          z: 4,
        },
      ],
      // Annotations
      graphic: [
        // Forecasted end value annotation
        {
          type: "group",
          right: 30,
          top: 50,
          children: [
            {
              type: "rect",
              shape: { width: 120, height: 50, r: 6 },
              style: {
                fill: "var(--bg-secondary, rgba(255,255,255,0.05))",
                stroke: "var(--border-color, rgba(255,255,255,0.1))",
              },
            },
            {
              type: "text",
              style: {
                text: "Forecasted",
                x: 60,
                y: 15,
                textAlign: "center",
                fill: "var(--text-secondary, rgba(255,255,255,0.6))",
                fontSize: 11,
              },
            },
            {
              type: "text",
              style: {
                text: formatCurrency(forecastedValue),
                x: 60,
                y: 35,
                textAlign: "center",
                fill: "#22c55e",
                fontSize: 16,
                fontWeight: "bold",
              },
            },
          ],
        },
      ],
    }),
    [
      allDates,
      historicalValues,
      predictionValues,
      upperBand,
      lowerBand,
      transitionIndex,
      currentValue,
      forecastedValue,
    ]
  );

  const trendColor = getTrendColor(trend);

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        className
      )}
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <h4
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          {metric.toUpperCase()} Forecast ({forecastPeriod})
        </h4>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-0.5 rounded"
              style={{ backgroundColor: "#3b82f6" }}
            />
            <span style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}>
              Actual
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-0.5 rounded"
              style={{
                backgroundColor: "#22c55e",
                backgroundImage:
                  "repeating-linear-gradient(90deg, #22c55e 0, #22c55e 3px, transparent 3px, transparent 6px)",
              }}
            />
            <span style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}>
              Forecast
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))" }}
        >
          <p
            className="text-xs mb-1"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            Current
          </p>
          <p
            className="text-lg font-semibold"
            style={{ color: "#3b82f6" }}
          >
            {formatCurrency(currentValue)}
          </p>
        </div>
        <div
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))" }}
        >
          <p
            className="text-xs mb-1"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            Forecasted
          </p>
          <p
            className="text-lg font-semibold"
            style={{ color: "#22c55e" }}
          >
            {formatCurrency(forecastedValue)}
          </p>
        </div>
        <div
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))" }}
        >
          <p
            className="text-xs mb-1"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            Change
          </p>
          <p
            className="text-lg font-semibold flex items-center justify-center gap-1"
            style={{ color: trendColor }}
          >
            <span>{getTrendIcon(trend)}</span>
            {changePercent >= 0 ? "+" : ""}
            {changePercent.toFixed(1)}%
          </p>
        </div>
        <div
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))" }}
        >
          <p
            className="text-xs mb-1"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            Confidence
          </p>
          <p
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
          >
            {confidence}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <ReactECharts
        option={option}
        style={{ height, width: "100%" }}
        opts={{ renderer: "svg" }}
      />
    </div>
  );
}

export const ForecastChart = memo(ForecastChartComponent);
export default ForecastChart;
