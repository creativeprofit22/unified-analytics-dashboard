/**
 * Threshold Alerts Module
 *
 * Rule-based threshold monitoring for analytics metrics.
 * Evaluates metric values against configurable threshold rules and generates alerts.
 *
 * @example
 * // Check if churn rate exceeds threshold
 * const rule: ThresholdRule = {
 *   id: 'churn-high',
 *   name: 'High Churn Rate',
 *   metric: 'churnRate',
 *   operator: 'gt',
 *   value: 5,
 *   enabled: true
 * };
 * const alert = evaluateThreshold(rule, 6.5);
 * console.log(alert.status); // 'breached'
 */

import type {
  ThresholdRule,
  ThresholdAlert,
  ThresholdStatus,
  ThresholdOperator,
} from "@/types/alerts";

/**
 * Warning threshold percentage.
 * Alert enters warning state when value is within this percentage of the threshold.
 */
const WARNING_THRESHOLD_PERCENT = 0.1; // 10%

/**
 * Check if a value breaches a threshold based on the operator.
 *
 * @param value - The current metric value
 * @param operator - The comparison operator
 * @param threshold - The threshold value to compare against
 * @returns true if the value breaches the threshold
 *
 * @example
 * checkThreshold(10, 'gt', 5) // => true (10 > 5)
 * checkThreshold(10, 'lt', 5) // => false (10 is not < 5)
 * checkThreshold(5, 'gte', 5) // => true (5 >= 5)
 * checkThreshold(5, 'lte', 5) // => true (5 <= 5)
 */
function checkThreshold(
  value: number,
  operator: ThresholdOperator,
  threshold: number
): boolean {
  switch (operator) {
    case "gt":
      return value > threshold;
    case "lt":
      return value < threshold;
    case "gte":
      return value >= threshold;
    case "lte":
      return value <= threshold;
    default:
      return false;
  }
}

/**
 * Determine the threshold status based on value proximity to threshold.
 *
 * Status determination:
 * - breached: Value has crossed the threshold
 * - warning: Value is within 10% of the threshold (approaching danger zone)
 * - normal: Value is safely away from the threshold
 *
 * For "greater than" operators (gt, gte), warning zone is when value is above 90% of threshold.
 * For "less than" operators (lt, lte), warning zone is when value is below 110% of threshold.
 *
 * @param value - The current metric value
 * @param operator - The comparison operator
 * @param threshold - The threshold value
 * @returns The threshold status
 *
 * @example
 * // Greater than: threshold=100
 * getThresholdStatus(120, 'gt', 100) // => 'breached' (120 > 100)
 * getThresholdStatus(95, 'gt', 100) // => 'warning' (95 > 90, approaching)
 * getThresholdStatus(80, 'gt', 100) // => 'normal' (safely below)
 *
 * @example
 * // Less than: threshold=50
 * getThresholdStatus(40, 'lt', 50) // => 'breached' (40 < 50)
 * getThresholdStatus(52, 'lt', 50) // => 'warning' (52 < 55, approaching)
 * getThresholdStatus(70, 'lt', 50) // => 'normal' (safely above)
 */
function getThresholdStatus(
  value: number,
  operator: ThresholdOperator,
  threshold: number
): ThresholdStatus {
  // First check if breached
  if (checkThreshold(value, operator, threshold)) {
    return "breached";
  }

  // Calculate warning zone based on operator direction
  // For "greater than" operators, warning is when approaching from below
  // For "less than" operators, warning is when approaching from above
  const warningMargin = Math.abs(threshold * WARNING_THRESHOLD_PERCENT);

  switch (operator) {
    case "gt":
    case "gte": {
      // Warning zone: value is within 10% below the threshold
      const warningThreshold = threshold - warningMargin;
      if (value >= warningThreshold) {
        return "warning";
      }
      break;
    }
    case "lt":
    case "lte": {
      // Warning zone: value is within 10% above the threshold
      const warningThreshold = threshold + warningMargin;
      if (value <= warningThreshold) {
        return "warning";
      }
      break;
    }
  }

  return "normal";
}

/**
 * Generate a human-readable alert message based on rule and status.
 *
 * @param rule - The threshold rule that was evaluated
 * @param currentValue - The current metric value
 * @param status - The determined threshold status
 * @returns A descriptive message for the alert
 *
 * @example
 * // Breached alert
 * generateAlertMessage(churnRule, 6.5, 'breached')
 * // => "High Churn Rate: churnRate is 6.5, which exceeds the threshold of 5"
 *
 * @example
 * // Warning alert
 * generateAlertMessage(churnRule, 4.8, 'warning')
 * // => "High Churn Rate: churnRate is 4.8, approaching the threshold of 5"
 *
 * @example
 * // Normal status
 * generateAlertMessage(churnRule, 2.0, 'normal')
 * // => "High Churn Rate: churnRate is 2, within acceptable range"
 */
function generateAlertMessage(
  rule: ThresholdRule,
  currentValue: number,
  status: ThresholdStatus
): string {
  const operatorDescriptions: Record<ThresholdOperator, string> = {
    gt: "exceeds",
    gte: "is at or exceeds",
    lt: "is below",
    lte: "is at or below",
  };

  const formattedValue = Number.isInteger(currentValue)
    ? currentValue.toString()
    : currentValue.toFixed(2);

  const formattedThreshold = Number.isInteger(rule.value)
    ? rule.value.toString()
    : rule.value.toFixed(2);

  switch (status) {
    case "breached":
      return `${rule.name}: ${rule.metric} is ${formattedValue}, which ${operatorDescriptions[rule.operator]} the threshold of ${formattedThreshold}`;
    case "warning":
      return `${rule.name}: ${rule.metric} is ${formattedValue}, approaching the threshold of ${formattedThreshold}`;
    case "normal":
      return `${rule.name}: ${rule.metric} is ${formattedValue}, within acceptable range`;
    default:
      return `${rule.name}: ${rule.metric} is ${formattedValue}`;
  }
}

