"use client";

import type { UnifiedAnalyticsData } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { createMetric } from "../shared";

interface UnitEconomicsSectionProps {
  data: UnifiedAnalyticsData["unitEconomics"];
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

export function UnitEconomicsSection({ data }: UnitEconomicsSectionProps) {
  if (!data) return null;

  return (
    <CategorySection
      title="Unit Economics"
      description="Customer acquisition and lifetime value metrics"
    >
      <MetricGrid>
        <MetricCard
          title="CAC"
          metric={createMetric(data.cac, data.cac * 1.05)}
          format="currency"
        />
        <MetricCard
          title="LTV"
          metric={createMetric(data.ltv, data.ltv * 0.95)}
          format="currency"
        />
        <MetricCard
          title="LTV:CAC Ratio"
          metric={createMetric(data.ltvCacRatio, data.ltvCacRatio * 0.92)}
          format="number"
        />
        <MetricCard
          title="CAC Payback"
          metric={createMetric(data.cacPaybackPeriod, data.cacPaybackPeriod * 1.1)}
          format="number"
        />
        <MetricCard
          title="Gross Margin"
          metric={createMetric(data.grossMargin, data.grossMargin * 0.98)}
          format="percent"
        />
        <MetricCard
          title="ARPU"
          metric={createMetric(data.arpu, data.arpu * 0.95)}
          format="currency"
        />
        <MetricCard
          title="NRR"
          metric={createMetric(data.nrr, data.nrr * 0.98)}
          format="percent"
        />
        <MetricCard
          title="GRR"
          metric={createMetric(data.grr, data.grr * 0.97)}
          format="percent"
        />
      </MetricGrid>
    </CategorySection>
  );
}

export default UnitEconomicsSection;
