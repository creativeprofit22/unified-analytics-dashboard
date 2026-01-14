"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { cn } from "@/utils/cn";
import type {
  MetricDefinition,
  ReportDataPoint,
  MetricWidth,
  ChartType,
  ReportMetric,
} from "@/types/report-builder";

// =============================================================================
// TYPES
// =============================================================================

export interface SelectedMetric extends ReportMetric {
  definition: MetricDefinition;
  dataPoint?: ReportDataPoint;
}

export interface MetricCardProps {
  metric: SelectedMetric;
  onRemove: () => void;
  onWidthChange: (width: MetricWidth) => void;
  onChartTypeChange: (chartType: ChartType) => void;
  isDragging?: boolean;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const WIDTH_OPTIONS: { value: MetricWidth; label: string; icon: string }[] = [
  { value: "third", label: "1/3", icon: "third" },
  { value: "half", label: "1/2", icon: "half" },
  { value: "full", label: "Full", icon: "full" },
];

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "area", label: "Area" },
  { value: "pie", label: "Pie" },
  { value: "table", label: "Table" },
];

const WIDTH_COLORS: Record<MetricWidth, string> = {
  third: "#8b5cf6",
  half: "#f59e0b",
  full: "#3b82f6",
};

// =============================================================================
// STATIC STYLES
// =============================================================================

const headerStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const subheaderStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const borderStyle = {
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
};

// =============================================================================
// UTILITIES
// =============================================================================

function formatValue(value: number, unit: string): string {
  switch (unit) {
    case "currency":
      if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
      }
      if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
      }
      return `$${value.toFixed(0)}`;
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "duration":
      if (value >= 3600) {
        return `${(value / 3600).toFixed(1)}h`;
      }
      if (value >= 60) {
        return `${(value / 60).toFixed(1)}m`;
      }
      return `${value.toFixed(0)}s`;
    default:
      if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
      }
      if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
      }
      return value.toLocaleString();
  }
}

function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

const Sparkline = memo(function Sparkline({
  data,
  color,
  width = 80,
  height = 24,
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return "";

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });

    return `M${points.join(" L")}`;
  }, [data, width, height]);

  if (data.length < 2) return null;

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      style={{ opacity: 0.8 }}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

interface ChartPlaceholderProps {
  chartType: ChartType;
  height?: number;
}

// Pre-computed bar heights for stable rendering
const BAR_HEIGHTS = [45, 60, 35, 70, 55, 40, 65];

const ChartPlaceholder = memo(function ChartPlaceholder({
  chartType,
  height = 120,
}: ChartPlaceholderProps) {
  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
            <path
              d="M0,70 L40,60 L80,75 L120,40 L160,55 L200,30"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="text-blue-500"
            />
            <path
              d="M0,70 L40,60 L80,75 L120,40 L160,55 L200,30 L200,100 L0,100 Z"
              fill="currentColor"
              className="text-blue-500/10"
            />
          </svg>
        );
      case "bar":
        return (
          <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
            {BAR_HEIGHTS.map((h, i) => (
              <rect
                key={i}
                x={i * 28 + 4}
                y={100 - h}
                width={20}
                height={h}
                rx={2}
                fill="currentColor"
                className="text-blue-500/60"
              />
            ))}
          </svg>
        );
      case "area":
        return (
          <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
            <path
              d="M0,80 L40,65 L80,70 L120,45 L160,50 L200,35 L200,100 L0,100 Z"
              fill="currentColor"
              className="text-blue-500/30"
            />
            <path
              d="M0,80 L40,65 L80,70 L120,45 L160,50 L200,35"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="text-blue-500"
            />
          </svg>
        );
      case "pie":
        return (
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx={50} cy={50} r={40} fill="currentColor" className="text-blue-500/60" />
            <path
              d="M50,50 L50,10 A40,40 0 0,1 90,50 Z"
              fill="currentColor"
              className="text-green-500/60"
            />
            <path
              d="M50,50 L90,50 A40,40 0 0,1 50,90 Z"
              fill="currentColor"
              className="text-amber-500/60"
            />
          </svg>
        );
      case "table":
        return (
          <div className="w-full h-full flex flex-col gap-1 p-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-2"
              >
                <div
                  className="h-3 rounded flex-1"
                  style={{
                    backgroundColor: i === 0
                      ? "var(--text-secondary, rgba(255,255,255,0.2))"
                      : "var(--bg-tertiary, rgba(255,255,255,0.05))",
                    width: i === 0 ? "100%" : `${60 + Math.random() * 40}%`,
                  }}
                />
                <div
                  className="h-3 rounded w-12"
                  style={{
                    backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))",
                  }}
                />
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        height,
        backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))",
      }}
    >
      {renderChart()}
    </div>
  );
});

