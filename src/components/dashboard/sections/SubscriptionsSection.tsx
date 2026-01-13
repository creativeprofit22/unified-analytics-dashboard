"use client";

import type { UnifiedAnalyticsData, SubscriptionMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { BarComparisonChart, type BarComparisonDataItem } from "@/components/charts/BarComparisonChart";
import { SectionHeader, createMetric } from "../shared";

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
    </CategorySection>
  );
}

export default SubscriptionsSection;
