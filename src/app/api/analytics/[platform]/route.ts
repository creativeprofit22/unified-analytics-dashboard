/**
 * Platform-Specific Analytics API Endpoint
 * GET /api/analytics/[platform]
 *
 * Returns detailed analytics for a specific platform.
 * Dynamic route: /api/analytics/youtube, /api/analytics/tiktok, etc.
 *
 * Path Params:
 * - platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter'
 *
 * Query Params:
 * - timeRange: '7d' | '30d' | '90d' | '1y' | 'all'
 */

import { NextRequest, NextResponse } from "next/server";
import { isMockMode } from "@/config/mock";
import { parseTimeRange } from "@/lib/time";
import type {
  Platform,
  PlatformAnalyticsResponse,
  TrendDataPoint,
  ContentItem,
  ProfileStats,
  OverviewStats,
} from "@/types";

const VALID_PLATFORMS: Array<Exclude<Platform, "all">> = ["youtube", "tiktok", "instagram", "twitter"];

/**
 * Platform-specific mock data configuration
 */
const platformConfig: Record<
  Exclude<Platform, "all">,
  {
    name: string;
    handle: string;
    baseViews: number;
    baseFollowers: number;
    avgEngagement: number;
    contentCount: number;
  }
> = {
  youtube: {
    name: "Main Channel",
    handle: "@mainchannel",
    baseViews: 750000,
    baseFollowers: 50000,
    avgEngagement: 4.2,
    contentCount: 48,
  },
  tiktok: {
    name: "TikTok Profile",
    handle: "@tiktokprofile",
    baseViews: 350000,
    baseFollowers: 45000,
    avgEngagement: 8.5,
    contentCount: 72,
  },
  instagram: {
    name: "Instagram",
    handle: "@instagramhandle",
    baseViews: 100000,
    baseFollowers: 25000,
    avgEngagement: 5.1,
    contentCount: 24,
  },
  twitter: {
    name: "Twitter/X",
    handle: "@twitterhandle",
    baseViews: 50000,
    baseFollowers: 5000,
    avgEngagement: 2.3,
    contentCount: 12,
  },
};

/** Platform type excluding 'all' for config mapping */
type PlatformKey = Exclude<Platform, "all">;

/**
 * Get cache headers based on mock mode
 */
function getCacheHeaders(isMock: boolean): HeadersInit {
  if (isMock) {
    return { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" };
  }
  return { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };
}

/**
 * Generate mock trend data for a specific platform
 */
function generatePlatformTrend(platform: PlatformKey, days: number): TrendDataPoint[] {
  const config = platformConfig[platform];
  const trend: TrendDataPoint[] = [];
  const now = new Date();
  const baseValue = Math.floor(config.baseViews / days);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Add some variance to make it look realistic
    const variance = (Math.random() - 0.5) * 0.4; // +/- 20%
    const dateStr = date.toISOString().split("T")[0] ?? "";
    trend.push({
      date: dateStr,
      value: Math.floor(baseValue * (1 + variance)),
    });
  }

  return trend;
}

/**
 * Generate mock content for a specific platform
 */
function generatePlatformContent(platform: PlatformKey, count: number): ContentItem[] {
  const config = platformConfig[platform];

  return Array.from({ length: count }, (_, i) => ({
    id: `${platform}-content-${i + 1}`,
    platform,
    title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Video #${i + 1}`,
    thumbnailUrl: null,
    publishedAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    views: Math.floor((config.baseViews / config.contentCount) * (1 + Math.random())),
    likes: Math.floor(Math.random() * 5000) + 500,
    comments: Math.floor(Math.random() * 500) + 50,
    shares: Math.floor(Math.random() * 200) + 20,
    engagementRate: config.avgEngagement * (0.8 + Math.random() * 0.4),
    vph: Math.floor(Math.random() * 1000) + 100,
  }));
}

/**
 * Generate mock profile for a specific platform
 */
function generatePlatformProfile(platform: PlatformKey): ProfileStats {
  const config = platformConfig[platform];

  return {
    id: `${platform}-1`,
    platform,
    name: config.name,
    handle: config.handle,
    avatarUrl: null,
    followers: config.baseFollowers,
    totalViews: config.baseViews,
    avgEngagement: config.avgEngagement,
  };
}

/**
 * Generate mock overview metrics for a specific platform
 */
function generatePlatformMetrics(platform: PlatformKey): OverviewStats {
  const config = platformConfig[platform];
  const previousMultiplier = 0.85; // Previous period was 15% lower

  return {
    totalViews: {
      current: config.baseViews,
      previous: Math.floor(config.baseViews * previousMultiplier),
      change: parseFloat(((1 / previousMultiplier - 1) * 100).toFixed(1)),
      changeType: "increase",
    },
    totalEngagement: {
      current: Math.floor(config.baseViews * (config.avgEngagement / 100)),
      previous: Math.floor(
        config.baseViews * previousMultiplier * (config.avgEngagement / 100)
      ),
      change: parseFloat(((1 / previousMultiplier - 1) * 100).toFixed(1)),
      changeType: "increase",
    },
    totalFollowers: {
      current: config.baseFollowers,
      previous: Math.floor(config.baseFollowers * 0.95),
      change: 5.3,
      changeType: "increase",
    },
    totalContent: {
      current: config.contentCount,
      previous: Math.floor(config.contentCount * 0.9),
      change: 11.1,
      changeType: "increase",
    },
  };
}

interface RouteParams {
  params: Promise<{ platform: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<PlatformAnalyticsResponse>> {
  try {
    const { platform: platformParam } = await params;

    // Validate platform - must be one of the valid platforms (not 'all')
    if (!VALID_PLATFORMS.includes(platformParam as PlatformKey)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid platform: ${platformParam}. Valid platforms are: ${VALID_PLATFORMS.join(", ")}`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const platform = platformParam as PlatformKey;

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";
    const days = parseTimeRange(timeRange);

    // Return mock data if in mock mode
    if (isMockMode) {
      return NextResponse.json(
        {
          success: true,
          data: {
            platform,
            metrics: generatePlatformMetrics(platform),
            trend: generatePlatformTrend(platform, days),
            content: generatePlatformContent(platform, 10),
            profile: generatePlatformProfile(platform),
          },
          timestamp: new Date().toISOString(),
        },
        { headers: getCacheHeaders(true) }
      );
    }

    // TODO: Real implementation - fetch from platform-specific APIs
    // YouTube: YouTube Analytics API
    // TikTok: TikTok API for Business
    // Instagram: Instagram Graph API
    // Twitter: Twitter API v2
    return NextResponse.json(
      {
        success: true,
        data: {
          platform,
          metrics: generatePlatformMetrics(platform),
          trend: generatePlatformTrend(platform, days),
          content: generatePlatformContent(platform, 10),
          profile: generatePlatformProfile(platform),
        },
        timestamp: new Date().toISOString(),
      },
      { headers: getCacheHeaders(isMockMode) }
    );
  } catch (error) {
    console.error("[api/analytics/[platform]] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch platform analytics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
