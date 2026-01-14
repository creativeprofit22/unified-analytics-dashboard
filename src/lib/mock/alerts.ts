/**
 * Mock Data Generators for Alerts & Monitoring API
 *
 * This module contains mock data for the alerting and monitoring feature,
 * demonstrating all alert states and scenarios for development and testing.
 */

import type {
  Anomaly,
  ThresholdAlert,
  ThresholdRule,
  Goal,
  AlertsData,
  TrendDataPoint,
} from "@/types";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate trend data for the last N days.
 * @param days - Number of days to generate
 * @param baseValue - Base value around which to generate data
 * @param variance - Variance factor (0-1) for randomization
 */
function generateTrend(
  days: number,
  baseValue: number,
  variance: number = 0.1
): TrendDataPoint[] {
  const trend: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0] ?? "";

    // Add some randomness to the value
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variance;
    const value = Math.round(baseValue * randomFactor * 100) / 100;

    trend.push({ date: dateStr, value });
  }

  return trend;
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
 * Generate an ISO date string for N days from now.
 */
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Generate an ISO date string for N days ago.
 */
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0] ?? "";
}

// =============================================================================
// ANOMALY MOCK DATA
// =============================================================================

/**
 * Generate mock anomaly data demonstrating different severity levels and directions.
 */
function getMockAnomalies(): Anomaly[] {
  return [
    {
      id: "anomaly_001",
      metric: "conversionRate",
      metricLabel: "Conversion Rate",
      value: 1.2,
      expectedValue: 3.4,
      deviation: -3.8,
      direction: "drop",
      severity: "critical",
      detectedAt: hoursAgo(2),
      trend: generateTrend(7, 3.4, 0.15).map((point, idx) => ({
        ...point,
        // Last point shows the anomaly
        value: idx === 6 ? 1.2 : point.value,
      })),
    },
    {
      id: "anomaly_002",
      metric: "traffic",
      metricLabel: "Daily Traffic",
      value: 18500,
      expectedValue: 12000,
      deviation: 2.7,
      direction: "spike",
      severity: "warning",
      detectedAt: hoursAgo(6),
      trend: generateTrend(7, 12000, 0.12).map((point, idx) => ({
        ...point,
        // Last point shows the spike
        value: idx === 6 ? 18500 : point.value,
      })),
    },
    {
      id: "anomaly_003",
      metric: "revenue",
      metricLabel: "Daily Revenue",
      value: 8420,
      expectedValue: 4800,
      deviation: 2.2,
      direction: "spike",
      severity: "warning",
      detectedAt: hoursAgo(12),
      trend: generateTrend(7, 4800, 0.18).map((point, idx) => ({
        ...point,
        // Last point shows the spike
        value: idx === 6 ? 8420 : point.value,
      })),
    },
    {
      id: "anomaly_004",
      metric: "churnRate",
      metricLabel: "Churn Rate",
      value: 4.8,
      expectedValue: 3.1,
      deviation: 1.6,
      direction: "spike",
      severity: "info",
      detectedAt: hoursAgo(24),
      trend: generateTrend(7, 3.1, 0.1).map((point, idx) => ({
        ...point,
        // Last point shows the increase
        value: idx === 6 ? 4.8 : point.value,
      })),
    },
  ];
}

// =============================================================================
// THRESHOLD ALERT MOCK DATA
// =============================================================================

/**
 * Generate mock threshold rules.
 */
function getMockThresholdRules(): ThresholdRule[] {
  return [
    {
      id: "rule_001",
      name: "Low Conversion Rate Alert",
      metric: "conversionRate",
      operator: "lt",
      value: 2.0,
      enabled: true,
    },
    {
      id: "rule_002",
      name: "High Churn Rate Warning",
      metric: "churnRate",
      operator: "gt",
      value: 5.0,
      enabled: true,
    },
    {
      id: "rule_003",
      name: "Minimum Daily Revenue",
      metric: "revenue",
      operator: "lt",
      value: 3000,
      enabled: true,
    },
    {
      id: "rule_004",
      name: "MRR Growth Target",
      metric: "mrr",
      operator: "gte",
      value: 150000,
      enabled: true,
    },
    {
      id: "rule_005",
      name: "CAC Efficiency",
      metric: "cac",
      operator: "lte",
      value: 150,
      enabled: false,
    },
  ];
}

