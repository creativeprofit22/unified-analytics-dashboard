# Unit Economics Metrics

## Overview

Unit economics measure the profitability and efficiency of acquiring and retaining customers. These metrics determine long-term business viability.

## Metrics

### Customer Acquisition Cost (CAC)

| Property | Value |
|----------|-------|
| **Definition** | Total cost to acquire one customer |
| **Formula** | `(marketing_spend + sales_spend) / new_customers` |
| **Data Source** | Ad platforms, CRM, Accounting |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card, Trend line, Breakdown by channel |
| **Importance** | Must be significantly less than LTV for sustainability |

### CAC by Channel

| Property | Value |
|----------|-------|
| **Definition** | Acquisition cost segmented by marketing channel |
| **Formula** | `channel_spend / customers_from_channel` |
| **Data Source** | Ad platforms, Attribution data |
| **Update Frequency** | Monthly |
| **Visualization** | Bar chart, Table |

### CAC Payback Period

| Property | Value |
|----------|-------|
| **Definition** | Months to recover acquisition cost |
| **Formula** | `CAC / monthly_gross_margin_per_customer` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card |
| **Benchmarks** | < 12 months ideal, 12-18 acceptable, > 18 concerning |

### Lifetime Value (LTV)

| Property | Value |
|----------|-------|
| **Definition** | Total revenue expected from a customer |
| **Formula** | `ARPU × gross_margin × (1 / churn_rate)` or `ARPU × avg_customer_lifespan` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card, Trend line, By segment |

### LTV by Cohort

| Property | Value |
|----------|-------|
| **Definition** | LTV segmented by signup period |
| **Formula** | Track cumulative revenue per cohort over time |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Line chart (multiple cohorts) |

### LTV by Channel

| Property | Value |
|----------|-------|
| **Definition** | LTV segmented by acquisition source |
| **Formula** | Calculate LTV for customers from each channel |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Bar chart, Table |

### LTV:CAC Ratio

| Property | Value |
|----------|-------|
| **Definition** | Return on customer acquisition investment |
| **Formula** | `LTV / CAC` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card, Gauge |
| **Benchmarks** | < 1:1 losing money, 1-3:1 break-even, 3-5:1 healthy, > 5:1 excellent (or under-investing in growth) |

### LTV:CAC by Channel

| Property | Value |
|----------|-------|
| **Definition** | ROI efficiency by acquisition channel |
| **Formula** | `LTV_channel / CAC_channel` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Bar chart, Table |

### Gross Margin

| Property | Value |
|----------|-------|
| **Definition** | Revenue minus cost of goods sold |
| **Formula** | `(revenue - COGS) / revenue × 100` |
| **Data Source** | Accounting system |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card, Trend line |
| **Benchmarks** | SaaS: 70-80%, E-commerce: 30-50% |

### Gross Margin per Customer

| Property | Value |
|----------|-------|
| **Definition** | Average gross profit per customer |
| **Formula** | `total_gross_margin / active_customers` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card |

### ARPU (Average Revenue Per User)

| Property | Value |
|----------|-------|
| **Definition** | Revenue per user (including free users) |
| **Formula** | `total_revenue / total_users` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card, Trend line |

### ARPPU (Average Revenue Per Paying User)

| Property | Value |
|----------|-------|
| **Definition** | Revenue per paying customer only |
| **Formula** | `total_revenue / paying_users` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card, Trend line |

### ARPU Growth Rate

| Property | Value |
|----------|-------|
| **Definition** | Period-over-period ARPU change |
| **Formula** | `(current_arpu - previous_arpu) / previous_arpu × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card with trend indicator |

### Contribution Margin

| Property | Value |
|----------|-------|
| **Definition** | Revenue minus all variable costs |
| **Formula** | `(revenue - COGS - variable_costs) / revenue × 100` |
| **Data Source** | Accounting system |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card |

### Net Revenue Retention (NRR)

| Property | Value |
|----------|-------|
| **Definition** | Revenue retained from existing customers including expansion |
| **Formula** | `(starting_mrr + expansion - contraction - churn) / starting_mrr × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card, Trend line |
| **Benchmarks** | < 90% concerning, 90-100% okay, 100-110% good, > 110% excellent |

### Gross Revenue Retention (GRR)

| Property | Value |
|----------|-------|
| **Definition** | Revenue retained without counting expansion |
| **Formula** | `(starting_mrr - contraction - churn) / starting_mrr × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card |
| **Max** | 100% (can't exceed starting revenue) |

### Customer Concentration

| Property | Value |
|----------|-------|
| **Definition** | Revenue dependency on top customers |
| **Formula** | `top_10_customer_revenue / total_revenue × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card, Pareto chart |
| **Benchmarks** | < 20% healthy, > 40% risky |

## Dashboard Component

```typescript
interface UnitEconomicsMetrics {
  cac: number;
  cacByChannel: Record<string, number>;
  cacPaybackPeriod: number; // months
  ltv: number;
  ltvByCohort: Array<{
    cohort: string;
    months: number[];  // cumulative LTV by month
  }>;
  ltvByChannel: Record<string, number>;
  ltvCacRatio: number;
  ltvCacByChannel: Record<string, number>;
  grossMargin: number;
  grossMarginPerCustomer: number;
  arpu: number;
  arppu: number;
  arpuGrowthRate: number;
  contributionMargin: number;
  nrr: number;
  grr: number;
  customerConcentration: {
    top10Percent: number;
    top20Percent: number;
  };
}
```

## API Endpoint

```
GET /api/analytics/unit-economics
  ?period=2026-01
  &breakdown=channel|cohort

GET /api/analytics/ltv
  ?cohort_start=2025-06
  &cohort_end=2025-12
```

## Mock Data Structure

```typescript
export const mockUnitEconomicsData: UnitEconomicsMetrics = {
  cac: 127,
  cacByChannel: {
    'Google Ads': 98,
    'Facebook Ads': 142,
    'Organic': 45,
    'Referral': 32,
    'Content': 67,
  },
  cacPaybackPeriod: 4.2,
  ltv: 712,
  ltvCacRatio: 5.6,
  ltvCacByChannel: {
    'Google Ads': 7.3,
    'Facebook Ads': 4.1,
    'Organic': 12.8,
    'Referral': 18.4,
    'Content': 9.2,
  },
  grossMargin: 72.4,
  grossMarginPerCustomer: 36.20,
  arpu: 42.50,
  arppu: 49.90,
  arpuGrowthRate: 3.2,
  contributionMargin: 58.3,
  nrr: 108.4,
  grr: 94.2,
  customerConcentration: {
    top10Percent: 28,
    top20Percent: 45,
  },
};
```

## LTV:CAC Visualization

```
LTV:CAC Ratio by Channel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Referral     18.4x  ████████████████████████████
Organic      12.8x  ████████████████████
Content       9.2x  ██████████████
Google Ads    7.3x  ███████████
Facebook      4.1x  ██████
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Target: 3x+         ↑ Healthy threshold
```

## Key Relationships

```
                    ┌─────────────┐
                    │   Revenue   │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │   ARPU    │    │    LTV    │    │   ARPPU   │
   └─────┬─────┘    └─────┬─────┘    └───────────┘
         │                │
         │        ┌───────┴───────┐
         │        │               │
         ▼        ▼               ▼
   ┌───────────────────┐   ┌───────────┐
   │    LTV:CAC Ratio  │   │    CAC    │
   └─────────┬─────────┘   └───────────┘
             │
             ▼
   ┌───────────────────┐
   │  Payback Period   │
   └───────────────────┘
```
