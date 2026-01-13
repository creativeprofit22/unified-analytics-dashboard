/**
 * Mock Data Generators for Analytics API
 *
 * This module contains all mock data generation logic, extracted from the API route
 * to improve maintainability and separation of concerns.
 */

import type {
  AnalyticsData,
  UnifiedAnalyticsData,
  TrendDataPoint,
  ContentItem,
  ProfileStats,
  Platform,
  TrafficMetrics,
  SEOMetrics,
  ConversionMetrics,
  RevenueMetrics,
  SubscriptionMetrics,
  PaymentMetrics,
  UnitEconomicsMetrics,
  DemographicsMetrics,
  SegmentationMetrics,
  CampaignMetrics,
} from "@/types";

// =============================================================================
// LEGACY MOCK DATA GENERATORS
// =============================================================================

/**
 * Generate mock trend data for a given number of days
 */
function generateMockTrend(days: number): TrendDataPoint[] {
  const trend: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0] ?? "";
    trend.push({
      date: dateStr,
      value: Math.floor(Math.random() * 50000) + 30000,
    });
  }

  return trend;
}

/**
 * Generate mock content items (legacy)
 */
function generateMockContent(count: number): ContentItem[] {
  const platforms: Platform[] = ["youtube", "tiktok", "instagram", "twitter"];

  return Array.from({ length: count }, (_, i) => {
    const platform = platforms[i % platforms.length]!;
    return {
      id: `content-${i + 1}`,
      platform,
      title: `Top Performing Content #${i + 1}`,
      thumbnailUrl: null,
      publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
      views: Math.floor(Math.random() * 100000) + 10000,
      likes: Math.floor(Math.random() * 5000) + 500,
      comments: Math.floor(Math.random() * 500) + 50,
      shares: Math.floor(Math.random() * 200) + 20,
      engagementRate: Math.random() * 10 + 2,
      vph: Math.floor(Math.random() * 1000) + 100,
    };
  });
}

/**
 * Generate mock profile data (legacy)
 */
function generateMockProfiles(): ProfileStats[] {
  return [
    {
      id: "yt-1",
      platform: "youtube",
      name: "Main Channel",
      handle: "@mainchannel",
      avatarUrl: null,
      followers: 50000,
      totalViews: 750000,
      avgEngagement: 4.2,
    },
    {
      id: "tt-1",
      platform: "tiktok",
      name: "TikTok Profile",
      handle: "@tiktokprofile",
      avatarUrl: null,
      followers: 45000,
      totalViews: 350000,
      avgEngagement: 8.5,
    },
    {
      id: "ig-1",
      platform: "instagram",
      name: "Instagram",
      handle: "@instagramhandle",
      avatarUrl: null,
      followers: 25000,
      totalViews: 100000,
      avgEngagement: 5.1,
    },
    {
      id: "tw-1",
      platform: "twitter",
      name: "Twitter/X",
      handle: "@twitterhandle",
      avatarUrl: null,
      followers: 5000,
      totalViews: 50000,
      avgEngagement: 2.3,
    },
  ];
}

/**
 * Get legacy mock analytics data
 */
function getLegacyMockData(days: number): AnalyticsData {
  return {
    overview: {
      totalViews: {
        current: 1250000,
        previous: 980000,
        change: 27.5,
        changeType: "increase",
      },
      totalEngagement: {
        current: 45000,
        previous: 42000,
        change: 7.1,
        changeType: "increase",
      },
      totalFollowers: {
        current: 125000,
        previous: 118000,
        change: 5.9,
        changeType: "increase",
      },
      totalContent: {
        current: 156,
        previous: 142,
        change: 9.8,
        changeType: "increase",
      },
    },
    viewsTrend: generateMockTrend(days),
    engagementTrend: generateMockTrend(days),
    topContent: generateMockContent(10),
    profiles: generateMockProfiles(),
    platformBreakdown: [
      { platform: "youtube", views: 750000, engagement: 25000, content: 48 },
      { platform: "tiktok", views: 350000, engagement: 15000, content: 72 },
      { platform: "instagram", views: 100000, engagement: 4000, content: 24 },
      { platform: "twitter", views: 50000, engagement: 1000, content: 12 },
    ],
  };
}

