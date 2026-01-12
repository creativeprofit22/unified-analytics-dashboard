# Segmentation Metrics

## Overview

Segmentation breaks down metrics by meaningful user groups. This enables targeted analysis, personalized marketing, and understanding of different customer behaviors.

## Segment Types

### By Source Campaign (UTM)

| Property | Value |
|----------|-------|
| **Definition** | Users grouped by marketing campaign attribution |
| **Parameters** | utm_source, utm_medium, utm_campaign, utm_content, utm_term |
| **Formula** | Group users/metrics by UTM parameters |
| **Data Source** | Google Analytics 4, URL parameters |
| **Update Frequency** | Real-time |
| **Visualization** | Table, Comparison charts |

#### Campaign Breakdown

| Metric | Description |
|--------|-------------|
| Users by Campaign | Traffic from each campaign |
| Conversions by Campaign | Goal completions per campaign |
| Revenue by Campaign | Attributed revenue |
| CAC by Campaign | Acquisition cost per campaign |
| ROI by Campaign | Return on ad spend |

### By Niche/Vertical

| Property | Value |
|----------|-------|
| **Definition** | Users grouped by industry, interest, or use case |
| **Examples** | E-commerce, SaaS, Agency, Healthcare, Finance |
| **Formula** | Tag users based on behavior, form data, or enrichment |
| **Data Source** | CRM, Form submissions, Clearbit/enrichment |
| **Update Frequency** | Daily |
| **Visualization** | Pie chart, Table, Comparison bars |

#### Niche Breakdown

| Metric | Description |
|--------|-------------|
| Users by Niche | Distribution across verticals |
| Conversion Rate by Niche | Which niches convert best |
| LTV by Niche | Long-term value by segment |
| Churn by Niche | Which niches retain |

### By Acquisition Cohort

| Property | Value |
|----------|-------|
| **Definition** | Users grouped by when they signed up |
| **Periods** | Week, Month, Quarter |
| **Formula** | Group by signup date |
| **Data Source** | CRM, Database |
| **Update Frequency** | Daily |
| **Visualization** | Cohort heatmap, Line charts |

#### Cohort Analysis Metrics

| Metric | Description |
|--------|-------------|
| Retention by Cohort | How well each cohort retains |
| LTV by Cohort | Cumulative value over time |
| Behavior by Cohort | Feature usage patterns |
| Revenue by Cohort | Revenue contribution |

### By Plan/Tier

| Property | Value |
|----------|-------|
| **Definition** | Users grouped by subscription plan |
| **Categories** | Free, Basic, Pro, Enterprise (or your tiers) |
| **Formula** | Group by subscription plan |
| **Data Source** | Stripe, Subscription database |
| **Update Frequency** | Real-time |
| **Visualization** | Donut chart, Table, Funnel |

#### Plan Breakdown

| Metric | Description |
|--------|-------------|
| Users by Plan | Distribution across tiers |
| Upgrade Rate | Free → Paid, Basic → Pro |
| Downgrade Rate | Pro → Basic, etc. |
| Revenue by Plan | MRR contribution |
| Churn by Plan | Retention per tier |

### By Behavior

| Property | Value |
|----------|-------|
| **Definition** | Users grouped by engagement level and actions |
| **Categories** | Power users, Active, Casual, Dormant, At-risk |
| **Formula** | Based on activity frequency, feature usage, recency |
| **Data Source** | Product analytics, Custom events |
| **Update Frequency** | Daily |
| **Visualization** | Donut chart, Table |

#### Behavioral Segments

| Segment | Definition |
|---------|------------|
| Power Users | Top 10% by activity, use multiple features |
| Active | Regular usage (weekly+), engaged |
| Casual | Occasional usage (monthly), limited features |
| Dormant | No activity in 30+ days |
| At-Risk | Activity declining, showing churn signals |

### By Lead Score

| Property | Value |
|----------|-------|
| **Definition** | Leads/users grouped by likelihood to convert or value |
| **Categories** | Hot (80+), Warm (50-79), Cold (<50) |
| **Formula** | Composite score based on behavior and attributes |
| **Data Source** | CRM, Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Distribution chart, Pipeline |

### By Lifecycle Stage

| Property | Value |
|----------|-------|
| **Definition** | Users grouped by customer journey stage |
| **Stages** | Visitor, Lead, Trial, Customer, Churned, Reactivated |
| **Formula** | Based on account status and history |
| **Data Source** | CRM, Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Funnel, Flow diagram |

### By First Touch / Last Touch

| Property | Value |
|----------|-------|
| **Definition** | Attribution to first or last marketing touchpoint |
| **Formula** | Track touchpoints through conversion |
| **Data Source** | GA4, CRM |
| **Update Frequency** | Daily |
| **Visualization** | Comparison table, Sankey diagram |

### By Custom Attributes

| Property | Value |
|----------|-------|
| **Definition** | Any custom user properties you track |
| **Examples** | Company size, Role, Feature flags, Experiment groups |
| **Formula** | Group by custom attributes |
| **Data Source** | CRM, Database |
| **Update Frequency** | Real-time |
| **Visualization** | Depends on attribute type |

## Cross-Segment Analysis

Compare any metric across multiple segments:

```
Metric: Conversion Rate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Segment A vs Segment B vs Segment C
```

## Dashboard Component

