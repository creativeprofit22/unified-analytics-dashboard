"use client";

import { useMemo } from "react";
import type { UnifiedAnalyticsData, CampaignMetrics, ChannelMetrics, CampaignChannel } from "@/types/analytics";
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
  const filteredByChannel = useMemo((): Partial<Record<CampaignChannel, ChannelMetrics>> => {
    if (!data?.byChannel) return {};
    const channelFilter = Array.isArray(filters.channel) ? filters.channel : [];
    if (channelFilter.length === 0) return data.byChannel;
    return Object.fromEntries(
      Object.entries(data.byChannel).filter(([ch]) => channelFilter.includes(ch))
    ) as Partial<Record<CampaignChannel, ChannelMetrics>>;
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

  // Compute filtered summary metrics based on channel filter
  // When channels are filtered, aggregate metrics from selected channels only
  const filteredSummary = useMemo(() => {
    const channelFilter = Array.isArray(filters.channel) ? filters.channel : [];

    // No filter = use original summary
    if (channelFilter.length === 0 || !data?.byChannel) {
      return {
        summary: data.summary,
        engagement: data.engagement,
        conversions: data.conversions,
        negative: data.negative,
      };
    }

    // Aggregate from selected channels
    const channels = Object.values(filteredByChannel).filter((m): m is ChannelMetrics => m !== undefined);
    const totalSent = channels.reduce((sum, m) => sum + m.sent, 0);
    const totalDelivered = channels.reduce((sum, m) => sum + Math.round(m.sent * m.deliveryRate / 100), 0);
    const totalEngaged = channels.reduce((sum, m) => sum + m.engaged, 0);
    const totalRevenue = channels.reduce((sum, m) => sum + m.revenue, 0);
    const totalConversions = channels.reduce((sum, m) => sum + m.conversions, 0);

    // Estimate clicks from filtered campaigns (byChannel doesn't have clicks directly)
    const totalClicks = filteredCampaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalOpens = filteredCampaigns.reduce((sum, c) => sum + c.opens, 0);
    const totalUnsubscribes = filteredCampaigns.reduce((sum, c) => sum + c.unsubscribes, 0);

    return {
      summary: {
        sent: totalSent,
        delivered: totalDelivered,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        bounced: totalSent - totalDelivered,
        bounceRate: totalSent > 0 ? ((totalSent - totalDelivered) / totalSent) * 100 : 0,
      },
      engagement: {
        opens: totalOpens,
        openRate: totalDelivered > 0 ? (totalOpens / totalDelivered) * 100 : 0,
        clicks: totalClicks,
        ctr: totalDelivered > 0 ? (totalClicks / totalDelivered) * 100 : 0,
        ctor: totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0,
        replies: data.engagement.replies, // Not available per-channel
        replyRate: data.engagement.replyRate,
      },
      conversions: {
        count: totalConversions,
        rate: totalDelivered > 0 ? (totalConversions / totalDelivered) * 100 : 0,
        revenue: totalRevenue,
        revenuePerMessage: totalSent > 0 ? totalRevenue / totalSent : 0,
        revenuePerClick: totalClicks > 0 ? totalRevenue / totalClicks : 0,
        roi: data.conversions.roi, // Keep original ROI (would need cost data to recalculate)
      },
      negative: {
        unsubscribes: totalUnsubscribes,
        unsubscribeRate: totalDelivered > 0 ? (totalUnsubscribes / totalDelivered) * 100 : 0,
        spamComplaints: data.negative.spamComplaints, // Not available per-channel
        spamRate: data.negative.spamRate,
      },
    };
  }, [data, filters.channel, filteredByChannel, filteredCampaigns]);

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
          metric={createMetric(filteredSummary.summary.sent, getComparisonValue(comparisonData?.summary, 'sent', filteredSummary.summary.sent, 0.9))}
          format="number"
        />
        <MetricCard
          title="Delivery Rate"
          metric={createMetric(filteredSummary.summary.deliveryRate, getComparisonValue(comparisonData?.summary, 'deliveryRate', filteredSummary.summary.deliveryRate, 0.99))}
          format="percent"
        />
        <MetricCard
          title="Open Rate"
          metric={createMetric(filteredSummary.engagement.openRate, getComparisonValue(comparisonData?.engagement, 'openRate', filteredSummary.engagement.openRate, 0.95))}
          format="percent"
        />
        <MetricCard
          title="CTR"
          metric={createMetric(filteredSummary.engagement.ctr, getComparisonValue(comparisonData?.engagement, 'ctr', filteredSummary.engagement.ctr, 0.92))}
          format="percent"
        />
        <MetricCard
          title="Conversions"
          metric={createMetric(filteredSummary.conversions.count, getComparisonValue(comparisonData?.conversions, 'count', filteredSummary.conversions.count, 0.88))}
          format="number"
        />
        <MetricCard
          title="Revenue"
          metric={createMetric(filteredSummary.conversions.revenue, getComparisonValue(comparisonData?.conversions, 'revenue', filteredSummary.conversions.revenue, 0.85))}
          format="currency"
        />
        <MetricCard
          title="ROI"
          metric={createMetric(filteredSummary.conversions.roi, getComparisonValue(comparisonData?.conversions, 'roi', filteredSummary.conversions.roi, 0.9))}
          format="percent"
        />
        <MetricCard
          title="Unsubscribe Rate"
          metric={createMetric(filteredSummary.negative.unsubscribeRate, getComparisonValue(comparisonData?.negative, 'unsubscribeRate', filteredSummary.negative.unsubscribeRate, 1.1))}
          format="percent"
        />
      </MetricGrid>

      {filteredByChannel && Object.keys(filteredByChannel).length > 0 && (
        <div className="mt-4">
          <SectionHeader>By Channel</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(Object.entries(filteredByChannel) as [CampaignChannel, ChannelMetrics][])
              .filter(([, metrics]) => metrics !== undefined)
              .map(([channel, metrics]) => (
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
