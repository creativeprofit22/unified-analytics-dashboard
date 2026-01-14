"use client";

import { memo, useState, useMemo, useCallback } from "react";
import type { ChurnPrediction, AtRiskCustomer, ChurnRiskLevel } from "@/types";
import { cn } from "@/utils/cn";

// =============================================================================
// PROPS
// =============================================================================

export interface ChurnRiskTableProps {
  prediction: ChurnPrediction;
  className?: string;
}

// =============================================================================
// TYPES
// =============================================================================

type FilterLevel = ChurnRiskLevel | "all";
type SortField = "riskScore" | "mrr" | "daysSinceActivity";
type SortDirection = "asc" | "desc";

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

function getRiskLevelColor(level: ChurnRiskLevel): { bg: string; text: string; border: string } {
  switch (level) {
    case "high":
      return {
        bg: "rgba(239, 68, 68, 0.15)",
        text: "#ef4444",
        border: "rgba(239, 68, 68, 0.3)",
      };
    case "medium":
      return {
        bg: "rgba(234, 179, 8, 0.15)",
        text: "#eab308",
        border: "rgba(234, 179, 8, 0.3)",
      };
    case "low":
      return {
        bg: "rgba(59, 130, 246, 0.15)",
        text: "#3b82f6",
        border: "rgba(59, 130, 246, 0.3)",
      };
  }
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface RiskBadgeProps {
  level: ChurnRiskLevel;
  score: number;
}

function RiskBadge({ level, score }: RiskBadgeProps) {
  const colors = getRiskLevelColor(level);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: colors.text }}
      />
      {level} ({score})
    </span>
  );
}

interface FilterButtonProps {
  label: string;
  value: FilterLevel;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function FilterButton({ label, value, count, isActive, onClick }: FilterButtonProps) {
  const colors = value === "all"
    ? { bg: "rgba(255, 255, 255, 0.05)", text: "var(--text-secondary)", border: "rgba(255, 255, 255, 0.1)" }
    : getRiskLevelColor(value);
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        isActive && "ring-1"
      )}
      style={{
        backgroundColor: isActive ? colors.bg : "transparent",
        color: isActive ? colors.text : "var(--text-secondary)",
        borderColor: isActive ? colors.border : "transparent",
        // Ring color controlled via Tailwind's ring-1 class
        "--tw-ring-color": isActive ? colors.border : "transparent",
      } as React.CSSProperties}
    >
      {label} ({count})
    </button>
  );
}

interface SortHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}

function SortHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
  align = "left",
}: SortHeaderProps) {
  const isActive = currentField === field;
  return (
    <th
      className={cn(
        "py-2 pr-4 cursor-pointer hover:opacity-80 transition-opacity",
        align === "right" && "text-right"
      )}
      style={{ color: "var(--text-secondary)" }}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-xs">{direction === "asc" ? "\u2191" : "\u2193"}</span>
        )}
      </span>
    </th>
  );
}

interface ExpandableRiskFactorsProps {
  factors: Array<{ factor: string; impact: number; description: string }>;
}

