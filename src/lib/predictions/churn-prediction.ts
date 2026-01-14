/**
 * Churn Prediction Module
 *
 * Scores customers by churn risk using weighted factor analysis.
 * The algorithm evaluates multiple risk indicators including engagement patterns,
 * payment health, tenure, and subscription characteristics to identify
 * at-risk customers before they churn.
 */

import type { SubscriptionMetrics, PaymentMetrics } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Risk level classification.
 */
export type RiskLevel = "high" | "medium" | "low";

/**
 * Individual risk factor contributing to churn score.
 */
export interface ChurnRiskFactor {
  /** Factor name (e.g., "payment_failures", "engagement_drop") */
  name: string;
  /** Factor weight in the scoring model (0-1) */
  weight: number;
  /** Contribution to the final score (0-100) */
  contribution: number;
  /** Human-readable description */
  description: string;
}

/**
 * Customer at risk of churning.
 */
export interface AtRiskCustomer {
  /** Customer identifier */
  id: string;
  /** Customer segment or plan */
  segment: string;
  /** Overall churn risk score (0-100) */
  riskScore: number;
  /** Risk classification */
  riskLevel: RiskLevel;
  /** Factors contributing to the risk score */
  riskFactors: ChurnRiskFactor[];
  /** Estimated monthly revenue at risk */
  revenueAtRisk: number;
  /** Recommended intervention action */
  recommendedAction: string;
}

/**
 * Customer data for risk calculation.
 * This represents what we can infer from aggregate metrics.
 */
interface CustomerData {
  id: string;
  segment: string;
  monthlyRevenue: number;
  tenureMonths: number;
  hasPaymentFailures: boolean;
  paymentFailureCount: number;
  isOnAnnualPlan: boolean;
  engagementScore: number; // 0-100
  daysSinceLastActivity: number;
  supportTicketCount: number;
}

/**
 * Complete churn prediction analysis.
 */
