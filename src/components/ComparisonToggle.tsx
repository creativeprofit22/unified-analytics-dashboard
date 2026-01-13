"use client";

import { useId, useState, useEffect } from "react";
import type { ComparisonConfig, CustomDateRange } from "@/types/analytics";
import { cn } from "@/utils/cn";

export interface ComparisonToggleProps {
  config: ComparisonConfig;
  onChange: (config: ComparisonConfig) => void;
  className?: string;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDefaultRanges(): { current: CustomDateRange; comparison: CustomDateRange } {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(today.getDate() - 60);
  const thirtyOneDaysAgo = new Date();
  thirtyOneDaysAgo.setDate(today.getDate() - 31);

  return {
    current: { start: thirtyDaysAgo, end: today },
    comparison: { start: sixtyDaysAgo, end: thirtyOneDaysAgo },
  };
}

interface DateRangePickerProps {
  label: string;
  labelColor: string;
  range: CustomDateRange;
  onChange: (range: CustomDateRange) => void;
  id: string;
}

function DateRangePicker({ label, labelColor, range, onChange, id }: DateRangePickerProps) {
  const handleDateChange = (field: "start" | "end", dateStr: string) => {
    const newDate = new Date(dateStr);
    if (isNaN(newDate.getTime())) return;
    onChange({ ...range, [field]: newDate });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("text-xs font-medium uppercase tracking-wide", labelColor)}>
        {label}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <label className="flex items-center gap-1.5">
          <span className="text-[var(--text-secondary,rgba(255,255,255,0.5))] text-xs">From</span>
          <input
            id={`${id}-start`}
            type="date"
            value={formatDateForInput(range.start)}
            onChange={(e) => handleDateChange("start", e.target.value)}
            max={formatDateForInput(range.end)}
            className="px-2 py-1 rounded-md bg-[var(--bg-secondary,rgba(255,255,255,0.05))] border border-[var(--border,rgba(255,255,255,0.1))] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="flex items-center gap-1.5">
          <span className="text-[var(--text-secondary,rgba(255,255,255,0.5))] text-xs">To</span>
          <input
            id={`${id}-end`}
            type="date"
            value={formatDateForInput(range.end)}
            onChange={(e) => handleDateChange("end", e.target.value)}
            min={formatDateForInput(range.start)}
            max={formatDateForInput(new Date())}
            className="px-2 py-1 rounded-md bg-[var(--bg-secondary,rgba(255,255,255,0.05))] border border-[var(--border,rgba(255,255,255,0.1))] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  );
}

export function ComparisonToggle({
  config,
  onChange,
  className,
}: ComparisonToggleProps) {
  const id = useId();
  const defaults = getDefaultRanges();

  const [currentRange, setCurrentRange] = useState<CustomDateRange>(
    config.currentRange ?? defaults.current
  );
  const [comparisonRange, setComparisonRange] = useState<CustomDateRange>(
    config.comparisonRange ?? defaults.comparison
  );

  // Sync local state with prop changes
  useEffect(() => {
    if (config.currentRange) {
      setCurrentRange(config.currentRange);
    }
    if (config.comparisonRange) {
      setComparisonRange(config.comparisonRange);
    }
  }, [config.currentRange, config.comparisonRange]);

  const handleToggle = () => {
    if (!config.enabled) {
      // Enabling comparison - set custom mode with date ranges
      onChange({
        enabled: true,
        period: "custom",
        currentRange,
        comparisonRange,
      });
    } else {
      // Disabling comparison
      onChange({
        enabled: false,
        period: "custom",
      });
    }
  };

  const handleCurrentRangeChange = (range: CustomDateRange) => {
    setCurrentRange(range);
    onChange({
      ...config,
      currentRange: range,
    });
  };

  const handleComparisonRangeChange = (range: CustomDateRange) => {
    setComparisonRange(range);
    onChange({
      ...config,
      comparisonRange: range,
    });
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Toggle Row */}
      <div className="flex items-center gap-3">
        {/* Toggle Button */}
        <button
          id={`${id}-toggle`}
          onClick={handleToggle}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
            config.enabled
              ? "bg-blue-600 text-white"
              : "bg-[var(--bg-secondary,rgba(255,255,255,0.03))] text-[var(--text-secondary,rgba(255,255,255,0.6))] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary,rgba(255,255,255,0.05))]"
          )}
          aria-pressed={config.enabled}
          title={config.enabled ? "Comparison mode enabled" : "Enable comparison mode"}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="hidden sm:inline">Compare</span>
        </button>
      </div>

      {/* Dual Date Pickers (shown when enabled) */}
      {config.enabled && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.03))] border border-[var(--border-primary,rgba(255,255,255,0.1))]">
          <DateRangePicker
            label="Current Period"
            labelColor="text-blue-400"
            range={currentRange}
            onChange={handleCurrentRangeChange}
            id={`${id}-current`}
          />

          <div className="hidden sm:flex items-center justify-center px-3">
            <span className="text-lg text-[var(--text-secondary)]">vs</span>
          </div>
          <div className="sm:hidden text-center text-sm text-[var(--text-secondary)]">vs</div>

          <DateRangePicker
            label="Comparison Period"
            labelColor="text-purple-400"
            range={comparisonRange}
            onChange={handleComparisonRangeChange}
            id={`${id}-comparison`}
          />
        </div>
      )}
    </div>
  );
}

export default ComparisonToggle;
