"use client";

import { memo } from "react";
import { cn } from "@/utils/cn";
import type { Anomaly, ThresholdAlert as ThresholdAlertType, Goal } from "@/types";
import { AnomalyCard } from "./AnomalyCard";
import { ThresholdAlert } from "./ThresholdAlert";
import { GoalTracker } from "./GoalTracker";

// =============================================================================
// PROPS
// =============================================================================

export interface AlertPanelProps {
  anomalies: Anomaly[];
  thresholdAlerts: ThresholdAlertType[];
  goals: Goal[];
  className?: string;
}

// =============================================================================
// STATIC STYLES
// =============================================================================

const sectionHeaderStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const emptyStateStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

// =============================================================================
// SECTION COMPONENT
// =============================================================================

interface SectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
  emptyMessage: string;
}

function Section({ title, count, children, emptyMessage }: SectionProps) {
  return (
    <div className="mb-6 last:mb-0">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={sectionHeaderStyle}>
          {title}
        </h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.1))",
            color: "var(--text-secondary, rgba(255,255,255,0.6))",
          }}
        >
          {count}
        </span>
      </div>

      {/* Content or Empty State */}
      {count > 0 ? (
        <div className="space-y-3">{children}</div>
      ) : (
        <div
          className="rounded-lg border p-6 text-center text-sm"
          style={emptyStateStyle}
        >
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

function AlertPanelComponent({
  anomalies,
  thresholdAlerts,
  goals,
  className,
}: AlertPanelProps) {
  // Count active/important items for each section
  const criticalAnomalies = anomalies.filter((a) => a.severity === "critical");
  const breachedAlerts = thresholdAlerts.filter((a) => a.status === "breached");

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Banner (if there are critical items) */}
      {(criticalAnomalies.length > 0 || breachedAlerts.length > 0) && (
        <div
          className="rounded-lg border p-4 flex items-center justify-between"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 0.3)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-medium text-red-400">
              {criticalAnomalies.length + breachedAlerts.length} critical alert
              {criticalAnomalies.length + breachedAlerts.length !== 1 ? "s" : ""} require
              attention
            </span>
          </div>
        </div>
      )}

      {/* Anomalies Section */}
      <Section
        title="Anomalies Detected"
        count={anomalies.length}
        emptyMessage="No anomalies detected. Your metrics are within normal ranges."
      >
        {anomalies.map((anomaly) => (
          <AnomalyCard key={anomaly.id} anomaly={anomaly} />
        ))}
      </Section>

      {/* Threshold Alerts Section */}
      <Section
        title="Threshold Alerts"
        count={thresholdAlerts.length}
        emptyMessage="No threshold alerts configured or triggered."
      >
        {thresholdAlerts.map((alert) => (
          <ThresholdAlert key={alert.id} alert={alert} />
        ))}
      </Section>

      {/* Goals Section */}
      <Section
        title="Goal Progress"
        count={goals.length}
        emptyMessage="No goals configured. Set up goals to track your progress."
      >
        {goals.map((goal) => (
          <GoalTracker key={goal.id} goal={goal} />
        ))}
      </Section>
    </div>
  );
}

export const AlertPanel = memo(AlertPanelComponent);
export default AlertPanel;
