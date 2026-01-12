"use client";

import type { UnifiedAnalyticsData } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { DataTable, SectionHeader, createMetric, type Column } from "../shared";

interface SEOSectionProps {
  data: UnifiedAnalyticsData["seo"];
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}

interface QueryRow {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

const queryColumns: Column<QueryRow>[] = [
  { key: "query", header: "Query" },
  {
    key: "impressions",
    header: "Impressions",
    align: "right",
    render: (item) => item.impressions.toLocaleString(),
  },
  {
    key: "clicks",
    header: "Clicks",
    align: "right",
    render: (item) => item.clicks.toLocaleString(),
  },
  {
    key: "ctr",
    header: "CTR",
    align: "right",
    render: (item) => `${item.ctr.toFixed(1)}%`,
  },
  {
    key: "position",
    header: "Position",
    align: "right",
    render: (item) => item.position.toFixed(1),
  },
];

export function SEOSection({ data }: SEOSectionProps) {
  if (!data) return null;

  return (
    <CategorySection title="SEO" description="Search engine optimization metrics">
      <MetricGrid>
        <MetricCard
          title="Visibility Score"
          metric={createMetric(data.visibilityScore, data.visibilityScore * 0.95)}
          format="number"
        />
        <MetricCard
          title="Impressions"
          metric={createMetric(data.impressions, data.impressions * 0.88)}
          format="number"
        />
        <MetricCard
          title="Clicks"
          metric={createMetric(data.clicks, data.clicks * 0.85)}
          format="number"
        />
        <MetricCard
          title="CTR"
          metric={createMetric(data.ctr, data.ctr * 0.92)}
          format="percent"
        />
        <MetricCard
          title="Avg Position"
          metric={createMetric(data.averagePosition, data.averagePosition * 1.1)}
          format="number"
        />
        <MetricCard
          title="Domain Authority"
          metric={createMetric(data.domainAuthority, data.domainAuthority * 0.98)}
          format="number"
        />
        <MetricCard
          title="Backlinks"
          metric={createMetric(data.backlinks, data.backlinks * 0.9)}
          format="number"
        />
        <MetricCard
          title="Indexed Pages"
          metric={createMetric(data.indexedPages, data.indexedPages * 0.95)}
          format="number"
        />
      </MetricGrid>

      {data.topQueries && data.topQueries.length > 0 && (
        <div className="mt-4">
          <SectionHeader>Top Search Queries</SectionHeader>
          <DataTable
            data={data.topQueries}
            columns={queryColumns}
            keyField="query"
            limit={5}
          />
        </div>
      )}
    </CategorySection>
  );
}

export default SEOSection;
