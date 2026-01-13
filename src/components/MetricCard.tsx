import { memo, useState, useCallback } from 'react';
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

const tooltipStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'var(--bg-primary, #1f2937)',
  border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
  borderRadius: '8px',
  padding: '12px 16px',
  minWidth: '180px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  zIndex: 50,
  fontSize: '13px',
};

/**
 * Formats a raw number with full precision for tooltip display.
 */
function formatRawValue(value: number, format: MetricCardProps['format']): string {
  if (!Number.isFinite(value)) return '0';

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    case 'percent':
      return `${value.toFixed(2)}%`;
    case 'number':
    default:
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 4,
      }).format(value);
  }
}

/**
 * MetricCard displays a single metric with current value, previous value comparison,
 * and change indicator with appropriate coloring. Shows detailed tooltip on hover.
 */
function MetricCardComponent({ title, metric, format }: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { current, previous, change, changeType } = metric;

  const handleMouseEnter = useCallback(() => setShowTooltip(true), []);
  const handleMouseLeave = useCallback(() => setShowTooltip(false), []);

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

  // Calculate the absolute difference
  const absoluteDiff = Math.abs(current - previous);
  const diffSign = current >= previous ? '+' : '-';

  return (
    <div
      className={cn(
        'rounded-lg border p-4 relative cursor-default',
        'transition-all duration-200',
        showTooltip && 'ring-1 ring-white/10'
      )}
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hover Tooltip */}
      {showTooltip && (
        <div style={tooltipStyle} role="tooltip">
          <div style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
            {title} Details
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Current</span>
            <span style={{ fontWeight: 500 }}>{formatRawValue(current, format)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Previous</span>
            <span style={{ fontWeight: 500 }}>{formatRawValue(previous, format)}</span>
          </div>
          <div
            style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-color, rgba(255,255,255,0.1))',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Difference</span>
            <span style={{ fontWeight: 500, color: changeColor }}>
              {diffSign}{formatRawValue(absoluteDiff, format)}
            </span>
          </div>
        </div>
      )}

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
