# Integrations

## Overview

This document outlines how to connect various data sources to the Unified Analytics Dashboard. Each integration feeds data into the Railway backend, which then serves it to the frontend.

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA SOURCES                                      │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│   Analytics  │   Payments   │   Email/SMS  │     CRM      │    Custom       │
├──────────────┼──────────────┼──────────────┼──────────────┼─────────────────┤
│ Google       │ Stripe       │ Mailchimp    │ GoHighLevel  │ Custom events   │
│ Analytics 4  │              │ Sendgrid     │ HubSpot      │ (your frontend) │
│              │              │ Twilio       │ Salesforce   │                 │
│              │              │ WhatsApp API │              │                 │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴────────┬────────┘
       │              │              │              │                │
       ▼              ▼              ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RAILWAY BACKEND                                     │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Polling     │  │ Webhooks    │  │ API Clients │  │ Event       │         │
│  │ Jobs        │  │ Endpoints   │  │             │  │ Receiver    │         │
│  │             │  │             │  │             │  │             │         │
│  │ - GA4       │  │ - Stripe    │  │ - GHL       │  │ - POST      │         │
│  │ - SEO tools │  │ - SendGrid  │  │ - HubSpot   │  │   /events   │         │
│  │             │  │ - Mailchimp │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                                             │
│                              ▼                                              │
│                    ┌─────────────────┐                                      │
│                    │   PostgreSQL    │                                      │
│                    └─────────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Google Analytics 4

### Overview
Primary source for traffic, acquisition, and behavior data.

### Authentication
- **Method**: OAuth 2.0 Service Account
- **Scopes**: `https://www.googleapis.com/auth/analytics.readonly`

### Setup

1. Create a Google Cloud project
2. Enable the Google Analytics Data API
3. Create a service account with viewer access
4. Download the JSON key file
5. Grant the service account access to your GA4 property

### Environment Variables

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GA4_PROPERTY_ID=properties/123456789
```

### Data Collection

```typescript
// lib/integrations/ga4.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const client = new BetaAnalyticsDataClient();

export async function getTrafficData(startDate: string, endDate: string) {
  const [response] = await client.runReport({
    property: process.env.GA4_PROPERTY_ID,
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: 'date' },
      { name: 'sessionSource' },
      { name: 'sessionMedium' },
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
  });
  return response;
}
```

### Polling Schedule
- Every 15 minutes for real-time-ish data
- Daily aggregation job at midnight

### Metrics Provided
- Sessions, Users, Bounce Rate
- Traffic sources and mediums
- Page views and landing pages
- Device and demographic data
- Conversions (if configured)

---

## Stripe

### Overview
Primary source for payments, subscriptions, and revenue data.

### Authentication
- **Method**: API Secret Key
- **Webhooks**: Webhook signing secret

### Setup

1. Get your Stripe secret key from Dashboard → Developers → API keys
2. Create a webhook endpoint in Stripe Dashboard
3. Configure webhook events (see list below)

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Webhook Events to Subscribe

```
# Payments
payment_intent.succeeded
payment_intent.payment_failed
charge.refunded

# Subscriptions
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
customer.subscription.trial_will_end

# Invoices
invoice.paid
invoice.payment_failed
invoice.payment_action_required

# Customers
customer.created
customer.updated
```

### Webhook Handler

```typescript
// api/webhooks/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleChurn(event.data.object);
      break;
    // ... etc
  }

  return new Response('OK');
}
```

### Metrics Provided
- Revenue (gross, net)
- Transactions, AOV
- MRR, ARR, churn
- Failed payments, recovery
- Subscription lifecycle

---

## Email Platforms

### Mailchimp

#### Authentication
- **Method**: API Key

#### Environment Variables
```env
MAILCHIMP_API_KEY=xxxxxxxxxx-us1
MAILCHIMP_SERVER_PREFIX=us1
```

#### Webhook Events
- subscribe, unsubscribe
- campaign sent, opened, clicked
- bounced, complained

#### Data Collection
```typescript
import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export async function getCampaignStats(campaignId: string) {
  return await mailchimp.reports.getCampaignReport(campaignId);
}
```

### SendGrid

#### Authentication
- **Method**: API Key

#### Environment Variables
```env
SENDGRID_API_KEY=SG.xxxxxxxxxx
```

#### Webhook Events (Event Webhook)
- delivered, bounce, dropped
- open, click
- spam_report, unsubscribe

### Twilio (SMS)

#### Authentication
- **Method**: Account SID + Auth Token

#### Environment Variables
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxx
```

