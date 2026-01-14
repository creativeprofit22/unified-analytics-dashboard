/**
 * PDF Exporter for Custom Report Builder
 *
 * Exports report data to PDF format using jsPDF library pattern.
 * Falls back to browser print functionality if jsPDF is not available.
 *
 * Note: For full PDF support, install jsPDF:
 *   npm install jspdf jspdf-autotable
 *   npm install -D @types/jspdf
 */

import type {
  ReportData,
  ReportDataPoint,
  ExportOptions,
  MetricUnit,
} from "@/types/report-builder";
import {
  formatMetricValue,
  downloadBlob,
  generateFilename,
  escapeXml,
  formatExportDate,
  getCurrentTimestamp,
} from "./utils";

// =============================================================================
// TYPES
// =============================================================================

interface PDFExportContext {
  data: ReportData;
  options: ExportOptions;
}

interface TableRow {
  metric: string;
  value: string;
  previous: string;
  change: string;
  changePercent: string;
}

// =============================================================================
// HTML GENERATION HELPERS
// =============================================================================

/**
 * Format number with proper locale.
 */
function fmt(n: number | undefined, decimals = 0): string {
  if (n === undefined || isNaN(n)) return "N/A";
  return n.toLocaleString(undefined, { maximumFractionDigits: decimals });
}

/**
 * Format change percentage with sign.
 */
function formatChangePercent(change: number | undefined): string {
  if (change === undefined) return "N/A";
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * Get CSS class for change value.
 */
function getChangeClass(change: number | undefined): string {
  if (change === undefined || change === 0) return "";
  return change > 0 ? "positive" : "negative";
}

/**
 * Create an HTML table from headers and rows.
 */
function htmlTable(headers: string[], rows: string[][]): string {
  const headerCells = headers.map((h) => `<th>${escapeXml(h)}</th>`).join("");
  const dataRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell, i) => `<td${i === 4 ? ` class="${getChangeClass(parseFloat(cell))}"` : ""}>${escapeXml(cell)}</td>`).join("")}</tr>`
    )
    .join("");
  return `<table><thead><tr>${headerCells}</tr></thead><tbody>${dataRows}</tbody></table>`;
}

// =============================================================================
// PDF HTML TEMPLATE
// =============================================================================

/**
 * Generate CSS styles for PDF.
 */
function generateStyles(): string {
  return `
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 11px;
        line-height: 1.5;
        color: #1a1a2e;
        padding: 40px;
        max-width: 800px;
        margin: 0 auto;
      }
      header {
        text-align: center;
        margin-bottom: 32px;
        padding-bottom: 20px;
        border-bottom: 3px solid #4472C4;
      }
      header h1 {
        font-size: 28px;
        color: #1a1a2e;
        margin-bottom: 8px;
      }
      header .subtitle {
        font-size: 14px;
        color: #666;
        margin-bottom: 4px;
      }
      header .meta {
        font-size: 11px;
        color: #888;
      }
      section {
        margin-bottom: 28px;
        page-break-inside: avoid;
      }
      h2 {
        font-size: 18px;
        color: #1a1a2e;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e0e0e0;
      }
      h3 {
        font-size: 14px;
        color: #444;
        margin: 16px 0 12px;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }
      .summary-card {
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        text-align: center;
      }
      .summary-card .label {
        display: block;
        font-size: 10px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
      }
      .summary-card .value {
        display: block;
        font-size: 22px;
        font-weight: 700;
        color: #1a1a2e;
      }
      .summary-card .change {
        display: block;
        font-size: 11px;
        margin-top: 4px;
      }
      .positive { color: #16a34a; }
      .negative { color: #dc2626; }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
        margin-bottom: 16px;
      }
      th, td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }
      th {
        background: #4472C4;
        color: white;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 9px;
        letter-spacing: 0.5px;
      }
      tr:nth-child(even) {
        background: #f8f9fa;
      }
      tr:hover {
        background: #f0f4f8;
      }
      .trend-chart {
        display: flex;
        align-items: flex-end;
        gap: 2px;
        height: 40px;
        margin-top: 8px;
      }
      .trend-bar {
        flex: 1;
        background: #4472C4;
        min-width: 8px;
        border-radius: 2px 2px 0 0;
      }
      footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #e0e0e0;
        text-align: center;
        font-size: 10px;
        color: #888;
      }
      @media print {
        body { padding: 20px; }
        section { page-break-inside: avoid; }
        .summary-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @page {
        size: A4;
        margin: 20mm;
      }
    </style>
  `;
}

/**
 * Generate summary cards section.
 */
function generateSummaryCards(ctx: PDFExportContext): string {
  const { data } = ctx;
  const topMetrics = data.dataPoints.slice(0, 4);

  const cards = topMetrics
    .map((dp) => {
      const changeClass = getChangeClass(dp.changePercent);
      const changeText =
        dp.changePercent !== undefined
          ? formatChangePercent(dp.changePercent)
          : "";

      return `
        <div class="summary-card">
          <span class="label">${escapeXml(dp.metricId)}</span>
          <span class="value">${fmt(dp.value, 2)}</span>
          ${changeText ? `<span class="change ${changeClass}">${changeText}</span>` : ""}
        </div>
      `;
    })
    .join("");

  return `
    <section>
      <h2>Key Metrics Overview</h2>
      <div class="summary-grid">
        ${cards}
      </div>
    </section>
  `;
}

/**
 * Generate metrics table section.
 */
function generateMetricsTable(ctx: PDFExportContext): string {
  const { data } = ctx;

  const rows = data.dataPoints.map((dp) => [
    dp.metricId,
    fmt(dp.value, 2),
    dp.previousValue !== undefined ? fmt(dp.previousValue, 2) : "N/A",
    dp.change !== undefined ? fmt(dp.change, 2) : "N/A",
    formatChangePercent(dp.changePercent),
  ]);

  return `
    <section>
      <h2>Detailed Metrics</h2>
      ${htmlTable(["Metric", "Current", "Previous", "Change", "Change %"], rows)}
    </section>
  `;
}

/**
 * Generate trend visualization section.
 */
function generateTrendSection(ctx: PDFExportContext): string {
  const { data } = ctx;

  const metricsWithTrends = data.dataPoints.filter(
    (dp) => dp.trend && dp.trend.length > 0
  );

  if (metricsWithTrends.length === 0) {
    return "";
  }

  const trendCharts = metricsWithTrends
    .slice(0, 3)
    .map((dp) => {
      const maxValue = Math.max(...(dp.trend ?? [1]));
      const bars = dp.trend
        ?.map((v) => {
          const height = Math.max((v / maxValue) * 100, 5);
          return `<div class="trend-bar" style="height: ${height}%"></div>`;
        })
        .join("");

      return `
        <div style="flex: 1;">
          <h3>${escapeXml(dp.metricId)}</h3>
          <div class="trend-chart">${bars}</div>
        </div>
      `;
    })
    .join("");

  return `
    <section>
      <h2>Trend Analysis</h2>
      <div style="display: flex; gap: 24px;">
        ${trendCharts}
      </div>
    </section>
  `;
}

/**
 * Generate report info section.
 */
function generateReportInfo(ctx: PDFExportContext): string {
  const { data, options } = ctx;

  const infoRows = [
    ["Report Name", data.template.name],
    ["Template ID", data.templateId],
    ["Generated At", formatExportDate(data.generatedAt)],
    ["Created By", data.template.createdBy],
    ["Total Metrics", String(data.dataPoints.length)],
  ];

  if (options.dateRange) {
    infoRows.push([
      "Date Range",
      `${options.dateRange.start} to ${options.dateRange.end}`,
    ]);
  }

  return `
    <section>
      <h2>Report Information</h2>
      ${htmlTable(["Property", "Value"], infoRows)}
    </section>
  `;
}

// =============================================================================
// MAIN EXPORT FUNCTIONS
// =============================================================================

/**
 * Generate the full PDF HTML document.
 */
function generatePDFHTML(
  data: ReportData,
  options: ExportOptions = { format: "pdf", includeCharts: false }
): string {
  const ctx: PDFExportContext = { data, options };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeXml(data.template.name)} - Report</title>
      ${generateStyles()}
    </head>
    <body>
      <header>
        <h1>${escapeXml(data.template.name)}</h1>
        <p class="subtitle">${escapeXml(data.template.description)}</p>
        <p class="meta">Generated: ${formatExportDate(data.generatedAt)}</p>
      </header>

      ${generateSummaryCards(ctx)}
      ${generateMetricsTable(ctx)}
      ${options.includeCharts ? generateTrendSection(ctx) : ""}
      ${generateReportInfo(ctx)}

      <footer>
        <p>Report generated by Custom Report Builder</p>
        <p>${getCurrentTimestamp()}</p>
      </footer>
    </body>
    </html>
  `;
}

