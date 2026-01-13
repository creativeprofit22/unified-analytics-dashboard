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
