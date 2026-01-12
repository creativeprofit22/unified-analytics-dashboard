# Refactoring Report: Dashboard UI Components

**Date**: 2026-01-12
**Phase**: refactor-hunt
**Feature**: Dashboard UI Components

## Summary

| Priority | Count | Issues |
|----------|-------|--------|
| High     | 4     | DRY violations, file size |
| Medium   | 3     | Repeated patterns, type safety |
| Low      | 2     | Minor improvements |

---

## High Priority

### 1. Mock Data in `createMetric` Calls (Dashboard.tsx)

**Location**: Lines 102-135, 169-209, 273-305, 357-388, 419-459, 501-542, 559-600, 836-876
**Issue**: DRY violation / Hardcoded mock values

The `createMetric` function is called ~50 times with hardcoded multipliers for "previous" values:

```tsx
// Current (mock data pattern repeated 50+ times)
createMetric(data.sessions, data.sessions * 0.9)
createMetric(data.bounceRate, data.bounceRate * 1.05)
createMetric(data.grossRevenue, data.grossRevenue * 0.85)
```

**Problem**: These are placeholder values simulating period-over-period comparison. The multipliers (0.85, 0.88, 0.9, 0.92, 0.95, 1.05, 1.1) are meaningless.

**Recommendation**: The analytics data type should include `previous` values from the API:

```tsx
// Updated type structure
interface TrafficData {
  sessions: { current: number; previous: number };
  uniqueVisitors: { current: number; previous: number };
  // ...
}

// Clean usage
<MetricCard
  title="Sessions"
  metric={createMetric(data.sessions.current, data.sessions.previous)}
  format="number"
/>
```

**Impact**: ~50 lines changed, requires type updates

---

### 2. Repeated Small Card Pattern (Dashboard.tsx)

**Location**: Lines 143-156, 469-485, 650-666, 729-746, 802-816
**Issue**: DRY violation

The same card UI pattern appears 5+ times:

```tsx
<div className="p-3 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.03))] text-center">
  <p className="text-xs text-[var(--text-secondary)]">{label}</p>
  <p className="text-lg font-semibold text-[var(--text-primary)]">{value}</p>
</div>
```

**Recommendation**: Extract `StatCard` component:

```tsx
interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: ReactNode;
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <div className="p-3 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.03))] text-center">
      {icon && <span className="text-2xl mb-2">{icon}</span>}
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className={cn("text-lg font-semibold", color ?? "text-[var(--text-primary)]")}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
```

**Impact**: ~80 lines reduced, improved consistency

---

### 3. Repeated Table Pattern (Dashboard.tsx)

**Location**: Lines 218-254, 756-791, 932-970
**Issue**: DRY violation

Three tables with identical structure:

