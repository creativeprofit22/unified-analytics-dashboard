/**
 * API response and request types for the analytics dashboard.
 * Provides type-safe wrappers for all API interactions.
 */

import type { Platform, TimeRange } from './analytics';

/**
 * Standard API response wrapper.
 * All API endpoints return data in this format.
 *
 * @template T - The type of data returned on success
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data (present when success is true) */
  data?: T;
  /** Error message (present when success is false) */
  error?: string;
  /** ISO 8601 timestamp of when the response was generated */
  timestamp: string;
}

/**
 * Query parameters for fetching analytics data.
 * All parameters are optional and have sensible defaults.
 */
export interface AnalyticsQueryParams {
  /** Filter by specific platform, or 'all' for aggregated data */
  platform?: Platform;
  /** Predefined time range for the query */
  timeRange?: TimeRange;
  /** Custom start date (ISO 8601 format, overrides timeRange) */
  startDate?: string;
  /** Custom end date (ISO 8601 format, overrides timeRange) */
  endDate?: string;
}

/**
 * Response from OAuth token refresh endpoint.
 * Used when a platform's access token needs renewal.
 */
export interface TokenRefreshResponse {
  /** New access token for API requests */
  accessToken: string;
  /** ISO 8601 timestamp when the new token expires */
  expiresAt: string;
}

/**
 * Platform connection status for OAuth-based integrations.
 */
export interface PlatformConnectionStatus {
  /** Platform identifier */
  platform: Platform;
  /** Whether the platform is currently connected */
  connected: boolean;
  /** When the connection was established */
  connectedAt?: string;
  /** When the current token expires */
  tokenExpiresAt?: string;
  /** Error message if connection failed */
  error?: string;
}

/**
 * Request body for initiating OAuth connection.
 */
export interface ConnectPlatformRequest {
  /** Platform to connect */
  platform: Platform;
  /** OAuth callback URL after authorization */
  redirectUri: string;
}

/**
 * Paginated response wrapper for list endpoints.
 *
 * @template T - The type of items in the list
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  items: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether there are more pages available */
  hasMore: boolean;
}

/**
 * Query parameters for paginated endpoints.
 */
export interface PaginationParams {
  /** Page number to fetch (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}