```typescript
interface SegmentationMetrics {
  byCampaign: Array<{
    campaign: string;
    source: string;
    medium: string;
    users: number;
    conversions: number;
    revenue: number;
    cac: number;
    roi: number;
  }>;
  byNiche: Array<{
    niche: string;
    users: number;
    conversionRate: number;
    avgLtv: number;
    churnRate: number;
  }>;
  byCohort: Array<{
    cohort: string; // "2025-10"
    users: number;
    retentionCurve: number[]; // [100, 85, 72, 65, ...]
    cumulativeLtv: number[];
  }>;
  byPlan: Array<{
    plan: string;
    users: number;
    mrr: number;
    churnRate: number;
    upgradeRate: number;
    downgradeRate: number;
  }>;
  byBehavior: Array<{
    segment: 'power' | 'active' | 'casual' | 'dormant' | 'at_risk';
    users: number;
    percentage: number;
    avgRevenue: number;
  }>;
  byLeadScore: {
    hot: number;
    warm: number;
    cold: number;
  };
  byLifecycle: {
    visitor: number;
    lead: number;
    trial: number;
    customer: number;
    churned: number;
    reactivated: number;
  };
  crossSegment: Array<{
    segmentA: { type: string; value: string };
    segmentB: { type: string; value: string };
    metric: string;
    valueA: number;
    valueB: number;
    difference: number;
  }>;
}
```

## API Endpoint

```
GET /api/analytics/segments
  ?segment=campaign|niche|cohort|plan|behavior
  &start=2026-01-01
  &end=2026-01-12

GET /api/analytics/segments/compare
  ?segmentA=plan:pro
  &segmentB=plan:basic
  &metrics=conversion_rate,ltv,churn
```

## Mock Data Structure

```typescript
export const mockSegmentationData: SegmentationMetrics = {
  byCampaign: [
    { campaign: 'summer_sale_2025', source: 'google', medium: 'cpc', users: 2341, conversions: 89, revenue: 12450, cac: 45, roi: 3.2 },
    { campaign: 'product_launch', source: 'facebook', medium: 'paid', users: 1876, conversions: 52, revenue: 8920, cac: 67, roi: 2.1 },
    { campaign: 'newsletter_jan', source: 'email', medium: 'email', users: 1234, conversions: 78, revenue: 9840, cac: 12, roi: 8.4 },
  ],
  byNiche: [
    { niche: 'E-commerce', users: 3421, conversionRate: 4.2, avgLtv: 890, churnRate: 3.1 },
    { niche: 'SaaS', users: 2876, conversionRate: 5.1, avgLtv: 1240, churnRate: 2.4 },
    { niche: 'Agency', users: 1543, conversionRate: 3.8, avgLtv: 670, churnRate: 4.2 },
    { niche: 'Healthcare', users: 987, conversionRate: 6.2, avgLtv: 1450, churnRate: 1.8 },
  ],
  byPlan: [
    { plan: 'Free', users: 8432, mrr: 0, churnRate: 0, upgradeRate: 12.4, downgradeRate: 0 },
    { plan: 'Basic', users: 1240, mrr: 24800, churnRate: 4.2, upgradeRate: 8.1, downgradeRate: 0 },
    { plan: 'Pro', users: 1102, mrr: 77140, churnRate: 2.8, upgradeRate: 3.2, downgradeRate: 1.4 },
    { plan: 'Enterprise', users: 505, mrr: 75750, churnRate: 1.2, upgradeRate: 0, downgradeRate: 0.8 },
  ],
  byBehavior: [
    { segment: 'power', users: 487, percentage: 10, avgRevenue: 142 },
    { segment: 'active', users: 1234, percentage: 25, avgRevenue: 68 },
    { segment: 'casual', users: 1876, percentage: 38, avgRevenue: 32 },
    { segment: 'dormant', users: 987, percentage: 20, avgRevenue: 8 },
    { segment: 'at_risk', users: 342, percentage: 7, avgRevenue: 45 },
  ],
  byLeadScore: {
    hot: 234,
    warm: 876,
    cold: 2341,
  },
  byLifecycle: {
    visitor: 45000,
    lead: 3421,
    trial: 567,
    customer: 2847,
    churned: 432,
    reactivated: 87,
  },
  // ... etc
};
```

## Segment Comparison Visualization

```
Conversion Rate by Niche
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Healthcare    ████████████████████  6.2%
SaaS          ████████████████      5.1%
E-commerce    █████████████         4.2%
Agency        ████████████          3.8%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            Avg: 4.8%
```

## Behavioral Segmentation

```
User Behavior Distribution
┌────────────────────────────────────────────────┐
│  Power (10%)  ██████                           │
│  Active (25%) ███████████████                  │
│  Casual (38%) ██████████████████████           │
│  Dormant (20%)████████████                     │
│  At-Risk (7%) ████                             │
└────────────────────────────────────────────────┘
```

## Cohort Retention Heatmap

```
         Month 1  Month 2  Month 3  Month 4  Month 5
Oct 2025   100%     85%      72%      65%      61%
Nov 2025   100%     88%      76%      69%       -
Dec 2025   100%     82%      71%       -        -
Jan 2026   100%     86%       -        -        -

Legend: ██ >80%  ██ 60-80%  ██ 40-60%  ░░ <40%
```