```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="text-left text-[var(--text-secondary)] border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
        ...
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr className="border-b border-[var(--border-color,rgba(255,255,255,0.05))]">
          ...
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

**Recommendation**: Extract `DataTable` component:

```tsx
interface Column<T> {
  key: keyof T;
  header: string;
  align?: 'left' | 'right';
  render?: (value: T[keyof T], item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
}

function DataTable<T>({ data, columns, keyField }: DataTableProps<T>) { ... }
```

**Impact**: ~100 lines reduced, type-safe table rendering

---

### 4. File Size (Dashboard.tsx)

**Location**: Entire file (1040 lines)
**Issue**: Maintainability / Complexity

Single file contains 10 section components + helpers. Hard to navigate and test.

**Recommendation**: Split into individual files:

```
src/components/dashboard/
├── index.ts
├── Dashboard.tsx           # Main orchestrator (~50 lines)
├── sections/
│   ├── TrafficSection.tsx
│   ├── SEOSection.tsx
│   ├── ConversionsSection.tsx
│   ├── RevenueSection.tsx
│   ├── SubscriptionsSection.tsx
│   ├── PaymentsSection.tsx
│   ├── UnitEconomicsSection.tsx
│   ├── DemographicsSection.tsx
│   ├── SegmentationSection.tsx
│   └── CampaignsSection.tsx
└── shared/
    ├── StatCard.tsx
    ├── DataTable.tsx
    ├── SectionHeader.tsx
    └── createMetric.ts
```

**Impact**: Better testability, easier navigation, clearer ownership

---

## Medium Priority

### 5. Section Sub-Header Pattern (Dashboard.tsx)

**Location**: Lines 140, 214, 309, 393, 465, 621, 647, 674, 726, 753, 799, 882, 929
**Issue**: DRY violation

Same heading pattern repeated 13 times:

```tsx
<h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
  {title}
</h4>
```

**Recommendation**: Extract `SectionHeader` component:

```tsx
function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
      {children}
    </h4>
  );
}
```

**Impact**: Minor (~20 lines), but improves consistency for future style changes

---

### 6. Random ID Generation (TrendChart.tsx:80)

**Location**: Line 80
**Issue**: SSR hydration risk

```tsx
const uniqueId = useMemo(() => Math.random().toString(36).slice(2, 9), []);
```

Using `Math.random()` in React can cause hydration mismatches in SSR because server and client generate different values.

**Recommendation**: Use `React.useId()`:

```tsx
const uniqueId = React.useId();
const gradientId = `trend-gradient-${uniqueId}`;
```

**Impact**: 2 lines changed, prevents SSR bugs

---

### 7. Padding Object Recreation (TrendChart.tsx:22)

**Location**: Line 22
**Issue**: Object created on every render

```tsx
const padding = { top: 8, right: 8, bottom: 8, left: 8 };
```

This object is recreated on every render and used in useMemo dependencies.

**Recommendation**: Move outside component or use constant:

```tsx
const CHART_PADDING = { top: 8, right: 8, bottom: 8, left: 8 } as const;
// or
const CHART_PADDING = 8; // Since all values are the same
```

**Impact**: 1 line, minor perf improvement

---

## Low Priority

### 8. Magic Number in Collapse Animation (CategorySection.tsx:113)

**Location**: Line 113
**Issue**: Arbitrary value

```tsx
isCollapsed ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100"
```

`5000px` is a magic number that may not work for all content sizes.

**Recommendation**: Use CSS grid animation pattern:

```tsx
<div
  className={cn(
    "grid transition-all duration-200",
    isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
  )}
>
  <div className="overflow-hidden">{children}</div>
</div>
```

**Impact**: 3 lines, smoother collapse for any content height

---

### 9. Unused TimeRange Flexibility (Dashboard.tsx:996)

**Location**: Line 996
**Issue**: Hardcoded default

`TimeRange` type is imported but the component hardcodes `"30d"`:

```tsx
export function Dashboard({ timeRange = "30d", className }: DashboardProps)
```

And in page.tsx:
```tsx
<Dashboard timeRange="30d" />
```

This isn't a bug, but the time range selector UI doesn't exist yet. Consider adding time range picker or removing the prop if not planned.

**Impact**: Documentation / planning decision

---

## Refactoring Order

1. **SSR Fix** (#6) - Quick fix, prevents bugs
2. **Extract StatCard** (#2) - Biggest DRY win with least risk
3. **Extract DataTable** (#3) - Generalizes table pattern
4. **Extract SectionHeader** (#5) - Quick extraction
5. **Split Dashboard** (#4) - Larger refactor, do after extractions
6. **Fix mock data** (#1) - Requires API/type changes, coordinate with backend
7. **Padding constant** (#7) - Minor, do anytime
8. **Collapse animation** (#8) - Minor UX improvement
9. **TimeRange** (#9) - Feature decision

---

## Files Changed

| File | Lines | Status |
|------|-------|--------|
| MetricCard.tsx | 137 | Clean |
| TrendChart.tsx | 159 | 2 issues (Med, Med) |
| CategorySection.tsx | 123 | 1 issue (Low) |
| Dashboard.tsx | 1040 | 5 issues (4 High, 1 Low) |
| page.tsx | 17 | Clean |