function ExpandableRiskFactors({ factors }: ExpandableRiskFactorsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (factors.length === 0) {
    return (
      <span style={{ color: "var(--text-secondary)" }}>No factors identified</span>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs hover:opacity-80 transition-opacity flex items-center gap-1"
        style={{ color: "var(--text-secondary)" }}
      >
        <span>{factors.length} factor{factors.length !== 1 ? "s" : ""}</span>
        <span className="text-xs">{isExpanded ? "\u25B2" : "\u25BC"}</span>
      </button>
      {isExpanded && (
        <ul className="mt-2 space-y-1">
          {factors.map((factor, i) => (
            <li
              key={i}
              className="text-xs flex items-start gap-2"
              style={{ color: "var(--text-secondary)" }}
            >
              <span style={{ color: "#ef4444" }}>!</span>
              <span>
                {factor.factor}
                <span className="ml-1 opacity-60">({factor.impact}%)</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ChurnRiskTableComponent({ prediction, className }: ChurnRiskTableProps) {
  const { customers, totalAtRisk, revenueAtRisk, byRiskLevel, modelAccuracy } = prediction;

  // State
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [sortField, setSortField] = useState<SortField>("riskScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Compute counts by risk level
  const counts = useMemo(() => {
    return {
      all: customers.length,
      high: byRiskLevel.high,
      medium: byRiskLevel.medium,
      low: byRiskLevel.low,
    };
  }, [customers.length, byRiskLevel]);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Apply filter
    if (filterLevel !== "all") {
      result = result.filter((c) => c.riskLevel === filterLevel);
    }

    // Apply sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "riskScore":
          comparison = a.riskScore - b.riskScore;
          break;
        case "mrr":
          comparison = a.mrr - b.mrr;
          break;
        case "daysSinceActivity":
          comparison = a.daysSinceActivity - b.daysSinceActivity;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [customers, filterLevel, sortField, sortDirection]);

  // Handle sort click
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("desc");
      }
    },
    [sortField]
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
      <div className="p-4 border-b" style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}>
        <div className="flex items-center justify-between mb-4">
          <h4
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            Churn Risk Analysis
          </h4>
          {modelAccuracy && (
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))",
                color: "var(--text-secondary)",
              }}
            >
              Model accuracy: {modelAccuracy}%
            </span>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))" }}
          >
            <p
              className="text-xs mb-1"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
            >
              Total at Risk
            </p>
            <p
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
            >
              {totalAtRisk}
            </p>
          </div>
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          >
            <p className="text-xs mb-1" style={{ color: "#ef4444" }}>
              High Risk
            </p>
            <p className="text-lg font-semibold" style={{ color: "#ef4444" }}>
              {byRiskLevel.high}
            </p>
          </div>
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "rgba(234, 179, 8, 0.1)" }}
          >
            <p className="text-xs mb-1" style={{ color: "#eab308" }}>
              Medium Risk
            </p>
            <p className="text-lg font-semibold" style={{ color: "#eab308" }}>
              {byRiskLevel.medium}
            </p>
          </div>
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
          >
            <p className="text-xs mb-1" style={{ color: "#3b82f6" }}>
              Low Risk
            </p>
            <p className="text-lg font-semibold" style={{ color: "#3b82f6" }}>
              {byRiskLevel.low}
            </p>
          </div>
        </div>

        {/* Revenue at Risk */}
        <div
          className="rounded-lg p-3 flex items-center justify-between"
          style={{ backgroundColor: "rgba(239, 68, 68, 0.05)" }}
        >
          <span
            className="text-sm"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            Monthly Revenue at Risk
          </span>
          <span className="text-lg font-semibold" style={{ color: "#ef4444" }}>
            {formatCurrency(revenueAtRisk)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
      >
        <span
          className="text-xs mr-2"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Filter:
        </span>
        <FilterButton
          label="All"
          value="all"
          count={counts.all}
          isActive={filterLevel === "all"}
          onClick={() => setFilterLevel("all")}
        />
        <FilterButton
          label="High"
          value="high"
          count={counts.high}
          isActive={filterLevel === "high"}
          onClick={() => setFilterLevel("high")}
        />
        <FilterButton
          label="Medium"
          value="medium"
          count={counts.medium}
          isActive={filterLevel === "medium"}
          onClick={() => setFilterLevel("medium")}
        />
        <FilterButton
          label="Low"
          value="low"
          count={counts.low}
          isActive={filterLevel === "low"}
          onClick={() => setFilterLevel("low")}
        />
      </div>

      {/* Table */}
      <div className="p-4 overflow-x-auto">
        {filteredCustomers.length === 0 ? (
          <div
            className="py-8 text-center text-sm"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            No customers match the selected filter.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left border-b"
                style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
              >
                <th
                  className="py-2 pr-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Customer
                </th>
                <th
                  className="py-2 pr-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Plan
                </th>
                <SortHeader
                  label="MRR"
                  field="mrr"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
                <SortHeader
                  label="Risk Score"
                  field="riskScore"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortHeader
                  label="Days Inactive"
                  field="daysSinceActivity"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
                <th
                  className="py-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Risk Factors
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b hover:bg-[var(--bg-tertiary,rgba(255,255,255,0.02))] transition-colors"
                  style={{ borderColor: "var(--border-color, rgba(255,255,255,0.05))" }}
                >
                  <td className="py-3 pr-4">
                    <div>
                      <p style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}>
                        {customer.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary, rgba(255,255,255,0.5))" }}
                      >
                        {customer.email}
                      </p>
                    </div>
                  </td>
                  <td
                    className="py-3 pr-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {customer.plan}
                  </td>
                  <td
                    className="py-3 pr-4 text-right font-medium"
                    style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
                  >
                    {formatCurrency(customer.mrr)}
                  </td>
                  <td className="py-3 pr-4">
                    <RiskBadge level={customer.riskLevel} score={customer.riskScore} />
                  </td>
                  <td
                    className="py-3 pr-4 text-right"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {customer.daysSinceActivity}d
                  </td>
                  <td className="py-3">
                    <ExpandableRiskFactors factors={customer.riskFactors} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export const ChurnRiskTable = memo(ChurnRiskTableComponent);
export default ChurnRiskTable;
