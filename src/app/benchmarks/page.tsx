"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BenchmarkPanel } from "@/components/benchmarks";
import { compareAllMetrics } from "@/lib/benchmarks/industry-data";
import type { UserMetrics } from "@/types/benchmarks";

const MOCK_USER_METRICS: UserMetrics = {
  churn_rate: 4.5,
  ltv: 850,
  cac: 120,
  arr_growth: 45,
  nps: 42,
  mrr: 95000,
  arpu: 85,
  gross_margin: 74,
  ltv_cac_ratio: 7.1,
  trial_to_paid: 22,
  dau_mau: 28,
  session_duration: 9,
  feature_adoption: 52,
  activation_rate: 48,
  csat: 88,
  first_response_time: 45,
  resolution_time: 12,
  ticket_volume: 10,
};

export default function BenchmarksPage() {
  const comparisons = useMemo(
    () => compareAllMetrics(MOCK_USER_METRICS),
    []
  );

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="p-6 border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Benchmarks</h1>
          <Link
            href="/"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <BenchmarkPanel
          comparisons={comparisons}
          title="Industry Benchmarks"
          description="See how your metrics compare to SaaS industry standards"
          showCategoryFilter={true}
          showTierFilter={true}
        />
      </div>
    </main>
  );
}
