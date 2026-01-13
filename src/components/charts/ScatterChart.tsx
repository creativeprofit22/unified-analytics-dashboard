"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export interface ScatterDataItem {
  x: number;
  y: number;
  label?: string;
  value?: number;
  color?: string;
}

interface ScatterChartProps {
  data: ScatterDataItem[];
  height?: number;
  className?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showTrendLine?: boolean;
  enableBrush?: boolean;
  symbolSize?: number | ((value: number[]) => number);
}

function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toFixed(2).replace(/\.00$/, "");
}

function calculateTrendLine(data: ScatterDataItem[]): { start: [number, number]; end: [number, number] } | null {
  if (data.length < 2) return null;

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumX2 += point.x * point.x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const xMin = Math.min(...data.map((d) => d.x));
  const xMax = Math.max(...data.map((d) => d.x));

  return {
    start: [xMin, slope * xMin + intercept],
    end: [xMax, slope * xMax + intercept],
  };
}

export function ScatterChart({
  data,
  height = 300,
  className,
  xAxisLabel,
  yAxisLabel,
  showTrendLine = false,
  enableBrush = false,
  symbolSize = 10,
}: ScatterChartProps) {
  const defaultColor = "#3b82f6";

  // Transform data for ECharts scatter series
  // If we have a value for bubble sizing, include it in the value array
  const seriesData = data.map((item) => {
    const point: {
      value: number[];
      name?: string;
      itemStyle?: { color: string };
    } = {
      value: item.value !== undefined ? [item.x, item.y, item.value] : [item.x, item.y],
    };
    if (item.label) point.name = item.label;
    if (item.color) point.itemStyle = { color: item.color };
    return point;
  });

  // Calculate trend line if enabled
  const trendLine = showTrendLine ? calculateTrendLine(data) : null;

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
          value: number[];
          data: { name?: string };
        };
        const x = p.value[0] ?? 0;
        const y = p.value[1] ?? 0;
        const extraValue = p.value.length > 2 ? p.value[2] : undefined;
        const label = p.data?.name;

        let html = `<div style="min-width: 140px;">`;

        if (label) {
          html += `<div style="font-weight: 600; margin-bottom: 8px;">${label}</div>`;
        }

        html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="color: var(--text-secondary);">${xAxisLabel || "X"}</span>
          <span style="font-weight: 600; color: ${defaultColor};">${formatValue(x)}</span>
        </div>`;

        html += `<div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--text-secondary);">${yAxisLabel || "Y"}</span>
          <span style="font-weight: 600; color: ${defaultColor};">${formatValue(y)}</span>
        </div>`;

        if (extraValue !== undefined) {
          html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.1));">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Value</span>
              <span style="font-weight: 600; color: #22c55e;">${formatValue(extraValue)}</span>
            </div>
          </div>`;
        }

        html += `</div>`;
        return html;
      },
    },
    grid: {
      left: yAxisLabel ? 60 : 50,
      right: 20,
      top: 20,
      bottom: xAxisLabel ? 50 : 40,
      containLabel: false,
    },
    xAxis: {
      type: "value",
      name: xAxisLabel,
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: {
        color: "var(--text-secondary)",
        fontSize: 12,
      },
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
      axisTick: {
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
    yAxis: {
      type: "value",
      name: yAxisLabel,
      nameLocation: "middle",
      nameGap: 40,
      nameTextStyle: {
        color: "var(--text-secondary)",
        fontSize: 12,
      },
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
      axisTick: {
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
    ...(enableBrush
      ? {
          brush: {
            toolbox: ["rect", "polygon", "clear"],
            xAxisIndex: 0,
            yAxisIndex: 0,
            brushLink: "all",
            outOfBrush: {
              colorAlpha: 0.1,
            },
            brushStyle: {
              borderWidth: 1,
              color: "rgba(59, 130, 246, 0.2)",
              borderColor: defaultColor,
            },
          },
          toolbox: {
            feature: {
              brush: {
                type: ["rect", "polygon", "clear"],
              },
            },
            right: 20,
            top: 0,
            iconStyle: {
              borderColor: "var(--text-secondary)",
            },
            emphasis: {
              iconStyle: {
                borderColor: defaultColor,
              },
            },
          },
          dataZoom: [
            {
              type: "inside",
              xAxisIndex: 0,
              filterMode: "none",
            },
            {
              type: "inside",
              yAxisIndex: 0,
              filterMode: "none",
            },
          ],
        }
      : {}),
    animation: true,
    animationDuration: 300,
    animationEasing: "cubicOut",
    series: [
      {
        type: "scatter" as const,
        data: seriesData as Array<{ value: number[] }>,
        symbolSize:
          typeof symbolSize === "function"
            ? ((value: unknown) => {
                // For bubble chart mode, pass [x, y, value] to the sizing function
                const arr = value as number[];
                const x = arr[0] ?? 0;
                const y = arr[1] ?? 0;
                const extraVal = arr[2] ?? y;
                return (symbolSize as (value: number[]) => number)([x, y, extraVal]);
              }) as ((value: unknown) => number)
            : symbolSize,
        itemStyle: {
          color: defaultColor,
          opacity: 0.8,
        },
        emphasis: {
          focus: "self" as const,
          itemStyle: {
            opacity: 1,
            shadowColor: `${defaultColor}80`,
            shadowBlur: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
        },
        markLine: trendLine
          ? {
              silent: true,
              symbol: ["none", "none"] as [string, string],
              lineStyle: {
                color: "var(--text-secondary)",
                type: "dashed" as const,
                width: 2,
                opacity: 0.6,
              },
              data: [
                [
                  { coord: trendLine.start },
                  { coord: trendLine.end },
                ],
              ],
              label: {
                show: true,
                position: "end" as const,
                formatter: "Trend",
                color: "var(--text-secondary)",
                fontSize: 11,
              },
            }
          : undefined,
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

export default ScatterChart;