/**
 * Generate a unique ID for a threshold alert.
 */
function generateAlertId(ruleId: string): string {
  return `alert-${ruleId}-${Date.now()}`;
}

/**
 * Evaluate a threshold rule against the current metric value.
 *
 * Returns a ThresholdAlert containing:
 * - The evaluated rule
 * - Current status (normal, warning, breached)
 * - Breach timestamp (if breached)
 * - Human-readable message
 *
 * @param rule - The threshold rule to evaluate
 * @param currentValue - The current value of the monitored metric
 * @returns A ThresholdAlert with evaluation results
 *
 * @example
 * // Rule: Alert if churn rate > 5%
 * const rule: ThresholdRule = {
 *   id: 'churn-high',
 *   name: 'High Churn Rate',
 *   metric: 'churnRate',
 *   operator: 'gt',
 *   value: 5,
 *   enabled: true
 * };
 *
 * // Breached scenario
 * evaluateThreshold(rule, 6.5)
 * // => {
 * //   id: 'alert-churn-high-...',
 * //   rule: { ... },
 * //   currentValue: 6.5,
 * //   status: 'breached',
 * //   breachedAt: '2026-01-13T...',
 * //   message: 'High Churn Rate: churnRate is 6.5, which exceeds the threshold of 5'
 * // }
 *
 * @example
 * // Warning scenario (approaching threshold)
 * evaluateThreshold(rule, 4.8)
 * // => { status: 'warning', breachedAt: undefined, ... }
 *
 * @example
 * // Normal scenario
 * evaluateThreshold(rule, 2.0)
 * // => { status: 'normal', breachedAt: undefined, ... }
 */
export function evaluateThreshold(
  rule: ThresholdRule,
  currentValue: number
): ThresholdAlert {
  const status = getThresholdStatus(currentValue, rule.operator, rule.value);
  const message = generateAlertMessage(rule, currentValue, status);

  const alert: ThresholdAlert = {
    id: generateAlertId(rule.id),
    rule,
    currentValue,
    status,
    message,
  };

  // Add breach timestamp only when status is breached
  if (status === "breached") {
    alert.breachedAt = new Date().toISOString();
  }

  return alert;
}

// =============================================================================
// UNIT TESTS (as comments showing expected behavior)
// =============================================================================

/*
Test: checkThreshold with 'gt' operator
  Input: value=10, operator='gt', threshold=5
  Expected: true

  Input: value=5, operator='gt', threshold=5
  Expected: false

  Input: value=3, operator='gt', threshold=5
  Expected: false

Test: checkThreshold with 'lt' operator
  Input: value=3, operator='lt', threshold=5
  Expected: true

  Input: value=5, operator='lt', threshold=5
  Expected: false

  Input: value=10, operator='lt', threshold=5
  Expected: false

Test: checkThreshold with 'gte' operator
  Input: value=5, operator='gte', threshold=5
  Expected: true

  Input: value=10, operator='gte', threshold=5
  Expected: true

Test: checkThreshold with 'lte' operator
  Input: value=5, operator='lte', threshold=5
  Expected: true

  Input: value=3, operator='lte', threshold=5
  Expected: true

Test: getThresholdStatus breached scenarios
  Input: value=120, operator='gt', threshold=100
  Expected: 'breached'

  Input: value=40, operator='lt', threshold=50
  Expected: 'breached'

Test: getThresholdStatus warning scenarios (within 10%)
  Input: value=95, operator='gt', threshold=100
  Expected: 'warning' (95 >= 90, which is 100 - 10%)

  Input: value=52, operator='lt', threshold=50
  Expected: 'warning' (52 <= 55, which is 50 + 10%)

Test: getThresholdStatus normal scenarios
  Input: value=80, operator='gt', threshold=100
  Expected: 'normal' (80 < 90, safely below warning zone)

  Input: value=70, operator='lt', threshold=50
  Expected: 'normal' (70 > 55, safely above warning zone)

Test: generateAlertMessage for breached status
  Input: rule={name: 'High Churn', metric: 'churnRate', operator: 'gt', value: 5},
         currentValue=6.5, status='breached'
  Expected: 'High Churn: churnRate is 6.50, which exceeds the threshold of 5'

Test: generateAlertMessage for warning status
  Input: same rule, currentValue=4.8, status='warning'
  Expected: 'High Churn: churnRate is 4.80, approaching the threshold of 5'

Test: generateAlertMessage for normal status
  Input: same rule, currentValue=2.0, status='normal'
  Expected: 'High Churn: churnRate is 2, within acceptable range'

Test: evaluateThreshold returns correct structure
  Input: rule with id='churn-high', currentValue=6.5
  Expected: {
    id: starts with 'alert-churn-high-',
    rule: the input rule,
    currentValue: 6.5,
    status: 'breached',
    breachedAt: ISO timestamp string,
    message: descriptive string
  }

Test: evaluateThreshold omits breachedAt when not breached
  Input: rule with operator='gt', value=100, currentValue=50
  Expected: alert.breachedAt is undefined

Test: evaluateThreshold includes breachedAt when breached
  Input: rule with operator='gt', value=100, currentValue=120
  Expected: alert.breachedAt is a valid ISO timestamp
*/
