/**
 * Custom Dashboards Types
 *
 * Type definitions for the custom dashboard builder including:
 * - Widget types and configurations
 * - Dashboard layouts and grid positioning
 * - Saved dashboard structures
 */

// =============================================================================
// WIDGET TYPES
// =============================================================================

/**
 * Available widget visualization types.
 */
export type WidgetType =
  | 'metric-card'
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'area-chart'
  | 'funnel-chart'
  | 'gauge-chart'
  | 'table'
  | 'heatmap'
  | 'scatter-chart'
  | 'radar-chart'
  | 'sankey-chart';

/**
 * Widget size presets for quick sizing.
 */
export type WidgetSize = 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'full';

/**
 * Data source categories that widgets can pull from.
 */
export type DataSourceCategory =
  | 'traffic'
  | 'seo'
  | 'conversions'
  | 'revenue'
  | 'subscriptions'
  | 'payments'
  | 'unitEconomics'
  | 'demographics'
  | 'segmentation'
  | 'campaigns'
  | 'predictions';

/**
 * Grid position for widget placement.
 */
export interface GridPosition {
  /** X position in grid units (0-based) */
  x: number;
  /** Y position in grid units (0-based) */
  y: number;
  /** Width in grid units */
  w: number;
  /** Height in grid units */
  h: number;
  /** Minimum width constraint */
  minW?: number;
  /** Minimum height constraint */
  minH?: number;
  /** Maximum width constraint */
  maxW?: number;
  /** Maximum height constraint */
  maxH?: number;
  /** Whether widget is static (non-draggable) */
  static?: boolean;
}

/**
 * Responsive grid position overrides for different breakpoints.
 */
export interface ResponsiveGridPosition {
  /** Large screens (1200px+) */
  lg: GridPosition;
  /** Medium screens (996px - 1199px) */
  md?: GridPosition;
  /** Small screens (768px - 995px) */
  sm?: GridPosition;
  /** Extra small screens (<768px) */
  xs?: GridPosition;
}

// =============================================================================
// WIDGET CONFIGURATION
// =============================================================================

/**
 * Data binding configuration for a widget.
 */
export interface WidgetDataBinding {
  /** Data source category */
  source: DataSourceCategory;
  /** Specific metric or field path within the source */
  field: string;
  /** Optional transformation to apply */
  transform?: 'sum' | 'average' | 'count' | 'min' | 'max' | 'latest';
  /** Optional filter conditions */
  filters?: Record<string, string | number | boolean>;
}

/**
 * Visual styling options for widgets.
 */
export interface WidgetStyle {
  /** Primary color for the widget */
  color?: string;
  /** Background color override */
  backgroundColor?: string;
  /** Border radius */
  borderRadius?: string;
  /** Whether to show a border */
  showBorder?: boolean;
  /** Custom CSS class names */
  className?: string;
}

/**
 * Chart-specific configuration options.
 */
export interface ChartOptions {
  /** Show/hide legend */
  showLegend?: boolean;
  /** Legend position */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Show/hide grid lines */
  showGrid?: boolean;
  /** Show/hide data labels */
  showDataLabels?: boolean;
  /** Enable animations */
  animate?: boolean;
  /** Smooth line curves (for line/area charts) */
  smooth?: boolean;
  /** Stacked mode (for bar/area charts) */
  stacked?: boolean;
  /** Inner radius for pie/donut charts (0-1) */
  innerRadius?: number;
  /** Chart orientation */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Metric card specific options.
 */
export interface MetricCardOptions {
  /** Display format */
  format: 'number' | 'currency' | 'percent';
  /** Show comparison with previous period */
  showComparison?: boolean;
  /** Show trend indicator */
  showTrend?: boolean;
  /** Prefix text (e.g., "$") */
  prefix?: string;
  /** Suffix text (e.g., "%") */
  suffix?: string;
}

/**
 * Table widget specific options.
 */
export interface TableOptions {
  /** Column definitions */
  columns: Array<{
    key: string;
    label: string;
    format?: 'number' | 'currency' | 'percent' | 'text' | 'date';
    sortable?: boolean;
    width?: string | number;
  }>;
  /** Enable pagination */
  paginate?: boolean;
  /** Rows per page */
  pageSize?: number;
  /** Enable sorting */
  sortable?: boolean;
  /** Enable row selection */
  selectable?: boolean;
}

/**
 * Complete widget configuration.
 */
export interface WidgetConfig {
  /** Widget type determines visualization */
  type: WidgetType;
  /** Data binding configuration */
  dataBinding: WidgetDataBinding;
  /** Chart-specific options (for chart widgets) */
  chartOptions?: ChartOptions;
  /** Metric card options (for metric-card type) */
  metricOptions?: MetricCardOptions;
  /** Table options (for table type) */
  tableOptions?: TableOptions;
  /** Visual styling */
  style?: WidgetStyle;
  /** Auto-refresh interval in seconds (0 = disabled) */
  refreshInterval?: number;
}

// =============================================================================
// WIDGET INSTANCE
// =============================================================================

/**
 * A widget instance placed on a dashboard.
 */
export interface Widget {
  /** Unique identifier for this widget instance */
  id: string;
  /** Display title */
  title: string;
  /** Optional description/subtitle */
  description?: string;
  /** Widget configuration */
  config: WidgetConfig;
  /** Grid position (responsive) */
  position: ResponsiveGridPosition;
  /** Whether the widget is currently visible */
  visible: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Last modified timestamp */
  updatedAt: string;
}

// =============================================================================
// DASHBOARD LAYOUT
// =============================================================================

/**
 * Dashboard layout configuration.
 */
export interface DashboardLayout {
  /** Number of columns in the grid */
  columns: number;
  /** Row height in pixels */
  rowHeight: number;
  /** Gap between widgets in pixels */
  gap: number;
  /** Container padding in pixels */
  padding: number;
  /** Responsive breakpoints */
  breakpoints: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
  /** Columns per breakpoint */
  columnsPerBreakpoint: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
  /** Allow widgets to overlap */
  allowOverlap?: boolean;
  /** Compact mode (auto-compact widgets) */
  compactType?: 'vertical' | 'horizontal' | null;
}

/**
 * Default dashboard layout configuration.
 */
export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  columns: 12,
  rowHeight: 80,
  gap: 16,
  padding: 16,
  breakpoints: {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
  },
  columnsPerBreakpoint: {
    lg: 12,
    md: 10,
    sm: 6,
    xs: 4,
  },
  compactType: 'vertical',
};

