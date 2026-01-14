/**
 * Anomaly Detection Module
 *
 * Z-score based statistical anomaly detection for analytics metrics.
 * Identifies unusual spikes or drops in metric values compared to historical data.
 *
 * @example
 * // Detect if current conversion rate is anomalous
 * const anomaly = detectAnomalies(
 *   'conversionRate',
 *   'Conversion Rate',
 *   historicalData,
 *   currentRate
 * );
 * if (anomaly) {
 *   console.log(`Anomaly detected: ${anomaly.severity} ${anomaly.direction}`);
 * }
 */

import type { TrendDataPoint } from "@/types/analytics";
import type { Anomaly, AnomalySeverity, MetricType } from "@/types/alerts";

/**
 * Calculate the arithmetic mean of an array of values.
 *
 * @param values - Array of numeric values
 * @returns The mean (average) of the values, or 0 for empty arrays
 *
 * @example
 * calculateMean([10, 20, 30]) // => 20
 * calculateMean([]) // => 0
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate the standard deviation of an array of values.
 *
 * Uses the population standard deviation formula:
 * sqrt(sum((x - mean)^2) / n)
 *
 * @param values - Array of numeric values
 * @param mean - Pre-calculated mean of the values
 * @returns The standard deviation, or 0 for empty/single-element arrays
 *
 * @example
 * calculateStdDev([2, 4, 4, 4, 5, 5, 7, 9], 5) // => 2
 * calculateStdDev([5, 5, 5], 5) // => 0
 */