// =============================================================================
// CATEGORY-SPECIFIC MOCK DATA
// =============================================================================

/**
 * 1. Traffic & Acquisition mock data
 */
function getMockTrafficData(): TrafficMetrics {
  return {
    sessions: 12847,
    uniqueVisitors: 9432,
    newVisitors: 5621,
    returningVisitors: 3811,
    bounceRate: 42.3,
    pagesPerSession: 3.2,
    avgSessionDuration: 187,
    trafficBySource: {
      organic: 5234,
      direct: 3102,
      social: 1876,
      referral: 1543,
      email: 1092,
    },
    trafficByMedium: {
      organic: 5234,
      direct: 3102,
      referral: 2419,
      cpc: 1200,
      email: 892,
    },
    trafficByCampaign: [
      { campaign: "summer_sale_2025", sessions: 2341, conversions: 89 },
      { campaign: "product_launch", sessions: 1876, conversions: 52 },
      { campaign: "newsletter_jan", sessions: 1234, conversions: 78 },
    ],
    topLandingPages: [
      { path: "/", sessions: 4532, bounceRate: 38.2 },
      { path: "/products", sessions: 2341, bounceRate: 42.1 },
      { path: "/blog/getting-started", sessions: 1876, bounceRate: 35.4 },
      { path: "/pricing", sessions: 1243, bounceRate: 28.9 },
    ],
    topExitPages: [
      { path: "/checkout", exits: 876, exitRate: 24.1 },
      { path: "/pricing", exits: 654, exitRate: 18.2 },
      { path: "/contact", exits: 432, exitRate: 45.3 },
    ],
    coreWebVitals: {
      lcp: 2.1,
      fid: 45,
      cls: 0.08,
    },
  };
}

/**
 * 2. SEO mock data
 */
function getMockSEOData(): SEOMetrics {
  return {
    visibilityScore: 67.4,
    impressions: 284500,
    clicks: 12340,
    ctr: 4.34,
    averagePosition: 14.2,
    backlinks: 3420,
    referringDomains: 287,
    domainAuthority: 42,
    indexedPages: 1250,
    keywordRankings: [
      { keyword: "best crm software", position: 8, previousPosition: 12, change: 4, volume: 12000, url: "/crm" },
      { keyword: "marketing automation", position: 15, previousPosition: 14, change: -1, volume: 8500, url: "/automation" },
      { keyword: "sales dashboard", position: 3, previousPosition: 5, change: 2, volume: 6200, url: "/dashboard" },
      { keyword: "analytics platform", position: 11, previousPosition: 18, change: 7, volume: 4800, url: "/analytics" },
    ],
    topQueries: [
      { query: "unified analytics", impressions: 45000, clicks: 2340, ctr: 5.2, position: 4.2 },
      { query: "dashboard software", impressions: 38000, clicks: 1876, ctr: 4.9, position: 6.1 },
      { query: "marketing metrics", impressions: 32000, clicks: 1543, ctr: 4.8, position: 8.3 },
      { query: "analytics platform", impressions: 28000, clicks: 980, ctr: 3.5, position: 12.4 },
      { query: "business intelligence", impressions: 22000, clicks: 660, ctr: 3.0, position: 18.7 },
      { query: "data visualization", impressions: 19000, clicks: 570, ctr: 3.0, position: 22.1 },
      { query: "kpi tracking", impressions: 15000, clicks: 600, ctr: 4.0, position: 9.5 },
      { query: "real time reporting", impressions: 12000, clicks: 360, ctr: 3.0, position: 25.3 },
      { query: "saas analytics", impressions: 9500, clicks: 475, ctr: 5.0, position: 7.8 },
      { query: "conversion tracking", impressions: 8200, clicks: 328, ctr: 4.0, position: 15.2 },
    ],
    topPages: [
      { url: "/features", clicks: 3421, impressions: 78000, ctr: 4.4, position: 5.2 },
      { url: "/pricing", clicks: 2876, impressions: 62000, ctr: 4.6, position: 4.8 },
      { url: "/blog/seo-guide", clicks: 2341, impressions: 54000, ctr: 4.3, position: 6.1 },
    ],
  };
}

