/**
 * Excel Exporter
 *
 * Exports analytics data to Excel-compatible XML format (SpreadsheetML).
 * This format is natively supported by Excel, Google Sheets, and LibreOffice
 * without requiring external libraries.
 */

import type { UnifiedAnalyticsData } from "@/types";

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

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Escape XML special characters.
 */
function escapeXml(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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

  return `
    <Worksheet ss:Name="${escapeXml(sheet.name)}">
      <Table>
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
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Bottom"/>
      <Font ss:FontName="Arial" ss:Size="10"/>
    </Style>
    <Style ss:ID="HeaderStyle">
      <Font ss:FontName="Arial" ss:Size="10" ss:Bold="1"/>
      <Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
      </Borders>
    </Style>
    <Style ss:ID="Currency">
      <NumberFormat ss:Format="&quot;$&quot;#,##0.00"/>
    </Style>
    <Style ss:ID="Percent">
      <NumberFormat ss:Format="0.00%"/>
    </Style>
  </Styles>
  ${worksheets}
</Workbook>`;
}

// =============================================================================
// SECTION EXPORTERS
// =============================================================================

function exportTrafficSheet(
  data: NonNullable<UnifiedAnalyticsData["traffic"]>
): SheetData {
  const rows: CellValue[][] = [];

  // Core metrics
  rows.push([{ value: "Sessions" }, { value: data.sessions, type: "Number" }]);
  rows.push([
    { value: "Unique Visitors" },
    { value: data.uniqueVisitors, type: "Number" },
  ]);
  rows.push([
    { value: "New Visitors" },
    { value: data.newVisitors, type: "Number" },
  ]);
  rows.push([
    { value: "Returning Visitors" },
    { value: data.returningVisitors, type: "Number" },
  ]);
  rows.push([
    { value: "Bounce Rate (%)" },
    { value: data.bounceRate, type: "Number" },
  ]);
  rows.push([
    { value: "Pages per Session" },
    { value: data.pagesPerSession, type: "Number" },
  ]);
  rows.push([
    { value: "Avg Session Duration (s)" },
    { value: data.avgSessionDuration, type: "Number" },
  ]);
  rows.push([{ value: "" }, { value: "" }]);

  // Traffic by source
  rows.push([{ value: "Traffic by Source" }, { value: "" }]);
  for (const [source, sessions] of Object.entries(data.trafficBySource)) {
    rows.push([{ value: source }, { value: sessions, type: "Number" }]);
  }
  rows.push([{ value: "" }, { value: "" }]);

  // Core Web Vitals
  rows.push([{ value: "Core Web Vitals" }, { value: "" }]);
  rows.push([
    { value: "LCP (s)" },
    { value: data.coreWebVitals.lcp, type: "Number" },
  ]);
  rows.push([
    { value: "FID (ms)" },
    { value: data.coreWebVitals.fid, type: "Number" },
  ]);
  rows.push([
    { value: "CLS" },
    { value: data.coreWebVitals.cls, type: "Number" },
  ]);

  return {
    name: "Traffic",
    headers: ["Metric", "Value"],
    rows,
  };
}

function exportSEOSheet(
  data: NonNullable<UnifiedAnalyticsData["seo"]>
): SheetData {
  const rows: CellValue[][] = [];

  // Core metrics
  rows.push([
    { value: "Visibility Score" },
    { value: data.visibilityScore, type: "Number" },
  ]);
  rows.push([
    { value: "Impressions" },
    { value: data.impressions, type: "Number" },
  ]);
  rows.push([{ value: "Clicks" }, { value: data.clicks, type: "Number" }]);
  rows.push([{ value: "CTR (%)" }, { value: data.ctr, type: "Number" }]);
  rows.push([
    { value: "Average Position" },
    { value: data.averagePosition, type: "Number" },
  ]);
  rows.push([{ value: "Backlinks" }, { value: data.backlinks, type: "Number" }]);
  rows.push([
    { value: "Referring Domains" },
    { value: data.referringDomains, type: "Number" },
  ]);
  rows.push([
    { value: "Domain Authority" },
    { value: data.domainAuthority, type: "Number" },
  ]);
  rows.push([
    { value: "Indexed Pages" },
    { value: data.indexedPages, type: "Number" },
  ]);

  return {
    name: "SEO",
    headers: ["Metric", "Value"],
    rows,
  };
}

function exportKeywordsSheet(
  data: NonNullable<UnifiedAnalyticsData["seo"]>
): SheetData {
  const rows: CellValue[][] = data.keywordRankings.map((kw) => [
    { value: kw.keyword },
    { value: kw.position, type: "Number" },
    { value: kw.previousPosition, type: "Number" },
    { value: kw.change, type: "Number" },
    { value: kw.volume, type: "Number" },
    { value: kw.url },
  ]);

  return {
    name: "Keywords",
    headers: ["Keyword", "Position", "Previous", "Change", "Volume", "URL"],
    rows,
  };
}

