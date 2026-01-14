/**
 * Mock Data Generators for Attribution Analytics API
 *
 * This module contains mock data for the attribution analytics feature,
 * demonstrating multi-touch attribution models, conversion journeys, and path analysis.
 */

import type {
  AttributionModel,
  Channel,
  Touchpoint,
  ConversionJourney,
  ChannelAttribution,
  ModelResult,
  TouchpointPath,
  AttributionData,
  AttributionSummary,
} from "@/types/attribution";

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
 * Generate an ISO timestamp for N hours ago.
 */
function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

/**
 * Generate a random ID with a prefix.
 */
function generateId(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = prefix + "_";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Pick a random item from an array.
 * Returns undefined if array is empty.
 */
function randomPick<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a random number in a range.
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

const CAMPAIGNS = [
  "summer-sale-2024",
  "black-friday",
  "product-launch",
  "newsletter-jan",
  "retargeting-q4",
  "brand-awareness",
  "webinar-promo",
];

const SOURCES: Record<Channel, string[]> = {
  email: ["newsletter", "drip-campaign", "promotional"],
  "paid-search": ["google", "bing", "yahoo"],
  "organic-search": ["google", "bing", "duckduckgo"],
  social: ["facebook", "linkedin", "twitter", "instagram"],
  direct: ["direct"],
  referral: ["partner-site", "blog-mention", "review-site"],
  display: ["google-display", "programmatic", "retargeting"],
  affiliate: ["commission-junction", "shareasale", "impact"],
};

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

/**
 * Generate a single touchpoint.
 */
function generateTouchpoint(channel: Channel, hoursOffset: number): Touchpoint {
  const sources = SOURCES[channel];
  return {
    id: generateId("tp"),
    channel,
    timestamp: hoursAgo(hoursOffset),
    campaign: Math.random() > 0.4 ? randomPick(CAMPAIGNS) : undefined,
    source: randomPick(sources) ?? channel,
    medium: channel === "paid-search" ? "cpc" : channel === "email" ? "email" : "organic",
  };
}

/**
 * Generate a conversion journey with multiple touchpoints.
 */
function generateJourney(index: number): ConversionJourney {
  const touchpointCount = randomInRange(2, 6);
  const touchpoints: Touchpoint[] = [];

  // Generate touchpoints from oldest to newest
  let hoursOffset = randomInRange(48, 720); // 2-30 days ago
  for (let i = 0; i < touchpointCount; i++) {
    const channel = randomPick(CHANNELS) ?? "organic-search";
    touchpoints.push(generateTouchpoint(channel, Math.max(1, hoursOffset)));
    // Ensure offset stays positive
    const decrement = randomInRange(4, Math.min(72, Math.max(1, hoursOffset - 1)));
    hoursOffset -= decrement;
  }

  // Sort by timestamp (oldest first)
  touchpoints.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    id: generateId("journey"),
    userId: `user_${1000 + index}`,
    touchpoints,
    convertedAt: touchpoints[touchpoints.length - 1]!.timestamp,
    conversionValue: randomInRange(50, 500),
  };
}

/**
 * Calculate channel attributions for a given model.
 */
function calculateAttributions(
  journeys: ConversionJourney[],
  model: AttributionModel
): ChannelAttribution[] {
  const channelCredits: Record<Channel, { conversions: number; revenue: number; touchpoints: number }> = {} as Record<Channel, { conversions: number; revenue: number; touchpoints: number }>;

  // Initialize all channels
  for (const channel of CHANNELS) {
    channelCredits[channel] = { conversions: 0, revenue: 0, touchpoints: 0 };
  }

  // Calculate credits based on model
  for (const journey of journeys) {
    const { touchpoints, conversionValue } = journey;
    const len = touchpoints.length;

    switch (model) {
      case "first-touch": {
        const first = touchpoints[0]!;
        channelCredits[first.channel].conversions += 1;
        channelCredits[first.channel].revenue += conversionValue;
        channelCredits[first.channel].touchpoints += len;
        break;
      }
      case "last-touch": {
        const last = touchpoints[len - 1]!;
        channelCredits[last.channel].conversions += 1;
        channelCredits[last.channel].revenue += conversionValue;
        channelCredits[last.channel].touchpoints += len;
        break;
      }
      case "linear": {
        const creditPerTouch = 1 / len;
        const revenuePerTouch = conversionValue / len;
        for (const tp of touchpoints) {
          channelCredits[tp.channel].conversions += creditPerTouch;
          channelCredits[tp.channel].revenue += revenuePerTouch;
          channelCredits[tp.channel].touchpoints += 1;
        }
        break;
      }
      case "time-decay": {
        // Exponential decay with most recent touchpoints weighted higher
        const decayFactor = 0.5;
        let totalWeight = 0;
        const weights: number[] = [];

        for (let i = 0; i < len; i++) {
          const weight = Math.pow(decayFactor, len - 1 - i);
          weights.push(weight);
          totalWeight += weight;
        }

        for (let i = 0; i < len; i++) {
          const normalizedWeight = weights[i]! / totalWeight;
          channelCredits[touchpoints[i]!.channel].conversions += normalizedWeight;
          channelCredits[touchpoints[i]!.channel].revenue += conversionValue * normalizedWeight;
          channelCredits[touchpoints[i]!.channel].touchpoints += 1;
        }
        break;
      }
    }
  }

  // Calculate totals
  const totalRevenue = journeys.reduce((sum, j) => sum + j.conversionValue, 0);

  // Convert to ChannelAttribution array
  return CHANNELS.map((channel) => {
    const credits = channelCredits[channel];
    const conversions = Math.round(credits.conversions * 100) / 100;
    const revenue = Math.round(credits.revenue * 100) / 100;

    return {
      channel,
      conversions,
      attributedRevenue: revenue,
      percentOfTotal: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 10000) / 100 : 0,
      avgTouchpoints: conversions > 0 ? Math.round((credits.touchpoints / conversions) * 10) / 10 : 0,
      costPerAcquisition: conversions > 0 ? Math.round((revenue * 0.25) / conversions) : undefined,
      roi: Math.round((Math.random() * 200 + 50) * 100) / 100,
    };
  }).filter((ca) => ca.conversions > 0);
}

