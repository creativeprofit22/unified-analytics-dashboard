/**
 * Widget Registry
 *
 * Central registry for all available widget types with their metadata,
 * default configurations, and factory functions.
 */

import type {
  WidgetType,
  WidgetTypeInfo,
  Widget,
  WidgetConfig,
  GridPosition,
  DataSourceCategory,
  WidgetSize,
  WIDGET_SIZE_PRESETS,
} from '@/types/custom-dashboards';

// =============================================================================
// WIDGET TYPE DEFINITIONS
// =============================================================================

/**
 * All registered widget types with their metadata.
 */
export const WIDGET_REGISTRY: Record<WidgetType, WidgetTypeInfo> = {
  'metric-card': {
    type: 'metric-card',
    name: 'Metric Card',
    description: 'Display a single key metric with comparison',
    icon: 'hash',
    category: 'metrics',
    compatibleSources: [
      'traffic',
      'seo',
      'conversions',
      'revenue',
      'subscriptions',
      'payments',
      'unitEconomics',
      'demographics',
      'campaigns',
      'predictions',
    ],
    defaultSize: 'small',
    defaultDimensions: { w: 3, h: 2, minW: 2, minH: 2 },
    defaultConfig: {
      type: 'metric-card',
      metricOptions: {
        format: 'number',
        showComparison: true,
        showTrend: true,
      },
    },
  },

  'line-chart': {
    type: 'line-chart',
    name: 'Line Chart',
    description: 'Show trends over time',
    icon: 'trending-up',
    category: 'charts',
    compatibleSources: [
      'traffic',
      'revenue',
      'subscriptions',
      'conversions',
      'campaigns',
      'predictions',
    ],
    defaultSize: 'medium',
    defaultDimensions: { w: 6, h: 3, minW: 4, minH: 3 },
    defaultConfig: {
      type: 'line-chart',
      chartOptions: {
        showLegend: true,
        legendPosition: 'bottom',
        showGrid: true,
        animate: true,
        smooth: true,
      },
    },
  },

  'area-chart': {
    type: 'area-chart',
    name: 'Area Chart',
    description: 'Visualize cumulative trends',
    icon: 'layers',
    category: 'charts',
    compatibleSources: [
      'traffic',
      'revenue',
      'subscriptions',
      'conversions',
      'predictions',
    ],
    defaultSize: 'medium',
    defaultDimensions: { w: 6, h: 3, minW: 4, minH: 3 },
    defaultConfig: {
      type: 'area-chart',
      chartOptions: {
        showLegend: true,
        legendPosition: 'bottom',
        showGrid: true,
        animate: true,
        smooth: true,
        stacked: false,
      },
    },
  },

  'bar-chart': {
    type: 'bar-chart',
    name: 'Bar Chart',
    description: 'Compare values across categories',
    icon: 'bar-chart-2',
    category: 'charts',
    compatibleSources: [
      'traffic',
      'seo',
      'conversions',
      'revenue',
      'demographics',
      'segmentation',
      'campaigns',
    ],
    defaultSize: 'medium',
    defaultDimensions: { w: 6, h: 4, minW: 4, minH: 3 },
    defaultConfig: {
      type: 'bar-chart',
      chartOptions: {
        showLegend: false,
        showGrid: true,
        animate: true,
        orientation: 'vertical',
        stacked: false,
      },
    },
  },

  'pie-chart': {
    type: 'pie-chart',
    name: 'Pie Chart',
    description: 'Show distribution and proportions',
    icon: 'pie-chart',
    category: 'charts',
    compatibleSources: [
      'traffic',
      'demographics',
      'segmentation',
      'payments',
      'campaigns',
    ],
    defaultSize: 'medium',
    defaultDimensions: { w: 4, h: 4, minW: 3, minH: 3 },
    defaultConfig: {
      type: 'pie-chart',
      chartOptions: {
        showLegend: true,
        legendPosition: 'right',
        animate: true,
        showDataLabels: true,
        innerRadius: 0,
      },
    },
  },

  'funnel-chart': {
    type: 'funnel-chart',
    name: 'Funnel Chart',
    description: 'Visualize conversion stages',
    icon: 'filter',
    category: 'advanced',
    compatibleSources: ['conversions', 'campaigns'],
    defaultSize: 'tall',
    defaultDimensions: { w: 4, h: 5, minW: 3, minH: 4 },
    defaultConfig: {
      type: 'funnel-chart',
      chartOptions: {
        showLegend: false,
        animate: true,
        showDataLabels: true,
      },
    },
  },

  'gauge-chart': {
    type: 'gauge-chart',
    name: 'Gauge',
    description: 'Show progress toward a goal',
    icon: 'gauge',
    category: 'metrics',
    compatibleSources: [
      'conversions',
      'revenue',
      'subscriptions',
      'unitEconomics',
      'campaigns',
    ],
    defaultSize: 'small',
    defaultDimensions: { w: 3, h: 3, minW: 2, minH: 2 },
    defaultConfig: {
      type: 'gauge-chart',
      chartOptions: {
        animate: true,
        showDataLabels: true,
      },
    },
  },

  table: {
    type: 'table',
    name: 'Data Table',
    description: 'Display detailed data in rows',
    icon: 'table',
    category: 'tables',
    compatibleSources: [
      'traffic',
      'seo',
      'conversions',
      'revenue',
      'subscriptions',
      'payments',
      'demographics',
      'segmentation',
      'campaigns',
    ],
    defaultSize: 'wide',
    defaultDimensions: { w: 8, h: 4, minW: 4, minH: 3 },
    defaultConfig: {
      type: 'table',
      tableOptions: {
        columns: [],
        paginate: true,
        pageSize: 10,
        sortable: true,
      },
    },
  },

  heatmap: {
    type: 'heatmap',
    name: 'Heatmap',
    description: 'Show patterns in two dimensions',
    icon: 'grid',
    category: 'advanced',
    compatibleSources: ['traffic', 'conversions', 'campaigns', 'demographics'],
    defaultSize: 'large',
    defaultDimensions: { w: 6, h: 4, minW: 4, minH: 3 },
    defaultConfig: {
      type: 'heatmap',
      chartOptions: {
        showLegend: true,
        animate: true,
      },
    },
  },

  'scatter-chart': {
    type: 'scatter-chart',
    name: 'Scatter Plot',
    description: 'Explore correlations between metrics',
    icon: 'scatter-chart',
    category: 'advanced',
    compatibleSources: [
      'traffic',
      'conversions',
      'revenue',
      'unitEconomics',
      'segmentation',
    ],
    defaultSize: 'large',
    defaultDimensions: { w: 6, h: 4, minW: 4, minH: 3 },
    defaultConfig: {
      type: 'scatter-chart',
      chartOptions: {
        showLegend: true,
        showGrid: true,
        animate: true,
      },
    },
  },

  'radar-chart': {
    type: 'radar-chart',
    name: 'Radar Chart',
    description: 'Compare multiple dimensions',
    icon: 'radar',
    category: 'advanced',
    compatibleSources: ['seo', 'unitEconomics', 'segmentation', 'campaigns'],
    defaultSize: 'medium',
    defaultDimensions: { w: 4, h: 4, minW: 3, minH: 3 },
    defaultConfig: {
      type: 'radar-chart',
      chartOptions: {
        showLegend: true,
        animate: true,
      },
    },
  },

  'sankey-chart': {
    type: 'sankey-chart',
    name: 'Sankey Diagram',
    description: 'Visualize flow between stages',
    icon: 'git-branch',
    category: 'advanced',
    compatibleSources: ['traffic', 'conversions', 'segmentation'],
    defaultSize: 'wide',
    defaultDimensions: { w: 8, h: 4, minW: 6, minH: 3 },
    defaultConfig: {
      type: 'sankey-chart',
      chartOptions: {
        showLegend: false,
        animate: true,
      },
    },
  },
};