function exportConversionsSheet(
  data: NonNullable<UnifiedAnalyticsData["conversions"]>
): SheetData {
  const rows: CellValue[][] = [];

  rows.push([
    { value: "Conversion Rate (%)" },
    { value: data.conversionRate, type: "Number" },
  ]);
  rows.push([
    { value: "Total Conversions" },
    { value: data.totalConversions, type: "Number" },
  ]);
  rows.push([
    { value: "Add to Cart Rate (%)" },
    { value: data.addToCartRate, type: "Number" },
  ]);
  rows.push([
    { value: "Cart Abandonment Rate (%)" },
    { value: data.cartAbandonmentRate, type: "Number" },
  ]);
  rows.push([
    { value: "Checkout Abandonment Rate (%)" },
    { value: data.checkoutAbandonmentRate, type: "Number" },
  ]);
  rows.push([
    { value: "Checkout Completion Rate (%)" },
    { value: data.checkoutCompletionRate, type: "Number" },
  ]);

  return {
    name: "Conversions",
    headers: ["Metric", "Value"],
    rows,
  };
}

function exportFunnelSheet(
  data: NonNullable<UnifiedAnalyticsData["conversions"]>
): SheetData {
  const rows: CellValue[][] = data.funnel.map((step) => [
    { value: step.step },
    { value: step.users, type: "Number" },
    { value: step.dropOff, type: "Number" },
    { value: step.dropOffRate, type: "Number" },
  ]);

  return {
    name: "Funnel",
    headers: ["Step", "Users", "Drop Off", "Drop Off Rate (%)"],
    rows,
  };
}

function exportRevenueSheet(
  data: NonNullable<UnifiedAnalyticsData["revenue"]>
): SheetData {
  const rows: CellValue[][] = [];

  rows.push([
    { value: "Gross Revenue ($)" },
    { value: data.grossRevenue, type: "Number" },
  ]);
  rows.push([
    { value: "Net Revenue ($)" },
    { value: data.netRevenue, type: "Number" },
  ]);
  rows.push([
    { value: "Transactions" },
    { value: data.transactions, type: "Number" },
  ]);
  rows.push([
    { value: "Average Order Value ($)" },
    { value: data.aov, type: "Number" },
  ]);
  rows.push([
    { value: "Median Order Value ($)" },
    { value: data.medianOrderValue, type: "Number" },
  ]);
  rows.push([
    { value: "Units per Order" },
    { value: data.unitsPerOrder, type: "Number" },
  ]);
  rows.push([
    { value: "Revenue per Visitor ($)" },
    { value: data.revenuePerVisitor, type: "Number" },
  ]);
  rows.push([
    { value: "Refund Amount ($)" },
    { value: data.refundAmount, type: "Number" },
  ]);
  rows.push([
    { value: "Refund Rate (%)" },
    { value: data.refundRate, type: "Number" },
  ]);
  rows.push([
    { value: "Return Rate (%)" },
    { value: data.returnRate, type: "Number" },
  ]);
  rows.push([
    { value: "Discount Usage Rate (%)" },
    { value: data.discountUsageRate, type: "Number" },
  ]);
  rows.push([
    { value: "Avg Discount Value ($)" },
    { value: data.avgDiscountValue, type: "Number" },
  ]);

  return {
    name: "Revenue",
    headers: ["Metric", "Value"],
    rows,
  };
}

function exportProductsSheet(
  data: NonNullable<UnifiedAnalyticsData["revenue"]>
): SheetData {
  const rows: CellValue[][] = data.revenueByProduct.map((prod) => [
    { value: prod.productName },
    { value: prod.revenue, type: "Number" },
    { value: prod.units, type: "Number" },
  ]);

  return {
    name: "Products",
    headers: ["Product", "Revenue ($)", "Units"],
    rows,
  };
}

