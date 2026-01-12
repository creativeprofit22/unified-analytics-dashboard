"use client";

import type { UnifiedAnalyticsData } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { StatCard, DataTable, SectionHeader, type Column } from "../shared";

interface SegmentationSectionProps {
  data: UnifiedAnalyticsData["segmentation"];
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

export function SegmentationSection({ data }: SegmentationSectionProps) {
  if (!data) return null;

  return (
    <CategorySection
      title="Segmentation"
      description="User segments and behavioral analysis"
    >
      {data.byBehavior && data.byBehavior.length > 0 && (
        <div>
          <SectionHeader>Behavioral Segments</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {data.byBehavior.map((segment) => (
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
    </CategorySection>
  );
}

export default SegmentationSection;
