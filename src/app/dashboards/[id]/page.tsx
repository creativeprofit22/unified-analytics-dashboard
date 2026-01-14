"use client";

import { useState, useEffect, ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardViewer } from "@/components/dashboards";
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
import type { Widget, SavedDashboard } from "@/types/custom-dashboards";

const STORAGE_KEY = "unified-analytics-dashboards";

function renderWidget(widget: Widget): ReactNode {
  const baseStyle =
    "h-full w-full flex items-center justify-center rounded-lg border border-dashed border-[var(--border-color,rgba(255,255,255,0.2))]";

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

function loadDashboard(id: string): SavedDashboard | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const dashboards: SavedDashboard[] = JSON.parse(stored);
    return dashboards.find((d) => d.id === id) || null;
  } catch {
    return null;
  }
}

export default function DashboardViewPage() {
  const params = useParams();
  const dashboardId = params.id as string;

  const [dashboard, setDashboard] = useState<SavedDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (dashboardId) {
      const loaded = loadDashboard(dashboardId);
      setDashboard(loaded);
      setIsLoading(false);
    }
  }, [dashboardId]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="text-[var(--text-secondary)]">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboard) {
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
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-6xl text-[var(--text-secondary)]">404</div>
          <p className="text-[var(--text-secondary)]">
            The dashboard you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link
            href="/dashboards"
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors"
          >
            Go to Dashboards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
        <div>
          <h1 className="text-xl font-semibold">{dashboard.name}</h1>
          {dashboard.description && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {dashboard.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboards/${dashboardId}/edit`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Link>
          <Link
            href="/dashboards"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            &larr; Back to Dashboards
          </Link>
        </div>
      </header>
      <div className="flex-1 overflow-auto">
        <DashboardViewer dashboard={dashboard} renderWidget={renderWidget} />
      </div>
    </div>
  );
}
