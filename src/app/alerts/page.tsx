"use client";

import Link from "next/link";
import { AlertPanel } from "@/components";
import { useAlerts } from "@/hooks";

export default function AlertsPage() {
  const { data, error, isLoading } = useAlerts();

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="p-6 border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alerts & Monitoring</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Track anomalies, threshold alerts, and goal progress
            </p>
          </div>
          <Link
            href="/"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400">{error.message}</p>
          </div>
        ) : data ? (
          <AlertPanel
            anomalies={data.anomalies}
            thresholdAlerts={data.thresholdAlerts}
            goals={data.goals}
          />
        ) : null}
      </div>
    </main>
  );
}
