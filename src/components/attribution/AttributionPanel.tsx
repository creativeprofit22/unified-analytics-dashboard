"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { cn } from "@/utils/cn";
import { AttributionModelSelector } from "./AttributionModelSelector";
import { TouchpointChart } from "./TouchpointChart";

// =============================================================================
// TYPES
// =============================================================================

export type AttributionModel = "first-touch" | "last-touch" | "linear" | "time-decay";
export type Channel =
  | "email"
  | "paid-search"
  | "organic-search"
  | "social"
  | "direct"
  | "referral"
  | "display"
  | "affiliate";

export interface ChannelAttribution {
  channel: Channel;
  conversions: number;
  attributedRevenue: number;
  percentOfTotal: number;
  avgTouchpoints: number;
}

export interface ModelResult {
  model: AttributionModel;
  channelAttributions: ChannelAttribution[];
  totalConversions: number;
  totalRevenue: number;
}

export interface TouchpointPath {
  from: Channel | "start";
  to: Channel | "conversion";
  count: number;
  value: number;
}

export interface AttributionData {
  models: ModelResult[];
  paths: TouchpointPath[];
  summary: {
    totalConversions: number;
    totalRevenue: number;
    avgJourneyLength: number;
    topChannel: Channel;
  };
}

export interface AttributionPanelProps {
  data: AttributionData;
  className?: string;
}

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

interface SummaryCardsProps {
  summary: AttributionData["summary"];
}

function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))" }}
      >
        <p
          className="text-xs mb-1"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Total Conversions
        </p>
        <p
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
        >
          {formatNumber(summary.totalConversions)}
        </p>
      </div>
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))" }}
      >
        <p
          className="text-xs mb-1"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Total Revenue
        </p>
        <p
          className="text-xl font-semibold"
          style={{ color: "#22c55e" }}
        >
          {formatCurrency(summary.totalRevenue)}
        </p>
      </div>
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))" }}
      >
        <p
          className="text-xs mb-1"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Avg Journey Length
        </p>
        <p
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
        >
          {summary.avgJourneyLength.toFixed(1)} <span className="text-sm font-normal" style={{ color: "var(--text-secondary)" }}>touches</span>
        </p>
      </div>
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))" }}
      >
        <p
          className="text-xs mb-1"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Top Channel
        </p>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: CHANNEL_COLORS[summary.topChannel] }}
          />
          <p
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
          >
            {CHANNEL_LABELS[summary.topChannel]}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ChannelBreakdownTableProps {
  channelAttributions: ChannelAttribution[];
}

