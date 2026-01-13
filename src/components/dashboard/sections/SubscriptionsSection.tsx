"use client";

import { useMemo } from "react";
import type { UnifiedAnalyticsData, SubscriptionMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { BarComparisonChart, HeatmapChart, type BarComparisonDataItem, type HeatmapDataItem } from "@/components/charts";
import { SectionHeader, createMetric } from "../shared";
import { useSectionFilters } from "@/contexts/SectionFilterContext";
import { SectionFilterBar } from "@/components/SectionFilterBar";
import { getSubscriptionsFilters, SECTION_IDS } from "@/config/sectionFilters";

interface SubscriptionsSectionProps {
  data: UnifiedAnalyticsData["subscriptions"];
  comparisonData?: UnifiedAnalyticsData["subscriptions"];
}

/** Get comparison value or calculate a fallback */
function getComparisonValue(
  comparisonData: SubscriptionMetrics | undefined,
  field: keyof SubscriptionMetrics,
  currentValue: number,
  fallbackRatio = 0.9
): number {
  if (comparisonData && typeof comparisonData[field] === 'number') {
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

export function SubscriptionsSection({ data, comparisonData }: SubscriptionsSectionProps) {
  if (!data) return null;

  const filterFields = useMemo(() => getSubscriptionsFilters(data), [data]);

  const {
    filters,
    fields,
    setFilter,
    toggleFilter,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  } = useSectionFilters(SECTION_IDS.SUBSCRIPTIONS, filterFields);

  // Filter subscribers by plan
  const filteredSubscribersByPlan = useMemo(() => {
    if (!data?.subscribersByPlan) return {};
    const planFilter = Array.isArray(filters.plan) ? filters.plan : [];
    if (planFilter.length === 0) return data.subscribersByPlan;
    return Object.fromEntries(
      Object.entries(data.subscribersByPlan).filter(([plan]) => planFilter.includes(plan))
    );
  }, [data?.subscribersByPlan, filters.plan]);

  const mrrChartData: BarComparisonDataItem[] = data.mrrMovement
    ? [
        { label: "New", value: data.mrrMovement.new, color: "#22c55e" },
        { label: "Expansion", value: data.mrrMovement.expansion, color: "#3b82f6" },
        { label: "Contraction", value: Math.abs(data.mrrMovement.contraction), color: "#f59e0b" },
        { label: "Churned", value: Math.abs(data.mrrMovement.churned), color: "#ef4444" },
      ]
    : [];

  return (
    <CategorySection
      title="Subscriptions & Retention"
      description="Subscriber metrics and retention rates"
    >
      <SectionFilterBar
        sectionId={SECTION_IDS.SUBSCRIPTIONS}
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
          title="Active Subscribers"
          metric={createMetric(data.activeSubscribers, getComparisonValue(comparisonData, "activeSubscribers", data.activeSubscribers, 0.95))}
          format="number"
        />
        <MetricCard
          title="New Subscribers"
          metric={createMetric(data.newSubscribers, getComparisonValue(comparisonData, "newSubscribers", data.newSubscribers, 0.88))}
          format="number"
        />
        <MetricCard
          title="MRR"
          metric={createMetric(data.mrr, getComparisonValue(comparisonData, "mrr", data.mrr, 0.9))}
          format="currency"
        />
        <MetricCard
          title="ARR"
          metric={createMetric(data.arr, getComparisonValue(comparisonData, "arr", data.arr, 0.9))}
          format="currency"
        />
        <MetricCard
          title="Monthly Churn"
          metric={createMetric(data.churnRate.monthly, comparisonData?.churnRate?.monthly ?? data.churnRate.monthly * 1.1)}
          format="percent"
        />
        <MetricCard
          title="Retention Rate"
          metric={createMetric(data.retentionRate, getComparisonValue(comparisonData, "retentionRate", data.retentionRate, 0.98))}
          format="percent"
        />
        <MetricCard
          title="Trial to Paid"
          metric={createMetric(data.trialToPaidRate, getComparisonValue(comparisonData, "trialToPaidRate", data.trialToPaidRate, 0.92))}
          format="percent"
        />
        <MetricCard
          title="Subscriber LTV"
          metric={createMetric(data.subscriberLtv, getComparisonValue(comparisonData, "subscriberLtv", data.subscriberLtv, 0.95))}
          format="currency"
        />
      </MetricGrid>

      {data.mrrMovement && (
        <div className="mt-4">
          <SectionHeader>MRR Movement</SectionHeader>
          <BarComparisonChart
            data={mrrChartData}
            height={200}
          />
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Net: <span className={data.mrrMovement.net >= 0 ? "text-green-400" : "text-red-400"}>
              ${Math.abs(data.mrrMovement.net).toLocaleString()}
            </span>
          </p>
        </div>
      )}

      {data.retentionByCohort && data.retentionByCohort.length > 0 && (
        <div className="mt-4">
          <SectionHeader>Cohort Retention</SectionHeader>
          <HeatmapChart
            data={data.retentionByCohort.flatMap((cohort, yIndex) =>
              cohort.months.map((value, xIndex): HeatmapDataItem => ({
                x: xIndex,
                y: yIndex,
                value,
              }))
            )}
            xLabels={Array.from(
              { length: Math.max(...data.retentionByCohort.map(c => c.months.length)) },
              (_, i) => `M${i}`
            )}
            yLabels={data.retentionByCohort.map(c => c.cohort)}
            height={Math.max(200, data.retentionByCohort.length * 30 + 80)}
            colorRange={["#ef4444", "#22c55e"]}
            valueFormatter={(v) => `${v.toFixed(0)}%`}
            showValues={data.retentionByCohort.length <= 8}
          />
        </div>
      )}
    </CategorySection>
  );
}

export default SubscriptionsSection;
