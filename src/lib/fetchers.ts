import { analyticsClient, ApiError } from './api-client';
import type { AnalyticsQueryParams, Platform, PlatformAnalyticsData, HealthResponse } from '@/types';
import type { UnifiedAnalyticsData } from '@/types/analytics';

/**
 * SWR-compatible fetcher for unified analytics
 * Usage: useSWR(['analytics', params], analyticsFetcher)
 */
export async function analyticsFetcher(
  [_, params]: ['analytics', AnalyticsQueryParams?]
): Promise<UnifiedAnalyticsData | undefined> {
  const response = await analyticsClient.getAnalytics(params);
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to fetch', 500);
  }
  return response.data;
}

/**
 * Platform-specific fetcher
 * Usage: useSWR(['analytics', platform, params], platformFetcher)
 * Note: platform must be a specific platform, not 'all'
 */
export async function platformFetcher(
  [_, platform, params]: ['analytics', Exclude<Platform, 'all'>, AnalyticsQueryParams?]
): Promise<PlatformAnalyticsData | undefined> {
  const response = await analyticsClient.getPlatformAnalytics(platform, params);
  if (!response.success) {
    throw new ApiError(response.error || 'Failed to fetch', 500);
  }
  return response.data;
}

/**
 * Health check fetcher
 * Usage: useSWR('health', healthCheckFetcher)
 */
export function healthCheckFetcher(): Promise<HealthResponse> {
  return analyticsClient.healthCheck();
}

/**
 * Generic fetcher for simple GET requests
 * Usage: useSWR('/api/endpoint', genericFetcher)
 */
export async function genericFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(
      data.error || 'Failed to fetch',
      response.status,
      data.code
    );
  }
  return response.json();
}
