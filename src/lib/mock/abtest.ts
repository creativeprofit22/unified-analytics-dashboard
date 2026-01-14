/**
 * Mock Data Generators for A/B Test Analytics API
 *
 * This module contains mock data for the A/B test analytics feature,
 * demonstrating experiment tracking, statistical significance, and variant comparisons.
 */

import type {
  ExperimentStatus,
  ABTestMetricType,
  ConfidenceLevel,
  Variant,
  VariantMetrics,
  StatisticalSignificance,
  VariantComparison,
  ExperimentTrendPoint,
  Experiment,
  ABTestSummary,
  ABTestData,
} from "@/types/abtest";
import type { Channel } from "@/types/attribution";

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
 * Generate an ISO timestamp for N days ago.
 */
function daysAgoISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
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

/**
 * Generate a random float in a range.
 */
function randomFloat(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

// =============================================================================
// CONSTANTS
// =============================================================================

const EXPERIMENT_NAMES = [
  "CTA Button Color Test",
  "Checkout Flow Optimization",
  "Pricing Page Layout",
  "Homepage Hero Image",
  "Product Page Description",
  "Email Subject Line Test",
  "Cart Abandonment Modal",
  "Navigation Menu Redesign",
  "Free Shipping Threshold",
  "Testimonial Placement",
];

const EXPERIMENT_DESCRIPTIONS: Record<string, string> = {
  "CTA Button Color Test": "Testing green vs. blue CTA buttons to maximize click-through rates",
  "Checkout Flow Optimization": "Comparing single-page vs. multi-step checkout process",
  "Pricing Page Layout": "Testing card-based vs. table-based pricing display",
  "Homepage Hero Image": "Comparing lifestyle imagery vs. product-focused hero images",
  "Product Page Description": "Testing long-form vs. bullet-point product descriptions",
  "Email Subject Line Test": "Comparing urgency-based vs. benefit-focused subject lines",
  "Cart Abandonment Modal": "Testing exit-intent popup timing and messaging",
  "Navigation Menu Redesign": "Comparing mega menu vs. simplified dropdown navigation",
  "Free Shipping Threshold": "Testing $50 vs. $75 free shipping minimum",
  "Testimonial Placement": "Testing above-fold vs. mid-page testimonial sections",
};

const TARGET_PAGES = [
  "/",
  "/checkout",
  "/pricing",
  "/products",
  "/products/:id",
  "/cart",
  "/signup",
  "/landing",
];

const CHANNELS: Channel[] = [
  "email",
  "paid-search",
  "organic-search",
  "social",
  "direct",
  "referral",
  "display",
];

const TAGS = [
  "conversion",
  "revenue",
  "engagement",
  "ux",
  "checkout",
  "landing-page",
  "mobile",
  "desktop",
];

const CREATORS = ["marketing_team", "product_team", "growth_team", "design_team"];

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

/**
 * Generate variants for an experiment (typically Control A and Treatment B).
 */
function generateVariants(): Variant[] {
  return [
    {
      id: generateId("var"),
      name: "Control",
      description: "Original version (baseline)",
      isControl: true,
      trafficAllocation: 50,
    },
    {
      id: generateId("var"),
      name: "Treatment",
      description: "New variant being tested",
      isControl: false,
      trafficAllocation: 50,
    },
  ];
}

/**
 * Generate metrics for a variant.
 */
function generateVariantMetrics(
  variantId: string,
  isControl: boolean,
  hasLift: boolean
): VariantMetrics {
  const baseVisitors = randomInRange(5000, 15000);
  const baseConversionRate = randomFloat(0.02, 0.08);

  // Treatment variant may have lift
  const liftMultiplier = !isControl && hasLift ? randomFloat(1.05, 1.25) : 1;
  const conversionRate = baseConversionRate * liftMultiplier;
  const visitors = baseVisitors + randomInRange(-500, 500);
  const conversions = Math.round(visitors * conversionRate);
  const avgOrderValue = randomFloat(75, 200);
  const revenue = conversions * avgOrderValue;

  return {
    variantId,
    visitors,
    conversions,
    conversionRate: Number(conversionRate.toFixed(4)),
    revenue: Number(revenue.toFixed(2)),
    revenuePerVisitor: Number((revenue / visitors).toFixed(2)),
    averageOrderValue: avgOrderValue,
    bounceRate: randomFloat(30, 60),
    avgSessionDuration: randomInRange(90, 300),
  };
}

/**
 * Generate statistical significance data.
 */
function generateStatisticalSignificance(
  controlRate: number,
  treatmentRate: number,
  sampleSize: number,
  isSignificant: boolean
): StatisticalSignificance {
  const diff = treatmentRate - controlRate;
  const pooledRate = (controlRate + treatmentRate) / 2;
  const standardError = Math.sqrt((pooledRate * (1 - pooledRate) * 2) / sampleSize);
  const zScore = standardError > 0 ? diff / standardError : 0;
  const pValue = isSignificant ? randomFloat(0.001, 0.04) : randomFloat(0.06, 0.5);

  return {
    isSignificant,
    pValue: Number(pValue.toFixed(4)),
    confidenceLevel: 95 as ConfidenceLevel,
    standardError: Number(standardError.toFixed(6)),
    confidenceIntervalLow: Number((diff - 1.96 * standardError).toFixed(4)),
    confidenceIntervalHigh: Number((diff + 1.96 * standardError).toFixed(4)),
    minimumDetectableEffect: randomFloat(0.005, 0.02),
    requiredSampleSize: randomInRange(8000, 20000),
    currentSampleSize: sampleSize,
    estimatedDaysToSignificance: isSignificant ? null : randomInRange(5, 21),
  };
}

/**
 * Generate variant comparison data.
 */
function generateVariantComparison(
  controlMetrics: VariantMetrics,
  treatmentMetrics: VariantMetrics,
  isSignificant: boolean
): VariantComparison {
  const absoluteLift = treatmentMetrics.conversionRate - controlMetrics.conversionRate;
  const relativeLift = controlMetrics.conversionRate > 0
    ? (absoluteLift / controlMetrics.conversionRate) * 100
    : 0;
  const revenueLift = treatmentMetrics.revenue - controlMetrics.revenue;
  const revenueLiftPercent = controlMetrics.revenue > 0
    ? (revenueLift / controlMetrics.revenue) * 100
    : 0;
  const totalSampleSize = controlMetrics.visitors + treatmentMetrics.visitors;

  return {
    controlId: controlMetrics.variantId,
    treatmentId: treatmentMetrics.variantId,
    absoluteLift: Number(absoluteLift.toFixed(4)),
    relativeLift: Number(relativeLift.toFixed(2)),
    revenueLift: Number(revenueLift.toFixed(2)),
    revenueLiftPercent: Number(revenueLiftPercent.toFixed(2)),
    conversionSignificance: generateStatisticalSignificance(
      controlMetrics.conversionRate,
      treatmentMetrics.conversionRate,
      totalSampleSize,
      isSignificant
    ),
    revenueSignificance: generateStatisticalSignificance(
      controlMetrics.revenuePerVisitor,
      treatmentMetrics.revenuePerVisitor,
      totalSampleSize,
      isSignificant && revenueLift > 0
    ),
    probabilityToBeBest: isSignificant ? randomFloat(0.92, 0.99) : randomFloat(0.45, 0.75),
    expectedLoss: isSignificant ? randomFloat(10, 100) : randomFloat(200, 1000),
  };
}

/**
 * Generate trend data points for an experiment.
 */
function generateTrendData(
  variants: Variant[],
  variantMetrics: VariantMetrics[],
  daysRunning: number
): ExperimentTrendPoint[] {
  const points: ExperimentTrendPoint[] = [];

  for (let day = 0; day < Math.min(daysRunning, 30); day++) {
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]!;
      const metrics = variantMetrics[i]!;

      // Cumulative metrics grow over time
      const progress = (day + 1) / daysRunning;
      const noise = randomFloat(0.9, 1.1);

      points.push({
        date: daysAgo(daysRunning - day - 1),
        variantId: variant.id,
        conversionRate: Number((metrics.conversionRate * noise).toFixed(4)),
        visitors: Math.round(metrics.visitors * progress),
        conversions: Math.round(metrics.conversions * progress),
      });
    }
  }

  return points;
}

