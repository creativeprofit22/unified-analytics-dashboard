"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { cn } from "@/utils/cn";
import type { ChannelROIMetrics } from "@/types/roi";
import type { Channel } from "@/types/attribution";

// =============================================================================
// TYPES
// =============================================================================

export interface ChannelCostTableProps {
  channels: ChannelROIMetrics[];
  className?: string;
}

type SortField = "channel" | "adSpend" | "totalCost" | "revenue" | "roi" | "cac" | "ltvCac";
type SortDirection = "asc" | "desc";

// =============================================================================
// CONSTANTS
// =============================================================================

const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email",
  "paid-search": "Paid Search",
  "organic-search": "Organic Search",
  social: "Social",
  direct: "Direct",
  referral: "Referral",
  display: "Display",
  affiliate: "Affiliate",
};

const CHANNEL_COLORS: Record<Channel, string> = {
  email: "#3b82f6",
  "paid-search": "#f59e0b",
  "organic-search": "#22c55e",
  social: "#ec4899",
  direct: "#8b5cf6",
  referral: "#06b6d4",
  display: "#f97316",
  affiliate: "#84cc16",
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
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toLocaleString();
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SortableHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}

const SortableHeader = memo(function SortableHeader({
  label,
  field,
  currentField,
  currentDirection,
  onSort,
  align = "right",
}: SortableHeaderProps) {
  const isActive = currentField === field;

  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center gap-1 hover:opacity-80 transition-opacity",
        align === "right" ? "justify-end ml-auto" : "justify-start"
      )}
    >
      <span>{label}</span>
      <span
        className="text-[10px]"
        style={{
          color: isActive
            ? "var(--text-primary, rgba(255,255,255,0.95))"
            : "var(--text-secondary, rgba(255,255,255,0.4))",
        }}
      >
        {isActive ? (currentDirection === "asc" ? "^" : "v") : ""}
      </span>
    </button>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ChannelCostTableComponent({ channels, className }: ChannelCostTableProps) {
  const [sortField, setSortField] = useState<SortField>("roi");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("desc");
      }
    },
    [sortField]
  );

  const sortedData = useMemo(() => {
    return [...channels].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case "channel":
          aValue = CHANNEL_LABELS[a.channel];
          bValue = CHANNEL_LABELS[b.channel];
          break;
        case "adSpend":
          aValue = a.costs.adSpend;
          bValue = b.costs.adSpend;
          break;
        case "totalCost":
          aValue = a.costs.totalCost;
          bValue = b.costs.totalCost;
          break;
        case "revenue":
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        case "roi":
          aValue = a.roi;
          bValue = b.roi;
          break;
        case "cac":
          aValue = a.cac;
          bValue = b.cac;
          break;
        case "ltvCac":
          aValue = a.ltvCacRatio;
          bValue = b.ltvCacRatio;
          break;
        default:
          aValue = a.roi;
          bValue = b.roi;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const numA = aValue as number;
      const numB = bValue as number;
      return sortDirection === "asc" ? numA - numB : numB - numA;
    });
  }, [channels, sortField, sortDirection]);

  return (
    <div
      className={cn("rounded-lg border overflow-hidden", className)}
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      {/* Table Header */}
      <div
        className="grid grid-cols-7 gap-4 px-4 py-3 text-xs font-medium border-b"
        style={{
          backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))",
          borderColor: "var(--border-color, rgba(255,255,255,0.1))",
          color: "var(--text-secondary, rgba(255,255,255,0.6))",
        }}
      >
        <SortableHeader
          label="Channel"
          field="channel"
          currentField={sortField}
          currentDirection={sortDirection}
          onSort={handleSort}
          align="left"
        />
        <SortableHeader
          label="Ad Spend"
          field="adSpend"
          currentField={sortField}
          currentDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableHeader
          label="Total Cost"
          field="totalCost"
          currentField={sortField}
          currentDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableHeader
          label="Revenue"
          field="revenue"
          currentField={sortField}
          currentDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableHeader
          label="ROI %"
          field="roi"
          currentField={sortField}
          currentDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableHeader
          label="CAC"
          field="cac"
          currentField={sortField}
          currentDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableHeader
          label="LTV:CAC"
          field="ltvCac"
          currentField={sortField}
          currentDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Table Body */}
      <div
        className="divide-y"
        style={{ borderColor: "var(--border-color, rgba(255,255,255,0.05))" }}
      >
        {sortedData.map((metrics) => {
          const roiColor = metrics.roi >= 0 ? "#22c55e" : "#ef4444";
          const ltvCacColor =
            metrics.ltvCacRatio >= 3 ? "#22c55e" : metrics.ltvCacRatio >= 1 ? "#f59e0b" : "#ef4444";

          return (
            <div
              key={metrics.channel}
              className="grid grid-cols-7 gap-4 px-4 py-3 text-sm hover:bg-[var(--bg-tertiary,rgba(255,255,255,0.03))] transition-colors"
            >
              {/* Channel */}
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: CHANNEL_COLORS[metrics.channel] }}
                />
                <span
                  className="font-medium"
                  style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
                >
                  {CHANNEL_LABELS[metrics.channel]}
                </span>
              </div>

              {/* Ad Spend */}
              <div
                className="text-right"
                style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
              >
                {formatCurrency(metrics.costs.adSpend)}
              </div>

              {/* Total Cost */}
              <div
                className="text-right"
                style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
              >
                {formatCurrency(metrics.costs.totalCost)}
              </div>

              {/* Revenue */}
              <div className="text-right font-medium" style={{ color: "#22c55e" }}>
                {formatCurrency(metrics.revenue)}
              </div>

              {/* ROI */}
              <div className="text-right font-semibold" style={{ color: roiColor }}>
                {formatPercent(metrics.roi)}
              </div>

              {/* CAC */}
              <div
                className="text-right"
                style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
              >
                {formatCurrency(metrics.cac)}
              </div>

              {/* LTV:CAC */}
              <div className="text-right">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${ltvCacColor}20`,
                    color: ltvCacColor,
                  }}
                >
                  {metrics.ltvCacRatio.toFixed(1)}x
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ChannelCostTable = memo(ChannelCostTableComponent);
export default ChannelCostTable;
