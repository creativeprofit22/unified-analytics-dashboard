"use client";

import { useMemo } from "react";
import type { UnifiedAnalyticsData, PaymentMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { createMetric, SectionHeader } from "../shared";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { PieDistributionChart } from "@/components/charts/PieDistributionChart";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { useSectionFilters } from "@/contexts/SectionFilterContext";
import { SectionFilterBar } from "@/components/SectionFilterBar";
import { getPaymentsFilters, SECTION_IDS } from "@/config/sectionFilters";

interface PaymentsSectionProps {
  data: UnifiedAnalyticsData["payments"];
  comparisonData?: UnifiedAnalyticsData["payments"];
}

/** Get comparison value or calculate a fallback */
function getComparisonValue(
  comparisonData: PaymentMetrics | undefined,
  field: keyof PaymentMetrics,
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

export function PaymentsSection({ data, comparisonData }: PaymentsSectionProps) {
  if (!data) return null;

  const filterFields = useMemo(() => getPaymentsFilters(data), [data]);

  const {
    filters,
    fields,
    setFilter,
    toggleFilter,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  } = useSectionFilters(SECTION_IDS.PAYMENTS, filterFields);

  return (
    <CategorySection
      title="Payments"
      description="Payment processing and recovery metrics"
    >
      <SectionFilterBar
        sectionId={SECTION_IDS.PAYMENTS}
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
          title="Successful Payments"
          metric={createMetric(data.successfulPayments, getComparisonValue(comparisonData, "successfulPayments", data.successfulPayments, 0.95))}
          format="number"
        />
        <MetricCard
          title="Failed Payments"
          metric={createMetric(data.failedPayments, getComparisonValue(comparisonData, "failedPayments", data.failedPayments, 1.1))}
          format="number"
        />
        <MetricCard
          title="Failure Rate"
          metric={createMetric(data.failureRate, getComparisonValue(comparisonData, "failureRate", data.failureRate, 1.05))}
          format="percent"
        />
        <MetricCard
          title="Recovery Rate"
          metric={createMetric(data.recoveryRate, getComparisonValue(comparisonData, "recoveryRate", data.recoveryRate, 0.92))}
          format="percent"
        />
        <MetricCard
          title="Dunning Success"
          metric={createMetric(data.dunningSuccessRate, getComparisonValue(comparisonData, "dunningSuccessRate", data.dunningSuccessRate, 0.9))}
          format="percent"
        />
        <MetricCard
          title="At-Risk Revenue"
          metric={createMetric(data.atRiskRevenue, getComparisonValue(comparisonData, "atRiskRevenue", data.atRiskRevenue, 1.15))}
          format="currency"
        />
        <MetricCard
          title="Recovered Revenue"
          metric={createMetric(data.recoveredRevenue, getComparisonValue(comparisonData, "recoveredRevenue", data.recoveredRevenue, 0.88))}
          format="currency"
        />
        <MetricCard
          title="Involuntary Churn"
          metric={createMetric(data.involuntaryChurnRate, getComparisonValue(comparisonData, "involuntaryChurnRate", data.involuntaryChurnRate, 1.08))}
          format="percent"
        />
      </MetricGrid>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recovery Funnel Chart */}
        {data.recoveryByAttempt && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <SectionHeader>Recovery by Attempt</SectionHeader>
            <FunnelChart
              data={[
                { name: "Attempt 1", value: data.recoveryByAttempt.attempt1 },
                { name: "Attempt 2", value: data.recoveryByAttempt.attempt2 },
                { name: "Attempt 3", value: data.recoveryByAttempt.attempt3 },
                { name: "Attempt 4", value: data.recoveryByAttempt.attempt4 },
              ]}
              height={250}
            />
          </div>
        )}

        {/* Failure Reasons Pie Chart */}
        {data.failureByReason && Object.keys(data.failureByReason).length > 0 && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <SectionHeader>Failure by Reason</SectionHeader>
            <PieDistributionChart
              data={Object.entries(data.failureByReason).map(([name, value]) => ({
                name,
                value,
              }))}
              height={250}
              innerRadius={40}
            />
          </div>
        )}

        {/* Recovery Rate Gauge */}
        {typeof data.recoveryRate === "number" && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <SectionHeader>Recovery Rate</SectionHeader>
            <GaugeChart
              value={data.recoveryRate}
              min={0}
              max={100}
              title="Recovery Rate"
              unit="%"
              height={250}
            />
          </div>
        )}
      </div>
    </CategorySection>
  );
}

export default PaymentsSection;
