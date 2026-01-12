# Conversions & Funnel Metrics

## Overview

Conversion metrics track how effectively visitors complete desired actions. Funnel analysis reveals where users drop off in multi-step processes.

## Metrics

### Conversion Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of visitors who complete the primary goal |
| **Formula** | `conversions / visitors × 100` |
| **Data Source** | Google Analytics 4, Custom events |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Trend line |
| **Benchmarks** | E-commerce: 2-3%, SaaS: 3-5%, Lead gen: 5-10% |

### Conversion Rate by Source

| Property | Value |
|----------|-------|
| **Definition** | Conversion rate segmented by traffic source |
| **Formula** | `conversions_from_source / visitors_from_source × 100` |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | 15 min |
| **Visualization** | Bar chart, Table |

### Micro-Conversions

| Property | Value |
|----------|-------|
| **Definition** | Smaller actions that indicate intent |
| **Examples** | Email signup, account created, PDF download, video watched, pricing page viewed |
| **Formula** | Count and rate per micro-conversion type |
| **Data Source** | Custom events |
| **Update Frequency** | Real-time |
| **Visualization** | Stat cards, Funnel indicators |

### Add to Cart Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of visitors who add an item to cart |
| **Formula** | `add_to_cart_events / product_page_views × 100` |
| **Data Source** | E-commerce tracking, Custom events |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Trend line |
| **Benchmarks** | 8-12% is typical for e-commerce |

### Cart Abandonment Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of carts that don't proceed to checkout |
| **Formula** | `(carts_created - checkouts_started) / carts_created × 100` |
| **Data Source** | E-commerce tracking |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card (inverted - lower is better), Trend line |
| **Benchmarks** | 60-80% is typical (unfortunately) |

### Checkout Abandonment Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of started checkouts that don't complete |
| **Formula** | `(checkouts_started - purchases) / checkouts_started × 100` |
| **Data Source** | E-commerce tracking |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Funnel step |
| **Benchmarks** | 20-40% is typical |

### Checkout Completion Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of started checkouts that complete |
| **Formula** | `purchases / checkouts_started × 100` |
| **Data Source** | E-commerce tracking |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

### Funnel Drop-off by Step

| Property | Value |
|----------|-------|
| **Definition** | User loss at each stage of a multi-step process |
| **Formula** | `(step_n_users - step_n+1_users) / step_n_users × 100` |
| **Data Source** | Custom funnel events |
| **Update Frequency** | Real-time |
| **Visualization** | Funnel chart, Step-by-step bars |

### Time to Convert

| Property | Value |
|----------|-------|
| **Definition** | Days from first visit to purchase/signup |
| **Formula** | `conversion_date - first_visit_date` (distribution) |
| **Data Source** | GA4, CRM |
| **Update Frequency** | Daily |
| **Visualization** | Histogram, Stat card (median) |

### Assisted Conversions

| Property | Value |
|----------|-------|
| **Definition** | Conversions where a channel assisted but wasn't last-click |
| **Formula** | Multi-touch attribution model |
| **Data Source** | GA4, Attribution modeling |
| **Update Frequency** | Daily |
| **Visualization** | Table (channel, assisted, last-click, assisted/last ratio) |

### Goal Completions by Goal

| Property | Value |
|----------|-------|
| **Definition** | Breakdown of different conversion types |
| **Examples** | Purchase, Signup, Demo request, Contact form, Newsletter |
| **Data Source** | GA4 conversions, Custom events |
| **Update Frequency** | Real-time |
| **Visualization** | Table, Comparison bars |

## Dashboard Component

```typescript
interface ConversionMetrics {
  conversionRate: number;
  totalConversions: number;
  conversionsBySource: Record<string, {
    visitors: number;
    conversions: number;
    rate: number;
  }>;
  microConversions: Array<{
    name: string;
    count: number;
    rate: number;
  }>;
  addToCartRate: number;
  cartAbandonmentRate: number;
  checkoutAbandonmentRate: number;
  checkoutCompletionRate: number;
  funnel: Array<{
    step: string;
    users: number;
    dropOff: number;
    dropOffRate: number;
  }>;
  timeToConvert: {
    median: number;
    distribution: Record<string, number>; // "same day", "1-3 days", "4-7 days", etc.
  };
  assistedConversions: Array<{
    channel: string;
    assisted: number;
    lastClick: number;
    ratio: number;
  }>;
}
```

## API Endpoint

```
GET /api/analytics/conversions
  ?start=2026-01-01
  &end=2026-01-12
  &goal=purchase|signup|all

GET /api/analytics/funnel
  ?steps=visit,product_view,add_to_cart,checkout,purchase
  &start=2026-01-01
  &end=2026-01-12
```

## Mock Data Structure

```typescript
export const mockConversionData: ConversionMetrics = {
  conversionRate: 3.42,
  totalConversions: 847,
  addToCartRate: 9.7,
  cartAbandonmentRate: 68.4,
  checkoutAbandonmentRate: 24.2,
  checkoutCompletionRate: 75.8,
  funnel: [
    { step: 'Visit', users: 12847, dropOff: 0, dropOffRate: 0 },
    { step: 'Product View', users: 7234, dropOff: 5613, dropOffRate: 43.7 },
    { step: 'Add to Cart', users: 1246, dropOff: 5988, dropOffRate: 82.8 },
    { step: 'Checkout', users: 394, dropOff: 852, dropOffRate: 68.4 },
    { step: 'Purchase', users: 299, dropOff: 95, dropOffRate: 24.1 },
  ],
  timeToConvert: {
    median: 2.3,
    distribution: {
      'Same day': 34,
      '1-3 days': 28,
      '4-7 days': 18,
      '8-14 days': 12,
      '15-30 days': 6,
      '30+ days': 2,
    }
  },
  // ... etc
};
```

## Funnel Visualization

```
┌────────────────────────────────────────┐
│ Visit                      12,847      │ 100%
└────────────────────────────────────────┘
         ↓ 43.7% drop-off
┌─────────────────────────────────┐
│ Product View           7,234    │ 56.3%
└─────────────────────────────────┘
         ↓ 82.8% drop-off
┌───────────────┐
│ Add to Cart   │ 1,246   9.7%
└───────────────┘
         ↓ 68.4% drop-off
┌───────┐
│ Check │ 394   3.1%
└───────┘
         ↓ 24.1% drop-off
┌────┐
│ ✓  │ 299   2.3%
└────┘
```
