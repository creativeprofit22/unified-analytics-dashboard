"use client";

import { memo, useMemo, useState, useCallback } from "react";
import { cn } from "@/utils/cn";
import type { ABTestData, ExperimentStatus } from "@/types/abtest";
import { ExperimentCard } from "./ExperimentCard";

// =============================================================================
// TYPES
// =============================================================================

export interface ABTestPanelProps {
  data: ABTestData;
  className?: string;
}

type FilterTab = "all" | ExperimentStatus;

// =============================================================================
// CONSTANTS
// =============================================================================

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
  { value: "draft", label: "Draft" },
];

// =============================================================================
// STATIC STYLES
// =============================================================================

const headerStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const subheaderStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const cardBgStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
};

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

function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SummaryCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
}

const SummaryCard = memo(function SummaryCard({
  label,
  value,
  valueColor,
}: SummaryCardProps) {
  return (
    <div className="rounded-lg p-4" style={cardBgStyle}>
      <p className="text-xs mb-1" style={subheaderStyle}>
        {label}
      </p>
      <p
        className="text-xl font-semibold"
        style={{ color: valueColor || "var(--text-primary, rgba(255,255,255,0.95))" }}
      >
        {value}
      </p>
    </div>
  );
});

interface SummaryCardsProps {
  summary: ABTestData["summary"];
}

const SummaryCards = memo(function SummaryCards({ summary }: SummaryCardsProps) {
  const liftColor = summary.averageWinningLift >= 0 ? "#22c55e" : "#ef4444";
  const revenueColor = summary.totalRevenueImpact >= 0 ? "#22c55e" : "#ef4444";

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <SummaryCard label="Total Experiments" value={summary.totalExperiments} />
      <SummaryCard
        label="Running"
        value={summary.runningExperiments}
        valueColor="#3b82f6"
      />
      <SummaryCard
        label="Completed"
        value={summary.completedExperiments}
        valueColor="#22c55e"
      />
      <SummaryCard
        label="Avg Lift"
        value={formatPercent(summary.averageWinningLift)}
        valueColor={liftColor}
      />
      <SummaryCard
        label="Revenue Impact"
        value={formatCurrency(summary.totalRevenueImpact)}
        valueColor={revenueColor}
      />
    </div>
  );
});

interface FilterTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  counts: Record<FilterTab, number>;
}

const FilterTabs = memo(function FilterTabs({
  activeTab,
  onTabChange,
  counts,
}: FilterTabsProps) {
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg mb-4"
      style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))" }}
    >
      {FILTER_TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        const count = counts[tab.value];

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
              "flex items-center gap-1.5"
            )}
            style={{
              backgroundColor: isActive
                ? "var(--bg-secondary, rgba(255,255,255,0.1))"
                : "transparent",
              color: isActive
                ? "var(--text-primary, rgba(255,255,255,0.95))"
                : "var(--text-secondary, rgba(255,255,255,0.6))",
            }}
          >
            {tab.label}
            <span
              className="px-1.5 py-0.5 rounded text-xs"
              style={{
                backgroundColor: isActive
                  ? "var(--bg-tertiary, rgba(255,255,255,0.1))"
                  : "transparent",
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ABTestPanelComponent({ data, className }: ABTestPanelProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const handleTabChange = useCallback((tab: FilterTab) => {
    setActiveTab(tab);
  }, []);

  // Calculate counts for each filter
  const counts = useMemo(() => {
    const result: Record<FilterTab, number> = {
      all: data.experiments.length,
      running: 0,
      completed: 0,
      paused: 0,
      draft: 0,
    };

    data.experiments.forEach((exp) => {
      result[exp.status]++;
    });

    return result;
  }, [data.experiments]);

  // Filter experiments based on active tab
  const filteredExperiments = useMemo(() => {
    if (activeTab === "all") {
      return data.experiments;
    }
    return data.experiments.filter((exp) => exp.status === activeTab);
  }, [data.experiments, activeTab]);

  // Early return if no data
  if (data.experiments.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <div>
          <h2 className="text-xl font-semibold" style={headerStyle}>
            A/B Test Experiments
          </h2>
          <p className="text-sm mt-1" style={subheaderStyle}>
            No experiments available
          </p>
        </div>
        <div
          className="rounded-lg border p-8 text-center"
          style={{
            backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
            borderColor: "var(--border-color, rgba(255,255,255,0.1))",
          }}
        >
          <p style={subheaderStyle}>
            No A/B test experiments found. Create your first experiment to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold" style={headerStyle}>
          A/B Test Experiments
        </h2>
        <p className="text-sm mt-1" style={subheaderStyle}>
          Monitor and analyze your experiment results
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={data.summary} />

      {/* Filter Tabs */}
      <FilterTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
      />

      {/* Experiments List */}
      <div className="space-y-4">
        {filteredExperiments.length > 0 ? (
          filteredExperiments.map((experiment) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))
        ) : (
          <div
            className="rounded-lg border p-6 text-center"
            style={{
              backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
              borderColor: "var(--border-color, rgba(255,255,255,0.1))",
            }}
          >
            <p style={subheaderStyle}>
              No {activeTab} experiments found.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div
        className="flex items-center justify-between pt-4 border-t"
        style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
      >
        <span className="text-xs" style={subheaderStyle}>
          Showing {filteredExperiments.length} of {data.experiments.length} experiments
        </span>
        <span className="text-xs" style={subheaderStyle}>
          Last updated: {new Date(data.generatedAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export const ABTestPanel = memo(ABTestPanelComponent);
export default ABTestPanel;
