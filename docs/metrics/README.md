# Metrics Reference

This directory contains detailed documentation for each metrics category in the Unified Analytics Dashboard.

## Categories

| # | Category | File | Description |
|---|----------|------|-------------|
| 1 | [Traffic & Acquisition](01-traffic-acquisition.md) | `01-traffic-acquisition.md` | Sessions, visitors, sources, landing pages |
| 2 | [SEO](02-seo.md) | `02-seo.md` | Rankings, visibility, impressions, backlinks |
| 3 | [Conversions & Funnel](03-conversions-funnel.md) | `03-conversions-funnel.md` | Conversion rates, funnel drop-off, cart abandonment |
| 4 | [Revenue & Orders](04-revenue-orders.md) | `04-revenue-orders.md` | Gross/net revenue, AOV, transactions, refunds |
| 5 | [Subscriptions & Retention](05-subscriptions-retention.md) | `05-subscriptions-retention.md` | MRR, ARR, churn, retention cohorts |
| 6 | [Payments](06-payments.md) | `06-payments.md` | Failed payments, recovery, dunning |
| 7 | [Unit Economics](07-unit-economics.md) | `07-unit-economics.md` | CAC, LTV, LTV:CAC, payback period, margins |
| 8 | [Demographics](08-demographics.md) | `08-demographics.md` | Geo, device, browser, user attributes |
| 9 | [Segmentation](09-segmentation.md) | `09-segmentation.md` | By campaign, niche, cohort, plan, behavior |
| 10 | [Campaigns](10-campaigns.md) | `10-campaigns.md` | Email/SMS/WhatsApp performance |

## Document Structure

Each metrics document follows a consistent structure:

1. **Overview** - Category description and purpose
2. **Metrics** - Detailed table for each metric:
   - Definition
   - Formula
   - Data Source
   - Update Frequency
   - Visualization type
   - Benchmarks (where applicable)
3. **Dashboard Component** - TypeScript interface
4. **API Endpoint** - REST endpoint specification
5. **Mock Data Structure** - Example data for development

## Quick Reference

### Most Critical Metrics

| Metric | Category | Why It Matters |
|--------|----------|----------------|
| Conversion Rate | Conversions | Core business health |
| MRR | Subscriptions | Recurring revenue |
| Churn Rate | Subscriptions | Customer retention |
| LTV:CAC Ratio | Unit Economics | Business sustainability |
| AOV | Revenue | Revenue optimization |
| CAC | Unit Economics | Acquisition efficiency |

### Data Source Mapping

| Source | Metrics Provided |
|--------|------------------|
| Google Analytics 4 | Traffic, Conversions, Demographics |
| Stripe | Revenue, Subscriptions, Payments |
| Email Platform | Campaign engagement |
| CRM (GHL) | Contact data, Segmentation |
| Custom Events | Funnel steps, Behavior |

## Adding New Metrics

To add a new metric:

1. Identify the appropriate category file
2. Add the metric table following the existing format
3. Update the TypeScript interface
4. Add to mock data
5. Update API endpoint if needed
