"use client";

import type { ReactNode } from "react";
import type { SavedDashboard, Widget } from "@/types/custom-dashboards";
import { WidgetGrid } from "./WidgetGrid";
import { cn } from "@/utils/cn";

// =============================================================================
// TYPES
// =============================================================================

interface DashboardViewerProps {
  /** The saved dashboard to render */
  dashboard: SavedDashboard;
  /** Render function for widget content */
  renderWidget: (widget: Widget) => ReactNode;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// DASHBOARD VIEWER COMPONENT
// =============================================================================

/**
 * DashboardViewer renders a read-only view of a deployed dashboard.
 * It displays the dashboard header with title/description and renders
 * all widgets in a non-editable grid layout.
 */
export function DashboardViewer({
  dashboard,
  renderWidget,
  className,
}: DashboardViewerProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {/* Dashboard header */}
      {(dashboard.name || dashboard.description) && (
        <header className="px-4 py-3 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
          {dashboard.name && (
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              {dashboard.name}
            </h1>
          )}
          {dashboard.description && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {dashboard.description}
            </p>
          )}
        </header>
      )}

      {/* Widget grid (read-only) */}
      <WidgetGrid
        widgets={dashboard.widgets}
        layout={dashboard.layout}
        editMode={false}
        renderWidget={renderWidget}
      />
    </div>
  );
}

export default DashboardViewer;
