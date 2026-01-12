// Re-export cn from utils folder (avoiding duplication)
export { cn } from '@/utils/cn';

/**
 * Format large numbers with K/M suffixes
 * @example formatNumber(1500) => "1.5K"
 * @example formatNumber(2500000) => "2.5M"
 */
export function formatNumber(num: number): string {
  if (!Number.isFinite(num)) return '0';
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format percentage change with sign
 * @example formatChange(5.5) => "+5.5%"
 * @example formatChange(-3.2) => "-3.2%"
 */
export function formatChange(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * Get relative time string from date
 * @example getRelativeTime("2026-01-12T10:00:00Z") => "2h ago"
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Format a date for display
 * @example formatDate("2026-01-12T10:30:00Z") => "Jan 12, 2026"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Platform display names mapping
 */
export const platformNames: Record<string, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  twitter: 'Twitter/X',
  all: 'All Platforms',
};

/**
 * Platform brand colors for charts and badges
 */
export const platformColors: Record<string, string> = {
  youtube: '#FF0000',
  tiktok: '#00F2EA',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
};

/**
 * Get the appropriate text color class based on change direction
 */
export function getChangeColorClass(change: number): string {
  if (change > 0) return 'text-green-500';
  if (change < 0) return 'text-red-500';
  return 'text-gray-500';
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function with cancel support
 * Returns a debounced function with a .cancel() method for cleanup
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
