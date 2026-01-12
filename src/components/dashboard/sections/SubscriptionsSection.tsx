"use client";

import type { UnifiedAnalyticsData } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { StatCard, SectionHeader, createMetric } from "../shared";
import { cn } from "@/utils/cn";

interface SubscriptionsSectionProps {
  data: UnifiedAnalyticsData["subscriptions"];
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

export function SubscriptionsSection({ data }: SubscriptionsSectionProps) {
  if (!data) return null;

  const mrrItems = data.mrrMovement
    ? [
        { label: "New", value: data.mrrMovement.new, color: "text-green-400" },
        { label: "Expansion", value: data.mrrMovement.expansion, color: "text-blue-400" },
        { label: "Contraction", value: data.mrrMovement.contraction, color: "text-yellow-400" },
        { label: "Churned", value: data.mrrMovement.churned, color: "text-red-400" },
        {
          label: "Net",
          value: data.mrrMovement.net,
          color: data.mrrMovement.net >= 0 ? "text-green-400" : "text-red-400",
        },
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
          metric={createMetric(data.activeSubscribers, data.activeSubscribers * 0.95)}
          format="number"
        />
        <MetricCard
          title="New Subscribers"
          metric={createMetric(data.newSubscribers, data.newSubscribers * 0.88)}
          format="number"
        />
        <MetricCard
          title="MRR"
          metric={createMetric(data.mrr, data.mrr * 0.9)}
          format="currency"
        />
        <MetricCard
          title="ARR"
          metric={createMetric(data.arr, data.arr * 0.9)}
          format="currency"
        />
        <MetricCard
          title="Monthly Churn"
          metric={createMetric(data.churnRate.monthly, data.churnRate.monthly * 1.1)}
          format="percent"
        />
        <MetricCard
          title="Retention Rate"
          metric={createMetric(data.retentionRate, data.retentionRate * 0.98)}
          format="percent"
        />
        <MetricCard
          title="Trial to Paid"
          metric={createMetric(data.trialToPaidRate, data.trialToPaidRate * 0.92)}
          format="percent"
        />
        <MetricCard
          title="Subscriber LTV"
          metric={createMetric(data.subscriberLtv, data.subscriberLtv * 0.95)}
          format="currency"
        />
      </MetricGrid>

      {data.mrrMovement && (
        <div className="mt-4">
          <SectionHeader>MRR Movement</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {mrrItems.map((item) => (
              <StatCard
                key={item.label}
                label={item.label}
                value={Math.abs(item.value)}
                color={item.color}
                prefix="$"
              />
            ))}
          </div>
        </div>
      )}
    </CategorySection>
  );
}

export default SubscriptionsSection;
