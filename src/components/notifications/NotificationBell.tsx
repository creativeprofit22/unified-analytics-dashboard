"use client";

import { memo, useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import { useAlerts } from "@/hooks";
import { useFilters } from "@/contexts/FilterContext";
import type { Anomaly, ThresholdAlert, Goal } from "@/types";

// =============================================================================
// STYLES
// =============================================================================

const bellStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  width: "320px",
  maxHeight: "400px",
  overflowY: "auto",
  backgroundColor: "var(--bg-primary, #111827)",
  border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  zIndex: 100,
};

// =============================================================================
// BELL ICON SVG
// =============================================================================

function BellIcon({ hasNotifications }: { hasNotifications: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(hasNotifications && "animate-[wiggle_0.5s_ease-in-out]")}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

// =============================================================================
// NOTIFICATION ITEM
// =============================================================================

interface NotificationItemProps {
  type: "anomaly" | "threshold" | "goal";
  title: string;
  message: string;
  severity: "critical" | "warning" | "info" | "success";
  timestamp: string;
  onClick: () => void;
}

function NotificationItem({ type, title, message, severity, timestamp, onClick }: NotificationItemProps) {
  const severityColors = {
    critical: { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.3)", dot: "#ef4444" },
    warning: { bg: "rgba(234, 179, 8, 0.1)", border: "rgba(234, 179, 8, 0.3)", dot: "#eab308" },
    info: { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)", dot: "#3b82f6" },
    success: { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.3)", dot: "#22c55e" },
  };

  const colors = severityColors[severity];
  const timeAgo = getTimeAgo(timestamp);

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
    >
      <div className="flex items-start gap-3">
        <span
          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
          style={{ backgroundColor: colors.dot }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{message}</p>
          <p className="text-xs text-[var(--text-tertiary,rgba(255,255,255,0.4))] mt-1">{timeAgo}</p>
        </div>
      </div>
    </button>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function buildNotifications(
  anomalies: Anomaly[],
  thresholds: ThresholdAlert[],
  goals: Goal[]
): NotificationItemProps[] {
  const notifications: NotificationItemProps[] = [];

  // Add critical/warning anomalies
  anomalies
    .filter((a) => a.severity === "critical" || a.severity === "warning")
    .forEach((a) => {
      notifications.push({
        type: "anomaly",
        title: `${a.metricLabel} ${a.direction === "spike" ? "Spike" : "Drop"}`,
        message: `${a.direction === "spike" ? "Increased" : "Decreased"} to ${a.value.toFixed(1)} (expected ${a.expectedValue.toFixed(1)})`,
        severity: a.severity,
        timestamp: a.detectedAt,
        onClick: () => {},
      });
    });

  // Add breached/warning thresholds
  thresholds
    .filter((t) => t.status === "breached" || t.status === "warning")
    .forEach((t) => {
      notifications.push({
        type: "threshold",
        title: t.rule.name,
        message: t.message,
        severity: t.status === "breached" ? "critical" : "warning",
        timestamp: t.breachedAt || new Date().toISOString(),
        onClick: () => {},
      });
    });

  // Add at-risk/behind goals
  goals
    .filter((g) => g.status === "at_risk" || g.status === "behind")
    .forEach((g) => {
      notifications.push({
        type: "goal",
        title: g.name,
        message: `${g.progress.toFixed(0)}% complete - ${g.status === "behind" ? "Behind schedule" : "At risk"}`,
        severity: g.status === "behind" ? "critical" : "warning",
        timestamp: new Date().toISOString(),
        onClick: () => {},
      });
    });

  // Sort by severity (critical first) then timestamp
  return notifications.sort((a, b) => {
    if (a.severity === "critical" && b.severity !== "critical") return -1;
    if (b.severity === "critical" && a.severity !== "critical") return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

function NotificationBellComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: alertsData } = useAlerts();
  const { setActiveTab } = useFilters();

  const notifications = alertsData
    ? buildNotifications(alertsData.anomalies, alertsData.thresholdAlerts, alertsData.goals)
    : [];

  const criticalCount = notifications.filter((n) => n.severity === "critical").length;
  const totalCount = notifications.length;

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleViewAll = useCallback(() => {
    setActiveTab("alerts");
    setIsOpen(false);
  }, [setActiveTab]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className={cn(
          "relative p-2 rounded-lg border transition-all duration-200",
          "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500",
          isOpen && "ring-1 ring-white/20"
        )}
        style={bellStyle}
        aria-label={`Notifications (${totalCount} alerts)`}
      >
        <BellIcon hasNotifications={criticalCount > 0} />

        {/* Badge */}
        {totalCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center",
              "text-xs font-bold rounded-full px-1",
              criticalCount > 0 ? "bg-red-500 text-white" : "bg-yellow-500 text-black"
            )}
          >
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={dropdownStyle}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="font-semibold text-sm text-[var(--text-primary)]">Notifications</span>
            {criticalCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                {criticalCount} critical
              </span>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div>
              {notifications.slice(0, 5).map((notification, index) => (
                <NotificationItem
                  key={`${notification.type}-${index}`}
                  {...notification}
                  onClick={() => {
                    handleViewAll();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
              No alerts to show
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-white/10">
              <button
                onClick={handleViewAll}
                className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all alerts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const NotificationBell = memo(NotificationBellComponent);
export default NotificationBell;
