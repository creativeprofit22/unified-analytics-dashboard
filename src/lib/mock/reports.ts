/**
 * Mock Data Generators for Report Builder API
 *
 * This module contains mock data for the report builder feature,
 * generating realistic metric definitions, report templates, and report data.
 */

import type {
  MetricDefinition,
  MetricCategory,
  ReportTemplate,
  ReportMetric,
  ReportData,
  ReportDataPoint,
  ReportBuilderData,
} from "@/types/report-builder";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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
 * Generate an ISO date string for N days ago.
 */
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * Generate a UUID-like string.
 */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// =============================================================================
// AVAILABLE METRICS
// =============================================================================

/**
 * All available metrics that can be added to reports.
 */
const AVAILABLE_METRICS: MetricDefinition[] = [
  // Traffic Metrics
  {
    id: "total-visitors",
    name: "Total Visitors",
    category: "traffic",
    description: "Total number of unique visitors to your site",
    unit: "number",
    aggregation: "sum",
  },
  {
    id: "page-views",
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
    description: "Total number of user sessions",
    unit: "number",
    aggregation: "sum",
  },
  {
    id: "bounce-rate",
    name: "Bounce Rate",
    category: "traffic",
    description: "Percentage of single-page sessions",
    unit: "percentage",
    aggregation: "average",
  },
  {
    id: "avg-session-duration",
    name: "Avg. Session Duration",
    category: "traffic",
    description: "Average time spent per session in seconds",
    unit: "duration",
    aggregation: "average",
  },
  // Conversion Metrics
  {
    id: "conversion-rate",
    name: "Conversion Rate",
    category: "conversions",
    description: "Percentage of visitors who complete a goal",
    unit: "percentage",
    aggregation: "average",
  },
  {
    id: "total-conversions",
    name: "Total Conversions",
    category: "conversions",
    description: "Total number of goal completions",
    unit: "number",
    aggregation: "sum",
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
    id: "trials-started",
    name: "Trials Started",
    category: "conversions",
    description: "Number of free trial activations",
    unit: "number",
    aggregation: "sum",
  },
  // Revenue Metrics
  {
    id: "total-revenue",
    name: "Total Revenue",
    category: "revenue",
    description: "Total revenue generated",
    unit: "currency",
    aggregation: "sum",
  },
  {
    id: "mrr",
    name: "Monthly Recurring Revenue",
    category: "revenue",
    description: "Total monthly recurring revenue from subscriptions",
    unit: "currency",
    aggregation: "latest",
  },
  {
    id: "arr",
    name: "Annual Recurring Revenue",
    category: "revenue",
    description: "Total annual recurring revenue",
    unit: "currency",
    aggregation: "latest",
  },
  {
    id: "arpu",
    name: "Average Revenue Per User",
    category: "revenue",
    description: "Average revenue generated per user",
    unit: "currency",
    aggregation: "average",
  },
  {
    id: "ltv",
    name: "Customer Lifetime Value",
    category: "revenue",
    description: "Predicted total revenue from a customer",
    unit: "currency",
    aggregation: "average",
  },
  // Engagement Metrics
  {
    id: "dau",
    name: "Daily Active Users",
    category: "engagement",
    description: "Number of unique users active daily",
    unit: "number",
    aggregation: "average",
  },
  {
    id: "mau",
    name: "Monthly Active Users",
    category: "engagement",
    description: "Number of unique users active monthly",
    unit: "number",
    aggregation: "latest",
  },
  {
    id: "retention-rate",
    name: "Retention Rate",
    category: "engagement",
    description: "Percentage of users who return after first visit",
    unit: "percentage",
    aggregation: "average",
  },
  {
    id: "churn-rate",
    name: "Churn Rate",
    category: "engagement",
    description: "Percentage of customers who cancel",
    unit: "percentage",
    aggregation: "average",
  },
  // Attribution Metrics
  {
    id: "first-touch-conversions",
    name: "First-Touch Conversions",
    category: "attribution",
    description: "Conversions attributed to first touchpoint",
    unit: "number",
    aggregation: "sum",
  },
  {
    id: "last-touch-conversions",
    name: "Last-Touch Conversions",
    category: "attribution",
    description: "Conversions attributed to last touchpoint",
    unit: "number",
    aggregation: "sum",
  },
  {
    id: "multi-touch-conversions",
    name: "Multi-Touch Conversions",
    category: "attribution",
    description: "Conversions with multiple touchpoints",
    unit: "number",
    aggregation: "sum",
  },
  // ROI Metrics
  {
    id: "overall-roi",
    name: "Overall ROI",
    category: "roi",
    description: "Return on investment across all channels",
    unit: "percentage",
    aggregation: "average",
  },
  {
    id: "roas",
    name: "Return on Ad Spend",
    category: "roi",
    description: "Revenue generated per dollar of ad spend",
    unit: "number",
    aggregation: "average",
  },
  {
    id: "cac",
    name: "Customer Acquisition Cost",
    category: "roi",
    description: "Average cost to acquire a customer",
    unit: "currency",
    aggregation: "average",
  },
  {
    id: "ltv-cac-ratio",
    name: "LTV:CAC Ratio",
    category: "roi",
    description: "Lifetime value to acquisition cost ratio",
    unit: "number",
    aggregation: "average",
  },
];

