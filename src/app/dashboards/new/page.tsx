"use client";

import { useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
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

export default function NewDashboardPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback((input: DashboardInput) => {
    setIsSaving(true);

    setTimeout(() => {
      try {
        const currentDashboards = loadDashboards();
        const now = new Date().toISOString();
        const newId = `dashboard-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

        const newDashboard: SavedDashboard = {
          id: newId,
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

        currentDashboards.push(newDashboard);
        saveDashboards(currentDashboards);

        console.log("Dashboard saved:", newDashboard.name, `(${newDashboard.widgetCount} widgets)`);
        router.push("/dashboards");
      } catch (error) {
        console.error("Failed to save dashboard:", error);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  }, [router]);

  const handleClose = useCallback(() => {
    router.push("/dashboards");
  }, [router]);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
        <h1 className="text-xl font-semibold">New Dashboard</h1>
        <Link
          href="/dashboards"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          &larr; Back to Dashboards
        </Link>
      </header>
      <DashboardEditor
        initialDashboard={null}
        renderWidget={renderWidget}
        onSave={handleSave}
        onClose={handleClose}
        isSaving={isSaving}
        className="flex-1"
      />
    </div>
  );
}
