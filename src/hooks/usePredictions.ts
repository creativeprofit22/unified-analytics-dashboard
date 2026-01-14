import useSWR from 'swr';
import type { PredictionsData } from '@/types';

/**
 * Return type for the usePredictions hook.
 */
export interface UsePredictionsReturn {
  /** The fetched predictions data */
  data: PredictionsData | undefined;
  /** Error object if the request failed */
  error: Error | undefined;
  /** True during initial load */
  isLoading: boolean;
  /** Manually trigger a refresh */
  refresh: () => Promise<PredictionsData | undefined>;
}

/**
 * Fetcher for predictions API
 */
async function predictionsFetcher(url: string): Promise<PredictionsData> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch predictions');
  }
  const json = await res.json();
  return json.data;
}

/**
 * Hook for fetching predictive analytics data with SWR caching.
 * Predictions are expensive to compute, so use longer refresh intervals.
 */
export function usePredictions(): UsePredictionsReturn {
  const { data, error, isLoading, mutate } = useSWR<PredictionsData>(
    '/api/predictions',
    predictionsFetcher,
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