// =============================================================================
// DEFAULT TEMPLATES
// =============================================================================

/**
 * Default report templates provided by the system.
 */
const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: "executive-summary",
    name: "Executive Summary",
    description: "High-level overview of key business metrics for leadership",
    metrics: [
      { metricId: "total-revenue", order: 1, width: "third", chartType: "line" },
      { metricId: "mrr", order: 2, width: "third", chartType: "line" },
      { metricId: "total-visitors", order: 3, width: "third", chartType: "bar" },
      { metricId: "conversion-rate", order: 4, width: "half", chartType: "area" },
      { metricId: "overall-roi", order: 5, width: "half", chartType: "line" },
    ],
    createdAt: daysAgo(90),
    updatedAt: daysAgo(30),
    createdBy: "system",
    isDefault: true,
  },
  {
    id: "marketing-performance",
    name: "Marketing Performance",
    description: "Comprehensive view of marketing channel effectiveness",
    metrics: [
      { metricId: "total-visitors", order: 1, width: "half", chartType: "line" },
      { metricId: "sessions", order: 2, width: "half", chartType: "line" },
      { metricId: "conversion-rate", order: 3, width: "third", chartType: "area" },
      { metricId: "roas", order: 4, width: "third", chartType: "bar" },
      { metricId: "cac", order: 5, width: "third", chartType: "bar" },
      { metricId: "first-touch-conversions", order: 6, width: "full", chartType: "table" },
    ],
    createdAt: daysAgo(60),
    updatedAt: daysAgo(14),
    createdBy: "system",
    isDefault: true,
  },
  {
    id: "revenue-dashboard",
    name: "Revenue Dashboard",
    description: "Detailed revenue metrics and subscription analytics",
    metrics: [
      { metricId: "total-revenue", order: 1, width: "half", chartType: "line" },
      { metricId: "mrr", order: 2, width: "half", chartType: "line" },
      { metricId: "arr", order: 3, width: "third", chartType: "bar" },
      { metricId: "arpu", order: 4, width: "third", chartType: "bar" },
      { metricId: "ltv", order: 5, width: "third", chartType: "bar" },
      { metricId: "churn-rate", order: 6, width: "full", chartType: "area" },
    ],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(7),
    createdBy: "system",
    isDefault: true,
  },
  {
    id: "growth-metrics",
    name: "Growth Metrics",
    description: "Track user acquisition and engagement growth",
    metrics: [
      { metricId: "dau", order: 1, width: "half", chartType: "line" },
      { metricId: "mau", order: 2, width: "half", chartType: "line" },
      { metricId: "signups", order: 3, width: "third", chartType: "bar" },
      { metricId: "trials-started", order: 4, width: "third", chartType: "bar" },
      { metricId: "retention-rate", order: 5, width: "third", chartType: "area" },
    ],
    createdAt: daysAgo(30),
    updatedAt: daysAgo(3),
    createdBy: "system",
    isDefault: true,
  },
];

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

/**
 * Generate mock trend data for a metric.
 */
function generateTrendData(baseValue: number, volatility: number = 0.1): number[] {
  const trend: number[] = [];
  let current = baseValue;

  for (let i = 0; i < 7; i++) {
    const change = current * randomFloat(-volatility, volatility);
    current = Math.max(0, current + change);
    trend.push(Math.round(current * 100) / 100);
  }

  return trend;
}

/**
 * Generate a mock data point for a specific metric.
 */