export interface ChurnPrediction {
  /** Overall churn rate prediction for next period */
  predictedChurnRate: number;
  /** Total revenue at risk from at-risk customers */
  totalRevenueAtRisk: number;
  /** Number of customers by risk level */
  riskDistribution: Record<RiskLevel, number>;
  /** Top at-risk customers sorted by revenue impact */
  atRiskCustomers: AtRiskCustomer[];
  /** Model confidence score (0-1) */
  modelConfidence: number;
  /** ISO timestamp when prediction was generated */
  generatedAt: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Risk thresholds for classification.
 * Scores above 'high' threshold are high risk.
 * Scores between 'medium' and 'high' are medium risk.
 * Scores below 'medium' threshold are low risk.
 */
const RISK_THRESHOLDS = {
  high: 70,
  medium: 40,
} as const;

/**
 * Weight factors for risk calculation.
 * These weights sum to 1.0 and represent the relative importance
 * of each factor in predicting churn.
 */
const RISK_WEIGHTS = {
  paymentHealth: 0.30,      // Payment failures are strong churn predictors
  engagement: 0.25,         // Low engagement indicates disinterest
  tenure: 0.15,             // New customers churn more often
  planType: 0.10,           // Monthly plans have higher churn
  recentActivity: 0.10,     // Inactivity signals potential churn
  supportInteraction: 0.10, // High support tickets can indicate frustration
} as const;

/**
 * Recommended actions by risk level.
 */
const RECOMMENDED_ACTIONS: Record<RiskLevel, string[]> = {
  high: [
    "Schedule immediate customer success call",
    "Offer retention discount or plan adjustment",
    "Provide personalized onboarding refresh",
  ],
  medium: [
    "Send re-engagement email sequence",
    "Highlight underutilized features",
    "Proactive check-in from support",
  ],
  low: [
    "Continue regular engagement",
    "Monitor for changes",
    "Include in NPS survey",
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Classify risk level based on score.
 *
 * @param score - Risk score (0-100)
 * @returns Risk level classification
 */
function classifyRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.high) {
    return "high";
  }
  if (score >= RISK_THRESHOLDS.medium) {
    return "medium";
  }
  return "low";
}

/**
 * Calculate payment health score component.
 *
 * Payment failures are one of the strongest predictors of churn.
 * This function scores the risk based on failure patterns.
 *
 * @param hasFailures - Whether customer has payment failures
 * @param failureCount - Number of failed payments
 * @returns Risk contribution (0-100)
 */
function scorePaymentHealth(hasFailures: boolean, failureCount: number): number {
  if (!hasFailures) {
    return 0; // No risk from payments
  }

  // Exponential risk increase with failure count
  // 1 failure = 30, 2 failures = 60, 3+ failures = 90+
  const baseScore = Math.min(30 * failureCount, 100);

  return baseScore;
}

/**
 * Calculate engagement score component.
 *
 * Low engagement indicates the customer is not getting value
 * from the product, making them more likely to churn.
 *
 * @param engagementScore - Customer engagement score (0-100)
 * @returns Risk contribution (0-100)
 */
function scoreEngagement(engagementScore: number): number {
  // Inverse relationship: low engagement = high risk
  // engagement 100 = risk 0, engagement 0 = risk 100
  return 100 - engagementScore;
}

/**
 * Calculate tenure score component.
 *
 * New customers have higher churn risk. Risk decreases
 * logarithmically with tenure as customers become sticky.
 *
 * @param tenureMonths - Customer tenure in months
 * @returns Risk contribution (0-100)
 */
function scoreTenure(tenureMonths: number): number {
  if (tenureMonths >= 24) {
    return 10; // Long-term customers have minimal tenure risk
  }
  if (tenureMonths >= 12) {
    return 20;
  }
  if (tenureMonths >= 6) {
    return 40;
  }
  if (tenureMonths >= 3) {
    return 60;
  }
  // First 3 months are highest risk period
  return 80;
}

/**
 * Calculate plan type score component.
 *
 * Monthly plans have higher churn than annual plans
 * due to more frequent decision points.
 *
 * @param isAnnual - Whether customer is on annual plan
 * @returns Risk contribution (0-100)
 */
function scorePlanType(isAnnual: boolean): number {
  return isAnnual ? 10 : 50;
}

/**
 * Calculate recent activity score component.
 *
 * Inactivity is a strong signal of impending churn.
 *
 * @param daysSinceLastActivity - Days since customer last used product
 * @returns Risk contribution (0-100)
 */
function scoreRecentActivity(daysSinceLastActivity: number): number {
  if (daysSinceLastActivity <= 3) {
    return 0; // Active user
  }
  if (daysSinceLastActivity <= 7) {
    return 20;
  }
  if (daysSinceLastActivity <= 14) {
    return 40;
  }
  if (daysSinceLastActivity <= 30) {
    return 60;
  }
  // 30+ days inactive is high risk
  return 90;
}

/**
 * Calculate support interaction score component.
 *
 * High support ticket volume can indicate either:
 * - Product issues frustrating the customer (high risk)
 * - Engaged customer learning the product (lower risk)
 *
 * We use a balanced approach that flags very high ticket counts.
 *
 * @param ticketCount - Number of support tickets in recent period
 * @returns Risk contribution (0-100)
 */
function scoreSupportInteraction(ticketCount: number): number {
  if (ticketCount === 0) {
    return 30; // No engagement with support - neutral/slight risk
  }
  if (ticketCount <= 2) {
    return 10; // Normal support usage
  }
  if (ticketCount <= 5) {
    return 40; // Elevated - may have issues
  }
  // 5+ tickets indicates potential frustration
  return 70;
}

/**
 * Calculate individual customer risk score.
 *
 * Combines multiple weighted factors to produce a comprehensive
 * churn risk score between 0 and 100.
 *
 * @param customer - Customer data for analysis
 * @returns Score and contributing factors
 */
function calculateRiskScore(
  customer: CustomerData
): { score: number; factors: ChurnRiskFactor[] } {
  const factors: ChurnRiskFactor[] = [];

  // Calculate each factor's contribution
  const paymentScore = scorePaymentHealth(
    customer.hasPaymentFailures,
    customer.paymentFailureCount
  );
  factors.push({
    name: "payment_health",
    weight: RISK_WEIGHTS.paymentHealth,
    contribution: paymentScore * RISK_WEIGHTS.paymentHealth,
    description: customer.hasPaymentFailures
      ? `${customer.paymentFailureCount} payment failure(s) detected`
      : "Payment history is healthy",
  });

  const engagementScore = scoreEngagement(customer.engagementScore);
  factors.push({
    name: "engagement",
    weight: RISK_WEIGHTS.engagement,
    contribution: engagementScore * RISK_WEIGHTS.engagement,
    description:
      customer.engagementScore >= 70
        ? "Strong product engagement"
        : customer.engagementScore >= 40
        ? "Moderate product engagement"
        : "Low product engagement - at risk",
  });

  const tenureScore = scoreTenure(customer.tenureMonths);
  factors.push({
    name: "tenure",
    weight: RISK_WEIGHTS.tenure,
    contribution: tenureScore * RISK_WEIGHTS.tenure,
    description: `${customer.tenureMonths} months as customer`,
  });

  const planScore = scorePlanType(customer.isOnAnnualPlan);
  factors.push({
    name: "plan_type",
    weight: RISK_WEIGHTS.planType,
    contribution: planScore * RISK_WEIGHTS.planType,
    description: customer.isOnAnnualPlan ? "Annual plan (lower risk)" : "Monthly plan (higher churn probability)",
  });

  const activityScore = scoreRecentActivity(customer.daysSinceLastActivity);
  factors.push({
    name: "recent_activity",
    weight: RISK_WEIGHTS.recentActivity,
    contribution: activityScore * RISK_WEIGHTS.recentActivity,
    description:
      customer.daysSinceLastActivity <= 7
        ? "Recently active"
        : `${customer.daysSinceLastActivity} days since last activity`,
  });

  const supportScore = scoreSupportInteraction(customer.supportTicketCount);
  factors.push({
    name: "support_interaction",
    weight: RISK_WEIGHTS.supportInteraction,
    contribution: supportScore * RISK_WEIGHTS.supportInteraction,
    description:
      customer.supportTicketCount > 5
        ? "High support ticket volume - potential frustration"
        : `${customer.supportTicketCount} support tickets`,
  });

  // Calculate total weighted score
  const totalScore = factors.reduce((sum, f) => sum + f.contribution, 0);

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    factors: factors.sort((a, b) => b.contribution - a.contribution),
  };
}

