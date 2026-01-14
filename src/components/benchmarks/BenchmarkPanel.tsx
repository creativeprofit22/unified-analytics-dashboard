"use client";

import { memo, useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import type {
  BenchmarkComparison as BenchmarkComparisonType,
  BenchmarkCategory,
  PerformanceTier,
} from "@/types/benchmarks";
import { BENCHMARK_CATEGORY_LABELS, PERFORMANCE_TIERS } from "@/types/benchmarks";
import { BenchmarkComparison } from "./BenchmarkComparison";

// =============================================================================
// PROPS
// =============================================================================

export interface BenchmarkPanelProps {
  /** Array of benchmark comparisons to display */
  comparisons: BenchmarkComparisonType[];
  /** Optional title for the panel */
  title?: string;
  /** Optional description */
  description?: string;
  /** Custom class name */
  className?: string;
  /** Show category filter tabs */
  showCategoryFilter?: boolean;
  /** Show tier filter */
  showTierFilter?: boolean;
  /** Compact mode for smaller cards */
  compactCards?: boolean;
  /** Number of columns in the grid (default: responsive) */
  columns?: 1 | 2 | 3 | 4;
}

// =============================================================================
// STATIC STYLES
// =============================================================================

const panelStyle = {
  backgroundColor: "var(--bg-primary, rgba(255,255,255,0.02))",
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
};

const headerStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const descriptionStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const tabStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const tabActiveStyle = {
  backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.1))",
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const emptyStateStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

// =============================================================================
// CATEGORY TAB COMPONENT
// =============================================================================

interface CategoryTabsProps {
  categories: BenchmarkCategory[];
  activeCategory: BenchmarkCategory | "all";
  onCategoryChange: (category: BenchmarkCategory | "all") => void;
  counts: Record<BenchmarkCategory | "all", number>;
}

