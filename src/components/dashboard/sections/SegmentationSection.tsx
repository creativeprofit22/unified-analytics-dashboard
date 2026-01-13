"use client";

import { useMemo } from "react";
import type { UnifiedAnalyticsData } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { SankeyChart, RadarChart, type SankeyNode, type SankeyLink, type RadarIndicator, type RadarSeriesData } from "@/components/charts";
import { StatCard, DataTable, SectionHeader, type Column } from "../shared";
import { useSectionFilters } from "@/contexts/SectionFilterContext";
import { SectionFilterBar } from "@/components/SectionFilterBar";
import { getSegmentationFilters, SECTION_IDS } from "@/config/sectionFilters";

interface SegmentationSectionProps {
  data: UnifiedAnalyticsData["segmentation"];
  comparisonData?: UnifiedAnalyticsData["segmentation"];
}

interface PlanRow {
  plan: string;
  users: number;
  mrr: number;
  churnRate: number;
  upgradeRate: number;
}

const planColumns: Column<PlanRow>[] = [
  { key: "plan", header: "Plan" },
  {
    key: "users",
    header: "Users",
    align: "right",
    render: (item) => item.users.toLocaleString(),
  },
  {
    key: "mrr",
    header: "MRR",
    align: "right",
    render: (item) => `$${item.mrr.toLocaleString()}`,
  },
  {
    key: "churnRate",
    header: "Churn",
    align: "right",
    render: (item) => `${item.churnRate.toFixed(1)}%`,
  },
  {
    key: "upgradeRate",
    header: "Upgrade Rate",
    align: "right",
    render: (item) => `${item.upgradeRate.toFixed(1)}%`,
  },
];

// Helper to find comparison value for behavioral segments
function findBehaviorComparison(
  comparisonData: UnifiedAnalyticsData["segmentation"] | undefined,
  segment: string
): number | undefined {
  if (!comparisonData?.byBehavior) return undefined;
  const match = comparisonData.byBehavior.find((s) => s.segment === segment);
  return match?.users;
}

// Helper to find comparison value for lifecycle stages
function findLifecycleComparison(
  comparisonData: UnifiedAnalyticsData["segmentation"] | undefined,
  stage: string
): number | undefined {
  if (!comparisonData?.byLifecycle) return undefined;
  return comparisonData.byLifecycle[stage as keyof typeof comparisonData.byLifecycle];
}

export function SegmentationSection({ data, comparisonData }: SegmentationSectionProps) {
  if (!data) return null;

  const filterFields = useMemo(() => getSegmentationFilters(data), [data]);

  const {
    filters,
    fields,
    setFilter,
    toggleFilter,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  } = useSectionFilters(SECTION_IDS.SEGMENTATION, filterFields);

  // Filter by behavior segment
  const filteredByBehavior = useMemo(() => {
    if (!data?.byBehavior) return [];
    const behaviorFilter = Array.isArray(filters.behavior) ? filters.behavior : [];
    if (behaviorFilter.length === 0) return data.byBehavior;
    return data.byBehavior.filter(b => behaviorFilter.includes(b.segment));
  }, [data?.byBehavior, filters.behavior]);

  return (
    <CategorySection
      title="Segmentation"
      description="User segments and behavioral analysis"
    >
      <SectionFilterBar
        sectionId={SECTION_IDS.SEGMENTATION}
        fields={fields}
        filters={filters}
        onFilterChange={setFilter}
        onToggle={toggleFilter}
        onClear={clearFilters}
        onClearFilter={clearFilter}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
      />
      {filteredByBehavior && filteredByBehavior.length > 0 && (
        <div>
          <SectionHeader>Behavioral Segments</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredByBehavior.map((segment) => (
              <StatCard
                key={segment.segment}
                label={segment.segment.replace("_", " ")}
                value={segment.users}
                subValue={`${segment.percentage.toFixed(1)}%`}
              />
            ))}
          </div>
        </div>
      )}

      {data.byPlan && data.byPlan.length > 0 && (
        <div className="mt-4">
          <SectionHeader>By Plan</SectionHeader>
          <DataTable data={data.byPlan} columns={planColumns} keyField="plan" />
        </div>
      )}

      {data.byLifecycle && (
        <div className="mt-4">
          <SectionHeader>Lifecycle Stages</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(data.byLifecycle).map(([stage, count]) => (
              <StatCard key={stage} label={stage} value={count} />
            ))}
          </div>
        </div>
      )}

      {data.byLifecycle && (
        <div className="mt-4">
          <SectionHeader>Lifecycle Flow</SectionHeader>
          <SankeyChart
            nodes={(() => {
              const stages = Object.keys(data.byLifecycle);
              return stages.map((stage): SankeyNode => ({
                name: stage.charAt(0).toUpperCase() + stage.slice(1),
                color: stage === "churned" ? "#ef4444" : stage === "customer" ? "#22c55e" : undefined,
              }));
            })()}
            links={(() => {
              const lifecycle = data.byLifecycle;
              const links: SankeyLink[] = [];

              // Define typical lifecycle flow
              if (lifecycle.visitor && lifecycle.lead) {
                links.push({ source: "Visitor", target: "Lead", value: Math.min(lifecycle.visitor * 0.3, lifecycle.lead) });
              }
              if (lifecycle.lead && lifecycle.trial) {
                links.push({ source: "Lead", target: "Trial", value: Math.min(lifecycle.lead * 0.4, lifecycle.trial) });
              }
              if (lifecycle.trial && lifecycle.customer) {
                links.push({ source: "Trial", target: "Customer", value: Math.min(lifecycle.trial * 0.5, lifecycle.customer) });
              }
              if (lifecycle.customer && lifecycle.churned) {
                links.push({ source: "Customer", target: "Churned", value: lifecycle.churned });
              }
              // Reactivated flows from Churned (no cycle back to Customer - Sankey requires DAG)
              if (lifecycle.churned && lifecycle.reactivated) {
                links.push({ source: "Churned", target: "Reactivated", value: lifecycle.reactivated });
              }

              return links.filter(l => l.value > 0);
            })()}
            height={300}
          />
        </div>
      )}

      {filteredByBehavior && filteredByBehavior.length >= 2 && (
        <div className="mt-4">
          <SectionHeader>Segment Comparison</SectionHeader>
          <RadarChart
            indicators={[
              { name: "Users", max: Math.max(...filteredByBehavior.map(s => s.users)) },
              { name: "Revenue", max: Math.max(...filteredByBehavior.map(s => s.avgRevenue)) },
              { name: "Share %", max: 100 },
            ]}
            series={filteredByBehavior.slice(0, 3).map((segment): RadarSeriesData => ({
              name: segment.segment.replace("_", " "),
              values: [segment.users, segment.avgRevenue, segment.percentage],
            }))}
            height={280}
            showLegend={true}
          />
        </div>
      )}
    </CategorySection>
  );
}

export default SegmentationSection;
