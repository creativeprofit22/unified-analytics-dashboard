# Unified Analytics Dashboard

A platform-agnostic, embeddable analytics dashboard that consolidates data from multiple sources into a single view.

## Overview

This dashboard is designed to:
- **Consolidate** analytics from multiple sources (GA4, Stripe, email platforms, etc.)
- **Embed** anywhere via iframe (GoHighLevel, custom apps, standalone)
- **Display** comprehensive metrics across traffic, revenue, subscriptions, and campaigns
- **Scale** from mock data to production with a simple config switch

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Data Sources      │     │   Backend (Railway) │     │   Dashboard (Vercel)│
│                     │     │                     │     │                     │
│ - Google Analytics  │────▶│ - Data aggregation  │────▶│ - React/Next.js     │
│ - Stripe            │     │ - API endpoints     │     │ - Charts/Tables     │
│ - Email platforms   │     │ - Caching           │     │ - Real-time updates │
│ - CRM (GHL)         │     │ - Data storage      │     │ - Embeddable iframe │
│ - Custom events     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

## Metrics Covered

| Category | Key Metrics |
|----------|-------------|
| Traffic & Acquisition | Sessions, visitors, bounce rate, sources, landing pages |
| SEO | Rankings, visibility, impressions, CTR, backlinks |
| Conversions & Funnel | Conversion rate, cart/checkout abandonment, funnel drop-off |
| Revenue & Orders | Gross/net revenue, AOV, transactions, refunds |
| Subscriptions & Retention | MRR, ARR, churn, retention cohorts, cancellation reasons |
| Payments | Failed payments, recovery rate, dunning, payment methods |
| Unit Economics | CAC, LTV, LTV:CAC, payback period, ARPU, margins |
| Demographics | Geo, device, browser, OS, language |
| Segmentation | By campaign, niche, cohort, plan, behavior |
| Campaigns | Email/SMS/WhatsApp: delivery, opens, clicks, conversions |

## Documentation

- [Architecture](docs/architecture.md) - System design and data flow
- [Metrics Reference](docs/metrics/) - Detailed metric definitions by category
- [Integrations](docs/integrations.md) - How to connect data sources
- [Deployment](docs/deployment.md) - Platform-agnostic deployment guide

## Tech Stack

- **Frontend**: Next.js 14+, React, TailwindCSS, shadcn/ui
- **Charts**: Recharts (or Victory/Tremor)
- **Backend**: Node.js/Express or Next.js API routes
- **Database**: PostgreSQL (via Railway)
- **Deployment**: Vercel (frontend), Railway (backend + DB)

## Quick Start

```bash
# Install dependencies
npm install

# Run with mock data
npm run dev

# Build for production
npm run build
```

## Environment Variables

```env
# Backend
DATABASE_URL=postgresql://...
GHL_API_KEY=...
STRIPE_SECRET_KEY=...
GA4_PROPERTY_ID=...

# Frontend
NEXT_PUBLIC_API_URL=https://your-railway-backend.com
```

## Embedding

The dashboard is designed to be embedded via iframe in any platform:

```html
<!-- GoHighLevel Custom Menu Link -->
<iframe src="https://your-dashboard.vercel.app" />

<!-- Or any other platform -->
<iframe
  src="https://your-dashboard.vercel.app?location_id=xxx"
  style="width: 100%; height: 100%; border: none;"
/>
```

## License

MIT
