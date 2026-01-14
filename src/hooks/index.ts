/**
 * Data fetching hooks for the analytics dashboard.
 * Built on SWR for caching, revalidation, and request deduplication.
 */

// Main hooks
export { useAnalytics, type UseAnalyticsParams, type UseAnalyticsReturn } from './useAnalytics';
export { usePlatformAnalytics, type UsePlatformAnalyticsParams, type UsePlatformAnalyticsReturn } from './usePlatformAnalytics';
export { useHealthCheck, type UseHealthCheckParams, type UseHealthCheckReturn } from './useHealthCheck';
export { useAlerts, type UseAlertsReturn } from './useAlerts';
export { usePredictions, type UsePredictionsReturn } from './usePredictions';
export { useAttribution, type UseAttributionReturn } from './useAttribution';
export { useROI, type UseROIReturn } from './useROI';
export { useABTest, type UseABTestReturn } from './useABTest';
export { useReportBuilder, type UseReportBuilderReturn, type CreateTemplateInput, type UpdateTemplateInput } from './useReportBuilder';

// Shared utilities and types
export {
  // Error utilities
  ApiError,
  isApiError,
  getErrorMessage,
} from './types';
