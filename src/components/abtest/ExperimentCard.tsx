"use client";

import { memo, useState, useCallback } from "react";
import { cn } from "@/utils/cn";
import type { Experiment, ExperimentStatus } from "@/types/abtest";
import { VariantComparison } from "./VariantComparison";

// =============================================================================
// TYPES
// =============================================================================

export interface ExperimentCardProps {
  experiment: Experiment;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STATUS_COLORS: Record<ExperimentStatus, string> = {
  running: "#3b82f6",
  completed: "#22c55e",
  paused: "#f59e0b",
  draft: "#6b7280",
};

const STATUS_LABELS: Record<ExperimentStatus, string> = {
  running: "Running",
  completed: "Completed",
  paused: "Paused",
  draft: "Draft",
};

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
// UTILITIES
// =============================================================================

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatLift(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface StatusBadgeProps {
  status: ExperimentStatus;
}

const StatusBadge = memo(function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-medium"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
});

interface ConversionComparisonProps {
  experiment: Experiment;
}

const ConversionComparison = memo(function ConversionComparison({
  experiment,
}: ConversionComparisonProps) {
  const controlMetrics = experiment.variantMetrics.find(
    (m) => m.variantId === experiment.comparison.controlId
  );
  const treatmentMetrics = experiment.variantMetrics.find(
    (m) => m.variantId === experiment.comparison.treatmentId
  );

  if (!controlMetrics || !treatmentMetrics) {
    return null;
  }

  const controlVariant = experiment.variants.find((v) => v.isControl);
  const treatmentVariant = experiment.variants.find((v) => !v.isControl);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Control (Variant A) */}
      <div
        className="rounded-lg p-3"
        style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2 h-2 rounded"
            style={{ backgroundColor: "#6b7280" }}
          />
          <span className="text-xs font-medium" style={labelStyle}>
            {controlVariant?.name || "Control"}
          </span>
        </div>
        <div className="text-lg font-semibold" style={valueStyle}>
          {formatPercent(controlMetrics.conversionRate)}
        </div>
        <div className="text-xs" style={labelStyle}>
          {controlMetrics.conversions.toLocaleString()} / {controlMetrics.visitors.toLocaleString()}
        </div>
      </div>

      {/* Treatment (Variant B) */}
      <div
        className="rounded-lg p-3"
        style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2 h-2 rounded"
            style={{ backgroundColor: "#3b82f6" }}
          />
          <span className="text-xs font-medium" style={labelStyle}>
            {treatmentVariant?.name || "Treatment"}
          </span>
        </div>
        <div className="text-lg font-semibold" style={valueStyle}>
          {formatPercent(treatmentMetrics.conversionRate)}
        </div>
        <div className="text-xs" style={labelStyle}>
          {treatmentMetrics.conversions.toLocaleString()} / {treatmentMetrics.visitors.toLocaleString()}
        </div>
      </div>
    </div>
  );
});

interface LiftIndicatorProps {
  lift: number;
  isSignificant: boolean;
}

const LiftIndicator = memo(function LiftIndicator({
  lift,
  isSignificant,
}: LiftIndicatorProps) {
  let color: string;
  if (!isSignificant) {
    color = "#6b7280";
  } else if (lift >= 0) {
    color = "#22c55e";
  } else {
    color = "#ef4444";
  }

  return (
    <div className="flex items-center gap-2">
      <div>
        <div className="text-xs mb-1" style={labelStyle}>
          Lift
        </div>
        <div className="text-xl font-semibold" style={{ color }}>
          {formatLift(lift)}
        </div>
      </div>
      {isSignificant ? (
        <span
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            color: "#22c55e",
          }}
        >
          Significant
        </span>
      ) : (
        <span
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: "rgba(107, 114, 128, 0.2)",
            color: "#6b7280",
          }}
        >
          Not Significant
        </span>
      )}
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ExperimentCardComponent({
  experiment,
  className,
}: ExperimentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const { comparison } = experiment;
  const isSignificant = comparison.conversionSignificance.isSignificant;

  return (
    <div
      className={cn(
        "rounded-lg border",
        "transition-all duration-200",
        "hover:ring-1 hover:ring-white/10",
        className
      )}
      style={cardStyle}
    >
      {/* Main Card Content */}
      <button
        type="button"
        className="w-full p-4 text-left cursor-pointer"
        onClick={handleToggleExpand}
        aria-expanded={isExpanded}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={experiment.status} />
              <span className="text-xs" style={labelStyle}>
                {formatDate(experiment.startedAt)}
              </span>
            </div>
            <h4 className="text-sm font-semibold" style={valueStyle}>
              {experiment.name}
            </h4>
            <p className="text-xs mt-0.5" style={labelStyle}>
              {experiment.targetPage}
            </p>
          </div>
          <LiftIndicator lift={comparison.relativeLift} isSignificant={isSignificant} />
        </div>

        {/* Conversion Rates Comparison */}
        <ConversionComparison experiment={experiment} />

        {/* Expand Indicator */}
        <div
          className="flex items-center justify-center mt-3 pt-3 border-t"
          style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
        >
          <span className="text-xs" style={labelStyle}>
            {isExpanded ? "Hide details" : "Show details"}
          </span>
          <svg
            className={cn(
              "w-4 h-4 ml-1 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
            style={{ color: "var(--text-secondary)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div
          className="px-4 pb-4 border-t"
          style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
        >
          <VariantComparison experiment={experiment} height={280} className="mt-4" />
        </div>
      )}
    </div>
  );
}

export const ExperimentCard = memo(ExperimentCardComponent);
export default ExperimentCard;
