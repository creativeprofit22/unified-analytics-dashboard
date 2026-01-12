# Subscriptions & Retention Metrics

## Overview

Subscription metrics track recurring revenue health. Retention metrics measure customer longevity and predict future revenue.

## Metrics

### Active Subscribers

| Property | Value |
|----------|-------|
| **Definition** | Current count of paying subscribers |
| **Formula** | `count(subscriptions where status = 'active')` |
| **Data Source** | Stripe, Subscription platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Trend line |

### New Subscribers

| Property | Value |
|----------|-------|
| **Definition** | Subscribers acquired in the period |
| **Formula** | `count(subscriptions where created_at in period)` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Bar chart |

### Cancelled Subscribers

| Property | Value |
|----------|-------|
| **Definition** | Subscribers who cancelled in the period |
| **Formula** | `count(subscriptions where cancelled_at in period)` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Bar chart |

### Churn Rate (Monthly)

| Property | Value |
|----------|-------|
| **Definition** | Percentage of subscribers lost per month |
| **Formula** | `churned_subscribers / start_of_month_subscribers × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Daily |
| **Visualization** | Stat card, Trend line |
| **Benchmarks** | < 3% excellent, 3-5% good, 5-7% average, > 7% concerning |

### Churn Rate (Annual)

| Property | Value |
|----------|-------|
| **Definition** | Annualized churn rate |
| **Formula** | `1 - (1 - monthly_churn)^12` or direct annual calculation |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card |

### Retention Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of subscribers retained |
| **Formula** | `100 - churn_rate` or `end_subscribers / start_subscribers × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Daily |
| **Visualization** | Stat card |

### Retention by Cohort

| Property | Value |
|----------|-------|
| **Definition** | Retention curves grouped by signup month |
| **Formula** | Track each cohort's retention over time |
| **Data Source** | Calculated from subscription data |
| **Update Frequency** | Daily |
| **Visualization** | Cohort heatmap, Line chart (multiple cohorts) |

### MRR (Monthly Recurring Revenue)

| Property | Value |
|----------|-------|
| **Definition** | Predictable monthly revenue from subscriptions |
| **Formula** | `sum(active_subscription_monthly_values)` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Trend line, Stacked bar (by plan) |

### ARR (Annual Recurring Revenue)

| Property | Value |
|----------|-------|
| **Definition** | Annualized recurring revenue |
| **Formula** | `MRR × 12` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

### New MRR

| Property | Value |
|----------|-------|
| **Definition** | MRR from new subscribers |
| **Formula** | `sum(new_subscription_monthly_values)` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, MRR movement chart |

### Expansion MRR

| Property | Value |
|----------|-------|
| **Definition** | Additional MRR from upgrades and add-ons |
| **Formula** | `sum(upgrade_revenue_increase)` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, MRR movement chart |

### Contraction MRR

| Property | Value |
|----------|-------|
| **Definition** | Lost MRR from downgrades |
| **Formula** | `sum(downgrade_revenue_decrease)` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, MRR movement chart |

### Churned MRR

| Property | Value |
|----------|-------|
| **Definition** | Lost MRR from cancellations |
| **Formula** | `sum(cancelled_subscription_monthly_values)` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, MRR movement chart |

### Net New MRR

| Property | Value |
|----------|-------|
| **Definition** | Net change in MRR |
| **Formula** | `new_mrr + expansion_mrr - contraction_mrr - churned_mrr` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card with +/- indicator, Waterfall chart |

### Reactivations

| Property | Value |
|----------|-------|
| **Definition** | Previously churned subscribers who returned |
| **Formula** | `count(subscriptions where previously_cancelled and now_active)` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

