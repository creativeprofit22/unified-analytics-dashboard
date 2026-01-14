import useSWR from 'swr';
import type { ABTestData } from '@/types/abtest';

/**
 * Return type for the useABTest hook.
 */
export interface UseABTestReturn {
  /** The fetched A/B test data */
  data: ABTestData | undefined;
  /** Error object if the request failed */
  error: Error | undefined;
  /** True during initial load */
  isLoading: boolean;
  /** Manually trigger a refresh */
  refresh: () => Promise<ABTestData | undefined>;
}

/**
 * Fetcher for A/B test API
 */
async function abtestFetcher(url: string): Promise<ABTestData> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch A/B test data');
  }
  const json = await res.json();
  // Validate response structure
  if (!json.success) {
    throw new Error(json.error || 'A/B test request failed');
  }
  return json.data;
}

/**
 * Hook for fetching A/B test analytics data with SWR caching.
 * A/B test data doesn't change frequently, so use standard refresh intervals.
 */
export function useABTest(): UseABTestReturn {
  const { data, error, isLoading, mutate } = useSWR<ABTestData>(
    '/api/abtest',
    abtestFetcher,
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
