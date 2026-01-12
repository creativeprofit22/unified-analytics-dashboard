import type {
  ApiResponse,
  AnalyticsQueryParams,
  Platform,
  HealthResponse,
  PlatformAnalyticsData,
} from '@/types';
import type { UnifiedAnalyticsData } from '@/types/analytics';

/**
 * Custom error class for API errors with status code and error code support
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// Request Deduplication, Timeout, and Retry Configuration
// ============================================================================

/** Default timeout for requests in milliseconds */
const DEFAULT_TIMEOUT = 30000;

/** Maximum number of retry attempts */
const MAX_RETRIES = 3;

/** Base delay between retries in milliseconds (will be exponentially increased) */
const RETRY_DELAY = 1000;

/** HTTP status codes that are safe to retry */
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

/** In-flight request cache for deduplication */
const inflightRequests = new Map<string, Promise<unknown>>();

/** Extended options for apiFetch with timeout support */
interface ApiFetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a cache key for request deduplication
 */
function getCacheKey(endpoint: string, method: string): string {
  return `${method}:${endpoint}`;
}

/**
 * Base fetch wrapper with error handling, JSON parsing, timeout, retry, and deduplication
 */
async function apiFetch<T>(
  endpoint: string,
  options?: ApiFetchOptions
): Promise<T> {
  const method = options?.method || 'GET';
  const cacheKey = getCacheKey(endpoint, method);

  // Request deduplication: return existing in-flight request for non-POST requests
  if (method !== 'POST') {
    const existing = inflightRequests.get(cacheKey);
    if (existing) {
      return existing as Promise<T>;
    }
  }

  const request = executeWithRetry<T>(endpoint, options);

  // Only cache non-POST requests for deduplication
  if (method !== 'POST') {
    inflightRequests.set(cacheKey, request);
  }

  try {
    return await request;
  } finally {
    // Clean up the in-flight cache
    inflightRequests.delete(cacheKey);
  }
}

/**
 * Execute fetch with retry logic and timeout
 */
async function executeWithRetry<T>(
  endpoint: string,
  options?: ApiFetchOptions
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if we should retry on certain status codes
      if (!response.ok && RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY * Math.pow(2, attempt));
        continue;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'An error occurred',
          response.status,
          data.code
        );
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort/timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }

      // Re-throw ApiError immediately (non-retryable)
      if (error instanceof ApiError) {
        throw error;
      }

      // Store error for potential re-throw after all retries exhausted
      lastError = error as Error;

      // Retry on network errors
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY * Math.pow(2, attempt));
        continue;
      }
    }
  }

  // All retries exhausted
  throw new ApiError(
    lastError?.message || 'Max retries exceeded',
    0,
    'NETWORK_ERROR'
  );
}

/**
 * Build query string from params object, filtering out undefined values
 */
function buildQueryString(params: Record<string, string | undefined>): string {
  const filtered = Object.entries(params)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return filtered ? `?${filtered}` : '';
}

/**
 * Analytics API client with typed methods for all endpoints
 */
export const analyticsClient = {
  /**
   * Fetch all analytics data with optional filtering
   */
  async getAnalytics(params?: AnalyticsQueryParams): Promise<ApiResponse<UnifiedAnalyticsData>> {
    const query = buildQueryString({
      platform: params?.platform,
      timeRange: params?.timeRange,
      startDate: params?.startDate,
      endDate: params?.endDate,
    });
    return apiFetch<ApiResponse<UnifiedAnalyticsData>>(`/analytics${query}`);
  },

  /**
   * Fetch analytics for a specific platform
   * Note: 'all' is not a valid platform for this endpoint - use getAnalytics() instead
   */
  async getPlatformAnalytics(
    platform: Exclude<Platform, 'all'>,
    params?: Omit<AnalyticsQueryParams, 'platform'>
  ): Promise<ApiResponse<PlatformAnalyticsData>> {
    const query = buildQueryString({
      timeRange: params?.timeRange,
      startDate: params?.startDate,
      endDate: params?.endDate,
    });
    return apiFetch<ApiResponse<PlatformAnalyticsData>>(`/analytics/${platform}${query}`);
  },

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<HealthResponse> {
    return apiFetch('/health');
  },
};

// Re-export types for convenience
export type {
  ApiResponse,
  AnalyticsData,
  AnalyticsQueryParams,
  Platform,
  PlatformAnalyticsData,
  TimeRange,
  HealthResponse,
} from '@/types';
