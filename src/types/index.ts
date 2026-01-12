/**
 * Analytics Dashboard Types
 * Re-exports all types from module files for convenient importing.
 */

// Re-export all analytics types
export type {
  Platform,
  TimeRange,
  ChangeType,
  Metric,
  OverviewStats,
  TrendDataPoint,
  ContentItem,
  ProfileStats,
  PlatformBreakdown,
  AnalyticsData,
} from "./analytics";

// Re-export all API types
export type {
  ApiResponse,
  AnalyticsQueryParams,
  TokenRefreshResponse,
  PlatformConnectionStatus,
  ConnectPlatformRequest,
  PaginatedResponse,
  PaginationParams,
} from "./api";

// Additional types for API routes

/**
 * Response structure for aggregated analytics endpoint.
 */
export type AnalyticsResponse = import("./api").ApiResponse<
  import("./analytics").AnalyticsData
>;

/**
 * Response structure for platform-specific analytics endpoint.
 */
export interface PlatformAnalyticsData {
  platform: import("./analytics").Platform;
  metrics: import("./analytics").OverviewStats;
  trend: import("./analytics").TrendDataPoint[];
  content: import("./analytics").ContentItem[];
  profile: import("./analytics").ProfileStats | null;
}

export type PlatformAnalyticsResponse = import("./api").ApiResponse<PlatformAnalyticsData>;

/**
 * Health check endpoint response.
 */
export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  mockMode: boolean;
  version?: string;
}
