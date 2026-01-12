# Refactor Report: Complete Analytics Types

**Feature**: Complete Analytics Types
**Date**: 2026-01-12
**Phase**: refactor-hunt → refactoring
**Files Analyzed**: 3
**Total Issues**: 21

---

## Summary

| Severity | Count | Files Affected |
|----------|-------|----------------|
| High     | 3     | route.ts, index.ts |
| Medium   | 7     | All 3 files |
| Low      | 11    | All 3 files |

---

## High Priority

### H1. Mock Data Generators in Route File

**File**: `src/app/api/analytics/route.ts`
**Lines**: 45-740 (695 lines!)
**Issue**: 73% of route file is mock data generation. Violates separation of concerns.
**Fix**: Move all mock generators to `/src/lib/mock/analytics.ts`
**Impact**: Route drops to ~200 lines, mock data becomes testable, easier to swap for real APIs

```typescript
// Create: src/lib/mock/analytics.ts
export function getUnifiedMockData(): UnifiedAnalyticsData { ... }
export function getLegacyMockData(days: number): AnalyticsData { ... }
export { getCachedUnifiedMockData, getCachedLegacyMockData };

// In route.ts:
import { getCachedUnifiedMockData, getCachedLegacyMockData } from '@/lib/mock/analytics';
```

---

### H2. GET Handler Function Too Long

**File**: `src/app/api/analytics/route.ts`
**Lines**: 801-948 (147 lines)
**Issue**: Handler does too much: parsing, validation, branching, filtering, response formatting
**Fix**: Extract into focused functions

```typescript
function parseParams(request: NextRequest): ParsedParams
function handleLegacyRequest(params: ParsedParams, isMock: boolean): NextResponse
function handleUnifiedRequest(params: ParsedParams, isMock: boolean): NextResponse
```

**Impact**: Testability, readability, easier to add categories

---

### H3. Interfaces Defined in Barrel File

**File**: `src/types/index.ts`
**Lines**: 199-217
**Issue**: `PlatformAnalyticsData` and `HealthResponse` defined directly in barrel file
**Fix**: Move to `api.ts`, re-export from `index.ts`

```typescript
// Move to src/types/api.ts:
export interface PlatformAnalyticsData {
  platform: Platform;
  metrics: OverviewStats;
  trend: TrendDataPoint[];
  content: ContentItem[];
  profile: ProfileStats | null;
}

export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  mockMode: boolean;
  version?: string;
}

// In index.ts:
export type { PlatformAnalyticsData, HealthResponse } from "./api";
```

**Impact**: Follows barrel file best practices, improves discoverability

---

## Medium Priority

### M1. Duplicated Response Construction

**File**: `src/app/api/analytics/route.ts`
**Lines**: 848-857, 885-893, 896-903, 917-925, 929-936
**Issue**: `NextResponse.json({ success, data, timestamp })` repeated 5 times
**Fix**: Create response helpers

```typescript
function successResponse<T>(data: T, isMock: boolean): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }, {
    headers: { 'Cache-Control': isMock ? 's-maxage=30' : 's-maxage=60' }
  });
}

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  }, { status });
}
```

---

### M2. Duplicated Platform Filtering Logic

**File**: `src/app/api/analytics/route.ts`
**Lines**: 839-857, 908-925
**Issue**: Platform filtering appears twice (mock and non-mock branches)
**Fix**: Extract to function

```typescript
function filterLegacyDataByPlatform(data: AnalyticsData, platform: string): AnalyticsData {
  if (platform === "all") return data;
  return {
    ...data,
    topContent: data.topContent.filter((c) => c.platform === platform),
    platformBreakdown: data.platformBreakdown.filter((p) => p.platform === platform),
    profiles: data.profiles.filter((p) => p.platform === platform),
  };
}
```

---

### M3. Inline import() Type Construction

**File**: `src/types/index.ts`
**Lines**: 184-207, 224-270
**Issue**: Verbose `import("./analytics").SomeType` syntax
**Fix**: Move composed types to `api.ts` or `responses.ts`

```typescript
// In api.ts:
export type AnalyticsResponse = ApiResponse<AnalyticsData>;
export type UnifiedAnalyticsResponse = ApiResponse<UnifiedAnalyticsData>;
export type TrafficResponse = ApiResponse<TrafficMetrics>;
// ... etc
```

---

### M4. Legacy Types Mixed with Modern

**File**: `src/types/analytics.ts`
**Lines**: 782-859
**Issue**: Deprecated social media types in same file as unified analytics
**Fix**: Move to `analytics-legacy.ts`

```
src/types/
  analytics.ts        # Modern unified types only
  analytics-legacy.ts # Deprecated Platform, AnalyticsData, etc.
  index.ts           # Re-exports from both
```

---

### M5. Similar Cohort Types Could Be Unified

**File**: `src/types/analytics.ts`
**Lines**: 300-304, 389-393, 554-559
**Issue**: Three cohort types with overlapping structure
**Fix**: Create base type and extend

```typescript
interface BaseCohort {
  cohort: string;
}

interface CohortRetention extends BaseCohort {
  retentionByMonth: number[];
}

interface LTVCohort extends BaseCohort {
  ltvByMonth: number[];
}

interface CohortSegment extends BaseCohort {
  users: number;
  retentionCurve: number[];
  cumulativeLtv: number[];
}
```

---

