"use client";

import { ReactNode, useState, useCallback } from "react";
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
import type { Widget, DashboardInput, SavedDashboard } from "@/types/custom-dashboards";

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

const STORAGE_KEY = "unified-analytics-dashboards";

function generateId(): string {
  return `dashboard-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

export default function DashboardsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleSave = useCallback((input: DashboardInput) => {
    setIsSaving(true);

    // Simulate async save
    setTimeout(() => {
      try {
        const dashboards = loadDashboards();
        const now = new Date().toISOString();

        const newDashboard: SavedDashboard = {
          id: generateId(),
          name: input.name,
          description: input.description,
          ownerId: "demo-user",
          visibility: input.visibility ?? "private",
          isTemplate: false,
          createdAt: now,
          updatedAt: now,
          widgetCount: input.widgets.length,
          widgets: input.widgets,
          layout: {
            columns: 12,
            rowHeight: 80,
            gap: 16,
            padding: 16,
            breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
            columnsPerBreakpoint: { lg: 12, md: 10, sm: 6, xs: 4 },
            compactType: "vertical",
          },
          defaultTimeRange: input.defaultTimeRange,
          tags: input.tags,
          version: 1,
        };

        dashboards.push(newDashboard);
        saveDashboards(dashboards);

        console.log("✅ Dashboard saved:", newDashboard.name, `(${newDashboard.widgetCount} widgets)`);
        showNotification("success", `Dashboard "${input.name}" created successfully!`);
      } catch (error) {
        console.error("Failed to save dashboard:", error);
        showNotification("error", "Failed to save dashboard");
      } finally {
        setIsSaving(false);
      }
    }, 500);
  }, [showNotification]);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Notification toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
        <h1 className="text-xl font-semibold">Custom Dashboards</h1>
        <Link
          href="/"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          &larr; Back
        </Link>
      </header>
      <DashboardEditor
        renderWidget={renderWidget}
        onSave={handleSave}
        isSaving={isSaving}
        className="flex-1"
      />
    </div>
  );
}
