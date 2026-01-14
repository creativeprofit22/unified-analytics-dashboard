/**
 * Industry Benchmark Data
 *
 * Realistic SaaS industry benchmark data sourced from aggregated industry reports.
 * Data represents typical B2B SaaS metrics across company sizes.
 *
 * Sources referenced:
 * - OpenView SaaS Benchmarks
 * - KeyBanc SaaS Survey
 * - ChartMogul SaaS Benchmark Report
 * - ProfitWell Benchmark Reports
 * - Gainsight Customer Success Benchmarks
 */

import type {
  BenchmarkMetric,
  BenchmarkMetricId,
  IndustryBenchmark,
  BenchmarkPercentiles,
  BenchmarkComparison,
  PerformanceTier,
  UserMetrics,
  PERFORMANCE_TIERS,
} from "@/types/benchmarks";

// =============================================================================
// METRIC DEFINITIONS
// =============================================================================

/**
 * All benchmarkable metrics with their configuration.
 */
export const BENCHMARK_METRICS: BenchmarkMetric[] = [
  // Revenue Metrics
  {
    id: "arr_growth",
    label: "ARR Growth Rate",
    category: "revenue",
    unit: "%",
    format: "percent",
    higherIsBetter: true,
    description: "Year-over-year Annual Recurring Revenue growth rate",
  },
  {
    id: "mrr",
    label: "Monthly Recurring Revenue",
    category: "revenue",
    unit: "$",
    format: "currency",
    higherIsBetter: true,
    description: "Total predictable monthly revenue from subscriptions",
  },
  {
    id: "arpu",
    label: "Average Revenue Per User",
    category: "revenue",
    unit: "$",
    format: "currency",
    higherIsBetter: true,
    description: "Average monthly revenue generated per active user",
  },
  {
    id: "gross_margin",
    label: "Gross Margin",
    category: "revenue",
    unit: "%",
    format: "percent",
    higherIsBetter: true,
    description: "Revenue minus cost of goods sold, as a percentage",
  },

  // Customer Metrics
  {
    id: "churn_rate",
    label: "Monthly Churn Rate",
    category: "customer",
    unit: "%",
    format: "percent",
    higherIsBetter: false,
    description: "Percentage of customers who cancel each month",
  },
  {
    id: "nps",
    label: "Net Promoter Score",
    category: "customer",
    unit: "",
    format: "number",
    higherIsBetter: true,
    description: "Customer loyalty score ranging from -100 to 100",
  },
  {
    id: "cac",
    label: "Customer Acquisition Cost",
    category: "customer",
    unit: "$",
    format: "currency",
    higherIsBetter: false,
    description: "Average cost to acquire a new customer",
  },
  {
    id: "ltv",
    label: "Customer Lifetime Value",
    category: "customer",
    unit: "$",
    format: "currency",
    higherIsBetter: true,
    description: "Total revenue expected from a customer over their lifetime",
  },
  {
    id: "ltv_cac_ratio",
    label: "LTV:CAC Ratio",
    category: "customer",
    unit: "x",
    format: "ratio",
    higherIsBetter: true,
    description: "Lifetime value divided by acquisition cost",
  },
  {
    id: "trial_to_paid",
    label: "Trial to Paid Conversion",
    category: "customer",
    unit: "%",
    format: "percent",
    higherIsBetter: true,
    description: "Percentage of trial users who convert to paid",
  },

  // Engagement Metrics
  {
    id: "dau_mau",
    label: "DAU/MAU Ratio",
    category: "engagement",
    unit: "%",
    format: "percent",
    higherIsBetter: true,
    description: "Daily active users as percentage of monthly active users",
  },
  {
    id: "session_duration",
    label: "Avg Session Duration",
    category: "engagement",
    unit: "mins",
    format: "duration",
    higherIsBetter: true,
    description: "Average time users spend per session",
  },
  {
    id: "feature_adoption",
    label: "Feature Adoption Rate",
    category: "engagement",
    unit: "%",
    format: "percent",
    higherIsBetter: true,
    description: "Percentage of users who adopt key features",
  },
  {
    id: "activation_rate",
    label: "Activation Rate",
    category: "engagement",
    unit: "%",
    format: "percent",
    higherIsBetter: true,
    description: "Percentage of signups who reach activation milestone",
  },

  // Support Metrics
  {
    id: "csat",
    label: "Customer Satisfaction Score",
    category: "support",
    unit: "%",
    format: "percent",
    higherIsBetter: true,
    description: "Percentage of customers satisfied with support",
  },
  {
    id: "first_response_time",
    label: "First Response Time",
    category: "support",
    unit: "mins",
    format: "duration",
    higherIsBetter: false,
    description: "Average time to first support response",
  },
  {
    id: "resolution_time",
    label: "Resolution Time",
    category: "support",
    unit: "hrs",
    format: "duration",
    higherIsBetter: false,
    description: "Average time to fully resolve support tickets",
  },
  {
    id: "ticket_volume",
    label: "Tickets per 100 Users",
    category: "support",
    unit: "",
    format: "number",
    higherIsBetter: false,
    description: "Support ticket volume per 100 active users",
  },
];

