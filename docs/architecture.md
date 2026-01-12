# Architecture

## System Overview

The Unified Analytics Dashboard follows a three-tier architecture designed for flexibility, scalability, and platform-agnostic deployment.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA SOURCES                                   │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────┤
│ Google      │ Stripe      │ Email       │ CRM         │ Custom              │
│ Analytics   │ Payments    │ Platforms   │ (GHL, etc)  │ Events              │
│ (GA4)       │             │ (Mailchimp, │             │ (Frontend           │
│             │             │ Sendgrid,   │             │ tracking)           │
│             │             │ Twilio)     │             │                     │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴──────────┬──────────┘
       │             │             │             │                 │
       ▼             ▼             ▼             ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Railway)                                   │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Ingestion Layer │  │ Processing      │  │ API Layer       │              │
│  │                 │  │                 │  │                 │              │
│  │ - Webhooks      │  │ - Aggregation   │  │ - REST endpoints│              │
│  │ - Polling jobs  │  │ - Calculations  │  │ - Auth/CORS     │              │
│  │ - Event streams │  │ - Caching       │  │ - Rate limiting │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                    │                       │
│           ▼                    ▼                    ▼                       │
│  ┌──────────────────────────────────────────────────────────────┐           │
│  │                     PostgreSQL Database                      │           │
│  │                                                              │           │
│  │  - Raw events table                                          │           │
│  │  - Aggregated metrics (hourly, daily, monthly)               │           │
│  │  - Cached calculations                                       │           │
│  └──────────────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vercel)                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        Next.js Application                          │    │
│  │                                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ Dashboard    │  │ Components   │  │ Data Layer   │               │    │
│  │  │ Pages        │  │              │  │              │               │    │
│  │  │              │  │ - StatCard   │  │ - API client │               │    │
│  │  │ - Overview   │  │ - Charts     │  │ - Mock data  │               │    │
│  │  │ - Traffic    │  │ - Tables     │  │ - SWR/React  │               │    │
│  │  │ - Revenue    │  │ - Filters    │  │   Query      │               │    │
│  │  │ - Campaigns  │  │ - DatePicker │  │              │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EMBEDDING TARGETS                                   │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│ GoHighLevel     │ Custom Web App  │ Standalone      │ Other CRMs            │
│ (iframe)        │ (iframe)        │ (direct access) │ (iframe)              │
└─────────────────┴─────────────────┴─────────────────┴───────────────────────┘
```

## Data Flow

### 1. Ingestion

Data enters the system through multiple channels:

| Source | Method | Frequency |
|--------|--------|-----------|
| Google Analytics | GA4 Data API polling | Every 15 min |
| Stripe | Webhooks (real-time) | Instant |
| Email platforms | Webhooks + API polling | Instant + hourly |
| CRM | API polling | Every 15 min |
| Custom events | Direct POST to backend | Instant |

### 2. Processing

Raw data is processed into aggregated metrics:

```
Raw Events → Hourly Aggregates → Daily Aggregates → Monthly Aggregates
                    ↓                   ↓                   ↓
              Real-time views     Daily reports      Monthly reports
```

### 3. Storage

```sql
-- Example schema structure
tables:
  - raw_events         -- All incoming events (partitioned by date)
  - metrics_hourly     -- Pre-aggregated hourly metrics
  - metrics_daily      -- Pre-aggregated daily metrics
  - metrics_monthly    -- Pre-aggregated monthly metrics
  - cache              -- Expensive calculations (LTV, CAC, cohorts)
```

### 4. API

RESTful endpoints serve the dashboard:

```
GET /api/analytics/traffic?start=2026-01-01&end=2026-01-12
GET /api/analytics/revenue?period=monthly
GET /api/analytics/funnel?steps=visit,cart,checkout,purchase
GET /api/analytics/cohorts?metric=retention
GET /api/analytics/campaigns?type=email&campaign_id=xxx
```

### 5. Frontend

The dashboard consumes the API and renders visualizations:

```typescript
// Data fetching pattern
const { data, isLoading } = useSWR(
  `/api/analytics/traffic?${params}`,
  fetcher
);

// Falls back to mock data in development
const trafficData = USE_MOCK ? mockTrafficData : data;
```

## Security

### Authentication

- Dashboard endpoints protected by JWT or session tokens
- API keys stored server-side only (Railway env vars)
- Iframe embedding controlled via CSP headers

### CORS Configuration

```typescript
// Only allow specific origins to embed
const allowedOrigins = [
  'https://*.gohighlevel.com',
  'https://*.leadconnectorhq.com',
  'https://your-custom-domain.com'
];
```

### Data Privacy

- PII minimized in analytics storage
- Aggregated data preferred over raw user data
- GDPR-compliant data retention policies

## Scalability

### Caching Strategy

| Data Type | Cache Duration | Invalidation |
|-----------|----------------|--------------|
| Real-time metrics | 1 minute | On new event |
| Hourly aggregates | 1 hour | Scheduled |
| Daily aggregates | 24 hours | Scheduled |
| LTV/CAC calculations | 6 hours | Scheduled |

### Database Optimization

- Partitioned tables by date range
- Materialized views for complex aggregations
- Connection pooling via PgBouncer

## Mock Data Mode

For development and demos, the entire backend can be bypassed:

```typescript
// lib/config.ts
export const USE_MOCK = process.env.NODE_ENV === 'development'
  || process.env.USE_MOCK === 'true';

// lib/api.ts
export async function getMetrics(type: string) {
  if (USE_MOCK) {
    return import(`./mock-data/${type}`).then(m => m.default);
  }
  return fetch(`${API_URL}/api/analytics/${type}`).then(r => r.json());
}
```

This allows:
- UI development without backend
- Demo environments
- Testing with predictable data
