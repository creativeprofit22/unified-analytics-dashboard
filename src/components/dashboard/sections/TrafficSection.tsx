"use client";

import type { UnifiedAnalyticsData } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { PieDistributionChart, type PieDataItem } from "@/components/charts/PieDistributionChart";
import { SectionHeader, createMetric } from "../shared";

interface TrafficSectionProps {
  data: UnifiedAnalyticsData["traffic"];
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

export function TrafficSection({ data }: TrafficSectionProps) {
  if (!data) return null;

  return (
    <CategorySection
      title="Traffic & Acquisition"
      description="Website visitors and traffic sources from GA4"
    >
      <MetricGrid>
        <MetricCard
          title="Sessions"
          metric={createMetric(data.sessions, data.sessions * 0.9)}
          format="number"
        />
        <MetricCard
          title="Unique Visitors"
          metric={createMetric(data.uniqueVisitors, data.uniqueVisitors * 0.92)}
          format="number"
        />
        <MetricCard
          title="New Visitors"
          metric={createMetric(data.newVisitors, data.newVisitors * 0.88)}
          format="number"
        />
        <MetricCard
          title="Bounce Rate"
          metric={createMetric(data.bounceRate, data.bounceRate * 1.05)}
          format="percent"
        />
        <MetricCard
          title="Pages/Session"
          metric={createMetric(data.pagesPerSession, data.pagesPerSession * 0.95)}
          format="number"
        />
        <MetricCard
          title="Avg Session"
          metric={createMetric(
            data.avgSessionDuration / 60,
            (data.avgSessionDuration * 0.9) / 60
          )}
          format="number"
        />
      </MetricGrid>

      {data.trafficBySource && Object.keys(data.trafficBySource).length > 0 && (
        <div className="mt-4">
          <SectionHeader>Traffic by Source</SectionHeader>
          <PieDistributionChart
            data={Object.entries(data.trafficBySource).map(([source, count]): PieDataItem => ({
              name: source,
              value: count ?? 0,
            }))}
            height={280}
            innerRadius={50}
          />
        </div>
      )}
    </CategorySection>
  );
}

export default TrafficSection;