/**
 * 3. Conversions & Funnel mock data
 */
function getMockConversionData(): ConversionMetrics {
  return {
    conversionRate: 3.42,
    totalConversions: 847,
    conversionsBySource: {
      google: { visitors: 5234, conversions: 234, rate: 4.47 },
      direct: { visitors: 3102, conversions: 156, rate: 5.03 },
      facebook: { visitors: 1876, conversions: 67, rate: 3.57 },
      referral: { visitors: 1543, conversions: 89, rate: 5.77 },
      email: { visitors: 1092, conversions: 78, rate: 7.14 },
    },
    microConversions: [
      { name: "Email signup", count: 2341, rate: 18.2 },
      { name: "Account created", count: 1234, rate: 9.6 },
      { name: "Pricing page viewed", count: 3456, rate: 26.9 },
      { name: "Demo requested", count: 456, rate: 3.5 },
    ],
    addToCartRate: 9.7,
    cartAbandonmentRate: 68.4,
    checkoutAbandonmentRate: 24.2,
    checkoutCompletionRate: 75.8,
    funnel: [
      { step: "Visit", users: 12847, dropOff: 0, dropOffRate: 0 },
      { step: "Product View", users: 7234, dropOff: 5613, dropOffRate: 43.7 },
      { step: "Add to Cart", users: 1246, dropOff: 5988, dropOffRate: 82.8 },
      { step: "Checkout", users: 394, dropOff: 852, dropOffRate: 68.4 },
      { step: "Purchase", users: 299, dropOff: 95, dropOffRate: 24.1 },
    ],
    timeToConvert: {
      median: 2.3,
      distribution: {
        "Same day": 34,
        "1-3 days": 28,
        "4-7 days": 18,
        "8-14 days": 12,
        "15-30 days": 6,
        "30+ days": 2,
      },
    },
    assistedConversions: [
      { channel: "Email", assisted: 234, lastClick: 78, ratio: 3.0 },
      { channel: "Social", assisted: 156, lastClick: 67, ratio: 2.3 },
      { channel: "Organic", assisted: 321, lastClick: 234, ratio: 1.4 },
    ],
  };
}

/**
 * 4. Revenue & Orders mock data
 */
function getMockRevenueData(): RevenueMetrics {
  const now = new Date();
  return {
    grossRevenue: 142690,
    netRevenue: 128421,
    transactions: 847,
    aov: 168.47,
    medianOrderValue: 129.0,
    unitsPerOrder: 2.3,
    revenuePerVisitor: 11.1,
    revenueByProduct: [
      { productId: "prod_1", productName: "Pro Plan", revenue: 52340, units: 234 },
      { productId: "prod_2", productName: "Enterprise Plan", revenue: 48420, units: 89 },
      { productId: "prod_3", productName: "Basic Plan", revenue: 28540, units: 456 },
      { productId: "prod_4", productName: "Add-ons", revenue: 13390, units: 321 },
    ],
    revenueByCategory: {
      Subscriptions: 98760,
      "One-time": 28540,
      "Add-ons": 15390,
    },
    revenueByChannel: {
      Organic: 52340,
      Paid: 38420,
      Direct: 28540,
      Referral: 23390,
    },
    refundAmount: 4230,
    refundRate: 2.9,
    returnRate: 4.2,
    discountUsageRate: 34.5,
    avgDiscountValue: 22.4,
    revenueGrowth: { value: 12.4, period: "month" },
    revenueTrend: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split("T")[0] ?? "",
        gross: 4000 + Math.floor(Math.random() * 2000),
        net: 3600 + Math.floor(Math.random() * 1800),
      };
    }),
  };
}

/**
 * 5. Subscriptions & Retention mock data
 */
