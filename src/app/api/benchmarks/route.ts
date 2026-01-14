/**
 * Benchmarks API Endpoint
 * GET /api/benchmarks - Returns available benchmarks with optional user metric comparison
 * POST /api/benchmarks - Compares user metrics against industry benchmarks
 *
 * Returns:
 * - Available benchmark metrics
 * - Industry benchmark data
 * - User metric comparisons (when metrics provided)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  compareAllMetrics,
  getAvailableMetrics,
  getMetricsByCategory,
} from "@/lib/benchmarks";
import type {
  BenchmarkCategory,
  BenchmarkResponse,
  UserMetrics,
} from "@/types/benchmarks";
import { isBenchmarkCategory } from "@/types/benchmarks";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a standardized success response.
 */
function successResponse(
  data: Omit<BenchmarkResponse, "success" | "timestamp">
): NextResponse<BenchmarkResponse> {
  return NextResponse.json(
    {
      success: true,
      ...data,
      timestamp: new Date().toISOString(),
    },
    { headers: getCacheHeaders() }
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
 * Get cache headers for benchmark data.
 * Benchmark data is relatively static, so we can cache it longer.
 */
function getCacheHeaders(): HeadersInit {
  return {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
  };
}

/**
 * Parse user metrics from query string.
 * Expects format: ?metrics=churn_rate:3.5,ltv_cac_ratio:4.2
 */
function parseMetricsFromQuery(metricsParam: string | null): UserMetrics {
  if (!metricsParam) return {};

  const metrics: UserMetrics = {};

  metricsParam.split(",").forEach((pair) => {
    const [key, value] = pair.split(":");
    if (key && value) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Type assertion since we're parsing from query
        metrics[key as keyof UserMetrics] = numValue;
      }
    }
  });

  return metrics;
}

// =============================================================================
// GET HANDLER
// =============================================================================

/**
 * GET /api/benchmarks
 *
 * Query params:
 * - category: Filter metrics by category (revenue, customer, engagement, support)
 * - metrics: User metrics to compare (format: metric1:value1,metric2:value2)
 *
 * @example
 * GET /api/benchmarks
 * GET /api/benchmarks?category=customer
 * GET /api/benchmarks?metrics=churn_rate:3.5,ltv_cac_ratio:4.2
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<BenchmarkResponse | { success: false; error: string; timestamp: string }>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryParam = searchParams.get("category");
    const metricsParam = searchParams.get("metrics");

    // Validate category if provided
    let category: BenchmarkCategory | undefined;
    if (categoryParam) {
      if (!isBenchmarkCategory(categoryParam)) {
        return errorResponse(
          `Invalid category: ${categoryParam}. Valid categories are: revenue, customer, engagement, support`,
          400
        );
      }
      category = categoryParam;
    }

    // Get available metrics (filtered by category if provided)
    const availableMetrics = category
      ? getMetricsByCategory(category)
      : getAvailableMetrics();

    // Parse and compare user metrics if provided
    const userMetrics = parseMetricsFromQuery(metricsParam);
    const comparisons = Object.keys(userMetrics).length > 0
      ? compareAllMetrics(userMetrics)
      : [];

    // Filter comparisons by category if needed
    const filteredComparisons = category
      ? comparisons.filter((c) => c.metric.category === category)
      : comparisons;

    return successResponse({
      comparisons: filteredComparisons,
      availableMetrics,
    });
  } catch (error) {
    console.error("[api/benchmarks] Error:", error);
    return errorResponse("Failed to fetch benchmarks", 500);
  }
}

// =============================================================================
// POST HANDLER
// =============================================================================

/**
 * POST /api/benchmarks
 *
 * Request body:
 * {
 *   userMetrics: { churn_rate: 3.5, ltv_cac_ratio: 4.2, ... },
 *   category?: "customer" | "revenue" | "engagement" | "support"
 * }
 *
 * @example
 * POST /api/benchmarks
 * {
 *   "userMetrics": {
 *     "churn_rate": 3.5,
 *     "ltv_cac_ratio": 4.2,
 *     "nps": 45,
 *     "arr_growth": 85
 *   }
 * }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<BenchmarkResponse | { success: false; error: string; timestamp: string }>> {
  try {
    const body = await request.json();

    // Validate request body
    if (!body || typeof body !== "object") {
      return errorResponse("Invalid request body", 400);
    }

    const { userMetrics, category: categoryParam } = body;

    // Validate userMetrics
    if (!userMetrics || typeof userMetrics !== "object") {
      return errorResponse("userMetrics is required and must be an object", 400);
    }

    // Validate category if provided
    let category: BenchmarkCategory | undefined;
    if (categoryParam) {
      if (typeof categoryParam !== "string" || !isBenchmarkCategory(categoryParam)) {
        return errorResponse(
          `Invalid category: ${categoryParam}. Valid categories are: revenue, customer, engagement, support`,
          400
        );
      }
      category = categoryParam;
    }

    // Validate metric values are numbers
    for (const [key, value] of Object.entries(userMetrics)) {
      if (typeof value !== "number" || isNaN(value)) {
        return errorResponse(
          `Invalid value for metric "${key}": expected a number`,
          400
        );
      }
    }

    // Get available metrics (filtered by category if provided)
    const availableMetrics = category
      ? getMetricsByCategory(category)
      : getAvailableMetrics();

    // Compare user metrics against benchmarks
    const comparisons = compareAllMetrics(userMetrics as UserMetrics);

    // Filter comparisons by category if needed
    const filteredComparisons = category
      ? comparisons.filter((c) => c.metric.category === category)
      : comparisons;

    return successResponse({
      comparisons: filteredComparisons,
      availableMetrics,
    });
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON in request body", 400);
    }

    console.error("[api/benchmarks] Error:", error);
    return errorResponse("Failed to process benchmarks", 500);
  }
}
