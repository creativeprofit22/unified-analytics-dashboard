/**
 * Custom Dashboards API Endpoint
 *
 * CRUD operations for custom dashboards:
 * - GET /api/dashboards - List all dashboards
 * - POST /api/dashboards - Create a new dashboard
 * - GET /api/dashboards?id=xxx - Get a specific dashboard
 * - PUT /api/dashboards - Update an existing dashboard
 * - DELETE /api/dashboards?id=xxx - Delete a dashboard
 */

import { NextRequest, NextResponse } from "next/server";
import type {
  SavedDashboard,
  DashboardMeta,
  DashboardInput,
  DashboardListResponse,
  DashboardResponse,
  DashboardMutationResponse,
  DashboardErrorResponse,
  DashboardLayout,
} from "@/types/custom-dashboards";

// =============================================================================
// IN-MEMORY STORAGE (Replace with database in production)
// =============================================================================

/**
 * In-memory dashboard storage.
 * In production, this would be replaced with a database.
 */
const dashboardStore = new Map<string, SavedDashboard>();

/**
 * Default layout configuration.
 */
const DEFAULT_LAYOUT: DashboardLayout = {
  columns: 12,
  rowHeight: 80,
  gap: 16,
  padding: 16,
  breakpoints: {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
  },
  columnsPerBreakpoint: {
    lg: 12,
    md: 10,
    sm: 6,
    xs: 4,
  },
  compactType: "vertical",
};

/**
 * Generate a unique dashboard ID.
 */
