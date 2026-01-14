/**
 * Analytics Dashboard Types
 * Re-exports all types from module files for convenient importing.
 */

// =============================================================================
// ANALYTICS TYPES (from ./analytics)
// =============================================================================
// Core shared types, traffic, SEO, conversions, revenue, subscriptions,
// payments, unit economics, demographics, segmentation, and campaigns.

export type {
  // Core Shared Types
  TimeRange,
  CustomDateRange,
  ComparisonPeriod,
  ComparisonConfig,
  // User Preferences
  Theme,
  AutoRefreshInterval,
  ExportFormat,
  UserPreferences,
  ChangeType,
  Metric,
  TrendDataPoint,
  RevenueTrendDataPoint,

  // Traffic & Acquisition (GA4)
  TrafficSource,
  CoreWebVitals,
  TrafficMetrics,

  // SEO Metrics
  KeywordRanking,
  SearchQuery,
  TopOrganicPage,
  SEOMetrics,

  // Conversions & Funnel
  SourceConversion,
  MicroConversion,
  FunnelStep,
  TimeToConvert,
  AssistedConversion,
  ConversionMetrics,

  // Revenue & Orders (Stripe)
  ProductRevenue,
  RevenueGrowth,
  RevenueMetrics,

  // Subscriptions & Retention
  ChurnRate,
  BaseCohort,
  CohortWithMonths,
  CohortRetention,
  MRRMovement,
  SubscriptionMetrics,

  // Payments
  RecoveryStatus,
  PaymentRecord,
  RecoveryByAttempt,
  CardsExpiring,
  PaymentMetrics,

  // Unit Economics
  LTVCohort,
  CustomerConcentration,
  UnitEconomicsMetrics,

  // Demographics
  CountryData,
  RegionData,
  CityData,
  GeographicData,
  DeviceType,
  DeviceData,
  TechnologyData,
  UserAttributesData,
  SegmentConversion,
  DemographicsMetrics,

  // Segmentation
  CampaignSegment,
  NicheSegment,
  CohortSegment,
  PlanSegment,
  BehaviorSegmentType,
  BehaviorSegment,
  LeadScoreData,
  LifecycleData,
  CrossSegmentComparison,
  SegmentationMetrics,

  // Campaigns (Email/SMS/WhatsApp)
  CampaignChannel,
  CampaignSummary,
  CampaignEngagement,
  CampaignConversions,
  CampaignNegative,
  ListHealth,
  ChannelMetrics,
  CampaignData,
  CampaignMetrics,

  // Unified Analytics Data
  UnifiedAnalyticsData,

  // Filter Types
  FilterState,
  FilterOptions,
} from "./analytics";

export { DEFAULT_FILTER_STATE, DEFAULT_COMPARISON_CONFIG, DEFAULT_USER_PREFERENCES } from "./analytics";

// =============================================================================
// LEGACY SOCIAL MEDIA TYPES (Backward Compatibility)
// =============================================================================

export type {
  Platform,
  OverviewStats,
  ContentItem,
  ProfileStats,
  PlatformBreakdown,
  AnalyticsData,
} from "./analytics-legacy";

// =============================================================================
// API TYPES
// =============================================================================

export type {
  ApiResponse,
  AnalyticsQueryParams,
  TokenRefreshResponse,
  PlatformConnectionStatus,
  ConnectPlatformRequest,
  PaginatedResponse,
  PaginationParams,
  PlatformAnalyticsData,
  HealthResponse,
} from "./api";

// =============================================================================
// ALERTS & MONITORING TYPES
// =============================================================================

export type {
  // Anomaly Detection
  MetricType,
  AnomalySeverity,
  AnomalyDirection,
  Anomaly,
  // Threshold Alerts
  ThresholdOperator,
  ThresholdStatus,
  ThresholdRule,
  ThresholdAlert,
  // Goals
  GoalStatus,
  Goal,
  // Combined Data
  AlertsData,
  AlertsResponse,
} from "./alerts";

// =============================================================================
// PREDICTIVE ANALYTICS TYPES
// =============================================================================

