"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/utils/cn";
import type {
  ScheduledReport,
  ReportRun,
  ReportFrequency,
  DayOfWeek,
  ExportFileFormat,
  ExportSection,
  ScheduledReportStatus,
} from "@/types/export";

// =============================================================================
// TYPES
// =============================================================================

export interface ScheduledReportsProps {
  /** List of scheduled reports */
  reports: ScheduledReport[];
  /** Report execution history */
  history: ReportRun[];
  /** Callback when creating a new report */
  onCreateReport?: (report: Omit<ScheduledReport, "id" | "createdAt" | "updatedAt" | "consecutiveFailures">) => void;
  /** Callback when updating a report */
  onUpdateReport?: (id: string, updates: Partial<ScheduledReport>) => void;
  /** Callback when deleting a report */
  onDeleteReport?: (id: string) => void;
  /** Callback when toggling report status */
  onToggleStatus?: (id: string, status: ScheduledReportStatus) => void;
  /** Callback when running a report manually */
  onRunNow?: (id: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Optional class name */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const FREQUENCY_LABELS: Record<ReportFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
};

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const FORMAT_LABELS: Record<ExportFileFormat, string> = {
  csv: "CSV",
  json: "JSON",
  xlsx: "Excel",
  markdown: "Markdown",
  pdf: "PDF",
};

const STATUS_COLORS: Record<ScheduledReportStatus, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
};

const RUN_STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-500/20 text-gray-400",
  running: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
};

// =============================================================================
// MOCK DATA (for demo purposes)
// =============================================================================

const MOCK_REPORTS: ScheduledReport[] = [
  {
    id: "1",
    name: "Weekly Revenue Report",
    description: "Revenue and order metrics for stakeholders",
    exportConfig: {
      format: "xlsx",
      sections: ["revenue", "subscriptions"],
      timeRange: "7d",
      includeComparison: true,
      includeTrends: true,
    },
    schedule: {
      frequency: "weekly",
      dayOfWeek: "monday",
      hourUTC: 9,
      minuteUTC: 0,
      timezone: "America/New_York",
    },
    delivery: {
      method: "email",
      recipients: ["team@example.com", "cfo@example.com"],
      includeInlinePreview: true,
    },
    status: "active",
    createdAt: "2025-12-01T10:00:00Z",
    updatedAt: "2026-01-10T15:30:00Z",
    lastRunAt: "2026-01-13T09:00:00Z",
    nextRunAt: "2026-01-20T09:00:00Z",
    consecutiveFailures: 0,
  },
  {
    id: "2",
    name: "Monthly Analytics Summary",
    description: "Comprehensive monthly overview for leadership",
    exportConfig: {
      format: "pdf",
      sections: ["all"],
      timeRange: "30d",
      includeComparison: true,
      includeTrends: true,
    },
    schedule: {
      frequency: "monthly",
      dayOfMonth: 1,
      hourUTC: 6,
      minuteUTC: 0,
      timezone: "UTC",
    },
    delivery: {
      method: "email",
      recipients: ["leadership@example.com"],
      includeInlinePreview: false,
    },
    status: "active",
    createdAt: "2025-11-15T08:00:00Z",
    updatedAt: "2026-01-01T06:00:00Z",
    lastRunAt: "2026-01-01T06:00:00Z",
    nextRunAt: "2026-02-01T06:00:00Z",
    consecutiveFailures: 0,
  },
  {
    id: "3",
    name: "Daily Traffic Snapshot",
    description: "Quick daily traffic overview",
    exportConfig: {
      format: "csv",
      sections: ["traffic"],
      timeRange: "7d",
      includeComparison: false,
      includeTrends: false,
    },
    schedule: {
      frequency: "daily",
      hourUTC: 7,
      minuteUTC: 30,
      timezone: "Europe/London",
    },
    delivery: {
      method: "webhook",
      url: "https://api.example.com/analytics-webhook",
      headers: { "X-API-Key": "***" },
    },
    status: "error",
    createdAt: "2026-01-05T12:00:00Z",
    updatedAt: "2026-01-12T07:30:00Z",
    lastRunAt: "2026-01-12T07:30:00Z",
    lastError: "Webhook endpoint returned 503 Service Unavailable",
    consecutiveFailures: 3,
  },
];

const MOCK_HISTORY: ReportRun[] = [
  {
    id: "run-1",
    reportId: "1",
    status: "completed",
    triggeredAt: "2026-01-13T09:00:00Z",
    startedAt: "2026-01-13T09:00:01Z",
    completedAt: "2026-01-13T09:00:15Z",
    durationMs: 14000,
    fileSizeBytes: 245760,
    rowCount: 1250,
  },
  {
    id: "run-2",
    reportId: "1",
    status: "completed",
    triggeredAt: "2026-01-06T09:00:00Z",
    startedAt: "2026-01-06T09:00:01Z",
    completedAt: "2026-01-06T09:00:12Z",
    durationMs: 11000,
    fileSizeBytes: 238592,
    rowCount: 1180,
  },
  {
    id: "run-3",
    reportId: "3",
    status: "failed",
    triggeredAt: "2026-01-12T07:30:00Z",
    startedAt: "2026-01-12T07:30:01Z",
    completedAt: "2026-01-12T07:30:05Z",
    durationMs: 4000,
    error: "Webhook endpoint returned 503 Service Unavailable",
  },
  {
    id: "run-4",
    reportId: "2",
    status: "completed",
    triggeredAt: "2026-01-01T06:00:00Z",
    startedAt: "2026-01-01T06:00:02Z",
    completedAt: "2026-01-01T06:00:45Z",
    durationMs: 43000,
    fileSizeBytes: 1048576,
    rowCount: 5420,
  },
];

