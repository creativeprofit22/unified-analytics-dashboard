import useSWR from 'swr';
import type { AttributionData } from '@/types/attribution';

/**
 * Return type for the useAttribution hook.
 */
export interface UseAttributionReturn {
  /** The fetched attribution data */
  data: AttributionData | undefined;
  /** Error object if the request failed */
  error: Error | undefined;
  /** True during initial load */
  isLoading: boolean;
  /** Manually trigger a refresh */
  refresh: () => Promise<AttributionData | undefined>;
}

/**
 * Fetcher for attribution API
 */
async function attributionFetcher(url: string): Promise<AttributionData> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch attribution data');
  }
  const json = await res.json();
  // Validate response structure
  if (!json.success) {
    throw new Error(json.error || 'Attribution request failed');
  }
  return json.data;
}

/**
 * Hook for fetching attribution analytics data with SWR caching.
 * Attribution analysis is expensive to compute, so use longer refresh intervals.
 */
export function useAttribution(): UseAttributionReturn {
  const { data, error, isLoading, mutate } = useSWR<AttributionData>(
    '/api/attribution',
    attributionFetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false, // Don't refetch on window focus
    }
  );

  return {
    data,
    error,
    isLoading,
    refresh: () => mutate(),
  };
}
