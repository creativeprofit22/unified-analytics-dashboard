import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Widget, DataSourceCategory } from '@/types/custom-dashboards';

interface LineChartWidgetProps {
  widget: Widget;
}

interface DataPoint {
  date: string;
  value: number;
}

/**
 * Generates mock time-series data based on the data source and field.
 * Creates realistic-looking data patterns for different data categories.
 */
function generateMockData(source: DataSourceCategory, field: string): DataPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Generate a seed based on source and field for consistent mock data
  const seedString = `${source}-${field}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed += seedString.charCodeAt(i);
  }

  // Simple seeded random function
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Base value ranges by source category
  const baseRanges: Record<DataSourceCategory, { min: number; max: number; trend: number }> = {
    traffic: { min: 1000, max: 50000, trend: 1.05 },
    seo: { min: 10, max: 100, trend: 1.02 },
    conversions: { min: 50, max: 500, trend: 1.03 },
    revenue: { min: 5000, max: 100000, trend: 1.08 },
    subscriptions: { min: 100, max: 2000, trend: 1.04 },
    payments: { min: 200, max: 5000, trend: 1.02 },
    unitEconomics: { min: 20, max: 200, trend: 1.01 },
    demographics: { min: 1000, max: 10000, trend: 1.0 },
    segmentation: { min: 500, max: 5000, trend: 1.02 },
    campaigns: { min: 100, max: 10000, trend: 1.06 },
    predictions: { min: 1000, max: 50000, trend: 1.1 },
  };

  const range = baseRanges[source] || { min: 100, max: 1000, trend: 1.02 };
  let baseValue = range.min + seededRandom() * (range.max - range.min) * 0.3;

  return months.map((month) => {
    // Apply trend with some randomness
    baseValue = baseValue * range.trend * (0.9 + seededRandom() * 0.2);
    // Add seasonal variation
    const seasonalFactor = 1 + Math.sin((months.indexOf(month) / 12) * Math.PI * 2) * 0.15;
    const value = Math.round(baseValue * seasonalFactor);

    return {
      date: month,
      value: Math.max(range.min, Math.min(range.max, value)),
    };
  });
}

export function LineChartWidget({ widget }: LineChartWidgetProps) {
  const { dataBinding, chartOptions } = widget.config;

  // Extract options with defaults
  const showLegend = chartOptions?.showLegend ?? false;
  const showGrid = chartOptions?.showGrid ?? true;
  const smooth = chartOptions?.smooth ?? false;
  const animate = chartOptions?.animate ?? true;

  // Generate mock data based on data binding
  const data = generateMockData(dataBinding.source, dataBinding.field);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.1)"
            vertical={false}
          />
        )}
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          tickLine={{ stroke: 'var(--text-secondary)' }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        />
        <YAxis
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          tickLine={{ stroke: 'var(--text-secondary)' }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickFormatter={(value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value.toString();
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
          }}
          labelStyle={{ color: 'var(--text-secondary)' }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{
              color: 'var(--text-secondary)',
            }}
          />
        )}
        <Line
          type={smooth ? 'monotone' : 'linear'}
          dataKey="value"
          name={dataBinding.field}
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#8884d8' }}
          isAnimationActive={animate}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineChartWidget;