function generateDashboardId(): string {
  return `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Default user ID for mock purposes.
 */
const DEFAULT_USER_ID = "user-default";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a success response for dashboard list.
 */
function listResponse(
  dashboards: DashboardMeta[],
  total: number,
  page: number,
  pageSize: number
): NextResponse<DashboardListResponse> {
  return NextResponse.json({
    success: true,
    data: dashboards,
    total,
    page,
    pageSize,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Create a success response for single dashboard.
 */
function singleResponse(dashboard: SavedDashboard): NextResponse<DashboardResponse> {
  return NextResponse.json({
    success: true,
    data: dashboard,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Create a success response for mutations.
 */
function mutationResponse(
  dashboard: SavedDashboard,
  message: string
): NextResponse<DashboardMutationResponse> {
  return NextResponse.json({
    success: true,
    data: dashboard,
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Create an error response.
 */
function errorResponse(
  message: string,
  status: number,
  code?: string
): NextResponse<DashboardErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Extract dashboard metadata from full dashboard.
 */
function toDashboardMeta(dashboard: SavedDashboard): DashboardMeta {
  return {
    id: dashboard.id,
    name: dashboard.name,
    description: dashboard.description,
    ownerId: dashboard.ownerId,
    visibility: dashboard.visibility,
    isTemplate: dashboard.isTemplate,
    thumbnailUrl: dashboard.thumbnailUrl,
    createdAt: dashboard.createdAt,
    updatedAt: dashboard.updatedAt,
    widgetCount: dashboard.widgets.length,
  };
}

/**
 * Validate dashboard input.
 */
function validateDashboardInput(input: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Invalid input format"] };
  }

  const data = input as Record<string, unknown>;

  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Dashboard name is required");
  }

  if (data.name && typeof data.name === "string" && data.name.length > 100) {
    errors.push("Dashboard name must be 100 characters or less");
  }

  if (data.description && typeof data.description !== "string") {
    errors.push("Description must be a string");
  }

  if (!Array.isArray(data.widgets)) {
    errors.push("Widgets must be an array");
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// SEED DATA (Default templates)
// =============================================================================

/**
 * Initialize default dashboard templates.
 */
function initializeDefaultTemplates() {
  if (dashboardStore.size > 0) return;

  const now = new Date().toISOString();

  // Overview template
  const overview: SavedDashboard = {
    id: "template-overview",
    name: "Overview Dashboard",
    description: "Key metrics at a glance",
    ownerId: "system",
    visibility: "public",
    isTemplate: true,
    createdAt: now,
    updatedAt: now,
    widgetCount: 6,
    widgets: [
      {
        id: "w1",
        title: "Total Sessions",
        config: {
          type: "metric-card",
          dataBinding: { source: "traffic", field: "sessions" },
          metricOptions: { format: "number", showComparison: true, showTrend: true },
        },
        position: { lg: { x: 0, y: 0, w: 3, h: 2 } },
        visible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "w2",
        title: "Conversion Rate",
        config: {
          type: "metric-card",
          dataBinding: { source: "conversions", field: "conversionRate" },
          metricOptions: { format: "percent", showComparison: true, showTrend: true },
        },
        position: { lg: { x: 3, y: 0, w: 3, h: 2 } },
        visible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "w3",
        title: "Revenue",
        config: {
          type: "metric-card",
          dataBinding: { source: "revenue", field: "netRevenue" },
          metricOptions: { format: "currency", showComparison: true, showTrend: true },
        },
        position: { lg: { x: 6, y: 0, w: 3, h: 2 } },
        visible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "w4",
        title: "MRR",
        config: {
          type: "metric-card",
          dataBinding: { source: "subscriptions", field: "mrr" },
          metricOptions: { format: "currency", showComparison: true, showTrend: true },
        },
        position: { lg: { x: 9, y: 0, w: 3, h: 2 } },
        visible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "w5",
        title: "Revenue Trend",
        config: {
          type: "area-chart",
          dataBinding: { source: "revenue", field: "revenueTrend" },
          chartOptions: { showLegend: true, showGrid: true, animate: true, smooth: true },
        },
        position: { lg: { x: 0, y: 2, w: 8, h: 4 } },
        visible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "w6",
        title: "Traffic Sources",
        config: {
          type: "pie-chart",
          dataBinding: { source: "traffic", field: "trafficBySource" },
          chartOptions: { showLegend: true, legendPosition: "right", animate: true },
        },
        position: { lg: { x: 8, y: 2, w: 4, h: 4 } },
        visible: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    layout: DEFAULT_LAYOUT,
    defaultTimeRange: "30d",
    tags: ["template", "overview"],
    version: 1,
  };

  dashboardStore.set(overview.id, overview);

  // Revenue template
  const revenue: SavedDashboard = {
    id: "template-revenue",
    name: "Revenue Dashboard",
    description: "Detailed revenue and subscription metrics",
    ownerId: "system",
    visibility: "public",
    isTemplate: true,
    createdAt: now,
    updatedAt: now,
    widgetCount: 4,
    widgets: [
      {
        id: "r1",
        title: "Gross Revenue",
        config: {
          type: "metric-card",
          dataBinding: { source: "revenue", field: "grossRevenue" },
          metricOptions: { format: "currency", showComparison: true, showTrend: true },
        },
        position: { lg: { x: 0, y: 0, w: 3, h: 2 } },
        visible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "r2",
        title: "Net Revenue",
        config: {
          type: "metric-card",
          dataBinding: { source: "revenue", field: "netRevenue" },
          metricOptions: { format: "currency", showComparison: true, showTrend: true },
        },
        position: { lg: { x: 3, y: 0, w: 3, h: 2 } },
        visible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "r3",
        title: "AOV",
        config: {
          type: "metric-card",
          dataBinding: { source: "revenue", field: "aov" },
          metricOptions: { format: "currency", showComparison: true, showTrend: true },
        },
        position: { lg: { x: 6, y: 0, w: 3, h: 2 } },
        visible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "r4",
        title: "Transactions",
        config: {
          type: "metric-card",
          dataBinding: { source: "revenue", field: "transactions" },
          metricOptions: { format: "number", showComparison: true, showTrend: true },
        },
        position: { lg: { x: 9, y: 0, w: 3, h: 2 } },
        visible: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    layout: DEFAULT_LAYOUT,
    defaultTimeRange: "30d",
    tags: ["template", "revenue"],
    version: 1,
  };

  dashboardStore.set(revenue.id, revenue);
}

// Initialize templates on module load
initializeDefaultTemplates();

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/dashboards
 * List dashboards or get a specific dashboard by ID.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<DashboardListResponse | DashboardResponse | DashboardErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const includeTemplates = searchParams.get("templates") !== "false";

    // Get single dashboard by ID
    if (id) {
      const dashboard = dashboardStore.get(id);
      if (!dashboard) {
        return errorResponse("Dashboard not found", 404, "NOT_FOUND");
      }
      return singleResponse(dashboard);
    }

    // List dashboards
    let allDashboards = Array.from(dashboardStore.values());

    // Filter out templates if not requested
    if (!includeTemplates) {
      allDashboards = allDashboards.filter((d) => !d.isTemplate);
    }

    // Sort by updatedAt descending
    allDashboards.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Paginate
    const total = allDashboards.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = allDashboards.slice(start, end);

    // Convert to metadata only
    const meta = paginated.map(toDashboardMeta);

    return listResponse(meta, total, page, pageSize);
  } catch (error) {
    console.error("[api/dashboards] GET error:", error);
    return errorResponse("Failed to fetch dashboards", 500, "INTERNAL_ERROR");
  }
}

/**
 * POST /api/dashboards
 * Create a new dashboard.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<DashboardMutationResponse | DashboardErrorResponse>> {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateDashboardInput(body);
    if (!validation.valid) {
      return errorResponse(validation.errors.join(", "), 400, "VALIDATION_ERROR");
    }

    const input = body as DashboardInput;
    const now = new Date().toISOString();

    // Create new dashboard
    const dashboard: SavedDashboard = {
      id: generateDashboardId(),
      name: input.name.trim(),
      description: input.description?.trim(),
      ownerId: DEFAULT_USER_ID,
      visibility: input.visibility || "private",
      isTemplate: false,
      createdAt: now,
      updatedAt: now,
      widgetCount: input.widgets.length,
      widgets: input.widgets,
      layout: { ...DEFAULT_LAYOUT, ...input.layout },
      defaultTimeRange: input.defaultTimeRange || "30d",
      tags: input.tags || [],
      version: 1,
    };

    // Store dashboard
    dashboardStore.set(dashboard.id, dashboard);

    return mutationResponse(dashboard, "Dashboard created successfully");
  } catch (error) {
    console.error("[api/dashboards] POST error:", error);
    return errorResponse("Failed to create dashboard", 500, "INTERNAL_ERROR");
  }
}

/**
 * PUT /api/dashboards
 * Update an existing dashboard.
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<DashboardMutationResponse | DashboardErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Dashboard ID is required", 400, "MISSING_ID");
    }

    const existing = dashboardStore.get(id);
    if (!existing) {
      return errorResponse("Dashboard not found", 404, "NOT_FOUND");
    }

    // Don't allow editing system templates
    if (existing.isTemplate && existing.ownerId === "system") {
      return errorResponse("Cannot modify system templates", 403, "FORBIDDEN");
    }

    const body = await request.json();

    // Validate input
    const validation = validateDashboardInput(body);
    if (!validation.valid) {
      return errorResponse(validation.errors.join(", "), 400, "VALIDATION_ERROR");
    }

    const input = body as DashboardInput;
    const now = new Date().toISOString();

    // Update dashboard
    const updated: SavedDashboard = {
      ...existing,
      name: input.name.trim(),
      description: input.description?.trim(),
      visibility: input.visibility || existing.visibility,
      widgets: input.widgets,
      widgetCount: input.widgets.length,
      layout: input.layout ? { ...existing.layout, ...input.layout } : existing.layout,
      defaultTimeRange: input.defaultTimeRange || existing.defaultTimeRange,
      tags: input.tags || existing.tags,
      updatedAt: now,
      version: existing.version + 1,
    };

    // Store updated dashboard
    dashboardStore.set(id, updated);

    return mutationResponse(updated, "Dashboard updated successfully");
  } catch (error) {
    console.error("[api/dashboards] PUT error:", error);
    return errorResponse("Failed to update dashboard", 500, "INTERNAL_ERROR");
  }
}

/**
 * DELETE /api/dashboards
 * Delete a dashboard by ID.
 */
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; message: string; timestamp: string } | DashboardErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Dashboard ID is required", 400, "MISSING_ID");
    }

    const existing = dashboardStore.get(id);
    if (!existing) {
      return errorResponse("Dashboard not found", 404, "NOT_FOUND");
    }

    // Don't allow deleting system templates
    if (existing.isTemplate && existing.ownerId === "system") {
      return errorResponse("Cannot delete system templates", 403, "FORBIDDEN");
    }

    // Delete dashboard
    dashboardStore.delete(id);

    return NextResponse.json({
      success: true,
      message: "Dashboard deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/dashboards] DELETE error:", error);
    return errorResponse("Failed to delete dashboard", 500, "INTERNAL_ERROR");
  }
}