function getMockSubscriptionData(): SubscriptionMetrics {
  return {
    activeSubscribers: 2847,
    newSubscribers: 234,
    cancelledSubscribers: 87,
    churnRate: { monthly: 3.1, annual: 31.8 },
    retentionRate: 96.9,
    retentionByCohort: [
      { cohort: "2025-10", months: [100, 92, 85, 78, 72] },
      { cohort: "2025-11", months: [100, 88, 76, 69] },
      { cohort: "2025-12", months: [100, 82, 71] },
      { cohort: "2026-01", months: [100, 86] },
    ],
    mrr: 142350,
    arr: 1708200,
    mrrMovement: {
      new: 23400,
      expansion: 4200,
      contraction: 1800,
      churned: 8700,
      net: 17100,
    },
    reactivations: 12,
    reactivationRate: 4.2,
    cancellationReasons: {
      "Too expensive": 34,
      "Not using enough": 28,
      "Switched to competitor": 15,
      "Missing features": 12,
      Other: 11,
    },
    trialToPaidRate: 22.4,
    avgSubscriptionLength: 14.2,
    subscriberLtv: 712,
    subscribersByPlan: {
      Basic: 1240,
      Pro: 1102,
      Enterprise: 505,
    },
  };
}

/**
 * 6. Payments mock data
 */
function getMockPaymentData(): PaymentMetrics {
  return {
    successfulPayments: 2847,
    failedPayments: 143,
    failureRate: 4.8,
    failureByReason: {
      "Card declined": 52,
      "Insufficient funds": 38,
      "Expired card": 24,
      "Invalid card": 12,
      "Fraud detection": 8,
      "Processing error": 9,
    },
    recoveryRate: 62.4,
    dunningSuccessRate: 58.2,
    recoveryByAttempt: {
      attempt1: 45,
      attempt2: 28,
      attempt3: 12,
      attempt4: 4,
    },
    avgTimeToRecovery: 4.2,
    involuntaryChurn: 34,
    involuntaryChurnRate: 39.1,
    paymentMethodDistribution: {
      Visa: 42,
      Mastercard: 28,
      "American Express": 12,
      PayPal: 10,
      "Apple Pay": 5,
      Other: 3,
    },
    failureRateByMethod: {
      Visa: 3.2,
      Mastercard: 4.1,
      "American Express": 2.8,
      PayPal: 1.2,
      "Apple Pay": 0.8,
    },
    atRiskRevenue: 7240,
    recoveredRevenue: 12450,
    cardsExpiringSoon: {
      next30Days: 47,
      next60Days: 89,
      next90Days: 156,
    },
  };
}

/**
 * 7. Unit Economics mock data
 */
function getMockUnitEconomicsData(): UnitEconomicsMetrics {
  return {
    cac: 127,
    cacByChannel: {
      "Google Ads": 98,
      "Facebook Ads": 142,
      Organic: 45,
      Referral: 32,
      Content: 67,
    },
    cacPaybackPeriod: 4.2,
    ltv: 712,
    ltvByCohort: [
      { cohort: "2025-Q3", months: [42, 84, 126, 168, 210, 252] },
      { cohort: "2025-Q4", months: [45, 90, 135, 180, 225] },
      { cohort: "2026-Q1", months: [48, 96, 144] },
    ],
    ltvByChannel: {
      "Google Ads": 715,
      "Facebook Ads": 582,
      Organic: 576,
      Referral: 589,
      Content: 616,
    },
    ltvCacRatio: 5.6,
    ltvCacByChannel: {
      "Google Ads": 7.3,
      "Facebook Ads": 4.1,
      Organic: 12.8,
      Referral: 18.4,
      Content: 9.2,
    },
    grossMargin: 72.4,
    grossMarginPerCustomer: 36.2,
    arpu: 42.5,
    arppu: 49.9,
    arpuGrowthRate: 3.2,
    contributionMargin: 58.3,
    nrr: 108.4,
    grr: 94.2,
    customerConcentration: {
      top10Percent: 28,
      top20Percent: 45,
    },
  };
}

/**
 * 8. Demographics mock data
 */
