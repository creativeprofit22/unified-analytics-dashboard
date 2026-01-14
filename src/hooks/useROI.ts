import useSWR from 'swr';
import type { ROIData } from '@/types/roi';

/**
 * Return type for the useROI hook.
 */
export interface UseROIReturn {
  /** The fetched ROI data */
  data: ROIData | undefined;
  /** Error object if the request failed */
  error: Error | undefined;
  /** True during initial load */
  isLoading: boolean;
  /** Manually trigger a refresh */
  refresh: () => Promise<ROIData | undefined>;
}

/**
 * Fetcher for ROI API
 */
async function roiFetcher(url: string): Promise<ROIData> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch ROI data');
  }
  const json = await res.json();
  // Validate response structure
  if (!json.success) {
    throw new Error(json.error || 'ROI request failed');
  }
  return json.data;
}

/**
 * Hook for fetching channel ROI data with SWR caching.
 * ROI calculations are moderately expensive, so use reasonable refresh intervals.
 */
export function useROI(): UseROIReturn {
  const { data, error, isLoading, mutate } = useSWR<ROIData>(
    '/api/roi',
    roiFetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false, // Don't refetch on window focus
    }
  );

  return {
    data,
    error,
    isLoading,
    refresh: async () => {
      try {
        return await mutate();
      } catch {
        // Error is already captured in the error state by SWR
        return undefined;
      }
    },
  };
}
