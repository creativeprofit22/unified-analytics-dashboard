/**
 * Export Utilities for Custom Report Builder
 *
 * Barrel file providing a unified interface for all export formats.
 * Supports CSV, Excel, PDF, Markdown, JSON, and PNG exports.
 */

import type { ReportData, ExportFormat, ExportOptions } from "@/types/report-builder";

// Re-export all exporters
export { exportToCSV, downloadCSV } from "./csv";
export {
  exportToExcel,
  exportToExcelString,
  downloadExcel,
} from "./excel";
export {
  exportToPDF,
  openPDFPrintDialog,
  downloadPDF,
  getPDFPreviewHTML,
} from "./pdf";
export { exportToMarkdown, downloadMarkdown } from "./markdown";
export {
  exportToJSON,
  exportToMinifiedJSON,
  exportToJSONObject,
  downloadJSON,
  parseJSONExport,
  validateJSONExport,
  type JSONExportWrapper,
  type JSONExportOptions,
} from "./json";
export {
  exportToPNG,
  exportToPNGWithDimensions,
  downloadPNG,
  exportMultipleToPNG,
  exportToDataURL,
  type PNGExportOptions,
  type CaptureResult,
} from "./png";

// Re-export utilities
export {
  formatMetricValue,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDuration,
  downloadBlob,
  downloadText,
  generateFilename,
  sanitizeFilename,
  formatExportDate,
  getCurrentTimestamp,
  getChangeIndicator,
  getChangeArrow,
  escapeCSV,
  escapeXml,
  MIME_TYPES,
  FILE_EXTENSIONS,
} from "./utils";

// =============================================================================
// UNIFIED EXPORT INTERFACE
// =============================================================================

/**
 * Format metadata for UI display.
 */
export interface FormatInfo {
  /** Format identifier */
  format: ExportFormat;
  /** Display label */
  label: string;
  /** Brief description */
  description: string;
  /** File extension */
  extension: string;
  /** MIME type */
  mimeType: string;
  /** Whether the format supports charts/visualizations */
  supportsCharts: boolean;
}

/**
 * Metadata for each export format.
 */
export const FORMAT_INFO: Record<ExportFormat, FormatInfo> = {
  csv: {
    format: "csv",
    label: "CSV",
    description: "Comma-separated values for spreadsheets and data analysis",
    extension: ".csv",
    mimeType: "text/csv;charset=utf-8;",
    supportsCharts: false,
  },
  excel: {
    format: "excel",
    label: "Excel",
    description: "Multi-sheet workbook with formatting for Microsoft Excel",
    extension: ".xlsx",
    mimeType: "application/vnd.ms-excel",
    supportsCharts: false,
  },
  pdf: {
    format: "pdf",
    label: "PDF",
    description: "Print-ready document with professional formatting",
    extension: ".pdf",
    mimeType: "application/pdf",
    supportsCharts: true,
  },
  markdown: {
    format: "markdown",
    label: "Markdown",
    description: "Formatted text document with tables and indicators",
    extension: ".md",
    mimeType: "text/markdown;charset=utf-8;",
    supportsCharts: false,
  },
  json: {
    format: "json",
    label: "JSON",
    description: "Structured data for programmatic access and APIs",
    extension: ".json",
    mimeType: "application/json;charset=utf-8;",
    supportsCharts: false,
  },
  png: {
    format: "png",
    label: "PNG Image",
    description: "Screenshot of charts and report preview",
    extension: ".png",
    mimeType: "image/png",
    supportsCharts: true,
  },
};

/**
 * Get all available export formats with their metadata.
 *
 * @returns Array of format info objects
 */
export function getAllFormats(): FormatInfo[] {
  return Object.values(FORMAT_INFO);
}

/**
 * Get format info for a specific format.
 *
 * @param format - The export format
 * @returns Format info object
 */
export function getFormatInfo(format: ExportFormat): FormatInfo {
  return FORMAT_INFO[format];
}

/**
 * Get formats that support chart visualization.
 *
 * @returns Array of format info objects that support charts
 */
export function getChartSupportedFormats(): FormatInfo[] {
  return Object.values(FORMAT_INFO).filter((f) => f.supportsCharts);
}

// =============================================================================
// UNIFIED EXPORT FUNCTION
// =============================================================================

import { exportToCSV, downloadCSV } from "./csv";
import { exportToExcel, downloadExcel } from "./excel";
import { exportToPDF, downloadPDF } from "./pdf";
import { exportToMarkdown, downloadMarkdown } from "./markdown";
import { exportToJSON, downloadJSON } from "./json";
import { exportToPNG, downloadPNG } from "./png";

/**
 * Export report data to the specified format.
 *
 * @param data - The report data to export
 * @param format - The target export format
 * @param options - Export options
 * @returns Promise resolving to export content (string or Blob)
 */
export async function exportReport(
  data: ReportData,
  format: ExportFormat,
  options: ExportOptions = { format, includeCharts: false }
): Promise<string | Blob> {
  switch (format) {
    case "csv":
      return exportToCSV(data, options);

    case "excel":
      return exportToExcel(data, options);

    case "pdf":
      return exportToPDF(data, options);

    case "markdown":
      return exportToMarkdown(data, options);

    case "json":
      return exportToJSON(data, options);

    case "png":
      throw new Error(
        "PNG export requires an element ID. Use exportToPNG(elementId) directly."
      );

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Download report data in the specified format.
 *
 * @param data - The report data to export
 * @param format - The target export format
 * @param filename - Optional custom filename
 * @param options - Export options
 */
export async function downloadReport(
  data: ReportData,
  format: ExportFormat,
  filename?: string,
  options?: ExportOptions
): Promise<void> {
  const exportOptions = options ?? { format, includeCharts: false };

  switch (format) {
    case "csv":
      downloadCSV(data, filename, exportOptions);
      break;

    case "excel":
      downloadExcel(data, filename, exportOptions);
      break;

    case "pdf":
      await downloadPDF(data, filename, exportOptions);
      break;

    case "markdown":
      downloadMarkdown(data, filename, exportOptions);
      break;

    case "json":
      downloadJSON(data, filename, exportOptions);
      break;

    case "png":
      throw new Error(
        "PNG download requires an element ID. Use downloadPNG(elementId) directly."
      );

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Get the raw export content as a string (for formats that support it).
 *
 * @param data - The report data to export
 * @param format - The target export format
 * @param options - Export options
 * @returns Export content as string
 */
export function getExportContent(
  data: ReportData,
  format: Exclude<ExportFormat, "pdf" | "png" | "excel">,
  options?: ExportOptions
): string {
  const exportOptions = options ?? { format, includeCharts: false };

  switch (format) {
    case "csv":
      return exportToCSV(data, exportOptions);

    case "markdown":
      return exportToMarkdown(data, exportOptions);

    case "json":
      return exportToJSON(data, exportOptions);

    default:
      throw new Error(`Format ${format} does not support string export`);
  }
}
