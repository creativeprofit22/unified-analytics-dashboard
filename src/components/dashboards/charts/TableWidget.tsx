"use client";

import type { ReactNode } from "react";
import { DataTable, type Column } from "@/components/dashboard/shared/DataTable";
import type { Widget, DataSourceCategory, TableOptions } from "@/types/custom-dashboards";

interface TableWidgetProps {
  widget: Widget;
}

// Generic table row type
type TableRow = Record<string, string | number>;

/**
 * Default column definitions by data source category.
 */
const DEFAULT_COLUMNS: Record<DataSourceCategory, TableOptions["columns"]> = {
  traffic: [
    { key: "page", label: "Page", format: "text" },
    { key: "sessions", label: "Sessions", format: "number" },
    { key: "bounces", label: "Bounces", format: "number" },
    { key: "avgTime", label: "Avg Time", format: "text" },
  ],
  seo: [
    { key: "keyword", label: "Keyword", format: "text" },
    { key: "position", label: "Position", format: "number" },
    { key: "volume", label: "Volume", format: "number" },
    { key: "ctr", label: "CTR", format: "percent" },
  ],
  revenue: [
    { key: "product", label: "Product", format: "text" },
    { key: "revenue", label: "Revenue", format: "currency" },
    { key: "orders", label: "Orders", format: "number" },
    { key: "aov", label: "AOV", format: "currency" },
  ],
  conversions: [
    { key: "funnel", label: "Funnel Step", format: "text" },
    { key: "visitors", label: "Visitors", format: "number" },
    { key: "conversions", label: "Conversions", format: "number" },
    { key: "rate", label: "Conv. Rate", format: "percent" },
  ],
  subscriptions: [
    { key: "plan", label: "Plan", format: "text" },
    { key: "subscribers", label: "Subscribers", format: "number" },
    { key: "mrr", label: "MRR", format: "currency" },
    { key: "churn", label: "Churn", format: "percent" },
  ],
  payments: [
    { key: "method", label: "Payment Method", format: "text" },
    { key: "transactions", label: "Transactions", format: "number" },
    { key: "amount", label: "Amount", format: "currency" },
    { key: "fees", label: "Fees", format: "currency" },
  ],
  unitEconomics: [
    { key: "metric", label: "Metric", format: "text" },
    { key: "current", label: "Current", format: "currency" },
    { key: "previous", label: "Previous", format: "currency" },
    { key: "change", label: "Change", format: "percent" },
  ],
  demographics: [
    { key: "segment", label: "Segment", format: "text" },
    { key: "users", label: "Users", format: "number" },
    { key: "share", label: "Share", format: "percent" },
    { key: "growth", label: "Growth", format: "percent" },
  ],
  segmentation: [
    { key: "segment", label: "Segment", format: "text" },
    { key: "count", label: "Count", format: "number" },
    { key: "value", label: "Value", format: "currency" },
    { key: "retention", label: "Retention", format: "percent" },
  ],
  campaigns: [
    { key: "campaign", label: "Campaign", format: "text" },
    { key: "impressions", label: "Impressions", format: "number" },
    { key: "clicks", label: "Clicks", format: "number" },
    { key: "spend", label: "Spend", format: "currency" },
  ],
  predictions: [
    { key: "period", label: "Period", format: "text" },
    { key: "forecast", label: "Forecast", format: "currency" },
    { key: "confidence", label: "Confidence", format: "percent" },
    { key: "variance", label: "Variance", format: "percent" },
  ],
};

/**
 * Mock data generators by data source category.
 */
