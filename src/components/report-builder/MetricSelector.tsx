"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { cn } from "@/utils/cn";
import type { MetricDefinition, MetricCategory } from "@/types/report-builder";

// =============================================================================
// TYPES
// =============================================================================

export interface MetricSelectorProps {
  metrics: MetricDefinition[];
  selectedMetricIds: Set<string>;
  onAddMetric: (metricId: string) => void;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CATEGORY_TABS: { value: MetricCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "traffic", label: "Traffic" },
  { value: "conversions", label: "Conversions" },
  { value: "revenue", label: "Revenue" },
  { value: "engagement", label: "Engagement" },
  { value: "attribution", label: "Attribution" },
  { value: "roi", label: "ROI" },
];

const CATEGORY_COLORS: Record<MetricCategory, string> = {
  traffic: "#3b82f6",
  conversions: "#22c55e",
  revenue: "#f59e0b",
  engagement: "#ec4899",
  attribution: "#8b5cf6",
  roi: "#06b6d4",
};

const UNIT_LABELS: Record<string, string> = {
  number: "#",
  currency: "$",
  percentage: "%",
  duration: "time",
};

// =============================================================================
// STATIC STYLES
// =============================================================================

const headerStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const subheaderStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const cardBgStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
};

const borderStyle = {
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput = memo(function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
        style={{ color: "var(--text-secondary, rgba(255,255,255,0.4))" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search metrics..."
        className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm outline-none transition-colors focus:border-blue-500"
        style={{
          backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))",
          ...borderStyle,
          color: "var(--text-primary, rgba(255,255,255,0.95))",
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.4))" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
});

interface CategoryTabsProps {
  activeCategory: MetricCategory | "all";
  onCategoryChange: (category: MetricCategory | "all") => void;
  categoryCounts: Record<MetricCategory | "all", number>;
}

