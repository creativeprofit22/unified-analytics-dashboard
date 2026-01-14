/**
 * Mock Data Generators for Predictive Analytics API
 *
 * This module contains mock data for the predictive analytics feature,
 * demonstrating revenue forecasting, churn prediction, and LTV projections.
 */

import type {
  RevenueForecast,
  ForecastDataPoint,
  ForecastTrend,
  ChurnPrediction,
  AtRiskCustomer,
  ChurnRiskFactor,
  ChurnRiskLevel,
  LTVProjection,
  LTVSegment,
  LTVProjectionPoint,
  LTVFactor,
  PredictionsData,
} from "@/types";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate an ISO timestamp for N hours ago.
 */
function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

/**
 * Generate an ISO date string for N days ago.
 */
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Generate an ISO date string for N days from now.
 */
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Generate forecast data points with confidence intervals.
 * @param days - Number of days to generate
 * @param startValue - Starting MRR value
 * @param dailyGrowthRate - Daily growth rate (e.g., 0.003 for ~0.3%/day)
 * @param historicalDays - Number of days to include historical actuals
 */
function generateForecastData(
  days: number,
  startValue: number,
  dailyGrowthRate: number,
  historicalDays: number = 7
): ForecastDataPoint[] {
  const data: ForecastDataPoint[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - historicalDays + i);
    const dateStr = date.toISOString().split("T")[0] ?? "";

    // Calculate base value with growth
    const growthFactor = Math.pow(1 + dailyGrowthRate, i);
    const baseValue = startValue * growthFactor;

    // Add some natural variance (smaller for historical, larger for predictions)
    const isHistorical = i < historicalDays;
    const variance = isHistorical ? 0.005 : 0.01;
    const randomFactor = 1 + (Math.random() - 0.5) * variance;
    const predicted = Math.round(baseValue * randomFactor);

    // Confidence interval widens as we go further into the future
    const daysIntoFuture = Math.max(0, i - historicalDays);
    const confidenceSpread = isHistorical
      ? 0
      : 0.02 + daysIntoFuture * 0.003; // Starts at 2%, grows 0.3% per day

    const lower = isHistorical
      ? predicted
      : Math.round(predicted * (1 - confidenceSpread));
    const upper = isHistorical
      ? predicted
      : Math.round(predicted * (1 + confidenceSpread));

    const dataPoint: ForecastDataPoint = {
      date: dateStr,
      predicted,
      lower,
      upper,
    };

    // Add actual value for historical data points
    if (isHistorical) {
      dataPoint.actual = predicted;
    }

    data.push(dataPoint);
  }

  return data;
}

/**
 * Generate a random customer ID.
 */
function generateCustomerId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "cust_";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// =============================================================================
// REVENUE FORECAST MOCK DATA
// =============================================================================

/**
 * Customer names for realistic mock data.
 */
const CUSTOMER_NAMES = [
  "TechFlow Industries",
  "DataPrime Solutions",
  "CloudNova Systems",
  "InnovateTech Corp",
  "Apex Digital Labs",
  "Quantum Analytics Inc",
  "NexGen Platforms",
  "Streamline Software",
  "PivotPoint Media",
  "Catalyst Ventures",
  "Blueprint Digital",
  "Horizon SaaS Co",
];

/**
 * Subscription plans for customer mock data.
 */
const SUBSCRIPTION_PLANS = [
  "Enterprise",
  "Professional",
  "Starter",
  "Growth",
];

/**
 * Risk factor templates with realistic descriptions.
 */
const RISK_FACTOR_TEMPLATES: Array<{ factor: string; description: string }> = [
  {
    factor: "Decreased login frequency",
    description: "User logins dropped 65% compared to previous 30-day average",
  },
  {
    factor: "Payment method expiring",
    description: "Credit card on file expires within 14 days",
  },
  {
    factor: "Support tickets increased",
    description: "5 support tickets opened in the last 7 days (avg: 0.5/week)",
  },
  {
    factor: "Feature usage declined",
    description: "Core feature utilization down 40% month-over-month",
  },
  {
    factor: "Contract renewal approaching",
    description: "Annual contract expires in 45 days, no renewal discussion initiated",
  },
  {
    factor: "Team size reduced",
    description: "Active users decreased from 12 to 4 in the last 30 days",
  },
  {
    factor: "Integration disconnected",
    description: "Primary CRM integration disabled 10 days ago",
  },
  {
    factor: "Billing failures",
    description: "2 consecutive payment attempts failed",
  },
  {
    factor: "No recent activity",
    description: "Account owner last active 21 days ago",
  },
  {
    factor: "Downgrade inquiry",
    description: "Customer inquired about downgrade options via support",
  },
];

/**
 * Determine trend direction based on growth rate.
 */
function determineTrend(growthRate: number): ForecastTrend {
  if (growthRate > 2) return "growing";
  if (growthRate < -2) return "declining";
  return "stable";
}

/**
 * Generate mock revenue forecast data.
 */
