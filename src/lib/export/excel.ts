/**
 * Excel Exporter for Custom Report Builder
 *
 * Exports report data to Excel-compatible XML format (SpreadsheetML).
 * This format is natively supported by Excel, Google Sheets, and LibreOffice
 * without requiring external libraries like xlsx.
 *
 * Note: For full .xlsx support with advanced features, install the 'xlsx' package:
 *   npm install xlsx
 *   npm install -D @types/xlsx
 */

import type {
  ReportData,
  ReportDataPoint,
  MetricDefinition,
  ExportOptions,
  MetricUnit,
} from "@/types/report-builder";
import {
  escapeXml,
  formatMetricValue,
  downloadBlob,
  generateFilename,
  getCurrentTimestamp,
  MIME_TYPES,
} from "./utils";

// =============================================================================
// TYPES
// =============================================================================

interface CellValue {
  value: string | number | boolean | null | undefined;
  type?: "String" | "Number" | "Boolean";
  style?: string;
}

interface SheetData {
  name: string;
  headers: string[];
  rows: CellValue[][];
}

interface ExcelExportContext {
  data: ReportData;
  options: ExportOptions;
}

// =============================================================================
// XML HELPERS
// =============================================================================

/**
 * Determine Excel data type from value.
 */
function getDataType(value: unknown): "String" | "Number" | "Boolean" {
  if (typeof value === "number" && !isNaN(value)) return "Number";
  if (typeof value === "boolean") return "Boolean";
  return "String";
}

/**
 * Create a cell element.
 */
function createCell(cell: CellValue): string {
  const value = cell.value;
  if (value === null || value === undefined || value === "") {
    return '<Cell><Data ss:Type="String"></Data></Cell>';
  }

  const type = cell.type ?? getDataType(value);
  const styleAttr = cell.style ? ` ss:StyleID="${cell.style}"` : "";
  const displayValue = type === "Number" ? value : escapeXml(value);

  return `<Cell${styleAttr}><Data ss:Type="${type}">${displayValue}</Data></Cell>`;
}

/**
 * Create a row element.
 */
function createRow(cells: CellValue[], isHeader = false): string {
  const styledCells = isHeader
    ? cells.map((c) => ({ ...c, style: "HeaderStyle" }))
    : cells;
  return `<Row>${styledCells.map(createCell).join("")}</Row>`;
}

/**
 * Create a worksheet element.
 */
function createWorksheet(sheet: SheetData): string {
  const headerRow = createRow(
    sheet.headers.map((h) => ({ value: h, type: "String" as const })),
    true
  );

  const dataRows = sheet.rows.map((row) => createRow(row));

  // Calculate column widths
  const columnWidths = sheet.headers.map((h, i) => {
    const headerLen = h.length;
    const maxDataLen = Math.max(
      ...sheet.rows.map((row) => String(row[i]?.value ?? "").length)
    );
    return Math.min(Math.max(headerLen, maxDataLen, 10) * 7, 200);
  });

  const columns = columnWidths
    .map((w) => `<Column ss:Width="${w}"/>`)
    .join("");

  return `
    <Worksheet ss:Name="${escapeXml(sheet.name)}">
      <Table>
        ${columns}
        ${headerRow}
        ${dataRows.join("\n        ")}
      </Table>
    </Worksheet>`;
}

/**
 * Create the complete Excel XML document.
 */
