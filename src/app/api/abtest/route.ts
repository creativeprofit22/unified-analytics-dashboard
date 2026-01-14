/**
 * A/B Test API Endpoint
 * GET /api/abtest
 *
 * Returns A/B test analytics data including:
 * - Active and completed experiments
 * - Variant metrics and comparisons
 * - Statistical significance calculations
 * - Summary statistics
 */

import { NextResponse } from "next/server";
import { isMockMode } from "@/config/mock";
import { getCachedABTestMockData } from "@/lib/mock/abtest";
import type { ABTestData, ABTestResponse } from "@/types/abtest";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a standardized success response.
 */
function successResponse(
  data: ABTestData,
  isMock: boolean
): NextResponse<ABTestResponse> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { headers: getCacheHeaders(isMock) }
  );
}

/**
 * Create a standardized error response.
 */
function errorResponse(
  message: string,
  status: number
): NextResponse<{ success: false; error: string; timestamp: string }> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Get cache headers based on mock mode.
 * A/B test data benefits from caching as experiments don't change frequently.
 */
function getCacheHeaders(isMock: boolean): HeadersInit {
  if (isMock) {
    // Development: 5min cache
    return { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" };
  }
  // Production: 5min cache
  return { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

export async function GET(): Promise<NextResponse<ABTestResponse | { success: false; error: string; timestamp: string }>> {
  try {
    // Return mock data if in mock mode
    if (isMockMode) {
      const data = getCachedABTestMockData();
      return successResponse(data, true);
    }

    // TODO: Real implementation - fetch from A/B test analytics service
    // For now, return mock data as placeholder
    const data = getCachedABTestMockData();
    return successResponse(data, isMockMode);
  } catch (error) {
    console.error("[api/abtest] Error:", error);
    return errorResponse("Failed to fetch A/B test data", 500);
  }
}
