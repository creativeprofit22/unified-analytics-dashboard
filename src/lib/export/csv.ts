/**
 * CSV Exporter for Custom Report Builder
 *
 * Exports report data to CSV format with proper escaping
 * and unit-aware formatting.
 */

import type {
  ReportData,
  ReportDataPoint,
  MetricDefinition,
  ExportOptions,
} from "@/types/report-builder";
import {
  escapeCSV,
  formatMetricValue,
  downloadText,
  generateFilename,
  getCurrentTimestamp,
  MIME_TYPES,
} from "./utils";

// =============================================================================
// TYPES
// =============================================================================

interface CSVExportContext {
  data: ReportData;
  metricsMap: Map<string, MetricDefinition>;
  options: ExportOptions;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Build a map of metric IDs to their definitions for quick lookup.
 */
function buildMetricsMap(data: ReportData): Map<string, MetricDefinition> {
  const map = new Map<string, MetricDefinition>();

  // Extract metric definitions from template
  // In a real scenario, you'd have access to the full metric catalog
  // For now, we infer from the template metrics
  for (const metric of data.template.metrics) {
    // Create a basic definition from available data
    const dataPoint = data.dataPoints.find(
      (dp) => dp.metricId === metric.metricId
    );
    if (dataPoint) {
      map.set(metric.metricId, {
        id: metric.metricId,
        name: metric.metricId, // Would be replaced with actual name from catalog
        category: "traffic", // Default, would come from catalog
        description: "",
        unit: "number", // Default, would come from catalog
        aggregation: "sum",
      });
    }
  }

  return map;
}

/**
 * Convert a row of values to a CSV line.
 */
function toCSVRow(values: unknown[]): string {
  return values.map(escapeCSV).join(",");
}

/**
 * Get the metric definition for a data point, with fallback.
 */
function getMetricDef(
  ctx: CSVExportContext,
  dataPoint: ReportDataPoint
): MetricDefinition {
  return (
    ctx.metricsMap.get(dataPoint.metricId) ?? {
      id: dataPoint.metricId,
      name: dataPoint.metricId,
      category: "traffic",
      description: "",
      unit: "number",
      aggregation: "sum",
    }
  );
}

/**
 * Format a data point value based on its metric definition.
 */
function formatDataPointValue(
  ctx: CSVExportContext,
  dataPoint: ReportDataPoint
): string {
  const def = getMetricDef(ctx, dataPoint);
  return formatMetricValue(dataPoint.value, def.unit);
}

// =============================================================================
// SECTION GENERATORS
// =============================================================================

/**
 * Generate the report header section.
 */
function generateHeader(ctx: CSVExportContext): string[] {
  const { data, options } = ctx;
  const lines: string[] = [];

  lines.push(`# Custom Report: ${escapeCSV(data.template.name)}`);
  lines.push(`# Description: ${escapeCSV(data.template.description)}`);
  lines.push(`# Generated: ${getCurrentTimestamp()}`);

  if (options.dateRange) {
    lines.push(
      `# Date Range: ${options.dateRange.start} to ${options.dateRange.end}`
    );
  }

  lines.push("");

  return lines;
}

/**
 * Generate the summary metrics section.
 */
function generateSummarySection(ctx: CSVExportContext): string[] {
  const { data } = ctx;
  const lines: string[] = [];

  lines.push("## Summary Metrics");
  lines.push("");
  lines.push(toCSVRow(["Metric", "Value", "Previous", "Change", "Change %"]));

  for (const dataPoint of data.dataPoints) {
    const def = getMetricDef(ctx, dataPoint);
    const value = formatMetricValue(dataPoint.value, def.unit);
    const previous =
      dataPoint.previousValue !== undefined
        ? formatMetricValue(dataPoint.previousValue, def.unit)
        : "N/A";
    const change =
      dataPoint.change !== undefined
        ? formatMetricValue(dataPoint.change, def.unit)
        : "N/A";
    const changePercent =
      dataPoint.changePercent !== undefined
        ? `${dataPoint.changePercent >= 0 ? "+" : ""}${dataPoint.changePercent.toFixed(1)}%`
        : "N/A";

    lines.push(toCSVRow([def.name, value, previous, change, changePercent]));
  }

  lines.push("");

  return lines;
}

/**
 * Generate the detailed metrics section with trends.
 */
function generateDetailedSection(ctx: CSVExportContext): string[] {
  const { data } = ctx;
  const lines: string[] = [];

  lines.push("## Detailed Metrics");
  lines.push("");

  for (const dataPoint of data.dataPoints) {
    const def = getMetricDef(ctx, dataPoint);

    lines.push(`### ${def.name}`);
    lines.push("");
    lines.push(toCSVRow(["Property", "Value"]));
    lines.push(
      toCSVRow(["Current Value", formatMetricValue(dataPoint.value, def.unit)])
    );

    if (dataPoint.previousValue !== undefined) {
      lines.push(
        toCSVRow([
          "Previous Value",
          formatMetricValue(dataPoint.previousValue, def.unit),
        ])
      );
    }

    if (dataPoint.change !== undefined) {
      lines.push(
        toCSVRow(["Absolute Change", formatMetricValue(dataPoint.change, def.unit)])
      );
    }

    if (dataPoint.changePercent !== undefined) {
      const sign = dataPoint.changePercent >= 0 ? "+" : "";
      lines.push(
        toCSVRow(["Percent Change", `${sign}${dataPoint.changePercent.toFixed(2)}%`])
      );
    }

    // Trend data
    if (dataPoint.trend && dataPoint.trend.length > 0) {
      lines.push("");
      lines.push(toCSVRow(["Period", "Trend Value"]));
      dataPoint.trend.forEach((trendValue, index) => {
        lines.push(
          toCSVRow([
            `Period ${index + 1}`,
            formatMetricValue(trendValue, def.unit),
          ])
        );
      });
    }

    lines.push("");
  }

  return lines;
}

/**
 * Generate the raw data section (just values, no formatting).
 */
function generateRawDataSection(ctx: CSVExportContext): string[] {
  const { data } = ctx;
  const lines: string[] = [];

  lines.push("## Raw Data");
  lines.push("");
  lines.push(
    toCSVRow([
      "Metric ID",
      "Value",
      "Previous Value",
      "Change",
      "Change Percent",
      "Trend (JSON)",
    ])
  );

  for (const dataPoint of data.dataPoints) {
    lines.push(
      toCSVRow([
        dataPoint.metricId,
        dataPoint.value,
        dataPoint.previousValue ?? "",
        dataPoint.change ?? "",
        dataPoint.changePercent ?? "",
        JSON.stringify(dataPoint.trend),
      ])
    );
  }

  lines.push("");

  return lines;
}

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Export report data to CSV format.
 *
 * @param data - The report data to export
 * @param options - Export options (optional)
 * @returns CSV string content
 */
export function exportToCSV(
  data: ReportData,
  options: ExportOptions = { format: "csv", includeCharts: false }
): string {
  const ctx: CSVExportContext = {
    data,
    metricsMap: buildMetricsMap(data),
    options,
  };

  const sections: string[] = [];

  // Header section
  sections.push(...generateHeader(ctx));

  // Summary section
  sections.push(...generateSummarySection(ctx));

  // Detailed section
  sections.push(...generateDetailedSection(ctx));

  // Raw data section
  sections.push(...generateRawDataSection(ctx));

  // Metadata footer
  sections.push("## Export Metadata");
  sections.push("");
  sections.push(toCSVRow(["Property", "Value"]));
  sections.push(toCSVRow(["Template ID", data.templateId]));
  sections.push(toCSVRow(["Template Name", data.template.name]));
  sections.push(toCSVRow(["Generated At", data.generatedAt]));
  sections.push(toCSVRow(["Created By", data.template.createdBy]));
  sections.push(toCSVRow(["Total Metrics", data.dataPoints.length]));

  return sections.join("\n");
}

/**
 * Download report data as a CSV file.
 *
 * @param data - The report data to export
 * @param filename - Optional custom filename
 * @param options - Export options (optional)
 */
export function downloadCSV(
  data: ReportData,
  filename?: string,
  options?: ExportOptions
): void {
  const csv = exportToCSV(data, options);
  const finalFilename =
    filename ?? options?.filename ?? generateFilename(data.template.name, "csv");

  downloadText(csv, finalFilename, MIME_TYPES.csv);
}
