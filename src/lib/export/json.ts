/**
 * JSON Exporter for Custom Report Builder
 *
 * Exports report data to JSON format with metadata
 * and pretty-printing options.
 */

import type { ReportData, ExportOptions } from "@/types/report-builder";
import {
  downloadText,
  generateFilename,
  getCurrentTimestamp,
  MIME_TYPES,
} from "./utils";

// =============================================================================
// TYPES
// =============================================================================

/**
 * JSON export wrapper with metadata.
 */
export interface JSONExportWrapper {
  /** Export metadata */
  metadata: {
    /** ISO timestamp when export was generated */
    exportedAt: string;
    /** Export format identifier */
    format: "json";
    /** Schema version for compatibility */
    version: "1.0.0";
    /** Name of the report template */
    templateName: string;
    /** ID of the report template */
    templateId: string;
    /** Date range if specified in options */
    dateRange?: {
      start: string;
      end: string;
    };
  };
  /** The actual report data */
  data: ReportData;
}

/**
 * Options specific to JSON export.
 */
export interface JSONExportOptions extends ExportOptions {
  /** Pretty print with indentation (default: true) */
  prettyPrint?: boolean;
  /** Include metadata wrapper (default: true) */
  includeMetadata?: boolean;
  /** Indentation spaces for pretty print (default: 2) */
  indentSpaces?: number;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Create the metadata wrapper for JSON export.
 */
function createExportWrapper(
  data: ReportData,
  options: JSONExportOptions
): JSONExportWrapper {
  return {
    metadata: {
      exportedAt: getCurrentTimestamp(),
      format: "json",
      version: "1.0.0",
      templateName: data.template.name,
      templateId: data.templateId,
      dateRange: options.dateRange,
    },
    data,
  };
}

/**
 * Transform data for cleaner JSON output.
 *
 * Removes undefined values and normalizes data structures.
 */
function normalizeData(data: ReportData): ReportData {
  return {
    ...data,
    dataPoints: data.dataPoints.map((dp) => ({
      metricId: dp.metricId,
      value: dp.value,
      previousValue: dp.previousValue,
      change: dp.change,
      changePercent: dp.changePercent,
      trend: dp.trend ?? [],
    })),
  };
}

/**
 * Calculate statistics about the export for metadata.
 */
function calculateExportStats(data: ReportData): Record<string, unknown> {
  const stats = {
    totalMetrics: data.dataPoints.length,
    metricsWithTrends: data.dataPoints.filter(
      (dp) => dp.trend && dp.trend.length > 0
    ).length,
    metricsWithChanges: data.dataPoints.filter(
      (dp) => dp.changePercent !== undefined
    ).length,
    averageChange:
      data.dataPoints
        .filter((dp) => dp.changePercent !== undefined)
        .reduce((sum, dp) => sum + (dp.changePercent ?? 0), 0) /
        data.dataPoints.filter((dp) => dp.changePercent !== undefined).length ||
      0,
    templateMetricCount: data.template.metrics.length,
  };

  return stats;
}

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Export report data to JSON format.
 *
 * @param data - The report data to export
 * @param options - Export options (optional)
 * @returns Pretty-printed JSON string
 */
export function exportToJSON(
  data: ReportData,
  options: JSONExportOptions = {
    format: "json",
    includeCharts: false,
    prettyPrint: true,
    includeMetadata: true,
  }
): string {
  const {
    prettyPrint = true,
    includeMetadata = true,
    indentSpaces = 2,
  } = options;

  // Normalize the data
  const normalizedData = normalizeData(data);

  // Build output
  let output: unknown;

  if (includeMetadata) {
    const wrapper = createExportWrapper(normalizedData, options);
    // Add stats to metadata
    (wrapper.metadata as Record<string, unknown>).stats =
      calculateExportStats(normalizedData);
    output = wrapper;
  } else {
    output = normalizedData;
  }

  // Serialize to JSON
  if (prettyPrint) {
    return JSON.stringify(output, null, indentSpaces);
  }

  return JSON.stringify(output);
}

/**
 * Export report data to minified JSON.
 *
 * @param data - The report data to export
 * @returns Minified JSON string
 */
export function exportToMinifiedJSON(data: ReportData): string {
  return exportToJSON(data, {
    format: "json",
    includeCharts: false,
    prettyPrint: false,
    includeMetadata: false,
  });
}

/**
 * Export report data with full metadata.
 *
 * @param data - The report data to export
 * @param options - Export options (optional)
 * @returns JSON export wrapper object (not stringified)
 */
export function exportToJSONObject(
  data: ReportData,
  options?: JSONExportOptions
): JSONExportWrapper {
  const normalizedData = normalizeData(data);
  const wrapper = createExportWrapper(
    normalizedData,
    options ?? { format: "json", includeCharts: false }
  );
  (wrapper.metadata as Record<string, unknown>).stats =
    calculateExportStats(normalizedData);
  return wrapper;
}

/**
 * Download report data as a JSON file.
 *
 * @param data - The report data to export
 * @param filename - Optional custom filename
 * @param options - Export options (optional)
 */
export function downloadJSON(
  data: ReportData,
  filename?: string,
  options?: JSONExportOptions
): void {
  const json = exportToJSON(data, options);
  const finalFilename =
    filename ?? options?.filename ?? generateFilename(data.template.name, "json");

  downloadText(json, finalFilename, MIME_TYPES.json);
}

/**
 * Parse JSON export wrapper and extract report data.
 *
 * @param json - JSON string to parse
 * @returns Extracted report data
 */
export function parseJSONExport(json: string): ReportData {
  const parsed = JSON.parse(json);

  // Check if it's a wrapped export
  if (parsed.metadata && parsed.data) {
    return parsed.data as ReportData;
  }

  // Assume it's raw report data
  return parsed as ReportData;
}

/**
 * Validate JSON export structure.
 *
 * @param json - JSON string to validate
 * @returns Validation result with errors if any
 */
export function validateJSONExport(json: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const parsed = JSON.parse(json);

    // Check for wrapper or raw data
    const data = parsed.data ?? parsed;

    // Required fields
    if (!data.templateId) {
      errors.push("Missing required field: templateId");
    }

    if (!data.template) {
      errors.push("Missing required field: template");
    } else {
      if (!data.template.id) errors.push("Missing template.id");
      if (!data.template.name) errors.push("Missing template.name");
      if (!data.template.metrics) errors.push("Missing template.metrics");
    }

    if (!data.dataPoints) {
      errors.push("Missing required field: dataPoints");
    } else if (!Array.isArray(data.dataPoints)) {
      errors.push("dataPoints must be an array");
    } else {
      data.dataPoints.forEach((dp: unknown, i: number) => {
        const point = dp as Record<string, unknown>;
        if (!point.metricId) {
          errors.push(`dataPoints[${i}] missing metricId`);
        }
        if (typeof point.value !== "number") {
          errors.push(`dataPoints[${i}] value must be a number`);
        }
      });
    }

    if (!data.generatedAt) {
      errors.push("Missing required field: generatedAt");
    }
  } catch (e) {
    errors.push(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
