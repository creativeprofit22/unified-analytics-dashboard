"use client";

import type { UnifiedAnalyticsData, ConversionMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
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
          <div className="space-y-2">
            {data.funnel.map((step, index) => {
              const firstStep = data.funnel?.[0];
              const width =
                firstStep && firstStep.users > 0
                  ? (step.users / firstStep.users) * 100
                  : 0;
              return (
                <div key={step.step} className="relative">
                  <div
                    className="h-10 rounded bg-blue-500/20 flex items-center px-3 transition-all"
                    style={{ width: `${Math.max(width, 10)}%` }}
                  >
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {step.step}
                    </span>
                  </div>
                  <div className="absolute right-0 top-0 h-10 flex items-center gap-4 pr-3">
                    <span className="text-sm text-[var(--text-secondary)]">
                      {step.users.toLocaleString()} users
                    </span>
                    {index > 0 && (
                      <span className="text-xs text-red-400">
                        -{step.dropOffRate.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </CategorySection>
  );
}

export default ConversionsSection;
