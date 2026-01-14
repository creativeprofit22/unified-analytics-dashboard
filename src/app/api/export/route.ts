/**
 * Export API Endpoint
 * POST /api/export
 *
 * Generates and returns exported analytics data in the requested format.
 * Supports CSV, JSON, Excel (XML), Markdown, and PDF formats.
 *
 * Request Body:
 * - config: ExportConfig - Export configuration
 * - stream?: boolean - Whether to stream the response (for large exports)
 * - returnUrl?: boolean - Whether to return a download URL instead of content
 *
 * Response:
 * - For stream=false: Direct file download with appropriate Content-Type
 * - For returnUrl=true: JSON with download URL (future implementation)
 */

import { NextRequest, NextResponse } from "next/server";
import { isMockMode } from "@/config/mock";
import { getCachedUnifiedMockData } from "@/lib/mock/analytics";
import { exportToCSV } from "@/lib/exporters/csv";
import { exportToJSON } from "@/lib/exporters/json";
import { exportToExcel } from "@/lib/exporters/excel";
import { exportToMarkdown } from "@/lib/exporters/markdown";
import type {
  ExportRequest,
  ExportResponse,
  ExportResult,
  ExportFileFormat,
  ExportSection,
  UnifiedAnalyticsData,
} from "@/types";

// =============================================================================
// CONSTANTS
// =============================================================================

const VALID_FORMATS: ExportFileFormat[] = ["csv", "json", "xlsx", "markdown", "pdf"];

const FORMAT_MIME_TYPES: Record<ExportFileFormat, string> = {
  csv: "text/csv",
  json: "application/json",
  xlsx: "application/vnd.ms-excel",
  markdown: "text/markdown",
  pdf: "application/pdf",
};

