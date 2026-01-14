/**
 * Markdown Exporter for Custom Report Builder
 *
 * Exports report data to Markdown format with proper tables,
 * change indicators, and formatted numbers.
 */

import type {
  ReportData,
  ReportDataPoint,
  ExportOptions,
  MetricUnit,
} from "@/types/report-builder";
import {
  formatMetricValue,
  downloadText,
  generateFilename,
  formatExportDate,
  getCurrentTimestamp,
  MIME_TYPES,
} from "./utils";

// =============================================================================
// TYPES
// =============================================================================

interface MarkdownExportContext {
  data: ReportData;
  options: ExportOptions;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Create a markdown table from headers and rows.
 *
 * @param headers - Column headers
 * @param rows - Data rows
 * @param alignments - Optional column alignments ('left', 'center', 'right')
 * @returns Markdown table string
 */
function table(
  headers: string[],
  rows: (string | number)[][],
  alignments?: ("left" | "center" | "right")[]
): string {
  const headerRow = `| ${headers.join(" | ")} |`;

  // Build separator with alignments
  const separator = `| ${headers
    .map((_, i) => {
      const align = alignments?.[i] ?? "left";
      switch (align) {
        case "center":
          return ":---:";
        case "right":
          return "---:";
        default:
          return "---";
      }
    })
    .join(" | ")} |`;

  const dataRows = rows
    .map((row) => `| ${row.map((cell) => String(cell)).join(" | ")} |`)
    .join("\n");

  return [headerRow, separator, dataRows].join("\n");
}

/**
 * Format number with locale formatting.
 */
function fmt(n: number | undefined, decimals = 2): string {
  if (n === undefined || isNaN(n)) return "N/A";
  return n.toLocaleString(undefined, { maximumFractionDigits: decimals });
}

/**
 * Get change indicator arrow.
 */
function getChangeArrow(change: number | undefined): string {
  if (change === undefined || change === 0) return "-";
  return change > 0 ? "+" : "";
}

/**
 * Get change indicator with value.
 */
function formatChange(change: number | undefined): string {
  if (change === undefined) return "N/A";
  if (change === 0) return "0";
  const arrow = change > 0 ? "+" : "";
  return `${arrow}${fmt(change)}`;
}

/**
 * Format change percentage with indicator.
 */
function formatChangePercent(changePercent: number | undefined): string {
  if (changePercent === undefined) return "N/A";
  if (changePercent === 0) return "0%";
  const arrow = changePercent > 0 ? "+" : "";
  return `${arrow}${changePercent.toFixed(1)}%`;
}

/**
 * Create a sparkline representation using text characters.
 */
function createSparkline(values: number[]): string {
  if (!values || values.length === 0) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const chars = [" ", "_", ".", "-", "~", "=", "^"];

  return values
    .map((v) => {
      const normalized = (v - min) / range;
      const index = Math.min(
        Math.floor(normalized * (chars.length - 1)),
        chars.length - 1
      );
      return chars[index];
    })
    .join("");
}

// =============================================================================
// SECTION GENERATORS
// =============================================================================

/**
 * Generate report header section.
 */
function generateHeader(ctx: MarkdownExportContext): string {
  const { data, options } = ctx;

  const lines = [
    `# ${data.template.name}`,
    "",
    `> ${data.template.description}`,
    "",
    "---",
    "",
    "## Report Details",
    "",
  ];

  lines.push(`- **Generated:** ${formatExportDate(data.generatedAt)}`);
  lines.push(`- **Template:** ${data.template.name}`);
  lines.push(`- **Created By:** ${data.template.createdBy}`);

  if (options.dateRange) {
    lines.push(
      `- **Date Range:** ${options.dateRange.start} to ${options.dateRange.end}`
    );
  }

  lines.push("");

  return lines.join("\n");
}

/**
 * Generate summary section with key metrics.
 */
function generateSummary(ctx: MarkdownExportContext): string {
  const { data } = ctx;
  const lines = ["## Summary", ""];

  // Quick stats
  const totalMetrics = data.dataPoints.length;
  const improved = data.dataPoints.filter(
    (dp) => dp.changePercent !== undefined && dp.changePercent > 0
  ).length;
  const declined = data.dataPoints.filter(
    (dp) => dp.changePercent !== undefined && dp.changePercent < 0
  ).length;
  const unchanged = totalMetrics - improved - declined;

  lines.push(`- **Total Metrics:** ${totalMetrics}`);
  lines.push(`- **Improved:** ${improved}`);
  lines.push(`- **Declined:** ${declined}`);
  lines.push(`- **Unchanged:** ${unchanged}`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Generate main metrics table section.
 */
function generateMetricsTable(ctx: MarkdownExportContext): string {
  const { data } = ctx;

  const lines = ["## Metrics Overview", ""];

  const headers = ["Metric", "Value", "Previous", "Change", "Change %"];
  const alignments: ("left" | "center" | "right")[] = [
    "left",
    "right",
    "right",
    "right",
    "right",
  ];

  const rows = data.dataPoints.map((dp) => [
    dp.metricId,
    fmt(dp.value),
    dp.previousValue !== undefined ? fmt(dp.previousValue) : "N/A",
    formatChange(dp.change),
    formatChangePercent(dp.changePercent),
  ]);

  lines.push(table(headers, rows, alignments));
  lines.push("");

  return lines.join("\n");
}

/**
 * Generate detailed metrics section.
 */
function generateDetailedMetrics(ctx: MarkdownExportContext): string {
  const { data } = ctx;
  const lines = ["## Detailed Metrics", ""];

  for (const dataPoint of data.dataPoints) {
    lines.push(`### ${dataPoint.metricId}`);
    lines.push("");

    // Basic info
    lines.push(`- **Current Value:** ${fmt(dataPoint.value)}`);

    if (dataPoint.previousValue !== undefined) {
      lines.push(`- **Previous Value:** ${fmt(dataPoint.previousValue)}`);
    }

    if (dataPoint.change !== undefined) {
      const changeIndicator =
        dataPoint.change > 0 ? "+" : dataPoint.change < 0 ? "" : "";
      lines.push(
        `- **Change:** ${changeIndicator}${fmt(dataPoint.change)}`
      );
    }

    if (dataPoint.changePercent !== undefined) {
      const percentIndicator = dataPoint.changePercent > 0 ? "+" : "";
      lines.push(
        `- **Change %:** ${percentIndicator}${dataPoint.changePercent.toFixed(1)}%`
      );
    }

    // Trend sparkline
    if (dataPoint.trend && dataPoint.trend.length > 0) {
      const sparkline = createSparkline(dataPoint.trend);
      lines.push(`- **Trend:** \`${sparkline}\``);
    }

    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate trend analysis section.
 */
function generateTrendAnalysis(ctx: MarkdownExportContext): string {
  const { data } = ctx;

  const metricsWithTrends = data.dataPoints.filter(
    (dp) => dp.trend && dp.trend.length > 0
  );

  if (metricsWithTrends.length === 0) {
    return "";
  }

  const lines = ["## Trend Analysis", ""];

  // Find max trend length
  const maxLen = Math.max(...metricsWithTrends.map((dp) => dp.trend.length));

  // Build headers
  const headers = ["Metric"];
  for (let i = 1; i <= maxLen; i++) {
    headers.push(`P${i}`);
  }

  // Build rows
  const rows = metricsWithTrends.map((dp) => {
    const row: (string | number)[] = [dp.metricId];
    for (let i = 0; i < maxLen; i++) {
      row.push(dp.trend[i] !== undefined ? fmt(dp.trend[i]) : "-");
    }
    return row;
  });

  lines.push(table(headers, rows));
  lines.push("");
  lines.push("*P = Period (e.g., day, week)*");
  lines.push("");

  return lines.join("\n");
}

/**
 * Generate performance highlights section.
 */
function generateHighlights(ctx: MarkdownExportContext): string {
  const { data } = ctx;
  const lines = ["## Performance Highlights", ""];

  // Top performers (biggest positive changes)
  const sortedByChange = [...data.dataPoints]
    .filter((dp) => dp.changePercent !== undefined)
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0));

  const topPerformers = sortedByChange.slice(0, 3);
  const underPerformers = sortedByChange.slice(-3).reverse();

  const topFirst = topPerformers[0];
  if (topPerformers.length > 0 && topFirst && (topFirst.changePercent ?? 0) > 0) {
    lines.push("### Top Performers");
    lines.push("");
    for (const dp of topPerformers) {
      const pct = dp.changePercent;
      if (pct !== undefined && pct > 0) {
        lines.push(
          `- **${dp.metricId}:** +${pct.toFixed(1)}%`
        );
      }
    }
    lines.push("");
  }

  const underFirst = underPerformers[0];
  if (
    underPerformers.length > 0 &&
    underFirst &&
    (underFirst.changePercent ?? 0) < 0
  ) {
    lines.push("### Needs Attention");
    lines.push("");
    for (const dp of underPerformers) {
      const pct = dp.changePercent;
      if (pct !== undefined && pct < 0) {
        lines.push(
          `- **${dp.metricId}:** ${pct.toFixed(1)}%`
        );
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate template info section.
 */
function generateTemplateInfo(ctx: MarkdownExportContext): string {
  const { data } = ctx;

  const lines = [
    "## Template Information",
    "",
    table(
      ["Property", "Value"],
      [
        ["ID", data.template.id],
        ["Name", data.template.name],
        ["Created", formatExportDate(data.template.createdAt)],
        ["Updated", formatExportDate(data.template.updatedAt)],
        ["Created By", data.template.createdBy],
        ["Default Template", data.template.isDefault ? "Yes" : "No"],
        ["Metrics Count", String(data.template.metrics.length)],
      ],
      ["left", "left"]
    ),
    "",
  ];

  return lines.join("\n");
}

/**
 * Generate footer section.
 */
function generateFooter(): string {
  return [
    "---",
    "",
    `*Report generated by Custom Report Builder on ${getCurrentTimestamp()}*`,
    "",
  ].join("\n");
}

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Export report data to Markdown format.
 *
 * @param data - The report data to export
 * @param options - Export options (optional)
 * @returns Markdown string content
 */
export function exportToMarkdown(
  data: ReportData,
  options: ExportOptions = { format: "markdown", includeCharts: false }
): string {
  const ctx: MarkdownExportContext = { data, options };

  const sections = [
    generateHeader(ctx),
    generateSummary(ctx),
    generateMetricsTable(ctx),
    generateHighlights(ctx),
    generateDetailedMetrics(ctx),
    generateTrendAnalysis(ctx),
    generateTemplateInfo(ctx),
    generateFooter(),
  ];

  return sections.filter(Boolean).join("\n");
}

/**
 * Download report data as a Markdown file.
 *
 * @param data - The report data to export
 * @param filename - Optional custom filename
 * @param options - Export options (optional)
 */
export function downloadMarkdown(
  data: ReportData,
  filename?: string,
  options?: ExportOptions
): void {
  const markdown = exportToMarkdown(data, options);
  const finalFilename =
    filename ??
    options?.filename ??
    generateFilename(data.template.name, "markdown");

  downloadText(markdown, finalFilename, MIME_TYPES.markdown);
}