function generateDataPoint(metricId: string): ReportDataPoint {
  const metric = AVAILABLE_METRICS.find((m) => m.id === metricId);
  if (!metric) {
    // Return a default data point for unknown metrics
    return {
      metricId,
      value: 0,
      trend: [0, 0, 0, 0, 0, 0, 0],
    };
  }

  let value: number;
  let volatility: number;

  // Generate appropriate values based on metric type
  switch (metric.unit) {
    case "percentage":
      value = randomFloat(1, 100);
      volatility = 0.05;
      break;
    case "currency":
      if (metricId === "mrr") {
        value = randomInRange(50000, 200000);
      } else if (metricId === "arr") {
        value = randomInRange(600000, 2400000);
      } else if (metricId === "total-revenue") {
        value = randomInRange(100000, 500000);
      } else if (metricId === "arpu") {
        value = randomFloat(50, 200);
      } else if (metricId === "ltv") {
        value = randomFloat(500, 2000);
      } else if (metricId === "cac") {
        value = randomFloat(50, 300);
      } else {
        value = randomFloat(1000, 50000);
      }
      volatility = 0.08;
      break;
    case "duration":
      value = randomInRange(120, 600); // seconds
      volatility = 0.1;
      break;
    default:
      if (metricId === "total-visitors" || metricId === "sessions") {
        value = randomInRange(10000, 100000);
      } else if (metricId === "page-views") {
        value = randomInRange(50000, 500000);
      } else if (metricId === "dau") {
        value = randomInRange(1000, 10000);
      } else if (metricId === "mau") {
        value = randomInRange(20000, 100000);
      } else if (metricId === "roas" || metricId === "ltv-cac-ratio") {
        value = randomFloat(1, 10);
      } else {
        value = randomInRange(100, 10000);
      }
      volatility = 0.12;
  }

  const trend = generateTrendData(value, volatility);
  const previousValue = trend[0] ?? value * randomFloat(0.9, 1.1);
  const change = value - previousValue;
  const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;

  return {
    metricId,
    value: Math.round(value * 100) / 100,
    previousValue: Math.round(previousValue * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    trend,
  };
}

/**
 * Generate report data for a template.
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

/**
 * Generate complete mock report builder data.
 */
function getMockReportBuilderData(): ReportBuilderData {
  // Clone default templates with fresh IDs for user templates
  const userTemplates: ReportTemplate[] = [
    {
      id: generateId(),
      name: "My Custom Report",
      description: "A custom report created by the user",
      metrics: [
        { metricId: "total-revenue", order: 1, width: "half", chartType: "line" },
        { metricId: "conversion-rate", order: 2, width: "half", chartType: "area" },
        { metricId: "cac", order: 3, width: "third", chartType: "bar" },
        { metricId: "ltv", order: 4, width: "third", chartType: "bar" },
        { metricId: "ltv-cac-ratio", order: 5, width: "third", chartType: "bar" },
      ],
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
      createdBy: "user@example.com",
      isDefault: false,
    },
  ];

  const allTemplates = [...DEFAULT_TEMPLATES, ...userTemplates];
  const defaultTemplate = DEFAULT_TEMPLATES[0];
  const currentReport = defaultTemplate ? generateReportData(defaultTemplate) : undefined;

  return {
    availableMetrics: AVAILABLE_METRICS,
    templates: allTemplates,
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
interface ReportsMockDataCache {
  __reportsMockDataCache?: ReportBuilderData;
  __reportsTemplatesCache?: ReportTemplate[];
}

const globalCache = globalThis as unknown as ReportsMockDataCache;

/**
 * Get cached report builder mock data.
 * Uses globalThis for hot reload resilience.
 */
export function getCachedReportBuilderMockData(): ReportBuilderData {
  if (!globalCache.__reportsMockDataCache) {
    globalCache.__reportsMockDataCache = getMockReportBuilderData();
  }
  return globalCache.__reportsMockDataCache;
}

/**
 * Get the templates from cache, allowing mutations.
 */
export function getTemplatesFromCache(): ReportTemplate[] {
  if (!globalCache.__reportsTemplatesCache) {
    const data = getCachedReportBuilderMockData();
    globalCache.__reportsTemplatesCache = [...data.templates];
  }
  return globalCache.__reportsTemplatesCache;
}

/**
 * Add a template to the cache.
 */
export function addTemplateToCache(template: ReportTemplate): void {
  const templates = getTemplatesFromCache();
  templates.push(template);
}

/**
 * Update a template in the cache.
 */
export function updateTemplateInCache(
  id: string,
  updates: Partial<ReportTemplate>
): ReportTemplate | null {
  const templates = getTemplatesFromCache();
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const existingTemplate = templates[index];
  if (!existingTemplate) return null;

  const updated: ReportTemplate = {
    ...existingTemplate,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  templates[index] = updated;
  return updated;
}

/**
 * Delete a template from the cache.
 */
export function deleteTemplateFromCache(id: string): boolean {
  const templates = getTemplatesFromCache();
  const index = templates.findIndex((t) => t.id === id);
  if (index === -1) return false;

  const template = templates[index];
  // Don't allow deleting default templates
  if (template?.isDefault) return false;

  templates.splice(index, 1);
  return true;
}

/**
 * Get a template by ID from cache.
 */
export function getTemplateById(id: string): ReportTemplate | null {
  const templates = getTemplatesFromCache();
  return templates.find((t) => t.id === id) ?? null;
}

/**
 * Generate report data for a template.
 */
export function generateReportDataForTemplate(
  templateId: string
): ReportData | null {
  const template = getTemplateById(templateId);
  if (!template) return null;
  return generateReportData(template);
}

/**
 * Generate a new unique ID for templates.
 */
export function generateTemplateId(): string {
  return generateId();
}

/**
 * Get available metrics.
 */
export function getAvailableMetrics(): MetricDefinition[] {
  return AVAILABLE_METRICS;
}

/**
 * Export generators for testing.
 */
export const reportsMockGenerators = {
  generateDataPoint,
  generateReportData,
  generateTrendData,
};
