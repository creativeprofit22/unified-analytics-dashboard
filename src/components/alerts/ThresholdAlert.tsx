"use client";

import { memo } from "react";
import { cn } from "@/utils/cn";
import type { ThresholdAlert as ThresholdAlertType } from "@/types";

// =============================================================================
// PROPS
// =============================================================================

export interface ThresholdAlertProps {
  alert: ThresholdAlertType;
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
// STATUS CONFIG
// =============================================================================

const statusConfig = {
  breached: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
    label: "Breached",
  },
  warning: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    dot: "bg-yellow-500",
    label: "Warning",
  },
  normal: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    border: "border-green-500/30",
    dot: "bg-green-500",
    label: "Normal",
  },
} as const;

type ThresholdStatus = keyof typeof statusConfig;

function getStatusConfig(status: string) {
  if (status in statusConfig) {
    return statusConfig[status as ThresholdStatus];
  }
  return statusConfig.normal; // Fallback to normal for unknown status
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format a number for display.
 */
function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  if (value < 10) {
    return value.toFixed(1);
  }
  return value.toLocaleString();
}

/**
 * Format a threshold value with operator.
 */
function formatThreshold(operator: string, value: number): string {
  const opSymbols: Record<string, string> = {
    gt: ">",
    lt: "<",
    gte: "\u2265",
    lte: "\u2264",
  };
  return `${opSymbols[operator] || operator} ${formatValue(value)}`;
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
// COMPONENT
// =============================================================================

function ThresholdAlertComponent({ alert }: ThresholdAlertProps) {
  const status = getStatusConfig(alert.status);

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        "transition-all duration-200",
        "hover:ring-1 hover:ring-white/10"
      )}
      style={cardStyle}
    >
      {/* Header: Status Indicator + Rule Name */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Animated status dot */}
          <span className="relative flex h-2.5 w-2.5">
            {alert.status === "breached" && (
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  status.dot
                )}
              />
            )}
            <span
              className={cn("relative inline-flex rounded-full h-2.5 w-2.5", status.dot)}
            />
          </span>
          <span className="text-sm font-medium" style={valueStyle}>
            {alert.rule.name}
          </span>
        </div>
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium border",
            status.bg,
            status.text,
            status.border
          )}
        >
          {status.label}
        </span>
      </div>

      {/* Values Row */}
      <div className="flex items-center gap-4 mb-3">
        <div>
          <div className="text-xs mb-1" style={labelStyle}>
            Current
          </div>
          <div
            className="text-lg font-semibold"
            style={{
              color:
                alert.status === "breached"
                  ? "#ef4444"
                  : alert.status === "warning"
                  ? "#eab308"
                  : "var(--text-primary)",
            }}
          >
            {formatValue(alert.currentValue)}
          </div>
        </div>
        <div className="text-lg" style={labelStyle}>
          vs
        </div>
        <div>
          <div className="text-xs mb-1" style={labelStyle}>
            Threshold
          </div>
          <div className="text-lg font-medium" style={labelStyle}>
            {formatThreshold(alert.rule.operator, alert.rule.value)}
          </div>
        </div>
      </div>

      {/* Message */}
      <div
        className="text-sm leading-relaxed mb-2"
        style={labelStyle}
      >
        {alert.message}
      </div>

      {/* Breached timestamp if applicable */}
      {alert.breachedAt && (
        <div
          className="text-xs pt-2 border-t border-white/5"
          style={labelStyle}
        >
          Breached {formatRelativeTime(alert.breachedAt)}
        </div>
      )}
    </div>
  );
}

export const ThresholdAlert = memo(ThresholdAlertComponent);
export default ThresholdAlert;
