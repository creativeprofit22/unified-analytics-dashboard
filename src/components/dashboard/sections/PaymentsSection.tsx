"use client";

import { useMemo } from "react";
import type { UnifiedAnalyticsData, PaymentMetrics, PaymentRecord } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { createMetric, SectionHeader } from "../shared";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { PieDistributionChart } from "@/components/charts/PieDistributionChart";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { useSectionFilters, type FilterValue } from "@/contexts/SectionFilterContext";
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

/**
 * Filter payment records based on active filters
 */
function filterPaymentRecords(
  records: PaymentRecord[] | undefined,
  filters: Record<string, FilterValue>
): PaymentRecord[] {
  if (!records || records.length === 0) return [];

  return records.filter((record) => {
    // Filter by payment method
    const methodFilter = filters.paymentMethod;
    if (methodFilter && Array.isArray(methodFilter) && methodFilter.length > 0) {
      if (!methodFilter.includes(record.method)) return false;
    }

    // Filter by failure reason (only applies to failed payments)
    const reasonFilter = filters.failureReason;
    if (reasonFilter && Array.isArray(reasonFilter) && reasonFilter.length > 0) {
      // If filtering by failure reason, only include failed payments that match
      if (record.successful) return false;
      if (!record.failureReason || !reasonFilter.includes(record.failureReason)) return false;
    }

    // Filter by recovery status
    const statusFilter = filters.recoveryStatus;
    if (statusFilter && typeof statusFilter === "string" && statusFilter !== "All") {
      const normalizedStatus = statusFilter.toLowerCase() as "recovered" | "pending" | "failed";
      // Successful payments don't have recovery status
      if (record.successful) {
        // Only show successful payments if "All" or no filter
        return false;
      }
      if (record.recoveryStatus !== normalizedStatus) return false;
    }

    return true;
  });
}

/**
 * Aggregate filtered payment records into metrics
 */
function aggregateMetrics(
  records: PaymentRecord[],
  originalData: PaymentMetrics
): PaymentMetrics {
  if (records.length === 0) {
    // Return zero metrics when no records match
    return {
      ...originalData,
      successfulPayments: 0,
      failedPayments: 0,
      failureRate: 0,
      failureByReason: {},
      recoveryRate: 0,
      atRiskRevenue: 0,
      recoveredRevenue: 0,
    };
  }

  const successful = records.filter((r) => r.successful);
  const failed = records.filter((r) => !r.successful);

  // Calculate failure by reason
  const failureByReason: Record<string, number> = {};
  failed.forEach((r) => {
    if (r.failureReason) {
      failureByReason[r.failureReason] = (failureByReason[r.failureReason] ?? 0) + 1;
    }
  });

  // Calculate recovery metrics
  const recovered = failed.filter((r) => r.recoveryStatus === "recovered");
  const pending = failed.filter((r) => r.recoveryStatus === "pending");

  const recoveryRate = failed.length > 0 ? (recovered.length / failed.length) * 100 : 0;

  // Calculate revenue metrics
  const recoveredRevenue = recovered.reduce((sum, r) => sum + r.amount, 0);
  const atRiskRevenue = pending.reduce((sum, r) => sum + r.amount, 0);

  return {
    ...originalData,
    successfulPayments: successful.length,
    failedPayments: failed.length,
    failureRate: records.length > 0 ? (failed.length / records.length) * 100 : 0,
    failureByReason,
    recoveryRate,
    atRiskRevenue,
    recoveredRevenue,
  };
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

  // Apply filters to payment records and re-aggregate metrics
  const filteredMetrics = useMemo(() => {
    // Check if any filters are active
    const hasFilters = Object.values(filters).some((v) => {
      if (v === null || v === undefined) return false;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "string") return v !== "" && v !== "All";
      return false;
    });

    if (!hasFilters) {
      // No active filters, use original data
      return data;
    }

    // Filter and re-aggregate
    const filtered = filterPaymentRecords(data.paymentRecords, filters);
    return aggregateMetrics(filtered, data);
  }, [data, filters]);

  // Use filtered metrics for display
  const displayData = filteredMetrics;

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
          metric={createMetric(displayData.successfulPayments, getComparisonValue(comparisonData, "successfulPayments", displayData.successfulPayments, 0.95))}
          format="number"
        />
        <MetricCard
          title="Failed Payments"
          metric={createMetric(displayData.failedPayments, getComparisonValue(comparisonData, "failedPayments", displayData.failedPayments, 1.1))}
          format="number"
        />
        <MetricCard
          title="Failure Rate"
          metric={createMetric(displayData.failureRate, getComparisonValue(comparisonData, "failureRate", displayData.failureRate, 1.05))}
          format="percent"
        />
        <MetricCard
          title="Recovery Rate"
          metric={createMetric(displayData.recoveryRate, getComparisonValue(comparisonData, "recoveryRate", displayData.recoveryRate, 0.92))}
          format="percent"
        />
        <MetricCard
          title="Dunning Success"
          metric={createMetric(displayData.dunningSuccessRate, getComparisonValue(comparisonData, "dunningSuccessRate", displayData.dunningSuccessRate, 0.9))}
          format="percent"
        />
        <MetricCard
          title="At-Risk Revenue"
          metric={createMetric(displayData.atRiskRevenue, getComparisonValue(comparisonData, "atRiskRevenue", displayData.atRiskRevenue, 1.15))}
          format="currency"
        />
        <MetricCard
          title="Recovered Revenue"
          metric={createMetric(displayData.recoveredRevenue, getComparisonValue(comparisonData, "recoveredRevenue", displayData.recoveredRevenue, 0.88))}
          format="currency"
        />
        <MetricCard
          title="Involuntary Churn"
          metric={createMetric(displayData.involuntaryChurnRate, getComparisonValue(comparisonData, "involuntaryChurnRate", displayData.involuntaryChurnRate, 1.08))}
          format="percent"
        />
      </MetricGrid>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recovery Funnel Chart */}
        {displayData.recoveryByAttempt && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <SectionHeader>Recovery by Attempt</SectionHeader>
            <FunnelChart
              data={[
                { name: "Attempt 1", value: displayData.recoveryByAttempt.attempt1 },
                { name: "Attempt 2", value: displayData.recoveryByAttempt.attempt2 },
                { name: "Attempt 3", value: displayData.recoveryByAttempt.attempt3 },
                { name: "Attempt 4", value: displayData.recoveryByAttempt.attempt4 },
              ]}
              height={250}
            />
          </div>
        )}

        {/* Failure Reasons Pie Chart */}
        {displayData.failureByReason && Object.keys(displayData.failureByReason).length > 0 && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <SectionHeader>Failure by Reason</SectionHeader>
            <PieDistributionChart
              data={Object.entries(displayData.failureByReason).map(([name, value]) => ({
                name,
                value,
              }))}
              height={250}
              innerRadius={40}
            />
          </div>
        )}

        {/* Recovery Rate Gauge */}
        {typeof displayData.recoveryRate === "number" && (
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <SectionHeader>Recovery Rate</SectionHeader>
            <GaugeChart
              value={displayData.recoveryRate}
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
