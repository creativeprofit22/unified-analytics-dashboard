"use client";

import { useState, useId, useMemo, useCallback } from "react";
import { cn } from "@/utils/cn";
import {
  exportData,
  getAllFormats,
  getExportContent,
  type ExportFormat,
} from "@/lib/exporters";
import type {
  UnifiedAnalyticsData,
  TimeRange,
  ExportSection,
  ExportConfig,
} from "@/types";

// =============================================================================
// TYPES
// =============================================================================

export interface ExportDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Analytics data to export */
  data: UnifiedAnalyticsData | null;
  /** Current time range */
  currentTimeRange?: TimeRange;
  /** Optional class name */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
  "12m": "Last 12 Months",
  ytd: "Year to Date",
  custom: "Custom Range",
};

const SECTION_INFO: {
  section: ExportSection;
  label: string;
  description: string;
}[] = [
  {
    section: "traffic",
    label: "Traffic & Acquisition",
    description: "Sessions, visitors, sources, landing pages",
  },
  {
    section: "seo",
    label: "SEO",
    description: "Keywords, rankings, backlinks, search queries",
  },
  {
    section: "conversions",
    label: "Conversions & Funnel",
    description: "Conversion rates, funnel steps, abandonment",
  },
  {
    section: "revenue",
    label: "Revenue & Orders",
    description: "Revenue, transactions, AOV, products",
  },
  {
    section: "subscriptions",
    label: "Subscriptions",
    description: "Subscribers, MRR, churn, retention",
  },
  {
    section: "payments",
    label: "Payments",
    description: "Payment success/failure, recovery rates",
  },
  {
    section: "unitEconomics",
    label: "Unit Economics",
    description: "CAC, LTV, margins, ARPU",
  },
  {
    section: "demographics",
    label: "Demographics",
    description: "Geography, devices, browsers",
  },
  {
    section: "segmentation",
    label: "Segmentation",
    description: "Campaigns, cohorts, behavior segments",
  },
  {
    section: "campaigns",
    label: "Campaigns",
    description: "Email/SMS campaigns, engagement, ROI",
  },
];

// =============================================================================
// STYLES
// =============================================================================

const dialogBackdropStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(4px)",
};

const dialogContentStyle = {
  backgroundColor: "var(--bg-primary, #0f172a)",
  borderColor: "var(--border, rgba(255,255,255,0.1))",
};

const headerStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const labelStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const sectionCardStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
  borderColor: "var(--border, rgba(255,255,255,0.1))",
};

const sectionCardSelectedStyle = {
  backgroundColor: "var(--accent, #3b82f6)",
  borderColor: "var(--accent, #3b82f6)",
};

