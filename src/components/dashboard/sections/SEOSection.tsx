"use client";

import type { UnifiedAnalyticsData, SEOMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { DataTable, SectionHeader, createMetric, type Column } from "../shared";
import { ScatterChart, type ScatterDataItem } from "@/components/charts/ScatterChart";
import { BarComparisonChart, type BarComparisonDataItem } from "@/components/charts/BarComparisonChart";

interface SEOSectionProps {
  data: UnifiedAnalyticsData["seo"];
  comparisonData?: UnifiedAnalyticsData["seo"];
}

/** Get comparison value or calculate a fallback */
function getComparisonValue(
  comparisonData: SEOMetrics | undefined,
  field: keyof SEOMetrics,
  currentValue: number,
  fallbackRatio = 0.9
): number {
  if (comparisonData && typeof comparisonData[field] === "number") {
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

export function SEOSection({ data, comparisonData }: SEOSectionProps) {
  if (!data) return null;

  return (
    <CategorySection title="SEO" description="Search engine optimization metrics">
      <MetricGrid>
        <MetricCard
          title="Visibility Score"
          metric={createMetric(data.visibilityScore, getComparisonValue(comparisonData, "visibilityScore", data.visibilityScore, 0.95))}
          format="number"
        />
        <MetricCard
          title="Impressions"
          metric={createMetric(data.impressions, getComparisonValue(comparisonData, "impressions", data.impressions, 0.88))}
          format="number"
        />
        <MetricCard
          title="Clicks"
          metric={createMetric(data.clicks, getComparisonValue(comparisonData, "clicks", data.clicks, 0.85))}
          format="number"
        />
        <MetricCard
          title="CTR"
          metric={createMetric(data.ctr, getComparisonValue(comparisonData, "ctr", data.ctr, 0.92))}
          format="percent"
        />
        <MetricCard
          title="Avg Position"
          metric={createMetric(data.averagePosition, getComparisonValue(comparisonData, "averagePosition", data.averagePosition, 1.1))}
          format="number"
        />
        <MetricCard
          title="Domain Authority"
          metric={createMetric(data.domainAuthority, getComparisonValue(comparisonData, "domainAuthority", data.domainAuthority, 0.98))}
          format="number"
        />
        <MetricCard
          title="Backlinks"
          metric={createMetric(data.backlinks, getComparisonValue(comparisonData, "backlinks", data.backlinks, 0.9))}
          format="number"
        />
        <MetricCard
          title="Indexed Pages"
          metric={createMetric(data.indexedPages, getComparisonValue(comparisonData, "indexedPages", data.indexedPages, 0.95))}
          format="number"
        />
      </MetricGrid>

      {data.topQueries && data.topQueries.length > 0 && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SectionHeader>Position vs CTR Correlation</SectionHeader>
            <ScatterChart
              data={data.topQueries.map((q): ScatterDataItem => ({
                x: q.position,
                y: q.ctr,
                label: q.query,
                value: q.clicks,
              }))}
              xAxisLabel="Position"
              yAxisLabel="CTR %"
              showTrendLine={true}
              height={280}
            />
          </div>
          <div>
            <SectionHeader>Top Queries by Clicks</SectionHeader>
            <BarComparisonChart
              data={data.topQueries
                .slice()
                .sort((a, b) => b.clicks - a.clicks)
                .slice(0, 5)
                .map((q): BarComparisonDataItem => ({
                  label: q.query.length > 20 ? q.query.substring(0, 20) + "..." : q.query,
                  value: q.clicks,
                }))}
              layout="vertical"
              height={280}
            />
          </div>
        </div>
      )}

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
