/**
 * Alerting & Monitoring Types
 *
 * Type definitions for the alerting and monitoring feature, including:
 * 1. Anomaly Detection - Statistical anomalies in metrics
 * 2. Threshold Alerts - Rule-based threshold breaches
 * 3. Goals - Progress tracking against business targets
 */

import type { TrendDataPoint } from "./analytics";

// =============================================================================
// CORE METRIC TYPES
// =============================================================================

/**
 * Metrics that can be monitored for anomalies and alerts.
 */
export type MetricType =
  | "conversionRate"
  | "traffic"
  | "churnRate"
  | "revenue"
  | "mrr"
  | "cac";

// =============================================================================
// 1. ANOMALY DETECTION
// =============================================================================

/**
 * Severity levels for detected anomalies.
 * - critical: Requires immediate attention (e.g., > 3 standard deviations)
 * - warning: Notable deviation worth investigating (e.g., 2-3 standard deviations)
 * - info: Minor deviation for awareness (e.g., 1.5-2 standard deviations)
 */
export type AnomalySeverity = "critical" | "warning" | "info";

/**
 * Direction of the anomaly deviation.
 * - spike: Value is unusually high
 * - drop: Value is unusually low
 */
export type AnomalyDirection = "spike" | "drop";

/**
 * A detected statistical anomaly in a monitored metric.
 */
export interface Anomaly {
  /** Unique identifier for the anomaly */
  id: string;
  /** The metric type that triggered the anomaly */
  metric: MetricType;
  /** Human-readable label for the metric */
  metricLabel: string;
  /** The actual observed value */
  value: number;
  /** The expected/normal value based on historical data */
  expectedValue: number;
  /** Z-score indicating how many standard deviations from the mean */
  deviation: number;
  /** Whether this is a spike (unusually high) or drop (unusually low) */
  direction: AnomalyDirection;
  /** Severity classification based on deviation magnitude */
  severity: AnomalySeverity;
  /** ISO 8601 timestamp when the anomaly was detected */
  detectedAt: string;
  /** Last 7 days of metric data for context */
  trend: TrendDataPoint[];
}

// =============================================================================
// 2. THRESHOLD ALERTS
// =============================================================================

/**
 * Comparison operators for threshold rules.
 * - gt: Greater than
 * - lt: Less than
 * - gte: Greater than or equal
 * - lte: Less than or equal
 */
export type ThresholdOperator = "gt" | "lt" | "gte" | "lte";

/**
 * Current status of a threshold alert.
 * - normal: Metric is within acceptable bounds
 * - warning: Metric is approaching the threshold
 * - breached: Metric has crossed the threshold
 */
export type ThresholdStatus = "normal" | "breached" | "warning";

/**
 * A configurable threshold rule for monitoring metrics.
 */
export interface ThresholdRule {
  /** Unique identifier for the rule */
  id: string;
  /** Human-readable name for the rule */
  name: string;
  /** The metric being monitored */
  metric: MetricType;
  /** Comparison operator for the threshold check */
  operator: ThresholdOperator;
  /** Threshold value to compare against */
  value: number;
  /** Whether this rule is currently active */
  enabled: boolean;
}

/**
 * An alert generated when a threshold rule is triggered.
 */
export interface ThresholdAlert {
  /** Unique identifier for the alert */
  id: string;
  /** The rule that triggered this alert */
  rule: ThresholdRule;
  /** Current value of the monitored metric */
  currentValue: number;
  /** Current status of the alert */
  status: ThresholdStatus;
  /** ISO 8601 timestamp when the threshold was first breached (if breached) */
  breachedAt?: string;
  /** Human-readable message describing the alert */
  message: string;
}

// =============================================================================
// 3. GOALS
// =============================================================================

/**
 * Current status of goal progress.
 * - on_track: Progress is ahead of or meeting the expected trajectory
 * - at_risk: Progress is slightly behind but achievable
 * - behind: Progress is significantly behind schedule
 * - achieved: Goal has been completed
 */
export type GoalStatus = "on_track" | "at_risk" | "behind" | "achieved";

/**
 * A business goal with progress tracking.
 */
export interface Goal {
  /** Unique identifier for the goal */
  id: string;
  /** Human-readable name for the goal */
  name: string;
  /** The metric being tracked */
  metric: MetricType;
  /** Target value to achieve */
  targetValue: number;
  /** Current value of the metric */
  currentValue: number;
  /** ISO 8601 date when tracking started */
  startDate: string;
  /** ISO 8601 date when the goal should be achieved */
  endDate: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current status of goal progress */
  status: GoalStatus;
}

// =============================================================================
// COMBINED ALERTS DATA
// =============================================================================

/**
 * Combined alerts and monitoring data for the dashboard.
 */
export interface AlertsData {
  /** Detected anomalies across all monitored metrics */
  anomalies: Anomaly[];
  /** Active threshold alerts */
  thresholdAlerts: ThresholdAlert[];
  /** Business goals with progress tracking */
  goals: Goal[];
  /** ISO 8601 timestamp when data was last updated */
  lastUpdated: string;
}

// =============================================================================
// API RESPONSE TYPE
// =============================================================================

/**
 * API response wrapper for alerts data.
 */
export interface AlertsResponse {
  /** Whether the request was successful */
  success: boolean;
  /** The alerts data payload */
  data: AlertsData;
  /** ISO 8601 timestamp of the response */
  timestamp: string;
}