function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  counts,
}: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={activeCategory === "all" ? tabActiveStyle : tabStyle}
        onClick={() => onCategoryChange("all")}
      >
        All ({counts.all})
      </button>
      {categories.map((category) => (
        <button
          key={category}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={activeCategory === category ? tabActiveStyle : tabStyle}
          onClick={() => onCategoryChange(category)}
        >
          {BENCHMARK_CATEGORY_LABELS[category]} ({counts[category]})
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// TIER FILTER COMPONENT
// =============================================================================

interface TierFilterProps {
  activeTiers: Set<PerformanceTier>;
  onTierToggle: (tier: PerformanceTier) => void;
  tierCounts: Record<PerformanceTier, number>;
}

function TierFilter({ activeTiers, onTierToggle, tierCounts }: TierFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PERFORMANCE_TIERS.map((tierConfig) => {
        const isActive = activeTiers.has(tierConfig.tier);
        const count = tierCounts[tierConfig.tier] || 0;

        if (count === 0) return null;

        return (
          <button
            key={tierConfig.tier}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
              "border",
              isActive ? "opacity-100" : "opacity-50"
            )}
            style={{
              backgroundColor: isActive ? `${tierConfig.color}20` : "transparent",
              borderColor: tierConfig.color,
              color: tierConfig.color,
            }}
            onClick={() => onTierToggle(tierConfig.tier)}
          >
            {tierConfig.label} ({count})
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// SUMMARY STATS COMPONENT
// =============================================================================

interface SummaryStatsProps {
  comparisons: BenchmarkComparisonType[];
}

function SummaryStats({ comparisons }: SummaryStatsProps) {
  const stats = useMemo(() => {
    if (comparisons.length === 0) {
      return { avgPercentile: 0, topQuartileCount: 0, belowAverageCount: 0 };
    }

    const avgPercentile = Math.round(
      comparisons.reduce((sum, c) => sum + c.percentileRank, 0) / comparisons.length
    );

    const topQuartileCount = comparisons.filter(
      (c) => c.tier === "top_quartile" || c.tier === "top_decile"
    ).length;

    const belowAverageCount = comparisons.filter(
      (c) => c.tier === "below_average"
    ).length;

    return { avgPercentile, topQuartileCount, belowAverageCount };
  }, [comparisons]);

  return (
    <div
      className="grid grid-cols-3 gap-4 p-4 rounded-lg border mb-4"
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      <div className="text-center">
        <div className="text-2xl font-bold" style={headerStyle}>
          {stats.avgPercentile}%
        </div>
        <div className="text-xs" style={descriptionStyle}>
          Avg Percentile
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: "#22c55e" }}>
          {stats.topQuartileCount}
        </div>
        <div className="text-xs" style={descriptionStyle}>
          Top Quartile
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: "#ef4444" }}>
          {stats.belowAverageCount}
        </div>
        <div className="text-xs" style={descriptionStyle}>
          Need Attention
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function BenchmarkPanelComponent({
  comparisons,
  title = "Industry Benchmarks",
  description = "Compare your metrics against SaaS industry standards",
  className,
  showCategoryFilter = true,
  showTierFilter = true,
  compactCards = false,
  columns,
}: BenchmarkPanelProps) {
  // State for filters
  const [activeCategory, setActiveCategory] = useState<BenchmarkCategory | "all">("all");
  const [activeTiers, setActiveTiers] = useState<Set<PerformanceTier>>(
    new Set(PERFORMANCE_TIERS.map((t) => t.tier))
  );

  // Get unique categories from comparisons
  const categories = useMemo(() => {
    const categorySet = new Set(comparisons.map((c) => c.metric.category));
    return Array.from(categorySet) as BenchmarkCategory[];
  }, [comparisons]);

  // Count by category
  const categoryCounts = useMemo(() => {
    const counts: Record<BenchmarkCategory | "all", number> = {
      all: comparisons.length,
      revenue: 0,
      customer: 0,
      engagement: 0,
      support: 0,
    };
    comparisons.forEach((c) => {
      counts[c.metric.category]++;
    });
    return counts;
  }, [comparisons]);

  // Count by tier
  const tierCounts = useMemo(() => {
    const counts: Record<PerformanceTier, number> = {
      below_average: 0,
      average: 0,
      above_average: 0,
      top_quartile: 0,
      top_decile: 0,
    };
    comparisons.forEach((c) => {
      counts[c.tier]++;
    });
    return counts;
  }, [comparisons]);

  // Toggle tier filter
  const handleTierToggle = (tier: PerformanceTier) => {
    setActiveTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tier)) {
        // Don't allow deselecting all
        if (next.size > 1) {
          next.delete(tier);
        }
      } else {
        next.add(tier);
      }
      return next;
    });
  };

  // Filter comparisons
  const filteredComparisons = useMemo(() => {
    return comparisons.filter((c) => {
      const categoryMatch = activeCategory === "all" || c.metric.category === activeCategory;
      const tierMatch = activeTiers.has(c.tier);
      return categoryMatch && tierMatch;
    });
  }, [comparisons, activeCategory, activeTiers]);

  // Sort comparisons: worst performing first (to highlight areas needing attention)
  const sortedComparisons = useMemo(() => {
    return [...filteredComparisons].sort((a, b) => a.percentileRank - b.percentileRank);
  }, [filteredComparisons]);

  // Grid column classes
  const gridClasses = columns
    ? {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      }[columns]
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold" style={headerStyle}>
            {title}
          </h2>
          <p className="text-sm" style={descriptionStyle}>
            {description}
          </p>
        </div>
        <div className="text-sm" style={descriptionStyle}>
          {filteredComparisons.length} of {comparisons.length} metrics
        </div>
      </div>

      {/* Summary Stats */}
      {comparisons.length > 0 && <SummaryStats comparisons={filteredComparisons} />}

      {/* Filters */}
      {(showCategoryFilter || showTierFilter) && (
        <div className="space-y-3">
          {showCategoryFilter && categories.length > 1 && (
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              counts={categoryCounts}
            />
          )}
          {showTierFilter && (
            <TierFilter
              activeTiers={activeTiers}
              onTierToggle={handleTierToggle}
              tierCounts={tierCounts}
            />
          )}
        </div>
      )}

      {/* Comparisons Grid */}
      {sortedComparisons.length > 0 ? (
        <div className={cn("grid gap-4", gridClasses)}>
          {sortedComparisons.map((comparison) => (
            <BenchmarkComparison
              key={comparison.metric.id}
              comparison={comparison}
              compact={compactCards}
              showDetails={!compactCards}
            />
          ))}
        </div>
      ) : (
        <div
          className="rounded-lg border p-8 text-center"
          style={emptyStateStyle}
        >
          {comparisons.length === 0 ? (
            <>
              <p className="font-medium mb-1">No benchmark data available</p>
              <p className="text-sm">
                Configure your metrics to see how you compare to industry standards.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium mb-1">No metrics match current filters</p>
              <p className="text-sm">
                Try adjusting your category or tier filters.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export const BenchmarkPanel = memo(BenchmarkPanelComponent);
export default BenchmarkPanel;
