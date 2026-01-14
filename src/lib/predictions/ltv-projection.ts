/**
 * LTV Projection Module
 *
 * Projects Customer Lifetime Value using historical cohort data and churn rates.
 * The algorithm applies survival curve analysis to estimate how long customers
 * will remain active and their expected total revenue contribution.
 */

import type {
  UnitEconomicsMetrics,
  SubscriptionMetrics,
  CohortWithMonths,
} from "@/types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Single point in LTV projection curve.
 */
export interface LTVProjectionPoint {
  /** Month number (1, 2, 3, ...) */
  month: number;
  /** Projected cumulative LTV at this month */
  projectedLTV: number;
  /** Survival rate (% of customers still active) */
  survivalRate: number;
  /** Revenue contribution this month */
  monthlyContribution: number;
}

/**
 * LTV by customer segment.
 */
export interface LTVSegment {
  /** Segment identifier (e.g., "Enterprise", "Pro", "Starter") */
  segment: string;
  /** Customer count in segment */
  customerCount: number;
  /** Average LTV for segment */
  avgLTV: number;
  /** LTV to CAC ratio for segment */
  ltvCacRatio: number;
  /** Payback period in months */
  paybackMonths: number;
  /** Average retention rate */
  retentionRate: number;
}

/**
 * Complete LTV projection analysis.
 */
