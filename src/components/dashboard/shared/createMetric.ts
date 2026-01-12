import type { Metric } from "@/types/analytics";

/**
 * Creates a Metric object from current and previous values.
 * Handles edge cases: division by zero, NaN values.
 */
export function createMetric(current: number, previous: number): Metric {
  // Handle NaN inputs
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const safePrevious = Number.isFinite(previous) ? previous : 0;

  // Calculate change percentage
  let change: number;
  if (safePrevious === 0) {
    // When previous is 0: show 100% increase if current > 0, 0% if current is also 0
    change = safeCurrent > 0 ? 100 : 0;
  } else {
    change = ((safeCurrent - safePrevious) / safePrevious) * 100;
  }

  // Ensure change is finite
  if (!Number.isFinite(change)) {
    change = 0;
  }

  return {
    current: safeCurrent,
    previous: safePrevious,
    change,
    changeType: change > 0.5 ? "increase" : change < -0.5 ? "decrease" : "stable",
  };
}
