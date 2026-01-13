"use client";

import { useState } from "react";
import { Dashboard, TimeRangePicker, ThemeToggle, FilterPanel, ExportButton, ComparisonToggle, ComparisonView } from "@/components";
import { useAnalytics } from "@/hooks";
import { useFilters } from "@/contexts/FilterContext";
import type { TimeRange, CustomDateRange, ComparisonConfig } from "@/types/analytics";
import { DEFAULT_COMPARISON_CONFIG } from "@/types";

function formatDateRange(range?: CustomDateRange): string {
  if (!range) return "Selected Period";
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${formatDate(range.start)} - ${formatDate(range.end)}`;
}

export default function HomePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [customRange, setCustomRange] = useState<CustomDateRange | undefined>();
  const [comparison, setComparison] = useState<ComparisonConfig>(DEFAULT_COMPARISON_CONFIG);
  const { filters } = useFilters();

  // SWR deduplicates this request with Dashboard's identical call
  const { data, comparisonData } = useAnalytics({ timeRange, filters, comparison });

  const handleTimeRangeChange = (range: TimeRange, custom?: CustomDateRange) => {
    setTimeRange(range);
    if (custom) {
      setCustomRange(custom);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-4 sm:px-6 lg:px-8 py-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Top row: Title and controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Unified Analytics Dashboard</h1>
              <p className="text-[var(--text-secondary)] mt-1 text-sm sm:text-base">
                Multi-platform analytics for GoHighLevel
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <ExportButton data={data ?? null} />
              <FilterPanel />
              <ThemeToggle />
              {!comparison.enabled && (
                <TimeRangePicker
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                  customRange={customRange}
                />
              )}
            </div>
          </div>

          {/* Comparison Toggle - expands to show date pickers when enabled */}
          <ComparisonToggle config={comparison} onChange={setComparison} />
        </div>
      </header>

      {/* Comparison Mode Banner */}
      {comparison.enabled && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 px-4 py-3 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-blue-400">
              <strong>Comparison Mode:</strong>{" "}
              <span className="text-blue-300">{formatDateRange(comparison.currentRange)}</span>
              {" vs "}
              <span className="text-purple-300">{formatDateRange(comparison.comparisonRange)}</span>
            </span>
          </div>
          <button
            onClick={() => setComparison({ ...comparison, enabled: false })}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Disable
          </button>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {comparison.enabled && data && comparisonData ? (
          <ComparisonView
            currentData={data}
            comparisonData={comparisonData}
            comparison={comparison}
          />
        ) : (
          <Dashboard timeRange={timeRange} comparison={comparison} />
        )}
      </div>
    </main>
  );
}
