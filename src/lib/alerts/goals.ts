/**
 * Goal Progress Module
 *
 * Calculates goal progress and determines status based on actual vs expected trajectory.
 * Supports both "higher is better" and "lower is better" metrics.
 *
 * @example
 * // Evaluate a revenue goal
 * const goal = evaluateGoal({
 *   id: 'revenue-q1',
 *   name: 'Q1 Revenue Target',
 *   metric: 'revenue',
 *   targetValue: 100000,
 *   currentValue: 45000,
 *   startDate: '2026-01-01',
 *   endDate: '2026-03-31'
 * });
 * console.log(goal.status); // 'on_track' or 'at_risk' etc.
 */

import type { Goal, GoalStatus } from "@/types/alerts";

/**
 * Metrics where lower values are better.
 * Used to correctly calculate progress direction.
 */
const LOWER_IS_BETTER_METRICS = new Set(["churnRate", "cac"]);

/**
 * Status thresholds for comparing actual vs expected progress.
 * These represent how far behind actual progress can be before status changes.
 */
const STATUS_THRESHOLDS = {
  /** On track if actual >= expected - 5% */
  ON_TRACK: 5,
  /** At risk if actual >= expected - 20% */
  AT_RISK: 20,
};

/**
 * Calculate progress percentage (0-100) toward a goal.
 *
 * Handles both "higher is better" metrics (revenue, MRR) and
 * "lower is better" metrics (churn rate, CAC).
 *
 * For "higher is better": progress = (current / target) * 100
 * For "lower is better": progress = ((start - current) / (start - target)) * 100
 *
 * Progress is clamped to 0-100 range.
 *
 * @param current - Current value of the metric
 * @param target - Target value to achieve
 * @param startValue - Starting value (only needed for "lower is better" metrics)
 * @param isLowerBetter - Whether lower values indicate better performance
 * @returns Progress percentage from 0 to 100
 *
 * @example
 * // Higher is better (revenue)
 * calculateProgress(50000, 100000, 0, false) // => 50 (50% toward target)
 *
 * @example
 * // Lower is better (churn rate: start=10%, target=5%, current=7%)
 * calculateProgress(7, 5, 10, true) // => 60 (reduced by 3 of needed 5 = 60%)
 *
 * @example
 * // Goal achieved
 * calculateProgress(120000, 100000, 0, false) // => 100 (capped at 100)
 */
function calculateProgress(
  current: number,
  target: number,
  startValue: number,
  isLowerBetter: boolean
): number {
  let progress: number;

  if (isLowerBetter) {
    // For "lower is better" metrics, calculate reduction progress
    // Example: Start=10, Target=5, Current=7 means we've reduced by 3 of needed 5
    const totalReductionNeeded = startValue - target;
    const actualReduction = startValue - current;

    if (totalReductionNeeded <= 0) {
      // Target is same or higher than start - already achieved
      progress = 100;
    } else {
      progress = (actualReduction / totalReductionNeeded) * 100;
    }
  } else {
    // For "higher is better" metrics, calculate growth progress
    if (target <= 0) {
      progress = current > 0 ? 100 : 0;
    } else {
      progress = (current / target) * 100;
    }
  }

  // Clamp progress to 0-100 range
  return Math.max(0, Math.min(100, progress));
}

/**
 * Calculate expected progress based on time elapsed between start and end dates.
 *
 * Assumes linear progress trajectory from start to end date.
 * Returns a percentage (0-100) representing how much of the goal period has elapsed.
 *
 * @param startDate - ISO 8601 date string when goal tracking started
 * @param endDate - ISO 8601 date string when goal should be achieved
 * @returns Expected progress percentage (0-100)
 *
 * @example
 * // Halfway through the goal period
 * calculateExpectedProgress('2026-01-01', '2026-01-31')
 * // If today is Jan 15: => ~50
 *
 * @example
 * // Past the end date
 * calculateExpectedProgress('2025-01-01', '2025-12-31')
 * // If today is 2026: => 100
 *
 * @example
 * // Before start date
 * calculateExpectedProgress('2026-06-01', '2026-12-31')
 * // If today is Jan 2026: => 0
 */
function calculateExpectedProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  // If dates are invalid or end is before/equal to start
  if (isNaN(start) || isNaN(end) || end <= start) {
    return 0;
  }

  // If we're past the end date, expected progress is 100%
  if (now >= end) {
    return 100;
  }

  // If we haven't started yet, expected progress is 0%
  if (now <= start) {
    return 0;
  }

  // Calculate linear progress based on time elapsed
  const totalDuration = end - start;
  const elapsed = now - start;
  const progress = (elapsed / totalDuration) * 100;

  return Math.min(100, progress);
}

/**
 * Determine goal status based on actual vs expected progress.
 *
 * Status determination:
 * - achieved: Actual progress >= 100%
 * - on_track: Actual progress >= Expected progress - 5%
 * - at_risk: Actual progress >= Expected progress - 20%
 * - behind: Actual progress < Expected progress - 20%
 *
 * @param actualProgress - Actual progress percentage (0-100)
 * @param expectedProgress - Expected progress percentage based on time elapsed
 * @returns Goal status classification
 *
 * @example
 * getGoalStatus(50, 45) // => 'on_track' (ahead of schedule)
 * getGoalStatus(40, 45) // => 'on_track' (within 5% tolerance)
 * getGoalStatus(30, 45) // => 'at_risk' (10-20% behind)
 * getGoalStatus(20, 45) // => 'behind' (>20% behind)
 * getGoalStatus(100, 50) // => 'achieved' (goal complete)
 */
function getGoalStatus(
  actualProgress: number,
  expectedProgress: number
): GoalStatus {
  // Goal is achieved if progress >= 100%
  if (actualProgress >= 100) {
    return "achieved";
  }

  // Calculate how far behind (negative) or ahead (positive) we are
  const progressDifference = actualProgress - expectedProgress;

  // On track: within 5% of expected (or ahead)
  if (progressDifference >= -STATUS_THRESHOLDS.ON_TRACK) {
    return "on_track";
  }

  // At risk: between 5% and 20% behind
  if (progressDifference >= -STATUS_THRESHOLDS.AT_RISK) {
    return "at_risk";
  }

  // Behind: more than 20% behind expected progress
  return "behind";
}

/**
 * Evaluate goal progress and determine status.
 *
 * Takes a partial Goal object (without progress and status) and returns
 * a complete Goal with calculated progress and status.
 *
 * Handles both "higher is better" metrics (revenue, traffic, MRR) and
 * "lower is better" metrics (churnRate, CAC).
 *
 * @param goal - Goal object without progress and status fields
 * @returns Complete Goal object with calculated progress (0-100) and status
 *
 * @example
 * // Revenue goal (higher is better)
 * evaluateGoal({
 *   id: 'revenue-q1',
 *   name: 'Q1 Revenue Target',
 *   metric: 'revenue',
 *   targetValue: 100000,
 *   currentValue: 45000,
 *   startDate: '2026-01-01',
 *   endDate: '2026-03-31'
 * })
 * // => { ...input, progress: 45, status: 'on_track' } (if ~45% through Q1)
 *
 * @example
 * // Churn goal (lower is better)
 * evaluateGoal({
 *   id: 'churn-reduction',
 *   name: 'Reduce Churn Rate',
 *   metric: 'churnRate',
 *   targetValue: 5,      // Target: 5% churn
 *   currentValue: 7,     // Current: 7% churn
 *   startDate: '2026-01-01',  // Started at ~10% (implicit from metric history)
 *   endDate: '2026-06-30'
 * })
 * // Progress calculated based on reduction from starting value
 *
 * @example
 * // Achieved goal
 * evaluateGoal({
 *   id: 'mrr-milestone',
 *   name: 'Hit $50K MRR',
 *   metric: 'mrr',
 *   targetValue: 50000,
 *   currentValue: 52000,
 *   startDate: '2025-07-01',
 *   endDate: '2026-06-30'
 * })
 * // => { ...input, progress: 100, status: 'achieved' }
 */
export function evaluateGoal(
  goal: Omit<Goal, "progress" | "status">
): Goal {
  const isLowerBetter = LOWER_IS_BETTER_METRICS.has(goal.metric);

  // For "lower is better" metrics, we need an estimated start value
  // In a real implementation, this would come from historical data
  // Here we estimate based on metric type and current value
  const startValue = isLowerBetter
    ? estimateStartValue(goal.metric, goal.currentValue, goal.targetValue)
    : 0;

  const progress = calculateProgress(
    goal.currentValue,
    goal.targetValue,
    startValue,
    isLowerBetter
  );

  const expectedProgress = calculateExpectedProgress(goal.startDate, goal.endDate);
  const status = getGoalStatus(progress, expectedProgress);

  return {
    ...goal,
    progress: Math.round(progress * 10) / 10, // Round to 1 decimal place
    status,
  };
}

