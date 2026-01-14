/**
 * Predictions API Endpoint
 * GET /api/predictions
 *
 * Returns predictive analytics data including:
 * - Revenue forecasts (MRR/ARR projections with confidence intervals)
 * - Churn risk predictions (at-risk customers with risk scores)
 * - LTV projections (segment-based lifetime value forecasts)
 */

import { NextResponse } from "next/server";
import { isMockMode } from "@/config/mock";
import { getCachedPredictionsMockData } from "@/lib/mock/predictions";
import type { PredictionsData, PredictionsResponse } from "@/types";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a standardized success response.
 */
function successResponse(
  data: PredictionsData,
  isMock: boolean
): NextResponse<PredictionsResponse> {
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
 * Predictions are expensive to compute, so use longer cache times.
 */
function getCacheHeaders(isMock: boolean): HeadersInit {
  if (isMock) {
    // Development: 30s cache
    return { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" };
  }
  // Production: 5min cache (predictions are expensive to compute)
  return { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

export async function GET(): Promise<NextResponse<PredictionsResponse | { success: false; error: string; timestamp: string }>> {
  try {
    // Return mock data if in mock mode
    if (isMockMode) {
      const data = getCachedPredictionsMockData();
      return successResponse(data, true);
    }

    // TODO: Real implementation - fetch from ML prediction service
    // For now, return mock data as placeholder
    const data = getCachedPredictionsMockData();
    return successResponse(data, isMockMode);
  } catch (error) {
    console.error("[api/predictions] Error:", error);
    return errorResponse("Failed to fetch predictions", 500);
  }
}
