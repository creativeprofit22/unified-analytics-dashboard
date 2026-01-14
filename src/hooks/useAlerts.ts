import useSWR from 'swr';
import type { AlertsData } from '@/types';

/**
 * Return type for the useAlerts hook.
 */
export interface UseAlertsReturn {
  /** The fetched alerts data */
  data: AlertsData | undefined;
  /** Error object if the request failed */
  error: Error | undefined;
  /** True during initial load */
  isLoading: boolean;
  /** Manually trigger a refresh */
  refresh: () => Promise<AlertsData | undefined>;
}

/**
 * Fetcher for alerts API
 */
async function alertsFetcher(url: string): Promise<AlertsData> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch alerts');
  }
  const json = await res.json();
  return json.data;
}

/**
 * Hook for fetching alerts data with SWR caching.
 */
export function useAlerts(): UseAlertsReturn {
  const { data, error, isLoading, mutate } = useSWR<AlertsData>(
    '/api/alerts',
    alertsFetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    refresh: () => mutate(),
  };
}
