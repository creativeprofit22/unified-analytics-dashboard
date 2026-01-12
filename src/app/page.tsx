"use client";

import { useState } from "react";
import { Dashboard, TimeRangePicker } from "@/components";
import type { TimeRange, CustomDateRange } from "@/types/analytics";

export default function HomePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [customRange, setCustomRange] = useState<CustomDateRange | undefined>();

  const handleTimeRangeChange = (range: TimeRange, custom?: CustomDateRange) => {
    setTimeRange(range);
    if (custom) {
      setCustomRange(custom);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary,#0f172a)] text-[var(--text-primary,rgba(255,255,255,0.95))] p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Unified Analytics Dashboard</h1>
          <p className="text-[var(--text-secondary,rgba(255,255,255,0.6))] mt-1 text-sm sm:text-base">
            Multi-platform analytics for GoHighLevel
          </p>
        </div>
        <TimeRangePicker
          value={timeRange}
          onChange={handleTimeRangeChange}
          customRange={customRange}
        />
      </header>

      <Dashboard timeRange={timeRange} />
    </main>
  );
}