### Reactivation Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of churned users who return |
| **Formula** | `reactivations / total_churned × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Monthly |
| **Visualization** | Stat card |

### Cancellation Reasons

| Property | Value |
|----------|-------|
| **Definition** | Why subscribers cancelled |
| **Formula** | Aggregated from cancellation surveys |
| **Data Source** | Stripe (cancellation feedback), Custom surveys |
| **Update Frequency** | Real-time |
| **Visualization** | Pie chart, Bar chart |

### Trial to Paid Conversion

| Property | Value |
|----------|-------|
| **Definition** | Percentage of trials that convert to paid |
| **Formula** | `paid_after_trial / total_trials × 100` |
| **Data Source** | Stripe |
| **Update Frequency** | Daily |
| **Visualization** | Stat card, Funnel step |
| **Benchmarks** | 15-25% is typical for SaaS |

### Average Subscription Length

| Property | Value |
|----------|-------|
| **Definition** | Mean duration of subscriptions |
| **Formula** | `sum(subscription_durations) / total_subscriptions` |
| **Data Source** | Calculated |
| **Update Frequency** | Daily |
| **Visualization** | Stat card |

### Subscriber LTV (Lifetime Value)

| Property | Value |
|----------|-------|
| **Definition** | Predicted total revenue from a subscriber |
| **Formula** | `ARPU / monthly_churn_rate` or `ARPU × avg_subscription_months` |
| **Data Source** | Calculated |
| **Update Frequency** | Daily |
| **Visualization** | Stat card, LTV by cohort |

## Dashboard Component

```typescript
interface SubscriptionMetrics {
  activeSubscribers: number;
  newSubscribers: number;
  cancelledSubscribers: number;
  churnRate: {
    monthly: number;
    annual: number;
  };
  retentionRate: number;
  retentionByCohort: Array<{
    cohort: string; // "2025-10", "2025-11", etc.
    months: number[];  // [100, 92, 85, 78, ...] retention percentages
  }>;
  mrr: number;
  arr: number;
  mrrMovement: {
    new: number;
    expansion: number;
    contraction: number;
    churned: number;
    net: number;
  };
  reactivations: number;
  reactivationRate: number;
  cancellationReasons: Record<string, number>;
  trialToPaidRate: number;
  avgSubscriptionLength: number; // in months
  subscriberLtv: number;
  subscribersByPlan: Record<string, number>;
}
```

## API Endpoint

```
GET /api/analytics/subscriptions
  ?start=2026-01-01
  &end=2026-01-12

GET /api/analytics/cohorts
  ?metric=retention
  &cohort_start=2025-06
  &cohort_end=2025-12
```

## Mock Data Structure

```typescript
export const mockSubscriptionData: SubscriptionMetrics = {
  activeSubscribers: 2847,
  newSubscribers: 234,
  cancelledSubscribers: 87,
  churnRate: { monthly: 3.1, annual: 31.8 },
  retentionRate: 96.9,
  mrr: 142350,
  arr: 1708200,
  mrrMovement: {
    new: 23400,
    expansion: 4200,
    contraction: 1800,
    churned: 8700,
    net: 17100,
  },
  reactivations: 12,
  reactivationRate: 4.2,
  trialToPaidRate: 22.4,
  avgSubscriptionLength: 14.2,
  subscriberLtv: 712,
  cancellationReasons: {
    'Too expensive': 34,
    'Not using enough': 28,
    'Switched to competitor': 15,
    'Missing features': 12,
    'Other': 11,
  },
  subscribersByPlan: {
    'Basic': 1240,
    'Pro': 1102,
    'Enterprise': 505,
  },
  // ... etc
};
```

## MRR Movement Visualization

```
                    MRR Movement

     ┌──────────────────────────────────┐
     │ Starting MRR          $125,250  │
     ├──────────────────────────────────┤
  +  │ New                    $23,400  │ ████████████
  +  │ Expansion               $4,200  │ ██
  -  │ Contraction            -$1,800  │ █
  -  │ Churned                -$8,700  │ ████
     ├──────────────────────────────────┤
  =  │ Ending MRR            $142,350  │
     │ Net Change            +$17,100  │ (+13.7%)
     └──────────────────────────────────┘
```
