"use client";

import { memo } from "react";
import { cn } from "@/utils/cn";
import type { Anomaly } from "@/types";

// =============================================================================
// PROPS
// =============================================================================

export interface AnomalyCardProps {
  anomaly: Anomaly;
}

// =============================================================================
// STATIC STYLES
// =============================================================================

const cardStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
};

const labelStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const valueStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

// =============================================================================
// SEVERITY CONFIG
// =============================================================================

const severityConfig = {
  critical: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    label: "Critical",
  },
  warning: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    label: "Warning",
  },
  info: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    label: "Info",
  },
} as const;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format a number for display.
 */
function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  if (value < 10) {
    return value.toFixed(1);
  }
  return value.toLocaleString();
}

/**
 * Format relative timestamp.
 */
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return `${diffDays}d ago`;
}

// =============================================================================
// MINI SPARKLINE COMPONENT
// =============================================================================

interface MiniSparklineProps {
  data: { date: string; value: number }[];
  color: string;
}

function MiniSparkline({ data, color }: MiniSparklineProps) {
  if (!data || data.length < 2) {
    return null;
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const width = 80;
  const height = 24;
  const padding = 2;

  const points = values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Highlight the last point (the anomaly) */}
      <circle
        cx={width - padding}
        cy={height - padding - ((values[values.length - 1]! - minVal) / range) * (height - padding * 2)}
        r="3"
        fill={color}
      />
    </svg>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

function AnomalyCardComponent({ anomaly }: AnomalyCardProps) {
  const severity = severityConfig[anomaly.severity];
  const directionArrow = anomaly.direction === "spike" ? "\u2191" : "\u2193";
  const directionLabel = anomaly.direction === "spike" ? "spike" : "drop";
  const deviationColor = anomaly.direction === "spike" ? "#22c55e" : "#ef4444";
  const sparklineColor = anomaly.direction === "spike" ? "#22c55e" : "#ef4444";

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        "transition-all duration-200",
        "hover:ring-1 hover:ring-white/10"
      )}
      style={cardStyle}
    >
      {/* Header: Severity Badge + Metric Name */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-xs font-medium border",
              severity.bg,
              severity.text,
              severity.border
            )}
          >
            {severity.label}
          </span>
          <span className="text-sm font-medium" style={valueStyle}>
            {anomaly.metricLabel}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor:
                anomaly.direction === "spike"
                  ? "rgba(34, 197, 94, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
              color: deviationColor,
            }}
          >
            {directionArrow} {directionLabel}
          </span>
        </div>
        <span className="text-xs" style={labelStyle}>
          {formatRelativeTime(anomaly.detectedAt)}
        </span>
      </div>

      {/* Values Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs mb-1" style={labelStyle}>
              Current
            </div>
            <div className="text-lg font-semibold" style={valueStyle}>
              {formatValue(anomaly.value)}
            </div>
          </div>
          <div className="text-lg" style={labelStyle}>
            vs
          </div>
          <div>
            <div className="text-xs mb-1" style={labelStyle}>
              Expected
            </div>
            <div className="text-lg font-medium" style={labelStyle}>
              {formatValue(anomaly.expectedValue)}
            </div>
          </div>
        </div>

        {/* Deviation */}
        <div className="text-right">
          <div className="text-xs mb-1" style={labelStyle}>
            Deviation
          </div>
          <div
            className="text-lg font-semibold"
            style={{ color: deviationColor }}
          >
            {anomaly.deviation > 0 ? "+" : ""}
            {anomaly.deviation.toFixed(1)}&sigma;
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-xs" style={labelStyle}>
          7-day trend
        </span>
        <MiniSparkline data={anomaly.trend} color={sparklineColor} />
      </div>
    </div>
  );
}

export const AnomalyCard = memo(AnomalyCardComponent);
export default AnomalyCard;