#### Data Collection
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function getMessageStats(dateRange: { start: Date; end: Date }) {
  const messages = await client.messages.list({
    dateSentAfter: dateRange.start,
    dateSentBefore: dateRange.end,
  });
  return messages;
}
```

---

## GoHighLevel

### Overview
CRM integration for contact data and campaign attribution.

### Authentication
- **Method**: API Key (Location or Agency level)

### Environment Variables
```env
GHL_API_KEY=xxxxxxxxxx
GHL_LOCATION_ID=xxxxxxxxxx
```

### API Client

```typescript
// lib/integrations/ghl.ts
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

export async function getContacts(params: { limit?: number; query?: string }) {
  const response = await fetch(`${GHL_BASE_URL}/contacts/`, {
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    },
  });
  return response.json();
}

export async function updateContact(contactId: string, data: any) {
  const response = await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### Bidirectional Sync

1. **Inbound**: Pull contact data from GHL for segmentation
2. **Outbound**: Push analytics data back to GHL custom fields

```typescript
// Push analytics to GHL contact
await updateContact(contactId, {
  customFields: [
    { key: 'analytics_sessions', value: '47' },
    { key: 'analytics_lead_score', value: '82' },
    { key: 'analytics_last_visit', value: '2026-01-12' },
  ],
});
```

---

## SEO Tools

### Google Search Console

#### Authentication
- **Method**: OAuth 2.0 (same service account as GA4)

#### Data Collection
```typescript
import { google } from 'googleapis';

const searchconsole = google.searchconsole('v1');

export async function getSearchAnalytics(siteUrl: string, dateRange: { start: string; end: string }) {
  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: dateRange.start,
      endDate: dateRange.end,
      dimensions: ['query', 'page'],
      rowLimit: 1000,
    },
  });
  return response.data;
}
```

### Ahrefs (Optional)

#### Environment Variables
```env
AHREFS_API_KEY=xxxxxxxxxx
```

### SEMrush (Optional)

#### Environment Variables
```env
SEMRUSH_API_KEY=xxxxxxxxxx
```

---

## Custom Event Tracking

### Overview
Track custom events from your frontend to the Railway backend.

### Frontend Implementation

```typescript
// lib/analytics.ts
const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_URL;

export async function trackEvent(event: {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}) {
  await fetch(`${ANALYTICS_ENDPOINT}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...event,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
    }),
  });
}

// Usage
trackEvent({
  name: 'add_to_cart',
  properties: {
    productId: 'prod_123',
    price: 49.99,
    currency: 'USD',
  },
});
```

### Backend Receiver

```typescript
// api/events/route.ts
export async function POST(req: Request) {
  const event = await req.json();

  // Validate
  if (!event.name || !event.timestamp) {
    return new Response('Invalid event', { status: 400 });
  }

  // Store
  await db.events.create({
    data: {
      name: event.name,
      properties: event.properties,
      userId: event.userId,
      sessionId: event.sessionId,
      timestamp: new Date(event.timestamp),
      url: event.url,
      referrer: event.referrer,
    },
  });

  return new Response('OK');
}
```

---

## Wiring Checklist

When you're ready to connect real data sources:

### Phase 1: Core Integrations
- [ ] Set up Railway PostgreSQL database
- [ ] Configure Stripe webhooks
- [ ] Connect Google Analytics 4
- [ ] Set up custom event tracking

### Phase 2: Campaign Integrations
- [ ] Connect email platform (Mailchimp/SendGrid)
- [ ] Set up SMS tracking (Twilio)
- [ ] Configure WhatsApp Business API (if used)

### Phase 3: CRM & SEO
- [ ] Connect GoHighLevel API
- [ ] Set up Google Search Console
- [ ] Add third-party SEO tools (optional)

### Phase 4: Sync & Automation
- [ ] Configure polling jobs (cron)
- [ ] Set up webhook handlers
- [ ] Enable bidirectional GHL sync
- [ ] Test data flow end-to-end

---

## Environment Variables Summary

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Google
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GA4_PROPERTY_ID=properties/123456789

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
MAILCHIMP_API_KEY=xxx-us1
MAILCHIMP_SERVER_PREFIX=us1
SENDGRID_API_KEY=SG.xxx

# SMS
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx

# CRM
GHL_API_KEY=xxx
GHL_LOCATION_ID=xxx

# SEO
AHREFS_API_KEY=xxx (optional)
SEMRUSH_API_KEY=xxx (optional)

# Frontend
NEXT_PUBLIC_API_URL=https://your-railway-backend.com
```