const previewStyle = {
  backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))",
  borderColor: "var(--border, rgba(255,255,255,0.1))",
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ExportDialog({
  isOpen,
  onClose,
  data,
  currentTimeRange = "30d",
  className,
}: ExportDialogProps) {
  const titleId = useId();
  const formats = getAllFormats();

  // Form state
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [selectedSections, setSelectedSections] = useState<Set<ExportSection>>(
    new Set(["all" as ExportSection])
  );
  const [includeComparison, setIncludeComparison] = useState(false);
  const [includeTrends, setIncludeTrends] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Determine available sections based on data
  const availableSections = useMemo(() => {
    if (!data) return [];
    return SECTION_INFO.filter(({ section }) => {
      if (section === "all") return true;
      return data[section as keyof UnifiedAnalyticsData] !== undefined;
    });
  }, [data]);

  // Check if all sections are selected
  const allSelected =
    selectedSections.has("all") ||
    availableSections.every((s) => selectedSections.has(s.section));

  // Toggle section selection
  const toggleSection = useCallback((section: ExportSection) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (section === "all") {
        // Toggle all
        if (next.has("all")) {
          next.clear();
        } else {
          next.clear();
          next.add("all");
        }
      } else {
        // Toggle individual
        next.delete("all");
        if (next.has(section)) {
          next.delete(section);
        } else {
          next.add(section);
        }
      }
      return next;
    });
  }, []);

  // Select all sections
  const selectAll = useCallback(() => {
    setSelectedSections(new Set(["all" as ExportSection]));
  }, []);

  // Generate preview content
  const previewContent = useMemo(() => {
    if (!data || !showPreview) return "";
    if (selectedFormat === "pdf") return "PDF preview not available";

    try {
      const content = getExportContent(data, selectedFormat);
      // Truncate for preview
      const lines = content.split("\n").slice(0, 20);
      return lines.join("\n") + (content.split("\n").length > 20 ? "\n..." : "");
    } catch {
      return "Preview generation failed";
    }
  }, [data, selectedFormat, showPreview]);

  // Estimate export size
  const estimatedSize = useMemo(() => {
    if (!data) return "0 KB";
    try {
      const content = selectedFormat === "pdf" ? "" : getExportContent(data, selectedFormat);
      const bytes = new Blob([content]).size;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    } catch {
      return "Unknown";
    }
  }, [data, selectedFormat]);

  // Handle export
  const handleExport = useCallback(() => {
    if (!data) return;

    setIsExporting(true);
    try {
      exportData(data, selectedFormat);
      // Close after short delay for non-PDF exports
      setTimeout(() => {
        setIsExporting(false);
        if (selectedFormat !== "pdf") {
          onClose();
        } else {
          setIsExporting(false);
        }
      }, 100);
    } catch {
      setIsExporting(false);
      // Could add error toast here
    }
  }, [data, selectedFormat, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4",
        className
      )}
      style={dialogBackdropStyle}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="w-full max-w-2xl rounded-xl border shadow-2xl"
        style={dialogContentStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 id={titleId} className="text-lg font-semibold" style={headerStyle}>
              Export Analytics Data
            </h2>
            <p className="mt-1 text-sm" style={labelStyle}>
              Time Range: {TIME_RANGE_LABELS[currentTimeRange]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!data ? (
          <div className="p-6 text-center" style={labelStyle}>
            No data available to export.
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {/* Format Selection */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium" style={labelStyle}>
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {formats.map((format) => (
                  <button
                    key={format.format}
                    onClick={() => setSelectedFormat(format.format)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all",
                      selectedFormat === format.format
                        ? "border-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-[var(--border)] hover:border-[var(--text-secondary)]"
                    )}
                  >
                    <div className="font-medium" style={headerStyle}>
                      {format.label.split(" ")[0]}
                    </div>
                    <div className="mt-1 text-xs" style={labelStyle}>
                      {format.extension}
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs" style={labelStyle}>
                {formats.find((f) => f.format === selectedFormat)?.description}
              </p>
            </div>

            {/* Section Selection */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium" style={labelStyle}>
                  Data Sections
                </label>
                <button
                  onClick={selectAll}
                  className="text-xs font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableSections.map(({ section, label, description }) => (
                  <button
                    key={section}
                    onClick={() => toggleSection(section)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all"
                    )}
                    style={
                      selectedSections.has(section) || (allSelected && section !== "all")
                        ? sectionCardSelectedStyle
                        : sectionCardStyle
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border",
                          selectedSections.has(section) || allSelected
                            ? "border-white bg-white"
                            : "border-current"
                        )}
                      >
                        {(selectedSections.has(section) || allSelected) && (
                          <svg className="h-3 w-3 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-white">{label}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/70">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="mb-6 space-y-3">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeTrends}
                  onChange={(e) => setIncludeTrends(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                />
                <span className="text-sm" style={headerStyle}>
                  Include trend data (time series)
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeComparison}
                  onChange={(e) => setIncludeComparison(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                />
                <span className="text-sm" style={headerStyle}>
                  Include comparison data
                </span>
              </label>
            </div>

            {/* Preview Toggle */}
            {selectedFormat !== "pdf" && (
              <div className="mb-6">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  <svg
                    className={cn("h-4 w-4 transition-transform", showPreview && "rotate-90")}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
                {showPreview && (
                  <pre
                    className="mt-3 max-h-48 overflow-auto rounded-lg border p-3 text-xs font-mono"
                    style={previewStyle}
                  >
                    {previewContent}
                  </pre>
                )}
              </div>
            )}

            {/* Export Info */}
            <div
              className="flex items-center justify-between rounded-lg border p-3"
              style={sectionCardStyle}
            >
              <div>
                <span className="text-sm" style={labelStyle}>
                  Estimated file size:
                </span>
                <span className="ml-2 font-medium" style={headerStyle}>
                  {estimatedSize}
                </span>
              </div>
              <div className="text-xs" style={labelStyle}>
                {availableSections.length} sections available
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 border-t p-4" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !data}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {isExporting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                Exporting...
              </span>
            ) : (
              `Export ${selectedFormat.toUpperCase()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportDialog;
