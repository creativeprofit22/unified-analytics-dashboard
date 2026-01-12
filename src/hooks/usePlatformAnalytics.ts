import { useMemo } from 'react';
import useSWR from 'swr';
import { platformFetcher } from '@/lib/fetchers';
import type { Platform, TimeRange, PlatformAnalyticsData, AnalyticsQueryParams } from '@/types';

/**
 * Parameters for the usePlatformAnalytics hook.
 */
export interface UsePlatformAnalyticsParams {
  /** The platform to fetch analytics for. Must be a specific platform, not 'all'. */
  platform: Exclude<Platform, 'all'>;
  /** Time range for the analytics data. */
  timeRange?: TimeRange;
  /** Whether to enable fetching. When false, no request is made. Defaults to true. */
  enabled?: boolean;
}

/**
 * Return value from the usePlatformAnalytics hook.
 */
export interface UsePlatformAnalyticsReturn {
  /** The fetched analytics data, or undefined if not yet loaded or disabled. */
  data: PlatformAnalyticsData | undefined;
  /** Error object if the request failed. */
  error: Error | undefined;
  /** True during the initial load when no data is available yet. */
  isLoading: boolean;
  /** True when a request is in progress (including background revalidation). */
  isValidating: boolean;
  /** True if an error occurred during fetching. */
  isError: boolean;
  /** Function to manually trigger a revalidation of the data. */
  refresh: () => Promise<PlatformAnalyticsData | undefined>;
}

/**
 * SWR key type for platform analytics requests.
 */
type PlatformAnalyticsKey = ['analytics', Exclude<Platform, 'all'>, AnalyticsQueryParams?] | null;

/**
 * Hook for fetching platform-specific analytics data.
 *
 * Uses SWR for caching, automatic revalidation, and request deduplication.
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { data, isLoading, error } = usePlatformAnalytics({
 *   platform: 'youtube',
 * });
 *
 * // With time range
 * const { data, refresh } = usePlatformAnalytics({
 *   platform: 'tiktok',
 *   timeRange: '30d',
 * });
 *
 * // Conditionally disabled
 * const { data } = usePlatformAnalytics({
 *   platform: 'instagram',
 *   enabled: isConnected,
 * });
 * ```
 *
 * @param params - Configuration object for the hook
 * @param params.platform - The platform to fetch analytics for (cannot be 'all')
 * @param params.timeRange - Optional time range filter
 * @param params.enabled - Set to false to disable fetching (defaults to true)
 * @returns Object containing data, loading states, error, and refresh function
 */
export function usePlatformAnalytics({
  platform,
  timeRange,
  enabled = true,
}: UsePlatformAnalyticsParams): UsePlatformAnalyticsReturn {
  // Memoize query params to prevent new object reference on every render
  // This ensures SWR key stability and proper cache deduplication
  const queryParams = useMemo<AnalyticsQueryParams | undefined>(
    () => (timeRange ? { timeRange } : undefined),
    [timeRange]
  );

  // SWR key is null when disabled to prevent fetching
  const swrKey: PlatformAnalyticsKey = enabled
    ? ['analytics', platform, queryParams]
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    PlatformAnalyticsData | undefined,
    Error
  >(swrKey, platformFetcher);

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