### M6. Repeated Array-of-Object Patterns

**File**: `src/types/analytics.ts`
**Lines**: 478-489, 497
**Issue**: Multiple `{ [label]: string; users: number }` patterns
**Fix**: Create generic utility type

```typescript
type LabeledCount<T extends string = 'label'> = { [K in T]: string } & { users: number };

// Usage:
byModel: LabeledCount<'model'>[];
byLanguage: LabeledCount<'language'>[];
byInterest: LabeledCount<'interest'>[];
```

---

### M7. Multiple Import Statements from Same Module

**File**: `src/types/index.ts`
**Lines**: 10-160
**Issue**: 12 separate export statements from `"./analytics"`
**Fix**: Consolidate into single export with comment sections

```typescript
export type {
  // Core
  TimeRange, ChangeType, Metric, TrendDataPoint,
  // Traffic
  TrafficSource, CoreWebVitals, TrafficMetrics,
  // SEO
  KeywordRanking, SearchQuery, SEOMetrics,
  // ... etc
} from "./analytics";
```

---

## Low Priority

### L1. Inconsistent Record vs Interface Usage

**File**: `src/types/analytics.ts`
**Lines**: 98-99
**Issue**: `trafficBySource: Record<string, number>` loses type safety
**Fix**: Use defined union type

```typescript
trafficBySource: Record<TrafficSource, number>;
// Or partial:
trafficBySource: Partial<Record<TrafficSource, number>>;
```

---

### L2. TrafficSource Type Unused

**File**: `src/types/analytics.ts`
**Line**: 73
**Issue**: Defined but never used
**Fix**: Either use it (L1 above) or remove it

---

### L3. Inline Object Type in CrossSegmentComparison

**File**: `src/types/analytics.ts`
**Lines**: 612-619
**Issue**: Anonymous type repeated
**Fix**: Extract `SegmentRef` type

```typescript
interface SegmentRef { type: string; value: string; }
```

---

### L4. byChannel Could Use CampaignChannel Type

**File**: `src/types/analytics.ts`
**Lines**: 739-745
**Issue**: Hardcoded keys instead of using union type
**Fix**: `byChannel: Record<CampaignChannel, ChannelMetrics>`

---

### L5. Inconsistent Unit Comments

**File**: `src/types/analytics.ts`
**Lines**: Various (97, 334, 373, 409)
**Issue**: Some fields document units, others don't
**Fix**: Add consistent JSDoc for all duration/time fields

---

### L6. Cache Not Resilient to Hot Reload

**File**: `src/app/api/analytics/route.ts`
**Lines**: 770-789
**Issue**: Module-scope cache resets on Turbopack hot reload
**Fix**: Use `globalThis` pattern per CLAUDE.md lessons

```typescript
const globalCache = globalThis as unknown as {
  __unifiedMockDataCache?: UnifiedAnalyticsData;
  __legacyMockDataCache?: Map<number, AnalyticsData>;
};
```

---

### L7. Category Map Created Per Request

**File**: `src/app/api/analytics/route.ts`
**Lines**: 864-875
**Issue**: `categoryMap` object created on every request
**Fix**: Define at module level as const

```typescript
const CATEGORY_TO_KEY = {
  traffic: "traffic",
  seo: "seo",
  // ...
} as const satisfies Record<string, keyof UnifiedAnalyticsData>;
```

---

### L8. Deprecated Types Without Migration Path

**File**: `src/types/index.ts`
**Lines**: 150-207
**Issue**: `@deprecated` without code examples or removal timeline
**Fix**: Enhance deprecation notices

---

### L9. Unused days Parameter in Unified Mode

**File**: `src/app/api/analytics/route.ts`
**Lines**: 834, 860, 927
**Issue**: `days` calculated but ignored in unified mode
**Fix**: Pass to generator or document behavior

---

### L10. Mock Data Uses Non-Deterministic Random

**File**: `src/app/api/analytics/route.ts`
**Lines**: 45-60, 351-359
**Issue**: `Math.random()` makes tests non-deterministic
**Fix**: Use seeded random for predictable test data

---

### L11. RecoveryByAttempt Uses Fixed Keys

**File**: `src/types/analytics.ts`
**Lines**: 346-351
**Issue**: Hardcodes exactly 4 dunning attempts
**Fix**: Use array or make flexible (low priority, current approach is clear)

---

## Recommended Execution Order

### Phase 1: Structural (H1, H2, H3)
1. **H1**: Extract mock data to `/src/lib/mock/` - biggest impact
2. **H3**: Move interfaces from barrel file - quick fix
3. **H2**: Split GET handler - improves maintainability

### Phase 2: DRY Cleanup (M1, M2)
4. **M1**: Extract response helpers
5. **M2**: Extract platform filtering

### Phase 3: Type Organization (M3, M4, M5)
6. **M3**: Move composed types from barrel
7. **M4**: Separate legacy types
8. **M5**: Unify cohort types

### Phase 4: Low Priority (as time permits)
- L1-L4: Quick type safety improvements
- L5-L11: Nice to have, lower impact

---

## Estimated Impact

After refactoring:
- `route.ts`: 949 → ~250 lines (-74%)
- `index.ts`: 272 → ~100 lines (-63%)
- `analytics.ts`: 860 → ~700 lines (-19%, after legacy extraction)
- New files: `lib/mock/analytics.ts`, `types/analytics-legacy.ts`
