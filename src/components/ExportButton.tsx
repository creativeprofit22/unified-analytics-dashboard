"use client";

import { useState } from "react";
import { ExportDialog } from "@/components/export";
import type { UnifiedAnalyticsData, TimeRange } from "@/types";

interface ExportButtonProps {
  data: UnifiedAnalyticsData | null;
  timeRange?: TimeRange;
}

export function ExportButton({ data, timeRange = "30d" }: ExportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
        title="Export analytics data"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span className="hidden sm:inline">Export</span>
      </button>

      <ExportDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={data}
        currentTimeRange={timeRange}
      />
    </>
  );
}
