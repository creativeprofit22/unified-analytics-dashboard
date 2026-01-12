/**
 * Main Analytics API Endpoint
 * GET /api/analytics
 *
 * Returns aggregated analytics data across all connected platforms.
 * Supports filtering by platform and time range via query parameters.
 *
 * Query Params:
 * - platform: 'all' | 'youtube' | 'tiktok' | 'instagram' | 'twitter'
 * - timeRange: '7d' | '30d' | '90d' | '1y' | 'all'
 */

import { NextRequest, NextResponse } from "next/server";
import { isMockMode } from "@/config/mock";
import { parseTimeRange } from "@/lib/time";
import type {
  AnalyticsData,
  AnalyticsResponse,
  TrendDataPoint,
  ContentItem,
  ProfileStats,
  Platform,
} from "@/types";

/**
 * Generate mock trend data for a given number of days
 */
function generateMockTrend(days: number): TrendDataPoint[] {
  const trend: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0] ?? "";
    trend.push({
      date: dateStr,
      value: Math.floor(Math.random() * 50000) + 30000,
    });
  }

  return trend;
}

/**
 * Generate mock content items
 */
function generateMockContent(count: number): ContentItem[] {
  const platforms: Platform[] = ["youtube", "tiktok", "instagram", "twitter"];

  return Array.from({ length: count }, (_, i) => {
    const platform = platforms[i % platforms.length]!;
    return {
      id: `content-${i + 1}`,
      platform,
      title: `Top Performing Content #${i + 1}`,
      thumbnailUrl: null,
      publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
      views: Math.floor(Math.random() * 100000) + 10000,
      likes: Math.floor(Math.random() * 5000) + 500,
      comments: Math.floor(Math.random() * 500) + 50,
      shares: Math.floor(Math.random() * 200) + 20,
      engagementRate: Math.random() * 10 + 2,
      vph: Math.floor(Math.random() * 1000) + 100,
    };
  });
}

/**
 * Generate mock profile data for all platforms
 */
function generateMockProfiles(): ProfileStats[] {
  return [
    {
      id: "yt-1",
      platform: "youtube",
      name: "Main Channel",
      handle: "@mainchannel",
      avatarUrl: null,
      followers: 50000,
      totalViews: 750000,
      avgEngagement: 4.2,
    },
    {
      id: "tt-1",
      platform: "tiktok",
      name: "TikTok Profile",
      handle: "@tiktokprofile",
      avatarUrl: null,
      followers: 45000,
      totalViews: 350000,
      avgEngagement: 8.5,
    },
    {
      id: "ig-1",
      platform: "instagram",
      name: "Instagram",
      handle: "@instagramhandle",
      avatarUrl: null,
      followers: 25000,
      totalViews: 100000,
      avgEngagement: 5.1,
    },
    {
      id: "tw-1",
      platform: "twitter",
      name: "Twitter/X",
      handle: "@twitterhandle",
      avatarUrl: null,
      followers: 5000,
      totalViews: 50000,
      avgEngagement: 2.3,
    },
  ];
}

/**
 * Get mock analytics data for development
 */
function getMockAnalyticsData(days: number): AnalyticsData {
  return {
    overview: {
      totalViews: {
        current: 1250000,
        previous: 980000,
        change: 27.5,
        changeType: "increase",
      },
      totalEngagement: {
        current: 45000,
        previous: 42000,
        change: 7.1,
        changeType: "increase",
      },
      totalFollowers: {
        current: 125000,
        previous: 118000,
        change: 5.9,
        changeType: "increase",
      },
      totalContent: {
        current: 156,
        previous: 142,
        change: 9.8,
        changeType: "increase",
      },
    },
    viewsTrend: generateMockTrend(days),
    engagementTrend: generateMockTrend(days),
    topContent: generateMockContent(10),
    profiles: generateMockProfiles(),
    platformBreakdown: [
      { platform: "youtube", views: 750000, engagement: 25000, content: 48 },
      { platform: "tiktok", views: 350000, engagement: 15000, content: 72 },
      { platform: "instagram", views: 100000, engagement: 4000, content: 24 },
      { platform: "twitter", views: 50000, engagement: 1000, content: 12 },
    ],
  };
}

const VALID_PLATFORMS = ["all", "youtube", "tiktok", "instagram", "twitter"] as const;

/**
 * Get cache headers based on mock mode
 */
function getCacheHeaders(isMock: boolean): HeadersInit {
  if (isMock) {
    return { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" };
  }
  return { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };
}

export async function GET(request: NextRequest): Promise<NextResponse<AnalyticsResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") || "all";
    const timeRange = searchParams.get("timeRange") || "30d";

    // Validate platform parameter
    if (!VALID_PLATFORMS.includes(platform as typeof VALID_PLATFORMS[number])) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid platform: ${platform}. Valid platforms: ${VALID_PLATFORMS.join(", ")}`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const days = parseTimeRange(timeRange);

    // Return mock data if in mock mode
    if (isMockMode) {
      const data = getMockAnalyticsData(days);

      // Filter by platform if specified
      if (platform !== "all") {
        data.topContent = data.topContent.filter((c) => c.platform === platform);
        data.platformBreakdown = data.platformBreakdown.filter(
          (p) => p.platform === platform
        );
        data.profiles = data.profiles.filter((p) => p.platform === platform);
      }

      return NextResponse.json(
        {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        },
        { headers: getCacheHeaders(true) }
      );
    }

    // TODO: Real implementation - fetch from external APIs
    // This will integrate with YouTube Analytics API, TikTok API, etc.
    // For now, return mock data as placeholder
    const data = getMockAnalyticsData(days);

    if (platform !== "all") {
      data.topContent = data.topContent.filter((c) => c.platform === platform);
      data.platformBreakdown = data.platformBreakdown.filter(
        (p) => p.platform === platform
      );
      data.profiles = data.profiles.filter((p) => p.platform === platform);
    }

    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { headers: getCacheHeaders(isMockMode) }
    );
  } catch (error) {
    console.error("[api/analytics] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