/**
 * Generate a complete experiment.
 */
function generateExperiment(index: number): Experiment {
  const name = EXPERIMENT_NAMES[index % EXPERIMENT_NAMES.length]!;
  const status: ExperimentStatus = randomPick(["running", "completed", "paused", "draft"]) ?? "running";
  const isSignificant = status === "completed" && Math.random() > 0.3;
  const hasLift = status === "completed" ? isSignificant : Math.random() > 0.5;

  const daysRunning = status === "draft" ? 0 : randomInRange(7, 45);
  const variants = generateVariants();

  const variantMetrics = variants.map((v) =>
    generateVariantMetrics(v.id, v.isControl, hasLift)
  );

  const controlMetrics = variantMetrics.find((m) =>
    variants.find((v) => v.id === m.variantId)?.isControl
  )!;
  const treatmentMetrics = variantMetrics.find((m) =>
    !variants.find((v) => v.id === m.variantId)?.isControl
  )!;

  const selectedChannels = CHANNELS.slice(0, randomInRange(1, 4));
  const selectedTags = TAGS.slice(0, randomInRange(2, 4));

  return {
    id: generateId("exp"),
    name,
    description: EXPERIMENT_DESCRIPTIONS[name] ?? `Testing hypothesis for ${name}`,
    status,
    metricType: randomPick(["conversion", "revenue", "engagement"]) as ABTestMetricType ?? "conversion",
    targetPage: randomPick(TARGET_PAGES) ?? "/",
    channels: selectedChannels,
    startedAt: daysAgoISO(daysRunning),
    endedAt: status === "completed" ? daysAgoISO(randomInRange(1, 5)) : undefined,
    variants,
    variantMetrics,
    comparison: generateVariantComparison(controlMetrics, treatmentMetrics, isSignificant),
    trend: status === "draft" ? [] : generateTrendData(variants, variantMetrics, daysRunning),
    createdBy: randomPick(CREATORS) ?? "product_team",
    tags: selectedTags,
  };
}