/**
 * Export report data to PDF using browser print dialog.
 *
 * @param data - The report data to export
 * @param options - Export options (optional)
 * @returns Promise that resolves when print dialog opens
 */
export async function exportToPDF(
  data: ReportData,
  options: ExportOptions = { format: "pdf", includeCharts: true }
): Promise<Blob> {
  const html = generatePDFHTML(data, options);

  // Try to use jsPDF if available
  // Note: jsPDF is an optional dependency. Install with: npm install jspdf
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsPDFModule = await import("jspdf" as any).catch(() => null);

    if (jsPDFModule) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { jsPDF } = jsPDFModule as any;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Use html method if available (requires html2canvas)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await doc.html(html, {
        callback: (d: unknown) => d,
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 800,
      });

      return doc.output("blob") as Blob;
    }
  } catch {
    // jsPDF not available, fall through to HTML blob
  }

  // Fallback: return HTML blob that can be printed as PDF
  return new Blob([html], { type: "text/html;charset=utf-8;" });
}

/**
 * Open PDF in print dialog (browser-based approach).
 *
 * @param data - The report data to export
 * @param options - Export options (optional)
 */
export function openPDFPrintDialog(
  data: ReportData,
  options?: ExportOptions
): void {
  const html = generatePDFHTML(data, options);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    console.error("Failed to open print window. Please allow popups.");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load before printing
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

/**
 * Download report data as PDF.
 *
 * @param data - The report data to export
 * @param filename - Optional custom filename
 * @param options - Export options (optional)
 */
export async function downloadPDF(
  data: ReportData,
  filename?: string,
  options?: ExportOptions
): Promise<void> {
  const blob = await exportToPDF(data, options);
  const finalFilename =
    filename ?? options?.filename ?? generateFilename(data.template.name, "pdf");

  // If we got an HTML blob, adjust extension
  const adjustedFilename =
    blob.type === "text/html;charset=utf-8;"
      ? finalFilename.replace(/\.pdf$/, ".html")
      : finalFilename;

  downloadBlob(blob, adjustedFilename);
}

/**
 * Get the PDF HTML content for preview.
 *
 * @param data - The report data
 * @param options - Export options (optional)
 * @returns HTML string for preview
 */
export function getPDFPreviewHTML(
  data: ReportData,
  options?: ExportOptions
): string {
  return generatePDFHTML(data, options);
}
