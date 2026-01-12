import { memo } from 'react';
import { cn } from '@/utils/cn';
import type { Metric } from '@/types/analytics';

export interface MetricCardProps {
  title: string;
  metric: Metric;
  format: 'number' | 'percent' | 'currency';
}

// Cached formatters to avoid creating new instances on every render
const formatters = {
  currency: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }),
  number: new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }),
};

/**
 * Formats a number based on the specified format type.
 * Handles NaN and Infinity gracefully.
 */
function formatValue(value: number, format: MetricCardProps['format']): string {
  // Handle non-finite values
  if (!Number.isFinite(value)) {
    return format === 'currency' ? '$0' : '0';
  }

  switch (format) {
    case 'currency':
      return formatters.currency.format(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'number':
    default:
      return formatters.number.format(value);
  }
}

/**
 * Returns the arrow indicator based on change type.
 */
function getChangeIndicator(changeType: Metric['changeType']): string {
  switch (changeType) {
    case 'increase':
      return '\u2191'; // Up arrow
    case 'decrease':
      return '\u2193'; // Down arrow
    case 'stable':
    default:
      return '\u2192'; // Right arrow
  }
}

// Static styles extracted to avoid creating new objects on each render
const cardStyle = {
  backgroundColor: 'var(--bg-secondary, rgba(255,255,255,0.05))',
  borderColor: 'var(--border-color, rgba(255,255,255,0.1))',
};

const titleStyle = { color: 'var(--text-secondary, rgba(255,255,255,0.6))' };
const valueStyle = { color: 'var(--text-primary, rgba(255,255,255,0.95))' };

/**
 * MetricCard displays a single metric with current value, previous value comparison,
 * and change indicator with appropriate coloring.
 */
function MetricCardComponent({ title, metric, format }: MetricCardProps) {
  const { current, previous, change, changeType } = metric;

  const formattedCurrent = formatValue(current, format);
  const formattedPrevious = formatValue(previous, format);
  const indicator = getChangeIndicator(changeType);

  // Format change value, handling NaN
  const changeValue = Number.isFinite(change) ? Math.abs(change).toFixed(1) : '0.0';

  // Determine change color
  const changeColor =
    changeType === 'increase'
      ? 'var(--color-success, #22c55e)'
      : changeType === 'decrease'
      ? 'var(--color-error, #ef4444)'
      : 'var(--text-secondary, rgba(255,255,255,0.6))';

  // Accessibility label for change
  const changeLabel =
    changeType === 'increase'
      ? `increased by ${changeValue}%`
      : changeType === 'decrease'
      ? `decreased by ${changeValue}%`
      : 'no change';

  return (
    <div
      className={cn('rounded-lg border p-4', 'transition-colors duration-200')}
      style={cardStyle}
    >
      {/* Title */}
      <h3 className="text-sm font-medium mb-2" style={titleStyle}>
        {title}
      </h3>

      {/* Current Value */}
      <p className="text-2xl font-bold mb-1" style={valueStyle}>
        {formattedCurrent}
      </p>

      {/* Previous Value and Change */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={titleStyle}>
          vs {formattedPrevious}
        </span>

        <span
          className={cn('text-sm font-medium flex items-center gap-1')}
          style={{ color: changeColor }}
          aria-label={changeLabel}
        >
          <span aria-hidden="true">{indicator}</span>
          <span>{changeValue}%</span>
        </span>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const MetricCard = memo(MetricCardComponent);

export default MetricCard;