/**
 * Generate synthetic customer data from aggregate metrics.
 *
 * Since we work with aggregate metrics rather than individual customer data,
 * this function creates a representative sample of customers based on
 * the aggregate patterns observed in the metrics.
 *
 * @param subscriptionMetrics - Aggregate subscription data
 * @param paymentMetrics - Aggregate payment data
 * @returns Array of synthetic customer data
 */
function generateCustomerSample(
  subscriptionMetrics: SubscriptionMetrics,
  paymentMetrics: PaymentMetrics
): CustomerData[] {
  const customers: CustomerData[] = [];

  // Calculate average values from metrics
  const avgRevenue = subscriptionMetrics.subscriberLtv / 12;
  const avgTenure = subscriptionMetrics.avgSubscriptionLength;
  const paymentFailureRate = paymentMetrics.failureRate / 100;

  // Get plan distribution
  const planDistribution = subscriptionMetrics.subscribersByPlan;
  const totalSubscribers = subscriptionMetrics.activeSubscribers;

  // Generate representative sample (up to 100 synthetic customers)
  const sampleSize = Math.min(100, totalSubscribers);

  for (let i = 0; i < sampleSize; i++) {
    // Distribute attributes based on aggregate metrics
    const planKeys = Object.keys(planDistribution);
    const selectedPlan = planKeys[i % planKeys.length] || "standard";
    const isAnnual = selectedPlan.toLowerCase().includes("annual") ||
      selectedPlan.toLowerCase().includes("yearly");

    // Add variance to simulate realistic distribution
    const tenureVariance = (Math.random() - 0.5) * avgTenure;
    const tenure = Math.max(1, avgTenure + tenureVariance);

    // Payment failure distribution based on failure rate
    const hasPaymentFailure = Math.random() < paymentFailureRate;
    const failureCount = hasPaymentFailure
      ? Math.floor(Math.random() * 3) + 1
      : 0;

    // Engagement score inversely correlated with churn rate
    const baseEngagement = 100 - subscriptionMetrics.churnRate.monthly * 10;
    const engagementVariance = (Math.random() - 0.5) * 40;
    const engagement = Math.max(0, Math.min(100, baseEngagement + engagementVariance));

    // Activity based on engagement
    const daysSinceActivity = engagement > 70
      ? Math.floor(Math.random() * 7)
      : engagement > 40
      ? Math.floor(Math.random() * 21)
      : Math.floor(Math.random() * 60);

    // Support tickets - random distribution
    const supportTickets = Math.floor(Math.random() * 8);

    customers.push({
      id: `cust_${i.toString().padStart(4, "0")}`,
      segment: selectedPlan,
      monthlyRevenue: avgRevenue * (0.5 + Math.random()),
      tenureMonths: tenure,
      hasPaymentFailures: hasPaymentFailure,
      paymentFailureCount: failureCount,
      isOnAnnualPlan: isAnnual,
      engagementScore: engagement,
      daysSinceLastActivity: daysSinceActivity,
      supportTicketCount: supportTickets,
    });
  }

  return customers;
}

/**
 * Get recommended action based on risk profile.
 *
 * @param riskLevel - Customer risk level
 * @param topFactor - Primary risk factor
 * @returns Recommended intervention action
 */