function calculateStdDev(values: number[], mean: number): number {
  if (values.length <= 1) return 0;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate the Z-score for a value relative to a distribution.
 *
 * Z-score measures how many standard deviations a value is from the mean.
 * A Z-score of 0 means the value equals the mean.
 * Positive Z-scores indicate values above the mean.
 * Negative Z-scores indicate values below the mean.
 *
 * @param value - The value to calculate Z-score for
 * @param mean - The mean of the distribution
 * @param stdDev - The standard deviation of the distribution
 * @returns The Z-score, or 0 if stdDev is 0 (all values identical)
 *
 * @example
 * calculateZScore(80, 50, 10) // => 3 (3 std devs above mean)
 * calculateZScore(20, 50, 10) // => -3 (3 std devs below mean)
 * calculateZScore(50, 50, 0) // => 0 (no variance)
 */
function calculateZScore(value: number, mean: number, stdDev: number): number {
  // If standard deviation is 0, all values are identical; no meaningful deviation
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Determine the severity level based on Z-score magnitude.
 *
 * Severity thresholds follow the empirical rule (68-95-99.7 rule):
 * - |z| >= 3: critical (99.7% of data is within 3 std devs)
 * - |z| >= 2: warning (95% of data is within 2 std devs)
 * - |z| >= 1.5: info (smaller but notable deviation)
 *
 * @param zScore - The calculated Z-score
 * @returns The severity classification
 *
 * @example
 * getSeverity(3.5) // => 'critical'
 * getSeverity(-2.5) // => 'warning'
 * getSeverity(1.7) // => 'info'
 * getSeverity(1.0) // => 'info' (fallback, though typically not called for |z| < 1.5)
 */
function getSeverity(zScore: number): AnomalySeverity {
  const absZ = Math.abs(zScore);
  if (absZ >= 3) return "critical";
  if (absZ >= 2) return "warning";
  return "info";
}

/**
 * Generate a unique ID for an anomaly.
 * Combines metric type with timestamp for uniqueness.
 */
function generateAnomalyId(metric: MetricType): string {
  return `anomaly-${metric}-${Date.now()}`;
}

/**
 * Detect anomalies in metric data using Z-score analysis.
 *
 * Compares the current value against the historical distribution.
 * Returns an Anomaly object if |Z-score| > 1.5, otherwise null.
 *
 * The anomaly includes:
 * - The direction (spike or drop)
 * - The severity (critical, warning, info)
 * - The expected value (historical mean)
 * - The deviation magnitude (Z-score)
 * - Recent trend data for context
 *
 * @param metric - The type of metric being analyzed
 * @param metricLabel - Human-readable label for the metric
 * @param historicalData - Array of historical data points (ideally 7-30 days)
 * @param currentValue - The current value to check for anomalies
 * @returns An Anomaly object if an anomaly is detected, null otherwise
 *
 * @example
 * // Normal scenario - no anomaly
 * const data = [
 *   { date: '2026-01-01', value: 100 },
 *   { date: '2026-01-02', value: 102 },
 *   { date: '2026-01-03', value: 98 },
 * ];
 * detectAnomalies('traffic', 'Traffic', data, 101) // => null
 *
 * @example
 * // Spike anomaly
 * const data = [
 *   { date: '2026-01-01', value: 100 },
 *   { date: '2026-01-02', value: 102 },
 *   { date: '2026-01-03', value: 98 },
 * ];
 * detectAnomalies('traffic', 'Traffic', data, 150) // => Anomaly with direction: 'spike'
 *
 * @example
 * // Drop anomaly
 * detectAnomalies('revenue', 'Revenue', data, 50) // => Anomaly with direction: 'drop'
 */
export function detectAnomalies(
  metric: MetricType,
  metricLabel: string,
  historicalData: TrendDataPoint[],
  currentValue: number
): Anomaly | null {
  // Need at least 2 data points for meaningful statistical analysis
  if (historicalData.length < 2) {
    return null;
  }

  // Extract numeric values from trend data points
  const values = historicalData.map((point) => point.value);

  // Calculate statistical measures
  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values, mean);

  // Calculate Z-score for the current value
  const zScore = calculateZScore(currentValue, mean, stdDev);

  // Only flag as anomaly if |Z-score| > 1.5
  const ANOMALY_THRESHOLD = 1.5;
  if (Math.abs(zScore) <= ANOMALY_THRESHOLD) {
    return null;
  }

  // Determine direction and severity
  const direction = zScore > 0 ? "spike" : "drop";
  const severity = getSeverity(zScore);

  // Get the last 7 data points for trend context (or all if fewer)
  const trendSlice = historicalData.slice(-7);

  return {
    id: generateAnomalyId(metric),
    metric,
    metricLabel,
    value: currentValue,
    expectedValue: mean,
    deviation: Math.abs(zScore),
    direction,
    severity,
    detectedAt: new Date().toISOString(),
    trend: trendSlice,
  };
}

// =============================================================================
// UNIT TESTS (as comments showing expected behavior)
// =============================================================================

/*
Test: calculateMean with normal values
  Input: [10, 20, 30]
  Expected: 20

Test: calculateMean with empty array
  Input: []
  Expected: 0

Test: calculateStdDev with uniform values
  Input: values=[5, 5, 5], mean=5
  Expected: 0

Test: calculateStdDev with varied values
  Input: values=[2, 4, 4, 4, 5, 5, 7, 9], mean=5
  Expected: 2 (approximately)

Test: calculateZScore when value equals mean
  Input: value=50, mean=50, stdDev=10
  Expected: 0

Test: calculateZScore with positive deviation
  Input: value=80, mean=50, stdDev=10
  Expected: 3

Test: calculateZScore with negative deviation
  Input: value=20, mean=50, stdDev=10
  Expected: -3

Test: calculateZScore with zero stdDev
  Input: value=100, mean=50, stdDev=0
  Expected: 0 (handles edge case)

Test: getSeverity for critical level
  Input: 3.5 or -3.5
  Expected: 'critical'

Test: getSeverity for warning level
  Input: 2.5 or -2.5
  Expected: 'warning'

Test: getSeverity for info level
  Input: 1.7 or -1.7
  Expected: 'info'

Test: detectAnomalies returns null for insufficient data
  Input: historicalData=[], currentValue=100
  Expected: null

Test: detectAnomalies returns null for normal values
  Input: historicalData=[{date: '2026-01-01', value: 100}, ...similar values], currentValue=101
  Expected: null (Z-score < 1.5)

Test: detectAnomalies detects spike
  Input: historicalData with mean=100, stdDev=5, currentValue=120
  Expected: Anomaly with direction='spike', severity='critical' (Z=4)

Test: detectAnomalies detects drop
  Input: historicalData with mean=100, stdDev=5, currentValue=85
  Expected: Anomaly with direction='drop', severity='warning' (Z=-3)

Test: detectAnomalies includes correct trend slice
  Input: historicalData with 30 points
  Expected: anomaly.trend has exactly 7 most recent points
*/
