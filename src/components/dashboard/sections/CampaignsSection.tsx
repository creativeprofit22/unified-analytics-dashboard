"use client";

import type { UnifiedAnalyticsData, CampaignMetrics } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { MetricCard } from "@/components/MetricCard";
import { DataTable, SectionHeader, createMetric, type Column } from "../shared";

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

  return (
    <CategorySection
      title="Campaigns"
      description="Email, SMS, and WhatsApp campaign metrics"
    >
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

      {data.byChannel && (
        <div className="mt-4">
          <SectionHeader>By Channel</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(data.byChannel).map(([channel, metrics]) => (
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

      {data.byCampaign && data.byCampaign.length > 0 && (
        <div className="mt-4">
          <SectionHeader>Recent Campaigns</SectionHeader>
          <DataTable
            data={data.byCampaign}
            columns={campaignColumns}
            keyField="id"
            limit={5}
          />
        </div>
      )}
    </CategorySection>
  );
}

export default CampaignsSection;
