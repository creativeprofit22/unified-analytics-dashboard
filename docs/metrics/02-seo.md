# SEO Metrics

## Overview

SEO metrics track your website's visibility and performance in search engines. These metrics help optimize organic traffic and search rankings.

## Metrics

### Keyword Rankings

| Property | Value |
|----------|-------|
| **Definition** | Position of your pages in search results for target keywords |
| **Formula** | Average position per keyword from search console |
| **Data Source** | Google Search Console, Ahrefs, SEMrush |
| **Update Frequency** | Daily |
| **Visualization** | Table (keyword, position, change), Position distribution chart |

### Visibility Score

| Property | Value |
|----------|-------|
| **Definition** | Overall presence in search results across all tracked keywords |
| **Formula** | Weighted sum of rankings (higher positions weighted more) |
| **Data Source** | Calculated from keyword rankings |
| **Update Frequency** | Daily |
| **Visualization** | Stat card, Trend line |
| **Range** | 0-100% |

### Search Impressions

| Property | Value |
|----------|-------|
| **Definition** | Number of times your pages appeared in search results |
| **Formula** | Sum of impressions from Search Console |
| **Data Source** | Google Search Console |
| **Update Frequency** | Daily (2-3 day lag) |
| **Visualization** | Line chart, Stat card |

### Organic Clicks

| Property | Value |
|----------|-------|
| **Definition** | Clicks from search results to your site |
| **Formula** | Sum of clicks from Search Console |
| **Data Source** | Google Search Console |
| **Update Frequency** | Daily (2-3 day lag) |
| **Visualization** | Line chart, Stat card |

### Organic CTR (Click-Through Rate)

| Property | Value |
|----------|-------|
| **Definition** | Percentage of impressions that resulted in clicks |
| **Formula** | `clicks / impressions × 100` |
| **Data Source** | Google Search Console |
| **Update Frequency** | Daily |
| **Visualization** | Stat card, Trend line |
| **Benchmarks** | Position 1: 25-30%, Position 2: 12-15%, Position 3: 8-10% |

### Average Position

| Property | Value |
|----------|-------|
| **Definition** | Mean ranking position across all queries |
| **Formula** | `sum(position × impressions) / total_impressions` |
| **Data Source** | Google Search Console |
| **Update Frequency** | Daily |
| **Visualization** | Stat card, Trend line (inverted - lower is better) |

### Backlinks

| Property | Value |
|----------|-------|
| **Definition** | External links pointing to your website |
| **Formula** | Count of referring pages/domains |
| **Data Source** | Ahrefs, Moz, SEMrush |
| **Update Frequency** | Weekly |
| **Visualization** | Stat card, Growth chart, Top referring domains table |

### Referring Domains

| Property | Value |
|----------|-------|
| **Definition** | Unique domains linking to your site |
| **Formula** | Count of distinct root domains |
| **Data Source** | Ahrefs, Moz, SEMrush |
| **Update Frequency** | Weekly |
| **Visualization** | Stat card, Trend line |

### Domain Authority / Domain Rating

| Property | Value |
|----------|-------|
| **Definition** | Predicted ranking strength of your domain |
| **Formula** | Proprietary (Moz DA, Ahrefs DR) |
| **Data Source** | Moz, Ahrefs |
| **Update Frequency** | Monthly |
| **Visualization** | Gauge chart, Stat card |
| **Range** | 0-100 |

### Indexed Pages

| Property | Value |
|----------|-------|
| **Definition** | Number of your pages in Google's index |
| **Formula** | Coverage report from Search Console |
| **Data Source** | Google Search Console |
| **Update Frequency** | Weekly |
| **Visualization** | Stat card, Valid vs Error breakdown |

### Top Queries

| Property | Value |
|----------|-------|
| **Definition** | Search queries driving the most traffic |
| **Formula** | Order by clicks or impressions |
| **Data Source** | Google Search Console |
| **Update Frequency** | Daily |
| **Visualization** | Table (query, impressions, clicks, CTR, position) |

### Top Pages (Organic)

| Property | Value |
|----------|-------|
| **Definition** | Pages receiving the most organic search traffic |
| **Formula** | Order pages by organic clicks |
| **Data Source** | Google Search Console |
| **Update Frequency** | Daily |
| **Visualization** | Table (URL, clicks, impressions, CTR, position) |

## Dashboard Component

```typescript
interface SEOMetrics {
  keywordRankings: Array<{
    keyword: string;
    position: number;
    previousPosition: number;
    change: number;
    volume: number;
    url: string;
  }>;
  visibilityScore: number;
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
  backlinks: number;
  referringDomains: number;
  domainAuthority: number;
  indexedPages: number;
  topQueries: Array<{
    query: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    url: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}
```

## API Endpoint

```
GET /api/analytics/seo
  ?start=2026-01-01
  &end=2026-01-12
  &limit=50
```

## Mock Data Structure

```typescript
export const mockSEOData: SEOMetrics = {
  visibilityScore: 67.4,
  impressions: 284500,
  clicks: 12340,
  ctr: 4.34,
  averagePosition: 14.2,
  backlinks: 3420,
  referringDomains: 287,
  domainAuthority: 42,
  indexedPages: 1250,
  keywordRankings: [
    { keyword: 'best crm software', position: 8, previousPosition: 12, change: 4, volume: 12000, url: '/crm' },
    { keyword: 'marketing automation', position: 15, previousPosition: 14, change: -1, volume: 8500, url: '/automation' },
    // ...
  ],
  // ... etc
};
```

## Notes

- Search Console data has a 2-3 day lag
- Third-party tools (Ahrefs, Moz) may have different update frequencies
- Keyword ranking data can be expensive from third-party APIs — consider caching aggressively