function getMockDemographicsData(): DemographicsMetrics {
  return {
    geographic: {
      byCountry: [
        { country: "United States", countryCode: "US", users: 5234, sessions: 8421, conversionRate: 3.8 },
        { country: "United Kingdom", countryCode: "GB", users: 1876, sessions: 2943, conversionRate: 4.2 },
        { country: "Canada", countryCode: "CA", users: 1243, sessions: 1987, conversionRate: 3.5 },
        { country: "Australia", countryCode: "AU", users: 987, sessions: 1543, conversionRate: 4.1 },
        { country: "Germany", countryCode: "DE", users: 756, sessions: 1121, conversionRate: 2.9 },
      ],
      byRegion: [
        { region: "California", country: "US", users: 1234 },
        { region: "Texas", country: "US", users: 876 },
        { region: "New York", country: "US", users: 754 },
        { region: "England", country: "GB", users: 1243 },
      ],
      byCity: [
        { city: "New York", country: "US", users: 543 },
        { city: "Los Angeles", country: "US", users: 432 },
        { city: "London", country: "GB", users: 387 },
        { city: "Toronto", country: "CA", users: 298 },
      ],
    },
    device: {
      byType: {
        desktop: 5432,
        mobile: 6234,
        tablet: 1181,
      },
      byModel: [
        { model: "iPhone", users: 3421 },
        { model: "Samsung Galaxy", users: 1234 },
        { model: "iPad", users: 876 },
        { model: "MacBook", users: 2341 },
      ],
      byResolution: [
        { resolution: "1920x1080", users: 2341 },
        { resolution: "1440x900", users: 1234 },
        { resolution: "375x812", users: 3421 },
        { resolution: "414x896", users: 1876 },
      ],
    },
    technology: {
      byBrowser: {
        Chrome: 52,
        Safari: 28,
        Firefox: 8,
        Edge: 7,
        "Samsung Internet": 3,
        Other: 2,
      },
      byOS: {
        iOS: 32,
        Android: 28,
        Windows: 24,
        macOS: 14,
        Linux: 2,
      },
      byLanguage: [
        { language: "en-US", users: 6543 },
        { language: "en-GB", users: 1876 },
        { language: "es", users: 543 },
        { language: "de", users: 421 },
      ],
    },
    userAttributes: {
      byAge: {
        "18-24": 12,
        "25-34": 34,
        "35-44": 28,
        "45-54": 16,
        "55-64": 7,
        "65+": 3,
      },
      byGender: {
        Male: 54,
        Female: 42,
        Unknown: 4,
      },
      byInterest: [
        { interest: "Technology", users: 4321 },
        { interest: "Business", users: 3456 },
        { interest: "Finance", users: 2345 },
        { interest: "Marketing", users: 1987 },
      ],
    },
    conversionsBySegment: [
      { segment: "device", segmentValue: "desktop", visitors: 5432, conversions: 186, conversionRate: 3.42 },
      { segment: "device", segmentValue: "mobile", visitors: 6234, conversions: 213, conversionRate: 3.42 },
      { segment: "device", segmentValue: "tablet", visitors: 1181, conversions: 40, conversionRate: 3.39 },
    ],
  };
}

/**
 * 9. Segmentation mock data
 */
