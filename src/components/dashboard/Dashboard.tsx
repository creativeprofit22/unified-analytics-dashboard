"use client";

import { useAnalytics } from "@/hooks";
import type { TimeRange } from "@/types/analytics";
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
  const { data, isLoading, error } = useAnalytics({ timeRange });

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
