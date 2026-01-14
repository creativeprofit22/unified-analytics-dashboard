"use client";

import Link from "next/link";
import { AttributionPanel, ROICalculator } from "@/components";
import { useAttribution } from "@/hooks/useAttribution";
import { useROI } from "@/hooks/useROI";

export default function AttributionPage() {
  const { data: attributionData, error: attributionError, isLoading: attributionLoading, refresh: refreshAttribution } = useAttribution();
  const { data: roiData, error: roiError, isLoading: roiLoading, refresh: refreshROI } = useROI();

  const handleRefresh = () => {
    refreshAttribution();
    refreshROI();
  };

  const isLoading = attributionLoading || roiLoading;
  const hasError = attributionError || roiError;

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="p-6 border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Attribution & ROI Analysis</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Analyze channel performance, attribution, and return on investment
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Refresh
            </button>
            <Link
              href="/"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
          </div>
        ) : hasError ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400">{attributionError?.message || roiError?.message}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 text-sm rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* ROI Calculator Section */}
            {roiData && (
              <section>
                <ROICalculator data={roiData} />
              </section>
            )}

            {/* Attribution Section */}
            {attributionData && (
              <section>
                <AttributionPanel data={attributionData} />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