export type {
  // Revenue Forecasting
  ForecastMetric,
  ForecastPeriod,
  ForecastTrend,
  ForecastDataPoint,
  RevenueForecast,
  // Churn Prediction
  ChurnRiskLevel,
  ChurnRiskFactor,
  AtRiskCustomer,
  ChurnPrediction,
  // LTV Projection
  LTVImpactDirection,
  LTVSegment,
  LTVProjectionPoint,
  LTVFactor,
  LTVProjection,
  // Combined Data
  PredictionsData,
  PredictionsResponse,
} from "./predictions";

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export type {
  AnalyticsResponse,
  UnifiedAnalyticsResponse,
  PlatformAnalyticsResponse,
  TrafficResponse,
  SEOResponse,
  ConversionResponse,
  RevenueResponse,
  SubscriptionResponse,
  PaymentResponse,
  UnitEconomicsResponse,
  DemographicsResponse,
  SegmentationResponse,
  CampaignResponse,
} from "./api";

// =============================================================================
// BENCHMARK TYPES
// =============================================================================

export type {
  // Categories & Metrics
  BenchmarkCategory,
  BenchmarkMetricId,
  BenchmarkMetric,
  // Industry Data
  BenchmarkPercentiles,
  IndustryBenchmark,
  // Performance Tiers
  PerformanceTier,
  PerformanceTierConfig,
  // Comparison Results
  BenchmarkComparison,
  UserMetrics,
  // API Types
  BenchmarkRequest,
  BenchmarkResponse,
  BenchmarksData,
} from "./benchmarks";

export {
  BENCHMARK_CATEGORY_LABELS,
  PERFORMANCE_TIERS,
  isBenchmarkCategory,
  isBenchmarkMetricId,
} from "./benchmarks";

// =============================================================================
// DATA EXPORT TYPES
// =============================================================================

export type {
  // Export Formats
  ExportFileFormat,
  ExportFormatInfo,
  // Data Sections
  ExportSection,
  ExportSectionInfo,
  // Export Configuration
  ExportConfig,
  // Scheduled Reports
  ReportFrequency,
  DayOfWeek,
  DeliveryMethod,
  EmailDeliveryConfig,
  WebhookDeliveryConfig,
  StorageDeliveryConfig,
  DeliveryConfig,
  ReportSchedule,
  ScheduledReportStatus,
  ScheduledReport,
  // Report History
  ReportRunStatus,
  ReportRun,
  // API Types
  ExportRequest,
  ExportResult,
  ExportResponse,
  CreateScheduledReportRequest,
  UpdateScheduledReportRequest,
  ScheduledReportsResponse,
  ReportHistoryResponse,
  // Preview
  ExportPreview,
} from "./export";

export { DEFAULT_EXPORT_CONFIG } from "./export";

// =============================================================================
// CUSTOM DASHBOARDS TYPES
// =============================================================================

export type {
  // Widget Types
  WidgetType,
  WidgetSize,
  DataSourceCategory,
  GridPosition,
  ResponsiveGridPosition,
  // Widget Configuration
  WidgetDataBinding,
  WidgetStyle,
  ChartOptions,
  MetricCardOptions,
  TableOptions,
  WidgetConfig,
  // Widget Instance
  Widget,
  // Dashboard Layout
  DashboardLayout,
  // Saved Dashboard
  DashboardVisibility,
  DashboardMeta,
  SavedDashboard,
  DashboardInput,
  // Widget Registry Types
  WidgetTypeInfo,
  // API Types
  DashboardListResponse,
  DashboardResponse,
  DashboardMutationResponse,
  DashboardErrorResponse,
} from "./custom-dashboards";

export { DEFAULT_DASHBOARD_LAYOUT, WIDGET_SIZE_PRESETS } from "./custom-dashboards";

// =============================================================================
// ATTRIBUTION & MULTI-TOUCH ANALYTICS TYPES
// =============================================================================

export type {
  // Attribution Models
  AttributionModel,
  Channel,
  // Touchpoints & Journeys
  Touchpoint,
  ConversionJourney,
  // Attribution Results
  ChannelAttribution,
  ModelResult,
  // Path Analysis
  TouchpointPath,
  // Combined Data
  AttributionSummary,
  AttributionData,
  AttributionResponse,
} from "./attribution";

// =============================================================================
// CHANNEL ROI CALCULATOR TYPES
// =============================================================================

export type {
  // Cost Inputs
  ChannelCost,
  // ROI Metrics
  ChannelROIMetrics,
  // Summary
  ROISummary,
  // Trend Data
  ROITrendPoint,
  // Combined Data
  ROIData,
  ROIResponse,
} from "./roi";
