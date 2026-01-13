"use client";

import { useEffect, useState, useCallback } from "react";
import { useAnalytics } from "@/hooks";
import { useFilters } from "@/contexts/FilterContext";
import type { TimeRange, TrafficSource, CampaignChannel } from "@/types/analytics";
import { cn } from "@/utils/cn";
import { TabNavigation, TabPanel, type TabId } from "@/components";
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
  syncHash?: boolean;
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

export function Dashboard({ timeRange = "30d", className, syncHash = false }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("acquisition");
  const { filters, setOptions } = useFilters();
  const { data, isLoading, error } = useAnalytics({ timeRange, filters });

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
  }, []);

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
      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        syncHash={syncHash}
      />

      <TabPanel tabId="acquisition" activeTab={activeTab} className="space-y-6">
        <TrafficSection data={data.traffic} />
        <SEOSection data={data.seo} />
      </TabPanel>

      <TabPanel tabId="conversions" activeTab={activeTab} className="space-y-6">
        <ConversionsSection data={data.conversions} />
      </TabPanel>

      <TabPanel tabId="revenue" activeTab={activeTab} className="space-y-6">
        <RevenueSection data={data.revenue} />
        <SubscriptionsSection data={data.subscriptions} />
        <PaymentsSection data={data.payments} />
      </TabPanel>

      <TabPanel tabId="economics" activeTab={activeTab} className="space-y-6">
        <UnitEconomicsSection data={data.unitEconomics} />
      </TabPanel>

      <TabPanel tabId="audience" activeTab={activeTab} className="space-y-6">
        <DemographicsSection data={data.demographics} />
        <SegmentationSection data={data.segmentation} />
      </TabPanel>

      <TabPanel tabId="marketing" activeTab={activeTab} className="space-y-6">
        <CampaignsSection data={data.campaigns} />
      </TabPanel>
    </div>
  );
}

export default Dashboard;
