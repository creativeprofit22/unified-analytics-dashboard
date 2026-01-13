"use client";

import { useMemo } from "react";
import type { UnifiedAnalyticsData, TrafficMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { PieDistributionChart, type PieDataItem } from "@/components/charts/PieDistributionChart";
import { BarComparisonChart, type BarComparisonDataItem } from "@/components/charts/BarComparisonChart";
import { SectionHeader, createMetric } from "../shared";
import { useSectionFilters } from "@/contexts/SectionFilterContext";
import { SectionFilterBar } from "@/components/SectionFilterBar";
import { getTrafficFilters, SECTION_IDS } from "@/config/sectionFilters";

interface TrafficSectionProps {
  data: UnifiedAnalyticsData["traffic"];
  comparisonData?: UnifiedAnalyticsData["traffic"];
}

/** Get comparison value or calculate a fallback */
function getComparisonValue(
  comparisonData: TrafficMetrics | undefined,
  field: keyof TrafficMetrics,
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

export function TrafficSection({ data, comparisonData }: TrafficSectionProps) {
  if (!data) return null;

  const filterFields = useMemo(() => getTrafficFilters(data), [data]);

  const {
    filters,
    fields,
    setFilter,
    toggleFilter,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  } = useSectionFilters(SECTION_IDS.TRAFFIC, filterFields);

  // Filter traffic by source
  const filteredTrafficBySource = useMemo(() => {
    if (!data?.trafficBySource) return {};
    const sourceFilter = Array.isArray(filters.source) ? filters.source : [];
    if (sourceFilter.length === 0) return data.trafficBySource;
    return Object.fromEntries(
      Object.entries(data.trafficBySource).filter(([source]) => sourceFilter.includes(source))
    );
  }, [data?.trafficBySource, filters.source]);

  // Filter traffic by medium
  const filteredTrafficByMedium = useMemo(() => {
    if (!data?.trafficByMedium) return {};
    const mediumFilter = Array.isArray(filters.medium) ? filters.medium : [];
    if (mediumFilter.length === 0) return data.trafficByMedium;
    return Object.fromEntries(
      Object.entries(data.trafficByMedium).filter(([medium]) => mediumFilter.includes(medium))
    );
  }, [data?.trafficByMedium, filters.medium]);

  // Filter traffic by campaign
  const filteredTrafficByCampaign = useMemo(() => {
    if (!data?.trafficByCampaign) return [];
    const campaignFilter = typeof filters.campaign === 'string' ? filters.campaign : '';
    if (!campaignFilter) return data.trafficByCampaign;
    return data.trafficByCampaign.filter((item) => item.campaign === campaignFilter);
  }, [data?.trafficByCampaign, filters.campaign]);

  return (
    <CategorySection
      title="Traffic & Acquisition"
      description="Website visitors and traffic sources from GA4"
    >
      <SectionFilterBar
        sectionId={SECTION_IDS.TRAFFIC}
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
          title="Sessions"
          metric={createMetric(
            data.sessions,
            getComparisonValue(comparisonData, 'sessions', data.sessions, 0.9)
          )}
          format="number"
        />
        <MetricCard
          title="Unique Visitors"
          metric={createMetric(
            data.uniqueVisitors,
            getComparisonValue(comparisonData, 'uniqueVisitors', data.uniqueVisitors, 0.92)
          )}
          format="number"
        />
        <MetricCard
          title="New Visitors"
          metric={createMetric(
            data.newVisitors,
            getComparisonValue(comparisonData, 'newVisitors', data.newVisitors, 0.88)
          )}
          format="number"
        />
        <MetricCard
          title="Bounce Rate"
          metric={createMetric(
            data.bounceRate,
            getComparisonValue(comparisonData, 'bounceRate', data.bounceRate, 1.05)
          )}
          format="percent"
        />
        <MetricCard
          title="Pages/Session"
          metric={createMetric(
            data.pagesPerSession,
            getComparisonValue(comparisonData, 'pagesPerSession', data.pagesPerSession, 0.95)
          )}
          format="number"
        />
        <MetricCard
          title="Avg Session"
          metric={createMetric(
            data.avgSessionDuration / 60,
            getComparisonValue(comparisonData, 'avgSessionDuration', data.avgSessionDuration, 0.9) / 60
          )}
          format="number"
        />
      </MetricGrid>

      {data.trafficBySource && Object.keys(data.trafficBySource).length > 0 && (
        <div className="mt-4">
          <SectionHeader>Traffic by Source</SectionHeader>
          <PieDistributionChart
            data={Object.entries(filteredTrafficBySource).map(([source, count]): PieDataItem => ({
              name: source,
              value: count ?? 0,
            }))}
            height={280}
            innerRadius={50}
          />
        </div>
      )}

      {data.trafficByMedium && Object.keys(data.trafficByMedium).length > 0 && (
        <div className="mt-4">
          <SectionHeader>Traffic by Medium</SectionHeader>
          <BarComparisonChart
            data={Object.entries(filteredTrafficByMedium)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([medium, count]): BarComparisonDataItem => ({
                label: medium,
                value: count,
              }))}
            height={250}
            layout="vertical"
          />
        </div>
      )}

      {data.trafficByCampaign && data.trafficByCampaign.length > 0 && (
        <div className="mt-4">
          <SectionHeader>Traffic by Campaign</SectionHeader>
          <BarComparisonChart
            data={filteredTrafficByCampaign
              .sort((a, b) => b.sessions - a.sessions)
              .map((item): BarComparisonDataItem => ({
                label: item.campaign.replace(/_/g, ' '),
                value: item.sessions,
              }))}
            height={250}
            layout="vertical"
          />
          {filteredTrafficByCampaign.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Total conversions: {filteredTrafficByCampaign.reduce((sum, c) => sum + c.conversions, 0).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </CategorySection>
  );
}

export default TrafficSection;
