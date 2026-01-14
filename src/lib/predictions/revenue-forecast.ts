/**
 * Revenue Forecast Module
 *
 * Generates revenue projections using linear regression with confidence intervals.
 * The algorithm analyzes historical revenue trends from subscription and transaction
 * data to predict future revenue with statistically-derived confidence bounds.
 */

import type {
  SubscriptionMetrics,
  RevenueMetrics,
  RevenueTrendDataPoint,
} from "@/types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * A single forecast data point with predicted value and confidence bounds.
 */
export interface ForecastDataPoint {
  /** ISO 8601 date string (e.g., "2026-02-15") */
  date: string;
  /** Predicted revenue value */
  predicted: number;
  /** Lower bound of confidence interval (95%) */
  lower: number;
  /** Upper bound of confidence interval (95%) */
  upper: number;
}

/**
 * Complete revenue forecast with predictions and metadata.
 */
export interface RevenueForecast {
  /** Forecast period used */
  period: "30d" | "90d" | "12m";
  /** Array of forecast data points */
  forecast: ForecastDataPoint[];
  /** Starting MRR at forecast generation */
  startingMRR: number;
  /** Projected MRR at end of forecast period */
  projectedMRR: number;
  /** Projected cumulative revenue over the forecast period */
  projectedTotalRevenue: number;
  /** Trend direction based on slope */
  trend: "growing" | "declining" | "stable";
  /** Daily growth rate as percentage */
  dailyGrowthRate: number;
  /** Monthly growth rate as percentage */
  monthlyGrowthRate: number;
  /** Confidence level used for intervals (default 0.95) */
  confidenceLevel: number;
  /** ISO timestamp when forecast was generated */
  generatedAt: string;
}

/**
 * Linear regression result with slope and intercept.
 */
interface TrendResult {
  slope: number;
  intercept: number;
}

/**
 * Confidence interval bounds.
 */
interface ConfidenceInterval {
  lower: number;
  upper: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Number of forecast points to generate for each period */
const FORECAST_POINTS: Record<"30d" | "90d" | "12m", number> = {
  "30d": 30,
  "90d": 90,
  "12m": 365,
};

/** Z-score for 95% confidence interval */
const Z_SCORE_95 = 1.96;

/** Threshold for considering trend as stable (daily change %) */
const STABLE_THRESHOLD = 0.001;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate trend from data points using simple linear regression.
 *
 * Uses the least squares method to find the best-fit line:
 * y = mx + b where m is slope and b is intercept.
 *
 * The slope represents the average daily change in revenue.
 * The intercept represents the baseline value at x=0.
 *
 * @param dataPoints - Array of date-value pairs
 * @returns Linear regression coefficients (slope and intercept)
 */
function calculateTrend(
  dataPoints: { date: string; value: number }[]
): TrendResult {
  const n = dataPoints.length;

  if (n === 0) {
    return { slope: 0, intercept: 0 };
  }

  if (n === 1) {
    const firstPoint = dataPoints[0];
    return { slope: 0, intercept: firstPoint ? firstPoint.value : 0 };
  }

  // Convert dates to sequential indices (0, 1, 2, ...)
  // This simplifies the regression calculation
  const xValues = dataPoints.map((_, i) => i);
  const yValues = dataPoints.map((d) => d.value);

  // Calculate means
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;

  // Calculate slope using least squares formula:
  // slope = sum((x - xMean)(y - yMean)) / sum((x - xMean)^2)
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const xVal = xValues[i];
    const yVal = yValues[i];
    if (xVal === undefined || yVal === undefined) continue;
    const xDiff = xVal - xMean;
    const yDiff = yVal - yMean;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }

  // Handle edge case where all x values are the same
  const slope = denominator !== 0 ? numerator / denominator : 0;

  // Calculate intercept: b = yMean - m * xMean
  const intercept = yMean - slope * xMean;

  return { slope, intercept };
}

/**
 * Calculate historical variance (standard deviation) of residuals.
 *
 * Residuals are the differences between actual values and predicted values
 * from the trend line. The variance helps determine confidence interval width.
 *
 * @param dataPoints - Historical data points
 * @param trend - Calculated trend line
 * @returns Standard deviation of residuals
 */
