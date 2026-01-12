# Revenue & Orders Metrics

## Overview

Revenue metrics track financial performance from transactions. These are critical for understanding business health and growth.

## Metrics

### Gross Revenue

| Property | Value |
|----------|-------|
| **Definition** | Total revenue before any deductions |
| **Formula** | `sum(order_totals)` |
| **Data Source** | Stripe, Payment processor, E-commerce platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Line chart, Area chart |

### Net Revenue

| Property | Value |
|----------|-------|
| **Definition** | Revenue after refunds, fees, taxes, and discounts |
| **Formula** | `gross_revenue - refunds - fees - taxes - discounts` |
| **Data Source** | Stripe, Accounting system |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Comparison with gross |

### Transactions / Orders

| Property | Value |
|----------|-------|
| **Definition** | Count of completed purchases |
| **Formula** | `count(orders where status = 'completed')` |
| **Data Source** | Stripe, E-commerce platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Line chart |

### Average Order Value (AOV)

| Property | Value |
|----------|-------|
| **Definition** | Mean value of each transaction |
| **Formula** | `gross_revenue / transaction_count` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Trend line |
| **Importance** | Critical for pricing strategy and upsell effectiveness |

### Median Order Value

| Property | Value |
|----------|-------|
| **Definition** | Middle value of all orders (less affected by outliers) |
| **Formula** | `median(order_values)` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Comparison with AOV |

### Units per Order

| Property | Value |
|----------|-------|
| **Definition** | Average number of items per transaction |
| **Formula** | `total_units_sold / transaction_count` |
| **Data Source** | E-commerce platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

### Revenue per Visitor (RPV)

| Property | Value |
|----------|-------|
| **Definition** | Average revenue generated per site visitor |
| **Formula** | `gross_revenue / unique_visitors` |
| **Data Source** | Calculated (revenue + analytics) |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Trend line |

### Revenue by Product

| Property | Value |
|----------|-------|
| **Definition** | Breakdown of revenue by individual product/SKU |
| **Formula** | Group revenue by product_id |
| **Data Source** | E-commerce platform |
| **Update Frequency** | Real-time |
| **Visualization** | Table, Bar chart |

### Revenue by Category

| Property | Value |
|----------|-------|
| **Definition** | Breakdown of revenue by product category |
| **Formula** | Group revenue by category |
| **Data Source** | E-commerce platform |
| **Update Frequency** | Real-time |
| **Visualization** | Pie chart, Treemap |

### Revenue by Channel

| Property | Value |
|----------|-------|
| **Definition** | Revenue attributed to marketing channels |
| **Formula** | Group revenue by traffic source/medium |
| **Data Source** | GA4 + Revenue data |
| **Update Frequency** | Daily |
| **Visualization** | Bar chart, Table |

### Refund Amount

| Property | Value |
|----------|-------|
| **Definition** | Total value of refunds issued |
| **Formula** | `sum(refund_amounts)` |
| **Data Source** | Stripe, E-commerce platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Trend line |

### Refund Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of orders that were refunded |
| **Formula** | `refunded_orders / total_orders × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |
| **Benchmarks** | < 2% excellent, 2-5% normal, > 5% needs attention |

### Return Rate (Physical Products)

| Property | Value |
|----------|-------|
| **Definition** | Percentage of physical items returned |
| **Formula** | `returned_items / sold_items × 100` |
| **Data Source** | Inventory/fulfillment system |
| **Update Frequency** | Daily |
| **Visualization** | Stat card |

### Discount Usage

| Property | Value |
|----------|-------|
| **Definition** | Orders using discount codes |
| **Formula** | `orders_with_discount / total_orders × 100` |
| **Data Source** | E-commerce platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Breakdown by code |

### Average Discount Value

| Property | Value |
|----------|-------|
| **Definition** | Mean discount amount per discounted order |
| **Formula** | `total_discounts / discounted_orders` |
| **Data Source** | E-commerce platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

### Revenue Growth Rate

| Property | Value |
|----------|-------|
| **Definition** | Period-over-period revenue change |
| **Formula** | `(current_period - previous_period) / previous_period × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Daily |
| **Visualization** | Stat card with trend indicator, Comparison chart |

## Dashboard Component

```typescript
interface RevenueMetrics {
  grossRevenue: number;
  netRevenue: number;
  transactions: number;
  aov: number;
  medianOrderValue: number;
  unitsPerOrder: number;
  revenuePerVisitor: number;
  revenueByProduct: Array<{
    productId: string;
    productName: string;
    revenue: number;
    units: number;
  }>;
  revenueByCategory: Record<string, number>;
  revenueByChannel: Record<string, number>;
  refundAmount: number;
  refundRate: number;
  returnRate: number;
  discountUsageRate: number;
  avgDiscountValue: number;
  revenueGrowth: {
    value: number;
    period: 'day' | 'week' | 'month';
  };
  revenueTrend: Array<{
    date: string;
    gross: number;
    net: number;
  }>;
}
```

## API Endpoint

```
GET /api/analytics/revenue
  ?start=2026-01-01
  &end=2026-01-12
  &granularity=daily|weekly|monthly
  &breakdown=product|category|channel
```

## Mock Data Structure

```typescript
export const mockRevenueData: RevenueMetrics = {
  grossRevenue: 142690,
  netRevenue: 128421,
  transactions: 847,
  aov: 168.47,
  medianOrderValue: 129.00,
  unitsPerOrder: 2.3,
  revenuePerVisitor: 11.10,
  refundAmount: 4230,
  refundRate: 2.9,
  returnRate: 4.2,
  discountUsageRate: 34.5,
  avgDiscountValue: 22.40,
  revenueGrowth: { value: 12.4, period: 'month' },
  revenueByCategory: {
    'Electronics': 52340,
    'Clothing': 38420,
    'Home & Garden': 28540,
    'Other': 23390,
  },
  revenueTrend: [
    { date: '2026-01-01', gross: 11234, net: 10112 },
    { date: '2026-01-02', gross: 12456, net: 11210 },
    // ...
  ],
  // ... etc
};
```