const CategoryTabs = memo(function CategoryTabs({
  activeCategory,
  onCategoryChange,
  categoryCounts,
}: CategoryTabsProps) {
  return (
    <div
      className="flex flex-wrap gap-1 p-1 rounded-lg"
      style={{ backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))" }}
    >
      {CATEGORY_TABS.map((tab) => {
        const isActive = activeCategory === tab.value;
        const count = categoryCounts[tab.value];

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onCategoryChange(tab.value)}
            className="px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1"
            style={{
              backgroundColor: isActive
                ? tab.value === "all"
                  ? "var(--bg-secondary, rgba(255,255,255,0.1))"
                  : `${CATEGORY_COLORS[tab.value as MetricCategory]}20`
                : "transparent",
              color: isActive
                ? tab.value === "all"
                  ? "var(--text-primary, rgba(255,255,255,0.95))"
                  : CATEGORY_COLORS[tab.value as MetricCategory]
                : "var(--text-secondary, rgba(255,255,255,0.6))",
            }}
          >
            {tab.label}
            <span
              className="text-xs opacity-60"
              style={{
                fontSize: "10px",
              }}
            >
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
});

interface MetricItemProps {
  metric: MetricDefinition;
  isSelected: boolean;
  onAdd: () => void;
  onDragStart: (e: React.DragEvent, metric: MetricDefinition) => void;
}

const MetricItem = memo(function MetricItem({
  metric,
  isSelected,
  onAdd,
  onDragStart,
}: MetricItemProps) {
  const categoryColor = CATEGORY_COLORS[metric.category];

  return (
    <div
      draggable={!isSelected}
      onDragStart={(e) => onDragStart(e, metric)}
      className={cn(
        "group relative rounded-lg border p-3 transition-all duration-150",
        isSelected
          ? "opacity-50 cursor-not-allowed"
          : "cursor-grab hover:border-blue-500/50 hover:bg-white/5 active:cursor-grabbing"
      )}
      style={{
        ...cardBgStyle,
        ...borderStyle,
      }}
    >
      {/* Category Indicator */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
        style={{ backgroundColor: categoryColor }}
      />

      <div className="pl-2">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4
                className="text-sm font-medium truncate"
                style={headerStyle}
              >
                {metric.name}
              </h4>
              <span
                className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-mono"
                style={{
                  backgroundColor: `${categoryColor}20`,
                  color: categoryColor,
                }}
              >
                {UNIT_LABELS[metric.unit]}
              </span>
            </div>
            <p
              className="text-xs mt-1 line-clamp-2"
              style={subheaderStyle}
            >
              {metric.description}
            </p>
          </div>

          {/* Add Button */}
          {!isSelected && (
            <button
              type="button"
              onClick={onAdd}
              className="flex-shrink-0 p-1.5 rounded-md transition-colors hover:bg-blue-500/20"
              style={{ color: "#3b82f6" }}
              title="Add to report"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}

          {/* Selected Check */}
          {isSelected && (
            <div
              className="flex-shrink-0 p-1.5 rounded-md"
              style={{ color: "#22c55e" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="flex items-center gap-2 mt-2">
          <span
            className="px-2 py-0.5 rounded-full text-xs capitalize"
            style={{
              backgroundColor: `${categoryColor}15`,
              color: categoryColor,
            }}
          >
            {metric.category}
          </span>
          <span className="text-xs" style={subheaderStyle}>
            {metric.aggregation}
          </span>
        </div>
      </div>

      {/* Drag Hint */}
      {!isSelected && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          <span className="px-2 py-1 rounded bg-blue-500/90 text-white text-xs font-medium">
            Drag to add
          </span>
        </div>
      )}
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function MetricSelectorComponent({
  metrics,
  selectedMetricIds,
  onAddMetric,
  className,
}: MetricSelectorProps) {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<MetricCategory | "all">("all");

  // Handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, metric: MetricDefinition) => {
      e.dataTransfer.setData("application/json", JSON.stringify(metric));
      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  // Memoized derived state
  const categoryCounts = useMemo(() => {
    const counts: Record<MetricCategory | "all", number> = {
      all: metrics.length,
      traffic: 0,
      conversions: 0,
      revenue: 0,
      engagement: 0,
      attribution: 0,
      roi: 0,
    };

    metrics.forEach((metric) => {
      counts[metric.category]++;
    });

    return counts;
  }, [metrics]);

  const filteredMetrics = useMemo(() => {
    let filtered = metrics;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((m) => m.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [metrics, activeCategory, searchQuery]);

  // Group metrics by category for display
  const groupedMetrics = useMemo(() => {
    if (activeCategory !== "all") {
      return { [activeCategory]: filteredMetrics };
    }

    const groups: Partial<Record<MetricCategory, MetricDefinition[]>> = {};
    filteredMetrics.forEach((metric) => {
      if (!groups[metric.category]) {
        groups[metric.category] = [];
      }
      groups[metric.category]!.push(metric);
    });

    return groups;
  }, [filteredMetrics, activeCategory]);

  return (
    <div
      className={cn("rounded-lg border", className)}
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        ...borderStyle,
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={borderStyle}>
        <h3 className="text-sm font-semibold mb-1" style={headerStyle}>
          Available Metrics
        </h3>
        <p className="text-xs" style={subheaderStyle}>
          Drag metrics or click + to add to your report
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b" style={borderStyle}>
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-3 border-b" style={borderStyle}>
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          categoryCounts={categoryCounts}
        />
      </div>

      {/* Metrics List */}
      <div className="p-4 max-h-[calc(100vh-400px)] overflow-y-auto">
        {filteredMetrics.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-30"
              style={{ color: "var(--text-secondary, rgba(255,255,255,0.4))" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm" style={subheaderStyle}>
              No metrics found
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Clear search
              </button>
            )}
          </div>
        ) : activeCategory !== "all" ? (
          <div className="space-y-3">
            {filteredMetrics.map((metric) => (
              <MetricItem
                key={metric.id}
                metric={metric}
                isSelected={selectedMetricIds.has(metric.id)}
                onAdd={() => onAddMetric(metric.id)}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[category as MetricCategory] }}
                  />
                  <h4
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: CATEGORY_COLORS[category as MetricCategory] }}
                  >
                    {category}
                  </h4>
                  <span className="text-xs" style={subheaderStyle}>
                    ({categoryMetrics!.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {categoryMetrics!.map((metric) => (
                    <MetricItem
                      key={metric.id}
                      metric={metric}
                      isSelected={selectedMetricIds.has(metric.id)}
                      onAdd={() => onAddMetric(metric.id)}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t" style={borderStyle}>
        <div className="flex items-center justify-between text-xs" style={subheaderStyle}>
          <span>
            {filteredMetrics.length} of {metrics.length} metrics
          </span>
          <span>
            {selectedMetricIds.size} selected
          </span>
        </div>
      </div>
    </div>
  );
}

export const MetricSelector = memo(MetricSelectorComponent);
export default MetricSelector;