const MOCK_DATA_GENERATORS: Record<DataSourceCategory, () => TableRow[]> = {
  traffic: () => [
    { id: "1", page: "/home", sessions: 12453, bounces: 3214, avgTime: "2m 34s" },
    { id: "2", page: "/products", sessions: 8721, bounces: 2103, avgTime: "3m 12s" },
    { id: "3", page: "/about", sessions: 4532, bounces: 1876, avgTime: "1m 45s" },
    { id: "4", page: "/blog", sessions: 6234, bounces: 2456, avgTime: "4m 21s" },
    { id: "5", page: "/contact", sessions: 2341, bounces: 987, avgTime: "1m 12s" },
    { id: "6", page: "/pricing", sessions: 5678, bounces: 1234, avgTime: "2m 56s" },
    { id: "7", page: "/features", sessions: 4321, bounces: 1567, avgTime: "3m 08s" },
  ],
  seo: () => [
    { id: "1", keyword: "analytics dashboard", position: 3, volume: 12400, ctr: 0.082 },
    { id: "2", keyword: "business metrics", position: 5, volume: 8900, ctr: 0.054 },
    { id: "3", keyword: "data visualization", position: 8, volume: 15200, ctr: 0.032 },
    { id: "4", keyword: "reporting tools", position: 2, volume: 6700, ctr: 0.112 },
    { id: "5", keyword: "KPI tracking", position: 4, volume: 4500, ctr: 0.067 },
    { id: "6", keyword: "real-time analytics", position: 6, volume: 9800, ctr: 0.045 },
  ],
  revenue: () => [
    { id: "1", product: "Pro Plan", revenue: 45230, orders: 312, aov: 145 },
    { id: "2", product: "Enterprise", revenue: 89450, orders: 89, aov: 1005 },
    { id: "3", product: "Basic Plan", revenue: 23120, orders: 578, aov: 40 },
    { id: "4", product: "Add-ons", revenue: 12340, orders: 234, aov: 53 },
    { id: "5", product: "Consulting", revenue: 34500, orders: 23, aov: 1500 },
  ],
  conversions: () => [
    { id: "1", funnel: "Landing Page", visitors: 50000, conversions: 12500, rate: 0.25 },
    { id: "2", funnel: "Sign Up", visitors: 12500, conversions: 5000, rate: 0.4 },
    { id: "3", funnel: "Activation", visitors: 5000, conversions: 2500, rate: 0.5 },
    { id: "4", funnel: "Purchase", visitors: 2500, conversions: 750, rate: 0.3 },
    { id: "5", funnel: "Retention", visitors: 750, conversions: 450, rate: 0.6 },
  ],
  subscriptions: () => [
    { id: "1", plan: "Basic", subscribers: 2345, mrr: 46900, churn: 0.045 },
    { id: "2", plan: "Pro", subscribers: 1234, mrr: 61700, churn: 0.028 },
    { id: "3", plan: "Enterprise", subscribers: 89, mrr: 89000, churn: 0.012 },
    { id: "4", plan: "Trial", subscribers: 567, mrr: 0, churn: 0.35 },
    { id: "5", plan: "Legacy", subscribers: 234, mrr: 11700, churn: 0.02 },
  ],
  payments: () => [
    { id: "1", method: "Credit Card", transactions: 4532, amount: 234560, fees: 6802 },
    { id: "2", method: "PayPal", transactions: 1234, amount: 67890, fees: 2376 },
    { id: "3", method: "Bank Transfer", transactions: 456, amount: 89000, fees: 445 },
    { id: "4", method: "Crypto", transactions: 123, amount: 34500, fees: 172 },
    { id: "5", method: "Apple Pay", transactions: 789, amount: 45670, fees: 1370 },
  ],
  unitEconomics: () => [
    { id: "1", metric: "CAC", current: 125, previous: 142, change: -0.12 },
    { id: "2", metric: "LTV", current: 890, previous: 823, change: 0.08 },
    { id: "3", metric: "ARPU", current: 67, previous: 62, change: 0.08 },
    { id: "4", metric: "MRR", current: 197600, previous: 178200, change: 0.11 },
    { id: "5", metric: "Churn Rate", current: 0.028, previous: 0.032, change: -0.125 },
  ],
  demographics: () => [
    { id: "1", segment: "18-24", users: 12340, share: 0.18, growth: 0.12 },
    { id: "2", segment: "25-34", users: 23450, share: 0.34, growth: 0.08 },
    { id: "3", segment: "35-44", users: 18760, share: 0.27, growth: 0.05 },
    { id: "4", segment: "45-54", users: 9870, share: 0.14, growth: 0.02 },
    { id: "5", segment: "55+", users: 4560, share: 0.07, growth: -0.03 },
  ],
  segmentation: () => [
    { id: "1", segment: "Power Users", count: 2345, value: 234500, retention: 0.92 },
    { id: "2", segment: "Regular Users", count: 12340, value: 567800, retention: 0.76 },
    { id: "3", segment: "New Users", count: 5670, value: 123400, retention: 0.45 },
    { id: "4", segment: "At Risk", count: 1234, value: 45600, retention: 0.28 },
    { id: "5", segment: "Churned", count: 890, value: 12300, retention: 0.05 },
  ],
  campaigns: () => [
    { id: "1", campaign: "Summer Sale", impressions: 450000, clicks: 13500, spend: 4500 },
    { id: "2", campaign: "Product Launch", impressions: 320000, clicks: 12800, spend: 6400 },
    { id: "3", campaign: "Retargeting", impressions: 180000, clicks: 9000, spend: 2700 },
    { id: "4", campaign: "Brand Awareness", impressions: 890000, clicks: 17800, spend: 8900 },
    { id: "5", campaign: "Email Drip", impressions: 67000, clicks: 8040, spend: 670 },
  ],
  predictions: () => [
    { id: "1", period: "Week 1", forecast: 45230, confidence: 0.92, variance: 0.05 },
    { id: "2", period: "Week 2", forecast: 47890, confidence: 0.88, variance: 0.08 },
    { id: "3", period: "Week 3", forecast: 51200, confidence: 0.82, variance: 0.12 },
    { id: "4", period: "Week 4", forecast: 49800, confidence: 0.75, variance: 0.18 },
    { id: "5", period: "Month 2", forecast: 198500, confidence: 0.65, variance: 0.25 },
  ],
};

