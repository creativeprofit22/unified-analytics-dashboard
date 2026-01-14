# Unified Analytics Dashboard

## Pipeline State
Phase: refactor-hunt
Feature: Custom Report Builder
Files-Validated: src/types/report-builder.ts, src/lib/mock/report-builder.ts, src/lib/export/*.ts, src/components/report-builder/*.tsx, src/app/api/reports/*.ts, src/hooks/useReportBuilder.ts, src/app/reports/page.tsx
Validation-Report: reports/validation-custom-report-builder.md

## UI Roadmap

### Completed
- **ECharts Integration** - Replaced custom SVG TrendChart with interactive ECharts (2026-01-12)
- **Interactive Tooltips** - Hover states on charts showing exact values, dates, % change
- **Comparison Mode** - ComparisonToggle, ComparisonView, period-over-period UI
- **Source/Segment Filters** - FilterPanel, FilterChip components
- **Export (CSV/PDF)** - ExportButton, ExportModal components
- **Time Range UI Selector** - TimeRangePicker with presets + custom range
- **Dashboard UI Components** - MetricCard, CategorySection, 10 section files
- **Tab Navigation** - TabNavigation, TabPanel components
- **Theme Toggle** - ThemeToggle component
- **Settings Page** - User preferences (theme, default time range, etc.)

### Phase 1: Alerting & Monitoring (Current)
1. **Anomaly Detection** - Flag unusual drops/spikes in metrics (conversion rate, traffic, churn)
2. **Threshold Alerts** - Configurable alerts when metrics cross limits (MRR < target, CAC > limit)
3. **Goal Tracking** - Set KPI targets with progress indicators

### Phase 2: Predictive Analytics
1. **Revenue Forecasting** - Project MRR/ARR based on cohort trends
2. **Churn Prediction** - Identify at-risk subscribers before they cancel
3. **LTV Projection** - Estimate future customer value from early behavior

### Phase 3: Attribution & Analysis
1. **Multi-touch Attribution** - First-touch, last-touch, linear, time-decay models
2. **Channel ROI Calculator** - True cost/benefit per acquisition channel
3. **A/B Test Integration** - Track experiment impact on conversions

### Phase 4: Reporting & Collaboration
1. **Custom Report Builder** - Drag-and-drop metrics, save templates
2. **Scheduled Email Reports** - Daily/weekly digests to stakeholders
3. **Annotations** - Mark product launches, marketing campaigns, incidents on charts

### Backlog
- **Real-time Updates** - WebSocket/polling for live data refresh
- **Embed Mode** - iframe-optimized view with postMessage API
- **Authentication** - JWT/session management for production
- **Data Source Status** - Health check for GA4, Stripe, Search Console connections
- **Multi-workspace** - Team/client separation with different permissions

## Last Session (2026-01-14)
**Feature**: Custom Report Builder - VALIDATED
- Types: MetricDefinition, ReportTemplate, ReportMetric, ExportFormat, ReportData
- Mock: 30 metrics across 6 categories, 4 default templates
- Export: 6 formats (CSV, Excel, PDF, Markdown, JSON, PNG) with utils
- Components: ReportBuilder, MetricSelector, ReportPreview, MetricCard, TemplateModal
- API: /api/reports (CRUD), /api/reports/[templateId], /api/reports/export
- Hook: useReportBuilder with SWR, save/update/delete/export methods
- Page: /reports with export integration
- Fixed 4 critical bugs: order validation off-by-one, percentage formatting, null assertions, random render jitter
- TypeCheck: PASS, Build: PASS
- Validation Report: reports/validation-custom-report-builder.md

## Previous Sessions
- **Channel ROI Calculator**: Built and validated (2026-01-14)
- **Time Range UI Selector**: Built TimeRangePicker with presets (2026-01-12)
- **Dashboard UI Components**: Built, validated, refactored - split into 10 sections (2026-01-12)

## Completed Features
- **Phase 3 Advanced Features**: Data Export, Benchmarks, Custom Dashboards - Validated (2026-01-13)
- **ECharts TrendChart**: Built (2026-01-12)
- **Time Range UI Selector**: Built (2026-01-12)
- **Comparison Mode**: ComparisonToggle, ComparisonView (2026-01-12)
- **Filters**: FilterPanel, FilterChip (2026-01-12)
- **Export**: ExportButton, ExportModal (2026-01-12)
- **Dashboard UI Components**: Built, validated, refactored (2026-01-12)
- **Complete Analytics Types**: Built 74 types, validated, refactored (2026-01-12)
- **Data Hooks**: useAnalytics, usePlatformAnalytics, useHealthCheck (2026-01-12)

---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