function getMockRevenueForecast(): RevenueForecast {
  const currentValue = 145000;
  const dailyGrowthRate = 0.0028; // ~8.4% monthly growth (compounded daily)
  const forecastDays = 30;
  const historicalDays = 8;

  const dataPoints = generateForecastData(
    forecastDays + historicalDays,
    currentValue,
    dailyGrowthRate,
    historicalDays
  );

  // Calculate projected values
  const lastDataPoint = dataPoints[dataPoints.length - 1]!;
  const forecastedValue = lastDataPoint.predicted;
  const changePercent =
    Math.round(((forecastedValue - currentValue) / currentValue) * 1000) / 10;

  return {
    metric: "mrr",
    currentValue,
    forecastedValue,
    changePercent,
    confidence: 87, // 87% model confidence
    trend: determineTrend(changePercent),
    dataPoints,
    forecastPeriod: "30d",
    generatedAt: new Date().toISOString(),
  };
}

// =============================================================================
// CHURN PREDICTION MOCK DATA
// =============================================================================

/**
 * Generate risk factors for a customer based on risk level.
 */
function generateRiskFactors(riskLevel: ChurnRiskLevel): ChurnRiskFactor[] {
  const factorCounts: Record<ChurnRiskLevel, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };
  const numFactors = factorCounts[riskLevel];

  // Impact ranges by risk level
  const impactRanges: Record<ChurnRiskLevel, { min: number; max: number }> = {
    high: { min: 70, max: 95 },
    medium: { min: 40, max: 69 },
    low: { min: 15, max: 39 },
  };
  const impactRange = impactRanges[riskLevel];

  const shuffledTemplates = [...RISK_FACTOR_TEMPLATES].sort(
    () => Math.random() - 0.5
  );

  return shuffledTemplates.slice(0, numFactors).map((template) => ({
    factor: template.factor,
    impact: Math.round(
      impactRange.min + Math.random() * (impactRange.max - impactRange.min)
    ),
    description: template.description,
  }));
}

/**
 * Generate a single at-risk customer with realistic data.
 */
function generateAtRiskCustomer(
  index: number,
  riskLevel: ChurnRiskLevel
): AtRiskCustomer {
  const name = CUSTOMER_NAMES[index % CUSTOMER_NAMES.length]!;
  const plan = SUBSCRIPTION_PLANS[index % SUBSCRIPTION_PLANS.length]!;

  // MRR ranges by risk level
  const mrrRanges: Record<ChurnRiskLevel, { min: number; max: number }> = {
    high: { min: 800, max: 2500 },
    medium: { min: 400, max: 1200 },
    low: { min: 200, max: 600 },
  };
  const range = mrrRanges[riskLevel];
  const mrr = Math.round(range.min + Math.random() * (range.max - range.min));

  // Risk score ranges
  const scoreRanges: Record<ChurnRiskLevel, { min: number; max: number }> = {
    high: { min: 72, max: 92 },
    medium: { min: 45, max: 70 },
    low: { min: 25, max: 44 },
  };
  const scoreRange = scoreRanges[riskLevel];
  const riskScore = Math.round(
    scoreRange.min + Math.random() * (scoreRange.max - scoreRange.min)
  );

  // Days since activity (higher for higher risk)
  const activityRanges: Record<ChurnRiskLevel, { min: number; max: number }> = {
    high: { min: 14, max: 45 },
    medium: { min: 7, max: 21 },
    low: { min: 2, max: 10 },
  };
  const activityRange = activityRanges[riskLevel];
  const daysSinceActivity = Math.round(
    activityRange.min +
      Math.random() * (activityRange.max - activityRange.min)
  );

  // Customer tenure (months)
  const tenureRanges: Record<ChurnRiskLevel, { min: number; max: number }> = {
    high: { min: 3, max: 18 },
    medium: { min: 6, max: 24 },
    low: { min: 12, max: 36 },
  };
  const tenureRange = tenureRanges[riskLevel];
  const tenureMonths = Math.round(
    tenureRange.min + Math.random() * (tenureRange.max - tenureRange.min)
  );
  const subscribedSince = daysAgo(tenureMonths * 30);

  return {
    id: generateCustomerId(),
    name,
    email: `contact@${name.toLowerCase().replace(/\s+/g, "")}.com`,
    riskLevel,
    riskScore,
    riskFactors: generateRiskFactors(riskLevel),
    mrr,
    subscribedSince,
    lastActivity: hoursAgo(daysSinceActivity * 24),
    daysSinceActivity,
    plan,
  };
}

/**
 * Generate mock churn prediction data.
 */
