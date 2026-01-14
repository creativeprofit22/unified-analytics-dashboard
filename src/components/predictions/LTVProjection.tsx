"use client";

import { memo, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { LTVProjection as LTVProjectionType, LTVImpactDirection } from "@/types";
import { cn } from "@/utils/cn";

// =============================================================================
// PROPS
// =============================================================================

export interface LTVProjectionProps {
  projection: LTVProjectionType;
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

function getImpactColor(impact: LTVImpactDirection): string {
  return impact === "positive" ? "#22c55e" : "#ef4444";
}

function getImpactIcon(impact: LTVImpactDirection): string {
  return impact === "positive" ? "\u2191" : "\u2193";
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface LTVCardProps {
  label: string;
  value: number;
  sublabel?: string;
  color: string;
}

function LTVCard({ label, value, sublabel, color }: LTVCardProps) {
  return (
    <div
      className="rounded-lg p-4 text-center"
      style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))" }}
    >
      <p
        className="text-xs mb-1"
        style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
      >
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color }}>
        {formatCurrency(value)}
      </p>
      {sublabel && (
        <p
          className="text-xs mt-1"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.5))" }}
        >
          {sublabel}
        </p>
      )}
    </div>
  );
}

interface FactorItemProps {
  factor: {
    factor: string;
    impact: LTVImpactDirection;
    weight: number;
  };
}