export interface LTVProjection {
  /** Current calculated LTV */
  currentLTV: number;
  /** Projected LTV at 12 months */
  projectedLTV12M: number;
  /** Projected LTV at 24 months */
  projectedLTV24M: number;
  /** Projected LTV at 36 months (theoretical maximum) */
  projectedLTV36M: number;
  /** Month-by-month projection curve */
  projectionCurve: LTVProjectionPoint[];
  /** LTV breakdown by segment */
  segmentBreakdown: LTVSegment[];
  /** Average customer lifespan in months */
  avgCustomerLifespan: number;
  /** Break-even month (when LTV > CAC) */
  breakEvenMonth: number;
  /** Current LTV/CAC ratio */
  ltvCacRatio: number;
  /** Theoretical maximum LTV (infinite retention) */
  theoreticalMaxLTV: number;
  /** ISO timestamp when projection was generated */
  generatedAt: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Maximum months to project (3 years) */
const MAX_PROJECTION_MONTHS = 36;

/** Minimum survival rate to continue projecting */
const MIN_SURVIVAL_RATE = 0.01;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate survival rate at month N using exponential decay.
 *
 * The survival function models customer retention as exponential decay:
 * S(t) = e^(-lambda * t)
 *
 * Where lambda is the hazard rate (approximately equal to monthly churn rate
 * for small churn rates).
 *
 * @param monthlyChurnRate - Monthly churn rate as decimal (e.g., 0.05 for 5%)
 * @param month - Month number (1-indexed)
 * @returns Survival rate as decimal (0-1)
 */
function calculateSurvivalRate(monthlyChurnRate: number, month: number): number {
  // Convert churn rate to hazard rate
  // For small churn rates, hazard ~= churn
  // For larger rates, use: lambda = -ln(1 - churnRate)
  const hazardRate = monthlyChurnRate < 0.2
    ? monthlyChurnRate
    : -Math.log(1 - Math.min(monthlyChurnRate, 0.99));

  // Exponential survival function
  const survivalRate = Math.exp(-hazardRate * month);

  return Math.max(MIN_SURVIVAL_RATE, survivalRate);
}

/**
 * Calculate projected LTV at month N using survival curve.
 *
 * LTV is the sum of expected revenue at each month, weighted by
 * the probability that the customer is still active (survival rate).
 *
 * LTV(N) = sum(ARPU * S(t)) for t = 1 to N
 *
 * @param arpu - Average Revenue Per User per month
 * @param monthlyChurnRate - Monthly churn rate as decimal
 * @param month - Target month for LTV calculation
 * @returns Projected cumulative LTV
 */
function calculateProjectedLTV(
  arpu: number,
  monthlyChurnRate: number,
  month: number
): number {
  let cumulativeLTV = 0;

  for (let t = 1; t <= month; t++) {
    const survivalRate = calculateSurvivalRate(monthlyChurnRate, t);
    const monthlyContribution = arpu * survivalRate;
    cumulativeLTV += monthlyContribution;
  }

  return cumulativeLTV;
}

/**
 * Calculate theoretical maximum LTV (infinite time horizon).
 *
 * When churn rate is constant, the maximum LTV converges to:
 * LTV_max = ARPU / churnRate
 *
 * This represents the expected value if we sum all future months
 * with exponentially decaying survival probability.
 *
 * @param arpu - Average Revenue Per User per month
 * @param monthlyChurnRate - Monthly churn rate as decimal
 * @returns Theoretical maximum LTV
 */
function calculateTheoreticalMaxLTV(
  arpu: number,
  monthlyChurnRate: number
): number {
  if (monthlyChurnRate <= 0) {
    // No churn = infinite LTV (cap at reasonable amount)
    return arpu * 120; // 10 years
  }

  return arpu / monthlyChurnRate;
}

/**
 * Calculate average customer lifespan from churn rate.
 *
 * Expected lifespan = 1 / churnRate (in months)
 *
 * @param monthlyChurnRate - Monthly churn rate as decimal
 * @returns Average lifespan in months
 */
function calculateAvgLifespan(monthlyChurnRate: number): number {
  if (monthlyChurnRate <= 0) {
    return 120; // Cap at 10 years
  }

  return 1 / monthlyChurnRate;
}

/**
 * Find break-even month where LTV exceeds CAC.
 *
 * @param arpu - Average Revenue Per User per month
 * @param cac - Customer Acquisition Cost
 * @param monthlyChurnRate - Monthly churn rate as decimal
 * @returns Month number when LTV > CAC, or -1 if never
 */
function findBreakEvenMonth(
  arpu: number,
  cac: number,
  monthlyChurnRate: number
): number {
  let cumulativeLTV = 0;

  for (let month = 1; month <= MAX_PROJECTION_MONTHS; month++) {
    const survivalRate = calculateSurvivalRate(monthlyChurnRate, month);
    cumulativeLTV += arpu * survivalRate;

    if (cumulativeLTV >= cac) {
      return month;
    }
  }

  // Check if theoretical max exceeds CAC
  const maxLTV = calculateTheoreticalMaxLTV(arpu, monthlyChurnRate);
  if (maxLTV >= cac) {
    // Will eventually break even, but after 36 months
    return Math.ceil(cac / arpu);
  }

  return -1; // Never breaks even
}

/**
 * Calculate LTV by segment using cohort data.
 *
 * Analyzes cohort retention curves to derive segment-specific LTV.
 * Each cohort's retention pattern informs the segment's expected LTV.
 *
 * @param cohortData - Array of cohorts with monthly retention data
 * @param unitEconomicsMetrics - Metrics containing CAC by channel
 * @param arpu - Average Revenue Per User
 * @returns Array of LTV segments
 */
function calculateSegmentLTV(
  cohortData: CohortWithMonths[],
  unitEconomicsMetrics: UnitEconomicsMetrics,
  arpu: number
): LTVSegment[] {
  const segments: LTVSegment[] = [];

  // If no cohort data, create segments based on plan distribution
  if (!cohortData || cohortData.length === 0) {
    // Create default segments based on typical SaaS distribution
    const defaultSegments = [
      { name: "Enterprise", share: 0.1, retentionMultiplier: 1.3 },
      { name: "Professional", share: 0.3, retentionMultiplier: 1.1 },
      { name: "Starter", share: 0.6, retentionMultiplier: 0.9 },
    ];

    const totalCustomers = 100; // Placeholder
    const baseLTV = unitEconomicsMetrics.ltv;
    const baseCac = unitEconomicsMetrics.cac;

    for (const seg of defaultSegments) {
      const segmentLTV = baseLTV * seg.retentionMultiplier;
      const segmentCac = baseCac * (seg.name === "Enterprise" ? 2 : 1);

      segments.push({
        segment: seg.name,
        customerCount: Math.round(totalCustomers * seg.share),
        avgLTV: segmentLTV,
        ltvCacRatio: segmentLTV / segmentCac,
        paybackMonths: segmentCac / (arpu * seg.retentionMultiplier),
        retentionRate: 0.95 * seg.retentionMultiplier,
      });
    }

    return segments;
  }

  // Process actual cohort data
  // Group cohorts by quarters to create segments
  const recentCohorts = cohortData.slice(-6); // Last 6 cohorts
  const olderCohorts = cohortData.slice(0, -6);

  // Recent cohorts segment
  if (recentCohorts.length > 0) {
    const avgRetention = calculateAverageRetention(recentCohorts);
    const segmentLTV = calculateLTVFromRetention(arpu, avgRetention);

    segments.push({
      segment: "Recent Cohorts (6 months)",
      customerCount: recentCohorts.length * 100, // Estimate
      avgLTV: segmentLTV,
      ltvCacRatio: segmentLTV / unitEconomicsMetrics.cac,
      paybackMonths: unitEconomicsMetrics.cacPaybackPeriod,
      retentionRate: avgRetention,
    });
  }

  // Older cohorts segment
  if (olderCohorts.length > 0) {
    const avgRetention = calculateAverageRetention(olderCohorts);
    const segmentLTV = calculateLTVFromRetention(arpu, avgRetention);

    segments.push({
      segment: "Mature Cohorts (6+ months)",
      customerCount: olderCohorts.length * 100,
      avgLTV: segmentLTV,
      ltvCacRatio: segmentLTV / unitEconomicsMetrics.cac,
      paybackMonths: unitEconomicsMetrics.cacPaybackPeriod * 0.8, // Faster payback
      retentionRate: avgRetention,
    });
  }

  return segments;
}

/**
 * Calculate average retention rate from cohort data.
 *
 * Uses the 3-month retention as a proxy for overall retention health.
 *
 * @param cohorts - Array of cohorts
 * @returns Average retention rate (0-1)
 */
function calculateAverageRetention(cohorts: CohortWithMonths[]): number {
  if (cohorts.length === 0) {
    return 0.9; // Default
  }

  let totalRetention = 0;
  let count = 0;

  for (const cohort of cohorts) {
    // Use month 3 retention if available, otherwise latest available
    const retentionIndex = Math.min(2, cohort.months.length - 1);
    if (retentionIndex >= 0) {
      const retentionValue = cohort.months[retentionIndex];
      if (retentionValue !== undefined) {
        const retention = retentionValue / 100;
        totalRetention += retention;
        count++;
      }
    }
  }

  return count > 0 ? totalRetention / count : 0.9;
}

/**
 * Calculate LTV from retention rate.
 *
 * Derives monthly churn from retention and calculates LTV.
 *
 * @param arpu - Average Revenue Per User
 * @param retentionRate - Average retention rate (0-1)
 * @returns Projected LTV
 */
function calculateLTVFromRetention(arpu: number, retentionRate: number): number {
  const monthlyChurnRate = 1 - retentionRate;
  return calculateProjectedLTV(arpu, monthlyChurnRate, 24);
}

/**
 * Generate full LTV projection curve.
 *
 * Creates month-by-month projections showing cumulative LTV,
 * survival rates, and monthly contributions.
 *
 * @param arpu - Average Revenue Per User
 * @param monthlyChurnRate - Monthly churn rate as decimal
 * @returns Array of projection points
 */
function generateProjectionCurve(
  arpu: number,
  monthlyChurnRate: number
): LTVProjectionPoint[] {
  const curve: LTVProjectionPoint[] = [];
  let cumulativeLTV = 0;

  for (let month = 1; month <= MAX_PROJECTION_MONTHS; month++) {
    const survivalRate = calculateSurvivalRate(monthlyChurnRate, month);

    // Stop if survival rate is negligible
    if (survivalRate < MIN_SURVIVAL_RATE) {
      break;
    }

    const monthlyContribution = arpu * survivalRate;
    cumulativeLTV += monthlyContribution;

    curve.push({
      month,
      projectedLTV: cumulativeLTV,
      survivalRate,
      monthlyContribution,
    });
  }

  return curve;
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

/**
 * Project Customer Lifetime Value using historical cohort data and churn rates.
 *
 * This function creates comprehensive LTV projections by:
 * 1. Analyzing current unit economics (ARPU, CAC, churn)
 * 2. Applying survival curve analysis for future projections
 * 3. Segmenting customers based on cohort behavior
 * 4. Calculating break-even points and payback periods
 *
 * The survival curve model assumes:
 * - Constant hazard rate (churn probability is consistent over time)
 * - Revenue per customer is stable (no expansion/contraction)
 * - Cohorts behave similarly to historical averages
 *
 * These assumptions work well for stable businesses but may underestimate
 * LTV for businesses with strong expansion revenue or improving retention.
 *
 * Algorithm overview:
 * 1. Extract ARPU and churn rate from unit economics
 * 2. Generate month-by-month projection using survival function
 * 3. Calculate key LTV milestones (12M, 24M, 36M)
 * 4. Analyze cohort data for segment-specific projections
 * 5. Determine break-even month and payback metrics
 *
 * @param unitEconomicsMetrics - Unit economics data including ARPU, CAC, LTV
 * @param subscriptionMetrics - Subscription data including churn rates
 * @returns Complete LTV projection analysis
 *
 * @example
 * ```typescript
 * const projection = projectLTV(unitEconomicsMetrics, subscriptionMetrics);
 * console.log(`Current LTV: $${projection.currentLTV.toFixed(2)}`);
 * console.log(`24-month projected LTV: $${projection.projectedLTV24M.toFixed(2)}`);
 * console.log(`Break-even month: ${projection.breakEvenMonth}`);
 *
 * // Segment analysis
 * for (const segment of projection.segmentBreakdown) {
 *   console.log(`${segment.segment}: LTV/CAC = ${segment.ltvCacRatio.toFixed(1)}x`);
 * }
 * ```
 */
export function projectLTV(
  unitEconomicsMetrics: UnitEconomicsMetrics,
  subscriptionMetrics: SubscriptionMetrics
): LTVProjection {
  // Extract key metrics
  const arpu = unitEconomicsMetrics.arpu;
  const cac = unitEconomicsMetrics.cac;
  const currentLTV = unitEconomicsMetrics.ltv;
  const monthlyChurnRate = subscriptionMetrics.churnRate.monthly / 100;

  // Get cohort data for segment analysis
  const ltvByCohort = unitEconomicsMetrics.ltvByCohort || [];
  const retentionByCohort = subscriptionMetrics.retentionByCohort || [];

  // Use whichever cohort data is available
  const cohortData: CohortWithMonths[] =
    ltvByCohort.length > 0 ? ltvByCohort : retentionByCohort;

  // Generate projection curve
  const projectionCurve = generateProjectionCurve(arpu, monthlyChurnRate);

  // Calculate milestone projections
  const projectedLTV12M = calculateProjectedLTV(arpu, monthlyChurnRate, 12);
  const projectedLTV24M = calculateProjectedLTV(arpu, monthlyChurnRate, 24);
  const projectedLTV36M = calculateProjectedLTV(arpu, monthlyChurnRate, 36);

  // Calculate theoretical maximum
  const theoreticalMaxLTV = calculateTheoreticalMaxLTV(arpu, monthlyChurnRate);

  // Calculate segment breakdown
  const segmentBreakdown = calculateSegmentLTV(
    cohortData,
    unitEconomicsMetrics,
    arpu
  );

  // Calculate average lifespan and break-even
  const avgCustomerLifespan = calculateAvgLifespan(monthlyChurnRate);
  const breakEvenMonth = findBreakEvenMonth(arpu, cac, monthlyChurnRate);

  // Current LTV/CAC ratio
  const ltvCacRatio = unitEconomicsMetrics.ltvCacRatio;

  return {
    currentLTV,
    projectedLTV12M,
    projectedLTV24M,
    projectedLTV36M,
    projectionCurve,
    segmentBreakdown,
    avgCustomerLifespan,
    breakEvenMonth,
    ltvCacRatio,
    theoreticalMaxLTV,
    generatedAt: new Date().toISOString(),
  };
}
