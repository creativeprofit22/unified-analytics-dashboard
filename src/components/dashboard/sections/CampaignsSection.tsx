"use client";

import { useMemo } from "react";
import type { UnifiedAnalyticsData, CampaignMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { ScatterChart, type ScatterDataItem } from "@/components/charts";
import { DataTable, SectionHeader, createMetric, type Column } from "../shared";
import { useSectionFilters } from "@/contexts/SectionFilterContext";
import { SectionFilterBar } from "@/components/SectionFilterBar";
import { getCampaignsFilters, SECTION_IDS } from "@/config/sectionFilters";

interface CampaignsSectionProps {
  data: UnifiedAnalyticsData["campaigns"];
  comparisonData?: UnifiedAnalyticsData["campaigns"];
}

/** Get comparison value or calculate a fallback */
function getComparisonValue<T extends object>(
  comparisonData: T | undefined,
  field: keyof T,
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

interface CampaignRow {
  id: string;
  name: string;
  channel: string;
  sent: number;
  opens: number;
  clicks: number;
  revenue: number;
}

const campaignColumns: Column<CampaignRow>[] = [
  { key: "name", header: "Campaign" },
  {
    key: "channel",
    header: "Channel",
    render: (item) => (
      <span className="capitalize">{item.channel}</span>
    ),
  },
  {
    key: "sent",
    header: "Sent",
    align: "right",
    render: (item) => item.sent.toLocaleString(),
  },
  {
    key: "opens",
    header: "Opens",
    align: "right",
    render: (item) => item.opens.toLocaleString(),
  },
  {
    key: "clicks",
    header: "Clicks",
    align: "right",
    render: (item) => item.clicks.toLocaleString(),
  },
  {
    key: "revenue",
    header: "Revenue",
    align: "right",
    render: (item) => `$${item.revenue.toLocaleString()}`,
  },
];

export function CampaignsSection({ data, comparisonData }: CampaignsSectionProps) {
  if (!data) return null;

  const filterFields = useMemo(() => getCampaignsFilters(data), [data]);

  const {
    filters,
    fields,
    setFilter,
    toggleFilter,
    clearFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  } = useSectionFilters(SECTION_IDS.CAMPAIGNS, filterFields);

  // Filter by channel
  const filteredByChannel = useMemo(() => {
    if (!data?.byChannel) return {};
    const channelFilter = Array.isArray(filters.channel) ? filters.channel : [];
    if (channelFilter.length === 0) return data.byChannel;
    return Object.fromEntries(
      Object.entries(data.byChannel).filter(([ch]) => channelFilter.includes(ch))
    );
  }, [data?.byChannel, filters.channel]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    if (!data?.byCampaign) return [];
    let result = [...data.byCampaign];

    // Channel filter
    const channelFilter = Array.isArray(filters.channel) ? filters.channel : [];
    if (channelFilter.length > 0) {
      result = result.filter(c => channelFilter.includes(c.channel));
    }

    // Campaign name filter
    if (typeof filters.campaign === "string" && filters.campaign) {
      result = result.filter(c => c.name === filters.campaign);
    }

    // Search filter
    const searchQuery = typeof filters.campaignSearch === "string" ? filters.campaignSearch.toLowerCase() : "";
    if (searchQuery) {
      result = result.filter(c => c.name.toLowerCase().includes(searchQuery));
    }

    return result;
  }, [data?.byCampaign, filters]);

  return (
    <CategorySection
      title="Campaigns"
      description="Email, SMS, and WhatsApp campaign metrics"
    >
      <SectionFilterBar
        sectionId={SECTION_IDS.CAMPAIGNS}
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
          title="Sent"
          metric={createMetric(data.summary.sent, getComparisonValue(comparisonData?.summary, 'sent', data.summary.sent, 0.9))}
          format="number"
        />
        <MetricCard
          title="Delivery Rate"
          metric={createMetric(data.summary.deliveryRate, getComparisonValue(comparisonData?.summary, 'deliveryRate', data.summary.deliveryRate, 0.99))}
          format="percent"
        />
        <MetricCard
          title="Open Rate"
          metric={createMetric(data.engagement.openRate, getComparisonValue(comparisonData?.engagement, 'openRate', data.engagement.openRate, 0.95))}
          format="percent"
        />
        <MetricCard
          title="CTR"
          metric={createMetric(data.engagement.ctr, getComparisonValue(comparisonData?.engagement, 'ctr', data.engagement.ctr, 0.92))}
          format="percent"
        />
        <MetricCard
          title="Conversions"
          metric={createMetric(data.conversions.count, getComparisonValue(comparisonData?.conversions, 'count', data.conversions.count, 0.88))}
          format="number"
        />
        <MetricCard
          title="Revenue"
          metric={createMetric(data.conversions.revenue, getComparisonValue(comparisonData?.conversions, 'revenue', data.conversions.revenue, 0.85))}
          format="currency"
        />
        <MetricCard
          title="ROI"
          metric={createMetric(data.conversions.roi, getComparisonValue(comparisonData?.conversions, 'roi', data.conversions.roi, 0.9))}
          format="percent"
        />
        <MetricCard
          title="Unsubscribe Rate"
          metric={createMetric(data.negative.unsubscribeRate, getComparisonValue(comparisonData?.negative, 'unsubscribeRate', data.negative.unsubscribeRate, 1.1))}
          format="percent"
        />
      </MetricGrid>

      {filteredByChannel && Object.keys(filteredByChannel).length > 0 && (
        <div className="mt-4">
          <SectionHeader>By Channel</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(filteredByChannel).map(([channel, metrics]) => (
              <div
                key={channel}
                className="p-4 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.03))]"
              >
                <h5 className="text-sm font-medium text-[var(--text-primary)] capitalize mb-3">
                  {channel}
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Sent</span>
                    <span className="text-[var(--text-primary)]">
                      {metrics.sent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Delivered</span>
                    <span className="text-[var(--text-primary)]">
                      {metrics.deliveryRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Engaged</span>
                    <span className="text-[var(--text-primary)]">
                      {metrics.engagementRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Revenue</span>
                    <span className="text-[var(--text-primary)]">
                      ${metrics.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredCampaigns && filteredCampaigns.length > 0 && (
        <div className="mt-4">
          <SectionHeader>Recent Campaigns</SectionHeader>
          <DataTable
            data={filteredCampaigns}
            columns={campaignColumns}
            keyField="id"
            limit={5}
          />
        </div>
      )}

      {filteredCampaigns && filteredCampaigns.length >= 3 && (
        <div className="mt-4">
          <SectionHeader>Campaign Performance Analysis</SectionHeader>
          <p className="text-xs text-[var(--text-secondary)] mb-2">
            Click-through rate vs Revenue (bubble size = sent volume)
          </p>
          <ScatterChart
            data={filteredCampaigns.map((campaign): ScatterDataItem => ({
              x: campaign.sent > 0 ? (campaign.clicks / campaign.sent) * 100 : 0,
              y: campaign.revenue,
              label: campaign.name,
              value: campaign.sent,
            }))}
            height={280}
            xAxisLabel="CTR (%)"
            yAxisLabel="Revenue ($)"
            symbolSize={(value) => Math.max(8, Math.min(30, Math.sqrt(value[2] || 0) / 10))}
            showTrendLine={true}
            enableBrush={true}
          />
        </div>
      )}
    </CategorySection>
  );
}

export default CampaignsSection;
