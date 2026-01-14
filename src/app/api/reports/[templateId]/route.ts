/**
 * Reports Template API Endpoint
 * GET /api/reports/[templateId] - Get specific template with report data
 * PUT /api/reports/[templateId] - Update specific template
 * DELETE /api/reports/[templateId] - Delete specific template
 *
 * Dynamic route for managing individual report templates.
 */

import { NextResponse } from "next/server";
import {
  getTemplateById,
  updateTemplateInCache,
  deleteTemplateFromCache,
  generateReportDataForTemplate,
} from "@/lib/mock/reports";
import type { ReportTemplate, ReportData, ReportMetric } from "@/types/report-builder";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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
 * Validate template update input data.
 */
function validateUpdateInput(
  body: unknown
): { valid: true; data: Partial<UpdateTemplateInput> } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const input = body as Record<string, unknown>;
  const updates: Partial<UpdateTemplateInput> = {};

  // Validate name if provided
  if (input.name !== undefined) {
    if (typeof input.name !== "string" || input.name.trim().length === 0) {
      return { valid: false, error: "Name must be a non-empty string" };
    }
    updates.name = input.name.trim();
  }

  // Validate description if provided
  if (input.description !== undefined) {
    if (typeof input.description !== "string") {
      return { valid: false, error: "Description must be a string" };
    }
    updates.description = input.description.trim();
  }

  // Validate metrics if provided
  if (input.metrics !== undefined) {
    if (!Array.isArray(input.metrics) || input.metrics.length === 0) {
      return { valid: false, error: "Metrics must be a non-empty array" };
    }

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

    updates.metrics = input.metrics as ReportMetric[];
  }

  if (Object.keys(updates).length === 0) {
    return { valid: false, error: "No valid update fields provided" };
  }

  return { valid: true, data: updates };
}

interface UpdateTemplateInput {
  name: string;
  description: string;
  metrics: ReportMetric[];
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

/**
 * GET /api/reports/[templateId]
 * Returns a specific template with its generated report data.
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<
  NextResponse<
    | {
        success: true;
        data: { template: ReportTemplate; report: ReportData };
        timestamp: string;
      }
    | { success: false; error: string; timestamp: string }
  >
> {
  try {
    const { templateId } = await params;

    if (!templateId || templateId.trim().length === 0) {
      return errorResponse("Template ID is required", 400);
    }

    const template = getTemplateById(templateId);

    if (!template) {
      return errorResponse("Template not found", 404);
    }

    const report = generateReportDataForTemplate(templateId);

    if (!report) {
      return errorResponse("Failed to generate report data", 500);
    }

    return NextResponse.json(
      {
        success: true,
        data: { template, report },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("[api/reports/[templateId]] GET Error:", error);
    return errorResponse("Failed to fetch template", 500);
  }
}

/**
 * PUT /api/reports/[templateId]
 * Update a specific template.
 */
export async function PUT(
  request: Request,
  { params }: RouteParams
): Promise<
  NextResponse<
    | { success: true; data: ReportTemplate; timestamp: string }
    | { success: false; error: string; timestamp: string }
  >
> {
  try {
    const { templateId } = await params;

    if (!templateId || templateId.trim().length === 0) {
      return errorResponse("Template ID is required", 400);
    }

    // Check if template exists
    const existingTemplate = getTemplateById(templateId);
    if (!existingTemplate) {
      return errorResponse("Template not found", 404);
    }

    // Don't allow updating default templates
    if (existingTemplate.isDefault) {
      return errorResponse("Default templates cannot be modified", 403);
    }

    const body = await request.json();
    const validation = validateUpdateInput(body);

    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const updated = updateTemplateInCache(templateId, validation.data);

    if (!updated) {
      return errorResponse("Failed to update template", 500);
    }

    return NextResponse.json({
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/reports/[templateId]] PUT Error:", error);
    return errorResponse("Failed to update template", 500);
  }
}

/**
 * DELETE /api/reports/[templateId]
 * Delete a specific template.
 */
export async function DELETE(
  request: Request,
  { params }: RouteParams
): Promise<
  NextResponse<
    | { success: true; message: string; timestamp: string }
    | { success: false; error: string; timestamp: string }
  >
> {
  try {
    const { templateId } = await params;

    if (!templateId || templateId.trim().length === 0) {
      return errorResponse("Template ID is required", 400);
    }

    // Check if template exists
    const existingTemplate = getTemplateById(templateId);
    if (!existingTemplate) {
      return errorResponse("Template not found", 404);
    }

    // Don't allow deleting default templates
    if (existingTemplate.isDefault) {
      return errorResponse("Default templates cannot be deleted", 403);
    }

    const deleted = deleteTemplateFromCache(templateId);

    if (!deleted) {
      return errorResponse("Failed to delete template", 500);
    }

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/reports/[templateId]] DELETE Error:", error);
    return errorResponse("Failed to delete template", 500);
  }
}
