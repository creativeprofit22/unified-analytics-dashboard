"use client";

import type { Widget, DataSourceCategory } from '@/types/custom-dashboards';
import { ScatterChart } from '@/components/charts';

interface ScatterChartWidgetProps {
  widget: Widget;
}

interface ScatterDataItem {
  x: number;
  y: number;
  label?: string;
  value?: number;
  color?: string;
}

// Seeded random number generator for consistency
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function generateMockScatterData(source: DataSourceCategory, field: string): ScatterDataItem[] {
  const seed = source.charCodeAt(0) * 1000 + field.charCodeAt(0);
  const random = seededRandom(seed);
  const pointCount = 20 + Math.floor(random() * 11); // 20-30 points
  const data: ScatterDataItem[] = [];

  for (let i = 0; i < pointCount; i++) {
    let x: number;
    let y: number;
    let label: string | undefined;

    switch (source) {
      case 'revenue': {
        // x = spend, y = revenue (positive correlation with noise)
        x = Math.round(1000 + random() * 9000); // Spend: $1k-$10k
        const baseRevenue = x * (2.5 + random() * 1.5); // ROAS 2.5-4x
        const noise = (random() - 0.5) * x * 0.4; // ±20% noise
        y = Math.round(baseRevenue + noise);
        label = `Campaign ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`;
        break;
      }
      case 'unitEconomics': {
        // x = CAC, y = LTV (generally positive correlation)
        x = Math.round(50 + random() * 200); // CAC: $50-$250
        const ltv = x * (3 + random() * 2); // LTV:CAC ratio 3-5x
        const noise = (random() - 0.5) * x * 0.5; // ±25% noise
        y = Math.round(ltv + noise);
        label = `Segment ${i + 1}`;
        break;
      }
      case 'traffic': {
        // x = sessions, y = conversions (positive correlation)
        x = Math.round(500 + random() * 9500); // Sessions: 500-10k
        const conversionRate = 0.02 + random() * 0.06; // 2-8% conversion rate
        const baseConversions = x * conversionRate;
        const noise = (random() - 0.5) * baseConversions * 0.3; // ±15% noise
        y = Math.round(Math.max(1, baseConversions + noise));
        label = `Source ${String.fromCharCode(65 + (i % 26))}`;
        break;
      }
      default: {
        // Generic positive correlation for other sources
        x = Math.round(100 + random() * 900);
        const baseY = x * (1.2 + random() * 0.8);
        const noise = (random() - 0.5) * x * 0.3;
        y = Math.round(baseY + noise);
        label = `Point ${i + 1}`;
      }
    }

    data.push({ x, y, label });
  }

  return data;
}

function getAxisLabels(source: DataSourceCategory): { xAxisLabel: string; yAxisLabel: string } {
  switch (source) {
    case 'revenue':
      return { xAxisLabel: 'Ad Spend ($)', yAxisLabel: 'Revenue ($)' };
    case 'unitEconomics':
      return { xAxisLabel: 'CAC ($)', yAxisLabel: 'LTV ($)' };
    case 'traffic':
      return { xAxisLabel: 'Sessions', yAxisLabel: 'Conversions' };
    case 'conversions':
      return { xAxisLabel: 'Visitors', yAxisLabel: 'Conversions' };
    case 'campaigns':
      return { xAxisLabel: 'Impressions', yAxisLabel: 'Clicks' };
    case 'seo':
      return { xAxisLabel: 'Search Volume', yAxisLabel: 'Position' };
    default:
      return { xAxisLabel: 'X Value', yAxisLabel: 'Y Value' };
  }
}

export function ScatterChartWidget({ widget }: ScatterChartWidgetProps) {
  const { dataBinding, chartOptions } = widget.config;
  const source = dataBinding.source;
  const field = dataBinding.field;

  const data = generateMockScatterData(source, field);
  const { xAxisLabel, yAxisLabel } = getAxisLabels(source);

  // Scatter-specific defaults (ChartOptions doesn't have scatter-specific fields)
  const showTrendLine = true;
  const enableBrush = false;
  const symbolSize = 10;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ScatterChart
        data={data}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
        showTrendLine={showTrendLine}
        enableBrush={enableBrush}
        symbolSize={symbolSize}
      />
    </div>
  );
}

export default ScatterChartWidget;
