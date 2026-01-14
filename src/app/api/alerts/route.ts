/**
 * Alerts API Endpoint
 * GET /api/alerts
 *
 * Returns alerting and monitoring data including:
 * - Detected anomalies in metrics
 * - Threshold alert states
 * - Goal progress tracking
 */

import { NextResponse } from "next/server";
import { isMockMode } from "@/config/mock";
import { getCachedAlertsMockData } from "@/lib/mock/alerts";
import type { AlertsData, AlertsResponse } from "@/types";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a standardized success response.
 */
function successResponse(
  data: AlertsData,
  isMock: boolean
): NextResponse<AlertsResponse> {
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
 * Alerts data should be refreshed more frequently than analytics.
 */
function getCacheHeaders(isMock: boolean): HeadersInit {
  if (isMock) {
    // Short cache for mock mode - allows quick iteration during development
    return { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" };
  }
  // Slightly longer cache for production, but still relatively short for alerts
  return { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" };
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

export async function GET(): Promise<NextResponse<AlertsResponse | { success: false; error: string; timestamp: string }>> {
  try {
    // Return mock data if in mock mode
    if (isMockMode) {
      const data = getCachedAlertsMockData();
      return successResponse(data, true);
    }

    // TODO: Real implementation - fetch from alerting service
    // For now, return mock data as placeholder
    const data = getCachedAlertsMockData();
    return successResponse(data, isMockMode);
  } catch (error) {
    console.error("[api/alerts] Error:", error);
    return errorResponse("Failed to fetch alerts", 500);
  }
}
