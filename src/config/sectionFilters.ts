/**
 * Section-Specific Filter Configurations
 *
 * Defines the available filters for each dashboard section based on
 * the data fields available in that section's analytics data.
 */

import type { FilterFieldConfig } from "@/contexts/SectionFilterContext";

// =============================================================================
// SECTION IDs
// =============================================================================

export const SECTION_IDS = {
  SEO: "seo",
  PAYMENTS: "payments",
  TRAFFIC: "traffic",
  DEMOGRAPHICS: "demographics",
  CONVERSIONS: "conversions",
  REVENUE: "revenue",
  SUBSCRIPTIONS: "subscriptions",
  SEGMENTATION: "segmentation",
  CAMPAIGNS: "campaigns",
  UNIT_ECONOMICS: "unit-economics",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

// =============================================================================
// SEO SECTION FILTERS
// =============================================================================

export function getSEOFilters(data?: {
  topQueries?: Array<{ query: string; position: number; ctr: number }>;
}): FilterFieldConfig[] {
  const queries = data?.topQueries?.map((q) => q.query) ?? [];

  return [
    {
      key: "query",
      label: "Query",
      type: "search",
      placeholder: "Search queries...",
    },
    {
      key: "positionRange",
      label: "Position",
      type: "range",
      range: { min: 1, max: 100, step: 1 },
    },
    {
      key: "ctrThreshold",
      label: "Min CTR %",
      type: "range",
      range: { min: 0, max: 100, step: 0.5 },
    },
  ];
}

// =============================================================================
// PAYMENTS SECTION FILTERS
// =============================================================================

export function getPaymentsFilters(data?: {
  paymentMethodDistribution?: Record<string, number>;
  failureByReason?: Record<string, number>;
}): FilterFieldConfig[] {
  const methods = data?.paymentMethodDistribution
    ? Object.keys(data.paymentMethodDistribution)
    : ["Card", "Bank Transfer", "PayPal"];

  const reasons = data?.failureByReason
    ? Object.keys(data.failureByReason)
    : ["Insufficient Funds", "Card Declined", "Expired Card"];

  return [
    {
      key: "paymentMethod",
      label: "Method",
      type: "multiselect",
      options: methods,
      placeholder: "Payment method",
    },
    {
      key: "failureReason",
      label: "Failure Reason",
      type: "multiselect",
      options: reasons,
      placeholder: "Failure reason",
    },
    {
      key: "recoveryStatus",
      label: "Recovery",
      type: "select",
      options: ["All", "Recovered", "Pending", "Failed"],
      placeholder: "Recovery status",
    },
  ];
}

// =============================================================================
// TRAFFIC SECTION FILTERS
// =============================================================================

export function getTrafficFilters(data?: {
  trafficBySource?: Record<string, number>;
  trafficByMedium?: Record<string, number>;
  trafficByCampaign?: Array<{ campaign: string }>;
}): FilterFieldConfig[] {
  const sources = data?.trafficBySource
    ? Object.keys(data.trafficBySource)
    : ["organic", "paid", "direct", "referral", "social", "email"];

  const mediums = data?.trafficByMedium
    ? Object.keys(data.trafficByMedium)
    : ["organic", "cpc", "referral", "social"];

  const campaigns = data?.trafficByCampaign?.map((c) => c.campaign) ?? [];

  return [
    {
      key: "source",
      label: "Source",
      type: "multiselect",
      options: sources,
      placeholder: "Traffic source",
    },
    {
      key: "medium",
      label: "Medium",
      type: "multiselect",
      options: mediums,
      placeholder: "Medium",
    },
    ...(campaigns.length > 0
      ? [
          {
            key: "campaign",
            label: "Campaign",
            type: "select" as const,
            options: campaigns,
            placeholder: "Campaign",
          },
        ]
      : []),
  ];
}

// =============================================================================
// DEMOGRAPHICS SECTION FILTERS
// =============================================================================

export function getDemographicsFilters(data?: {
  geographic?: { byCountry?: Array<{ country: string }> };
  device?: { byType?: Record<string, number> };
  technology?: { byBrowser?: Record<string, number> };
}): FilterFieldConfig[] {
  const countries = data?.geographic?.byCountry?.map((c) => c.country) ?? [];
  const deviceTypes = data?.device?.byType
    ? Object.keys(data.device.byType)
    : ["desktop", "mobile", "tablet"];
  const browsers = data?.technology?.byBrowser
    ? Object.keys(data.technology.byBrowser)
    : ["Chrome", "Safari", "Firefox", "Edge"];

  return [
    ...(countries.length > 0
      ? [
          {
            key: "country",
            label: "Country",
            type: "multiselect" as const,
            options: countries.slice(0, 20),
            placeholder: "Select countries",
          },
        ]
      : []),
    {
      key: "deviceType",
      label: "Device",
      type: "multiselect",
      options: deviceTypes,
      placeholder: "Device type",
    },
    {
      key: "browser",
      label: "Browser",
      type: "multiselect",
      options: browsers,
      placeholder: "Browser",
    },
  ];
}

// =============================================================================
// CONVERSIONS SECTION FILTERS
// =============================================================================

export function getConversionsFilters(data?: {
  funnel?: Array<{ step: string }>;
  conversionsBySource?: Record<string, unknown>;
}): FilterFieldConfig[] {
  const funnelSteps = data?.funnel?.map((f) => f.step) ?? [
    "Visit",
    "Signup",
    "Trial",
    "Purchase",
  ];
  const sources = data?.conversionsBySource
    ? Object.keys(data.conversionsBySource)
    : ["organic", "paid", "direct", "referral"];

  return [
    {
      key: "funnelStep",
      label: "Funnel Step",
      type: "multiselect",
      options: funnelSteps,
      placeholder: "Select steps",
    },
    {
      key: "conversionSource",
      label: "Source",
      type: "multiselect",
      options: sources,
      placeholder: "Conversion source",
    },
  ];
}

// =============================================================================
// REVENUE SECTION FILTERS
// =============================================================================

export function getRevenueFilters(data?: {
  revenueByProduct?: Array<{ productName: string }>;
  revenueByCategory?: Record<string, number>;
  revenueByChannel?: Record<string, number>;
}): FilterFieldConfig[] {
  const products = data?.revenueByProduct?.map((p) => p.productName) ?? [];
  const categories = data?.revenueByCategory
    ? Object.keys(data.revenueByCategory)
    : [];
  const channels = data?.revenueByChannel
    ? Object.keys(data.revenueByChannel)
    : [];

  return [
    ...(products.length > 0
      ? [
          {
            key: "product",
            label: "Product",
            type: "multiselect" as const,
            options: products.slice(0, 15),
            placeholder: "Select products",
          },
        ]
      : []),
    ...(categories.length > 0
      ? [
          {
            key: "category",
            label: "Category",
            type: "multiselect" as const,
            options: categories,
            placeholder: "Select categories",
          },
        ]
      : []),
    ...(channels.length > 0
      ? [
          {
            key: "channel",
            label: "Channel",
            type: "multiselect" as const,
            options: channels,
            placeholder: "Select channels",
          },
        ]
      : []),
  ];
}

// =============================================================================
// SUBSCRIPTIONS SECTION FILTERS
// =============================================================================

export function getSubscriptionsFilters(data?: {
  subscribersByPlan?: Record<string, number>;
  cancellationReasons?: Record<string, number>;
}): FilterFieldConfig[] {
  const plans = data?.subscribersByPlan
    ? Object.keys(data.subscribersByPlan)
    : ["Basic", "Pro", "Enterprise"];

  const churnStatuses = ["All", "Active", "Churned", "At Risk"];

  return [
    {
      key: "plan",
      label: "Plan",
      type: "multiselect",
      options: plans,
      placeholder: "Select plans",
    },
    {
      key: "churnStatus",
      label: "Status",
      type: "select",
      options: churnStatuses,
      placeholder: "Churn status",
    },
  ];
}

// =============================================================================
// SEGMENTATION SECTION FILTERS
// =============================================================================

export function getSegmentationFilters(data?: {
  byBehavior?: Array<{ segment: string }>;
  byPlan?: Array<{ plan: string }>;
  byCohort?: Array<{ cohort: string }>;
}): FilterFieldConfig[] {
  const segmentTypes = ["Campaign", "Niche", "Cohort", "Plan", "Behavior"];
  const behaviors = data?.byBehavior?.map((b) => b.segment) ?? [
    "power",
    "active",
    "casual",
    "dormant",
    "at_risk",
  ];

  return [
    {
      key: "segmentType",
      label: "Segment Type",
      type: "multiselect",
      options: segmentTypes,
      placeholder: "Select types",
    },
    {
      key: "behavior",
      label: "Behavior",
      type: "multiselect",
      options: behaviors,
      placeholder: "Select behaviors",
    },
  ];
}

// =============================================================================
// CAMPAIGNS SECTION FILTERS
// =============================================================================

export function getCampaignsFilters(data?: {
  byCampaign?: Array<{ name: string; channel: string }>;
  byChannel?: Record<string, unknown>;
}): FilterFieldConfig[] {
  const channels = data?.byChannel
    ? Object.keys(data.byChannel)
    : ["email", "sms", "whatsapp"];

  const campaigns = data?.byCampaign?.map((c) => c.name) ?? [];

  return [
    {
      key: "channel",
      label: "Channel",
      type: "multiselect",
      options: channels,
      placeholder: "Select channels",
    },
    ...(campaigns.length > 0
      ? [
          {
            key: "campaign",
            label: "Campaign",
            type: "select" as const,
            options: campaigns.slice(0, 20),
            placeholder: "Select campaign",
          },
        ]
      : []),
    {
      key: "campaignSearch",
      label: "Search",
      type: "search",
      placeholder: "Search campaigns...",
    },
  ];
}

// =============================================================================
// UNIT ECONOMICS SECTION FILTERS
// =============================================================================

export function getUnitEconomicsFilters(data?: {
  cacByChannel?: Record<string, number>;
  ltvByChannel?: Record<string, number>;
  ltvByCohort?: Array<{ cohort: string }>;
}): FilterFieldConfig[] {
  const channels = data?.cacByChannel
    ? Object.keys(data.cacByChannel)
    : data?.ltvByChannel
      ? Object.keys(data.ltvByChannel)
      : ["organic", "paid", "referral"];

  const cohorts = data?.ltvByCohort?.map((c) => c.cohort) ?? [];

  return [
    {
      key: "channel",
      label: "Channel",
      type: "multiselect",
      options: channels,
      placeholder: "Select channels",
    },
    ...(cohorts.length > 0
      ? [
          {
            key: "cohort",
            label: "Cohort",
            type: "multiselect" as const,
            options: cohorts.slice(0, 12),
            placeholder: "Select cohorts",
          },
        ]
      : []),
  ];
}