function calculateHistoricalVariance(
  dataPoints: { date: string; value: number }[],
  trend: TrendResult
): number {
  const n = dataPoints.length;

  if (n < 2) {
    // Not enough data for meaningful variance
    return 0;
  }

  // Calculate residuals (actual - predicted)
  const residuals = dataPoints.map((point, i) => {
    const predicted = trend.intercept + trend.slope * i;
    return point.value - predicted;
  });

  // Calculate variance: sum(residual^2) / (n - 2)
  // We use n-2 degrees of freedom for simple linear regression
  const sumSquaredResiduals = residuals.reduce(
    (sum, r) => sum + r * r,
    0
  );
  const variance = sumSquaredResiduals / (n - 2);

  return Math.sqrt(variance);
}

/**
 * Generate confidence intervals based on historical variance.
 *
 * Confidence intervals widen as we project further into the future,
 * reflecting increased uncertainty in longer-term predictions.
 *
 * The formula uses: CI = predicted +/- z * stdError * sqrt(1 + 1/n + factor)
 * where factor accounts for distance from the mean of historical data.
 *
 * @param predictedValue - The point estimate
 * @param daysOut - Number of days into the future
 * @param historicalVariance - Standard deviation of residuals
 * @param historicalLength - Number of historical data points
 * @returns Upper and lower bounds of the confidence interval
 */
function calculateConfidenceInterval(
  predictedValue: number,
  daysOut: number,
  historicalVariance: number,
  historicalLength: number
): ConfidenceInterval {
  // If no variance data, use a default 10% band
  if (historicalVariance === 0 || historicalLength < 2) {
    const defaultBand = predictedValue * 0.1;
    return {
      lower: Math.max(0, predictedValue - defaultBand),
      upper: predictedValue + defaultBand,
    };
  }

  // Standard error increases with distance from historical data
  // We use a prediction interval formula that accounts for:
  // 1. Inherent variance in the data
  // 2. Uncertainty in the regression parameters
  // 3. Distance from the center of historical data
  const historicalMidpoint = (historicalLength - 1) / 2;
  const distanceFromMean = daysOut + historicalLength - historicalMidpoint;

  // Calculate sum of squared deviations from mean for x values
  const xSumSquares = Array.from({ length: historicalLength }, (_, i) => i)
    .reduce((sum, x) => sum + Math.pow(x - historicalMidpoint, 2), 0);

  // Prediction interval factor
  const predictionFactor = 1 + (1 / historicalLength) +
    (Math.pow(distanceFromMean, 2) / xSumSquares);

  // Standard error for prediction
  const standardError = historicalVariance * Math.sqrt(predictionFactor);

  // Apply z-score for 95% confidence
  const margin = Z_SCORE_95 * standardError;

  return {
    lower: Math.max(0, predictedValue - margin),
    upper: predictedValue + margin,
  };
}

/**
 * Determine trend direction based on daily growth rate.
 *
 * @param dailyGrowthRate - Daily percentage change
 * @returns Trend classification
 */
function classifyTrend(dailyGrowthRate: number): "growing" | "declining" | "stable" {
  if (dailyGrowthRate > STABLE_THRESHOLD) {
    return "growing";
  } else if (dailyGrowthRate < -STABLE_THRESHOLD) {
    return "declining";
  }
  return "stable";
}

/**
 * Add days to a date and return ISO string.
 *
 * @param baseDate - Starting date
 * @param days - Number of days to add
 * @returns ISO date string
 */
function addDays(baseDate: Date, days: number): string {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  const isoString = result.toISOString().split("T")[0];
  return isoString ?? result.toISOString().slice(0, 10);
}

/**
 * Build historical data points from metrics.
 *
 * Combines revenue trend data with MRR information to create
 * a comprehensive historical dataset for forecasting.
 *
 * @param revenueMetrics - Revenue metrics with trend data
 * @param subscriptionMetrics - Subscription metrics with MRR
 * @returns Array of data points for regression
 */
