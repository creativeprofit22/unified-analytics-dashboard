"use client";

import type { UnifiedAnalyticsData, UnitEconomicsMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { GaugeChart, type GaugeThreshold } from "@/components/charts";
import { SectionHeader, createMetric } from "../shared";

const ltvCacThresholds: GaugeThreshold[] = [
  { value: 1, color: "#ef4444", label: "Unsustainable" },
  { value: 3, color: "#eab308", label: "Acceptable" },
  { value: 5, color: "#22c55e", label: "Healthy" },
];

interface UnitEconomicsSectionProps {
  data: UnifiedAnalyticsData["unitEconomics"];
  comparisonData?: UnifiedAnalyticsData["unitEconomics"];
}

/** Get comparison value or calculate a fallback */
function getComparisonValue(
  comparisonData: UnitEconomicsMetrics | undefined,
  field: keyof UnitEconomicsMetrics,
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

export function UnitEconomicsSection({ data, comparisonData }: UnitEconomicsSectionProps) {
  if (!data) return null;

  return (
    <CategorySection
      title="Unit Economics"
      description="Customer acquisition and lifetime value metrics"
    >
      <MetricGrid>
        <MetricCard
          title="CAC"
          metric={createMetric(data.cac, getComparisonValue(comparisonData, 'cac', data.cac, 1.05))}
          format="currency"
        />
        <MetricCard
          title="LTV"
          metric={createMetric(data.ltv, getComparisonValue(comparisonData, 'ltv', data.ltv, 0.95))}
          format="currency"
        />
        <MetricCard
          title="LTV:CAC Ratio"
          metric={createMetric(data.ltvCacRatio, getComparisonValue(comparisonData, 'ltvCacRatio', data.ltvCacRatio, 0.92))}
          format="number"
        />
        <MetricCard
          title="CAC Payback"
          metric={createMetric(data.cacPaybackPeriod, getComparisonValue(comparisonData, 'cacPaybackPeriod', data.cacPaybackPeriod, 1.1))}
          format="number"
        />
        <MetricCard
          title="Gross Margin"
          metric={createMetric(data.grossMargin, getComparisonValue(comparisonData, 'grossMargin', data.grossMargin, 0.98))}
          format="percent"
        />
        <MetricCard
          title="ARPU"
          metric={createMetric(data.arpu, getComparisonValue(comparisonData, 'arpu', data.arpu, 0.95))}
          format="currency"
        />
        <MetricCard
          title="NRR"
          metric={createMetric(data.nrr, getComparisonValue(comparisonData, 'nrr', data.nrr, 0.98))}
          format="percent"
        />
        <MetricCard
          title="GRR"
          metric={createMetric(data.grr, getComparisonValue(comparisonData, 'grr', data.grr, 0.97))}
          format="percent"
        />
      </MetricGrid>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <SectionHeader>LTV:CAC Health</SectionHeader>
          <GaugeChart
            value={data.ltvCacRatio}
            min={0}
            max={5}
            title="LTV:CAC Ratio"
            unit="x"
            thresholds={ltvCacThresholds}
            height={200}
          />
        </div>
        <div>
          <SectionHeader>Net Revenue Retention</SectionHeader>
          <GaugeChart
            value={data.nrr}
            min={80}
            max={140}
            title="NRR"
            unit="%"
            thresholds={[
              { value: 100, color: "#ef4444", label: "Contracting" },
              { value: 110, color: "#eab308", label: "Stable" },
              { value: 140, color: "#22c55e", label: "Growing" },
            ]}
            height={200}
          />
        </div>
      </div>
    </CategorySection>
  );
}

export default UnitEconomicsSection;
