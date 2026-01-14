"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardEditor } from "@/components/dashboards";
import {
  PieChartWidget,
  LineChartWidget,
  BarChartWidget,
  AreaChartWidget,
  MetricCardWidget,
  FunnelChartWidget,
  GaugeChartWidget,
  HeatmapWidget,
  RadarChartWidget,
  SankeyChartWidget,
  ScatterChartWidget,
  TableWidget,
} from "@/components/dashboards/charts";
import type { Widget, SavedDashboard, DashboardInput } from "@/types/custom-dashboards";

const STORAGE_KEY = "unified-analytics-dashboards";

function renderWidget(widget: Widget): ReactNode {
  const baseStyle = "h-full w-full flex items-center justify-center rounded-lg border border-dashed border-[var(--border-color,rgba(255,255,255,0.2))]";

  switch (widget.config.type) {
    case "metric-card":
      return <MetricCardWidget widget={widget} />;
    case "line-chart":
      return <LineChartWidget widget={widget} />;
    case "bar-chart":
      return <BarChartWidget widget={widget} />;
    case "pie-chart":
      return <PieChartWidget widget={widget} />;
    case "area-chart":
      return <AreaChartWidget widget={widget} />;
    case "funnel-chart":
      return <FunnelChartWidget widget={widget} />;
    case "gauge-chart":
      return <GaugeChartWidget widget={widget} />;
    case "heatmap":
      return <HeatmapWidget widget={widget} />;
    case "radar-chart":
      return <RadarChartWidget widget={widget} />;
    case "sankey-chart":
      return <SankeyChartWidget widget={widget} />;
    case "scatter-chart":
      return <ScatterChartWidget widget={widget} />;
    case "table":
      return <TableWidget widget={widget} />;
    default:
      return (
        <div className={baseStyle}>
          <div className="text-sm text-[var(--text-secondary)]">{widget.title}</div>
        </div>
      );
  }
}

function loadDashboards(): SavedDashboard[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDashboards(dashboards: SavedDashboard[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
}

export default function EditDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const dashboardId = params.id as string;

  const [dashboard, setDashboard] = useState<SavedDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Load dashboard on mount
  useEffect(() => {
    const dashboards = loadDashboards();
    const found = dashboards.find((d) => d.id === dashboardId);

    if (found) {
      setDashboard(found);
    } else {
      setNotFound(true);
    }
    setIsLoading(false);
  }, [dashboardId]);

  const handleSave = useCallback(
    (input: DashboardInput) => {
      if (!dashboard) return;

      setIsSaving(true);

      setTimeout(() => {
        try {
          const dashboards = loadDashboards();
          const now = new Date().toISOString();

          const updatedDashboard: SavedDashboard = {
            ...dashboard,
            name: input.name,
            description: input.description,
            visibility: input.visibility ?? dashboard.visibility,
            widgets: input.widgets,
            widgetCount: input.widgets.length,
            updatedAt: now,
            defaultTimeRange: input.defaultTimeRange,
            tags: input.tags,
            version: dashboard.version + 1,
          };

          const updatedDashboards = dashboards.map((d) =>
            d.id === dashboardId ? updatedDashboard : d
          );

          saveDashboards(updatedDashboards);
          console.log("Dashboard updated:", updatedDashboard.name, `(${updatedDashboard.widgetCount} widgets)`);

          // Redirect to view page
          router.push(`/dashboards/${dashboardId}`);
        } catch (error) {
          console.error("Failed to save dashboard:", error);
        } finally {
          setIsSaving(false);
        }
      }, 500);
    },
    [dashboard, dashboardId, router]
  );

  const handleClose = useCallback(() => {
    router.push(`/dashboards/${dashboardId}`);
  }, [dashboardId, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
          <h1 className="text-xl font-semibold">Edit Dashboard</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
          <h1 className="text-xl font-semibold">Dashboard Not Found</h1>
          <Link
            href="/dashboards"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            &larr; Back to Dashboards
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">404</div>
            <p className="text-[var(--text-secondary)] mb-6">
              The dashboard you're looking for doesn't exist or has been deleted.
            </p>
            <Link
              href="/dashboards"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboards
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Editor view
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
        <h1 className="text-xl font-semibold">Edit: {dashboard?.name}</h1>
        <button
          onClick={handleClose}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          &larr; Back to Dashboard
        </button>
      </header>
      <DashboardEditor
        initialDashboard={dashboard}
        renderWidget={renderWidget}
        onSave={handleSave}
        onClose={handleClose}
        isSaving={isSaving}
        className="flex-1"
      />
    </div>
  );
}
