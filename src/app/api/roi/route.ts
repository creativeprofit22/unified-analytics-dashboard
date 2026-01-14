/**
 * ROI API Endpoint
 * GET /api/roi
 *
 * Returns channel ROI analytics data including:
 * - ROI metrics per channel (ROI, ROAS, CAC, LTV, etc.)
 * - Cost breakdowns (ad spend, labor, tools, other)
 * - Summary statistics across all channels
 * - Historical ROI trend data
 */

import { NextResponse } from "next/server";
import { isMockMode } from "@/config/mock";
import { getCachedROIMockData } from "@/lib/mock/roi";
import type { ROIData, ROIResponse } from "@/types/roi";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a standardized success response.
 */
function successResponse(
  data: ROIData,
  isMock: boolean
): NextResponse<ROIResponse> {
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
 * ROI calculations are moderately expensive, so use reasonable cache times.
 */
function getCacheHeaders(isMock: boolean): HeadersInit {
  if (isMock) {
    // Development: 5min cache
    return { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" };
  }
  // Production: 5min cache with longer stale-while-revalidate
  return { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

export async function GET(): Promise<NextResponse<ROIResponse | { success: false; error: string; timestamp: string }>> {
  try {
    // Return mock data if in mock mode
    if (isMockMode) {
      const data = getCachedROIMockData();
      return successResponse(data, true);
    }

    // TODO: Real implementation - integrate with actual analytics service
    // For now, return mock data as placeholder
    const data = getCachedROIMockData();
    return successResponse(data, isMockMode);
  } catch (error) {
    console.error("[api/roi] Error:", error);
    return errorResponse("Failed to fetch ROI data", 500);
  }
}
