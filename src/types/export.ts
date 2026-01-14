/**
 * Data Export Types
 *
 * Type definitions for the data export feature, including:
 * 1. Export Formats - Supported file formats for export
 * 2. Export Configuration - Settings for export operations
 * 3. Scheduled Reports - Automated report generation and delivery
 * 4. Export Requests/Results - API request/response types
 */

import type { TimeRange, CustomDateRange } from "./analytics";

// =============================================================================
// EXPORT FORMATS
// =============================================================================

/**
 * Supported export file formats.
 * - csv: Comma-separated values for spreadsheets
 * - json: Structured data for programmatic access
 * - xlsx: Excel workbook format
 * - markdown: Formatted document
 * - pdf: Print-ready report
 */
export type ExportFileFormat = "csv" | "json" | "xlsx" | "markdown" | "pdf";

/**
 * Metadata for each export format.
 */
export interface ExportFormatInfo {
  /** Format identifier */
  format: ExportFileFormat;
  /** Display label */
  label: string;
  /** Brief description */
  description: string;
  /** File extension including dot */
  extension: string;
  /** MIME type for downloads */
  mimeType: string;
  /** Whether streaming is supported for large exports */
  supportsStreaming: boolean;
}

// =============================================================================
// DATA SECTIONS
// =============================================================================

/**
 * Dashboard sections that can be individually exported.
 */
export type ExportSection =
  | "traffic"
  | "seo"
  | "conversions"
  | "revenue"
  | "subscriptions"
  | "payments"
  | "unitEconomics"
  | "demographics"
  | "segmentation"
  | "campaigns"
  | "all";

/**
 * Section metadata for export selection UI.
 */
export interface ExportSectionInfo {
  /** Section identifier */
  section: ExportSection;
  /** Display label */
  label: string;
  /** Brief description */
  description: string;
  /** Whether section is available (has data) */
  available: boolean;
  /** Estimated row count for this section */
  estimatedRows?: number;
}

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

/**
 * Configuration for an export operation.
 */
export interface ExportConfig {
  /** Export file format */
  format: ExportFileFormat;
  /** Sections to include in export */
  sections: ExportSection[];
  /** Time range for data */
  timeRange: TimeRange;
  /** Custom date range (when timeRange is 'custom') */
  customDateRange?: CustomDateRange;
  /** Include comparison data */
  includeComparison: boolean;
  /** Include trend data (time series) */
  includeTrends: boolean;
  /** Custom filename (without extension) */
  filename?: string;
  /** JSON-specific: Pretty print with indentation */
  prettyPrint?: boolean;
  /** Excel-specific: Include charts/visualizations */
  includeCharts?: boolean;
}

/**
 * Default export configuration.
 */
export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: "csv",
  sections: ["all"],
  timeRange: "30d",
  includeComparison: false,
  includeTrends: true,
};

// =============================================================================
// SCHEDULED REPORTS
// =============================================================================

/**
 * Frequency options for scheduled reports.
 */
export type ReportFrequency = "daily" | "weekly" | "monthly" | "quarterly";

/**
 * Day of week for weekly reports.
 */
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/**
 * Delivery method for scheduled reports.
 */
export type DeliveryMethod = "email" | "webhook" | "storage";

/**
 * Email delivery configuration.
 */
export interface EmailDeliveryConfig {
  /** Method type */
  method: "email";
  /** Recipient email addresses */
  recipients: string[];
  /** Email subject line template */
  subject?: string;
  /** Include inline preview in email body */
  includeInlinePreview: boolean;
}

/**
 * Webhook delivery configuration.
 */
export interface WebhookDeliveryConfig {
  /** Method type */
  method: "webhook";
  /** Webhook URL endpoint */
  url: string;
  /** HTTP headers to include */
  headers?: Record<string, string>;
  /** Secret for signature verification */
  secret?: string;
}

/**
 * Cloud storage delivery configuration.
 */
export interface StorageDeliveryConfig {
  /** Method type */
  method: "storage";
  /** Storage provider (s3, gcs, azure) */
  provider: "s3" | "gcs" | "azure";
  /** Bucket/container name */
  bucket: string;
  /** Path prefix within bucket */
  pathPrefix?: string;
}

/**
 * Union type for all delivery configurations.
 */
export type DeliveryConfig =
  | EmailDeliveryConfig
  | WebhookDeliveryConfig
  | StorageDeliveryConfig;

/**
 * Schedule configuration for a report.
 */
export interface ReportSchedule {
  /** Frequency of report generation */
  frequency: ReportFrequency;
  /** Day of week for weekly reports */
  dayOfWeek?: DayOfWeek;
  /** Day of month for monthly reports (1-28) */
  dayOfMonth?: number;
  /** Hour of day to run (0-23, in UTC) */
  hourUTC: number;
  /** Minute of hour to run (0-59) */
  minuteUTC: number;
  /** Timezone for display purposes */
  timezone: string;
}

/**
 * Status of a scheduled report.
 */
export type ScheduledReportStatus = "active" | "paused" | "error";

/**
 * A scheduled report configuration.
 */
