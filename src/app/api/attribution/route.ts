/**
 * Attribution API Endpoint
 * GET /api/attribution
 *
 * Returns multi-touch attribution analytics data including:
 * - Attribution model results (first-touch, last-touch, linear, time-decay)
 * - Conversion journeys with touchpoint sequences
 * - Path flow data for Sankey visualization
 * - Summary statistics
 */

import { NextResponse } from "next/server";
import { isMockMode } from "@/config/mock";
import { getCachedAttributionMockData } from "@/lib/mock/attribution";
import type { AttributionData, AttributionResponse } from "@/types/attribution";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a standardized success response.
 */
function successResponse(
  data: AttributionData,
  isMock: boolean
): NextResponse<AttributionResponse> {
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
 * Attribution analysis is expensive to compute, so use longer cache times.
 */
function getCacheHeaders(isMock: boolean): HeadersInit {
  if (isMock) {
    // Development: 5min cache (attribution is computationally expensive)
    return { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" };
  }
  // Production: 5min cache (attribution is expensive to compute)
  return { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

export async function GET(): Promise<NextResponse<AttributionResponse | { success: false; error: string; timestamp: string }>> {
  try {
    // Return mock data if in mock mode
    if (isMockMode) {
      const data = getCachedAttributionMockData();
      return successResponse(data, true);
    }

    // TODO: Real implementation - fetch from attribution analytics service
    // For now, return mock data as placeholder
    const data = getCachedAttributionMockData();
    return successResponse(data, isMockMode);
  } catch (error) {
    console.error("[api/attribution] Error:", error);
    return errorResponse("Failed to fetch attribution data", 500);
  }
}
