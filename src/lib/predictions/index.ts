/**
 * Predictive Analytics Module
 *
 * Phase 2 prediction algorithms for the unified analytics dashboard.
 * Provides revenue forecasting, churn prediction, and LTV projections
 * using statistical methods on historical metrics data.
 */

// =============================================================================
// REVENUE FORECAST
// =============================================================================

export { generateRevenueForecast } from "./revenue-forecast";
export type {
  RevenueForecast,
  ForecastDataPoint,
} from "./revenue-forecast";

// =============================================================================
// CHURN PREDICTION
// =============================================================================

export { predictChurn } from "./churn-prediction";
export type {
  ChurnPrediction,
  AtRiskCustomer,
  ChurnRiskFactor,
  RiskLevel,
} from "./churn-prediction";

// =============================================================================
// LTV PROJECTION
// =============================================================================

export { projectLTV } from "./ltv-projection";
export type {
  LTVProjection,
  LTVSegment,
  LTVProjectionPoint,
} from "./ltv-projection";
