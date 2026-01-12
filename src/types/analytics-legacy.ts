/**
 * Legacy Social Media Analytics Types
 *
 * These types are deprecated and maintained for backward compatibility only.
 * For new features, use the types in analytics.ts (UnifiedAnalyticsData, etc.).
 *
 * @deprecated This entire module is deprecated. Migrate to UnifiedAnalyticsData.
 */

import type { Metric, TrendDataPoint } from "./analytics";

// =============================================================================
// LEGACY SOCIAL MEDIA TYPES (Backward Compatibility)
// =============================================================================

/**
 * Supported social media platforms.
 * Use 'all' for aggregated cross-platform metrics.
 *
 * @deprecated Since v2.0. Use integration-specific types for new features.
 * Migration: Platform-specific data is now handled by external integrations.
 * For traffic sources, use UnifiedAnalyticsData.traffic.trafficBySource instead.
 */
export type Platform = "youtube" | "tiktok" | "instagram" | "twitter" | "all";

/**
 * High-level overview statistics for the dashboard header.
 *
 * @deprecated Since v2.0. Use UnifiedAnalyticsData instead.
 * Migration:
 * - totalViews -> UnifiedAnalyticsData.traffic.sessions + uniqueVisitors
 * - totalEngagement -> UnifiedAnalyticsData.conversions.totalConversions
 * - totalFollowers -> UnifiedAnalyticsData.subscriptions.activeSubscribers
 * - totalContent -> UnifiedAnalyticsData.campaigns.byCampaign.length
 */
export interface OverviewStats {
  totalViews: Metric;
  totalEngagement: Metric;
  totalFollowers: Metric;
  totalContent: Metric;
}

/**
 * Individual content item with performance metrics.
 *
 * @deprecated Since v2.0. Use integration-specific content types.
 * Migration: Content performance is now tracked via campaigns.
 * - views -> UnifiedAnalyticsData.campaigns.byCampaign[].sent/delivered
 * - engagementRate -> UnifiedAnalyticsData.campaigns.engagement.openRate/ctr
 */
export interface ContentItem {
  id: string;
  platform: Platform;
  title: string;
  thumbnailUrl: string | null;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  vph?: number;
}

/**
 * Connected channel or profile information with aggregate stats.
 *
 * @deprecated Since v2.0. Use integration-specific profile types.
 * Migration: Profile/channel data moved to campaign channels.
 * - followers -> UnifiedAnalyticsData.campaigns.listHealth.totalSubscribers
 * - totalViews -> UnifiedAnalyticsData.traffic.sessions
 * - avgEngagement -> UnifiedAnalyticsData.campaigns.engagement.openRate
 */
export interface ProfileStats {
  id: string;
  platform: Platform;
  name: string;
  handle: string;
  avatarUrl: string | null;
  followers: number;
  totalViews: number;
  avgEngagement: number;
}

/**
 * Platform-specific breakdown of metrics.
 *
 * @deprecated Since v2.0. Use UnifiedAnalyticsData.segmentation instead.
 * Migration:
 * - platform breakdown -> UnifiedAnalyticsData.segmentation.byCampaign
 * - views by platform -> UnifiedAnalyticsData.traffic.trafficBySource
 * - engagement by platform -> UnifiedAnalyticsData.campaigns.byChannel
 */
export interface PlatformBreakdown {
  platform: Platform;
  views: number;
  engagement: number;
  content: number;
}

/**
 * Legacy analytics data response for social media dashboard.
 *
 * @deprecated Since v2.0. Use UnifiedAnalyticsData for new features.
 * Migration example:
 * ```typescript
 * // Before (legacy):
 * const { overview, viewsTrend, platformBreakdown } = legacyData;
 *
 * // After (unified):
 * const { traffic, conversions, campaigns, segmentation } = unifiedData;
 * // overview.totalViews -> traffic.sessions
 * // viewsTrend -> traffic data over time (fetch with timeRange param)
 * // platformBreakdown -> segmentation.byCampaign or campaigns.byChannel
 * ```
 */
export interface AnalyticsData {
  overview: OverviewStats;
  viewsTrend: TrendDataPoint[];
  engagementTrend: TrendDataPoint[];
  topContent: ContentItem[];
  profiles: ProfileStats[];
  platformBreakdown: PlatformBreakdown[];
}
