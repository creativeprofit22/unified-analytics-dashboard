"use client";

import { useId, useState } from "react";
import type { TimeRange, CustomDateRange } from "@/types/analytics";
import { cn } from "@/utils/cn";

const PRESET_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "12m", label: "12M" },
  { value: "ytd", label: "YTD" },
  { value: "custom", label: "Custom" },
];

export interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange, customRange?: CustomDateRange) => void;
  customRange?: CustomDateRange;
  className?: string;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDefaultCustomRange(): CustomDateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  return { start, end };
}

export function TimeRangePicker({
  value,
  onChange,
  customRange,
  className,
}: TimeRangePickerProps) {
  const id = useId();
  const [showCustom, setShowCustom] = useState(value === "custom");
  const [localCustomRange, setLocalCustomRange] = useState<CustomDateRange>(
    customRange ?? getDefaultCustomRange()
  );

  const handlePresetClick = (preset: TimeRange) => {
    if (preset === "custom") {
      setShowCustom(true);
      onChange("custom", localCustomRange);
    } else {
      setShowCustom(false);
      onChange(preset);
    }
  };

  const handleCustomDateChange = (field: "start" | "end", dateStr: string) => {
    const newDate = new Date(dateStr);
    if (isNaN(newDate.getTime())) return;

    const newRange = { ...localCustomRange, [field]: newDate };
    setLocalCustomRange(newRange);
    onChange("custom", newRange);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value as TimeRange;
    handlePresetClick(preset);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Mobile: Dropdown */}
      <div className="sm:hidden">
        <label htmlFor={`${id}-select`} className="sr-only">
          Select time range
        </label>
        <select
          id={`${id}-select`}
          value={value}
          onChange={handleSelectChange}
          className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.05))] border border-[var(--border,rgba(255,255,255,0.1))] text-[var(--text-primary,rgba(255,255,255,0.95))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PRESET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: Button Group */}
      <div className="hidden sm:flex gap-1 p-1 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.03))]">
        {PRESET_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handlePresetClick(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              value === opt.value
                ? "bg-blue-600 text-white"
                : "text-[var(--text-secondary,rgba(255,255,255,0.6))] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary,rgba(255,255,255,0.05))]"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Inputs */}
      {showCustom && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-[var(--text-secondary,rgba(255,255,255,0.6))]">
              From
            </span>
            <input
              type="date"
              value={formatDateForInput(localCustomRange.start)}
              onChange={(e) => handleCustomDateChange("start", e.target.value)}
              max={formatDateForInput(localCustomRange.end)}
              className="px-2 py-1 rounded-md bg-[var(--bg-secondary,rgba(255,255,255,0.05))] border border-[var(--border,rgba(255,255,255,0.1))] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-[var(--text-secondary,rgba(255,255,255,0.6))]">
              To
            </span>
            <input
              type="date"
              value={formatDateForInput(localCustomRange.end)}
              onChange={(e) => handleCustomDateChange("end", e.target.value)}
              min={formatDateForInput(localCustomRange.start)}
              max={formatDateForInput(new Date())}
              className="px-2 py-1 rounded-md bg-[var(--bg-secondary,rgba(255,255,255,0.05))] border border-[var(--border,rgba(255,255,255,0.1))] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default TimeRangePicker;
