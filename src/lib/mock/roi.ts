/**
 * Mock Data Generators for Channel ROI Calculator API
 *
 * This module contains mock data for the ROI calculator feature,
 * generating realistic cost, revenue, and ROI metrics for marketing channels.
 */

import type { Channel } from "@/types/attribution";
import type {
  ChannelCost,
  ChannelROIMetrics,
  ROISummary,
  ROITrendPoint,
  ROIData,
} from "@/types/roi";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate an ISO date string for N days ago.
 */
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Generate a random number in a range.
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float in a range with specified decimal places.
 */
function randomFloat(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CHANNELS: Channel[] = [
  "email",
  "paid-search",
  "organic-search",
  "social",
  "direct",
  "referral",
  "display",
  "affiliate",
];

/**
 * Channel-specific cost profiles for realistic mock data.
 * Values represent typical cost ranges and performance characteristics.
 */
const CHANNEL_PROFILES: Record<Channel, {
  adSpendRange: [number, number];
  laborRange: [number, number];
  toolsRange: [number, number];
  conversionRateRange: [number, number];
  ltvMultiplierRange: [number, number];
  roiModifier: number;
}> = {
  email: {
    adSpendRange: [500, 2000],
    laborRange: [1000, 3000],
    toolsRange: [100, 500],
    conversionRateRange: [2.5, 5.0],
    ltvMultiplierRange: [3.0, 5.0],
    roiModifier: 1.5, // Email typically has high ROI
  },
  "paid-search": {
    adSpendRange: [5000, 25000],
    laborRange: [2000, 5000],
    toolsRange: [200, 800],
    conversionRateRange: [3.0, 6.0],
    ltvMultiplierRange: [2.0, 3.5],
    roiModifier: 1.0,
  },
  "organic-search": {
    adSpendRange: [0, 500], // Minimal direct ad spend
    laborRange: [3000, 8000], // High labor for SEO
    toolsRange: [200, 1000],
    conversionRateRange: [2.0, 4.0],
    ltvMultiplierRange: [2.5, 4.0],
    roiModifier: 1.8, // High ROI due to low ongoing costs
  },
  social: {
    adSpendRange: [3000, 15000],
    laborRange: [2000, 5000],
    toolsRange: [100, 400],
    conversionRateRange: [1.0, 3.0],
    ltvMultiplierRange: [1.5, 2.5],
    roiModifier: 0.7, // Social can have lower ROI
  },
  direct: {
    adSpendRange: [0, 100],
    laborRange: [0, 500],
    toolsRange: [0, 100],
    conversionRateRange: [4.0, 8.0],
    ltvMultiplierRange: [3.5, 5.0],
    roiModifier: 3.0, // Direct has very high ROI (low/no acquisition cost)
  },
  referral: {
    adSpendRange: [500, 3000],
    laborRange: [500, 2000],
    toolsRange: [50, 300],
    conversionRateRange: [3.0, 6.0],
    ltvMultiplierRange: [3.0, 4.5],
    roiModifier: 1.6,
  },
  display: {
    adSpendRange: [4000, 20000],
    laborRange: [1500, 4000],
    toolsRange: [200, 600],
    conversionRateRange: [0.5, 2.0],
    ltvMultiplierRange: [1.5, 2.5],
    roiModifier: 0.5, // Display typically has lower ROI
  },
  affiliate: {
    adSpendRange: [2000, 10000], // Commission payments
    laborRange: [500, 2000],
    toolsRange: [100, 400],
    conversionRateRange: [2.0, 4.0],
    ltvMultiplierRange: [2.0, 3.0],
    roiModifier: 1.2,
  },
};

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

/**
 * Generate cost breakdown for a channel.
 */
function generateChannelCost(channel: Channel): ChannelCost {
  const profile = CHANNEL_PROFILES[channel];

  const adSpend = randomInRange(...profile.adSpendRange);
  const laborCost = randomInRange(...profile.laborRange);
  const toolsCost = randomInRange(...profile.toolsRange);
  const otherCost = randomInRange(0, 500);

  return {
    channel,
    adSpend,
    laborCost,
    toolsCost,
    otherCost,
    totalCost: adSpend + laborCost + toolsCost + otherCost,
  };
}

/**
 * Generate complete ROI metrics for a channel.
 */
function generateChannelROIMetrics(channel: Channel): ChannelROIMetrics {
  const profile = CHANNEL_PROFILES[channel];
  const costs = generateChannelCost(channel);

  // Generate impressions and conversions
  const impressions = randomInRange(50000, 500000);
  const conversionRate = randomFloat(...profile.conversionRateRange);
  const clicks = Math.round(impressions * randomFloat(0.01, 0.05)); // 1-5% CTR
  const conversions = Math.max(1, Math.round(clicks * (conversionRate / 100)));

  // Calculate revenue based on conversions and average order value
  const aov = randomInRange(50, 300);
  const revenue = conversions * aov * randomFloat(0.8, 1.2);

  // Calculate derived metrics
  const cac = conversions > 0 ? costs.totalCost / conversions : 0;
  const ltvMultiplier = randomFloat(...profile.ltvMultiplierRange);
  const ltv = aov * ltvMultiplier;
  // When CAC is 0, LTV:CAC is essentially infinite - cap at 100 for display
  const ltvCacRatio = cac > 0 ? ltv / cac : ltv > 0 ? 100 : 0;

  // ROI with channel-specific modifier for realistic variation
  // When cost is 0 but revenue exists, ROI is essentially infinite - cap at 1000% for display
  const baseROI = costs.totalCost > 0
    ? ((revenue - costs.totalCost) / costs.totalCost) * 100
    : revenue > 0 ? 1000 : 0;
  const roi = baseROI * profile.roiModifier;

  // ROAS calculation - when ad spend is 0 but revenue exists, cap at 1000 for display
  const roas = costs.adSpend > 0 ? revenue / costs.adSpend : revenue > 0 ? 1000 : 0;

  // Payback period (assuming monthly revenue is distributed from conversions)
  const monthlyRevenuePerCustomer = (ltv / 12);
  const paybackPeriodDays = monthlyRevenuePerCustomer > 0
    ? Math.round((cac / (monthlyRevenuePerCustomer / 30)) * 10) / 10
    : 0;

  // CPM calculation
  const cpm = impressions > 0 ? (costs.totalCost / impressions) * 1000 : 0;

  return {
    channel,
    costs,
    revenue: Math.round(revenue * 100) / 100,
    conversions,
    roi: Math.round(roi * 100) / 100,
    roas: Math.round(roas * 100) / 100,
    cac: Math.round(cac * 100) / 100,
    ltv: Math.round(ltv * 100) / 100,
    ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,
    paybackPeriodDays: Math.round(paybackPeriodDays),
    conversionRate: Math.round(conversionRate * 100) / 100,
    impressions,
    cpm: Math.round(cpm * 100) / 100,
  };
}

/**
 * Calculate summary statistics from channel metrics.
 * @throws Error if channels array is empty
 */
function calculateSummary(channels: ChannelROIMetrics[]): ROISummary {
  if (channels.length === 0) {
    throw new Error("Cannot calculate summary for empty channels array");
  }

  const totalSpend = channels.reduce((sum, c) => sum + c.costs.totalCost, 0);
  const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = channels.reduce((sum, c) => sum + c.conversions, 0);

  const overallROI = totalSpend > 0
    ? ((totalRevenue - totalSpend) / totalSpend) * 100
    : 0;

  const avgCAC = channels.reduce((sum, c) => sum + c.cac, 0) / channels.length;
  const avgLtvCacRatio = channels.reduce((sum, c) => sum + c.ltvCacRatio, 0) / channels.length;

  // Find best performing channels
  const sortedByROI = [...channels].sort((a, b) => b.roi - a.roi);
  const sortedByCAC = [...channels].sort((a, b) => a.cac - b.cac);
  const sortedByLtvCac = [...channels].sort((a, b) => b.ltvCacRatio - a.ltvCacRatio);

  // Safe to use non-null assertion since we validated channels.length > 0
  return {
    totalSpend: Math.round(totalSpend * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalConversions,
    overallROI: Math.round(overallROI * 100) / 100,
    avgCAC: Math.round(avgCAC * 100) / 100,
    avgLtvCacRatio: Math.round(avgLtvCacRatio * 100) / 100,
    topROIChannel: sortedByROI[0]!.channel,
    lowestCACChannel: sortedByCAC[0]!.channel,
    bestLtvCacChannel: sortedByLtvCac[0]!.channel,
  };
}

/**
 * Generate trend data for the past 30 days.
 */
function generateTrendData(): ROITrendPoint[] {
  const trend: ROITrendPoint[] = [];
  let baseSpend = randomInRange(40000, 60000);
  let baseRevenue = baseSpend * randomFloat(1.2, 2.0);

  for (let i = 29; i >= 0; i--) {
    // Add some daily variation
    const spend = baseSpend * randomFloat(0.85, 1.15);
    const revenue = baseRevenue * randomFloat(0.85, 1.15);
    const roi = ((revenue - spend) / spend) * 100;

    trend.push({
      date: daysAgo(i),
      roi: Math.round(roi * 100) / 100,
      spend: Math.round(spend * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
    });

    // Gradual trend (slight improvement over time)
    baseSpend *= randomFloat(0.99, 1.01);
    baseRevenue *= randomFloat(1.0, 1.02);
  }

  return trend;
}

/**
 * Generate complete mock ROI data.
 */
function getMockROIData(): ROIData {
  const channels = CHANNELS.map(generateChannelROIMetrics);
  const summary = calculateSummary(channels);
  const trend = generateTrendData();

  return {
    channels,
    summary,
    trend,
    timeRange: "30d",
    generatedAt: new Date().toISOString(),
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
interface ROIMockDataCache {
  __roiMockDataCache?: ROIData;
}

const globalCache = globalThis as unknown as ROIMockDataCache;

/**
 * Get cached ROI mock data. Returns cached version with fresh timestamp.
 * Uses globalThis for hot reload resilience.
 */
export function getCachedROIMockData(): ROIData {
  if (!globalCache.__roiMockDataCache) {
    globalCache.__roiMockDataCache = getMockROIData();
  }
  // Return with fresh timestamp
  return {
    ...globalCache.__roiMockDataCache,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get individual mock data generators for testing purposes.
 */
export const roiMockGenerators = {
  generateChannelCost,
  generateChannelROIMetrics,
  calculateSummary,
  generateTrendData,
};
