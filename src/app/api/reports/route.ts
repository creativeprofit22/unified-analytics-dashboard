/**
 * Reports API Endpoint
 * GET /api/reports - Get available metrics, templates, and current report
 * POST /api/reports - Create a new report template
 * PUT /api/reports - Update an existing report template
 * DELETE /api/reports - Delete a report template
 *
 * Returns report builder data including:
 * - Available metrics for building reports
 * - Saved report templates
 * - Current report data
 */

import { NextResponse } from "next/server";
import { isMockMode } from "@/config/mock";
import {
  getCachedReportBuilderMockData,
  getTemplatesFromCache,
  addTemplateToCache,
  updateTemplateInCache,
  deleteTemplateFromCache,
  generateTemplateId,
  getAvailableMetrics,
  generateReportDataForTemplate,
} from "@/lib/mock/reports";
import type {
  ReportBuilderData,
  ReportBuilderResponse,
  ReportTemplate,
  ReportMetric,
} from "@/types/report-builder";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a standardized success response.
 */
function successResponse(
  data: ReportBuilderData,
  isMock: boolean
): NextResponse<ReportBuilderResponse> {
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
 * Create a template response.
 */
function templateResponse(
  template: ReportTemplate
): NextResponse<{ success: true; data: ReportTemplate; timestamp: string }> {
  return NextResponse.json({
    success: true,
    data: template,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get cache headers based on mock mode.
 * Reports are personalized, so use shorter cache times.
 */
function getCacheHeaders(isMock: boolean): HeadersInit {
  if (isMock) {
    // Development: 2min cache
    return {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=30",
    };
  }
  // Production: 2min cache with longer stale-while-revalidate
  return {
    "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
  };
}

/**
 * Validate template input data.
 */
function validateTemplateInput(
  body: unknown
): { valid: true; data: CreateTemplateInput } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const input = body as Record<string, unknown>;

  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    return { valid: false, error: "Template name is required" };
  }

  if (typeof input.description !== "string") {
    return { valid: false, error: "Template description is required" };
  }

  if (!Array.isArray(input.metrics) || input.metrics.length === 0) {
    return { valid: false, error: "At least one metric is required" };
  }

  // Validate each metric
  const validWidths = ["full", "half", "third"];
  const validChartTypes = ["line", "bar", "pie", "area", "table"];

  for (const metric of input.metrics) {
    if (!metric || typeof metric !== "object") {
      return { valid: false, error: "Invalid metric format" };
    }

    const m = metric as Record<string, unknown>;

    if (typeof m.metricId !== "string" || m.metricId.trim().length === 0) {
      return { valid: false, error: "Each metric must have a metricId" };
    }

    if (typeof m.order !== "number" || m.order < 0) {
      return { valid: false, error: "Each metric must have a valid order (>= 0)" };
    }

    if (typeof m.width !== "string" || !validWidths.includes(m.width)) {
      return {
        valid: false,
        error: `Invalid width: ${m.width}. Must be one of: ${validWidths.join(", ")}`,
      };
    }

    if (
      m.chartType !== undefined &&
      (typeof m.chartType !== "string" || !validChartTypes.includes(m.chartType))
    ) {
      return {
        valid: false,
        error: `Invalid chartType: ${m.chartType}. Must be one of: ${validChartTypes.join(", ")}`,
      };
    }
  }

  return {
    valid: true,
    data: {
      name: input.name.trim(),
      description: input.description.trim(),
      metrics: input.metrics as ReportMetric[],
    },
  };
}

interface CreateTemplateInput {
  name: string;
  description: string;
  metrics: ReportMetric[];
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/reports
 * Returns available metrics, templates, and current report data.
 */
export async function GET(): Promise<
  NextResponse<
    | ReportBuilderResponse
    | { success: false; error: string; timestamp: string }
  >
> {
  try {
    if (isMockMode) {
      const data = getCachedReportBuilderMockData();
      // Get fresh templates from cache (may have been mutated)
      const templates = getTemplatesFromCache();
      return successResponse(
        {
          ...data,
          templates,
        },
        true
      );
    }

    // TODO: Real implementation - integrate with actual analytics service
    // For now, return mock data as placeholder
    const data = getCachedReportBuilderMockData();
    const templates = getTemplatesFromCache();
    return successResponse(
      {
        ...data,
        templates,
      },
      isMockMode
    );
  } catch (error) {
    console.error("[api/reports] GET Error:", error);
    return errorResponse("Failed to fetch report builder data", 500);
  }
}

/**
 * POST /api/reports
 * Create a new report template.
 */
export async function POST(
  request: Request
): Promise<
  NextResponse<
    | { success: true; data: ReportTemplate; timestamp: string }
    | { success: false; error: string; timestamp: string }
  >
> {
  try {
    const body = await request.json();
    const validation = validateTemplateInput(body);

    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const { name, description, metrics } = validation.data;

    // Create new template
    const newTemplate: ReportTemplate = {
      id: generateTemplateId(),
      name,
      description,
      metrics,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "user@example.com", // TODO: Get from auth context
      isDefault: false,
    };

    // Add to cache
    addTemplateToCache(newTemplate);

    return templateResponse(newTemplate);
  } catch (error) {
    console.error("[api/reports] POST Error:", error);
    return errorResponse("Failed to create report template", 500);
  }
}

/**
 * PUT /api/reports
 * Update an existing report template.
 * Requires { id: string, ...updates } in request body.
 */
export async function PUT(
  request: Request
): Promise<
  NextResponse<
    | { success: true; data: ReportTemplate; timestamp: string }
    | { success: false; error: string; timestamp: string }
  >
> {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return errorResponse("Request body is required", 400);
    }

    const { id, ...updates } = body as { id: string } & Partial<CreateTemplateInput>;

    if (typeof id !== "string" || id.trim().length === 0) {
      return errorResponse("Template ID is required", 400);
    }

    // Validate updates if provided
    if (updates.name !== undefined && typeof updates.name !== "string") {
      return errorResponse("Name must be a string", 400);
    }

    if (updates.description !== undefined && typeof updates.description !== "string") {
      return errorResponse("Description must be a string", 400);
    }

    if (updates.metrics !== undefined) {
      const metricsValidation = validateTemplateInput({
        name: "placeholder",
        description: "placeholder",
        metrics: updates.metrics,
      });
      if (!metricsValidation.valid) {
        return errorResponse(metricsValidation.error, 400);
      }
    }

    // Update in cache
    const updated = updateTemplateInCache(id, updates);

    if (!updated) {
      return errorResponse("Template not found", 404);
    }

    return templateResponse(updated);
  } catch (error) {
    console.error("[api/reports] PUT Error:", error);
    return errorResponse("Failed to update report template", 500);
  }
}

/**
 * DELETE /api/reports
 * Delete a report template.
 * Requires { id: string } in request body.
 */
export async function DELETE(
  request: Request
): Promise<
  NextResponse<
    | { success: true; message: string; timestamp: string }
    | { success: false; error: string; timestamp: string }
  >
> {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return errorResponse("Request body is required", 400);
    }

    const { id } = body as { id: string };

    if (typeof id !== "string" || id.trim().length === 0) {
      return errorResponse("Template ID is required", 400);
    }

    // Delete from cache
    const deleted = deleteTemplateFromCache(id);

    if (!deleted) {
      return errorResponse(
        "Template not found or cannot be deleted (default templates cannot be deleted)",
        404
      );
    }

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/reports] DELETE Error:", error);
    return errorResponse("Failed to delete report template", 500);
  }
}
