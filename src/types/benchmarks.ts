/**
 * Benchmark Types
 *
 * Type definitions for comparing user metrics against SaaS industry benchmarks.
 * Includes categories for revenue, customer, engagement, and support metrics.
 */

// =============================================================================
// BENCHMARK CATEGORIES
// =============================================================================

/**
 * Categories of metrics for benchmarking.
 */
export type BenchmarkCategory =
  | "revenue"
  | "customer"
  | "engagement"
  | "support";

/**
 * Human-readable labels for benchmark categories.
 */
export const BENCHMARK_CATEGORY_LABELS: Record<BenchmarkCategory, string> = {
  revenue: "Revenue Metrics",
  customer: "Customer Metrics",
  engagement: "Engagement Metrics",
  support: "Support Metrics",
};

// =============================================================================
// BENCHMARK METRICS
// =============================================================================

/**
 * Specific metrics that can be benchmarked.
 */
export type BenchmarkMetricId =
  // Revenue metrics
  | "arr_growth"
  | "mrr"
  | "arpu"
  | "gross_margin"
  // Customer metrics
  | "churn_rate"
  | "nps"
  | "cac"
  | "ltv"
  | "ltv_cac_ratio"
  | "trial_to_paid"
  // Engagement metrics
  | "dau_mau"
  | "session_duration"
  | "feature_adoption"
  | "activation_rate"
  // Support metrics
  | "csat"
  | "first_response_time"
  | "resolution_time"
  | "ticket_volume";

/**
 * Configuration for a benchmarkable metric.
 */
export interface BenchmarkMetric {
  /** Unique metric identifier */
  id: BenchmarkMetricId;
  /** Human-readable label */
  label: string;
  /** Category this metric belongs to */
  category: BenchmarkCategory;
  /** Unit of measurement (e.g., "%", "$", "mins", "x") */
  unit: string;
  /** Format type for display */
  format: "percent" | "currency" | "number" | "duration" | "ratio";
  /** Whether higher values are better (true) or lower values are better (false) */
  higherIsBetter: boolean;
  /** Short description of what this metric measures */
  description: string;
}

// =============================================================================
// INDUSTRY BENCHMARKS
// =============================================================================

/**
 * Percentile values for industry benchmarks.
 */
export interface BenchmarkPercentiles {
  /** Bottom 25% of companies (25th percentile) */
  p25: number;
  /** Median value (50th percentile) */
  median: number;
  /** Top 25% of companies (75th percentile) */
  p75: number;
  /** Top 10% of companies (90th percentile) */
  p90: number;
}

/**
 * Industry benchmark data for a specific metric.
 */
export interface IndustryBenchmark {
  /** The metric being benchmarked */
  metricId: BenchmarkMetricId;
  /** Percentile values from industry data */
  percentiles: BenchmarkPercentiles;
  /** Year/version of the benchmark data */
  dataYear: number;
  /** Source of the benchmark data */
  source: string;
  /** Company size segment (e.g., "SMB", "Mid-Market", "Enterprise") */
  segment?: string;
  /** Industry vertical if specific */
  vertical?: string;
}

// =============================================================================
// PERFORMANCE TIERS
// =============================================================================

/**
 * Performance tier based on percentile ranking.
 */
export type PerformanceTier =
  | "below_average" // Below 25th percentile
  | "average" // 25th to 50th percentile
  | "above_average" // 50th to 75th percentile
  | "top_quartile" // 75th to 90th percentile
  | "top_decile"; // Above 90th percentile

/**
 * Configuration for each performance tier.
 */
export interface PerformanceTierConfig {
  /** Tier identifier */
  tier: PerformanceTier;
  /** Human-readable label */
  label: string;
  /** Color for visual representation */
  color: string;
  /** Emoji for quick visual indicator */
  icon: string;
  /** Minimum percentile for this tier */
  minPercentile: number;
  /** Maximum percentile for this tier */
  maxPercentile: number;
}