function exportSubscriptionsSheet(
  data: NonNullable<UnifiedAnalyticsData["subscriptions"]>
): SheetData {
  const rows: CellValue[][] = [];

  rows.push([
    { value: "Active Subscribers" },
    { value: data.activeSubscribers, type: "Number" },
  ]);
  rows.push([
    { value: "New Subscribers" },
    { value: data.newSubscribers, type: "Number" },
  ]);
  rows.push([
    { value: "Cancelled Subscribers" },
    { value: data.cancelledSubscribers, type: "Number" },
  ]);
  rows.push([
    { value: "Monthly Churn Rate (%)" },
    { value: data.churnRate.monthly, type: "Number" },
  ]);
  rows.push([
    { value: "Annual Churn Rate (%)" },
    { value: data.churnRate.annual, type: "Number" },
  ]);
  rows.push([
    { value: "Retention Rate (%)" },
    { value: data.retentionRate, type: "Number" },
  ]);
  rows.push([{ value: "MRR ($)" }, { value: data.mrr, type: "Number" }]);
  rows.push([{ value: "ARR ($)" }, { value: data.arr, type: "Number" }]);
  rows.push([
    { value: "Reactivations" },
    { value: data.reactivations, type: "Number" },
  ]);
  rows.push([
    { value: "Reactivation Rate (%)" },
    { value: data.reactivationRate, type: "Number" },
  ]);
  rows.push([
    { value: "Trial to Paid Rate (%)" },
    { value: data.trialToPaidRate, type: "Number" },
  ]);
  rows.push([
    { value: "Avg Subscription Length (months)" },
    { value: data.avgSubscriptionLength, type: "Number" },
  ]);
  rows.push([
    { value: "Subscriber LTV ($)" },
    { value: data.subscriberLtv, type: "Number" },
  ]);
  rows.push([{ value: "" }, { value: "" }]);

  // MRR Movement
  rows.push([{ value: "MRR Movement" }, { value: "" }]);
  rows.push([
    { value: "New MRR ($)" },
    { value: data.mrrMovement.new, type: "Number" },
  ]);
  rows.push([
    { value: "Expansion MRR ($)" },
    { value: data.mrrMovement.expansion, type: "Number" },
  ]);
  rows.push([
    { value: "Contraction MRR ($)" },
    { value: data.mrrMovement.contraction, type: "Number" },
  ]);
  rows.push([
    { value: "Churned MRR ($)" },
    { value: data.mrrMovement.churned, type: "Number" },
  ]);
  rows.push([
    { value: "Net MRR ($)" },
    { value: data.mrrMovement.net, type: "Number" },
  ]);

  return {
    name: "Subscriptions",
    headers: ["Metric", "Value"],
    rows,
  };
}

function exportPaymentsSheet(
  data: NonNullable<UnifiedAnalyticsData["payments"]>
): SheetData {
  const rows: CellValue[][] = [];

  rows.push([
    { value: "Successful Payments" },
    { value: data.successfulPayments, type: "Number" },
  ]);
  rows.push([
    { value: "Failed Payments" },
    { value: data.failedPayments, type: "Number" },
  ]);
  rows.push([
    { value: "Failure Rate (%)" },
    { value: data.failureRate, type: "Number" },
  ]);
  rows.push([
    { value: "Recovery Rate (%)" },
    { value: data.recoveryRate, type: "Number" },
  ]);
  rows.push([
    { value: "Dunning Success Rate (%)" },
    { value: data.dunningSuccessRate, type: "Number" },
  ]);
  rows.push([
    { value: "Avg Time to Recovery (days)" },
    { value: data.avgTimeToRecovery, type: "Number" },
  ]);
  rows.push([
    { value: "Involuntary Churn" },
    { value: data.involuntaryChurn, type: "Number" },
  ]);
  rows.push([
    { value: "Involuntary Churn Rate (%)" },
    { value: data.involuntaryChurnRate, type: "Number" },
  ]);
  rows.push([
    { value: "At-Risk Revenue ($)" },
    { value: data.atRiskRevenue, type: "Number" },
  ]);
  rows.push([
    { value: "Recovered Revenue ($)" },
    { value: data.recoveredRevenue, type: "Number" },
  ]);

  return {
    name: "Payments",
    headers: ["Metric", "Value"],
    rows,
  };
}

function exportUnitEconomicsSheet(
  data: NonNullable<UnifiedAnalyticsData["unitEconomics"]>
): SheetData {
  const rows: CellValue[][] = [];

  rows.push([{ value: "CAC ($)" }, { value: data.cac, type: "Number" }]);
  rows.push([
    { value: "CAC Payback Period (months)" },
    { value: data.cacPaybackPeriod, type: "Number" },
  ]);
  rows.push([{ value: "LTV ($)" }, { value: data.ltv, type: "Number" }]);
  rows.push([
    { value: "LTV:CAC Ratio" },
    { value: data.ltvCacRatio, type: "Number" },
  ]);
  rows.push([
    { value: "Gross Margin (%)" },
    { value: data.grossMargin, type: "Number" },
  ]);
  rows.push([
    { value: "Gross Margin per Customer ($)" },
    { value: data.grossMarginPerCustomer, type: "Number" },
  ]);
  rows.push([{ value: "ARPU ($)" }, { value: data.arpu, type: "Number" }]);
  rows.push([{ value: "ARPPU ($)" }, { value: data.arppu, type: "Number" }]);
  rows.push([
    { value: "ARPU Growth Rate (%)" },
    { value: data.arpuGrowthRate, type: "Number" },
  ]);
  rows.push([
    { value: "Contribution Margin (%)" },
    { value: data.contributionMargin, type: "Number" },
  ]);
  rows.push([
    { value: "Net Revenue Retention (%)" },
    { value: data.nrr, type: "Number" },
  ]);
  rows.push([
    { value: "Gross Revenue Retention (%)" },
    { value: data.grr, type: "Number" },
  ]);

  return {
    name: "Unit Economics",
    headers: ["Metric", "Value"],
    rows,
  };
}