// =============================================================================
// STYLES
// =============================================================================

const cardStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
  borderColor: "var(--border, rgba(255,255,255,0.1))",
};

const headerStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const labelStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const accentStyle = {
  color: "var(--accent, #3b82f6)",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(isoDate);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function getScheduleDescription(report: ScheduledReport): string {
  const { schedule } = report;
  const time = `${schedule.hourUTC.toString().padStart(2, "0")}:${schedule.minuteUTC.toString().padStart(2, "0")} UTC`;

  switch (schedule.frequency) {
    case "daily":
      return `Every day at ${time}`;
    case "weekly":
      return `Every ${DAY_LABELS[schedule.dayOfWeek ?? "monday"]} at ${time}`;
    case "monthly":
      return `Monthly on day ${schedule.dayOfMonth ?? 1} at ${time}`;
    case "quarterly":
      return `Quarterly at ${time}`;
    default:
      return time;
  }
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ReportCardProps {
  report: ScheduledReport;
  onToggleStatus?: (id: string, status: ScheduledReportStatus) => void;
  onRunNow?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: (id: string) => void;
}

function ReportCard({
  report,
  onToggleStatus,
  onRunNow,
  onEdit,
  onDelete,
  onViewHistory,
}: ReportCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      className="rounded-lg border p-4 transition-colors hover:border-[var(--text-secondary)]"
      style={cardStyle}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium" style={headerStyle}>
              {report.name}
            </h3>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                STATUS_COLORS[report.status]
              )}
            >
              {report.status}
            </span>
          </div>
          {report.description && (
            <p className="mt-1 text-sm" style={labelStyle}>
              {report.description}
            </p>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded p-1 transition-colors hover:bg-white/10"
            style={labelStyle}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              />
              <div
                className="absolute right-0 z-20 mt-1 w-48 rounded-lg border py-1 shadow-lg"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border)",
                }}
              >
                <button
                  onClick={() => {
                    onRunNow?.(report.id);
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/5"
                  style={headerStyle}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Now
                </button>
                <button
                  onClick={() => {
                    onToggleStatus?.(report.id, report.status === "active" ? "paused" : "active");
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/5"
                  style={headerStyle}
                >
                  {report.status === "active" ? (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                      Resume
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    onViewHistory?.(report.id);
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/5"
                  style={headerStyle}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View History
                </button>
                <button
                  onClick={() => {
                    onEdit?.(report.id);
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/5"
                  style={headerStyle}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <hr className="my-1" style={{ borderColor: "var(--border)" }} />
                <button
                  onClick={() => {
                    onDelete?.(report.id);
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report Details */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <div style={labelStyle}>Format</div>
          <div style={headerStyle}>{FORMAT_LABELS[report.exportConfig.format]}</div>
        </div>
        <div>
          <div style={labelStyle}>Schedule</div>
          <div style={headerStyle}>{FREQUENCY_LABELS[report.schedule.frequency]}</div>
        </div>
        <div>
          <div style={labelStyle}>Delivery</div>
          <div style={headerStyle} className="capitalize">
            {report.delivery.method}
          </div>
        </div>
        <div>
          <div style={labelStyle}>Sections</div>
          <div style={headerStyle}>
            {report.exportConfig.sections.includes("all")
              ? "All"
              : report.exportConfig.sections.length}
          </div>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-1" style={labelStyle}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {getScheduleDescription(report)}
        </div>
        {report.lastRunAt && (
          <div style={labelStyle}>
            Last run: {formatRelativeTime(report.lastRunAt)}
          </div>
        )}
        {report.nextRunAt && (
          <div style={accentStyle}>
            Next: {formatDate(report.nextRunAt)}
          </div>
        )}
      </div>

      {/* Error Message */}
      {report.status === "error" && report.lastError && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{report.lastError}</span>
          </div>
          <div className="mt-1 text-xs text-red-400/70">
            Failed {report.consecutiveFailures} time{report.consecutiveFailures !== 1 ? "s" : ""} in a row
          </div>
        </div>
      )}
    </div>
  );
}

interface HistoryItemProps {
  run: ReportRun;
  reportName?: string;
}

function HistoryItem({ run, reportName }: HistoryItemProps) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border p-3"
      style={cardStyle}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            RUN_STATUS_COLORS[run.status]
          )}
        >
          {run.status}
        </span>
        <div>
          {reportName && (
            <div className="text-sm font-medium" style={headerStyle}>
              {reportName}
            </div>
          )}
          <div className="text-xs" style={labelStyle}>
            {formatDate(run.triggeredAt)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs" style={labelStyle}>
        {run.durationMs && (
          <span>{formatDuration(run.durationMs)}</span>
        )}
        {run.fileSizeBytes && (
          <span>{formatFileSize(run.fileSizeBytes)}</span>
        )}
        {run.rowCount && (
          <span>{run.rowCount.toLocaleString()} rows</span>
        )}
        {run.error && (
          <span className="text-red-400" title={run.error}>
            Error
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ScheduledReports({
  reports: propReports,
  history: propHistory,
  onCreateReport,
  onUpdateReport,
  onDeleteReport,
  onToggleStatus,
  onRunNow,
  isLoading = false,
  className,
}: ScheduledReportsProps) {
  // Use mock data if no props provided
  const reports = propReports.length > 0 ? propReports : MOCK_REPORTS;
  const history = propHistory.length > 0 ? propHistory : MOCK_HISTORY;

  const [activeTab, setActiveTab] = useState<"reports" | "history">("reports");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Filter history for selected report
  const filteredHistory = useMemo(() => {
    if (!selectedReportId) return history;
    return history.filter((run) => run.reportId === selectedReportId);
  }, [history, selectedReportId]);

  // Get report name by ID
  const getReportName = useCallback(
    (id: string) => reports.find((r) => r.id === id)?.name,
    [reports]
  );

  // Summary stats
  const stats = useMemo(() => {
    const active = reports.filter((r) => r.status === "active").length;
    const paused = reports.filter((r) => r.status === "paused").length;
    const error = reports.filter((r) => r.status === "error").length;
    const recentRuns = history.slice(0, 10);
    const successRate =
      recentRuns.length > 0
        ? Math.round(
            (recentRuns.filter((r) => r.status === "completed").length /
              recentRuns.length) *
              100
          )
        : 100;
    return { active, paused, error, successRate };
  }, [reports, history]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold" style={headerStyle}>
            Scheduled Reports
          </h2>
          <p className="mt-1 text-sm" style={labelStyle}>
            Automated report generation and delivery
          </p>
        </div>
        <button
          onClick={() => onCreateReport?.({
            name: "New Report",
            exportConfig: {
              format: "csv",
              sections: ["all"],
              timeRange: "30d",
              includeComparison: false,
              includeTrends: true,
            },
            schedule: {
              frequency: "weekly",
              dayOfWeek: "monday",
              hourUTC: 9,
              minuteUTC: 0,
              timezone: "UTC",
            },
            delivery: {
              method: "email",
              recipients: [],
              includeInlinePreview: true,
            },
            status: "active",
          })}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border p-4" style={cardStyle}>
          <div className="text-2xl font-bold" style={headerStyle}>
            {stats.active}
          </div>
          <div className="text-sm" style={labelStyle}>
            Active Reports
          </div>
        </div>
        <div className="rounded-lg border p-4" style={cardStyle}>
          <div className="text-2xl font-bold" style={headerStyle}>
            {stats.paused}
          </div>
          <div className="text-sm" style={labelStyle}>
            Paused
          </div>
        </div>
        <div className="rounded-lg border p-4" style={cardStyle}>
          <div className="text-2xl font-bold text-red-400">{stats.error}</div>
          <div className="text-sm" style={labelStyle}>
            With Errors
          </div>
        </div>
        <div className="rounded-lg border p-4" style={cardStyle}>
          <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
            {stats.successRate}%
          </div>
          <div className="text-sm" style={labelStyle}>
            Success Rate
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => {
            setActiveTab("reports");
            setSelectedReportId(null);
          }}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "reports"
              ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "history"
              ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Run History ({history.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg
            className="h-8 w-8 animate-spin text-[var(--accent)]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : activeTab === "reports" ? (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div
              className="rounded-lg border p-8 text-center"
              style={cardStyle}
            >
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={labelStyle}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 font-medium" style={headerStyle}>
                No scheduled reports
              </h3>
              <p className="mt-1 text-sm" style={labelStyle}>
                Create your first scheduled report to automate data delivery.
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onToggleStatus={onToggleStatus}
                onRunNow={onRunNow}
                onEdit={(id) => onUpdateReport?.(id, {})}
                onDelete={onDeleteReport}
                onViewHistory={(id) => {
                  setSelectedReportId(id);
                  setActiveTab("history");
                }}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {selectedReportId && (
            <div className="flex items-center gap-2 text-sm" style={labelStyle}>
              <button
                onClick={() => setSelectedReportId(null)}
                className="flex items-center gap-1 hover:underline"
                style={accentStyle}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Reports
              </button>
              <span>/</span>
              <span>{getReportName(selectedReportId)}</span>
            </div>
          )}

          {filteredHistory.length === 0 ? (
            <div
              className="rounded-lg border p-8 text-center"
              style={cardStyle}
            >
              <p style={labelStyle}>No execution history available.</p>
            </div>
          ) : (
            filteredHistory.map((run) => (
              <HistoryItem
                key={run.id}
                run={run}
                reportName={selectedReportId ? undefined : getReportName(run.reportId)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ScheduledReports;
