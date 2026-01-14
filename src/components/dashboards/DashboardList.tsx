"use client";

import { useState, useCallback } from "react";
import type { SavedDashboard } from "@/types/custom-dashboards";
import { cn } from "@/utils/cn";

// =============================================================================
// TYPES
// =============================================================================

interface DashboardListProps {
  dashboards: SavedDashboard[];
  deployedIds: Set<string>;
  onView: (dashboard: SavedDashboard) => void;
  onEdit: (dashboard: SavedDashboard) => void;
  onDeploy: (dashboardId: string) => void;
  onUndeploy: (dashboardId: string) => void;
  onDelete: (dashboardId: string) => void;
  className?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format a date string to a nice readable format (e.g., "Jan 13, 2026")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// =============================================================================
// ICONS
// =============================================================================

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    </svg>
  );
}

// =============================================================================
// DASHBOARD CARD COMPONENT
// =============================================================================

interface DashboardCardProps {
  dashboard: SavedDashboard;
  isDeployed: boolean;
  onView: () => void;
  onEdit: () => void;
  onDeploy: () => void;
  onUndeploy: () => void;
  onDelete: () => void;
}

function DashboardCard({
  dashboard,
  isDeployed,
  onView,
  onEdit,
  onDeploy,
  onUndeploy,
  onDelete,
}: DashboardCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    onDelete();
    setShowDeleteConfirm(false);
  }, [onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 transition-all duration-200",
        "bg-[var(--bg-secondary,rgba(255,255,255,0.03))]",
        "border-[var(--border-color,rgba(255,255,255,0.1))]",
        "hover:shadow-lg hover:scale-[1.02]",
        "hover:border-[var(--accent)]/50"
      )}
    >
      {/* Header with name and deployed badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-[var(--text-primary)] truncate flex-1">
          {dashboard.name}
        </h3>
        {isDeployed && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
              "bg-green-500/20 text-green-400 border border-green-500/30"
            )}
          >
            Deployed
          </span>
        )}
      </div>

      {/* Description */}
      {dashboard.description && (
        <p
          className={cn(
            "text-sm text-[var(--text-secondary)] mb-3",
            "line-clamp-2 overflow-hidden"
          )}
        >
          {dashboard.description}
        </p>
      )}

      {/* Metadata row */}
      <div className="flex items-center gap-3 mb-4">
        {/* Widget count badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
            "bg-[var(--accent)]/10 text-[var(--accent)]"
          )}
        >
          {dashboard.widgetCount} widget{dashboard.widgetCount !== 1 ? "s" : ""}
        </span>

        {/* Created date */}
        <span className="text-xs text-[var(--text-secondary)]">
          {formatDate(dashboard.createdAt)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 pt-3 border-t border-[var(--border-color,rgba(255,255,255,0.1))]">
        {/* View button */}
        <button
          onClick={onView}
          className={cn(
            "p-2 rounded-lg transition-colors",
            "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            "hover:bg-[var(--bg-primary)]"
          )}
          title="View dashboard"
          aria-label="View dashboard"
        >
          <EyeIcon className="w-4 h-4" />
        </button>

        {/* Edit button */}
        <button
          onClick={onEdit}
          className={cn(
            "p-2 rounded-lg transition-colors",
            "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            "hover:bg-[var(--bg-primary)]"
          )}
          title="Edit dashboard"
          aria-label="Edit dashboard"
        >
          <PencilIcon className="w-4 h-4" />
        </button>

        {/* Deploy/Undeploy button */}
        <button
          onClick={isDeployed ? onUndeploy : onDeploy}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isDeployed
              ? "text-green-400 hover:text-green-300 hover:bg-green-500/10"
              : "text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10"
          )}
          title={isDeployed ? "Undeploy dashboard" : "Deploy dashboard"}
          aria-label={isDeployed ? "Undeploy dashboard" : "Deploy dashboard"}
        >
          <RocketIcon className="w-4 h-4" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          className={cn(
            "p-2 rounded-lg transition-colors",
            "text-[var(--text-secondary)] hover:text-red-400",
            "hover:bg-red-500/10"
          )}
          title="Delete dashboard"
          aria-label="Delete dashboard"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div
          className={cn(
            "absolute inset-0 rounded-lg flex flex-col items-center justify-center p-4",
            "bg-[var(--bg-secondary,rgba(0,0,0,0.95))] backdrop-blur-sm",
            "border border-red-500/30"
          )}
        >
          <p className="text-sm text-[var(--text-primary)] text-center mb-4">
            Delete <span className="font-semibold">{dashboard.name}</span>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteCancel}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                "border border-[var(--border-color,rgba(255,255,255,0.1))]",
                "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                "hover:bg-[var(--bg-primary)]"
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                "bg-red-600 text-white hover:bg-red-700"
              )}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// DASHBOARD LIST COMPONENT
// =============================================================================

export function DashboardList({
  dashboards,
  deployedIds,
  onView,
  onEdit,
  onDeploy,
  onUndeploy,
  onDelete,
  className,
}: DashboardListProps) {
  // Empty state
  if (dashboards.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-16 px-4",
          className
        )}
      >
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4",
            "bg-[var(--bg-secondary,rgba(255,255,255,0.05))]"
          )}
        >
          <LayoutIcon className="w-8 h-8 text-[var(--text-secondary)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
          No dashboards yet
        </h3>
        <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
          No dashboards yet. Create your first dashboard to get started.
        </p>
      </div>
    );
  }

  // Dashboard grid
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {dashboards.map((dashboard) => (
        <DashboardCard
          key={dashboard.id}
          dashboard={dashboard}
          isDeployed={deployedIds.has(dashboard.id)}
          onView={() => onView(dashboard)}
          onEdit={() => onEdit(dashboard)}
          onDeploy={() => onDeploy(dashboard.id)}
          onUndeploy={() => onUndeploy(dashboard.id)}
          onDelete={() => onDelete(dashboard.id)}
        />
      ))}
    </div>
  );
}

export default DashboardList;
