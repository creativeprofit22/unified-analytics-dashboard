"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Filter field configuration for a section
 */
export interface FilterFieldConfig {
  /** Unique key for this filter */
  key: string;
  /** Display label */
  label: string;
  /** Type of filter control */
  type: "select" | "multiselect" | "range" | "search";
  /** Available options (for select/multiselect) */
  options?: string[];
  /** Placeholder text for search */
  placeholder?: string;
  /** Min/max for range filters */
  range?: { min: number; max: number; step?: number };
}

/**
 * Active filter value - can be string, string[], or number range
 */
export type FilterValue = string | string[] | { min: number; max: number } | null;

/**
 * Active filters for a section (key -> value map)
 */
export type SectionFilters = Record<string, FilterValue>;

/**
 * Section filter state including config and active values
 */
interface SectionFilterState {
  /** Unique section identifier */
  sectionId: string;
  /** Available filter fields for this section */
  fields: FilterFieldConfig[];
  /** Currently active filter values */
  filters: SectionFilters;
}

/**
 * Context value for section filters
 */
interface SectionFilterContextValue {
  /** Get filters for a specific section */
  getFilters: (sectionId: string) => SectionFilters;
  /** Get filter config for a specific section */
  getConfig: (sectionId: string) => FilterFieldConfig[];
  /** Set filter config for a section (called when section mounts with data) */
  setConfig: (sectionId: string, fields: FilterFieldConfig[]) => void;
  /** Update a single filter value */
  setFilter: (sectionId: string, key: string, value: FilterValue) => void;
  /** Toggle a value in a multiselect filter */
  toggleFilter: (sectionId: string, key: string, value: string) => void;
  /** Clear all filters for a section */
  clearFilters: (sectionId: string) => void;
  /** Clear a specific filter */
  clearFilter: (sectionId: string, key: string) => void;
  /** Check if section has any active filters */
  hasActiveFilters: (sectionId: string) => boolean;
  /** Get count of active filters for a section */
  getActiveFilterCount: (sectionId: string) => number;
}

// =============================================================================
// CONTEXT
// =============================================================================

const SectionFilterContext = createContext<SectionFilterContextValue | undefined>(
  undefined
);

// =============================================================================
// PROVIDER
// =============================================================================

export function SectionFilterProvider({ children }: { children: ReactNode }) {
  // State: map of sectionId -> { fields, filters }
  const [sections, setSections] = useState<Record<string, SectionFilterState>>({});

  const getFilters = useCallback(
    (sectionId: string): SectionFilters => {
      return sections[sectionId]?.filters ?? {};
    },
    [sections]
  );

  const getConfig = useCallback(
    (sectionId: string): FilterFieldConfig[] => {
      return sections[sectionId]?.fields ?? [];
    },
    [sections]
  );

  const setConfig = useCallback(
    (sectionId: string, fields: FilterFieldConfig[]) => {
      setSections((prev) => ({
        ...prev,
        [sectionId]: {
          sectionId,
          fields,
          filters: prev[sectionId]?.filters ?? {},
        },
      }));
    },
    []
  );

  const setFilter = useCallback(
    (sectionId: string, key: string, value: FilterValue) => {
      setSections((prev) => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          sectionId,
          fields: prev[sectionId]?.fields ?? [],
          filters: {
            ...(prev[sectionId]?.filters ?? {}),
            [key]: value,
          },
        },
      }));
    },
    []
  );

  const toggleFilter = useCallback(
    (sectionId: string, key: string, value: string) => {
      setSections((prev) => {
        const currentFilters = prev[sectionId]?.filters ?? {};
        const currentValue = currentFilters[key];
        let newValue: string[];

        if (Array.isArray(currentValue)) {
          newValue = currentValue.includes(value)
            ? currentValue.filter((v) => v !== value)
            : [...currentValue, value];
        } else {
          newValue = [value];
        }

        return {
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            sectionId,
            fields: prev[sectionId]?.fields ?? [],
            filters: {
              ...currentFilters,
              [key]: newValue.length > 0 ? newValue : null,
            },
          },
        };
      });
    },
    []
  );

  const clearFilters = useCallback((sectionId: string) => {
    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        sectionId,
        fields: prev[sectionId]?.fields ?? [],
        filters: {},
      },
    }));
  }, []);

  const clearFilter = useCallback((sectionId: string, key: string) => {
    setSections((prev) => {
      const { [key]: _, ...rest } = prev[sectionId]?.filters ?? {};
      return {
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          sectionId,
          fields: prev[sectionId]?.fields ?? [],
          filters: rest,
        },
      };
    });
  }, []);

  const hasActiveFilters = useCallback(
    (sectionId: string): boolean => {
      const filters = sections[sectionId]?.filters ?? {};
      return Object.values(filters).some((v) => {
        if (v === null || v === undefined) return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "object") return v.min !== undefined || v.max !== undefined;
        return v !== "";
      });
    },
    [sections]
  );

  const getActiveFilterCount = useCallback(
    (sectionId: string): number => {
      const filters = sections[sectionId]?.filters ?? {};
      return Object.values(filters).filter((v) => {
        if (v === null || v === undefined) return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "object") return v.min !== undefined || v.max !== undefined;
        return v !== "";
      }).length;
    },
    [sections]
  );

  const value = useMemo(
    () => ({
      getFilters,
      getConfig,
      setConfig,
      setFilter,
      toggleFilter,
      clearFilters,
      clearFilter,
      hasActiveFilters,
      getActiveFilterCount,
    }),
    [
      getFilters,
      getConfig,
      setConfig,
      setFilter,
      toggleFilter,
      clearFilters,
      clearFilter,
      hasActiveFilters,
      getActiveFilterCount,
    ]
  );

  return (
    <SectionFilterContext.Provider value={value}>
      {children}
    </SectionFilterContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Access section filter context
 */
export function useSectionFilterContext(): SectionFilterContextValue {
  const context = useContext(SectionFilterContext);
  if (!context) {
    throw new Error(
      "useSectionFilterContext must be used within a SectionFilterProvider"
    );
  }
  return context;
}

/**
 * Hook for a specific section's filters with automatic config setup
 */
export function useSectionFilters(
  sectionId: string,
  initialFields?: FilterFieldConfig[]
) {
  const ctx = useSectionFilterContext();
  const configSetRef = useRef(false);

  // Set up config on mount if provided (run once)
  useEffect(() => {
    if (initialFields && initialFields.length > 0 && !configSetRef.current) {
      configSetRef.current = true;
      ctx.setConfig(sectionId, initialFields);
    }
  }, [sectionId, initialFields, ctx]);

  return {
    filters: ctx.getFilters(sectionId),
    fields: ctx.getConfig(sectionId),
    setFilter: (key: string, value: FilterValue) =>
      ctx.setFilter(sectionId, key, value),
    toggleFilter: (key: string, value: string) =>
      ctx.toggleFilter(sectionId, key, value),
    clearFilters: () => ctx.clearFilters(sectionId),
    clearFilter: (key: string) => ctx.clearFilter(sectionId, key),
    hasActiveFilters: ctx.hasActiveFilters(sectionId),
    activeFilterCount: ctx.getActiveFilterCount(sectionId),
  };
}
