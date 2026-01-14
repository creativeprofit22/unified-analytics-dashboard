/**
 * Custom Report Builder Types
 *
 * Type definitions for the custom report builder feature, including:
 * 1. Metric definitions and categories
 * 2. Report template configuration
 * 3. Export options and formats
 * 4. Report data structures
 */

// =============================================================================
// 1. METRIC TYPES
// =============================================================================

/**
 * Category of metrics available for report building.
 * Groups related metrics together for easier discovery.
 */
export type MetricCategory =
  | "traffic"
  | "conversions"
  | "revenue"
  | "engagement"
  | "attribution"
  | "roi";

/**
 * Unit of measurement for a metric.
 * Determines how the metric value should be formatted and displayed.
 */
export type MetricUnit = "number" | "currency" | "percentage" | "duration";

/**
 * Aggregation method for combining multiple metric values.
 * - sum: Add all values together
 * - average: Calculate mean of values
 * - latest: Use most recent value
 * - min: Use smallest value
 * - max: Use largest value
 */
export type MetricAggregation = "sum" | "average" | "latest" | "min" | "max";

/**
 * Definition of a single metric that can be added to reports.
 * Contains metadata about how to fetch, display, and aggregate the metric.
 */
export interface MetricDefinition {
  /** Unique identifier for this metric */
  id: string;
  /** Human-readable name for display */
  name: string;
  /** Category this metric belongs to */
  category: MetricCategory;
  /** Description explaining what this metric measures */
  description: string;
  /** Unit of measurement for formatting */
  unit: MetricUnit;
  /** How to aggregate this metric when combining data points */
  aggregation: MetricAggregation;
}

// =============================================================================
// 2. REPORT TEMPLATE TYPES
// =============================================================================

/**
 * Chart type for visualizing a metric in a report.
 */
export type ChartType = "line" | "bar" | "pie" | "area" | "table";

/**
 * Width of a metric card in the report layout.
 * - full: Spans entire width (100%)
 * - half: Spans half width (50%)
 * - third: Spans one-third width (33%)
 */
export type MetricWidth = "full" | "half" | "third";

/**
 * A metric configured for display in a report template.
 * Contains positioning and visualization preferences.
 */
export interface ReportMetric {
  /** Reference to the metric definition ID */
  metricId: string;
  /** Display order in the report (lower numbers appear first) */
  order: number;
  /** Width of this metric's card in the layout */
  width: MetricWidth;
  /** Optional chart type for visualization (defaults to appropriate type based on metric) */
  chartType?: ChartType;
}

/**
 * A saved report template that can be reused.
 * Contains the configuration for which metrics to display and how.
 */
export interface ReportTemplate {
  /** Unique identifier for this template */
  id: string;
  /** Human-readable name for the template */
  name: string;
  /** Description of what this report shows */
  description: string;
  /** List of metrics included in this report */
  metrics: ReportMetric[];
  /** ISO 8601 timestamp when this template was created */
  createdAt: string;
  /** ISO 8601 timestamp when this template was last updated */
  updatedAt: string;
  /** Username or ID of the user who created this template */
  createdBy: string;
  /** Whether this is a system default template */
  isDefault: boolean;
}

// =============================================================================
// 3. EXPORT TYPES
// =============================================================================

/**
 * Supported formats for exporting reports.
 * - csv: Comma-separated values (data only)
 * - excel: Microsoft Excel format with formatting
 * - pdf: Portable Document Format with charts
 * - markdown: Plain text with Markdown formatting
 * - json: Raw JSON data
 * - png: Image export of the report
 */
export type ExportFormat = "csv" | "excel" | "pdf" | "markdown" | "json" | "png";

/**
 * Options for exporting a report.
 * Controls format, content inclusion, and file naming.
 */
export interface ExportOptions {
  /** File format for the export */
  format: ExportFormat;
  /** Whether to include chart visualizations (not applicable to csv/json) */
  includeCharts: boolean;
  /** Optional date range filter for the exported data */
  dateRange?: {
    /** ISO 8601 date string for range start */
    start: string;
    /** ISO 8601 date string for range end */
    end: string;
  };
  /** Optional custom filename (without extension) */
  filename?: string;
}

// =============================================================================
// 4. REPORT DATA TYPES
// =============================================================================

/**
 * A single data point for a metric in a generated report.
 * Contains current value, historical comparison, and trend data.
 */
export interface ReportDataPoint {
  /** Reference to the metric definition ID */
  metricId: string;
  /** Current value of the metric */
  value: number;
  /** Value from the previous period (for comparison) */
  previousValue?: number;
  /** Absolute change from previous period (value - previousValue) */
  change?: number;
  /** Percentage change from previous period */
  changePercent?: number;
  /** Last 7 data points for sparkline/trend visualization */
  trend: number[];
}

/**
 * Complete generated report with all data.
 * Represents a snapshot of metrics at a point in time.
 */
export interface ReportData {
  /** Reference to the template used to generate this report */
  templateId: string;
  /** Full template configuration (denormalized for convenience) */
  template: ReportTemplate;
  /** Data points for each metric in the template */
  dataPoints: ReportDataPoint[];
  /** ISO 8601 timestamp when this report was generated */
  generatedAt: string;
}

// =============================================================================
// 5. API RESPONSE TYPES
// =============================================================================

/**
 * Complete data payload for the report builder feature.
 * Contains all available metrics, saved templates, and current report.
 */
export interface ReportBuilderData {
  /** All metrics available for building reports */
  availableMetrics: MetricDefinition[];
  /** Saved report templates (both default and user-created) */
  templates: ReportTemplate[];
  /** Currently loaded report data (if any) */
  currentReport?: ReportData;
}

/**
 * API response wrapper for report builder data.
 */
export interface ReportBuilderResponse {
  /** Whether the request was successful */
  success: boolean;
  /** The report builder data payload */
  data: ReportBuilderData;
  /** ISO 8601 timestamp of the response */
  timestamp: string;
  /** Error message (present on failure) */
  error?: string;
}