// =============================================================================
// INDUSTRY BENCHMARK DATA
// =============================================================================

/**
 * Industry benchmark percentiles for all metrics.
 * Data represents B2B SaaS companies across all stages.
 */
export const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  // Revenue Metrics
  {
    metricId: "arr_growth",
    percentiles: { p25: 15, median: 35, p75: 75, p90: 120 },
    dataYear: 2025,
    source: "OpenView SaaS Benchmarks",
  },
  {
    metricId: "mrr",
    percentiles: { p25: 25000, median: 85000, p75: 250000, p90: 750000 },
    dataYear: 2025,
    source: "ChartMogul Benchmark Report",
  },
  {
    metricId: "arpu",
    percentiles: { p25: 29, median: 65, p75: 150, p90: 350 },
    dataYear: 2025,
    source: "ProfitWell Benchmark Data",
  },
  {
    metricId: "gross_margin",
    percentiles: { p25: 62, median: 72, p75: 80, p90: 85 },
    dataYear: 2025,
    source: "KeyBanc SaaS Survey",
  },

  // Customer Metrics
  {
    metricId: "churn_rate",
    percentiles: { p25: 8.5, median: 5.2, p75: 2.8, p90: 1.5 },
    dataYear: 2025,
    source: "ChartMogul Benchmark Report",
  },
  {
    metricId: "nps",
    percentiles: { p25: 15, median: 35, p75: 55, p90: 72 },
    dataYear: 2025,
    source: "Delighted NPS Benchmarks",
  },
  {
    metricId: "cac",
    percentiles: { p25: 850, median: 520, p75: 280, p90: 150 },
    dataYear: 2025,
    source: "ProfitWell Benchmark Data",
  },
  {
    metricId: "ltv",
    percentiles: { p25: 1200, median: 2800, p75: 6500, p90: 15000 },
    dataYear: 2025,
    source: "ChartMogul Benchmark Report",
  },
  {
    metricId: "ltv_cac_ratio",
    percentiles: { p25: 1.8, median: 3.2, p75: 5.5, p90: 8.0 },
    dataYear: 2025,
    source: "OpenView SaaS Benchmarks",
  },
  {
    metricId: "trial_to_paid",
    percentiles: { p25: 8, median: 15, p75: 25, p90: 40 },
    dataYear: 2025,
    source: "ProfitWell Benchmark Data",
  },

  // Engagement Metrics
  {
    metricId: "dau_mau",
    percentiles: { p25: 10, median: 20, p75: 35, p90: 50 },
    dataYear: 2025,
    source: "Mixpanel Product Benchmarks",
  },
  {
    metricId: "session_duration",
    percentiles: { p25: 3.5, median: 7, p75: 12, p90: 20 },
    dataYear: 2025,
    source: "Amplitude Benchmark Report",
  },
  {
    metricId: "feature_adoption",
    percentiles: { p25: 25, median: 45, p75: 65, p90: 80 },
    dataYear: 2025,
    source: "Pendo Product Benchmarks",
  },
  {
    metricId: "activation_rate",
    percentiles: { p25: 20, median: 40, p75: 60, p90: 75 },
    dataYear: 2025,
    source: "Amplitude Benchmark Report",
  },

  // Support Metrics
  {
    metricId: "csat",
    percentiles: { p25: 72, median: 85, p75: 92, p90: 96 },
    dataYear: 2025,
    source: "Zendesk Benchmark Report",
  },
  {
    metricId: "first_response_time",
    percentiles: { p25: 480, median: 120, p75: 30, p90: 10 },
    dataYear: 2025,
    source: "Intercom Customer Support Benchmarks",
  },
  {
    metricId: "resolution_time",
    percentiles: { p25: 48, median: 24, p75: 8, p90: 4 },
    dataYear: 2025,
    source: "Zendesk Benchmark Report",
  },
  {
    metricId: "ticket_volume",
    percentiles: { p25: 25, median: 15, p75: 8, p90: 4 },
    dataYear: 2025,
    source: "Intercom Customer Support Benchmarks",
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a benchmark metric by ID.
 */
export function getBenchmarkMetric(metricId: BenchmarkMetricId): BenchmarkMetric | undefined {
  return BENCHMARK_METRICS.find((m) => m.id === metricId);
}

/**
 * Get industry benchmark data for a specific metric.
 */
export function getIndustryBenchmark(metricId: BenchmarkMetricId): IndustryBenchmark | undefined {
  return INDUSTRY_BENCHMARKS.find((b) => b.metricId === metricId);
}

/**
 * Calculate the percentile rank for a user value against industry benchmarks.
 * Uses linear interpolation between known percentile points.
 */
export function calculatePercentileRank(
  userValue: number,
  percentiles: BenchmarkPercentiles,
  higherIsBetter: boolean
): number {
  const { p25, median, p75, p90 } = percentiles;

  // Helper to safely calculate interpolation (guards against division by zero)
  const interpolate = (position: number, range: number, basePercentile: number, rangePercentile: number): number => {
    if (range === 0) return basePercentile + rangePercentile / 2; // Return midpoint if range is 0
    return basePercentile + (position / range) * rangePercentile;
  };

  // For metrics where lower is better (churn, CAC, etc.), we invert the logic
  // by treating the percentile values as thresholds in reverse order
  if (!higherIsBetter) {
    // Lower values are better, so lower value = higher percentile
    if (userValue <= p90) return 95; // Top 10%
    if (userValue <= p75) {
      // Between p75 and p90
      return interpolate(p75 - userValue, p75 - p90, 75, 15);
    }
    if (userValue <= median) {
      // Between median and p75
      return interpolate(median - userValue, median - p75, 50, 25);
    }
    if (userValue <= p25) {
      // Between p25 and median
      return interpolate(p25 - userValue, p25 - median, 25, 25);
    }
    // Below p25 (worse than 75% of companies)
    const estimatedP10 = p25 * 1.5; // Estimate p10 as 1.5x p25
    if (userValue >= estimatedP10) return 5;
    const range = estimatedP10 - p25;
    const position = userValue - p25;
    return Math.max(0, range === 0 ? 15 : 25 - (position / range) * 20);
  }

  // For metrics where higher is better
  if (userValue >= p90) return 95; // Top 10%
  if (userValue >= p75) {
    // Between p75 and p90
    return interpolate(userValue - p75, p90 - p75, 75, 15);
  }
  if (userValue >= median) {
    // Between median and p75
    return interpolate(userValue - median, p75 - median, 50, 25);
  }
  if (userValue >= p25) {
    // Between p25 and median
    return interpolate(userValue - p25, median - p25, 25, 25);
  }
  // Below p25 (worse than 75% of companies)
  const estimatedP10 = p25 * 0.5; // Estimate p10 as half of p25
  if (userValue <= estimatedP10) return 5;
  const range = p25 - estimatedP10;
  const position = userValue - estimatedP10;
  return Math.max(0, range === 0 ? 15 : 5 + (position / range) * 20);
}

/**
 * Determine performance tier based on percentile rank.
 */
export function getPerformanceTier(percentileRank: number): PerformanceTier {
  if (percentileRank >= 90) return "top_decile";
  if (percentileRank >= 75) return "top_quartile";
  if (percentileRank >= 50) return "above_average";
  if (percentileRank >= 25) return "average";
  return "below_average";
}

/**
 * Calculate the value needed to reach the next performance tier.
 */
export function calculateValueToNextTier(
  userValue: number,
  percentiles: BenchmarkPercentiles,
  currentTier: PerformanceTier,
  higherIsBetter: boolean
): { value: number | null; nextTier: PerformanceTier | null } {
  if (currentTier === "top_decile") {
    return { value: null, nextTier: null };
  }

  const { p25, median, p75, p90 } = percentiles;
  const tierThresholds: Record<PerformanceTier, number> = {
    below_average: p25,
    average: median,
    above_average: p75,
    top_quartile: p90,
    top_decile: p90,
  };

  const tierOrder: PerformanceTier[] = [
    "below_average",
    "average",
    "above_average",
    "top_quartile",
    "top_decile",
  ];

  const currentIndex = tierOrder.indexOf(currentTier);
  const nextTier = tierOrder[currentIndex + 1];

  // If no next tier exists, return null
  if (!nextTier) {
    return { value: null, nextTier: null };
  }

  const targetValue = tierThresholds[nextTier];

  if (higherIsBetter) {
    const improvement = targetValue - userValue;
    return { value: Math.max(0, improvement), nextTier };
  } else {
    const improvement = userValue - targetValue;
    return { value: Math.max(0, improvement), nextTier };
  }
}

/**
 * Compare a user's metric against industry benchmarks.
 */
export function compareToBenchmark(
  metricId: BenchmarkMetricId,
  userValue: number
): BenchmarkComparison | null {
  const metric = getBenchmarkMetric(metricId);
  const benchmark = getIndustryBenchmark(metricId);

  if (!metric || !benchmark) {
    return null;
  }

  const percentileRank = calculatePercentileRank(
    userValue,
    benchmark.percentiles,
    metric.higherIsBetter
  );

  const tier = getPerformanceTier(percentileRank);

  const diffFromMedian = userValue - benchmark.percentiles.median;
  const diffFromMedianPercent =
    benchmark.percentiles.median !== 0
      ? (diffFromMedian / benchmark.percentiles.median) * 100
      : 0;

  const { value: valueToNextTier, nextTier } = calculateValueToNextTier(
    userValue,
    benchmark.percentiles,
    tier,
    metric.higherIsBetter
  );

  return {
    metric,
    userValue,
    benchmark,
    percentileRank: Math.round(percentileRank),
    tier,
    diffFromMedian,
    diffFromMedianPercent: Math.round(diffFromMedianPercent * 10) / 10,
    valueToNextTier,
    nextTier,
  };
}

/**
 * Compare multiple user metrics against industry benchmarks.
 */
export function compareAllMetrics(userMetrics: UserMetrics): BenchmarkComparison[] {
  const comparisons: BenchmarkComparison[] = [];

  for (const [metricId, value] of Object.entries(userMetrics)) {
    if (value !== undefined) {
      const comparison = compareToBenchmark(metricId as BenchmarkMetricId, value);
      if (comparison) {
        comparisons.push(comparison);
      }
    }
  }

  return comparisons;
}

/**
 * Get all available benchmark metrics.
 */
export function getAvailableMetrics(): BenchmarkMetric[] {
  return [...BENCHMARK_METRICS];
}

/**
 * Get metrics by category.
 */
export function getMetricsByCategory(
  category: "revenue" | "customer" | "engagement" | "support"
): BenchmarkMetric[] {
  return BENCHMARK_METRICS.filter((m) => m.category === category);
}