function buildHistoricalData(
  revenueMetrics: RevenueMetrics,
  subscriptionMetrics: SubscriptionMetrics
): { date: string; value: number }[] {
  // Use revenue trend if available
  if (revenueMetrics.revenueTrend && revenueMetrics.revenueTrend.length > 0) {
    return revenueMetrics.revenueTrend.map((point: RevenueTrendDataPoint) => ({
      date: point.date,
      value: point.net,
    }));
  }

  // Fallback: create synthetic data from current MRR
  // This assumes MRR represents a recent monthly snapshot
  const today = new Date();
  const syntheticData: { date: string; value: number }[] = [];

  // Generate 30 days of historical data based on current metrics
  const dailyRevenue = subscriptionMetrics.mrr / 30;

  for (let i = 29; i >= 0; i--) {
    syntheticData.push({
      date: addDays(today, -i),
      value: dailyRevenue,
    });
  }

  return syntheticData;
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

/**
 * Generate revenue forecast using linear regression with confidence intervals.
 *
 * This function analyzes historical revenue patterns and projects future revenue
 * using a simple linear regression model. The confidence intervals widen over
 * time to reflect increasing uncertainty in longer-term predictions.
 *
 * Algorithm overview:
 * 1. Build historical data from revenue trends and subscription metrics
 * 2. Fit a linear regression line to the historical data
 * 3. Calculate residual variance for confidence interval estimation
 * 4. Generate forecast points with widening confidence bands
 * 5. Compute summary statistics (growth rates, projected totals)
 *
 * @param subscriptionMetrics - Subscription data including MRR and ARR
 * @param revenueMetrics - Revenue data including historical trends
 * @param period - Forecast period ('30d' | '90d' | '12m')
 * @returns Complete revenue forecast with predictions and confidence bounds
 *
 * @example
 * ```typescript
 * const forecast = generateRevenueForecast(
 *   subscriptionMetrics,
 *   revenueMetrics,
 *   '90d'
 * );
 * console.log(`Projected MRR: $${forecast.projectedMRR.toLocaleString()}`);
 * console.log(`Trend: ${forecast.trend}`);
 * ```
 */
export function generateRevenueForecast(
  subscriptionMetrics: SubscriptionMetrics,
  revenueMetrics: RevenueMetrics,
  period: "30d" | "90d" | "12m" = "30d"
): RevenueForecast {
  // Build historical data for regression
  const historicalData = buildHistoricalData(revenueMetrics, subscriptionMetrics);

  // Calculate trend using linear regression
  const trend = calculateTrend(historicalData);

  // Calculate historical variance for confidence intervals
  const historicalVariance = calculateHistoricalVariance(historicalData, trend);

  // Determine number of forecast points
  const forecastDays = FORECAST_POINTS[period];

  // Starting point is one day after the last historical data point
  const lastHistoricalPoint = historicalData[historicalData.length - 1];
  const lastDate = lastHistoricalPoint
    ? new Date(lastHistoricalPoint.date)
    : new Date();

  // Generate forecast points
  const forecast: ForecastDataPoint[] = [];
  let cumulativeRevenue = 0;

  for (let day = 1; day <= forecastDays; day++) {
    // Calculate predicted value
    // x-value continues from where historical data ended
    const xValue = historicalData.length + day - 1;
    const predicted = trend.intercept + trend.slope * xValue;

    // Ensure predicted value is non-negative
    const adjustedPredicted = Math.max(0, predicted);

    // Calculate confidence interval
    const { lower, upper } = calculateConfidenceInterval(
      adjustedPredicted,
      day,
      historicalVariance,
      historicalData.length
    );

    forecast.push({
      date: addDays(lastDate, day),
      predicted: adjustedPredicted,
      lower,
      upper,
    });

    cumulativeRevenue += adjustedPredicted;
  }

  // Calculate growth rates
  const startingMRR = subscriptionMetrics.mrr;
  const lastForecastPoint = forecast[forecast.length - 1];
  const lastForecastValue = lastForecastPoint ? lastForecastPoint.predicted : 0;

  // Projected MRR is the daily revenue at end of forecast * 30
  const projectedMRR = lastForecastValue * 30;

  // Daily growth rate based on slope relative to average
  const avgHistoricalValue =
    historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length;
  const dailyGrowthRate =
    avgHistoricalValue > 0 ? (trend.slope / avgHistoricalValue) * 100 : 0;

  // Monthly growth rate (compound daily rate over 30 days)
  const monthlyGrowthRate =
    (Math.pow(1 + dailyGrowthRate / 100, 30) - 1) * 100;

  return {
    period,
    forecast,
    startingMRR,
    projectedMRR,
    projectedTotalRevenue: cumulativeRevenue,
    trend: classifyTrend(dailyGrowthRate),
    dailyGrowthRate,
    monthlyGrowthRate,
    confidenceLevel: 0.95,
    generatedAt: new Date().toISOString(),
  };
}
