/**
 * Alerts Module
 *
 * Barrel export for all alert detection and evaluation functionality.
 *
 * This module provides three main capabilities:
 * 1. Anomaly Detection - Z-score based statistical anomaly detection
 * 2. Threshold Alerts - Rule-based threshold monitoring
 * 3. Goal Progress - Business goal tracking and status calculation
 *
 * @example
 * import { detectAnomalies, evaluateThreshold, evaluateGoal } from '@/lib/alerts';
 *
 * // Detect metric anomalies
 * const anomaly = detectAnomalies('revenue', 'Revenue', historicalData, currentValue);
 *
 * // Check threshold rules
 * const alert = evaluateThreshold(churnRule, currentChurnRate);
 *
 * // Track goal progress
 * const goal = evaluateGoal(revenueGoal);
 */

// Anomaly Detection
export { detectAnomalies } from "./anomaly-detection";

// Threshold Alerts
export { evaluateThreshold } from "./thresholds";

// Goal Progress
export { evaluateGoal } from "./goals";

// Re-export types for convenience
export type {
  // Anomaly types
  Anomaly,
  AnomalySeverity,
  AnomalyDirection,
  MetricType,
  // Threshold types
  ThresholdRule,
  ThresholdAlert,
  ThresholdStatus,
  ThresholdOperator,
  // Goal types
  Goal,
  GoalStatus,
  // Combined data
  AlertsData,
  AlertsResponse,
} from "@/types/alerts";
