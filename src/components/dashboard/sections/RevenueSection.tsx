"use client";

import type { UnifiedAnalyticsData } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { AreaTrendChart } from "@/components/charts";
import { SectionHeader, createMetric } from "../shared";

interface RevenueSectionProps {
  data: UnifiedAnalyticsData["revenue"];
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

export function RevenueSection({ data }: RevenueSectionProps) {
  if (!data) return null;

  return (
    <CategorySection
      title="Revenue & Orders"
      description="Revenue metrics from Stripe"
    >
      <MetricGrid>
        <MetricCard
          title="Gross Revenue"
          metric={createMetric(data.grossRevenue, data.grossRevenue * 0.85)}
          format="currency"
        />
        <MetricCard
          title="Net Revenue"
          metric={createMetric(data.netRevenue, data.netRevenue * 0.87)}
          format="currency"
        />
        <MetricCard
          title="Transactions"
          metric={createMetric(data.transactions, data.transactions * 0.9)}
          format="number"
        />
        <MetricCard
          title="AOV"
          metric={createMetric(data.aov, data.aov * 0.95)}
          format="currency"
        />
        <MetricCard
          title="Revenue/Visitor"
          metric={createMetric(data.revenuePerVisitor, data.revenuePerVisitor * 0.92)}
          format="currency"
        />
        <MetricCard
          title="Refund Rate"
          metric={createMetric(data.refundRate, data.refundRate * 1.1)}
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
