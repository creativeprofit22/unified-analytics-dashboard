"use client";

import type { UnifiedAnalyticsData, PaymentMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { createMetric } from "../shared";

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

  return (
    <CategorySection
      title="Payments"
      description="Payment processing and recovery metrics"
    >
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
    </CategorySection>
  );
}

export default PaymentsSection;