/**
 * Generate mock threshold alerts demonstrating different states.
 */
function getMockThresholdAlerts(): ThresholdAlert[] {
  const rules = getMockThresholdRules();

  return [
    {
      id: "alert_001",
      rule: rules[0]!, // Low Conversion Rate Alert
      currentValue: 1.2,
      status: "breached",
      breachedAt: hoursAgo(2),
      message: "Conversion rate has dropped to 1.2%, below the 2.0% threshold. Investigate checkout flow and landing pages.",
    },
    {
      id: "alert_002",
      rule: rules[1]!, // High Churn Rate Warning
      currentValue: 4.8,
      status: "warning",
      message: "Churn rate at 4.8% is approaching the 5.0% threshold. Monitor closely over the next 24 hours.",
    },
    {
      id: "alert_003",
      rule: rules[2]!, // Minimum Daily Revenue
      currentValue: 4750,
      status: "normal",
      message: "Daily revenue at $4,750 is above the $3,000 minimum threshold.",
    },
    {
      id: "alert_004",
      rule: rules[3]!, // MRR Growth Target
      currentValue: 142350,
      status: "breached",
      breachedAt: hoursAgo(48),
      message: "MRR at $142,350 is below the $150,000 target. Focus on expansion and new customer acquisition.",
    },
    {
      id: "alert_005",
      rule: { ...rules[4]!, enabled: true }, // CAC Efficiency (override to enabled for demo)
      currentValue: 127,
      status: "normal",
      message: "Customer acquisition cost at $127 is within the $150 efficiency target.",
    },
  ];
}

// =============================================================================
// GOAL MOCK DATA
// =============================================================================

/**
 * Generate mock goals demonstrating different progress states.
 */
function getMockGoals(): Goal[] {
  return [
    {
      id: "goal_001",
      name: "Q1 Revenue Target",
      metric: "revenue",
      targetValue: 500000,
      currentValue: 428500,
      startDate: daysAgo(45),
      endDate: daysFromNow(45),
      progress: 85.7,
      status: "on_track",
    },
    {
      id: "goal_002",
      name: "Reduce Churn Below 3%",
      metric: "churnRate",
      targetValue: 3.0,
      currentValue: 3.1,
      startDate: daysAgo(60),
      endDate: daysFromNow(30),
      progress: 78,
      status: "at_risk",
    },
    {
      id: "goal_003",
      name: "MRR Milestone: $200K",
      metric: "mrr",
      targetValue: 200000,
      currentValue: 142350,
      startDate: daysAgo(90),
      endDate: daysFromNow(60),
      progress: 71.2,
      status: "behind",
    },
    {
      id: "goal_004",
      name: "Conversion Rate Optimization",
      metric: "conversionRate",
      targetValue: 4.0,
      currentValue: 4.2,
      startDate: daysAgo(30),
      endDate: daysAgo(0),
      progress: 100,
      status: "achieved",
    },
  ];
}

// =============================================================================
// COMBINED ALERTS DATA
// =============================================================================

/**
 * Get complete mock alerts data.
 */
function getMockAlertsData(): AlertsData {
  return {
    anomalies: getMockAnomalies(),
    thresholdAlerts: getMockThresholdAlerts(),
    goals: getMockGoals(),
    lastUpdated: new Date().toISOString(),
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
interface AlertsMockDataCache {
  __alertsMockDataCache?: AlertsData;
}

const globalCache = globalThis as unknown as AlertsMockDataCache;

/**
 * Get cached alerts mock data. Returns cached version with fresh timestamp.
 * Uses globalThis for hot reload resilience.
 */
export function getCachedAlertsMockData(): AlertsData {
  if (!globalCache.__alertsMockDataCache) {
    globalCache.__alertsMockDataCache = getMockAlertsData();
  }
  // Return with fresh timestamp
  return {
    ...globalCache.__alertsMockDataCache,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get individual mock data generators for testing purposes.
 */
export const alertsMockGenerators = {
  getAnomalies: getMockAnomalies,
  getThresholdRules: getMockThresholdRules,
  getThresholdAlerts: getMockThresholdAlerts,
  getGoals: getMockGoals,
};
