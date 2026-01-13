import { useMemo } from 'react';
import useSWR from 'swr';
import { analyticsFetcher } from '@/lib/fetchers';
import type { Platform, TimeRange, AnalyticsQueryParams, FilterState, ComparisonConfig } from '@/types';
import type { UnifiedAnalyticsData, TrafficSource, CampaignChannel } from '@/types/analytics';

/**
 * Parameters for the useAnalytics hook.
 */
export interface UseAnalyticsParams {
  /** Filter by specific platform, or 'all' for aggregated metrics */
  platform?: Platform;
  /** Time range for the analytics query */
  timeRange?: TimeRange;
  /** Active filters for the data */
  filters?: FilterState;
  /** Comparison configuration for period-over-period analysis */
  comparison?: ComparisonConfig;
  /** Whether to fetch data. When false, the hook will not make any requests. */
  enabled?: boolean;
}

/**
 * Return type for the useAnalytics hook.
 */
export interface UseAnalyticsReturn {
  /** The fetched analytics data, undefined while loading or on error */
  data: UnifiedAnalyticsData | undefined;
  /** Comparison period analytics data, undefined if comparison disabled or loading */
  comparisonData: UnifiedAnalyticsData | undefined;
  /** Active comparison configuration */
  comparison: ComparisonConfig | undefined;
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
/**
 * Calculate comparison time range based on current range and comparison period.
 */
function getComparisonTimeRange(
  timeRange: TimeRange | undefined,
  comparison: ComparisonConfig | undefined
): TimeRange | undefined {
  if (!comparison?.enabled || !timeRange) return undefined;

  // For comparison, we use the same time range duration
  // The API will calculate the previous period based on the timeRange
  // For year_ago comparison, we'd need custom date handling
  // For now, we return the same timeRange - the mock data generator handles this
  return timeRange;
}

/**
 * Apply filters to analytics data client-side.
 */
function applyFilters(
  data: UnifiedAnalyticsData | undefined,
  filters: FilterState | undefined
): UnifiedAnalyticsData | undefined {
  if (!data || !filters) return data;

  const { sources, channels, campaigns } = filters;
  const hasSourceFilter = sources.length > 0;
  const hasChannelFilter = channels.length > 0;
  const hasCampaignFilter = campaigns.length > 0;

  // No filters active, return original data
  if (!hasSourceFilter && !hasChannelFilter && !hasCampaignFilter) {
    return data;
  }

  const filtered: UnifiedAnalyticsData = { ...data };

  // Filter traffic by source
  if (hasSourceFilter && data.traffic) {
    const filteredTrafficBySource: Partial<Record<TrafficSource, number>> = {};
    for (const source of sources) {
      if (data.traffic.trafficBySource[source] !== undefined) {
        filteredTrafficBySource[source] = data.traffic.trafficBySource[source];
      }
    }
    filtered.traffic = {
      ...data.traffic,
      trafficBySource: filteredTrafficBySource,
    };
  }

  // Filter campaigns by channel and name
  if ((hasChannelFilter || hasCampaignFilter) && data.campaigns) {
    let filteredCampaigns = data.campaigns.byCampaign;

    if (hasChannelFilter) {
      filteredCampaigns = filteredCampaigns.filter((c) =>
        channels.includes(c.channel as CampaignChannel)
      );
    }

    if (hasCampaignFilter) {
      filteredCampaigns = filteredCampaigns.filter((c) =>
        campaigns.includes(c.name)
      );
    }

    // Filter byChannel record
    const filteredByChannel = hasChannelFilter
      ? (Object.fromEntries(
          Object.entries(data.campaigns.byChannel).filter(([channel]) =>
            channels.includes(channel as CampaignChannel)
          )
        ) as Record<CampaignChannel, typeof data.campaigns.byChannel.email>)
      : data.campaigns.byChannel;

    filtered.campaigns = {
      ...data.campaigns,
      byCampaign: filteredCampaigns,
      byChannel: filteredByChannel,
    };
  }

  // Filter segmentation by campaign
  if (hasCampaignFilter && data.segmentation) {
    filtered.segmentation = {
      ...data.segmentation,
      byCampaign: data.segmentation.byCampaign.filter((c) =>
        campaigns.includes(c.campaign)
      ),
    };
  }

  return filtered;
}

export function useAnalytics(params: UseAnalyticsParams = {}): UseAnalyticsReturn {
  const { platform, timeRange, filters, comparison, enabled = true } = params;

  // Memoize query params to prevent new object reference on every render
  // This ensures SWR key stability and proper cache deduplication
  const queryParams = useMemo<AnalyticsQueryParams | undefined>(
    () => (platform || timeRange ? { platform, timeRange } : undefined),
    [platform, timeRange]
  );

  // Calculate comparison time range
  const comparisonTimeRange = useMemo(
    () => getComparisonTimeRange(timeRange, comparison),
    [timeRange, comparison]
  );

  // Comparison query params (uses previous period or year ago logic)
  // Sets comparison: true to get different mock data for comparison
  const comparisonQueryParams = useMemo<AnalyticsQueryParams | undefined>(
    () => comparisonTimeRange ? { platform, timeRange: comparisonTimeRange, comparison: true } : undefined,
    [platform, comparisonTimeRange]
  );

  // SWR key is null when disabled (prevents fetching)
  const swrKey = enabled ? (['analytics', queryParams] as const) : null;

  // Comparison SWR key - only active when comparison is enabled
  // Using a unique key suffix to differentiate from main data
  const comparisonSwrKey = enabled && comparison?.enabled
    ? (['analytics-comparison', comparisonQueryParams, comparison.period] as const)
    : null;

  const { data: rawData, error, isLoading, isValidating, mutate } = useSWR<
    UnifiedAnalyticsData | undefined,
    Error
  >(swrKey, analyticsFetcher);

  // Fetch comparison data when enabled
  const {
    data: rawComparisonData,
    isLoading: isComparisonLoading,
    isValidating: isComparisonValidating,
  } = useSWR<UnifiedAnalyticsData | undefined, Error>(
    comparisonSwrKey,
    // Use the same fetcher - it ignores the suffix in the key
    ([, params]) => analyticsFetcher(['analytics', params as AnalyticsQueryParams | undefined])
  );

  // Apply client-side filters to the data
  const data = useMemo(
    () => applyFilters(rawData, filters),
    [rawData, filters]
  );

  // Apply filters to comparison data
  const comparisonData = useMemo(
    () => applyFilters(rawComparisonData, filters),
    [rawComparisonData, filters]
  );

  // Combined loading/validating states
  const combinedIsLoading = isLoading || (comparison?.enabled ? isComparisonLoading : false);
  const combinedIsValidating = isValidating || (comparison?.enabled ? isComparisonValidating : false);

  // Memoize return object to prevent unnecessary re-renders in consuming components
  return useMemo(
    () => ({
      data,
      comparisonData: comparison?.enabled ? comparisonData : undefined,
      comparison,
      error,
      isLoading: combinedIsLoading,
      isValidating: combinedIsValidating,
      isError: !!error,
      refresh: mutate,
    }),
    [data, comparisonData, comparison, error, combinedIsLoading, combinedIsValidating, mutate]
  );
}

export default useAnalytics;
