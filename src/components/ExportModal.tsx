"use client";

import { useId, useState } from "react";
import { exportData, getAllFormats, type ExportFormat } from "@/lib/exporters";
import type { UnifiedAnalyticsData } from "@/types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: UnifiedAnalyticsData | null;
}

export function ExportModal({ isOpen, onClose, data }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [isExporting, setIsExporting] = useState(false);
  const titleId = useId();
  const formats = getAllFormats();

  if (!isOpen) return null;

  const handleExport = () => {
    if (!data) return;

    setIsExporting(true);
    try {
      exportData(data, selectedFormat);
      // Close modal after short delay for PDF (print dialog) or immediately for others
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
      alert("Export failed. Please try again.");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="w-full max-w-md rounded-lg bg-[var(--bg-primary)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold">
            Export Analytics
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!data ? (
          <p className="text-[var(--text-secondary)]">No data available to export.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              Select a format to export your analytics data for the {data.timeRange ?? "selected"} time range.
            </p>

            <div className="mb-6 space-y-2">
              {formats.map((format) => (
                <label
                  key={format.format}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    selectedFormat === format.format
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-[var(--border)] hover:border-[var(--text-secondary)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format.format}
                    checked={selectedFormat === format.format}
                    onChange={() => setSelectedFormat(format.format)}
                    className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{format.label}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{format.description}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent)]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
