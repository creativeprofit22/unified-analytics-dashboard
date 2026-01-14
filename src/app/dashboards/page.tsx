"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { DashboardEditor } from "@/components/dashboards";
import type { Widget } from "@/types/custom-dashboards";

function renderWidget(widget: Widget): ReactNode {
  const baseStyle = "h-full w-full flex items-center justify-center rounded-lg border border-dashed border-[var(--border-color,rgba(255,255,255,0.2))]";

  switch (widget.config.type) {
    case "metric-card":
      return (
        <div className={baseStyle}>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--text-primary)]">--</div>
            <div className="text-sm text-[var(--text-secondary)]">{widget.title}</div>
          </div>
        </div>
      );
    case "line-chart":
    case "bar-chart":
    case "pie-chart":
    case "area-chart":
      return (
        <div className={baseStyle}>
          <div className="text-center text-[var(--text-secondary)]">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" />
            </svg>
            <div className="text-sm">{widget.title}</div>
          </div>
        </div>
      );
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
