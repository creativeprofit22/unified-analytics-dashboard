import { useMemo } from 'react';
import useSWR from 'swr';
import { analyticsFetcher } from '@/lib/fetchers';
import type { Platform, TimeRange, AnalyticsQueryParams } from '@/types';
import type { UnifiedAnalyticsData } from '@/types/analytics';

/**
 * Parameters for the useAnalytics hook.
 */
export interface UseAnalyticsParams {
  /** Filter by specific platform, or 'all' for aggregated metrics */
  platform?: Platform;
  /** Time range for the analytics query */
  timeRange?: TimeRange;
  /** Whether to fetch data. When false, the hook will not make any requests. */
  enabled?: boolean;
}

/**
 * Return type for the useAnalytics hook.
 */
export interface UseAnalyticsReturn {
  /** The fetched analytics data, undefined while loading or on error */
  data: UnifiedAnalyticsData | undefined;
  /** Error object if the request failed */
  error: Error | undefined;
  /** True during initial load when there is no data yet */
  isLoading: boolean;
  /** True when a request is in flight (including background revalidation) */
  isValidating: boolean;
  /** True if an error occurred */
  isError: boolean;
  /** Manually trigger a revalidation/refresh of the data */
  refresh: () => Promise<UnifiedAnalyticsData | undefined>;
}

/**
 * Hook for fetching analytics data with SWR caching and revalidation.
 *
 * @param params - Configuration options for the analytics query
 * @returns Object containing data, loading states, error state, and refresh function
 *
 * @example
 * ```tsx
 * // Basic usage - fetch all analytics
 * const { data, isLoading, error } = useAnalytics();
 *
 * // Filter by platform and time range
 * const { data, isLoading } = useAnalytics({
 *   platform: 'youtube',
 *   timeRange: '30d',
 * });
 *
 * // Conditionally fetch based on user selection
 * const { data, refresh } = useAnalytics({
 *   platform: selectedPlatform,
 *   enabled: !!selectedPlatform,
 * });
 * ```
 */
export function useAnalytics(params: UseAnalyticsParams = {}): UseAnalyticsReturn {
  const { platform, timeRange, enabled = true } = params;

  // Memoize query params to prevent new object reference on every render
  // This ensures SWR key stability and proper cache deduplication
  const queryParams = useMemo<AnalyticsQueryParams | undefined>(
    () => (platform || timeRange ? { platform, timeRange } : undefined),
    [platform, timeRange]
  );

  // SWR key is null when disabled (prevents fetching)
  const swrKey = enabled ? (['analytics', queryParams] as const) : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    UnifiedAnalyticsData | undefined,
    Error
  >(swrKey, analyticsFetcher);

  // Memoize return object to prevent unnecessary re-renders in consuming components
  return useMemo(
    () => ({
      data,
      error,
      isLoading,
      isValidating,
      isError: !!error,
      refresh: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

export default useAnalytics;
