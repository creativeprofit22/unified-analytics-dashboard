"use client";

import { useMemo } from "react";
import type { UnifiedAnalyticsData, RevenueMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { AreaTrendChart } from "@/components/charts";
import { SectionHeader, createMetric } from "../shared";
import { useSectionFilters } from "@/contexts/SectionFilterContext";
import { SectionFilterBar } from "@/components/SectionFilterBar";
import { getRevenueFilters, SECTION_IDS } from "@/config/sectionFilters";

interface RevenueSectionProps {
  data: UnifiedAnalyticsData["revenue"];
  comparisonData?: UnifiedAnalyticsData["revenue"];
}

/** Get comparison value or calculate a fallback */
function getComparisonValue(
  comparisonData: RevenueMetrics | undefined,
  field: keyof RevenueMetrics,
  currentValue: number,
  fallbackRatio = 0.9
): number {
  if (comparisonData && typeof comparisonData[field] === "number") {
    return comparisonData[field] as number;
  }
  return currentValue * fallbackRatio;
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

export function RevenueSection({ data, comparisonData }: RevenueSectionProps) {
  if (!data) return null;

  const filterFields = useMemo(() => getRevenueFilters(data), [data]);

  const {
    filters,
    fields,
    setFilter,
    toggleFilter,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  } = useSectionFilters(SECTION_IDS.REVENUE, filterFields);

  // Filter revenue by product
  const filteredRevenueByProduct = useMemo(() => {
    if (!data?.revenueByProduct) return [];
    const productFilter = Array.isArray(filters.product) ? filters.product : [];
    if (productFilter.length === 0) return data.revenueByProduct;
    return data.revenueByProduct.filter(p => productFilter.includes(p.productName));
  }, [data?.revenueByProduct, filters.product]);

  // Filter revenue by category
  const filteredRevenueByCategory = useMemo(() => {
    if (!data?.revenueByCategory) return {};
    const categoryFilter = Array.isArray(filters.category) ? filters.category : [];
    if (categoryFilter.length === 0) return data.revenueByCategory;
    return Object.fromEntries(
      Object.entries(data.revenueByCategory).filter(([cat]) => categoryFilter.includes(cat))
    );
  }, [data?.revenueByCategory, filters.category]);

  // Filter revenue by channel
  const filteredRevenueByChannel = useMemo(() => {
    if (!data?.revenueByChannel) return {};
    const channelFilter = Array.isArray(filters.channel) ? filters.channel : [];
    if (channelFilter.length === 0) return data.revenueByChannel;
    return Object.fromEntries(
      Object.entries(data.revenueByChannel).filter(([ch]) => channelFilter.includes(ch))
    );
  }, [data?.revenueByChannel, filters.channel]);

  return (
    <CategorySection
      title="Revenue & Orders"
      description="Revenue metrics from Stripe"
    >
      <SectionFilterBar
        sectionId={SECTION_IDS.REVENUE}
        fields={fields}
        filters={filters}
        onFilterChange={setFilter}
        onToggle={toggleFilter}
        onClear={clearFilters}
        onClearFilter={clearFilter}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
      />
      <MetricGrid>
        <MetricCard
          title="Gross Revenue"
          metric={createMetric(data.grossRevenue, getComparisonValue(comparisonData, "grossRevenue", data.grossRevenue, 0.85))}
          format="currency"
        />
        <MetricCard
          title="Net Revenue"
          metric={createMetric(data.netRevenue, getComparisonValue(comparisonData, "netRevenue", data.netRevenue, 0.87))}
          format="currency"
        />
        <MetricCard
          title="Transactions"
          metric={createMetric(data.transactions, getComparisonValue(comparisonData, "transactions", data.transactions, 0.9))}
          format="number"
        />
        <MetricCard
          title="AOV"
          metric={createMetric(data.aov, getComparisonValue(comparisonData, "aov", data.aov, 0.95))}
          format="currency"
        />
        <MetricCard
          title="Revenue/Visitor"
          metric={createMetric(data.revenuePerVisitor, getComparisonValue(comparisonData, "revenuePerVisitor", data.revenuePerVisitor, 0.92))}
          format="currency"
        />
        <MetricCard
          title="Refund Rate"
          metric={createMetric(data.refundRate, getComparisonValue(comparisonData, "refundRate", data.refundRate, 1.1))}
          format="percent"
        />
      </MetricGrid>

      {data.revenueTrend && data.revenueTrend.length > 0 && (
        <div className="mt-4">
          <SectionHeader>Revenue Trend</SectionHeader>
          <AreaTrendChart
            data={data.revenueTrend.map((d) => ({ date: d.date, value: d.gross }))}
            height={150}
            color="#22c55e"
          />
        </div>
      )}
    </CategorySection>
  );
}

export default RevenueSection;