interface WidthSelectorProps {
  value: MetricWidth;
  onChange: (width: MetricWidth) => void;
}

const WidthSelector = memo(function WidthSelector({
  value,
  onChange,
}: WidthSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded bg-black/20">
      {WIDTH_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "px-1.5 py-0.5 rounded text-xs font-medium transition-all",
            value === option.value && "shadow-sm"
          )}
          style={{
            backgroundColor: value === option.value ? WIDTH_COLORS[option.value] : "transparent",
            color: value === option.value ? "#ffffff" : "var(--text-secondary, rgba(255,255,255,0.5))",
          }}
          title={`Set width to ${option.label}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
});

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (chartType: ChartType) => void;
}

const ChartTypeSelector = memo(function ChartTypeSelector({
  value,
  onChange,
}: ChartTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors hover:bg-white/10"
        style={{
          backgroundColor: "rgba(0,0,0,0.2)",
          color: "var(--text-secondary, rgba(255,255,255,0.6))",
        }}
      >
        <span className="capitalize">{value}</span>
        <svg
          className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 py-1 rounded-lg border shadow-lg z-20 min-w-[100px]"
          style={{
            backgroundColor: "var(--bg-primary, #1a1a2e)",
            ...borderStyle,
          }}
        >
          {CHART_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                onChange(type.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-white/5",
                value === type.value && "text-blue-400"
              )}
              style={{
                color: value === type.value ? "#3b82f6" : "var(--text-primary, rgba(255,255,255,0.95))",
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function MetricCardComponent({
  metric,
  onRemove,
  onWidthChange,
  onChartTypeChange,
  isDragging,
  className,
}: MetricCardProps) {
  const { definition, dataPoint, width, chartType } = metric;

  // Generate stable mock data if no dataPoint (memoized to prevent re-render jitter)
  const mockData = useMemo(() => ({
    value: Math.random() * 10000,
    changePercent: Math.random() * 40 - 20,
    trend: Array.from({ length: 7 }, () => Math.random() * 100),
  }), [metric.metricId]);

  const displayValue = dataPoint?.value ?? mockData.value;
  const changePercent = dataPoint?.changePercent ?? mockData.changePercent;
  const trend = dataPoint?.trend ?? mockData.trend;

  const changeColor = changePercent >= 0 ? "#22c55e" : "#ef4444";
  const widthColor = WIDTH_COLORS[width];

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden transition-all duration-200",
        isDragging && "ring-2 ring-blue-500",
        className
      )}
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
        ...borderStyle,
      }}
    >
      {/* Width Indicator Bar */}
      <div
        className="h-1"
        style={{ backgroundColor: widthColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between p-3 pb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            <div
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-white/5"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.4))" }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium truncate" style={headerStyle}>
              {definition.name}
            </h4>
          </div>
          <p className="text-xs mt-0.5 truncate pl-6" style={subheaderStyle}>
            {definition.description}
          </p>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 p-1 rounded transition-colors hover:bg-red-500/20"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.4))" }}
          title="Remove metric"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Value and Change */}
      <div className="px-3 pb-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold" style={headerStyle}>
              {formatValue(displayValue, definition.unit)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="flex items-center gap-0.5 text-xs font-medium"
                style={{ color: changeColor }}
              >
                <svg
                  className={cn("w-3 h-3", changePercent < 0 && "rotate-180")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {formatChange(changePercent)}
              </span>
              <span className="text-xs" style={subheaderStyle}>
                vs prev. period
              </span>
            </div>
          </div>

          {/* Sparkline */}
          <Sparkline
            data={trend}
            color={changeColor}
            width={60}
            height={20}
          />
        </div>
      </div>

      {/* Chart Preview */}
      <div className="px-3 pb-3">
        <ChartPlaceholder
          chartType={chartType || "line"}
          height={width === "full" ? 140 : width === "half" ? 100 : 80}
        />
      </div>

      {/* Controls */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t"
        style={{
          ...borderStyle,
          backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.02))",
        }}
      >
        <WidthSelector value={width} onChange={onWidthChange} />
        <ChartTypeSelector value={chartType || "line"} onChange={onChartTypeChange} />
      </div>
    </div>
  );
}

export const MetricCard = memo(MetricCardComponent);
export default MetricCard;