function ChannelBreakdownTable({ channelAttributions }: ChannelBreakdownTableProps) {
  // Sort by revenue descending
  const sortedData = useMemo(() => {
    return [...channelAttributions].sort((a, b) => b.attributedRevenue - a.attributedRevenue);
  }, [channelAttributions]);

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      {/* Table Header */}
      <div
        className="grid grid-cols-5 gap-4 px-4 py-3 text-xs font-medium border-b"
        style={{
          backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))",
          borderColor: "var(--border-color, rgba(255,255,255,0.1))",
          color: "var(--text-secondary, rgba(255,255,255,0.6))",
        }}
      >
        <div>Channel</div>
        <div className="text-right">Conversions</div>
        <div className="text-right">Revenue</div>
        <div className="text-right">% of Total</div>
        <div className="text-right">Avg Touches</div>
      </div>

      {/* Table Body */}
      <div className="divide-y" style={{ borderColor: "var(--border-color, rgba(255,255,255,0.05))" }}>
        {sortedData.map((attr) => (
          <div
            key={attr.channel}
            className="grid grid-cols-5 gap-4 px-4 py-3 text-sm hover:bg-[var(--bg-tertiary,rgba(255,255,255,0.03))] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: CHANNEL_COLORS[attr.channel] }}
              />
              <span
                className="font-medium"
                style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
              >
                {CHANNEL_LABELS[attr.channel]}
              </span>
            </div>
            <div
              className="text-right"
              style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
            >
              {formatNumber(attr.conversions)}
            </div>
            <div
              className="text-right font-medium"
              style={{ color: "#22c55e" }}
            >
              {formatCurrency(attr.attributedRevenue)}
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <div
                  className="w-16 h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.1))" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(attr.percentOfTotal, 100)}%`,
                      backgroundColor: CHANNEL_COLORS[attr.channel],
                    }}
                  />
                </div>
                <span style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}>
                  {attr.percentOfTotal.toFixed(1)}%
                </span>
              </div>
            </div>
            <div
              className="text-right"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
            >
              {attr.avgTouchpoints.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function AttributionPanelComponent({ data, className }: AttributionPanelProps) {
  const { models, paths, summary } = data;

  const [selectedModel, setSelectedModel] = useState<AttributionModel>("linear");

  const handleModelChange = useCallback((model: AttributionModel) => {
    setSelectedModel(model);
  }, []);

  // Get current model's data (with empty array guard)
  const currentModelData = useMemo(() => {
    if (models.length === 0) return null;
    return models.find((m) => m.model === selectedModel) ?? models[0];
  }, [models, selectedModel]);

  // Pre-compute top channels for all models (optimization)
  const modelTopChannels = useMemo(() => {
    return new Map(
      models.map((model) => [
        model.model,
        model.channelAttributions.length > 0
          ? model.channelAttributions.reduce((prev, curr) =>
              curr.attributedRevenue > prev.attributedRevenue ? curr : prev
            )
          : null,
      ])
    );
  }, [models]);

  // Early return if no model data available
  if (!currentModelData) {
    return (
      <div className={cn("space-y-6", className)}>
        <p style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}>
          No attribution data available.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
          >
            Marketing Attribution
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            Understand which channels drive conversions and revenue
          </p>
        </div>

        {/* Model Selector */}
        <AttributionModelSelector
          value={selectedModel}
          onChange={handleModelChange}
          variant="dropdown"
        />
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Touchpoint Chart - Bar */}
        <TouchpointChart
          channelAttributions={currentModelData.channelAttributions}
          paths={paths}
          selectedModel={selectedModel}
          chartType="bar"
          height={320}
        />

        {/* Touchpoint Chart - Sankey (if paths available) */}
        {paths.length > 0 && (
          <TouchpointChart
            channelAttributions={currentModelData.channelAttributions}
            paths={paths}
            selectedModel={selectedModel}
            chartType="sankey"
            height={320}
          />
        )}
      </div>

      {/* Channel Breakdown Table */}
      <div>
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
        >
          Channel Breakdown
        </h3>
        <ChannelBreakdownTable channelAttributions={currentModelData.channelAttributions} />
      </div>

      {/* Model Comparison Info */}
      <div
        className="rounded-lg border p-4"
        style={{
          backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
          borderColor: "var(--border-color, rgba(255,255,255,0.1))",
        }}
      >
        <h4
          className="text-sm font-medium mb-3"
          style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
        >
          Compare Attribution Models
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {models.map((model) => {
            const isSelected = model.model === selectedModel;
            const topChannel = modelTopChannels.get(model.model);

            return (
              <button
                key={model.model}
                onClick={() => handleModelChange(model.model)}
                className={cn(
                  "text-left rounded-lg p-3 transition-all border",
                  isSelected
                    ? "border-[var(--accent-color,#8b5cf6)]"
                    : "border-transparent hover:bg-[var(--bg-tertiary,rgba(255,255,255,0.05))]"
                )}
                style={{
                  backgroundColor: isSelected
                    ? "rgba(139, 92, 246, 0.1)"
                    : "var(--bg-tertiary, rgba(255,255,255,0.03))",
                }}
              >
                <p
                  className="text-xs font-medium mb-1"
                  style={{
                    color: isSelected
                      ? "var(--accent-color, #8b5cf6)"
                      : "var(--text-secondary, rgba(255,255,255,0.6))",
                  }}
                >
                  {model.model
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </p>
                <p
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
                >
                  {formatCurrency(model.totalRevenue)}
                </p>
                {topChannel && (
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded"
                      style={{ backgroundColor: CHANNEL_COLORS[topChannel.channel] }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary, rgba(255,255,255,0.5))" }}
                    >
                      Top: {CHANNEL_LABELS[topChannel.channel]}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const AttributionPanel = memo(AttributionPanelComponent);
export default AttributionPanel;
