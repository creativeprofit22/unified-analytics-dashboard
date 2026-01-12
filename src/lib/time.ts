/**
 * Time-related utilities for analytics
 */

import type { TimeRange } from '@/types';

/**
 * Parse time range string to number of days
 * @param timeRange - The time range string ('7d', '30d', '90d', '1y', 'all')
 * @returns Number of days for the time range
 */
export function parseTimeRange(timeRange: string): number {
  switch (timeRange) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case '1y':
      return 365;
    case 'all':
      return 365; // Default to 1 year for 'all'
    default:
      return 30;
  }
}

/**
 * Get days count for a TimeRange type
 * Type-safe version that only accepts valid TimeRange values
 */
export function getTimeRangeDays(timeRange: TimeRange): number {
  return parseTimeRange(timeRange);
}
