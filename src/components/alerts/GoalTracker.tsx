"use client";

import { memo } from "react";
import { cn } from "@/utils/cn";
import type { Goal } from "@/types";

// =============================================================================
// PROPS
// =============================================================================

export interface GoalTrackerProps {
  goal: Goal;
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
  on_track: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    border: "border-green-500/30",
    progressBg: "bg-green-500",
    label: "On Track",
  },
  at_risk: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    progressBg: "bg-yellow-500",
    label: "At Risk",
  },
  behind: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    progressBg: "bg-red-500",
    label: "Behind",
  },
  achieved: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    progressBg: "bg-blue-500",
    label: "Achieved",
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
 * Calculate days remaining until end date.
 */
function getDaysRemaining(endDateStr: string): number {
  const endDate = new Date(endDateStr);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format days remaining as a string.
 */
function formatDaysRemaining(days: number): string {
  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  }
  if (days === 0) {
    return "Due today";
  }
  if (days === 1) {
    return "1 day left";
  }
  return `${days} days left`;
}

// =============================================================================
// COMPONENT
// =============================================================================

function GoalTrackerComponent({ goal }: GoalTrackerProps) {
  const status = statusConfig[goal.status];
  const daysRemaining = getDaysRemaining(goal.endDate);
  const progressClamped = Math.min(Math.max(goal.progress, 0), 100);

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        "transition-all duration-200",
        "hover:ring-1 hover:ring-white/10"
      )}
      style={cardStyle}
    >
      {/* Header: Goal Name + Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={valueStyle}>
          {goal.name}
        </span>
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

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={labelStyle}>
            Progress
          </span>
          <span className="text-xs font-medium" style={valueStyle}>
            {progressClamped.toFixed(0)}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.1))" }}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              status.progressBg
            )}
            style={{ width: `${progressClamped}%` }}
          />
        </div>
      </div>

      {/* Values Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold" style={valueStyle}>
            {formatValue(goal.currentValue)}
          </span>
          <span className="text-sm" style={labelStyle}>
            / {formatValue(goal.targetValue)}
          </span>
        </div>
      </div>

      {/* Time Remaining */}
      <div
        className="text-xs pt-2 border-t border-white/5 flex items-center justify-between"
        style={labelStyle}
      >
        <span>
          {goal.status === "achieved" ? "Completed" : formatDaysRemaining(daysRemaining)}
        </span>
        {goal.status !== "achieved" && daysRemaining <= 7 && daysRemaining > 0 && (
          <span className="text-yellow-400 text-xs">
            Deadline approaching
          </span>
        )}
      </div>
    </div>
  );
}

export const GoalTracker = memo(GoalTrackerComponent);
export default GoalTracker;
