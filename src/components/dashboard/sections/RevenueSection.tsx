"use client";

import { useMemo } from "react";
import type { UnifiedAnalyticsData, RevenueMetrics, ProductRevenue } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { AreaTrendChart, BarComparisonChart, PieDistributionChart } from "@/components/charts";
import { SectionHeader, DataTable, createMetric, type Column } from "../shared";
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

/** Product revenue table columns */
const productColumns: Column<ProductRevenue>[] = [
  { key: "productName", header: "Product" },
  {
    key: "revenue",
    header: "Revenue",
    align: "right",
    render: (item) => `$${item.revenue.toLocaleString()}`,
  },
  {
    key: "units",
    header: "Units",
    align: "right",
    render: (item) => item.units.toLocaleString(),
  },
];

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

  // Calculate filtered metrics based on active filters
  const filteredMetrics = useMemo(() => {
    // If no filters are active, return original data
    if (!hasActiveFilters) {
      return {
        grossRevenue: data.grossRevenue,
        netRevenue: data.netRevenue,
        transactions: data.transactions,
      };
    }

    // Calculate from filtered product data when product filter is active
    const productFilter = Array.isArray(filters.product) ? filters.product : [];
    if (productFilter.length > 0 && filteredRevenueByProduct.length > 0) {
      const filteredGross = filteredRevenueByProduct.reduce((sum, p) => sum + p.revenue, 0);
      const filteredUnits = filteredRevenueByProduct.reduce((sum, p) => sum + p.units, 0);
      // Estimate net as ~90% of gross (matching mock data ratio)
      const netRatio = data.netRevenue / data.grossRevenue;
      return {
        grossRevenue: filteredGross,
        netRevenue: Math.round(filteredGross * netRatio),
        transactions: filteredUnits,
      };
    }

    // Calculate from filtered category data when category filter is active
    const categoryFilter = Array.isArray(filters.category) ? filters.category : [];
    if (categoryFilter.length > 0 && Object.keys(filteredRevenueByCategory).length > 0) {
      const filteredGross = Object.values(filteredRevenueByCategory).reduce((sum, v) => sum + v, 0);
      const netRatio = data.netRevenue / data.grossRevenue;
      // Estimate transactions proportionally
      const totalCategoryRevenue = Object.values(data.revenueByCategory || {}).reduce((sum, v) => sum + v, 0);
      const revenueRatio = totalCategoryRevenue > 0 ? filteredGross / totalCategoryRevenue : 1;
      return {
        grossRevenue: filteredGross,
        netRevenue: Math.round(filteredGross * netRatio),
        transactions: Math.round(data.transactions * revenueRatio),
      };
    }

    // Calculate from filtered channel data when channel filter is active
    const channelFilter = Array.isArray(filters.channel) ? filters.channel : [];
    if (channelFilter.length > 0 && Object.keys(filteredRevenueByChannel).length > 0) {
      const filteredGross = Object.values(filteredRevenueByChannel).reduce((sum, v) => sum + v, 0);
      const netRatio = data.netRevenue / data.grossRevenue;
      const totalChannelRevenue = Object.values(data.revenueByChannel || {}).reduce((sum, v) => sum + v, 0);
      const revenueRatio = totalChannelRevenue > 0 ? filteredGross / totalChannelRevenue : 1;
      return {
        grossRevenue: filteredGross,
        netRevenue: Math.round(filteredGross * netRatio),
        transactions: Math.round(data.transactions * revenueRatio),
      };
    }

    return {
      grossRevenue: data.grossRevenue,
      netRevenue: data.netRevenue,
      transactions: data.transactions,
    };
  }, [data, filters, hasActiveFilters, filteredRevenueByProduct, filteredRevenueByCategory, filteredRevenueByChannel]);

  // Convert filtered category data for chart
  const categoryChartData = useMemo(() => {
    return Object.entries(filteredRevenueByCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredRevenueByCategory]);

  // Convert filtered channel data for chart
  const channelChartData = useMemo(() => {
    return Object.entries(filteredRevenueByChannel).map(([label, value]) => ({
      label,
      value,
    }));
  }, [filteredRevenueByChannel]);

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
          title={hasActiveFilters ? "Gross Revenue (Filtered)" : "Gross Revenue"}
          metric={createMetric(filteredMetrics.grossRevenue, getComparisonValue(comparisonData, "grossRevenue", filteredMetrics.grossRevenue, 0.85))}
          format="currency"
        />
        <MetricCard
          title={hasActiveFilters ? "Net Revenue (Filtered)" : "Net Revenue"}
          metric={createMetric(filteredMetrics.netRevenue, getComparisonValue(comparisonData, "netRevenue", filteredMetrics.netRevenue, 0.87))}
          format="currency"
        />
        <MetricCard
          title={hasActiveFilters ? "Transactions (Filtered)" : "Transactions"}
          metric={createMetric(filteredMetrics.transactions, getComparisonValue(comparisonData, "transactions", filteredMetrics.transactions, 0.9))}
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

      {filteredRevenueByProduct.length > 0 && (
        <div className="mt-4">
          <SectionHeader>
            Revenue by Product
            {hasActiveFilters && filters.product && (filters.product as string[]).length > 0 && (
              <span className="ml-2 text-sm text-[var(--text-secondary)] font-normal">
                ({(filters.product as string[]).length} selected)
              </span>
            )}
          </SectionHeader>
          <DataTable
            data={filteredRevenueByProduct}
            columns={productColumns}
            keyField="productId"
          />
        </div>
      )}

      {categoryChartData.length > 0 && (
        <div className="mt-4">
          <SectionHeader>
            Revenue by Category
            {hasActiveFilters && filters.category && (filters.category as string[]).length > 0 && (
              <span className="ml-2 text-sm text-[var(--text-secondary)] font-normal">
                ({(filters.category as string[]).length} selected)
              </span>
            )}
          </SectionHeader>
          <PieDistributionChart
            data={categoryChartData}
            height={220}
            innerRadius={40}
          />
        </div>
      )}

      {channelChartData.length > 0 && (
        <div className="mt-4">
          <SectionHeader>
            Revenue by Channel
            {hasActiveFilters && filters.channel && (filters.channel as string[]).length > 0 && (
              <span className="ml-2 text-sm text-[var(--text-secondary)] font-normal">
                ({(filters.channel as string[]).length} selected)
              </span>
            )}
          </SectionHeader>
          <BarComparisonChart
            data={channelChartData}
            height={180}
            color="#3b82f6"
            layout="vertical"
          />
        </div>
      )}
    </CategorySection>
  );
}

export default RevenueSection;
