# Refactor Report: Data Hooks

**Feature**: Data Hooks
**Phase**: refactor-hunt
**Date**: 2026-01-12
**Files Analyzed**: 5

## Summary

| Priority | Count | Description |
|----------|-------|-------------|
| High     | 2     | DRY violations, dead code |
| Medium   | 2     | Inconsistent patterns |
| Low      | 2     | Minor inconsistencies |

---

## High Priority

### 1. DRY Violation: useAnalytics and usePlatformAnalytics are 90% identical

**Files**: `useAnalytics.ts:60-90`, `usePlatformAnalytics.ts:72-106`

Both hooks follow the exact same pattern:
- useMemo for queryParams
- Conditional SWR key based on `enabled`
- useSWR call with same generic types
- useMemo wrapping identical return shape

**Duplicated code**:
```tsx
// Both hooks have this exact pattern:
return useMemo(
  () => ({
    data,
    error,
    isLoading,
    isValidating,
    isError: !!error,
    refresh: mutate,
  }),
  [data, error, isLoading, isValidating, mutate]
);
```

**Options**:
- A) Extract shared `createAnalyticsHook` factory function
- B) Create base `useBaseQuery` hook that wraps SWR
- C) Leave as-is (only 2 hooks, duplication is tolerable)

**Recommendation**: Option C. Two similar hooks is acceptable. A factory adds complexity for minimal gain. Only refactor if a third hook follows this pattern.

---

### 2. Dead Code: UseQueryResult and UseQueryOptions types are unused

**File**: `types.ts:19-54`

These types are exported but no hook uses them:
- `UseQueryResult<T>` - Generic return type
- `UseQueryOptions<T>` - Picked SWR config subset

Each hook defines its own return type instead (`UseAnalyticsReturn`, `UsePlatformAnalyticsReturn`, `UseHealthCheckReturn`).

**Options**:
- A) Delete unused types
- B) Refactor hooks to use these shared types
- C) Keep for future use (document as utility types)

**Recommendation**: Option A. Delete them. Custom return types per hook are more explicit and self-documenting. Generic types add indirection without benefit here.

---

## Medium Priority

### 3. Inconsistent return shapes across hooks

**Files**: All three hook files

| Hook | Returns `isError` | Returns `isValidating` | Extra Fields |
|------|-------------------|------------------------|--------------|
| useAnalytics | Yes | Yes | - |
| usePlatformAnalytics | Yes | Yes | - |
| useHealthCheck | No | No | `isHealthy`, `isMockMode` |

useHealthCheck omits standard SWR fields while adding domain-specific ones.

**Recommendation**: Accept this inconsistency. useHealthCheck has different semantics (health polling vs data fetching). `isHealthy` is the primary consumer concern, not `isError`.

---

### 4. healthCheckFetcher inlined vs shared fetchers pattern

**File**: `useHealthCheck.ts:37-39`

```tsx
// Inlined in useHealthCheck.ts
const healthCheckFetcher = (): Promise<HealthResponse> => {
  return analyticsClient.healthCheck();
};
```

Other hooks import fetchers from `@/lib/fetchers`:
```tsx
import { analyticsFetcher } from '@/lib/fetchers';
import { platformFetcher } from '@/lib/fetchers';
```

**Recommendation**: Move `healthCheckFetcher` to `@/lib/fetchers.ts` for consistency. Low impact but improves codebase predictability.

---

## Low Priority

### 5. Double ApiError import in types.ts

**File**: `types.ts:8-9`

```tsx
export { ApiError } from '@/lib/api-client';
import { ApiError } from '@/lib/api-client';
```

Re-export and import on consecutive lines. Works but redundant.

**Fix**: Combine into single re-export, use `typeof ApiError` for type guard, or import once and export separately.

---

### 6. SWR configs defined but not used by hooks

**File**: `types.ts:108-163`

Three configs exported:
- `defaultSwrConfig` - Not used by useAnalytics or usePlatformAnalytics
- `realtimeSwrConfig` - Not used anywhere
- `staticSwrConfig` - Not used anywhere

Both analytics hooks use SWR's default config. useHealthCheck defines inline config.

**Recommendation**: Either delete unused configs or document them as opt-in utilities for consumers. Check if any components use them before deleting.

---

## Recommended Actions

1. **Delete** `UseQueryResult` and `UseQueryOptions` from types.ts
2. **Move** `healthCheckFetcher` to `@/lib/fetchers.ts`
3. **Check usage** of SWR configs before deciding to keep or delete
4. **Accept** return shape differences between hooks (domain-appropriate)
5. **Accept** duplication between useAnalytics and usePlatformAnalytics (manageable)

## Files Modified (if refactored)

- `src/hooks/types.ts` - Remove unused types
- `src/hooks/useHealthCheck.ts` - Import fetcher from shared location
- `src/lib/fetchers.ts` - Add healthCheckFetcher (if exists)
