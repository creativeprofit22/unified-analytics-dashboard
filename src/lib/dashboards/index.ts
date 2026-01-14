/**
 * Custom Dashboards Library
 *
 * Utilities and registry for custom dashboard building.
 */

export {
  WIDGET_REGISTRY,
  WIDGET_CATEGORIES,
  DATA_SOURCE_PRESETS,
  DASHBOARD_TEMPLATES,
  getAllWidgetTypes,
  getWidgetsByCategory,
  getWidgetsForDataSource,
  getWidgetTypeInfo,
  generateWidgetId,
  createWidget,
  getSizePresetDimensions,
  validateWidgetConfig,
  type DashboardTemplateKey,
} from "./widget-registry";
