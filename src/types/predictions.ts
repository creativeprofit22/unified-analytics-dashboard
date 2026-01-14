/**
 * Predictive Analytics Types
 *
 * Type definitions for Phase 2 predictive analytics features, including:
 * 1. Revenue Forecasting - MRR/ARR predictions with confidence intervals
 * 2. Churn Prediction - At-risk customer identification and risk scoring
 * 3. LTV Projection - Customer lifetime value forecasting by segment
 */

// =============================================================================
// 1. REVENUE FORECASTING
// =============================================================================

/**
 * Metrics that can be forecasted.
 * - mrr: Monthly Recurring Revenue
 * - arr: Annual Recurring Revenue
 * - revenue: Total revenue (includes one-time)
 */
export type ForecastMetric = "mrr" | "arr" | "revenue";

/**
 * Time period for the forecast.
 * - 30d: 30-day forecast
 * - 90d: 90-day (quarterly) forecast
 * - 12m: 12-month (annual) forecast
 */
export type ForecastPeriod = "30d" | "90d" | "12m";

/**
 * Trend direction of the forecast.
 * - growing: Upward trajectory
 * - stable: Flat/minimal change
 * - declining: Downward trajectory
 */
export type ForecastTrend = "growing" | "stable" | "declining";

/**
 * A single data point in the forecast timeline.
 * Includes the predicted value with confidence bounds.
 */
export interface ForecastDataPoint {
  /** ISO 8601 date string for this data point */
  date: string;
  /** Predicted value at this point in time */
  predicted: number;
  /** Lower bound of the confidence interval (e.g., 95% CI) */
  lower: number;
  /** Upper bound of the confidence interval (e.g., 95% CI) */
  upper: number;
  /** Actual observed value (for historical comparison, if available) */
  actual?: number;
}

/**
 * Complete revenue forecast with predictions, confidence, and trend analysis.
 */
export interface RevenueForecast {
  /** The metric being forecasted */
  metric: ForecastMetric;
  /** Current value of the metric */
  currentValue: number;
  /** Forecasted value at the end of the forecast period */
  forecastedValue: number;
  /** Percentage change from current to forecasted value */
  changePercent: number;
  /** Confidence level of the forecast (0-100) */
  confidence: number;
  /** Overall trend direction of the forecast */
  trend: ForecastTrend;
  /** Array of data points forming the forecast timeline */
  dataPoints: ForecastDataPoint[];
  /** Time period covered by this forecast */
  forecastPeriod: ForecastPeriod;
  /** ISO 8601 timestamp when this forecast was generated */
  generatedAt: string;
}

// =============================================================================
// 2. CHURN PREDICTION
// =============================================================================

/**
 * Risk level classification for churn prediction.
 * - high: Immediate action required (>70% risk score)
 * - medium: Monitor closely (40-70% risk score)
 * - low: Standard attention (<40% risk score)
 */
export type ChurnRiskLevel = "high" | "medium" | "low";

/**
 * A factor contributing to a customer's churn risk.
 */
export interface ChurnRiskFactor {
  /** Name of the risk factor (e.g., "Low engagement", "Payment failures") */
  factor: string;
  /** Impact weight of this factor on the overall risk score (0-100) */
  impact: number;
  /** Human-readable description of why this factor indicates risk */
  description: string;
}

/**
 * A customer identified as at-risk for churn.
 */
export interface AtRiskCustomer {
  /** Unique identifier for the customer */
  id: string;
  /** Customer's display name */
  name: string;
  /** Customer's email address */
  email: string;
  /** Classified risk level */
  riskLevel: ChurnRiskLevel;
  /** Calculated risk score (0-100, higher = more likely to churn) */
  riskScore: number;
  /** Factors contributing to this customer's risk score */
  riskFactors: ChurnRiskFactor[];
  /** Monthly Recurring Revenue from this customer */
  mrr: number;
  /** ISO 8601 date when customer first subscribed */
  subscribedSince: string;
  /** ISO 8601 timestamp of customer's last activity */
  lastActivity: string;
  /** Number of days since the customer was last active */
  daysSinceActivity: number;
  /** Current subscription plan name */
  plan: string;
}