export interface ScheduledReport {
  /** Unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of the report */
  description?: string;
  /** Export configuration for the report */
  exportConfig: ExportConfig;
  /** Schedule configuration */
  schedule: ReportSchedule;
  /** Delivery configuration */
  delivery: DeliveryConfig;
  /** Current status */
  status: ScheduledReportStatus;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last modification */
  updatedAt: string;
  /** ISO timestamp of last successful run */
  lastRunAt?: string;
  /** ISO timestamp of next scheduled run */
  nextRunAt?: string;
  /** Error message if status is 'error' */
  lastError?: string;
  /** Count of consecutive failures */
  consecutiveFailures: number;
  /** User/API key that created this report */
  createdBy?: string;
}

// =============================================================================
// REPORT HISTORY
// =============================================================================

/**
 * Status of a report execution.
 */
export type ReportRunStatus = "pending" | "running" | "completed" | "failed";

/**
 * A single execution/run of a scheduled report.
 */
export interface ReportRun {
  /** Unique identifier for this run */
  id: string;
  /** ID of the scheduled report */
  reportId: string;
  /** Status of the run */
  status: ReportRunStatus;
  /** ISO timestamp when run was triggered */
  triggeredAt: string;
  /** ISO timestamp when run started */
  startedAt?: string;
  /** ISO timestamp when run completed */
  completedAt?: string;
  /** Duration in milliseconds */
  durationMs?: number;
  /** Size of generated file in bytes */
  fileSizeBytes?: number;
  /** Download URL (if applicable, expires after some time) */
  downloadUrl?: string;
  /** URL expiration timestamp */
  downloadExpiresAt?: string;
  /** Error message if failed */
  error?: string;
  /** Number of rows exported */
  rowCount?: number;
}

// =============================================================================
// EXPORT API TYPES
// =============================================================================

/**
 * Request payload for initiating an export.
 */
export interface ExportRequest {
  /** Export configuration */
  config: ExportConfig;
  /** Whether to stream the response (for large exports) */
  stream?: boolean;
  /** Whether to return a download URL instead of direct content */
  returnUrl?: boolean;
}

/**
 * Result of an export operation.
 */
export interface ExportResult {
  /** Whether the export was successful */
  success: boolean;
  /** Generated filename */
  filename: string;
  /** MIME type of the file */
  mimeType: string;
  /** File size in bytes */
  sizeBytes: number;
  /** Number of rows/records exported */
  rowCount: number;
  /** Sections included in export */
  sectionsIncluded: ExportSection[];
  /** Time range of exported data */
  timeRange: TimeRange;
  /** ISO timestamp when export was generated */
  generatedAt: string;
  /** Download URL (if returnUrl was true) */
  downloadUrl?: string;
  /** URL expiration timestamp */
  downloadExpiresAt?: string;
  /** Error message if not successful */
  error?: string;
}

/**
 * API response wrapper for export operations.
 */
export interface ExportResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Export result data */
  data?: ExportResult;
  /** Error message if not successful */
  error?: string;
  /** ISO timestamp of the response */
  timestamp: string;
}

// =============================================================================
// SCHEDULED REPORTS API TYPES
// =============================================================================

/**
 * Request payload for creating a scheduled report.
 */
export interface CreateScheduledReportRequest {
  /** Report name */
  name: string;
  /** Optional description */
  description?: string;
  /** Export configuration */
  exportConfig: ExportConfig;
  /** Schedule configuration */
  schedule: ReportSchedule;
  /** Delivery configuration */
  delivery: DeliveryConfig;
}

/**
 * Request payload for updating a scheduled report.
 */
export interface UpdateScheduledReportRequest {
  /** Report name */
  name?: string;
  /** Optional description */
  description?: string;
  /** Export configuration */
  exportConfig?: ExportConfig;
  /** Schedule configuration */
  schedule?: ReportSchedule;
  /** Delivery configuration */
  delivery?: DeliveryConfig;
  /** Status (for pausing/resuming) */
  status?: ScheduledReportStatus;
}

/**
 * API response for scheduled reports list.
 */
export interface ScheduledReportsResponse {
  /** Whether the request was successful */
  success: boolean;
  /** List of scheduled reports */
  data: ScheduledReport[];
  /** Total count (for pagination) */
  total: number;
  /** ISO timestamp of the response */
  timestamp: string;
}

/**
 * API response for report history.
 */
export interface ReportHistoryResponse {
  /** Whether the request was successful */
  success: boolean;
  /** List of report runs */
  data: ReportRun[];
  /** Total count (for pagination) */
  total: number;
  /** ISO timestamp of the response */
  timestamp: string;
}

// =============================================================================
// PREVIEW TYPES
// =============================================================================

/**
 * Preview data for export dialog.
 */
export interface ExportPreview {
  /** Sample of first few rows */
  sampleData: Record<string, unknown>[];
  /** Total estimated row count */
  estimatedRowCount: number;
  /** Estimated file size in bytes */
  estimatedSizeBytes: number;
  /** Column headers */
  columns: string[];
  /** Sections that will be included */
  sections: ExportSectionInfo[];
}