/**
 * Generates mock table data based on the data source.
 */
function generateMockTableData(
  source: DataSourceCategory,
  _field: string,
  tableOptions?: TableOptions
): TableRow[] {
  const generator = MOCK_DATA_GENERATORS[source];
  const data = generator ? generator() : [];

  // Apply page size limit if specified
  if (tableOptions?.pageSize) {
    return data.slice(0, tableOptions.pageSize);
  }

  return data;
}

/**
 * Formats a value based on the specified format type.
 */
function formatValue(
  value: string | number,
  format?: "number" | "currency" | "percent" | "text" | "date"
): ReactNode {
  if (value === null || value === undefined) {
    return "-";
  }

  switch (format) {
    case "currency":
      return typeof value === "number"
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)
        : value;

    case "percent":
      return typeof value === "number"
        ? `${(value * 100).toFixed(1)}%`
        : value;

    case "number":
      return typeof value === "number"
        ? new Intl.NumberFormat("en-US").format(value)
        : value;

    case "date":
      if (typeof value === "string") {
        return new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      return value;

    case "text":
    default:
      return String(value);
  }
}

/**
 * Creates DataTable columns from TableOptions column definitions or defaults.
 */
function createColumns(
  tableOptions: TableOptions | undefined,
  source: DataSourceCategory
): Column<TableRow>[] {
  const columnDefs = tableOptions?.columns ?? DEFAULT_COLUMNS[source] ?? [];

  return columnDefs.map((col, index) => ({
    key: col.key,
    header: col.label,
    align: index === 0 ? "left" : ("right" as const),
    render: (item: TableRow) => formatValue(item[col.key] ?? "", col.format),
  }));
}

/**
 * Table widget component that wraps DataTable with custom dashboard configuration.
 */
export function TableWidget({ widget }: TableWidgetProps) {
  const { dataBinding, tableOptions } = widget.config;
  const source = dataBinding.source;
  const field = dataBinding.field;

  // Generate mock data
  const data = generateMockTableData(source, field, tableOptions);

  // Create columns from tableOptions or defaults
  const columns = createColumns(tableOptions, source);

  // Apply page size limit
  const limit = tableOptions?.pageSize ?? 10;

  return (
    <div className="h-full w-full overflow-hidden">
      <DataTable<TableRow>
        data={data}
        columns={columns}
        keyField="id"
        limit={limit}
      />
    </div>
  );
}

export default TableWidget;
