/**
 * Unified Export Interface
 *
 * Provides a single entry point for all export formats.
 */

import type { UnifiedAnalyticsData } from "@/types";
import { exportToCSV, downloadCSV } from "./csv";
import { exportToJSON, downloadJSON, type JSONExportOptions } from "./json";
import { exportToMarkdown, downloadMarkdown } from "./markdown";
import { exportToPDF, downloadPDFHTML } from "./pdf";

export type ExportFormat = "csv" | "json" | "markdown" | "pdf";

export interface ExportOptions {
  /** Filename without extension */
  filename?: string;
  /** JSON-specific options */
  json?: JSONExportOptions;
}

const formatExtensions: Record<ExportFormat, string> = {
  csv: ".csv",
  json: ".json",
  markdown: ".md",
  pdf: ".pdf",
};

const formatLabels: Record<ExportFormat, string> = {
  csv: "CSV (Spreadsheet)",
  json: "JSON (Raw Data)",
  markdown: "Markdown (Document)",
  pdf: "PDF (Print)",
};

const formatDescriptions: Record<ExportFormat, string> = {
  csv: "Tabular data for Excel, Google Sheets, or data analysis tools",
  json: "Structured data for developers and programmatic access",
  markdown: "Formatted document with tables for documentation",
  pdf: "Print-ready report via browser print dialog",
};

/**
 * Export analytics data to the specified format
 */
export function exportData(
  data: UnifiedAnalyticsData,
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const baseFilename = options.filename ?? `analytics-${data.timeRange ?? "export"}-${Date.now()}`;

  switch (format) {
    case "csv":
      downloadCSV(data, `${baseFilename}${formatExtensions.csv}`);
      break;
    case "json":
      downloadJSON(data, `${baseFilename}${formatExtensions.json}`, options.json);
      break;
    case "markdown":
      downloadMarkdown(data, `${baseFilename}${formatExtensions.markdown}`);
      break;
    case "pdf":
      exportToPDF(data);
      break;
  }
}

/**
 * Get raw exported content as string (except PDF which uses print dialog)
 */
export function getExportContent(
  data: UnifiedAnalyticsData,
  format: Exclude<ExportFormat, "pdf">,
  options: ExportOptions = {}
): string {
  switch (format) {
    case "csv":
      return exportToCSV(data);
    case "json":
      return exportToJSON(data, options.json);
    case "markdown":
      return exportToMarkdown(data);
  }
}

/**
 * Get export format metadata
 */
export function getFormatInfo(format: ExportFormat) {
  return {
    format,
    label: formatLabels[format],
    description: formatDescriptions[format],
    extension: formatExtensions[format],
  };
}

/**
 * Get all available export formats with metadata
 */
export function getAllFormats() {
  return (Object.keys(formatLabels) as ExportFormat[]).map(getFormatInfo);
}

// Re-export individual exporters for direct access
export { exportToCSV, downloadCSV } from "./csv";
export { exportToJSON, downloadJSON, type JSONExportOptions } from "./json";
export { exportToMarkdown, downloadMarkdown } from "./markdown";
export { exportToPDF, downloadPDFHTML } from "./pdf";