/**
 * Generate summary statistics for all experiments.
 */
function generateSummary(experiments: Experiment[]): ABTestSummary {
  const running = experiments.filter((e) => e.status === "running").length;
  const completed = experiments.filter((e) => e.status === "completed").length;
  const successful = experiments.filter(
    (e) => e.status === "completed" && e.comparison.conversionSignificance.isSignificant
  );

  const avgLift = successful.length > 0
    ? successful.reduce((sum, e) => sum + e.comparison.relativeLift, 0) / successful.length
    : 0;

  const totalRevenueImpact = successful.reduce((sum, e) => sum + e.comparison.revenueLift, 0);
  const totalAdditionalConversions = successful.reduce(
    (sum, e) => {
      const treatmentMetrics = e.variantMetrics.find(
        (m) => m.variantId === e.comparison.treatmentId
      );
      const controlMetrics = e.variantMetrics.find(
        (m) => m.variantId === e.comparison.controlId
      );
      return sum + ((treatmentMetrics?.conversions ?? 0) - (controlMetrics?.conversions ?? 0));
    },
    0
  );

  const completedWithSignificance = experiments.filter(
    (e) => e.status === "completed" && e.comparison.conversionSignificance.currentSampleSize > 0
  );
  const avgTimeToSignificance = completedWithSignificance.length > 0
    ? completedWithSignificance.reduce((sum, e) => {
        const startDate = new Date(e.startedAt);
        const endDate = e.endedAt ? new Date(e.endedAt) : new Date();
        return sum + Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / completedWithSignificance.length
    : 0;

  const topExperiment = successful.length > 0
    ? successful.reduce((max, e) => e.comparison.relativeLift > max.comparison.relativeLift ? e : max)
    : experiments[0];

  return {
    totalExperiments: experiments.length,
    runningExperiments: running,
    completedExperiments: completed,
    successfulExperiments: successful.length,
    averageWinningLift: Number(avgLift.toFixed(2)),
    totalRevenueImpact: Number(totalRevenueImpact.toFixed(2)),
    totalAdditionalConversions: Math.max(0, totalAdditionalConversions),
    avgTimeToSignificance: Number(avgTimeToSignificance.toFixed(1)),
    topPerformingExperiment: topExperiment?.name ?? "N/A",
  };
}

/**
 * Generate complete mock A/B test data.
 */
function getMockABTestData(): ABTestData {
  // Generate 8 sample experiments
  const experiments: Experiment[] = [];
  for (let i = 0; i < 8; i++) {
    experiments.push(generateExperiment(i));
  }

  const summary = generateSummary(experiments);

  return {
    experiments,
    summary,
    timeRange: {
      start: daysAgo(30),
      end: daysAgo(0),
    },
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
interface ABTestMockDataCache {
  __abtestMockDataCache?: ABTestData;
}

const globalCache = globalThis as unknown as ABTestMockDataCache;

/**
 * Get cached A/B test mock data. Returns cached version with fresh timestamp.
 * Uses globalThis for hot reload resilience.
 */
export function getCachedABTestMockData(): ABTestData {
  if (!globalCache.__abtestMockDataCache) {
    globalCache.__abtestMockDataCache = getMockABTestData();
  }
  // Return with fresh timestamp
  return {
    ...globalCache.__abtestMockDataCache,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get individual mock data generators for testing purposes.
 */
export const abtestMockGenerators = {
  generateExperiment,
  generateVariants,
  generateVariantMetrics,
  generateVariantComparison,
  generateSummary,
};
