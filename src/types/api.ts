/**
 * API response and request types for the analytics dashboard.
 * Provides type-safe wrappers for all API interactions.
 */

import type {
  TimeRange,
  UnifiedAnalyticsData,
  TrafficMetrics,
  SEOMetrics,
  ConversionMetrics,
  RevenueMetrics,
  SubscriptionMetrics,
  PaymentMetrics,
  UnitEconomicsMetrics,
  DemographicsMetrics,
  SegmentationMetrics,
  CampaignMetrics,
  TrendDataPoint,
} from './analytics';

import type {
  Platform,
  AnalyticsData,
  OverviewStats,
  ContentItem,
  ProfileStats,
} from './analytics-legacy';

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
  /** Whether this is a comparison period request (returns previous period data) */
  comparison?: boolean;
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

/**
 * Response structure for platform-specific analytics endpoint.
 * @deprecated Use category-specific responses for new features
 */
export interface PlatformAnalyticsData {
  platform: Platform;
  metrics: OverviewStats;
  trend: TrendDataPoint[];
  content: ContentItem[];
  profile: ProfileStats | null;
}

/**
 * Health check endpoint response.
 */
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  mockMode: boolean;
  version?: string;
}

// =============================================================================
// COMPOSED RESPONSE TYPES
// =============================================================================

/**
 * Response structure for legacy aggregated analytics endpoint.
 * @deprecated Use UnifiedAnalyticsResponse for new features
 */
export type AnalyticsResponse = ApiResponse<AnalyticsData>;

/**
 * Response structure for unified analytics endpoint.
 */
export type UnifiedAnalyticsResponse = ApiResponse<UnifiedAnalyticsData>;

/**
 * Response structure for platform-specific analytics endpoint.
 * @deprecated Use category-specific responses for new features
 */
export type PlatformAnalyticsResponse = ApiResponse<PlatformAnalyticsData>;

// =============================================================================
// CATEGORY-SPECIFIC RESPONSE TYPES
// =============================================================================

/** Traffic metrics response */
export type TrafficResponse = ApiResponse<TrafficMetrics>;

/** SEO metrics response */
export type SEOResponse = ApiResponse<SEOMetrics>;

/** Conversion metrics response */
export type ConversionResponse = ApiResponse<ConversionMetrics>;

/** Revenue metrics response */
export type RevenueResponse = ApiResponse<RevenueMetrics>;

/** Subscription metrics response */
export type SubscriptionResponse = ApiResponse<SubscriptionMetrics>;

/** Payment metrics response */
export type PaymentResponse = ApiResponse<PaymentMetrics>;

/** Unit economics metrics response */
export type UnitEconomicsResponse = ApiResponse<UnitEconomicsMetrics>;

/** Demographics metrics response */
export type DemographicsResponse = ApiResponse<DemographicsMetrics>;

/** Segmentation metrics response */
export type SegmentationResponse = ApiResponse<SegmentationMetrics>;

/** Campaign metrics response */
export type CampaignResponse = ApiResponse<CampaignMetrics>;