// =============================================================================
// SAVED DASHBOARD
// =============================================================================

/**
 * Dashboard visibility/sharing options.
 */
export type DashboardVisibility = 'private' | 'team' | 'public';

/**
 * Dashboard metadata for listings.
 */
export interface DashboardMeta {
  /** Unique identifier */
  id: string;
  /** Dashboard name */
  name: string;
  /** Optional description */
  description?: string;
  /** Owner user ID */
  ownerId: string;
  /** Visibility setting */
  visibility: DashboardVisibility;
  /** Whether this is a default/template dashboard */
  isTemplate: boolean;
  /** Preview thumbnail URL */
  thumbnailUrl?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last modified timestamp */
  updatedAt: string;
  /** Number of widgets */
  widgetCount: number;
}

/**
 * Complete saved dashboard structure.
 */
export interface SavedDashboard extends DashboardMeta {
  /** Widgets on this dashboard */
  widgets: Widget[];
  /** Layout configuration */
  layout: DashboardLayout;
  /** Default time range for the dashboard */
  defaultTimeRange?: '7d' | '30d' | '90d' | '12m' | 'ytd';
  /** Tags for organization */
  tags?: string[];
  /** Version number for optimistic updates */
  version: number;
}

/**
 * Dashboard creation/update request.
 */
export interface DashboardInput {
  name: string;
  description?: string;
  visibility?: DashboardVisibility;
  widgets: Widget[];
  layout?: Partial<DashboardLayout>;
  defaultTimeRange?: '7d' | '30d' | '90d' | '12m' | 'ytd';
  tags?: string[];
}

// =============================================================================
// WIDGET REGISTRY TYPES
// =============================================================================

/**
 * Widget type metadata for the registry.
 */
export interface WidgetTypeInfo {
  /** Widget type identifier */
  type: WidgetType;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Icon identifier */
  icon: string;
  /** Category for grouping in picker */
  category: 'metrics' | 'charts' | 'tables' | 'advanced';
  /** Compatible data source categories */
  compatibleSources: DataSourceCategory[];
  /** Default size preset */
  defaultSize: WidgetSize;
  /** Default grid position dimensions */
  defaultDimensions: Pick<GridPosition, 'w' | 'h' | 'minW' | 'minH'>;
  /** Default configuration options */
  defaultConfig: Partial<WidgetConfig>;
}

/**
 * Size preset dimensions mapping.
 */
export const WIDGET_SIZE_PRESETS: Record<WidgetSize, Pick<GridPosition, 'w' | 'h'>> = {
  small: { w: 3, h: 2 },
  medium: { w: 4, h: 3 },
  large: { w: 6, h: 4 },
  wide: { w: 8, h: 3 },
  tall: { w: 4, h: 6 },
  full: { w: 12, h: 4 },
};

// =============================================================================
// API TYPES
// =============================================================================

/**
 * Dashboard list response.
 */
export interface DashboardListResponse {
  success: boolean;
  data: DashboardMeta[];
  total: number;
  page: number;
  pageSize: number;
  timestamp: string;
}

/**
 * Single dashboard response.
 */
export interface DashboardResponse {
  success: boolean;
  data: SavedDashboard;
  timestamp: string;
}

/**
 * Dashboard mutation response.
 */
export interface DashboardMutationResponse {
  success: boolean;
  data: SavedDashboard;
  message: string;
  timestamp: string;
}

/**
 * Dashboard error response.
 */
export interface DashboardErrorResponse {
  success: false;
  error: string;
  code?: string;
  timestamp: string;
}
