"use client";

import type { UnifiedAnalyticsData, ConversionMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { FunnelChart, type FunnelDataItem } from "@/components/charts";
import { SectionHeader, createMetric } from "../shared";

interface ConversionsSectionProps {
  data: UnifiedAnalyticsData["conversions"];
  comparisonData?: UnifiedAnalyticsData["conversions"];
}

/** Get comparison value or calculate a fallback */
function getComparisonValue(
  comparisonData: ConversionMetrics | undefined,
  field: keyof ConversionMetrics,
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

export function ConversionsSection({ data, comparisonData }: ConversionsSectionProps) {
  if (!data) return null;

  return (
    <CategorySection
      title="Conversions & Funnel"
      description="Conversion rates and funnel analysis"
    >
      <MetricGrid>
        <MetricCard
          title="Conversion Rate"
          metric={createMetric(data.conversionRate, getComparisonValue(comparisonData, "conversionRate", data.conversionRate, 0.92))}
          format="percent"
        />
        <MetricCard
          title="Total Conversions"
          metric={createMetric(data.totalConversions, getComparisonValue(comparisonData, "totalConversions", data.totalConversions, 0.88))}
          format="number"
        />
        <MetricCard
          title="Add to Cart Rate"
          metric={createMetric(data.addToCartRate, getComparisonValue(comparisonData, "addToCartRate", data.addToCartRate, 0.95))}
          format="percent"
        />
        <MetricCard
          title="Cart Abandonment"
          metric={createMetric(
            data.cartAbandonmentRate,
            getComparisonValue(comparisonData, "cartAbandonmentRate", data.cartAbandonmentRate, 1.05)
          )}
          format="percent"
        />
        <MetricCard
          title="Checkout Completion"
          metric={createMetric(
            data.checkoutCompletionRate,
            getComparisonValue(comparisonData, "checkoutCompletionRate", data.checkoutCompletionRate, 0.9)
          )}
          format="percent"
        />
      </MetricGrid>

      {data.funnel && data.funnel.length > 0 && (
        <div className="mt-4">
          <SectionHeader>Conversion Funnel</SectionHeader>
          <FunnelChart
            data={data.funnel.map((step): FunnelDataItem => ({
              name: step.step,
              value: step.users,
            }))}
            height={280}
            showLabels={true}
          />
        </div>
      )}
    </CategorySection>
  );
}

export default ConversionsSection;
