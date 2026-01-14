/**
 * Benchmarks Components
 *
 * Components for displaying benchmark comparisons against industry standards.
 *
 * @example
 * import { BenchmarkComparison, BenchmarkPanel } from '@/components/benchmarks';
 *
 * // Single metric comparison
 * <BenchmarkComparison comparison={churnComparison} />
 *
 * // Full panel with all comparisons
 * <BenchmarkPanel comparisons={allComparisons} />
 */

export { BenchmarkComparison } from "./BenchmarkComparison";
export type { BenchmarkComparisonProps } from "./BenchmarkComparison";

export { BenchmarkPanel } from "./BenchmarkPanel";
export type { BenchmarkPanelProps } from "./BenchmarkPanel";
