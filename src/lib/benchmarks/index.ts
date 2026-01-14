/**
 * Benchmarks Module
 *
 * Barrel export for all benchmark comparison functionality.
 *
 * This module provides:
 * 1. Industry benchmark data for SaaS metrics
 * 2. Comparison functions for evaluating user metrics
 * 3. Performance tier calculations
 *
 * @example
 * import { compareToBenchmark, compareAllMetrics, getAvailableMetrics } from '@/lib/benchmarks';
 *
 * // Compare a single metric
 * const comparison = compareToBenchmark('churn_rate', 3.5);
 *
 * // Compare multiple metrics
 * const userMetrics = { churn_rate: 3.5, ltv_cac_ratio: 4.2, nps: 45 };
 * const comparisons = compareAllMetrics(userMetrics);
 *
 * // Get available metrics for benchmarking
 * const metrics = getAvailableMetrics();
 */

// Industry Data & Comparison Functions
export {
  // Metric definitions
  BENCHMARK_METRICS,
  INDUSTRY_BENCHMARKS,
  // Lookup functions
  getBenchmarkMetric,
  getIndustryBenchmark,
  getAvailableMetrics,
  getMetricsByCategory,
  // Calculation functions
  calculatePercentileRank,
  getPerformanceTier,
  calculateValueToNextTier,
  // Comparison functions
  compareToBenchmark,
  compareAllMetrics,
} from "./industry-data";

// Re-export types for convenience
export type {
  BenchmarkCategory,
  BenchmarkMetricId,
  BenchmarkMetric,
  BenchmarkPercentiles,
  IndustryBenchmark,
  PerformanceTier,
  PerformanceTierConfig,
  BenchmarkComparison,
  UserMetrics,
  BenchmarkRequest,
  BenchmarkResponse,
  BenchmarksData,
} from "@/types/benchmarks";

export { PERFORMANCE_TIERS, BENCHMARK_CATEGORY_LABELS } from "@/types/benchmarks";
