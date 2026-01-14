/**
 * Export Utilities
 *
 * Shared utility functions for report export operations.
 */

import type { ExportFormat, MetricUnit } from "@/types/report-builder";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * MIME types for each export format.
 */
export const MIME_TYPES: Record<ExportFormat, string> = {
  csv: "text/csv;charset=utf-8;",
  excel: "application/vnd.ms-excel",
  pdf: "application/pdf",
  markdown: "text/markdown;charset=utf-8;",
  json: "application/json;charset=utf-8;",
  png: "image/png",
};

/**
 * File extensions for each export format.
 */
export const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  csv: ".csv",
  excel: ".xlsx",
  pdf: ".pdf",
  markdown: ".md",
  json: ".json",
  png: ".png",
};

// =============================================================================
// VALUE FORMATTING
// =============================================================================

/**
 * Format a metric value based on its unit type.
 *
 * @param value - The numeric value to format
 * @param unit - The unit type (number, currency, percentage, duration)
 * @returns Formatted string representation
 */
export function formatMetricValue(value: number, unit: MetricUnit): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }

  switch (unit) {
    case "currency":
      return formatCurrency(value);

    case "percentage":
      return formatPercentage(value);

    case "duration":
      return formatDuration(value);

    case "number":
    default:
      return formatNumber(value);
  }
}

/**
 * Format a number with locale-aware formatting.
 *
 * @param value - The numeric value
 * @param decimals - Maximum decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a currency value with $ symbol.
 *
 * @param value - The numeric value
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a percentage value with % symbol.
 *
 * @param value - The numeric value (expected as 0-100 format)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  // Values are expected in 0-100 format (e.g., 5.25 = 5.25%)
  return `${value.toFixed(1)}%`;
}

/**
 * Format a duration in seconds to human-readable format.
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "1h 30m 45s")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

// =============================================================================
// DOWNLOAD UTILITIES
// =============================================================================

/**
 * Download a Blob as a file in the browser.
 *
 * @param blob - The Blob to download
 * @param filename - The filename for the download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download text content as a file in the browser.
 *
 * @param content - The text content to download
 * @param filename - The filename for the download
 * @param mimeType - The MIME type of the content
 */
export function downloadText(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

// =============================================================================
// FILENAME UTILITIES
// =============================================================================

/**
 * Generate a standardized filename for exports.
 *
 * @param templateName - The name of the report template
 * @param format - The export format
 * @returns Generated filename with extension
 */
export function generateFilename(
  templateName: string,
  format: ExportFormat
): string {
  // Sanitize template name for use in filename
  const sanitized = templateName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Generate timestamp
  const timestamp = new Date().toISOString().slice(0, 10);

  // Combine parts
  const extension = FILE_EXTENSIONS[format];
  return `${sanitized}-report-${timestamp}${extension}`;
}

/**
 * Sanitize a string for use in filenames.
 *
 * @param name - The string to sanitize
 * @returns Sanitized string safe for filenames
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

// =============================================================================
// DATE UTILITIES
// =============================================================================

/**
 * Format a date for display in exports.
 *
 * @param date - Date to format (ISO string or Date object)
 * @returns Formatted date string
 */
export function formatExportDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get current timestamp in ISO format.
 *
 * @returns ISO timestamp string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// =============================================================================
// CHANGE INDICATORS
// =============================================================================

/**
 * Get a change indicator arrow based on value change.
 *
 * @param change - The change value
 * @returns Arrow indicator string
 */
export function getChangeIndicator(change: number | undefined): string {
  if (change === undefined || change === 0) return "";
  return change > 0 ? "^" : "v";
}

/**
 * Get a change indicator with arrow emoji.
 *
 * @param change - The change value
 * @returns Arrow emoji string
 */
export function getChangeArrow(change: number | undefined): string {
  if (change === undefined || change === 0) return "-";
  return change > 0 ? "+" : "";
}

// =============================================================================
// DATA TRANSFORMATION
// =============================================================================

/**
 * Escape a value for CSV format.
 *
 * @param value - The value to escape
 * @returns Escaped string safe for CSV
 */
export function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Escape special characters for XML/HTML.
 *
 * @param value - The value to escape
 * @returns Escaped string safe for XML/HTML
 */
export function escapeXml(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
