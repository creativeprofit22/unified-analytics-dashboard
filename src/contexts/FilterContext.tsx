"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  FilterState,
  FilterOptions,
  TrafficSource,
  CampaignChannel,
} from "@/types";
import { DEFAULT_FILTER_STATE } from "@/types";

interface FilterContextValue {
  /** Current filter state */
  filters: FilterState;
  /** Available options for each filter */
  options: FilterOptions;
  /** Set available filter options (called when data loads) */
  setOptions: (options: FilterOptions) => void;
  /** Toggle a traffic source filter */
  toggleSource: (source: TrafficSource) => void;
  /** Toggle a campaign channel filter */
  toggleChannel: (channel: CampaignChannel) => void;
  /** Toggle a campaign name filter */
  toggleCampaign: (campaign: string) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Clear a specific filter category */
  clearCategory: (category: keyof FilterState) => void;
  /** Check if any filters are active */
  hasActiveFilters: boolean;
  /** Count of active filters */
  activeFilterCount: number;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

const STORAGE_KEY = "analytics-filters";

function getStoredFilters(): FilterState {
  if (typeof window === "undefined") return DEFAULT_FILTER_STATE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        sources: Array.isArray(parsed.sources) ? parsed.sources : [],
        channels: Array.isArray(parsed.channels) ? parsed.channels : [],
        campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : [],
      };
    }
  } catch {
    // Invalid stored data, use defaults
  }
  return DEFAULT_FILTER_STATE;
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [options, setOptions] = useState<FilterOptions>({
    sources: [],
    channels: [],
    campaigns: [],
  });
  const [mounted, setMounted] = useState(false);

  // Initialize filters from localStorage
  useEffect(() => {
    const stored = getStoredFilters();
    setFilters(stored);
    setMounted(true);
  }, []);

  // Persist filters to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters, mounted]);

  const toggleSource = useCallback((source: TrafficSource) => {
    setFilters((prev) => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter((s) => s !== source)
        : [...prev.sources, source],
    }));
  }, []);

  const toggleChannel = useCallback((channel: CampaignChannel) => {
    setFilters((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  }, []);

  const toggleCampaign = useCallback((campaign: string) => {
    setFilters((prev) => ({
      ...prev,
      campaigns: prev.campaigns.includes(campaign)
        ? prev.campaigns.filter((c) => c !== campaign)
        : [...prev.campaigns, campaign],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

  const clearCategory = useCallback((category: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [category]: [],
    }));
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      filters.sources.length > 0 ||
      filters.channels.length > 0 ||
      filters.campaigns.length > 0,
    [filters]
  );

  const activeFilterCount = useMemo(
    () =>
      filters.sources.length +
      filters.channels.length +
      filters.campaigns.length,
    [filters]
  );

  const value = useMemo(
    () => ({
      filters,
      options,
      setOptions,
      toggleSource,
      toggleChannel,
      toggleCampaign,
      clearFilters,
      clearCategory,
      hasActiveFilters,
      activeFilterCount,
    }),
    [
      filters,
      options,
      toggleSource,
      toggleChannel,
      toggleCampaign,
      clearFilters,
      clearCategory,
      hasActiveFilters,
      activeFilterCount,
    ]
  );

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <FilterContext.Provider
        value={{
          filters: DEFAULT_FILTER_STATE,
          options: { sources: [], channels: [], campaigns: [] },
          setOptions: () => {},
          toggleSource: () => {},
          toggleChannel: () => {},
          toggleCampaign: () => {},
          clearFilters: () => {},
          clearCategory: () => {},
          hasActiveFilters: false,
          activeFilterCount: 0,
        }}
      >
        {children}
      </FilterContext.Provider>
    );
  }

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