/**
 * Generate model results for all attribution models.
 */
function generateModelResults(journeys: ConversionJourney[]): ModelResult[] {
  const models: AttributionModel[] = ["first-touch", "last-touch", "linear", "time-decay"];
  const totalRevenue = journeys.reduce((sum, j) => sum + j.conversionValue, 0);

  return models.map((model) => ({
    model,
    channelAttributions: calculateAttributions(journeys, model),
    totalConversions: journeys.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    generatedAt: new Date().toISOString(),
  }));
}

/**
 * Generate touchpoint path data for Sankey visualization.
 */
function generatePaths(journeys: ConversionJourney[]): TouchpointPath[] {
  const pathCounts: Map<string, { count: number; value: number }> = new Map();

  for (const journey of journeys) {
    const { touchpoints, conversionValue } = journey;

    // Guard against empty touchpoints
    if (touchpoints.length === 0) continue;

    // Add "start" -> first touchpoint
    const firstKey = `start|${touchpoints[0]!.channel}`;
    const firstEntry = pathCounts.get(firstKey) ?? { count: 0, value: 0 };
    firstEntry.count += 1;
    firstEntry.value += conversionValue / touchpoints.length;
    pathCounts.set(firstKey, firstEntry);

    // Add intermediate touchpoint transitions
    for (let i = 0; i < touchpoints.length - 1; i++) {
      const key = `${touchpoints[i]!.channel}|${touchpoints[i + 1]!.channel}`;
      const entry = pathCounts.get(key) ?? { count: 0, value: 0 };
      entry.count += 1;
      entry.value += conversionValue / touchpoints.length;
      pathCounts.set(key, entry);
    }

    // Add last touchpoint -> "conversion"
    const lastKey = `${touchpoints[touchpoints.length - 1]!.channel}|conversion`;
    const lastEntry = pathCounts.get(lastKey) ?? { count: 0, value: 0 };
    lastEntry.count += 1;
    lastEntry.value += conversionValue / touchpoints.length;
    pathCounts.set(lastKey, lastEntry);
  }

  // Convert to TouchpointPath array
  const paths: TouchpointPath[] = [];
  for (const [key, data] of pathCounts.entries()) {
    const [from, to] = key.split("|") as [Channel | "start", Channel | "conversion"];
    paths.push({
      from,
      to,
      count: data.count,
      value: Math.round(data.value * 100) / 100,
    });
  }

  // Sort by count descending
  return paths.sort((a, b) => b.count - a.count);
}

/**
 * Calculate summary statistics.
 */
function calculateSummary(journeys: ConversionJourney[], models: ModelResult[]): AttributionSummary {
  const totalConversions = journeys.length;
  const totalRevenue = journeys.reduce((sum, j) => sum + j.conversionValue, 0);
  // Guard against division by zero
  const avgJourneyLength = totalConversions > 0
    ? journeys.reduce((sum, j) => sum + j.touchpoints.length, 0) / totalConversions
    : 0;

  // Find top channel from first-touch model (with empty array guard)
  const firstTouchModel = models.find((m) => m.model === "first-touch");
  const channelAttributions = firstTouchModel?.channelAttributions ?? [];
  const topChannelAttribution = channelAttributions.length > 0
    ? channelAttributions.reduce((max, ca) =>
        ca.attributedRevenue > max.attributedRevenue ? ca : max
      )
    : null;

  return {
    totalConversions,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    avgJourneyLength: Math.round(avgJourneyLength * 10) / 10,
    topChannel: topChannelAttribution?.channel ?? "organic-search",
  };
}

/**
 * Generate complete mock attribution data.
 */
function getMockAttributionData(): AttributionData {
  // Generate 50 sample journeys
  const journeys: ConversionJourney[] = [];
  for (let i = 0; i < 50; i++) {
    journeys.push(generateJourney(i));
  }

  const models = generateModelResults(journeys);
  const paths = generatePaths(journeys);
  const summary = calculateSummary(journeys, models);

  return {
    models,
    journeys: journeys.slice(0, 10), // Only include 10 sample journeys in response
    paths,
    timeRange: {
      start: daysAgo(30),
      end: daysAgo(0),
    },
    summary,
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
interface AttributionMockDataCache {
  __attributionMockDataCache?: AttributionData;
}

const globalCache = globalThis as unknown as AttributionMockDataCache;

/**
 * Get cached attribution mock data. Returns cached version with fresh timestamp.
 * Uses globalThis for hot reload resilience.
 */
export function getCachedAttributionMockData(): AttributionData {
  if (!globalCache.__attributionMockDataCache) {
    globalCache.__attributionMockDataCache = getMockAttributionData();
  }
  // Return with fresh model timestamps
  return {
    ...globalCache.__attributionMockDataCache,
    models: globalCache.__attributionMockDataCache.models.map((m) => ({
      ...m,
      generatedAt: new Date().toISOString(),
    })),
  };
}

/**
 * Get individual mock data generators for testing purposes.
 */
export const attributionMockGenerators = {
  generateJourney,
  generateModelResults,
  generatePaths,
  calculateSummary,
};
