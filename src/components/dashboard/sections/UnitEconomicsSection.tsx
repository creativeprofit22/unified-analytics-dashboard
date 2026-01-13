"use client";

import { useMemo } from "react";
import type { UnifiedAnalyticsData, UnitEconomicsMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { GaugeChart, BarComparisonChart, HeatmapChart, type GaugeThreshold } from "@/components/charts";
import { SectionHeader, createMetric } from "../shared";
import { useSectionFilters } from "@/contexts/SectionFilterContext";
import { SectionFilterBar } from "@/components/SectionFilterBar";
import { getUnitEconomicsFilters, SECTION_IDS } from "@/config/sectionFilters";

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

  const filterFields = useMemo(() => getUnitEconomicsFilters(data), [data]);

  const {
    filters,
    fields,
    setFilter,
    toggleFilter,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  } = useSectionFilters(SECTION_IDS.UNIT_ECONOMICS, filterFields);

  // Filter CAC by channel
  const filteredCacByChannel = useMemo(() => {
    if (!data?.cacByChannel) return {};
    const channelFilter = Array.isArray(filters.channel) ? filters.channel : [];
    if (channelFilter.length === 0) return data.cacByChannel;
    return Object.fromEntries(
      Object.entries(data.cacByChannel).filter(([ch]) => channelFilter.includes(ch))
    );
  }, [data?.cacByChannel, filters.channel]);

  // Filter LTV by channel
  const filteredLtvByChannel = useMemo(() => {
    if (!data?.ltvByChannel) return {};
    const channelFilter = Array.isArray(filters.channel) ? filters.channel : [];
    if (channelFilter.length === 0) return data.ltvByChannel;
    return Object.fromEntries(
      Object.entries(data.ltvByChannel).filter(([ch]) => channelFilter.includes(ch))
    );
  }, [data?.ltvByChannel, filters.channel]);

  // Filter LTV by cohort
  const filteredLtvByCohort = useMemo(() => {
    if (!data?.ltvByCohort) return [];
    const cohortFilter = Array.isArray(filters.cohort) ? filters.cohort : [];
    if (cohortFilter.length === 0) return data.ltvByCohort;
    return data.ltvByCohort.filter(c => cohortFilter.includes(c.cohort));
  }, [data?.ltvByCohort, filters.cohort]);

  // Transform CAC by channel for bar chart
  const cacByChannelChartData = useMemo(() => {
    return Object.entries(filteredCacByChannel).map(([channel, value]) => ({
      label: channel,
      value,
    }));
  }, [filteredCacByChannel]);

  // Transform LTV by channel for bar chart
  const ltvByChannelChartData = useMemo(() => {
    return Object.entries(filteredLtvByChannel).map(([channel, value]) => ({
      label: channel,
      value,
    }));
  }, [filteredLtvByChannel]);

  // Transform LTV by cohort for heatmap chart
  const ltvCohortHeatmapData = useMemo(() => {
    if (filteredLtvByCohort.length === 0) return { data: [], xLabels: [], yLabels: [] };

    // Find max months across all cohorts
    const maxMonths = Math.max(...filteredLtvByCohort.map(c => c.months.length));
    const xLabels = Array.from({ length: maxMonths }, (_, i) => `M${i + 1}`);
    const yLabels = filteredLtvByCohort.map(c => c.cohort);

    const heatmapData: { x: number; y: number; value: number }[] = [];
    filteredLtvByCohort.forEach((cohort, yIndex) => {
      cohort.months.forEach((value, xIndex) => {
        heatmapData.push({ x: xIndex, y: yIndex, value });
      });
    });

    return { data: heatmapData, xLabels, yLabels };
  }, [filteredLtvByCohort]);

  return (
    <CategorySection
      title="Unit Economics"
      description="Customer acquisition and lifetime value metrics"
    >
      <SectionFilterBar
        sectionId={SECTION_IDS.UNIT_ECONOMICS}
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

      {/* Channel-based breakdowns - filtered by channel selection */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <SectionHeader>CAC by Channel</SectionHeader>
          {cacByChannelChartData.length > 0 ? (
            <BarComparisonChart
              data={cacByChannelChartData}
              height={200}
              color="#ef4444"
              layout="vertical"
            />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
              No channels selected
            </div>
          )}
        </div>
        <div>
          <SectionHeader>LTV by Channel</SectionHeader>
          {ltvByChannelChartData.length > 0 ? (
            <BarComparisonChart
              data={ltvByChannelChartData}
              height={200}
              color="#22c55e"
              layout="vertical"
            />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
              No channels selected
            </div>
          )}
        </div>
      </div>

      {/* Cohort-based LTV progression - filtered by cohort selection */}
      {ltvCohortHeatmapData.data.length > 0 && (
        <div className="mt-4">
          <SectionHeader>LTV by Cohort (Cumulative)</SectionHeader>
          <HeatmapChart
            data={ltvCohortHeatmapData.data}
            xLabels={ltvCohortHeatmapData.xLabels}
            yLabels={ltvCohortHeatmapData.yLabels}
            height={Math.max(200, ltvCohortHeatmapData.yLabels.length * 50 + 100)}
            colorRange={["#3b82f6", "#22c55e"]}
            valueFormatter={(value) => `$${value}`}
          />
        </div>
      )}
    </CategorySection>
  );
}

export default UnitEconomicsSection;
