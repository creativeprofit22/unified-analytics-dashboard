/**
 * Mock Data Generators for Custom Report Builder API
 *
 * This module contains mock data for the report builder feature,
 * generating realistic metric definitions, report templates, and data points.
 */

import type {
  MetricCategory,
  MetricDefinition,
  ReportMetric,
  ReportTemplate,
  ReportDataPoint,
  ReportData,
  ReportBuilderData,
} from "@/types/report-builder";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate an ISO date string for N days ago.
 */
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Generate a random number in a range.
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float in a range with specified decimal places.
 */
function randomFloat(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Generate a UUID-like string for IDs.
 */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// =============================================================================
// METRIC DEFINITIONS
// =============================================================================

/**
 * All available metrics organized by category.
 * These are the building blocks for custom reports.
 */
const METRIC_DEFINITIONS: MetricDefinition[] = [
  // -------------------------------------------------------------------------
  // TRAFFIC METRICS
  // -------------------------------------------------------------------------
  {
    id: "pageViews",
    name: "Page Views",
    category: "traffic",
    description: "Total number of pages viewed across all sessions",
    unit: "number",
    aggregation: "sum",
  },
  {
    id: "sessions",
    name: "Sessions",
    category: "traffic",
    description: "Total number of user sessions initiated",
    unit: "number",
    aggregation: "sum",
  },
  {
    id: "uniqueVisitors",
    name: "Unique Visitors",
    category: "traffic",
    description: "Number of distinct users who visited the site",
    unit: "number",
    aggregation: "sum",
  },
  {
    id: "bounceRate",
    name: "Bounce Rate",
    category: "traffic",
    description: "Percentage of single-page sessions with no interaction",
    unit: "percentage",
    aggregation: "average",
  },
  {
    id: "avgSessionDuration",
    name: "Avg Session Duration",
    category: "traffic",
    description: "Average time spent per session in seconds",
    unit: "duration",
    aggregation: "average",
  },

  // -------------------------------------------------------------------------
  // CONVERSION METRICS
  // -------------------------------------------------------------------------
  {
    id: "totalConversions",
    name: "Total Conversions",
    category: "conversions",
    description: "Total number of goal completions across all conversion types",
    unit: "number",
    aggregation: "sum",
  },
  {
    id: "conversionRate",
    name: "Conversion Rate",
    category: "conversions",
    description: "Percentage of sessions that resulted in a conversion",
    unit: "percentage",
    aggregation: "average",
  },
  {
    id: "signups",
    name: "Sign-ups",
    category: "conversions",
    description: "Number of new user registrations",
    unit: "number",
    aggregation: "sum",
  },
  {
    id: "purchases",
    name: "Purchases",
    category: "conversions",
    description: "Number of completed purchase transactions",
    unit: "number",
    aggregation: "sum",
  },
  {
    id: "cartAbandonment",
    name: "Cart Abandonment Rate",
    category: "conversions",
    description: "Percentage of shopping carts abandoned before checkout",
    unit: "percentage",
    aggregation: "average",
  },

  // -------------------------------------------------------------------------
  // REVENUE METRICS
  // -------------------------------------------------------------------------
  {
    id: "totalRevenue",
    name: "Total Revenue",
    category: "revenue",
    description: "Total revenue generated from all transactions",
    unit: "currency",
    aggregation: "sum",
  },
  {
    id: "avgOrderValue",
    name: "Average Order Value",
    category: "revenue",
    description: "Average revenue per completed order",
    unit: "currency",
    aggregation: "average",
  },
  {
    id: "revenuePerVisitor",
    name: "Revenue Per Visitor",
    category: "revenue",
    description: "Average revenue generated per unique visitor",
    unit: "currency",
    aggregation: "average",
  },
  {
    id: "recurringRevenue",
    name: "Recurring Revenue",
    category: "revenue",
    description: "Revenue from subscription and repeat purchases",
    unit: "currency",
    aggregation: "sum",
  },
  {
    id: "refunds",
    name: "Refunds",
    category: "revenue",
    description: "Total value of refunded transactions",
    unit: "currency",
    aggregation: "sum",
  },

  // -------------------------------------------------------------------------
  // ENGAGEMENT METRICS
  // -------------------------------------------------------------------------
  {
    id: "clickThroughRate",
    name: "Click-Through Rate",
    category: "engagement",
    description: "Percentage of impressions that resulted in clicks",
    unit: "percentage",
    aggregation: "average",
  },
  {
    id: "timeOnPage",
    name: "Time on Page",
    category: "engagement",
    description: "Average time users spend on each page in seconds",
    unit: "duration",
    aggregation: "average",
  },
  {
    id: "scrollDepth",
    name: "Scroll Depth",
    category: "engagement",
    description: "Average percentage of page content scrolled through",
    unit: "percentage",
    aggregation: "average",
  },
  {
    id: "socialShares",
    name: "Social Shares",
    category: "engagement",
    description: "Number of times content was shared on social media",
    unit: "number",
    aggregation: "sum",
  },
  {
    id: "comments",
    name: "Comments",
    category: "engagement",
    description: "Total number of user comments posted",
    unit: "number",
    aggregation: "sum",
  },

  // -------------------------------------------------------------------------
  // ATTRIBUTION METRICS
  // -------------------------------------------------------------------------
  {
    id: "firstTouch",
    name: "First-Touch Attribution",
    category: "attribution",
    description: "Revenue attributed to the first channel interaction",
    unit: "currency",
    aggregation: "sum",
  },
  {
    id: "lastTouch",
    name: "Last-Touch Attribution",
    category: "attribution",
    description: "Revenue attributed to the final channel before conversion",
    unit: "currency",
    aggregation: "sum",
  },
  {
    id: "linearAttribution",
    name: "Linear Attribution",
    category: "attribution",
    description: "Revenue distributed equally across all touchpoints",
    unit: "currency",
    aggregation: "sum",
  },
  {
    id: "timeDecay",
    name: "Time-Decay Attribution",
    category: "attribution",
    description: "Revenue weighted toward more recent touchpoints",
    unit: "currency",
    aggregation: "sum",
  },

  // -------------------------------------------------------------------------
  // ROI METRICS
  // -------------------------------------------------------------------------
  {
    id: "overallROI",
    name: "Overall ROI",
    category: "roi",
    description: "Return on investment across all marketing channels",
    unit: "percentage",
    aggregation: "average",
  },
  {
    id: "roas",
    name: "ROAS",
    category: "roi",
    description: "Return on ad spend (revenue / ad spend)",
    unit: "number",
    aggregation: "average",
  },
  {
    id: "cac",
    name: "Customer Acquisition Cost",
    category: "roi",
    description: "Average cost to acquire a new customer",
    unit: "currency",
    aggregation: "average",
  },
  {
    id: "ltv",
    name: "Customer Lifetime Value",
    category: "roi",
    description: "Predicted total revenue from a customer over their lifetime",
    unit: "currency",
    aggregation: "average",
  },
  {
    id: "paybackPeriod",
    name: "Payback Period",
    category: "roi",
    description: "Days to recover customer acquisition cost",
    unit: "number",
    aggregation: "average",
  },
];

// =============================================================================
// METRIC VALUE RANGES
// =============================================================================

/**
 * Value ranges for generating realistic mock data for each metric.
 */
const METRIC_VALUE_RANGES: Record<string, { min: number; max: number; decimals?: number }> = {
  // Traffic
  pageViews: { min: 50000, max: 200000 },
  sessions: { min: 20000, max: 80000 },
  uniqueVisitors: { min: 15000, max: 60000 },
  bounceRate: { min: 25, max: 65, decimals: 1 },
  avgSessionDuration: { min: 120, max: 480 },

  // Conversions
  totalConversions: { min: 500, max: 5000 },
  conversionRate: { min: 1.5, max: 8.5, decimals: 2 },
  signups: { min: 200, max: 2000 },
  purchases: { min: 300, max: 3000 },
  cartAbandonment: { min: 55, max: 85, decimals: 1 },

  // Revenue
  totalRevenue: { min: 50000, max: 500000 },
  avgOrderValue: { min: 45, max: 250, decimals: 2 },
  revenuePerVisitor: { min: 1.5, max: 12, decimals: 2 },
  recurringRevenue: { min: 10000, max: 100000 },
  refunds: { min: 500, max: 10000 },

  // Engagement
  clickThroughRate: { min: 1.5, max: 8.5, decimals: 2 },
  timeOnPage: { min: 30, max: 300 },
  scrollDepth: { min: 40, max: 85, decimals: 1 },
  socialShares: { min: 100, max: 5000 },
  comments: { min: 50, max: 1000 },

  // Attribution
  firstTouch: { min: 30000, max: 200000 },
  lastTouch: { min: 40000, max: 220000 },
  linearAttribution: { min: 35000, max: 210000 },
  timeDecay: { min: 38000, max: 215000 },

  // ROI
  overallROI: { min: 50, max: 350, decimals: 1 },
  roas: { min: 2, max: 12, decimals: 2 },
  cac: { min: 25, max: 150, decimals: 2 },
  ltv: { min: 150, max: 800, decimals: 2 },
  paybackPeriod: { min: 30, max: 180 },
};

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

/**
 * Get all available metric definitions.
 */
function getMetricDefinitions(): MetricDefinition[] {
  return [...METRIC_DEFINITIONS];
}

/**
 * Generate a trend array of 7 data points based on a base value.
 */
function generateTrend(baseValue: number, variance = 0.15): number[] {
  const trend: number[] = [];
  let value = baseValue * randomFloat(0.85, 1.0);

  for (let i = 0; i < 7; i++) {
    // Add some variation while trending toward the base value
    const change = randomFloat(-variance, variance);
    value = value * (1 + change);
    // Gradually trend toward base value
    value = value + (baseValue - value) * 0.1;
    trend.push(Math.round(value * 100) / 100);
  }

  return trend;
}

/**
 * Generate a data point for a specific metric.
 */
function generateDataPoint(metricId: string): ReportDataPoint {
  const range = METRIC_VALUE_RANGES[metricId];

  if (!range) {
    // Default fallback for unknown metrics
    return {
      metricId,
      value: randomFloat(100, 1000),
      previousValue: randomFloat(100, 1000),
      change: 0,
      changePercent: 0,
      trend: generateTrend(500),
    };
  }

  const { min, max, decimals = 0 } = range;
  const value = randomFloat(min, max, decimals);
  const previousValue = randomFloat(min, max, decimals);
  const change = Math.round((value - previousValue) * 100) / 100;
  const changePercent =
    previousValue !== 0
      ? Math.round(((value - previousValue) / previousValue) * 10000) / 100
      : 0;

  return {
    metricId,
    value,
    previousValue,
    change,
    changePercent,
    trend: generateTrend(value),
  };
}

/**
 * Generate a complete report from a template.
 */
function generateReportData(template: ReportTemplate): ReportData {
  const dataPoints = template.metrics.map((m) => generateDataPoint(m.metricId));

  return {
    templateId: template.id,
    template,
    dataPoints,
    generatedAt: new Date().toISOString(),
  };
}

// =============================================================================
// DEFAULT TEMPLATES
// =============================================================================

/**
 * Create the default report templates.
 */
function createDefaultTemplates(): ReportTemplate[] {
  const now = new Date().toISOString();

  return [
    // -------------------------------------------------------------------------
    // EXECUTIVE OVERVIEW TEMPLATE
    // -------------------------------------------------------------------------
    {
      id: "template-executive-overview",
      name: "Executive Overview",
      description:
        "High-level summary of key performance indicators across traffic, conversions, and revenue",
      metrics: [
        { metricId: "uniqueVisitors", order: 1, width: "third", chartType: "area" },
        { metricId: "totalConversions", order: 2, width: "third", chartType: "bar" },
        { metricId: "totalRevenue", order: 3, width: "third", chartType: "area" },
        { metricId: "conversionRate", order: 4, width: "half", chartType: "line" },
        { metricId: "overallROI", order: 5, width: "half", chartType: "line" },
        { metricId: "avgOrderValue", order: 6, width: "third" },
        { metricId: "cac", order: 7, width: "third" },
        { metricId: "ltv", order: 8, width: "third" },
      ],
      createdAt: daysAgo(90) + "T00:00:00.000Z",
      updatedAt: now,
      createdBy: "system",
      isDefault: true,
    },

    // -------------------------------------------------------------------------
    // TRAFFIC & ENGAGEMENT TEMPLATE
    // -------------------------------------------------------------------------
    {
      id: "template-traffic-engagement",
      name: "Traffic & Engagement",
      description:
        "Detailed analysis of website traffic patterns and user engagement metrics",
      metrics: [
        { metricId: "pageViews", order: 1, width: "half", chartType: "area" },
        { metricId: "sessions", order: 2, width: "half", chartType: "area" },
        { metricId: "uniqueVisitors", order: 3, width: "half", chartType: "line" },
        { metricId: "bounceRate", order: 4, width: "half", chartType: "line" },
        { metricId: "avgSessionDuration", order: 5, width: "third" },
        { metricId: "timeOnPage", order: 6, width: "third" },
        { metricId: "scrollDepth", order: 7, width: "third" },
        { metricId: "clickThroughRate", order: 8, width: "half", chartType: "bar" },
        { metricId: "socialShares", order: 9, width: "half", chartType: "bar" },
      ],
      createdAt: daysAgo(90) + "T00:00:00.000Z",
      updatedAt: now,
      createdBy: "system",
      isDefault: true,
    },

    // -------------------------------------------------------------------------
    // CONVERSION FUNNEL TEMPLATE
    // -------------------------------------------------------------------------
    {
      id: "template-conversion-funnel",
      name: "Conversion Funnel",
      description:
        "Track conversion performance from visitor to customer with abandonment analysis",
      metrics: [
        { metricId: "sessions", order: 1, width: "third" },
        { metricId: "signups", order: 2, width: "third" },
        { metricId: "purchases", order: 3, width: "third" },
        { metricId: "conversionRate", order: 4, width: "full", chartType: "line" },
        { metricId: "cartAbandonment", order: 5, width: "half", chartType: "bar" },
        { metricId: "totalConversions", order: 6, width: "half", chartType: "bar" },
        { metricId: "avgOrderValue", order: 7, width: "half" },
        { metricId: "revenuePerVisitor", order: 8, width: "half" },
      ],
      createdAt: daysAgo(60) + "T00:00:00.000Z",
      updatedAt: now,
      createdBy: "system",
      isDefault: true,
    },

    // -------------------------------------------------------------------------
    // REVENUE & ROI TEMPLATE
    // -------------------------------------------------------------------------
    {
      id: "template-revenue-roi",
      name: "Revenue & ROI Analysis",
      description:
        "Comprehensive revenue tracking with return on investment and attribution metrics",
      metrics: [
        { metricId: "totalRevenue", order: 1, width: "half", chartType: "area" },
        { metricId: "overallROI", order: 2, width: "half", chartType: "line" },
        { metricId: "roas", order: 3, width: "third" },
        { metricId: "cac", order: 4, width: "third" },
        { metricId: "ltv", order: 5, width: "third" },
        { metricId: "paybackPeriod", order: 6, width: "third" },
        { metricId: "recurringRevenue", order: 7, width: "third" },
        { metricId: "refunds", order: 8, width: "third" },
        { metricId: "firstTouch", order: 9, width: "half", chartType: "pie" },
        { metricId: "lastTouch", order: 10, width: "half", chartType: "pie" },
      ],
      createdAt: daysAgo(45) + "T00:00:00.000Z",
      updatedAt: now,
      createdBy: "system",
      isDefault: true,
    },
  ];
}

/**
 * Generate complete mock report builder data.
 */
function getMockReportBuilderData(): ReportBuilderData {
  const availableMetrics = getMetricDefinitions();
  const templates = createDefaultTemplates();

  // Generate a current report using the first template
  const currentReport = templates[0] ? generateReportData(templates[0]) : undefined;

  return {
    availableMetrics,
    templates,
    currentReport,
  };
}

// =============================================================================
// MOCK DATA CACHE (globalThis pattern for hot reload resilience)
// =============================================================================

/**
 * Global cache interface for hot reload resilience.
 * Using globalThis prevents cache reset during Turbopack hot reloads.
 * @see Fixes & Lessons Learned: "Turbopack Hot Reload Loses In-Memory State"
 */
interface ReportBuilderMockDataCache {
  __reportBuilderMockDataCache?: ReportBuilderData;
}

const globalCache = globalThis as unknown as ReportBuilderMockDataCache;

/**
 * Get cached report builder mock data. Returns cached version with fresh timestamp.
 * Uses globalThis for hot reload resilience.
 */
export function getCachedReportBuilderMockData(): ReportBuilderData {
  if (!globalCache.__reportBuilderMockDataCache) {
    globalCache.__reportBuilderMockDataCache = getMockReportBuilderData();
  }

  // Return with fresh timestamp on current report
  const cached = globalCache.__reportBuilderMockDataCache;
  return {
    ...cached,
    currentReport: cached.currentReport
      ? {
          ...cached.currentReport,
          generatedAt: new Date().toISOString(),
        }
      : undefined,
  };
}

/**
 * Get individual mock data generators for testing purposes.
 */
export const reportBuilderMockGenerators = {
  getMetricDefinitions,
  generateDataPoint,
  generateReportData,
  generateTrend,
  createDefaultTemplates,
};
