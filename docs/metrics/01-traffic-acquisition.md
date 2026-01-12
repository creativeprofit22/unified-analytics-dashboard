# Traffic & Acquisition Metrics

## Overview

Traffic and acquisition metrics measure how users find and enter your website or application. These are foundational metrics for understanding reach and marketing effectiveness.

## Metrics

### Sessions

| Property | Value |
|----------|-------|
| **Definition** | A group of user interactions within a given time frame (30 min default) |
| **Formula** | Count of distinct session IDs |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time / 15 min |
| **Visualization** | Line chart (trend), Stat card (current) |

### Unique Visitors

| Property | Value |
|----------|-------|
| **Definition** | Distinct users who visited during the period |
| **Formula** | Count of distinct user/client IDs |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time / 15 min |
| **Visualization** | Line chart, Stat card |

### New vs Returning Visitors

| Property | Value |
|----------|-------|
| **Definition** | First-time visitors vs repeat visitors |
| **Formula** | `new_users / total_users`, `returning_users / total_users` |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time / 15 min |
| **Visualization** | Donut chart, Percentage comparison |

### Bounce Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of single-page sessions with no interaction |
| **Formula** | `single_page_sessions / total_sessions × 100` |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time / 15 min |
| **Visualization** | Stat card, Gauge |
| **Benchmarks** | < 40% excellent, 40-55% average, > 55% needs work |

### Pages per Session

| Property | Value |
|----------|-------|
| **Definition** | Average number of pages viewed per session |
| **Formula** | `total_pageviews / total_sessions` |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time / 15 min |
| **Visualization** | Stat card, Line chart trend |

### Average Session Duration

| Property | Value |
|----------|-------|
| **Definition** | Mean time spent on site per session |
| **Formula** | `sum(session_durations) / total_sessions` |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time / 15 min |
| **Visualization** | Stat card (formatted mm:ss), Line chart |

### Traffic by Source

| Property | Value |
|----------|-------|
| **Definition** | Breakdown of where traffic originates |
| **Categories** | Organic Search, Paid Search, Direct, Referral, Social, Email |
| **Formula** | Group sessions by `source` dimension |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | 15 min |
| **Visualization** | Pie/Donut chart, Stacked bar chart, Table |

### Traffic by Medium

| Property | Value |
|----------|-------|
| **Definition** | General category of traffic source |
| **Categories** | organic, cpc, referral, email, social, none (direct) |
| **Formula** | Group sessions by `medium` dimension |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | 15 min |
| **Visualization** | Pie chart, Table |

### Traffic by Campaign

| Property | Value |
|----------|-------|
| **Definition** | Sessions attributed to specific marketing campaigns |
| **Formula** | Group sessions by `utm_campaign` parameter |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | 15 min |
| **Visualization** | Table with sortable columns |

### Top Landing Pages

| Property | Value |
|----------|-------|
| **Definition** | First page viewed in a session |
| **Formula** | Group sessions by `landing_page` dimension, order by count |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | 15 min |
| **Visualization** | Table (page path, sessions, bounce rate, conversion rate) |

### Top Exit Pages

| Property | Value |
|----------|-------|
| **Definition** | Last page viewed before leaving |
| **Formula** | Group exits by `exit_page` dimension |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | 15 min |
| **Visualization** | Table (page path, exit count, exit rate) |

### Page Load Time (Core Web Vitals)

| Property | Value |
|----------|-------|
| **Definition** | Performance metrics for page loading |
| **Components** | LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift) |
| **Data Source** | Google Analytics 4, Web Vitals API |
| **Update Frequency** | Daily |
| **Visualization** | Gauge charts, Pass/Fail indicators |
| **Benchmarks** | LCP < 2.5s, FID < 100ms, CLS < 0.1 |

## Dashboard Component

```typescript
interface TrafficMetrics {
  sessions: number;
  uniqueVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  bounceRate: number;
  pagesPerSession: number;
  avgSessionDuration: number; // in seconds
  trafficBySource: Record<string, number>;
  trafficByMedium: Record<string, number>;
  trafficByCampaign: Array<{
    campaign: string;
    sessions: number;
    conversions: number;
  }>;
  topLandingPages: Array<{
    path: string;
    sessions: number;
    bounceRate: number;
  }>;
  topExitPages: Array<{
    path: string;
    exits: number;
    exitRate: number;
  }>;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
}
```

## API Endpoint

```
GET /api/analytics/traffic
  ?start=2026-01-01
  &end=2026-01-12
  &granularity=daily|hourly
  &segment=all|new|returning
```

## Mock Data Structure

```typescript
export const mockTrafficData: TrafficMetrics = {
  sessions: 12847,
  uniqueVisitors: 9432,
  newVisitors: 5621,
  returningVisitors: 3811,
  bounceRate: 42.3,
  pagesPerSession: 3.2,
  avgSessionDuration: 187,
  trafficBySource: {
    'google': 5234,
    'direct': 3102,
    'facebook': 1876,
    'referral': 1543,
    'email': 1092,
  },
  // ... etc
};
```
