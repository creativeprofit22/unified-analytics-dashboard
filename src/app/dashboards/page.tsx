"use client";

import { ReactNode, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { DashboardEditor, DashboardList, DashboardViewer } from "@/components/dashboards";
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
const DEPLOYED_KEY = "unified-analytics-deployed-dashboards";

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

function loadDeployedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(DEPLOYED_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

function saveDeployedIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEPLOYED_KEY, JSON.stringify([...ids]));
}

type ViewMode = "list" | "editor" | "view";

export default function DashboardsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [dashboards, setDashboards] = useState<SavedDashboard[]>([]);
  const [deployedIds, setDeployedIds] = useState<Set<string>>(new Set());
  const [selectedDashboard, setSelectedDashboard] = useState<SavedDashboard | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load dashboards and deployed IDs on mount
  useEffect(() => {
    setDashboards(loadDashboards());
    setDeployedIds(loadDeployedIds());
  }, []);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleSave = useCallback((input: DashboardInput) => {
    setIsSaving(true);

    setTimeout(() => {
      try {
        const currentDashboards = loadDashboards();
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

        currentDashboards.push(newDashboard);
        saveDashboards(currentDashboards);
        setDashboards(currentDashboards);

        console.log("✅ Dashboard saved:", newDashboard.name, `(${newDashboard.widgetCount} widgets)`);
        showNotification("success", `Dashboard "${input.name}" created successfully!`);
        setViewMode("list");
      } catch (error) {
        console.error("Failed to save dashboard:", error);
        showNotification("error", "Failed to save dashboard");
      } finally {
        setIsSaving(false);
      }
    }, 500);
  }, [showNotification]);

  const handleView = useCallback((dashboard: SavedDashboard) => {
    setSelectedDashboard(dashboard);
    setViewMode("view");
  }, []);

  const handleEdit = useCallback((dashboard: SavedDashboard) => {
    setSelectedDashboard(dashboard);
    setViewMode("editor");
  }, []);

  const handleDeploy = useCallback((dashboardId: string) => {
    const newDeployed = new Set(deployedIds);
    newDeployed.add(dashboardId);
    setDeployedIds(newDeployed);
    saveDeployedIds(newDeployed);
    const dashboard = dashboards.find(d => d.id === dashboardId);
    showNotification("success", `"${dashboard?.name}" deployed to main page`);
  }, [deployedIds, dashboards, showNotification]);

  const handleUndeploy = useCallback((dashboardId: string) => {
    const newDeployed = new Set(deployedIds);
    newDeployed.delete(dashboardId);
    setDeployedIds(newDeployed);
    saveDeployedIds(newDeployed);
    const dashboard = dashboards.find(d => d.id === dashboardId);
    showNotification("success", `"${dashboard?.name}" removed from main page`);
  }, [deployedIds, dashboards, showNotification]);

  const handleDelete = useCallback((dashboardId: string) => {
    const newDashboards = dashboards.filter(d => d.id !== dashboardId);
    saveDashboards(newDashboards);
    setDashboards(newDashboards);
    // Also remove from deployed if it was deployed
    if (deployedIds.has(dashboardId)) {
      const newDeployed = new Set(deployedIds);
      newDeployed.delete(dashboardId);
      setDeployedIds(newDeployed);
      saveDeployedIds(newDeployed);
    }
    showNotification("success", "Dashboard deleted");
  }, [dashboards, deployedIds, showNotification]);

  const handleBack = useCallback(() => {
    setViewMode("list");
    setSelectedDashboard(null);
  }, []);

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

      {viewMode === "list" && (
        <>
          <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
            <div>
              <h1 className="text-xl font-semibold">Custom Dashboards</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {dashboards.length} dashboard{dashboards.length !== 1 ? "s" : ""} • {deployedIds.size} deployed
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("editor")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Dashboard
              </button>
              <Link
                href="/"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                &larr; Back
              </Link>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6">
            <DashboardList
              dashboards={dashboards}
              deployedIds={deployedIds}
              onView={handleView}
              onEdit={handleEdit}
              onDeploy={handleDeploy}
              onUndeploy={handleUndeploy}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}

      {viewMode === "editor" && (
        <>
          <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
            <h1 className="text-xl font-semibold">
              {selectedDashboard ? `Edit: ${selectedDashboard.name}` : "New Dashboard"}
            </h1>
            <button
              onClick={handleBack}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              &larr; Back to List
            </button>
          </header>
          <DashboardEditor
            initialDashboard={selectedDashboard}
            renderWidget={renderWidget}
            onSave={handleSave}
            onClose={handleBack}
            isSaving={isSaving}
            className="flex-1"
          />
        </>
      )}

      {viewMode === "view" && selectedDashboard && (
        <>
          <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
            <div>
              <h1 className="text-xl font-semibold">{selectedDashboard.name}</h1>
              {selectedDashboard.description && (
                <p className="text-sm text-[var(--text-secondary)] mt-1">{selectedDashboard.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleEdit(selectedDashboard)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={handleBack}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                &larr; Back to List
              </button>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <DashboardViewer
              dashboard={selectedDashboard}
              renderWidget={renderWidget}
            />
          </div>
        </>
      )}
    </div>
  );
}