/**
 * Estimate starting value for "lower is better" metrics.
 *
 * In production, this would query historical data for the actual starting value.
 * This is a simplified estimation for demonstration purposes.
 *
 * @param metric - The metric type
 * @param currentValue - Current value of the metric
 * @param targetValue - Target value to achieve
 * @returns Estimated starting value
 */
function estimateStartValue(
  metric: string,
  currentValue: number,
  targetValue: number
): number {
  // If current is already better than target, use current as baseline
  if (currentValue <= targetValue) {
    return currentValue;
  }

  // Estimate start as higher than current (since we're trying to reduce)
  // This is a reasonable heuristic; in production, use actual historical data
  switch (metric) {
    case "churnRate":
      // Churn goals typically start 2-5 percentage points above target
      return Math.max(currentValue, targetValue + 5);
    case "cac":
      // CAC goals typically start 20-50% above target
      return Math.max(currentValue, targetValue * 1.5);
    default:
      return Math.max(currentValue, targetValue * 1.2);
  }
}

// =============================================================================
// UNIT TESTS (as comments showing expected behavior)
// =============================================================================

/*
Test: calculateProgress for "higher is better" metrics
  Input: current=50000, target=100000, startValue=0, isLowerBetter=false
  Expected: 50

  Input: current=120000, target=100000, startValue=0, isLowerBetter=false
  Expected: 100 (capped)

  Input: current=0, target=100000, startValue=0, isLowerBetter=false
  Expected: 0

Test: calculateProgress for "lower is better" metrics
  Input: current=7, target=5, startValue=10, isLowerBetter=true
  Expected: 60 (reduced 3 of needed 5 = 60%)

  Input: current=5, target=5, startValue=10, isLowerBetter=true
  Expected: 100 (achieved target)

  Input: current=3, target=5, startValue=10, isLowerBetter=true
  Expected: 100 (exceeded target, capped)

  Input: current=10, target=5, startValue=10, isLowerBetter=true
  Expected: 0 (no reduction yet)

Test: calculateExpectedProgress - halfway through period
  Input: startDate='2026-01-01', endDate='2026-01-31'
  If today is Jan 16: Expected ~50%

Test: calculateExpectedProgress - past end date
  Input: startDate='2025-01-01', endDate='2025-12-31' (past dates)
  Expected: 100

Test: calculateExpectedProgress - before start date
  Input: startDate='2026-12-01', endDate='2026-12-31' (future dates)
  Expected: 0

Test: calculateExpectedProgress - invalid dates
  Input: startDate='invalid', endDate='also-invalid'
  Expected: 0

Test: getGoalStatus - achieved
  Input: actualProgress=100, expectedProgress=50
  Expected: 'achieved'

  Input: actualProgress=150, expectedProgress=50
  Expected: 'achieved'

Test: getGoalStatus - on_track (ahead)
  Input: actualProgress=60, expectedProgress=50
  Expected: 'on_track'

Test: getGoalStatus - on_track (within tolerance)
  Input: actualProgress=46, expectedProgress=50
  Expected: 'on_track' (within 5%)

Test: getGoalStatus - at_risk
  Input: actualProgress=35, expectedProgress=50
  Expected: 'at_risk' (15% behind, between 5-20%)

Test: getGoalStatus - behind
  Input: actualProgress=25, expectedProgress=50
  Expected: 'behind' (25% behind, > 20%)

Test: evaluateGoal returns complete Goal object
  Input: { id, name, metric, targetValue, currentValue, startDate, endDate }
  Expected: Same object with progress and status fields added

Test: evaluateGoal handles revenue metric correctly
  Input: { metric: 'revenue', targetValue: 100000, currentValue: 45000, ... }
  Expected: progress = 45, status based on time elapsed

Test: evaluateGoal handles churnRate metric correctly (lower is better)
  Input: { metric: 'churnRate', targetValue: 5, currentValue: 7, ... }
  Expected: progress calculated as reduction toward target

Test: evaluateGoal rounds progress to 1 decimal place
  Input: goal that would result in progress = 45.678
  Expected: progress = 45.7
*/
