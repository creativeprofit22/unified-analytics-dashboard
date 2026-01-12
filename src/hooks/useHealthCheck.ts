import { useMemo } from 'react';
import useSWR from 'swr';
import { healthCheckFetcher } from '@/lib/fetchers';
import type { HealthResponse } from '@/types';

/**
 * Parameters for the useHealthCheck hook
 */
export interface UseHealthCheckParams {
  /** Whether to enable health check polling. Defaults to true. */
  enabled?: boolean;
  /** Polling interval in milliseconds. Defaults to 30000 (30 seconds). */
  refreshInterval?: number;
}

/**
 * Return value from the useHealthCheck hook
 */
export interface UseHealthCheckReturn {
  /** The health check response data */
  data: HealthResponse | undefined;
  /** Error if the health check failed */
  error: Error | undefined;
  /** Whether the initial fetch is in progress */
  isLoading: boolean;
  /** Whether the API is healthy (status === 'ok') */
  isHealthy: boolean;
  /** Whether the API is running in mock mode */
  isMockMode: boolean;
  /** Function to manually trigger a refresh */
  refresh: () => Promise<HealthResponse | undefined>;
}

/**
 * Hook to monitor API health status with automatic polling
 *
 * @param params - Configuration options for the health check
 * @returns Health check state and control functions
 *
 * @example
 * ```tsx
 * const { isHealthy, isMockMode, isLoading } = useHealthCheck();
 *
 * if (isLoading) return <Spinner />;
 * if (!isHealthy) return <ErrorBanner />;
 * ```
 *
 * @example
 * ```tsx
 * // Disable polling when tab is not visible
 * const { data, refresh } = useHealthCheck({
 *   enabled: isTabVisible,
 *   refreshInterval: 60000,
 * });
 * ```
 */
export function useHealthCheck(params: UseHealthCheckParams = {}): UseHealthCheckReturn {
  const { enabled = true, refreshInterval = 30000 } = params;

  // Memoize SWR config to prevent new object reference on every render
  const swrConfig = useMemo(
    () => ({
      refreshInterval: enabled ? refreshInterval : 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }),
    [enabled, refreshInterval]
  );

  const { data, error, isLoading, mutate } = useSWR<HealthResponse, Error>(
    enabled ? 'health' : null,
    healthCheckFetcher,
    swrConfig
  );

  // Memoize return object to prevent unnecessary re-renders in consuming components
  return useMemo(
    () => ({
      data,
      error,
      isLoading,
      isHealthy: data?.status === 'ok',
      isMockMode: data?.mockMode ?? false,
      refresh: mutate,
    }),
    [data, error, isLoading, mutate]
  );
}
