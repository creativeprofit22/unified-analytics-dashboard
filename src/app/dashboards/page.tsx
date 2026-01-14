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
    case "table":
      return (
        <div className={baseStyle}>
          <div className="text-center text-[var(--text-secondary)]">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div className="text-sm">{widget.title}</div>
          </div>
        </div>
      );
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
