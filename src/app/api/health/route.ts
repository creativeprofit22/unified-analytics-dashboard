/**
 * Health Check API Endpoint
 * GET /api/health
 *
 * Returns the current health status of the API.
 * Useful for monitoring, load balancers, and debugging.
 */

import { NextResponse } from "next/server";
import { isMockMode } from "@/config/mock";
import type { HealthResponse } from "@/types";

/**
 * Application version - should match package.json
 */
const APP_VERSION = "0.1.0";

/**
 * Cache headers for health endpoint - always fresh
 */
const HEALTH_CACHE_HEADERS = {
  "Cache-Control": "no-cache",
};

export async function GET(): Promise<NextResponse<HealthResponse>> {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      mockMode: isMockMode,
      version: APP_VERSION,
    },
    { headers: HEALTH_CACHE_HEADERS }
  );
}
