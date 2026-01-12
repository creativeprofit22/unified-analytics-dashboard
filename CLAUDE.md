# Unified Analytics Dashboard

## Pipeline State
Phase: build
Feature: Recharts Integration
Features-Remaining: 9

## UI Roadmap

### In Progress
- **Recharts Integration** - Replace custom SVG TrendChart with interactive Recharts

### Pending (Priority Order)
1. **Interactive Tooltips** - Hover states on charts showing exact values, dates
2. **Comparison Mode** - Period-over-period UI (vs last 30d, vs last year)
3. **Source/Segment Filters** - Filter dashboard by traffic source, campaign, segment
4. **Table Search/Filter** - Search and sort within DataTable components
5. **Export (CSV/PDF)** - Download reports functionality
6. **Real-time Updates** - WebSocket/polling for live data refresh
7. **Embed Mode** - iframe-optimized view with postMessage API
8. **Authentication** - JWT/session management for production
9. **Settings Page** - User preferences (theme, default time range, etc.)

## Last Session (2026-01-12)
**Feature**: Time Range UI Selector - BUILT
- Created TimeRangePicker.tsx with presets (7D/30D/90D/12M/YTD/Custom)
- Extended TimeRange type to include 'ytd', '12m', 'custom'
- Added CustomDateRange interface
- Integrated with page.tsx state management
- Mobile-responsive (dropdown on mobile, button group on desktop)
- TypeCheck: PASS

## Previous Session (2026-01-12)
**Feature**: Dashboard UI Components - VALIDATED & REFACTORED
- Built: MetricCard, TrendChart, CategorySection, Dashboard (10 analytics categories)
- Fixed 6 critical/high bugs
- Split 1040-line Dashboard.tsx into 10 section files + 4 shared components

## Completed Features
- **Time Range UI Selector**: Built (2026-01-12)
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