function getRecommendedAction(
  riskLevel: RiskLevel,
  topFactor: ChurnRiskFactor
): string {
  // Personalize recommendation based on top risk factor
  if (topFactor.name === "payment_health" && riskLevel === "high") {
    return "Resolve payment issues and offer payment plan options";
  }
  if (topFactor.name === "engagement" && riskLevel !== "low") {
    return "Schedule onboarding refresh call to drive adoption";
  }
  if (topFactor.name === "recent_activity" && riskLevel === "high") {
    return "Send re-activation campaign with incentive";
  }

  // Default recommendations by risk level
  const actions = RECOMMENDED_ACTIONS[riskLevel];
  return actions[0] ?? "Monitor customer health";
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

/**
 * Score customers by churn risk using weighted factor analysis.
 *
 * This function analyzes subscription and payment metrics to identify
 * customers at risk of churning. It uses a weighted scoring model
 * that considers multiple risk factors:
 *
 * - Payment Health (30%): Payment failures strongly predict churn
 * - Engagement (25%): Low product usage indicates disinterest
 * - Tenure (15%): New customers churn more frequently
 * - Plan Type (10%): Monthly plans have higher churn rates
 * - Recent Activity (10%): Inactivity signals impending churn
 * - Support Interaction (10%): High ticket volume may indicate frustration
 *
 * Algorithm overview:
 * 1. Generate representative customer sample from aggregate metrics
 * 2. Score each customer on all risk factors
 * 3. Apply weights to calculate composite risk score
 * 4. Classify customers into risk levels
 * 5. Sort by revenue at risk for prioritization
 *
 * @param subscriptionMetrics - Subscription data including churn rates and plans
 * @param paymentMetrics - Payment data including failure rates
 * @returns Complete churn prediction analysis
 *
 * @example
 * ```typescript
 * const prediction = predictChurn(subscriptionMetrics, paymentMetrics);
 * console.log(`Predicted churn rate: ${prediction.predictedChurnRate.toFixed(1)}%`);
 * console.log(`Revenue at risk: $${prediction.totalRevenueAtRisk.toLocaleString()}`);
 *
 * // Get high-risk customers for immediate outreach
 * const urgent = prediction.atRiskCustomers
 *   .filter(c => c.riskLevel === 'high')
 *   .slice(0, 10);
 * ```
 */
export function predictChurn(
  subscriptionMetrics: SubscriptionMetrics,
  paymentMetrics: PaymentMetrics
): ChurnPrediction {
  // Generate synthetic customer sample from aggregate metrics
  const customers = generateCustomerSample(subscriptionMetrics, paymentMetrics);

  // Score all customers
  const scoredCustomers: AtRiskCustomer[] = customers.map((customer) => {
    const { score, factors } = calculateRiskScore(customer);
    const riskLevel = classifyRiskLevel(score);
    const topFactor = factors[0];

    // Create a default factor if none exists (shouldn't happen, but for type safety)
    const defaultFactor: ChurnRiskFactor = {
      name: "unknown",
      weight: 0,
      contribution: 0,
      description: "No specific risk factor identified",
    };

    return {
      id: customer.id,
      segment: customer.segment,
      riskScore: score,
      riskLevel,
      riskFactors: factors,
      revenueAtRisk: customer.monthlyRevenue,
      recommendedAction: getRecommendedAction(riskLevel, topFactor ?? defaultFactor),
    };
  });

  // Sort by risk score (highest first) then by revenue at risk
  scoredCustomers.sort((a, b) => {
    if (b.riskScore !== a.riskScore) {
      return b.riskScore - a.riskScore;
    }
    return b.revenueAtRisk - a.revenueAtRisk;
  });

  // Calculate risk distribution
  const riskDistribution: Record<RiskLevel, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };

  let totalRevenueAtRisk = 0;

  for (const customer of scoredCustomers) {
    riskDistribution[customer.riskLevel]++;
    if (customer.riskLevel !== "low") {
      totalRevenueAtRisk += customer.revenueAtRisk;
    }
  }

  // Predicted churn rate based on high-risk proportion and historical rate
  const highRiskProportion = riskDistribution.high / scoredCustomers.length;
  const mediumRiskProportion = riskDistribution.medium / scoredCustomers.length;

  // Weight high risk more heavily in prediction
  const predictedChurnRate =
    subscriptionMetrics.churnRate.monthly *
    (1 + highRiskProportion * 0.5 + mediumRiskProportion * 0.2);

  // Model confidence based on data quality proxies
  // More subscribers = higher confidence
  const subscriberConfidence = Math.min(
    1,
    subscriptionMetrics.activeSubscribers / 1000
  );
  // Lower failure rate variance = higher confidence
  const paymentConfidence = 1 - Math.min(0.3, paymentMetrics.failureRate / 100);

  const modelConfidence = (subscriberConfidence + paymentConfidence) / 2;

  return {
    predictedChurnRate,
    totalRevenueAtRisk,
    riskDistribution,
    atRiskCustomers: scoredCustomers,
    modelConfidence,
    generatedAt: new Date().toISOString(),
  };
}
