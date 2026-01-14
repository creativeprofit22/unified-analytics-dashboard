"use client";

import { memo } from "react";
import { cn } from "@/utils/cn";
import type { RecoveryByAttempt } from "@/types/analytics";

export interface RecoveryMetricsProps {
  recoveryByAttempt: RecoveryByAttempt;
  avgTimeToRecovery: number;
  overallRecoveryRate: number;
  className?: string;
}

// Static styles
const containerStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
};

const sectionBgStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))",
};

const textPrimaryStyle: React.CSSProperties = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const textSecondaryStyle: React.CSSProperties = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const successColor = "#10b981";

const progressBarBgStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.1)",
};

/**
 * Formats a percentage value for display.
 */
function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(1)}%`;
}

/**
 * Formats days for display.
 */
function formatDays(value: number): string {
  if (!Number.isFinite(value)) return "0 days";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${rounded === 1 ? "day" : "days"}`;
}

/**
 * RecoveryMetrics displays dunning/recovery performance metrics.
 * Shows overall recovery rate, average time to recovery, and recovery rates by attempt.
 */
function RecoveryMetricsComponent({
  recoveryByAttempt,
  avgTimeToRecovery,
  overallRecoveryRate,
  className,
}: RecoveryMetricsProps) {
  const attempts = [
    { label: "Attempt 1", value: recoveryByAttempt.attempt1 },
    { label: "Attempt 2", value: recoveryByAttempt.attempt2 },
    { label: "Attempt 3", value: recoveryByAttempt.attempt3 },
    { label: "Attempt 4", value: recoveryByAttempt.attempt4 },
  ];

  // Calculate cumulative recovery (sum of all attempts, capped at overall rate)
  const cumulativeRecovery = Math.min(
    attempts.reduce((sum, attempt) => sum + attempt.value, 0),
    overallRecoveryRate
  );

  return (
    <div
      className={cn("rounded-lg border p-5", className)}
      style={containerStyle}
    >
      {/* Header */}
      <h3 className="text-sm font-semibold mb-4" style={textPrimaryStyle}>
        Recovery Performance
      </h3>

      {/* Overall Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Recovery Rate */}
        <div className="rounded-lg p-4" style={sectionBgStyle}>
          <p className="text-xs mb-2" style={textSecondaryStyle}>
            Recovery Rate
          </p>
          <p
            className="text-3xl font-bold"
            style={{ color: successColor }}
          >
            {formatPercent(overallRecoveryRate)}
          </p>
          {/* Mini gauge indicator */}
          <div
            className="mt-3 h-2 rounded-full overflow-hidden"
            style={progressBarBgStyle}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(overallRecoveryRate, 100)}%`,
                backgroundColor: successColor,
              }}
            />
          </div>
        </div>

        {/* Avg Time to Recovery */}
        <div className="rounded-lg p-4" style={sectionBgStyle}>
          <p className="text-xs mb-2" style={textSecondaryStyle}>
            Avg Time to Recovery
          </p>
          <p className="text-3xl font-bold" style={textPrimaryStyle}>
            {formatDays(avgTimeToRecovery)}
          </p>
          <p className="text-xs mt-3" style={textSecondaryStyle}>
            From first failure
          </p>
        </div>
      </div>

      {/* Recovery by Attempt Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-medium" style={textSecondaryStyle}>
            Recovery by Attempt
          </h4>
          <span className="text-xs font-medium" style={{ color: successColor }}>
            Cumulative: {formatPercent(cumulativeRecovery)}
          </span>
        </div>

        {/* Attempt Bars */}
        <div className="space-y-3">
          {attempts.map((attempt, index) => (
            <div key={attempt.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={textSecondaryStyle}>
                  {attempt.label}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: attempt.value > 0 ? successColor : "var(--text-secondary)",
                  }}
                >
                  {formatPercent(attempt.value)}
                </span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden"
                style={progressBarBgStyle}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(attempt.value, 100)}%`,
                    backgroundColor: successColor,
                    // Decrease opacity for later attempts to show diminishing returns
                    opacity: 1 - index * 0.15,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Legend/note */}
        <p
          className="text-xs mt-4 italic"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.4))" }}
        >
          Recovery typically highest on first attempt, declining with subsequent retries.
        </p>
      </div>
    </div>
  );
}

export const RecoveryMetrics = memo(RecoveryMetricsComponent);

export default RecoveryMetrics;
