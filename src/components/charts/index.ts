/**
 * ECharts-based Chart Components
 */

// Core visualization components
export { AreaTrendChart, type TrendDataPoint } from "./AreaTrendChart";
export {
  BarComparisonChart,
  type BarComparisonDataItem,
} from "./BarComparisonChart";
export {
  PieDistributionChart,
  type PieDataItem,
} from "./PieDistributionChart";

// Advanced visualization components
export { FunnelChart, type FunnelDataItem } from "./FunnelChart";
export { HeatmapChart, type HeatmapDataItem } from "./HeatmapChart";
export { ScatterChart, type ScatterDataItem } from "./ScatterChart";
export { GaugeChart, type GaugeThreshold } from "./GaugeChart";
export {
  SankeyChart,
  type SankeyNode,
  type SankeyLink,
} from "./SankeyChart";
export {
  RadarChart,
  type RadarIndicator,
  type RadarSeriesData,
} from "./RadarChart";

// Interactive features utilities
export {
  getDataZoomOptions,
  getBrushOptions,
  createDrillDownState,
  drillDown,
  drillUp,
  chartEventBus,
  getGridWithDataZoom,
  formatTooltipWithComparison,
  animationPresets,
  chartColors,
  type DataZoomConfig,
  type BrushConfig,
  type DrillDownConfig,
  type DrillDownState,
  type LinkedHighlightConfig,
  type HighlightEvent,
  type EnhancedTooltipConfig,
} from "./InteractiveFeatures";