function FactorItem({ factor }: FactorItemProps) {
  const impactColor = getImpactColor(factor.impact);
  const impactIcon = getImpactIcon(factor.impact);

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg"
      style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))" }}
    >
      <span
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium"
        style={{
          backgroundColor: `${impactColor}20`,
          color: impactColor,
        }}
      >
        {impactIcon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
          >
            {factor.factor}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: impactColor }}
          >
            {factor.impact === "positive" ? "+" : "-"}{factor.weight}%
          </span>
        </div>
        <p
          className="text-xs"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.5))" }}
        >
          {factor.impact === "positive" ? "Increases" : "Decreases"} projected LTV
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function LTVProjectionComponent({ projection, className }: LTVProjectionProps) {
  const {
    averageLTV,
    projectedLTV12m,
    projectedLTV24m,
    bySegment,
    projectionCurve,
    factors,
  } = projection;

  // Calculate change percentage
  const changePercent12m = ((projectedLTV12m - averageLTV) / averageLTV) * 100;
  const isPositiveChange = changePercent12m >= 0;

  // Projection curve chart option
  const curveOption: EChartsOption = useMemo(
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
          const p = Array.isArray(params) ? params[0] : params;
          const typedP = p as { axisValue: number; value: number; dataIndex: number };
          const point = projectionCurve[typedP.dataIndex];
          return `<div style="min-width: 140px;">
            <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">Month ${typedP.axisValue}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">LTV</span>
              <span style="font-weight: 600; color: #8b5cf6;">${formatCurrency(typedP.value)}</span>
            </div>
            ${point?.confidence ? `<div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Confidence</span>
              <span style="font-weight: 500;">${point.confidence}%</span>
            </div>` : ""}
          </div>`;
        },
      },
      grid: {
        left: 50,
        right: 20,
        top: 20,
        bottom: 30,
      },
      xAxis: {
        type: "category",
        data: projectionCurve.map((d) => d.month),
        axisLabel: {
          color: "var(--text-secondary)",
          fontSize: 11,
          formatter: (value: string | number) => `M${value}`,
        },
        axisLine: {
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
      series: [
        {
          type: "line",
          data: projectionCurve.map((d) => d.projectedLTV),
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          showSymbol: false,
          lineStyle: {
            color: "#8b5cf6",
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
                { offset: 0, color: "rgba(139, 92, 246, 0.3)" },
                { offset: 1, color: "rgba(139, 92, 246, 0.02)" },
              ],
            },
          },
          emphasis: {
            disabled: false,
            focus: "series",
            itemStyle: {
              color: "var(--bg-primary, #1f2937)",
              borderColor: "#8b5cf6",
              borderWidth: 3,
              shadowColor: "rgba(139, 92, 246, 0.5)",
              shadowBlur: 8,
            },
          },
        },
      ],
    }),
    [projectionCurve]
  );

  // Segment breakdown bar chart option
  const segmentOption: EChartsOption = useMemo(
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
        axisPointer: {
          type: "shadow",
        },
        formatter: (params: unknown) => {
          const p = Array.isArray(params) ? params[0] : params;
          const typedP = p as { name: string; value: number; dataIndex: number };
          const segment = bySegment[typedP.dataIndex];
          return `<div style="min-width: 160px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${typedP.name}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">Current LTV</span>
              <span style="font-weight: 600;">${formatCurrency(segment?.currentLTV ?? 0)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">Projected LTV</span>
              <span style="font-weight: 600; color: #8b5cf6;">${formatCurrency(typedP.value)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">Customers</span>
              <span style="font-weight: 500;">${segment?.customerCount.toLocaleString() ?? 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Growth</span>
              <span style="font-weight: 500; color: ${(segment?.growthRate ?? 0) >= 0 ? '#22c55e' : '#ef4444'};">
                ${(segment?.growthRate ?? 0) >= 0 ? '+' : ''}${segment?.growthRate.toFixed(1) ?? 0}%
              </span>
            </div>
          </div>`;
        },
      },
      grid: {
        left: 80,
        right: 20,
        top: 10,
        bottom: 20,
      },
      xAxis: {
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
      yAxis: {
        type: "category",
        data: bySegment.map((s) => s.segment),
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
      },
      animation: true,
      animationDuration: 400,
      series: [
        {
          type: "bar",
          data: bySegment.map((s, i) => ({
            value: s.projectedLTV,
            itemStyle: {
              color: [
                "#8b5cf6",
                "#a78bfa",
                "#c4b5fd",
                "#ddd6fe",
                "#ede9fe",
              ][i % 5],
              borderRadius: [0, 4, 4, 0],
            },
          })),
          barMaxWidth: 24,
          emphasis: {
            disabled: false,
            itemStyle: {
              shadowColor: "rgba(0, 0, 0, 0.2)",
              shadowBlur: 8,
            },
          },
        },
      ],
    }),
    [bySegment]
  );

  return (
    <div
      className={cn("rounded-lg border", className)}
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
      >
        <h4
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          LTV Projections
        </h4>
      </div>

      <div className="p-4 space-y-6">
        {/* Current vs Projected LTV Cards */}
        <div className="grid grid-cols-4 gap-4">
          <LTVCard
            label="Current Avg LTV"
            value={averageLTV}
            sublabel="All customers"
            color="var(--text-primary, rgba(255,255,255,0.95))"
          />
          <LTVCard
            label="12-Month Projected"
            value={projectedLTV12m}
            sublabel="Expected in 12mo"
            color="#8b5cf6"
          />
          <LTVCard
            label="24-Month Projected"
            value={projectedLTV24m}
            sublabel="Expected in 24mo"
            color="#a78bfa"
          />
          <div
            className="rounded-lg p-4 text-center"
            style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))" }}
          >
            <p
              className="text-xs mb-1"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
            >
              12mo Growth
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: isPositiveChange ? "#22c55e" : "#ef4444" }}
            >
              {isPositiveChange ? "+" : ""}
              {changePercent12m.toFixed(1)}%
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.5))" }}
            >
              {isPositiveChange ? "Growth" : "Decline"} expected
            </p>
          </div>
        </div>

        {/* Projection Curve Chart */}
        <div>
          <h5
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            LTV Projection Over Time
          </h5>
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.02))" }}
          >
            <ReactECharts
              option={curveOption}
              style={{ height: 200, width: "100%" }}
              opts={{ renderer: "svg" }}
            />
          </div>
        </div>

        {/* Segment Breakdown */}
        <div>
          <h5
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            LTV by Customer Segment
          </h5>
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.02))" }}
          >
            <ReactECharts
              option={segmentOption}
              style={{ height: 180, width: "100%" }}
              opts={{ renderer: "svg" }}
            />
          </div>
        </div>

        {/* Contributing Factors */}
        <div>
          <h5
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            Contributing Factors
          </h5>
          <div className="space-y-2">
            {factors.map((factor, i) => (
              <FactorItem key={i} factor={factor} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const LTVProjection = memo(LTVProjectionComponent);
export default LTVProjection;