function exportDemographicsSheet(
  data: NonNullable<UnifiedAnalyticsData["demographics"]>
): SheetData {
  const rows: CellValue[][] = data.geographic.byCountry.map((c) => [
    { value: c.country },
    { value: c.countryCode },
    { value: c.users, type: "Number" },
    { value: c.sessions, type: "Number" },
    { value: c.conversionRate, type: "Number" },
  ]);

  return {
    name: "Demographics",
    headers: ["Country", "Code", "Users", "Sessions", "Conversion Rate (%)"],
    rows,
  };
}

function exportSegmentationSheet(
  data: NonNullable<UnifiedAnalyticsData["segmentation"]>
): SheetData {
  const rows: CellValue[][] = data.byCampaign.map((c) => [
    { value: c.campaign },
    { value: c.source },
    { value: c.medium },
    { value: c.users, type: "Number" },
    { value: c.conversions, type: "Number" },
    { value: c.revenue, type: "Number" },
    { value: c.cac, type: "Number" },
    { value: c.roi, type: "Number" },
  ]);

  return {
    name: "Segmentation",
    headers: [
      "Campaign",
      "Source",
      "Medium",
      "Users",
      "Conversions",
      "Revenue ($)",
      "CAC ($)",
      "ROI",
    ],
    rows,
  };
}

function exportCampaignsSheet(
  data: NonNullable<UnifiedAnalyticsData["campaigns"]>
): SheetData {
  const rows: CellValue[][] = data.byCampaign.map((c) => [
    { value: c.name },
    { value: c.channel },
    { value: c.sentAt },
    { value: c.sent, type: "Number" },
    { value: c.delivered, type: "Number" },
    { value: c.opens, type: "Number" },
    { value: c.clicks, type: "Number" },
    { value: c.conversions, type: "Number" },
    { value: c.revenue, type: "Number" },
  ]);

  return {
    name: "Campaigns",
    headers: [
      "Name",
      "Channel",
      "Sent At",
      "Sent",
      "Delivered",
      "Opens",
      "Clicks",
      "Conversions",
      "Revenue ($)",
    ],
    rows,
  };
}

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Export unified analytics data to Excel XML format.
 */
export function exportToExcel(data: UnifiedAnalyticsData): string {
  const sheets: SheetData[] = [];

  // Add sheets for each available section
  if (data.traffic) {
    sheets.push(exportTrafficSheet(data.traffic));
  }

  if (data.seo) {
    sheets.push(exportSEOSheet(data.seo));
    if (data.seo.keywordRankings.length > 0) {
      sheets.push(exportKeywordsSheet(data.seo));
    }
  }

  if (data.conversions) {
    sheets.push(exportConversionsSheet(data.conversions));
    if (data.conversions.funnel.length > 0) {
      sheets.push(exportFunnelSheet(data.conversions));
    }
  }

  if (data.revenue) {
    sheets.push(exportRevenueSheet(data.revenue));
    if (data.revenue.revenueByProduct.length > 0) {
      sheets.push(exportProductsSheet(data.revenue));
    }
  }

  if (data.subscriptions) {
    sheets.push(exportSubscriptionsSheet(data.subscriptions));
  }

  if (data.payments) {
    sheets.push(exportPaymentsSheet(data.payments));
  }

  if (data.unitEconomics) {
    sheets.push(exportUnitEconomicsSheet(data.unitEconomics));
  }

  if (data.demographics) {
    sheets.push(exportDemographicsSheet(data.demographics));
  }

  if (data.segmentation) {
    sheets.push(exportSegmentationSheet(data.segmentation));
  }

  if (data.campaigns) {
    sheets.push(exportCampaignsSheet(data.campaigns));
  }

  // Add a summary sheet at the beginning
  const summarySheet: SheetData = {
    name: "Summary",
    headers: ["Report Info", "Value"],
    rows: [
      [{ value: "Time Range" }, { value: data.timeRange ?? "N/A" }],
      [{ value: "Generated At" }, { value: new Date().toISOString() }],
      [{ value: "Sheets Included" }, { value: sheets.length, type: "Number" }],
    ],
  };

  return createWorkbook([summarySheet, ...sheets]);
}

/**
 * Download Excel file in browser.
 */
export function downloadExcel(
  data: UnifiedAnalyticsData,
  filename = "analytics-export.xls"
): void {
  const xml = exportToExcel(data);
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
