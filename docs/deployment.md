# Deployment Guide

## Overview

The Unified Analytics Dashboard is platform-agnostic and can be deployed to multiple hosting providers. This guide covers the primary deployment targets and embedding options.

## Architecture Recap

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Frontend          │     │   Backend           │     │   Database          │
│   (Dashboard UI)    │────▶│   (API + Jobs)      │────▶│   (PostgreSQL)      │
│                     │     │                     │     │                     │
│   Vercel / Netlify  │     │   Railway / Render  │     │   Railway / Supabase│
│   / Cloudflare      │     │   / Fly.io          │     │   / Neon            │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Embedding Target  │
│                     │
│   GoHighLevel       │
│   / Custom App      │
│   / Standalone      │
└─────────────────────┘
```

---

## Frontend Deployment

### Vercel (Recommended)

#### Setup

1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Configure environment variables
4. Deploy

#### vercel.json

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/dashboard/:path*",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors 'self' https://*.gohighlevel.com https://*.leadconnectorhq.com"
        }
      ]
    }
  ]
}
```

#### Environment Variables (Vercel Dashboard)

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_USE_MOCK=false
```

### Netlify (Alternative)

#### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[headers]]
  for = "/dashboard/*"
  [headers.values]
    Content-Security-Policy = "frame-ancestors 'self' https://*.gohighlevel.com https://*.leadconnectorhq.com"
```

### Cloudflare Pages (Alternative)

#### Setup

1. Connect GitHub repo to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Configure environment variables

---

## Backend Deployment

### Railway (Recommended)

#### Setup

1. Create new project in Railway Dashboard
2. Add PostgreSQL database service
3. Add Node.js service from GitHub
4. Configure environment variables

#### railway.json

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30
  }
}
```

#### Environment Variables (Railway Dashboard)

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
GA4_PROPERTY_ID=properties/xxx
GHL_API_KEY=xxx
# ... all other integration keys
```

### Render (Alternative)

#### render.yaml

```yaml
services:
  - type: web
    name: analytics-api
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: analytics-db
          property: connectionString
      - key: NODE_ENV
        value: production

databases:
  - name: analytics-db
    plan: starter
```

### Fly.io (Alternative)

#### fly.toml

```toml
app = "unified-analytics-api"
primary_region = "iad"

[build]
  builder = "heroku/buildpacks:20"

[http_service]
  internal_port = 3000
  force_https = true

[env]
  NODE_ENV = "production"
```

---

## Database Setup

### Railway PostgreSQL

Automatically provisioned when you add PostgreSQL service. Connection string available as `DATABASE_URL`.

### Supabase (Alternative)

1. Create project at supabase.com
2. Get connection string from Settings → Database
3. Use connection pooler URL for serverless

### Neon (Alternative)

1. Create project at neon.tech
2. Get connection string from Dashboard
3. Use pooled connection for serverless

### Schema Migration

```bash
# Using Prisma
npx prisma migrate deploy

# Using raw SQL
psql $DATABASE_URL < schema.sql
```

---

## Embedding in GoHighLevel

### Step 1: Deploy Dashboard

Ensure your dashboard is deployed and accessible at a public URL (e.g., `https://analytics.yourdomain.com`).

### Step 2: Configure CORS/CSP Headers

Your dashboard must allow embedding from GHL domains:

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.gohighlevel.com https://*.leadconnectorhq.com https://*.msgsndr.com"
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          }
        ]
      }
    ];
  }
};
```

### Step 3: Add Custom Menu Link in GHL

1. Log into GoHighLevel
2. Go to **Settings** → **Custom Menu Links**
3. Click **Add New Link**
4. Configure:
   - **Link Name**: Analytics Dashboard
   - **Link URL**: `https://analytics.yourdomain.com/dashboard`
   - **Icon**: Choose an icon (chart, graph, etc.)
   - **Open In**: Iframe (not new tab)
5. Save

### Step 4: Pass Context (Optional)

GHL can pass context via URL parameters:

```
https://analytics.yourdomain.com/dashboard?location_id={{location.id}}&user_id={{user.id}}
```

Your dashboard can read these to filter data:

```typescript
// app/dashboard/page.tsx
export default function Dashboard({ searchParams }) {
  const locationId = searchParams.location_id;
  const userId = searchParams.user_id;

  // Filter data based on location/user
}
```

---

## Embedding in Other Platforms

### Generic Iframe

```html
<iframe
  src="https://analytics.yourdomain.com/dashboard"
  style="width: 100%; height: 100vh; border: none;"
  title="Analytics Dashboard"
></iframe>
```

### With Authentication Token

```html
<iframe
  src="https://analytics.yourdomain.com/dashboard?token=xxx"
  style="width: 100%; height: 100vh; border: none;"
></iframe>
```

### Responsive Embed

```html
<div style="position: relative; width: 100%; padding-top: 56.25%;">
  <iframe
    src="https://analytics.yourdomain.com/dashboard"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
  ></iframe>
</div>
```

---

## Standalone Deployment

The dashboard works perfectly as a standalone application:

1. Deploy to Vercel/Netlify
2. Set up authentication (NextAuth, Clerk, etc.)
3. Access directly at your domain

No iframe needed — full standalone experience.

---

## Environment Configuration

### Development

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCK=true
DATABASE_URL=postgresql://localhost:5432/analytics_dev
```

### Staging

```env
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com
NEXT_PUBLIC_USE_MOCK=false
DATABASE_URL=postgresql://staging-db-url
```

### Production

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_USE_MOCK=false
DATABASE_URL=postgresql://production-db-url
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      # Vercel auto-deploys from GitHub

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: railwayapp/github-cli@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Health Checks

### Backend Health Endpoint

```typescript
// api/health/route.ts
export async function GET() {
  try {
    // Check database
    await db.$queryRaw`SELECT 1`;

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

### Monitoring

- **Uptime**: Use UptimeRobot, Pingdom, or Better Uptime
- **Errors**: Sentry for error tracking
- **Logs**: Railway/Vercel built-in logs or Axiom

---

## Security Checklist

### Before Going Live

- [ ] All API keys are in environment variables (not code)
- [ ] HTTPS enforced on all endpoints
- [ ] CSP headers configured for embedding
- [ ] Rate limiting enabled on API
- [ ] Authentication implemented (if standalone)
- [ ] Database backups configured
- [ ] Webhook signatures verified (Stripe, etc.)
- [ ] CORS properly configured
- [ ] Sensitive routes protected

### Stripe Webhook Security

```typescript
// Always verify webhook signatures
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## Cost Estimates

### Hobby/Starter Tier

| Service | Cost |
|---------|------|
| Vercel (Frontend) | Free |
| Railway (Backend + DB) | ~$5-20/mo |
| **Total** | ~$5-20/mo |

### Production Tier

| Service | Cost |
|---------|------|
| Vercel Pro | $20/mo |
| Railway Pro | $20-50/mo |
| Monitoring (Sentry) | $26/mo |
| **Total** | ~$70-100/mo |

---

## Troubleshooting

### Dashboard Not Loading in GHL

1. Check CSP headers allow GHL domains
2. Verify HTTPS is enabled
3. Check browser console for errors
4. Try accessing dashboard URL directly first

### Data Not Showing

1. Verify `NEXT_PUBLIC_USE_MOCK=false`
2. Check backend is running and accessible
3. Verify API URL is correct
4. Check backend logs for errors

### Webhooks Not Working

1. Verify webhook URL is publicly accessible
2. Check webhook signing secret is correct
3. Review webhook logs in Stripe Dashboard
4. Ensure Railway service is running
