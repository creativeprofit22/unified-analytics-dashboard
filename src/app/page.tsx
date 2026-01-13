"use client";

import { useState } from "react";
import { Dashboard, TimeRangePicker, ThemeToggle, FilterPanel, ExportButton } from "@/components";
import { useAnalytics } from "@/hooks";
import { useFilters } from "@/contexts/FilterContext";
import type { TimeRange, CustomDateRange } from "@/types/analytics";

export default function HomePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [customRange, setCustomRange] = useState<CustomDateRange | undefined>();
  const { filters } = useFilters();

  // SWR deduplicates this request with Dashboard's identical call
  const { data } = useAnalytics({ timeRange, filters });

  const handleTimeRangeChange = (range: TimeRange, custom?: CustomDateRange) => {
    setTimeRange(range);
    if (custom) {
      setCustomRange(custom);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Unified Analytics Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm sm:text-base">
            Multi-platform analytics for GoHighLevel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton data={data ?? null} />
          <FilterPanel />
          <ThemeToggle />
          <TimeRangePicker
            value={timeRange}
            onChange={handleTimeRangeChange}
            customRange={customRange}
          />
        </div>
      </header>

      <Dashboard timeRange={timeRange} />
    </main>
  );
}