function getMockChurnPrediction(): ChurnPrediction {
  // Generate customers by risk level (3 high, 4 medium, 3 low = 10 total)
  const highRiskCustomers = [0, 1, 2].map((i) =>
    generateAtRiskCustomer(i, "high")
  );
  const mediumRiskCustomers = [3, 4, 5, 6].map((i) =>
    generateAtRiskCustomer(i, "medium")
  );
  const lowRiskCustomers = [7, 8, 9].map((i) =>
    generateAtRiskCustomer(i, "low")
  );

  const customers = [
    ...highRiskCustomers,
    ...mediumRiskCustomers,
    ...lowRiskCustomers,
  ];

  // Calculate totals
  const revenueAtRisk = customers.reduce((sum, c) => sum + c.mrr, 0);

  return {
    totalAtRisk: customers.length,
    revenueAtRisk,
    byRiskLevel: {
      high: highRiskCustomers.length,
      medium: mediumRiskCustomers.length,
      low: lowRiskCustomers.length,
    },
    customers,
    modelAccuracy: 85, // 85% accuracy
    lastUpdated: new Date().toISOString(),
  };
}

// =============================================================================
// LTV PROJECTION MOCK DATA
// =============================================================================

/**
 * Generate mock LTV projection data.
 */
function getMockLTVProjection(): LTVProjection {
  const bySegment: LTVSegment[] = [
    {
      segment: "Enterprise",
      customerCount: 45,
      currentLTV: 4850,
      projectedLTV: 5920,
      growthRate: 22.1,
    },
    {
      segment: "Professional",
      customerCount: 320,
      currentLTV: 1450,
      projectedLTV: 1780,
      growthRate: 22.8,
    },
    {
      segment: "Starter",
      customerCount: 890,
      currentLTV: 680,
      projectedLTV: 820,
      growthRate: 20.6,
    },
    {
      segment: "Trial Converters",
      customerCount: 215,
      currentLTV: 520,
      projectedLTV: 680,
      growthRate: 30.8,
    },
  ];

  // Calculate weighted averages
  const totalCustomers = bySegment.reduce((sum, s) => sum + s.customerCount, 0);
  const averageLTV = Math.round(
    bySegment.reduce((sum, s) => sum + s.currentLTV * s.customerCount, 0) /
      totalCustomers
  );
  const projectedLTV12m = Math.round(
    bySegment.reduce((sum, s) => sum + s.projectedLTV * s.customerCount, 0) /
      totalCustomers
  );
  // 24-month projection with continued growth
  const projectedLTV24m = Math.round(projectedLTV12m * 1.16); // ~16% additional growth

  // LTV projection curve with confidence scores
  const projectionCurve: LTVProjectionPoint[] = [
    { month: 1, projectedLTV: Math.round(averageLTV / 12), confidence: 95 },
    { month: 3, projectedLTV: Math.round(averageLTV / 4), confidence: 92 },
    { month: 6, projectedLTV: Math.round(averageLTV / 2), confidence: 88 },
    { month: 12, projectedLTV: projectedLTV12m, confidence: 83 },
    { month: 24, projectedLTV: projectedLTV24m, confidence: 72 },
  ];

  // Factors influencing LTV
  const factors: LTVFactor[] = [
    {
      factor: "Product engagement",
      impact: "positive",
      weight: 28,
    },
    {
      factor: "Feature adoption rate",
      impact: "positive",
      weight: 22,
    },
    {
      factor: "Support satisfaction",
      impact: "positive",
      weight: 18,
    },
    {
      factor: "Competitive pressure",
      impact: "negative",
      weight: 15,
    },
    {
      factor: "Expansion potential",
      impact: "positive",
      weight: 17,
    },
  ];

  return {
    averageLTV,
    projectedLTV12m,
    projectedLTV24m,
    bySegment,
    projectionCurve,
    factors,
    lastUpdated: new Date().toISOString(),
  };
}

// =============================================================================
// COMBINED PREDICTIONS DATA
// =============================================================================

/**
 * Get complete mock predictions data.
 */
function getMockPredictionsData(): PredictionsData {
  return {
    revenueForecast: getMockRevenueForecast(),
    churnPrediction: getMockChurnPrediction(),
    ltvProjection: getMockLTVProjection(),
    generatedAt: new Date().toISOString(),
  };
}

// =============================================================================
// MOCK DATA CACHE (globalThis pattern for hot reload resilience)
// =============================================================================

/**
 * Global cache interface for hot reload resilience.
 * Using globalThis prevents cache reset during Turbopack hot reloads.
 * @see Fixes & Lessons Learned: "Turbopack Hot Reload Loses In-Memory State"
 */
interface PredictionsMockDataCache {
  __predictionsMockDataCache?: PredictionsData;
}

const globalCache = globalThis as unknown as PredictionsMockDataCache;

/**
 * Get cached predictions mock data. Returns cached version with fresh timestamp.
 * Uses globalThis for hot reload resilience.
 */
export function getCachedPredictionsMockData(): PredictionsData {
  if (!globalCache.__predictionsMockDataCache) {
    globalCache.__predictionsMockDataCache = getMockPredictionsData();
  }
  // Return with fresh timestamp
  return {
    ...globalCache.__predictionsMockDataCache,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get individual mock data generators for testing purposes.
 */
export const predictionsMockGenerators = {
  getRevenueForecast: getMockRevenueForecast,
  getChurnPrediction: getMockChurnPrediction,
  getLTVProjection: getMockLTVProjection,
};