/**
 * Complete churn prediction summary with at-risk customers and metrics.
 */
export interface ChurnPrediction {
  /** Total number of customers identified as at-risk */
  totalAtRisk: number;
  /** Total MRR at risk from potential churns */
  revenueAtRisk: number;
  /** Count of at-risk customers by risk level */
  byRiskLevel: {
    /** Number of high-risk customers */
    high: number;
    /** Number of medium-risk customers */
    medium: number;
    /** Number of low-risk customers */
    low: number;
  };
  /** List of individual at-risk customers */
  customers: AtRiskCustomer[];
  /** Historical accuracy of the churn prediction model (0-100) */
  modelAccuracy: number;
  /** ISO 8601 timestamp when predictions were last updated */
  lastUpdated: string;
}

// =============================================================================
// 3. LTV (LIFETIME VALUE) PROJECTION
// =============================================================================

/**
 * Impact direction for LTV factors.
 * - positive: Factor increases LTV
 * - negative: Factor decreases LTV
 */
export type LTVImpactDirection = "positive" | "negative";

/**
 * LTV projection for a specific customer segment.
 */
export interface LTVSegment {
  /** Name of the customer segment (e.g., "Early adopters", "Enterprise") */
  segment: string;
  /** Number of customers in this segment */
  customerCount: number;
  /** Current calculated LTV for this segment */
  currentLTV: number;
  /** Projected LTV at 12 months */
  projectedLTV: number;
  /** Expected growth rate for this segment (percentage) */
  growthRate: number;
}

/**
 * A single point on the LTV projection curve.
 */
export interface LTVProjectionPoint {
  /** Month number in the projection (e.g., 1, 3, 6, 12, 24) */
  month: number;
  /** Projected LTV at this point in time */
  projectedLTV: number;
  /** Confidence level for this projection (0-100) */
  confidence: number;
}

/**
 * A factor influencing LTV projections.
 */
export interface LTVFactor {
  /** Name of the factor (e.g., "High engagement", "Feature adoption") */
  factor: string;
  /** Whether this factor positively or negatively impacts LTV */
  impact: LTVImpactDirection;
  /** Relative weight of this factor's influence (0-100) */
  weight: number;
}

/**
 * Complete LTV projection with segment breakdowns and influencing factors.
 */
export interface LTVProjection {
  /** Current average LTV across all customers */
  averageLTV: number;
  /** Projected average LTV at 12 months */
  projectedLTV12m: number;
  /** Projected average LTV at 24 months */
  projectedLTV24m: number;
  /** LTV projections broken down by customer segment */
  bySegment: LTVSegment[];
  /** LTV values over time for visualization */
  projectionCurve: LTVProjectionPoint[];
  /** Factors influencing LTV projections */
  factors: LTVFactor[];
  /** ISO 8601 timestamp when projections were last updated */
  lastUpdated: string;
}

// =============================================================================
// COMBINED PREDICTIONS DATA
// =============================================================================

/**
 * Combined predictive analytics data for the dashboard.
 */
export interface PredictionsData {
  /** Revenue forecast with MRR/ARR predictions */
  revenueForecast: RevenueForecast;
  /** Churn prediction with at-risk customers */
  churnPrediction: ChurnPrediction;
  /** LTV projections by segment */
  ltvProjection: LTVProjection;
  /** ISO 8601 timestamp when all predictions were generated */
  generatedAt: string;
}

// =============================================================================
// API RESPONSE TYPE
// =============================================================================

/**
 * API response wrapper for predictions data.
 */
export interface PredictionsResponse {
  /** Whether the request was successful */
  success: boolean;
  /** The predictions data payload (present on success) */
  data?: PredictionsData;
  /** Error message (present on failure) */
  error?: string;
  /** ISO 8601 timestamp of the response */
  timestamp: string;
}
