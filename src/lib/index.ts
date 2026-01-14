// API Client
export { analyticsClient, ApiError } from './api-client';

// Fetchers for SWR/React Query
export { analyticsFetcher, platformFetcher, genericFetcher } from './fetchers';

// Time utilities
export { parseTimeRange, getTimeRangeDays } from './time';

// Utility functions
export {
  cn,
  formatNumber,
  formatChange,
  formatDate,
  getRelativeTime,
  getChangeColorClass,
  clamp,
  debounce,
  platformNames,
  platformColors,
} from './utils';

// Alerts & Monitoring
export { detectAnomalies, evaluateThreshold, evaluateGoal } from './alerts';

// Re-export types for convenience
export type {
  ApiResponse,
  AnalyticsData,
  AnalyticsQueryParams,
  Platform,
  TimeRange,
  HealthResponse,
} from './api-client';

// Alert types
export type {
  Anomaly,
  AnomalySeverity,
  AnomalyDirection,
  MetricType,
  ThresholdRule,
  ThresholdAlert,
  ThresholdStatus,
  ThresholdOperator,
  Goal,
  GoalStatus,
  AlertsData,
  AlertsResponse,
} from './alerts';