const FORMAT_EXTENSIONS: Record<ExportFileFormat, string> = {
  csv: ".csv",
  json: ".json",
  xlsx: ".xls",
  markdown: ".md",
  pdf: ".pdf",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a standardized error response.
 */
function errorResponse(
  message: string,
  status: number
): NextResponse<{ success: false; error: string; timestamp: string }> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Filter data to only include requested sections.
 */
function filterDataBySections(
  data: UnifiedAnalyticsData,
  sections: ExportSection[]
): UnifiedAnalyticsData {
  // If "all" is selected, return full data
  if (sections.includes("all") || sections.length === 0) {
    return data;
  }

  const filtered: UnifiedAnalyticsData = {
    timeRange: data.timeRange,
    fetchedAt: data.fetchedAt,
  };

  const sectionMap: Record<ExportSection, keyof UnifiedAnalyticsData> = {
    traffic: "traffic",
    seo: "seo",
    conversions: "conversions",
    revenue: "revenue",
    subscriptions: "subscriptions",
    payments: "payments",
    unitEconomics: "unitEconomics",
    demographics: "demographics",
    segmentation: "segmentation",
    campaigns: "campaigns",
    all: "traffic", // Placeholder, won't be used
  };

  for (const section of sections) {
    if (section !== "all") {
      const key = sectionMap[section];
      if (key && data[key]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (filtered as any)[key] = data[key];
      }
    }
  }

  return filtered;
}

/**
 * Generate export content based on format.
 */
function generateExportContent(
  data: UnifiedAnalyticsData,
  format: ExportFileFormat
): string {
  switch (format) {
    case "csv":
      return exportToCSV(data);
    case "json":
      return exportToJSON(data, { pretty: true, includeMetadata: true });
    case "xlsx":
      return exportToExcel(data);
    case "markdown":
      return exportToMarkdown(data);
    case "pdf":
      // PDF requires browser rendering, return HTML for server-side
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Analytics Report</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1a1a1a; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
    .section { margin: 30px 0; }
    .section h2 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
  </style>
</head>
<body>
  <h1>Analytics Report</h1>
  <p>Time Range: ${data.timeRange ?? "N/A"}</p>
  <p>Generated: ${new Date().toISOString()}</p>
  <hr>
  <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>`;
    default:
      return exportToCSV(data);
  }
}

/**
 * Count rows in export data.
 */
function countRows(data: UnifiedAnalyticsData): number {
  let count = 0;

  // Count metrics from each section
  if (data.traffic) count += 10 + (data.traffic.topLandingPages?.length ?? 0);
  if (data.seo) count += 10 + (data.seo.keywordRankings?.length ?? 0) + (data.seo.topQueries?.length ?? 0);
  if (data.conversions) count += 10 + (data.conversions.funnel?.length ?? 0);
  if (data.revenue) count += 15 + (data.revenue.revenueByProduct?.length ?? 0);
  if (data.subscriptions) count += 15;
  if (data.payments) count += 12;
  if (data.unitEconomics) count += 12;
  if (data.demographics) count += (data.demographics.geographic?.byCountry?.length ?? 0);
  if (data.segmentation) count += (data.segmentation.byCampaign?.length ?? 0);
  if (data.campaigns) count += 10 + (data.campaigns.byCampaign?.length ?? 0);

  return count;
}

/**
 * Get included sections from data.
 */
function getIncludedSections(data: UnifiedAnalyticsData): ExportSection[] {
  const sections: ExportSection[] = [];
  if (data.traffic) sections.push("traffic");
  if (data.seo) sections.push("seo");
  if (data.conversions) sections.push("conversions");
  if (data.revenue) sections.push("revenue");
  if (data.subscriptions) sections.push("subscriptions");
  if (data.payments) sections.push("payments");
  if (data.unitEconomics) sections.push("unitEconomics");
  if (data.demographics) sections.push("demographics");
  if (data.segmentation) sections.push("segmentation");
  if (data.campaigns) sections.push("campaigns");
  return sections;
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ExportResponse | Buffer | string>> {
  try {
    // Parse request body
    let body: ExportRequest;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON in request body", 400);
    }

    const { config, stream = false, returnUrl = false } = body;

    // Validate config
    if (!config) {
      return errorResponse("Missing export config", 400);
    }

    if (!config.format || !VALID_FORMATS.includes(config.format)) {
      return errorResponse(
        `Invalid format: ${config.format}. Valid formats: ${VALID_FORMATS.join(", ")}`,
        400
      );
    }

    // Get analytics data (mock for now)
    const fullData = isMockMode
      ? getCachedUnifiedMockData()
      : getCachedUnifiedMockData(); // TODO: Real data source

    // Filter by sections
    const filteredData = filterDataBySections(fullData, config.sections ?? ["all"]);

    // Generate export content
    const content = generateExportContent(filteredData, config.format);
    const contentBytes = new TextEncoder().encode(content);
    const sizeBytes = contentBytes.length;

    // Generate filename
    const timestamp = Date.now();
    const filename = config.filename
      ? `${config.filename}${FORMAT_EXTENSIONS[config.format]}`
      : `analytics-${config.timeRange ?? "export"}-${timestamp}${FORMAT_EXTENSIONS[config.format]}`;

    // Build result metadata
    const result: ExportResult = {
      success: true,
      filename,
      mimeType: FORMAT_MIME_TYPES[config.format],
      sizeBytes,
      rowCount: countRows(filteredData),
      sectionsIncluded: getIncludedSections(filteredData),
      timeRange: config.timeRange,
      generatedAt: new Date().toISOString(),
    };

    // If returnUrl is true, we'd store the file and return a URL
    // For now, just return metadata (future: implement file storage)
    if (returnUrl) {
      return NextResponse.json({
        success: true,
        data: {
          ...result,
          downloadUrl: `/api/export/download/${timestamp}`,
          downloadExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Return file directly
    const headers = new Headers({
      "Content-Type": FORMAT_MIME_TYPES[config.format],
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": sizeBytes.toString(),
      "X-Export-Rows": result.rowCount.toString(),
      "X-Export-Sections": result.sectionsIncluded.join(","),
    });

    // For streaming large exports (future enhancement)
    if (stream && sizeBytes > 1024 * 1024) {
      // Over 1MB, could implement streaming
      // For now, just return normally
    }

    return new NextResponse(content, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[api/export] Error:", error);
    return errorResponse("Failed to generate export", 500);
  }
}

/**
 * GET handler for export metadata/formats info.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: {
      formats: VALID_FORMATS.map((format) => ({
        format,
        mimeType: FORMAT_MIME_TYPES[format],
        extension: FORMAT_EXTENSIONS[format],
      })),
      sections: [
        "traffic",
        "seo",
        "conversions",
        "revenue",
        "subscriptions",
        "payments",
        "unitEconomics",
        "demographics",
        "segmentation",
        "campaigns",
        "all",
      ],
      limits: {
        maxSizeBytes: 50 * 1024 * 1024, // 50MB
        maxRows: 100000,
        streamThreshold: 1024 * 1024, // 1MB
      },
    },
    timestamp: new Date().toISOString(),
  });
}