function createWorkbook(sheets: SheetData[]): string {
  const worksheets = sheets.map(createWorksheet).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Title>Custom Report Export</Title>
    <Author>Report Builder</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Bottom"/>
      <Font ss:FontName="Calibri" ss:Size="11"/>
    </Style>
    <Style ss:ID="HeaderStyle">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2F5496"/>
      </Borders>
    </Style>
    <Style ss:ID="TitleStyle">
      <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1"/>
    </Style>
    <Style ss:ID="Currency">
      <NumberFormat ss:Format="&quot;$&quot;#,##0.00"/>
    </Style>
    <Style ss:ID="Percent">
      <NumberFormat ss:Format="0.00%"/>
    </Style>
    <Style ss:ID="Positive">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#006400"/>
    </Style>
    <Style ss:ID="Negative">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#8B0000"/>
    </Style>
  </Styles>
  ${worksheets}
</Workbook>`;
}

// =============================================================================
// SHEET GENERATORS
// =============================================================================

/**
 * Generate the summary sheet.
 */
function generateSummarySheet(ctx: ExcelExportContext): SheetData {
  const { data, options } = ctx;
  const rows: CellValue[][] = [];

  // Report info
  rows.push([
    { value: "Report Name", style: "TitleStyle" },
    { value: data.template.name },
  ]);
  rows.push([{ value: "Description" }, { value: data.template.description }]);
  rows.push([{ value: "Generated At" }, { value: data.generatedAt }]);
  rows.push([{ value: "Template ID" }, { value: data.templateId }]);
  rows.push([{ value: "Created By" }, { value: data.template.createdBy }]);

  if (options.dateRange) {
    rows.push([
      { value: "Date Range" },
      { value: `${options.dateRange.start} to ${options.dateRange.end}` },
    ]);
  }

  rows.push([{ value: "" }, { value: "" }]);
  rows.push([
    { value: "Total Metrics", style: "TitleStyle" },
    { value: data.dataPoints.length, type: "Number" },
  ]);

  // Quick stats
  const positiveChanges = data.dataPoints.filter(
    (dp) => dp.changePercent !== undefined && dp.changePercent > 0
  ).length;
  const negativeChanges = data.dataPoints.filter(
    (dp) => dp.changePercent !== undefined && dp.changePercent < 0
  ).length;

  rows.push([
    { value: "Metrics Improved" },
    { value: positiveChanges, type: "Number", style: "Positive" },
  ]);
  rows.push([
    { value: "Metrics Declined" },
    { value: negativeChanges, type: "Number", style: "Negative" },
  ]);

  return {
    name: "Summary",
    headers: ["Property", "Value"],
    rows,
  };
}

/**
 * Generate the main data sheet.
 */
function generateDataSheet(ctx: ExcelExportContext): SheetData {
  const { data } = ctx;
  const rows: CellValue[][] = [];

  for (const dataPoint of data.dataPoints) {
    const changeStyle =
      dataPoint.changePercent !== undefined
        ? dataPoint.changePercent > 0
          ? "Positive"
          : dataPoint.changePercent < 0
            ? "Negative"
            : undefined
        : undefined;

    rows.push([
      { value: dataPoint.metricId },
      { value: dataPoint.value, type: "Number" },
      {
        value: dataPoint.previousValue ?? "",
        type: dataPoint.previousValue !== undefined ? "Number" : "String",
      },
      {
        value: dataPoint.change ?? "",
        type: dataPoint.change !== undefined ? "Number" : "String",
        style: changeStyle,
      },
      {
        value:
          dataPoint.changePercent !== undefined
            ? dataPoint.changePercent / 100
            : "",
        type: dataPoint.changePercent !== undefined ? "Number" : "String",
        style: changeStyle,
      },
    ]);
  }

  return {
    name: "Metrics Data",
    headers: [
      "Metric ID",
      "Current Value",
      "Previous Value",
      "Change",
      "Change %",
    ],
    rows,
  };
}

/**
 * Generate the trend data sheet.
 */
function generateTrendSheet(ctx: ExcelExportContext): SheetData {
  const { data } = ctx;

  // Find max trend length
  const maxTrendLength = Math.max(
    ...data.dataPoints.map((dp) => dp.trend?.length ?? 0)
  );

  if (maxTrendLength === 0) {
    return {
      name: "Trends",
      headers: ["Metric ID", "No Trend Data"],
      rows: [[{ value: "No trend data available" }, { value: "" }]],
    };
  }

  // Build headers
  const headers = ["Metric ID"];
  for (let i = 0; i < maxTrendLength; i++) {
    headers.push(`Period ${i + 1}`);
  }

  // Build rows
  const rows: CellValue[][] = [];
  for (const dataPoint of data.dataPoints) {
    const row: CellValue[] = [{ value: dataPoint.metricId }];

    for (let i = 0; i < maxTrendLength; i++) {
      const value = dataPoint.trend?.[i];
      row.push({
        value: value ?? "",
        type: value !== undefined ? "Number" : "String",
      });
    }

    rows.push(row);
  }

  return {
    name: "Trends",
    headers,
    rows,
  };
}

/**
 * Generate the template info sheet.
 */
function generateTemplateSheet(ctx: ExcelExportContext): SheetData {
  const { data } = ctx;
  const rows: CellValue[][] = [];

  rows.push([{ value: "ID" }, { value: data.template.id }]);
  rows.push([{ value: "Name" }, { value: data.template.name }]);
  rows.push([{ value: "Description" }, { value: data.template.description }]);
  rows.push([{ value: "Created At" }, { value: data.template.createdAt }]);
  rows.push([{ value: "Updated At" }, { value: data.template.updatedAt }]);
  rows.push([{ value: "Created By" }, { value: data.template.createdBy }]);
  rows.push([
    { value: "Is Default" },
    { value: data.template.isDefault ? "Yes" : "No" },
  ]);
  rows.push([
    { value: "Metric Count" },
    { value: data.template.metrics.length, type: "Number" },
  ]);

  rows.push([{ value: "" }, { value: "" }]);
  rows.push([{ value: "Metrics Configuration", style: "TitleStyle" }, { value: "" }]);

  for (const metric of data.template.metrics) {
    rows.push([
      { value: metric.metricId },
      { value: `Order: ${metric.order}, Width: ${metric.width}` },
    ]);
  }

  return {
    name: "Template Info",
    headers: ["Property", "Value"],
    rows,
  };
}

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Export report data to Excel XML format.
 *
 * @param data - The report data to export
 * @param options - Export options (optional)
 * @returns Blob containing the Excel file
 */
export function exportToExcel(
  data: ReportData,
  options: ExportOptions = { format: "excel", includeCharts: false }
): Blob {
  const ctx: ExcelExportContext = { data, options };

  const sheets: SheetData[] = [
    generateSummarySheet(ctx),
    generateDataSheet(ctx),
    generateTrendSheet(ctx),
    generateTemplateSheet(ctx),
  ];

  const xml = createWorkbook(sheets);
  return new Blob([xml], { type: MIME_TYPES.excel });
}

/**
 * Export report data to Excel XML string format.
 *
 * @param data - The report data to export
 * @param options - Export options (optional)
 * @returns Excel XML string
 */
export function exportToExcelString(
  data: ReportData,
  options?: ExportOptions
): string {
  const ctx: ExcelExportContext = {
    data,
    options: options ?? { format: "excel", includeCharts: false },
  };

  const sheets: SheetData[] = [
    generateSummarySheet(ctx),
    generateDataSheet(ctx),
    generateTrendSheet(ctx),
    generateTemplateSheet(ctx),
  ];

  return createWorkbook(sheets);
}

/**
 * Download report data as an Excel file.
 *
 * @param data - The report data to export
 * @param filename - Optional custom filename
 * @param options - Export options (optional)
 */
export function downloadExcel(
  data: ReportData,
  filename?: string,
  options?: ExportOptions
): void {
  const blob = exportToExcel(data, options);
  const finalFilename =
    filename ?? options?.filename ?? generateFilename(data.template.name, "excel");

  // Use .xls extension for XML SpreadsheetML format
  const adjustedFilename = finalFilename.replace(/\.xlsx$/, ".xls");
  downloadBlob(blob, adjustedFilename);
}
