/**
 * Main Analytics API Endpoint
 * GET /api/analytics
 *
 * Returns aggregated analytics data across all metric categories.
 * Supports filtering by category and time range via query parameters.
 *
 * Query Params:
 * - category: 'all' | 'traffic' | 'seo' | 'conversions' | 'revenue' | 'subscriptions' | 'payments' | 'unit-economics' | 'demographics' | 'segmentation' | 'campaigns' | 'legacy'
 * - timeRange: '7d' | '30d' | '90d' | '1y' | 'all'
 * - platform: (legacy) 'all' | 'youtube' | 'tiktok' | 'instagram' | 'twitter'
 */

import { NextRequest, NextResponse } from "next/server";
import { isMockMode } from "@/config/mock";
import { parseTimeRange } from "@/lib/time";
import { getCachedUnifiedMockData, getCachedLegacyMockData, getCachedComparisonMockData } from "@/lib/mock/analytics";
import type {
  AnalyticsData,
  AnalyticsResponse,
  UnifiedAnalyticsData,
  UnifiedAnalyticsResponse,
} from "@/types";

// =============================================================================
// CONSTANTS
// =============================================================================

const VALID_PLATFORMS = ["all", "youtube", "tiktok", "instagram", "twitter"] as const;
const VALID_CATEGORIES = [
  "all",
  "traffic",
  "seo",
  "conversions",
  "revenue",
  "subscriptions",
  "payments",
  "unit-economics",
  "demographics",
  "segmentation",
  "campaigns",
  "legacy",
] as const;

type ValidCategory = typeof VALID_CATEGORIES[number];
type ValidPlatform = typeof VALID_PLATFORMS[number];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Parsed query parameters from the request
 */
interface ParsedParams {
  category: string;
  platform: string;
  timeRange: string;
  days: number;
  isComparison: boolean;
}

/**
 * Parse and extract query parameters from the request
 */
function parseParams(request: NextRequest): ParsedParams {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const platform = searchParams.get("platform") || "all";
  const timeRange = searchParams.get("timeRange") || "30d";
  const days = parseTimeRange(timeRange);
  const isComparison = searchParams.get("comparison") === "true";

  return { category, platform, timeRange, days, isComparison };
}

/**
 * Create a standardized success response
 */
function successResponse<T>(
  data: T,
  isMock: boolean
): NextResponse<{ success: true; data: T; timestamp: string }> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      timestamp: new Date().toISOString(),
    },
    { headers: getCacheHeaders(isMock) }
  );
}

/**
 * Create a standardized error response
 */
function errorResponse(
  message: string,
  status: number
): NextResponse<{ success: false; error: string; timestamp: string }> {
  return NextResponse.json(
    {
      success: false as const,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

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
 * Category key mapping for unified data filtering
 */
const CATEGORY_MAP: Record<string, keyof UnifiedAnalyticsData> = {
  traffic: "traffic",
  seo: "seo",
  conversions: "conversions",
  revenue: "revenue",
  subscriptions: "subscriptions",
  payments: "payments",
  "unit-economics": "unitEconomics",
  demographics: "demographics",
  segmentation: "segmentation",
  campaigns: "campaigns",
};

/**
 * Filter legacy analytics data by platform
 * Returns a new object with filtered arrays (does not mutate input)
 */
function filterLegacyDataByPlatform(data: AnalyticsData, platform: string): AnalyticsData {
  if (platform === "all") {
    return data;
  }

  return {
    ...data,
    topContent: data.topContent.filter((c) => c.platform === platform),
    platformBreakdown: data.platformBreakdown.filter((p) => p.platform === platform),
    profiles: data.profiles.filter((p) => p.platform === platform),
  };
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<AnalyticsResponse | UnifiedAnalyticsResponse>> {
  try {
    const { category, platform, days, isComparison } = parseParams(request);

    // Validate category parameter
    if (!VALID_CATEGORIES.includes(category as ValidCategory)) {
      return errorResponse(
        `Invalid category: ${category}. Valid categories: ${VALID_CATEGORIES.join(", ")}`,
        400
      );
    }

    // Validate platform parameter (for legacy mode)
    if (category === "legacy" && !VALID_PLATFORMS.includes(platform as ValidPlatform)) {
      return errorResponse(
        `Invalid platform: ${platform}. Valid platforms: ${VALID_PLATFORMS.join(", ")}`,
        400
      );
    }

    // Return mock data if in mock mode
    if (isMockMode) {
      // Legacy mode - return old social media analytics format
      if (category === "legacy") {
        const data = filterLegacyDataByPlatform(getCachedLegacyMockData(days), platform);
        return successResponse(data, true);
      }

      // Unified mode - return specific category or all
      // Note: `days` parameter is intentionally unused here. Unified mode always
      // returns 30-day data. See getUnifiedMockData() for rationale.
      // When isComparison is true, return data with lower values to simulate previous period.
      const unifiedData = isComparison
        ? getCachedComparisonMockData()
        : getCachedUnifiedMockData();

      // Filter to specific category if requested
      if (category !== "all") {
        const key = CATEGORY_MAP[category];
        if (key) {
          const filteredData: UnifiedAnalyticsData = {
            [key]: unifiedData[key],
            timeRange: unifiedData.timeRange,
            fetchedAt: unifiedData.fetchedAt,
          };

          return successResponse(filteredData, true);
        }
      }

      return successResponse(unifiedData, true);
    }

    // TODO: Real implementation - fetch from external APIs
    // For now, return mock data as placeholder
    if (category === "legacy") {
      const data = filterLegacyDataByPlatform(getCachedLegacyMockData(days), platform);
      return successResponse(data, isMockMode);
    }

    const unifiedData = getCachedUnifiedMockData();
    return successResponse(unifiedData, isMockMode);
  } catch (error) {
    console.error("[api/analytics] Error:", error);
    return errorResponse("Failed to fetch analytics", 500);
  }
}