// =============================================================================
// WIDGET CATEGORIES
// =============================================================================

/**
 * Widget categories for grouping in the picker.
 */
export const WIDGET_CATEGORIES = [
  {
    id: 'metrics' as const,
    name: 'Metrics',
    description: 'Key performance indicators',
  },
  {
    id: 'charts' as const,
    name: 'Charts',
    description: 'Visualize trends and distributions',
  },
  {
    id: 'tables' as const,
    name: 'Tables',
    description: 'Detailed data views',
  },
  {
    id: 'advanced' as const,
    name: 'Advanced',
    description: 'Complex visualizations',
  },
];

// =============================================================================
// DATA SOURCE PRESETS
// =============================================================================

/**
 * Common metric presets for each data source category.
 */
export const DATA_SOURCE_PRESETS: Record<
  DataSourceCategory,
  Array<{ field: string; label: string; format?: 'number' | 'currency' | 'percent' }>
> = {
  traffic: [
    { field: 'sessions', label: 'Sessions', format: 'number' },
    { field: 'uniqueVisitors', label: 'Unique Visitors', format: 'number' },
    { field: 'newVisitors', label: 'New Visitors', format: 'number' },
    { field: 'bounceRate', label: 'Bounce Rate', format: 'percent' },
    { field: 'pagesPerSession', label: 'Pages/Session', format: 'number' },
    { field: 'avgSessionDuration', label: 'Avg Session Duration', format: 'number' },
  ],
  seo: [
    { field: 'impressions', label: 'Impressions', format: 'number' },
    { field: 'clicks', label: 'Clicks', format: 'number' },
    { field: 'ctr', label: 'CTR', format: 'percent' },
    { field: 'averagePosition', label: 'Avg Position', format: 'number' },
    { field: 'backlinks', label: 'Backlinks', format: 'number' },
    { field: 'domainAuthority', label: 'Domain Authority', format: 'number' },
  ],
  conversions: [
    { field: 'conversionRate', label: 'Conversion Rate', format: 'percent' },
    { field: 'totalConversions', label: 'Total Conversions', format: 'number' },
    { field: 'addToCartRate', label: 'Add to Cart Rate', format: 'percent' },
    { field: 'cartAbandonmentRate', label: 'Cart Abandonment', format: 'percent' },
    { field: 'checkoutCompletionRate', label: 'Checkout Completion', format: 'percent' },
  ],
  revenue: [
    { field: 'grossRevenue', label: 'Gross Revenue', format: 'currency' },
    { field: 'netRevenue', label: 'Net Revenue', format: 'currency' },
    { field: 'transactions', label: 'Transactions', format: 'number' },
    { field: 'aov', label: 'AOV', format: 'currency' },
    { field: 'revenuePerVisitor', label: 'Revenue/Visitor', format: 'currency' },
    { field: 'refundRate', label: 'Refund Rate', format: 'percent' },
  ],
  subscriptions: [
    { field: 'activeSubscribers', label: 'Active Subscribers', format: 'number' },
    { field: 'newSubscribers', label: 'New Subscribers', format: 'number' },
    { field: 'mrr', label: 'MRR', format: 'currency' },
    { field: 'arr', label: 'ARR', format: 'currency' },
    { field: 'retentionRate', label: 'Retention Rate', format: 'percent' },
    { field: 'churnRate.monthly', label: 'Monthly Churn', format: 'percent' },
  ],
  payments: [
    { field: 'successfulPayments', label: 'Successful Payments', format: 'number' },
    { field: 'failedPayments', label: 'Failed Payments', format: 'number' },
    { field: 'failureRate', label: 'Failure Rate', format: 'percent' },
    { field: 'recoveryRate', label: 'Recovery Rate', format: 'percent' },
    { field: 'recoveredRevenue', label: 'Recovered Revenue', format: 'currency' },
    { field: 'atRiskRevenue', label: 'At-Risk Revenue', format: 'currency' },
  ],
  unitEconomics: [
    { field: 'cac', label: 'CAC', format: 'currency' },
    { field: 'ltv', label: 'LTV', format: 'currency' },
    { field: 'ltvCacRatio', label: 'LTV:CAC Ratio', format: 'number' },
    { field: 'cacPaybackPeriod', label: 'CAC Payback', format: 'number' },
    { field: 'arpu', label: 'ARPU', format: 'currency' },
    { field: 'nrr', label: 'NRR', format: 'percent' },
  ],
  demographics: [
    { field: 'geographic.byCountry', label: 'Users by Country', format: 'number' },
    { field: 'device.byType', label: 'Users by Device', format: 'number' },
    { field: 'technology.byBrowser', label: 'Users by Browser', format: 'number' },
  ],
  segmentation: [
    { field: 'byLeadScore', label: 'Lead Score Distribution', format: 'number' },
    { field: 'byLifecycle', label: 'Lifecycle Stage', format: 'number' },
    { field: 'byBehavior', label: 'Behavior Segments', format: 'number' },
  ],
  campaigns: [
    { field: 'summary.sent', label: 'Messages Sent', format: 'number' },
    { field: 'summary.delivered', label: 'Delivered', format: 'number' },
    { field: 'engagement.openRate', label: 'Open Rate', format: 'percent' },
    { field: 'engagement.ctr', label: 'CTR', format: 'percent' },
    { field: 'conversions.revenue', label: 'Revenue', format: 'currency' },
    { field: 'conversions.roi', label: 'ROI', format: 'percent' },
  ],
  predictions: [
    { field: 'revenueForecast.currentValue', label: 'Current Revenue', format: 'currency' },
    { field: 'revenueForecast.forecastedEndValue', label: 'Forecasted Revenue', format: 'currency' },
    { field: 'churnPrediction.summary.totalAtRisk', label: 'At-Risk Customers', format: 'number' },
    { field: 'churnPrediction.summary.revenueAtRisk', label: 'Revenue at Risk', format: 'currency' },
    { field: 'ltvProjection.currentLTV', label: 'Current LTV', format: 'currency' },
    { field: 'ltvProjection.projectedLTV', label: 'Projected LTV', format: 'currency' },
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all widget types.
 */
export function getAllWidgetTypes(): WidgetTypeInfo[] {
  return Object.values(WIDGET_REGISTRY);
}

/**
 * Get widget types by category.
 */
export function getWidgetsByCategory(
  category: WidgetTypeInfo['category']
): WidgetTypeInfo[] {
  return Object.values(WIDGET_REGISTRY).filter((w) => w.category === category);
}

/**
 * Get widget types compatible with a data source.
 */
export function getWidgetsForDataSource(source: DataSourceCategory): WidgetTypeInfo[] {
  return Object.values(WIDGET_REGISTRY).filter((w) =>
    w.compatibleSources.includes(source)
  );
}

/**
 * Get widget type info by type.
 */
export function getWidgetTypeInfo(type: WidgetType): WidgetTypeInfo | undefined {
  return WIDGET_REGISTRY[type];
}

/**
 * Generate a unique widget ID.
 */
export function generateWidgetId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new widget instance with defaults.
 */
export function createWidget(
  type: WidgetType,
  title: string,
  dataBinding: WidgetConfig['dataBinding'],
  position?: Partial<GridPosition>
): Widget {
  const typeInfo = WIDGET_REGISTRY[type];
  if (!typeInfo) {
    throw new Error(`Unknown widget type: ${type}`);
  }

  const now = new Date().toISOString();
  const defaultPos = typeInfo.defaultDimensions;

  return {
    id: generateWidgetId(),
    title,
    config: {
      ...typeInfo.defaultConfig,
      type,
      dataBinding,
    } as WidgetConfig,
    position: {
      lg: {
        x: position?.x ?? 0,
        y: position?.y ?? 0,
        w: position?.w ?? defaultPos.w,
        h: position?.h ?? defaultPos.h,
        minW: defaultPos.minW,
        minH: defaultPos.minH,
      },
    },
    visible: true,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get size preset dimensions.
 */
export function getSizePresetDimensions(size: WidgetSize): { w: number; h: number } {
  const presets: Record<WidgetSize, { w: number; h: number }> = {
    small: { w: 3, h: 2 },
    medium: { w: 4, h: 3 },
    large: { w: 6, h: 4 },
    wide: { w: 8, h: 3 },
    tall: { w: 4, h: 6 },
    full: { w: 12, h: 4 },
  };
  return presets[size];
}

/**
 * Validate widget configuration.
 */
export function validateWidgetConfig(config: WidgetConfig): string[] {
  const errors: string[] = [];

  if (!config.type) {
    errors.push('Widget type is required');
  } else if (!WIDGET_REGISTRY[config.type]) {
    errors.push(`Unknown widget type: ${config.type}`);
  }

  if (!config.dataBinding) {
    errors.push('Data binding is required');
  } else {
    if (!config.dataBinding.source) {
      errors.push('Data source is required');
    }
    if (!config.dataBinding.field) {
      errors.push('Data field is required');
    }
  }

  return errors;
}

// =============================================================================
// DEFAULT TEMPLATES
// =============================================================================

/**
 * Pre-built dashboard templates.
 */
export const DASHBOARD_TEMPLATES = {
  overview: {
    name: 'Overview Dashboard',
    description: 'Key metrics at a glance',
    widgets: [
      {
        type: 'metric-card' as WidgetType,
        title: 'Total Sessions',
        dataBinding: { source: 'traffic' as DataSourceCategory, field: 'sessions' },
        position: { x: 0, y: 0 },
      },
      {
        type: 'metric-card' as WidgetType,
        title: 'Conversion Rate',
        dataBinding: { source: 'conversions' as DataSourceCategory, field: 'conversionRate' },
        position: { x: 3, y: 0 },
      },
      {
        type: 'metric-card' as WidgetType,
        title: 'Revenue',
        dataBinding: { source: 'revenue' as DataSourceCategory, field: 'netRevenue' },
        position: { x: 6, y: 0 },
      },
      {
        type: 'metric-card' as WidgetType,
        title: 'MRR',
        dataBinding: { source: 'subscriptions' as DataSourceCategory, field: 'mrr' },
        position: { x: 9, y: 0 },
      },
      {
        type: 'area-chart' as WidgetType,
        title: 'Revenue Trend',
        dataBinding: { source: 'revenue' as DataSourceCategory, field: 'revenueTrend' },
        position: { x: 0, y: 2, w: 8 },
      },
      {
        type: 'pie-chart' as WidgetType,
        title: 'Traffic Sources',
        dataBinding: { source: 'traffic' as DataSourceCategory, field: 'trafficBySource' },
        position: { x: 8, y: 2, w: 4 },
      },
    ],
  },
  revenue: {
    name: 'Revenue Dashboard',
    description: 'Revenue and subscription metrics',
    widgets: [
      {
        type: 'metric-card' as WidgetType,
        title: 'Gross Revenue',
        dataBinding: { source: 'revenue' as DataSourceCategory, field: 'grossRevenue' },
        position: { x: 0, y: 0 },
      },
      {
        type: 'metric-card' as WidgetType,
        title: 'Net Revenue',
        dataBinding: { source: 'revenue' as DataSourceCategory, field: 'netRevenue' },
        position: { x: 3, y: 0 },
      },
      {
        type: 'metric-card' as WidgetType,
        title: 'AOV',
        dataBinding: { source: 'revenue' as DataSourceCategory, field: 'aov' },
        position: { x: 6, y: 0 },
      },
      {
        type: 'metric-card' as WidgetType,
        title: 'Transactions',
        dataBinding: { source: 'revenue' as DataSourceCategory, field: 'transactions' },
        position: { x: 9, y: 0 },
      },
      {
        type: 'line-chart' as WidgetType,
        title: 'Revenue Trend',
        dataBinding: { source: 'revenue' as DataSourceCategory, field: 'revenueTrend' },
        position: { x: 0, y: 2, w: 12 },
      },
      {
        type: 'bar-chart' as WidgetType,
        title: 'Revenue by Product',
        dataBinding: { source: 'revenue' as DataSourceCategory, field: 'revenueByProduct' },
        position: { x: 0, y: 5, w: 6 },
      },
      {
        type: 'pie-chart' as WidgetType,
        title: 'Revenue by Channel',
        dataBinding: { source: 'revenue' as DataSourceCategory, field: 'revenueByChannel' },
        position: { x: 6, y: 5, w: 6 },
      },
    ],
  },
  marketing: {
    name: 'Marketing Dashboard',
    description: 'Campaign and acquisition metrics',
    widgets: [
      {
        type: 'metric-card' as WidgetType,
        title: 'Campaign ROI',
        dataBinding: { source: 'campaigns' as DataSourceCategory, field: 'conversions.roi' },
        position: { x: 0, y: 0 },
      },
      {
        type: 'metric-card' as WidgetType,
        title: 'Open Rate',
        dataBinding: { source: 'campaigns' as DataSourceCategory, field: 'engagement.openRate' },
        position: { x: 3, y: 0 },
      },
      {
        type: 'metric-card' as WidgetType,
        title: 'CTR',
        dataBinding: { source: 'campaigns' as DataSourceCategory, field: 'engagement.ctr' },
        position: { x: 6, y: 0 },
      },
      {
        type: 'metric-card' as WidgetType,
        title: 'CAC',
        dataBinding: { source: 'unitEconomics' as DataSourceCategory, field: 'cac' },
        position: { x: 9, y: 0 },
      },
      {
        type: 'funnel-chart' as WidgetType,
        title: 'Conversion Funnel',
        dataBinding: { source: 'conversions' as DataSourceCategory, field: 'funnel' },
        position: { x: 0, y: 2, w: 4 },
      },
      {
        type: 'bar-chart' as WidgetType,
        title: 'Traffic by Source',
        dataBinding: { source: 'traffic' as DataSourceCategory, field: 'trafficBySource' },
        position: { x: 4, y: 2, w: 8 },
      },
    ],
  },
};

export type DashboardTemplateKey = keyof typeof DASHBOARD_TEMPLATES;