function getMockSegmentationData(): SegmentationMetrics {
  return {
    byCampaign: [
      { campaign: "summer_sale_2025", source: "google", medium: "cpc", users: 2341, conversions: 89, revenue: 12450, cac: 45, roi: 3.2 },
      { campaign: "product_launch", source: "facebook", medium: "paid", users: 1876, conversions: 52, revenue: 8920, cac: 67, roi: 2.1 },
      { campaign: "newsletter_jan", source: "email", medium: "email", users: 1234, conversions: 78, revenue: 9840, cac: 12, roi: 8.4 },
    ],
    byNiche: [
      { niche: "E-commerce", users: 3421, conversionRate: 4.2, avgLtv: 890, churnRate: 3.1 },
      { niche: "SaaS", users: 2876, conversionRate: 5.1, avgLtv: 1240, churnRate: 2.4 },
      { niche: "Agency", users: 1543, conversionRate: 3.8, avgLtv: 670, churnRate: 4.2 },
      { niche: "Healthcare", users: 987, conversionRate: 6.2, avgLtv: 1450, churnRate: 1.8 },
    ],
    byCohort: [
      { cohort: "2025-10", users: 1234, retentionCurve: [100, 85, 72, 65, 61], cumulativeLtv: [42, 84, 126, 168, 210] },
      { cohort: "2025-11", users: 1456, retentionCurve: [100, 88, 76, 69], cumulativeLtv: [45, 90, 135, 180] },
      { cohort: "2025-12", users: 1678, retentionCurve: [100, 82, 71], cumulativeLtv: [48, 96, 144] },
    ],
    byPlan: [
      { plan: "Free", users: 8432, mrr: 0, churnRate: 0, upgradeRate: 12.4, downgradeRate: 0 },
      { plan: "Basic", users: 1240, mrr: 24800, churnRate: 4.2, upgradeRate: 8.1, downgradeRate: 0 },
      { plan: "Pro", users: 1102, mrr: 77140, churnRate: 2.8, upgradeRate: 3.2, downgradeRate: 1.4 },
      { plan: "Enterprise", users: 505, mrr: 75750, churnRate: 1.2, upgradeRate: 0, downgradeRate: 0.8 },
    ],
    byBehavior: [
      { segment: "power", users: 493, percentage: 10, avgRevenue: 142 },
      { segment: "active", users: 1232, percentage: 25, avgRevenue: 68 },
      { segment: "casual", users: 1872, percentage: 38, avgRevenue: 32 },
      { segment: "dormant", users: 985, percentage: 20, avgRevenue: 8 },
      { segment: "at_risk", users: 344, percentage: 7, avgRevenue: 45 },
    ],
    byLeadScore: {
      hot: 234,
      warm: 876,
      cold: 2341,
    },
    byLifecycle: {
      visitor: 45000,
      lead: 3421,
      trial: 567,
      customer: 2847,
      churned: 432,
      reactivated: 87,
    },
    crossSegment: [
      {
        segmentA: { type: "plan", value: "Pro" },
        segmentB: { type: "plan", value: "Basic" },
        metric: "conversion_rate",
        valueA: 5.2,
        valueB: 3.8,
        difference: 1.4,
      },
    ],
  };
}

/**
 * 10. Campaigns mock data
 */
function getMockCampaignData(): CampaignMetrics {
  return {
    summary: {
      sent: 45000,
      delivered: 43200,
      deliveryRate: 96.0,
      bounced: 1800,
      bounceRate: 4.0,
    },
    engagement: {
      opens: 9504,
      openRate: 22.0,
      clicks: 1728,
      ctr: 4.0,
      ctor: 18.2,
      replies: 234,
      replyRate: 0.54,
    },
    conversions: {
      count: 432,
      rate: 1.0,
      revenue: 54890,
      revenuePerMessage: 1.22,
      revenuePerClick: 31.76,
      roi: 412,
    },
    negative: {
      unsubscribes: 189,
      unsubscribeRate: 0.44,
      spamComplaints: 12,
      spamRate: 0.03,
    },
    listHealth: {
      totalSubscribers: 28470,
      newSubscribers: 1234,
      activeSubscribers: 18540,
      growthRate: 3.2,
    },
    byChannel: {
      email: { sent: 35000, delivered: 33600, deliveryRate: 96, engaged: 7392, engagementRate: 22, conversions: 312, revenue: 42340 },
      sms: { sent: 8000, delivered: 7840, deliveryRate: 98, engaged: 1568, engagementRate: 20, conversions: 98, revenue: 9870 },
      whatsapp: { sent: 2000, delivered: 1760, deliveryRate: 88, engaged: 544, engagementRate: 31, conversions: 22, revenue: 2680 },
    },
    byCampaign: [
      { id: "camp_001", name: "January Newsletter", channel: "email", sentAt: "2026-01-05", sent: 25000, delivered: 24000, opens: 5280, clicks: 960, conversions: 187, revenue: 24310, unsubscribes: 108 },
      { id: "camp_002", name: "Flash Sale Alert", channel: "sms", sentAt: "2026-01-08", sent: 8000, delivered: 7840, opens: 0, clicks: 1568, conversions: 98, revenue: 9870, unsubscribes: 24 },
      { id: "camp_003", name: "Abandoned Cart", channel: "email", sentAt: "2026-01-01", sent: 10000, delivered: 9600, opens: 4224, clicks: 768, conversions: 125, revenue: 18030, unsubscribes: 57 },
    ],
  };
}

