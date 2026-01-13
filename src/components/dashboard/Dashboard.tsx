"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/hooks";
import { useFilters } from "@/contexts/FilterContext";
import type { TimeRange, FilterState, TrafficSource, CampaignChannel } from "@/types/analytics";
import { cn } from "@/utils/cn";
import {
  TrafficSection,
  SEOSection,
  ConversionsSection,
  RevenueSection,
  SubscriptionsSection,
  PaymentsSection,
  UnitEconomicsSection,
  DemographicsSection,
  SegmentationSection,
  CampaignsSection,
} from "./sections";

interface DashboardProps {
  timeRange?: TimeRange;
  className?: string;
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-48 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.05))]"
        />
      ))}
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="p-6 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
      <h3 className="font-semibold mb-2">Error loading analytics</h3>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function Dashboard({ timeRange = "30d", className }: DashboardProps) {
  const { filters, setOptions } = useFilters();
  const { data, isLoading, error } = useAnalytics({ timeRange, filters });

  // Update filter options when data loads
  useEffect(() => {
    if (!data) return;

    const sources: TrafficSource[] = data.traffic?.trafficBySource
      ? (Object.keys(data.traffic.trafficBySource) as TrafficSource[])
      : [];

    const channels: CampaignChannel[] = data.campaigns?.byChannel
      ? (Object.keys(data.campaigns.byChannel) as CampaignChannel[])
      : [];

    const campaigns: string[] = data.campaigns?.byCampaign
      ? data.campaigns.byCampaign.map((c) => c.name)
      : [];

    setOptions({ sources, channels, campaigns });
  }, [data, setOptions]);

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <ErrorDisplay message={error.message} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn("space-y-6", className)}>
        <ErrorDisplay message="No analytics data available" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <TrafficSection data={data.traffic} />
      <SEOSection data={data.seo} />
      <ConversionsSection data={data.conversions} />
      <RevenueSection data={data.revenue} />
      <SubscriptionsSection data={data.subscriptions} />
      <PaymentsSection data={data.payments} />
      <UnitEconomicsSection data={data.unitEconomics} />
      <DemographicsSection data={data.demographics} />
      <SegmentationSection data={data.segmentation} />
      <CampaignsSection data={data.campaigns} />
    </div>
  );
}

export default Dashboard;