/**
 * Performance tier configurations with colors and labels.
 */
export const PERFORMANCE_TIERS: PerformanceTierConfig[] = [
  {
    tier: "below_average",
    label: "Below Average",
    color: "#ef4444",
    icon: "down",
    minPercentile: 0,
    maxPercentile: 25,
  },
  {
    tier: "average",
    label: "Average",
    color: "#f97316",
    icon: "minus",
    minPercentile: 25,
    maxPercentile: 50,
  },
  {
    tier: "above_average",
    label: "Above Average",
    color: "#eab308",
    icon: "up",
    minPercentile: 50,
    maxPercentile: 75,
  },
  {
    tier: "top_quartile",
    label: "Top Quartile",
    color: "#22c55e",
    icon: "trophy",
    minPercentile: 75,
    maxPercentile: 90,
  },
  {
    tier: "top_decile",
    label: "Top 10%",
    color: "#10b981",
    icon: "star",
    minPercentile: 90,
    maxPercentile: 100,
  },
];

// =============================================================================
// BENCHMARK COMPARISON
// =============================================================================

/**
 * Result of comparing a user's metric against industry benchmarks.
 */
export interface BenchmarkComparison {
  /** The metric being compared */
  metric: BenchmarkMetric;
  /** User's current value for this metric */
  userValue: number;
  /** Industry benchmark data */
  benchmark: IndustryBenchmark;
  /** Calculated percentile rank (0-100) */
  percentileRank: number;
  /** Performance tier based on percentile */
  tier: PerformanceTier;
  /** Difference from median (userValue - median) */
  diffFromMedian: number;
  /** Percentage difference from median */
  diffFromMedianPercent: number;
  /** Value needed to reach next tier (null if top tier) */
  valueToNextTier: number | null;
  /** The next tier to reach */
  nextTier: PerformanceTier | null;
}

/**
 * User metrics for benchmark comparison.
 * Maps metric IDs to their current values.
 */
export type UserMetrics = Partial<Record<BenchmarkMetricId, number>>;

// =============================================================================
// API TYPES
// =============================================================================

/**
 * Request payload for benchmark comparison API.
 */
export interface BenchmarkRequest {
  /** User's metrics to compare */
  userMetrics: UserMetrics;
  /** Optional category filter */
  category?: BenchmarkCategory;
  /** Optional company segment */
  segment?: string;
}

/**
 * Response payload from benchmark comparison API.
 */
export interface BenchmarkResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Array of benchmark comparisons */
  comparisons: BenchmarkComparison[];
  /** Available benchmark metrics */
  availableMetrics: BenchmarkMetric[];
  /** ISO 8601 timestamp of the response */
  timestamp: string;
}

/**
 * Combined benchmark data for the panel.
 */
export interface BenchmarksData {
  /** All benchmark comparisons */
  comparisons: BenchmarkComparison[];
  /** Available metrics for benchmarking */
  availableMetrics: BenchmarkMetric[];
  /** ISO 8601 timestamp when data was last updated */
  lastUpdated: string;
}

// =============================================================================
// HELPER TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a valid BenchmarkCategory.
 */
export function isBenchmarkCategory(value: string): value is BenchmarkCategory {
  return ["revenue", "customer", "engagement", "support"].includes(value);
}

/**
 * Type guard to check if a value is a valid BenchmarkMetricId.
 */
export function isBenchmarkMetricId(value: string): value is BenchmarkMetricId {
  const validIds: BenchmarkMetricId[] = [
    "arr_growth", "mrr", "arpu", "gross_margin",
    "churn_rate", "nps", "cac", "ltv", "ltv_cac_ratio", "trial_to_paid",
    "dau_mau", "session_duration", "feature_adoption", "activation_rate",
    "csat", "first_response_time", "resolution_time", "ticket_volume",
  ];
  return validIds.includes(value as BenchmarkMetricId);
}
