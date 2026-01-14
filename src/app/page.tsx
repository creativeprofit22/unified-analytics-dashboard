"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { Dashboard, TimeRangePicker, ThemeToggle, FilterPanel, ExportButton, ComparisonToggle, ComparisonView, SettingsButton, NotificationBell, ToastContainer } from "@/components";
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
import { useAnalytics } from "@/hooks";
import { useFilters } from "@/contexts/FilterContext";
import type { TimeRange, CustomDateRange, ComparisonConfig } from "@/types/analytics";
import type { Widget, SavedDashboard } from "@/types/custom-dashboards";
import { DEFAULT_COMPARISON_CONFIG } from "@/types";
import { cn } from "@/utils/cn";

const STORAGE_KEY = "unified-analytics-dashboards";
const DEPLOYED_KEY = "unified-analytics-deployed-dashboards";

function loadDeployedDashboards(): SavedDashboard[] {
  if (typeof window === "undefined") return [];
  try {
    const deployedIds = JSON.parse(localStorage.getItem(DEPLOYED_KEY) || "[]") as string[];
    const allDashboards = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as SavedDashboard[];
    return allDashboards.filter(d => deployedIds.includes(d.id));
  } catch {
    return [];
  }
}

function renderWidget(widget: Widget): ReactNode {
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
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-sm text-[var(--text-secondary)]">{widget.title}</div>
        </div>
      );
  }
}

function formatDateRange(range?: CustomDateRange): string {
  if (!range) return "Selected Period";
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${formatDate(range.start)} - ${formatDate(range.end)}`;
}

type ActiveView = "main" | string; // "main" for default dashboard, or dashboard ID for custom

export default function HomePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [customRange, setCustomRange] = useState<CustomDateRange | undefined>();
  const [comparison, setComparison] = useState<ComparisonConfig>(DEFAULT_COMPARISON_CONFIG);
  const [deployedDashboards, setDeployedDashboards] = useState<SavedDashboard[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>("main");
  const { filters } = useFilters();

  // Load deployed dashboards on mount and when storage changes
  useEffect(() => {
    setDeployedDashboards(loadDeployedDashboards());

    // Listen for storage changes (from other tabs or the dashboards page)
    const handleStorageChange = () => {
      setDeployedDashboards(loadDeployedDashboards());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // SWR deduplicates this request with Dashboard's identical call
  const { data, comparisonData } = useAnalytics({ timeRange, filters, comparison });

  const handleTimeRangeChange = (range: TimeRange, custom?: CustomDateRange) => {
    setTimeRange(range);
    if (custom) {
      setCustomRange(custom);
    }
  };

  const activeDashboard = activeView !== "main"
    ? deployedDashboards.find(d => d.id === activeView)
    : null;

  return (
    <>
    <ToastContainer />
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-4 sm:px-6 lg:px-8 py-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Top row: Title and controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Unified Analytics Dashboard</h1>
              <p className="text-[var(--text-secondary)] mt-1 text-sm sm:text-base">
                Multi-platform analytics for GoHighLevel
              </p>
              <nav className="flex items-center gap-4 mt-2">
                <a href="/benchmarks" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Benchmarks
                </a>
                <a href="/dashboards" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Custom Dashboards
                </a>
                <a href="/alerts" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Alerts
                </a>
                <a href="/predictions" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Predictions
                </a>
                <a href="/attribution" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Attribution
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <ExportButton data={data ?? null} />
              <FilterPanel />
              <NotificationBell />
              <ThemeToggle />
              <SettingsButton />
              {!comparison.enabled && (
                <TimeRangePicker
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                  customRange={customRange}
                />
              )}
            </div>
          </div>

          {/* Dashboard Tabs - shown when there are deployed dashboards */}
          {deployedDashboards.length > 0 && (
            <div className="flex gap-1 p-1.5 rounded-xl bg-[var(--bg-secondary,rgba(255,255,255,0.03))] border border-[var(--border,rgba(255,255,255,0.05))] overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveView("main")}
                className={cn(
                  "flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeView === "main"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-[var(--text-secondary,rgba(255,255,255,0.6))] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary,rgba(255,255,255,0.08))]"
                )}
              >
                Main Dashboard
              </button>
              {deployedDashboards.map((dashboard) => (
                <button
                  key={dashboard.id}
                  onClick={() => setActiveView(dashboard.id)}
                  className={cn(
                    "flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    activeView === dashboard.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-[var(--text-secondary,rgba(255,255,255,0.6))] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary,rgba(255,255,255,0.08))]"
                  )}
                >
                  {dashboard.name}
                </button>
              ))}
            </div>
          )}

          {/* Comparison Toggle - only show on main dashboard */}
          {activeView === "main" && (
            <ComparisonToggle config={comparison} onChange={setComparison} />
          )}
        </div>
      </header>

      {/* Comparison Mode Banner - only show on main dashboard */}
      {activeView === "main" && comparison.enabled && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 px-4 py-3 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-blue-400">
              <strong>Comparison Mode:</strong>{" "}
              <span className="text-blue-300">{formatDateRange(comparison.currentRange)}</span>
              {" vs "}
              <span className="text-purple-300">{formatDateRange(comparison.comparisonRange)}</span>
            </span>
          </div>
          <button
            onClick={() => setComparison({ ...comparison, enabled: false })}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Disable
          </button>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {activeView === "main" ? (
          comparison.enabled && data && comparisonData ? (
            <ComparisonView
              currentData={data}
              comparisonData={comparisonData}
              comparison={comparison}
            />
          ) : (
            <Dashboard timeRange={timeRange} comparison={comparison} />
          )
        ) : activeDashboard ? (
          <DashboardViewer
            dashboard={activeDashboard}
            renderWidget={renderWidget}
          />
        ) : (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            Dashboard not found. It may have been deleted.
          </div>
        )}
      </div>
    </main>
    </>
  );
}
