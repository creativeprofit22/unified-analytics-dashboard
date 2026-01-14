"use client";

import { ReactNode } from "react";
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
import type { Widget } from "@/types/custom-dashboards";

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

export default function DashboardsPage() {
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
        <h1 className="text-xl font-semibold">Custom Dashboards</h1>
        <Link
          href="/"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          &larr; Back
        </Link>
      </header>
      <DashboardEditor renderWidget={renderWidget} className="flex-1" />
    </div>
  );
}
