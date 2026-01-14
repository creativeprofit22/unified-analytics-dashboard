"use client";

import { memo, useState, useCallback } from "react";
import type { PredictionsData } from "@/types";
import { ForecastChart } from "./ForecastChart";
import { ChurnRiskTable } from "./ChurnRiskTable";
import { LTVProjection } from "./LTVProjection";
import { cn } from "@/utils/cn";

// =============================================================================
// PROPS
// =============================================================================

export interface PredictionsPanelProps {
  data: PredictionsData;
  className?: string;
}

// =============================================================================
// TYPES
// =============================================================================

type TabId = "forecast" | "churn" | "ltv";

interface TabConfig {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: "forecast", label: "Revenue Forecast", icon: "\uD83D\uDCC8" },
  { id: "churn", label: "Churn Risk", icon: "\u26A0\uFE0F" },
  { id: "ltv", label: "LTV Projections", icon: "\uD83D\uDCB0" },
];

// =============================================================================
// UTILITIES
// =============================================================================

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface TabButtonProps {
  tab: TabConfig;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ tab, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all",
        isActive
          ? "bg-[var(--bg-tertiary,rgba(255,255,255,0.1))]"
          : "hover:bg-[var(--bg-tertiary,rgba(255,255,255,0.05))]"
      )}
      style={{
        color: isActive
          ? "var(--text-primary, rgba(255,255,255,0.95))"
          : "var(--text-secondary, rgba(255,255,255,0.6))",
        borderBottom: isActive
          ? "2px solid var(--accent-color, #8b5cf6)"
          : "2px solid transparent",
      }}
    >
      <span className="text-base">{tab.icon}</span>
      <span>{tab.label}</span>
    </button>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-tertiary,rgba(255,255,255,0.03))] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
          >
            {title}
          </span>
        </div>
        <span
          className="text-sm transition-transform"
          style={{
            color: "var(--text-secondary)",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          \u25BC
        </span>
      </button>
      {isExpanded && (
        <div
          className="border-t"
          style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function PredictionsPanelComponent({ data, className }: PredictionsPanelProps) {
  const { revenueForecast, churnPrediction, ltvProjection, generatedAt } = data;

  // State for view mode (tabs vs collapsible)
  const [viewMode, setViewMode] = useState<"tabs" | "collapsible">("tabs");
  const [activeTab, setActiveTab] = useState<TabId>("forecast");
  const [expandedSections, setExpandedSections] = useState<Set<TabId>>(
    new Set(["forecast", "churn", "ltv"])
  );

  const toggleSection = useCallback((id: TabId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const renderContent = useCallback(
    (tabId: TabId) => {
      switch (tabId) {
        case "forecast":
          return <ForecastChart forecast={revenueForecast} />;
        case "churn":
          return <ChurnRiskTable prediction={churnPrediction} />;
        case "ltv":
          return <LTVProjection projection={ltvProjection} />;
        default:
          return null;
      }
    },
    [revenueForecast, churnPrediction, ltvProjection]
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
          >
            Predictive Analytics
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            AI-powered forecasts and risk analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div
            className="flex items-center rounded-lg p-1"
            style={{ backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))" }}
          >
            <button
              onClick={() => setViewMode("tabs")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                viewMode === "tabs"
                  ? "bg-[var(--bg-tertiary,rgba(255,255,255,0.1))]"
                  : ""
              )}
              style={{
                color:
                  viewMode === "tabs"
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              Tabs
            </button>
            <button
              onClick={() => setViewMode("collapsible")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                viewMode === "collapsible"
                  ? "bg-[var(--bg-tertiary,rgba(255,255,255,0.1))]"
                  : ""
              )}
              style={{
                color:
                  viewMode === "collapsible"
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              Expand All
            </button>
          </div>

          {/* Last Generated Timestamp */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
            style={{
              backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
              color: "var(--text-secondary, rgba(255,255,255,0.6))",
            }}
          >
            <span>\u23F1</span>
            <span>Last generated: {formatTimestamp(generatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === "tabs" ? (
        <>
          {/* Tab Navigation */}
          <div
            className="flex items-center gap-1 p-1 rounded-lg"
            style={{ backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))" }}
          >
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* Active Tab Content */}
          <div>{renderContent(activeTab)}</div>
        </>
      ) : (
        /* Collapsible Sections */
        <div className="space-y-4">
          {TABS.map((tab) => (
            <CollapsibleSection
              key={tab.id}
              title={tab.label}
              icon={tab.icon}
              isExpanded={expandedSections.has(tab.id)}
              onToggle={() => toggleSection(tab.id)}
            >
              <div className="p-4">{renderContent(tab.id)}</div>
            </CollapsibleSection>
          ))}
        </div>
      )}
    </div>
  );
}

export const PredictionsPanel = memo(PredictionsPanelComponent);
export default PredictionsPanel;
