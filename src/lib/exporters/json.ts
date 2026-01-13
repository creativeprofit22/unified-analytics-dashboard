/**
 * JSON Exporter
 *
 * Exports analytics data to JSON format for programmatic use.
 */

import type { UnifiedAnalyticsData } from "@/types";

export interface JSONExportOptions {
  /** Pretty print with indentation (default: true) */
  pretty?: boolean;
  /** Include metadata wrapper (default: true) */
  includeMetadata?: boolean;
}

export interface JSONExportWrapper {
  exportedAt: string;
  format: "json";
  version: "1.0";
  timeRange: string | undefined;
  data: UnifiedAnalyticsData;
}

/**
 * Export unified analytics data to JSON format
 */
export function exportToJSON(
  data: UnifiedAnalyticsData,
  options: JSONExportOptions = {}
): string {
  const { pretty = true, includeMetadata = true } = options;

  const output = includeMetadata
    ? {
        exportedAt: new Date().toISOString(),
        format: "json" as const,
        version: "1.0" as const,
        timeRange: data.timeRange,
        data,
      }
    : data;

  return pretty ? JSON.stringify(output, null, 2) : JSON.stringify(output);
}

/**
 * Download JSON file in browser
 */
export function downloadJSON(
  data: UnifiedAnalyticsData,
  filename = "analytics-export.json",
  options?: JSONExportOptions
): void {
  const json = exportToJSON(data, options);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