/**
 * Get unified mock analytics data.
 *
 * Note: Unified mode always returns 30-day data regardless of the `days` parameter
 * passed to the API. Time-based filtering is not implemented for unified mode since
 * each category has different time semantics (e.g., cohort data spans months, SEO
 * rankings are point-in-time). If time filtering is needed in the future, consider
 * adding a `timeRange` parameter to each category's generator function.
 */
function getUnifiedMockData(): UnifiedAnalyticsData {
  return {
    traffic: getMockTrafficData(),
    seo: getMockSEOData(),
    conversions: getMockConversionData(),
    revenue: getMockRevenueData(),
    subscriptions: getMockSubscriptionData(),
    payments: getMockPaymentData(),
    unitEconomics: getMockUnitEconomicsData(),
    demographics: getMockDemographicsData(),
    segmentation: getMockSegmentationData(),
    campaigns: getMockCampaignData(),
    timeRange: "30d",
    fetchedAt: new Date().toISOString(),
  };
}

// =============================================================================
// MOCK DATA CACHE (globalThis pattern for hot reload resilience)
// =============================================================================

/**
 * Global cache interface for hot reload resilience.
 * Using globalThis prevents cache reset during Turbopack hot reloads.
 * @see Fixes & Lessons Learned: "Turbopack Hot Reload Loses In-Memory State"
 */
interface MockDataCache {
  __unifiedMockDataCache?: UnifiedAnalyticsData;
  __legacyMockDataCache?: Map<number, AnalyticsData>;
}

const globalCache = globalThis as unknown as MockDataCache;

/**
 * Get cached unified mock data. Returns cached version with fresh timestamp.
 * Uses globalThis for hot reload resilience.
 */
export function getCachedUnifiedMockData(): UnifiedAnalyticsData {
  if (!globalCache.__unifiedMockDataCache) {
    globalCache.__unifiedMockDataCache = getUnifiedMockData();
  }
  // Return with fresh timestamp
  return {
    ...globalCache.__unifiedMockDataCache,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Apply a variation factor to numeric values in an object (recursive).
 * Used to generate "previous period" data for comparison mode.
 */
function applyVariation<T>(obj: T, factor: number): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'number') {
    // Apply variation: multiply by factor, add some randomness
    const variation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    return (obj * factor * variation) as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => applyVariation(item, factor)) as T;
  }
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip non-numeric fields that shouldn't be modified
      if (key === 'date' || key === 'id' || key === 'name' || key === 'url' ||
          key === 'path' || key === 'keyword' || key === 'query' || key === 'campaign' ||
          key === 'channel' || key === 'segment' || key === 'plan' || key === 'niche' ||
          key === 'cohort' || key === 'timeRange' || key === 'fetchedAt' ||
          key === 'country' || key === 'countryCode' || key === 'region' || key === 'city' ||
          key === 'model' || key === 'resolution' || key === 'language' || key === 'interest' ||
          key === 'sentAt' || key === 'productId' || key === 'productName') {
        result[key] = value;
      } else {
        result[key] = applyVariation(value, factor);
      }
    }
    return result as T;
  }
  return obj;
}

/**
 * Get comparison mock data with values adjusted to simulate a previous period.
 * Values are generally lower (factor 0.85) to show growth in current period.
 */
export function getCachedComparisonMockData(): UnifiedAnalyticsData {
  const baseData = getCachedUnifiedMockData();
  // Apply 0.85 factor to simulate "previous period" being ~15% lower
  return applyVariation(baseData, 0.85);
}

/**
 * Get cached legacy mock data for a given number of days.
 * Uses globalThis for hot reload resilience.
 */
export function getCachedLegacyMockData(days: number): AnalyticsData {
  if (!globalCache.__legacyMockDataCache) {
    globalCache.__legacyMockDataCache = new Map();
  }
  if (!globalCache.__legacyMockDataCache.has(days)) {
    globalCache.__legacyMockDataCache.set(days, getLegacyMockData(days));
  }
  return globalCache.__legacyMockDataCache.get(days)!;
}
