"use client";

import Link from "next/link";
import { AttributionPanel } from "@/components";
import { useAttribution } from "@/hooks/useAttribution";

export default function AttributionPage() {
  const { data, error, isLoading, refresh } = useAttribution();

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="p-6 border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Multi-touch Attribution</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Analyze how different channels contribute to conversions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => refresh()}
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
      <div className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400">{error.message}</p>
            <button
              onClick={() => refresh()}
              className="mt-4 px-4 py-2 text-sm rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : data ? (
          <AttributionPanel data={data} />
        ) : null}
      </div>
    </main>
  );
}
