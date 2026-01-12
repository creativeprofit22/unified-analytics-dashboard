/**
 * Core analytics types for the unified dashboard.
 * Supports aggregating metrics across multiple social media platforms.
 */

/**
 * Supported social media platforms.
 * Use 'all' for aggregated cross-platform metrics.
 */
export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'all';

/**
 * Predefined time ranges for analytics filtering.
 * - 7d: Last 7 days
 * - 30d: Last 30 days
 * - 90d: Last 90 days
 * - 1y: Last year (365 days)
 * - all: All available data
 */
export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

/**
 * Direction of metric change between periods.
 */
export type ChangeType = 'increase' | 'decrease' | 'stable';

/**
 * Core metric with current value, previous period comparison, and change calculation.
 * Used for displaying metrics with period-over-period comparison.
 */
export interface Metric {
  /** Current period value */
  current: number;
  /** Previous period value for comparison */
  previous: number;
  /** Percentage change between periods (e.g., 15.5 = 15.5% increase) */
  change: number;
  /** Direction of the change */
  changeType: ChangeType;
}

/**
 * High-level overview statistics for the dashboard header.
 * All metrics include period-over-period comparison.
 */
export interface OverviewStats {
  /** Total views across all platforms */
  totalViews: Metric;
  /** Total engagement (likes + comments + shares) across all platforms */
  totalEngagement: Metric;
  /** Total follower count across all connected profiles */
  totalFollowers: Metric;
  /** Total number of published content pieces */
  totalContent: Metric;
}

/**
 * Single data point for time-series trend charts.
 */
export interface TrendDataPoint {
  /** ISO 8601 date string (e.g., "2026-01-12") */
  date: string;
  /** Metric value for this date */
  value: number;
  /** Optional platform identifier for multi-platform trend breakdowns */
  platform?: Platform;
}

/**
 * Individual content item with performance metrics.
 * Represents a video, post, reel, or tweet.
 */
export interface ContentItem {
  /** Unique identifier for the content piece */
  id: string;
  /** Platform where this content was published */
  platform: Platform;
  /** Content title or caption */
  title: string;
  /** URL to content thumbnail image */
  thumbnailUrl: string | null;
  /** ISO 8601 timestamp of when content was published */
  publishedAt: string;
  /** Total view count */
  views: number;
  /** Total like/favorite count */
  likes: number;
  /** Total comment count */
  comments: number;
  /** Total share/repost count */
  shares: number;
  /** Engagement rate as percentage (e.g., 5.2 = 5.2%) */
  engagementRate: number;
  /** Views per hour since publication (optional, for recent content) */
  vph?: number;
}

/**
 * Connected channel or profile information with aggregate stats.
 */
export interface ProfileStats {
  /** Unique identifier for the profile */
  id: string;
  /** Platform this profile belongs to */
  platform: Platform;
  /** Display name of the channel/profile */
  name: string;
  /** Username/handle (e.g., @username) */
  handle: string;
  /** URL to profile avatar image */
  avatarUrl: string | null;
  /** Current follower/subscriber count */
  followers: number;
  /** Lifetime total views across all content */
  totalViews: number;
  /** Average engagement rate as percentage */
  avgEngagement: number;
}

/**
 * Platform-specific breakdown of metrics.
 */
export interface PlatformBreakdown {
  /** Platform identifier */
  platform: Platform;
  /** Total views on this platform */
  views: number;
  /** Total engagement on this platform */
  engagement: number;
  /** Number of content pieces on this platform */
  content: number;
}

/**
 * Complete analytics data response for the dashboard.
 * Contains all metrics, trends, and breakdowns for display.
 */
export interface AnalyticsData {
  /** High-level overview statistics */
  overview: OverviewStats;
  /** Time-series data for views trend chart */
  viewsTrend: TrendDataPoint[];
  /** Time-series data for engagement trend chart */
  engagementTrend: TrendDataPoint[];
  /** Top performing content items sorted by views */
  topContent: ContentItem[];
  /** Connected profiles with their statistics */
  profiles: ProfileStats[];
  /** Per-platform metrics breakdown */
  platformBreakdown: PlatformBreakdown[];
}
