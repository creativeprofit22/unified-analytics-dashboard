/**
 * Unified Analytics Types
 *
 * Comprehensive type system for the analytics dashboard covering:
 * 1. Traffic & Acquisition (GA4)
 * 2. SEO
 * 3. Conversions & Funnel
 * 4. Revenue & Orders (Stripe)
 * 5. Subscriptions & Retention
 * 6. Payments
 * 7. Unit Economics
 * 8. Demographics
 * 9. Segmentation
 * 10. Campaigns (Email/SMS)
 *
 * Plus legacy social media platform types for backward compatibility.
 */

// =============================================================================
// CORE SHARED TYPES
// =============================================================================

/**
 * Predefined time ranges for analytics filtering.
 */
export type TimeRange = '7d' | '30d' | '90d' | '12m' | 'ytd' | 'custom';

/**
 * Custom date range for when TimeRange is 'custom'.
 */
export interface CustomDateRange {
  start: Date;
  end: Date;
}

/**
 * Comparison period types for period-over-period analysis.
 */
export type ComparisonPeriod = 'previous' | 'year_ago' | 'custom' | 'none';

/**
 * Comparison configuration for the dashboard.
 */
export interface ComparisonConfig {
  /** Whether comparison mode is enabled */
  enabled: boolean;
  /** The comparison period type */
  period: ComparisonPeriod;
  /** Custom date range for the current period (used when period is 'custom') */
  currentRange?: CustomDateRange;
  /** Custom date range for the comparison period (used when period is 'custom') */
  comparisonRange?: CustomDateRange;
}

/**
 * Default comparison configuration (disabled).
 */
export const DEFAULT_COMPARISON_CONFIG: ComparisonConfig = {
  enabled: false,
  period: 'previous',
};

/**
 * Direction of metric change between periods.
 */
export type ChangeType = 'increase' | 'decrease' | 'stable';

/**
 * Core metric with current value, previous period comparison, and change calculation.
 */
export interface Metric {
  /** Current period value */
  current: number;
  /** Previous period value for comparison */
  previous: number;
  /** Percentage change between periods (e.g., 15.5 = 15.5% increase) */
  change: number;
  /** Direction of the change */
  changeType: ChangeType;
}

/**
 * Single data point for time-series trend charts.
 */
export interface TrendDataPoint {
  /** ISO 8601 date string (e.g., "2026-01-12") */
  date: string;
  /** Metric value for this date */
  value: number;
}

/**
 * Revenue trend data point with gross and net values.
 */
export interface RevenueTrendDataPoint {
  date: string;
  gross: number;
  net: number;
}

// =============================================================================
// 1. TRAFFIC & ACQUISITION METRICS (GA4)
// =============================================================================

/**
 * Traffic sources for acquisition breakdown.
 */
export type TrafficSource = 'organic' | 'paid' | 'direct' | 'referral' | 'social' | 'email';

/**
 * Core Web Vitals metrics.
 */
export interface CoreWebVitals {
  /** Largest Contentful Paint in seconds */
  lcp: number;
  /** First Input Delay in milliseconds */
  fid: number;
  /** Cumulative Layout Shift score */
  cls: number;
}

/**
 * Traffic and acquisition metrics from GA4.
 */
export interface TrafficMetrics {
  sessions: number;
  uniqueVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  bounceRate: number;
  pagesPerSession: number;
  /** Average session duration in seconds */
  avgSessionDuration: number;
  trafficBySource: Partial<Record<TrafficSource, number>>;
  trafficByMedium: Record<string, number>;
  trafficByCampaign: Array<{
    campaign: string;
    sessions: number;
    conversions: number;
  }>;
  topLandingPages: Array<{
    path: string;
    sessions: number;
    bounceRate: number;
  }>;
  topExitPages: Array<{
    path: string;
    exits: number;
    exitRate: number;
  }>;
  coreWebVitals: CoreWebVitals;
}

// =============================================================================
// 2. SEO METRICS
// =============================================================================

/**
 * Keyword ranking data.
 */
export interface KeywordRanking {
  keyword: string;
  position: number;
  previousPosition: number;
  change: number;
  volume: number;
  url: string;
}

/**
 * Search query performance data.
 */
export interface SearchQuery {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

/**
 * Top page organic performance.
 */
export interface TopOrganicPage {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/**
 * SEO metrics from Search Console and third-party tools.
 */
export interface SEOMetrics {
  keywordRankings: KeywordRanking[];
  visibilityScore: number;
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
  backlinks: number;
  referringDomains: number;
  domainAuthority: number;
  indexedPages: number;
  topQueries: SearchQuery[];
  topPages: TopOrganicPage[];
}

// =============================================================================
// 3. CONVERSIONS & FUNNEL METRICS
// =============================================================================

/**
 * Conversion by traffic source.
 */
export interface SourceConversion {
  visitors: number;
  conversions: number;
  rate: number;
}

/**
 * Micro-conversion event.
 */
export interface MicroConversion {
  name: string;
  count: number;
  rate: number;
}

/**
 * Funnel step data.
 */
export interface FunnelStep {
  step: string;
  users: number;
  dropOff: number;
  dropOffRate: number;
}

/**
 * Time to convert distribution.
 */
export interface TimeToConvert {
  /** Median time to convert in days */
  median: number;
  /** Distribution buckets (e.g., "same day", "1-3 days") mapped to percentages */
  distribution: Record<string, number>;
}

/**
 * Assisted conversion by channel.
 */
export interface AssistedConversion {
  channel: string;
  assisted: number;
  lastClick: number;
  ratio: number;
}

/**
 * Conversion and funnel metrics.
 */
export interface ConversionMetrics {
  conversionRate: number;
  totalConversions: number;
  conversionsBySource: Record<string, SourceConversion>;
  microConversions: MicroConversion[];
  addToCartRate: number;
  cartAbandonmentRate: number;
  checkoutAbandonmentRate: number;
  checkoutCompletionRate: number;
  funnel: FunnelStep[];
  timeToConvert: TimeToConvert;
  assistedConversions: AssistedConversion[];
}

// =============================================================================
// 4. REVENUE & ORDERS METRICS (Stripe)
// =============================================================================

/**
 * Revenue by product breakdown.
 */
export interface ProductRevenue {
  productId: string;
  productName: string;
  revenue: number;
  units: number;
}

/**
 * Revenue growth data.
 */
export interface RevenueGrowth {
  value: number;
  period: 'day' | 'week' | 'month';
}

/**
 * Revenue and order metrics.
 */
export interface RevenueMetrics {
  grossRevenue: number;
  netRevenue: number;
  transactions: number;
  aov: number; // Average Order Value
  medianOrderValue: number;
  unitsPerOrder: number;
  revenuePerVisitor: number;
  revenueByProduct: ProductRevenue[];
  revenueByCategory: Record<string, number>;
  revenueByChannel: Record<string, number>;
  refundAmount: number;
  refundRate: number;
  returnRate: number;
  discountUsageRate: number;
  avgDiscountValue: number;
  revenueGrowth: RevenueGrowth;
  revenueTrend: RevenueTrendDataPoint[];
}

// =============================================================================
// 5. SUBSCRIPTIONS & RETENTION METRICS
// =============================================================================

/**
 * Churn rate data.
 */
export interface ChurnRate {
  monthly: number;
  annual: number;
}

/**
 * Base cohort interface for time-based cohort data.
 * Cohorts are typically identified by month (e.g., "2025-10").
 */
export interface BaseCohort {
  /** Cohort identifier, typically YYYY-MM format */
  cohort: string;
}

/**
 * Cohort with monthly progression data (retention percentages or cumulative values).
 * Extends BaseCohort with a months array for tracking values over time.
 */
export interface CohortWithMonths extends BaseCohort {
  /** Monthly values (e.g., retention percentages [100, 92, 85, ...] or cumulative LTV) */
  months: number[];
}

/**
 * Cohort retention data.
 * @see CohortWithMonths
 */
export type CohortRetention = CohortWithMonths;

/**
 * MRR movement breakdown.
 */
export interface MRRMovement {
  new: number;
  expansion: number;
  contraction: number;
  churned: number;
  net: number;
}

/**
 * Subscription and retention metrics.
 */
export interface SubscriptionMetrics {
  activeSubscribers: number;
  newSubscribers: number;
  cancelledSubscribers: number;
  churnRate: ChurnRate;
  retentionRate: number;
  retentionByCohort: CohortRetention[];
  mrr: number;
  arr: number;
  mrrMovement: MRRMovement;
  reactivations: number;
  reactivationRate: number;
  cancellationReasons: Record<string, number>;
  trialToPaidRate: number;
  /** Average subscription length in months */
  avgSubscriptionLength: number;
  subscriberLtv: number;
  subscribersByPlan: Record<string, number>;
}

// =============================================================================
// 6. PAYMENTS METRICS
// =============================================================================

/**
 * Recovery rates by dunning attempt (attempt1 through attempt4).
 *
 * Each property represents the percentage of failed payments recovered
 * at that dunning attempt. Most payment processors limit retry attempts
 * to 4, hence the fixed structure rather than a dynamic array.
 *
 * Example: { attempt1: 45, attempt2: 28, attempt3: 12, attempt4: 4 }
 * means 45% recovered on first retry, 28% on second, etc.
 */
export interface RecoveryByAttempt {
  /** Recovery rate (%) on first dunning attempt */
  attempt1: number;
  /** Recovery rate (%) on second dunning attempt */
  attempt2: number;
  /** Recovery rate (%) on third dunning attempt */
  attempt3: number;
  /** Recovery rate (%) on fourth dunning attempt */
  attempt4: number;
}

/**
 * Cards expiring soon breakdown.
 */
export interface CardsExpiring {
  next30Days: number;
  next60Days: number;
  next90Days: number;
}

/**
 * Payment processing metrics.
 */
export interface PaymentMetrics {
  successfulPayments: number;
  failedPayments: number;
  failureRate: number;
  failureByReason: Record<string, number>;
  recoveryRate: number;
  dunningSuccessRate: number;
  recoveryByAttempt: RecoveryByAttempt;
  /** Average time to recover failed payment in days */
  avgTimeToRecovery: number;
  involuntaryChurn: number;
  involuntaryChurnRate: number;
  paymentMethodDistribution: Record<string, number>;
  failureRateByMethod: Record<string, number>;
  atRiskRevenue: number;
  recoveredRevenue: number;
  cardsExpiringSoon: CardsExpiring;
}

// =============================================================================
// 7. UNIT ECONOMICS METRICS
// =============================================================================

/**
 * LTV by cohort data.
 * Uses the same structure as CohortRetention - months array contains cumulative LTV values.
 * @see CohortWithMonths
 */
export type LTVCohort = CohortWithMonths;

/**
 * Customer concentration data.
 */
export interface CustomerConcentration {
  top10Percent: number;
  top20Percent: number;
}

/**
 * Unit economics metrics.
 */
export interface UnitEconomicsMetrics {
  cac: number;
  cacByChannel: Record<string, number>;
  /** CAC payback period in months */
  cacPaybackPeriod: number;
  ltv: number;
  ltvByCohort: LTVCohort[];
  ltvByChannel: Record<string, number>;
  ltvCacRatio: number;
  ltvCacByChannel: Record<string, number>;
  grossMargin: number;
  grossMarginPerCustomer: number;
  arpu: number;
  arppu: number;
  arpuGrowthRate: number;
  contributionMargin: number;
  nrr: number; // Net Revenue Retention
  grr: number; // Gross Revenue Retention
  customerConcentration: CustomerConcentration;
}

// =============================================================================
// 8. DEMOGRAPHICS METRICS
// =============================================================================

/**
 * Country breakdown data.
 */
export interface CountryData {
  country: string;
  countryCode: string;
  users: number;
  sessions: number;
  conversionRate: number;
}

/**
 * Region breakdown data.
 */
export interface RegionData {
  region: string;
  country: string;
  users: number;
}

/**
 * City breakdown data.
 */
export interface CityData {
  city: string;
  country: string;
  users: number;
}

/**
 * Geographic breakdown.
 */
export interface GeographicData {
  byCountry: CountryData[];
  byRegion: RegionData[];
  byCity: CityData[];
}

/**
 * Device type distribution.
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

/**
 * Device breakdown data.
 */
export interface DeviceData {
  byType: Record<DeviceType, number>;
  byModel: Array<{ model: string; users: number }>;
  byResolution: Array<{ resolution: string; users: number }>;
}

/**
 * Technology breakdown data.
 */
export interface TechnologyData {
  byBrowser: Record<string, number>;
  byOS: Record<string, number>;
  byLanguage: Array<{ language: string; users: number }>;
}

/**
 * User attributes data (optional, requires consent).
 */
export interface UserAttributesData {
  byAge: Record<string, number>;
  byGender: Record<string, number>;
  byInterest: Array<{ interest: string; users: number }>;
}

/**
 * Conversion by segment data.
 */
export interface SegmentConversion {
  segment: string;
  segmentValue: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
}

/**
 * Demographics metrics.
 */
export interface DemographicsMetrics {
  geographic: GeographicData;
  device: DeviceData;
  technology: TechnologyData;
  userAttributes: UserAttributesData;
  conversionsBySegment: SegmentConversion[];
}

// =============================================================================
// 9. SEGMENTATION METRICS
// =============================================================================

/**
 * Campaign segment data.
 */
export interface CampaignSegment {
  campaign: string;
  source: string;
  medium: string;
  users: number;
  conversions: number;
  revenue: number;
  cac: number;
  roi: number;
}

/**
 * Niche/vertical segment data.
 */
export interface NicheSegment {
  niche: string;
  users: number;
  conversionRate: number;
  avgLtv: number;
  churnRate: number;
}

/**
 * Cohort segment data.
 * Extends BaseCohort with segmentation-specific metrics.
 */
export interface CohortSegment extends BaseCohort {
  users: number;
  /** Retention percentages by month [100, 85, 72, 65, ...] */
  retentionCurve: number[];
  /** Cumulative LTV by month */
  cumulativeLtv: number[];
}

/**
 * Plan/tier segment data.
 */
export interface PlanSegment {
  plan: string;
  users: number;
  mrr: number;
  churnRate: number;
  upgradeRate: number;
  downgradeRate: number;
}

/**
 * Behavioral segment types.
 */
export type BehaviorSegmentType = 'power' | 'active' | 'casual' | 'dormant' | 'at_risk';

/**
 * Behavioral segment data.
 */
export interface BehaviorSegment {
  segment: BehaviorSegmentType;
  users: number;
  percentage: number;
  avgRevenue: number;
}

/**
 * Lead score distribution.
 */
export interface LeadScoreData {
  hot: number;
  warm: number;
  cold: number;
}

/**
 * Lifecycle stage distribution.
 */
export interface LifecycleData {
  visitor: number;
  lead: number;
  trial: number;
  customer: number;
  churned: number;
  reactivated: number;
}

/**
 * Reference to a segment for cross-segment comparisons.
 */
export interface SegmentRef {
  type: string;
  value: string;
}

/**
 * Cross-segment comparison data.
 */
export interface CrossSegmentComparison {
  segmentA: SegmentRef;
  segmentB: SegmentRef;
  metric: string;
  valueA: number;
  valueB: number;
  difference: number;
}

/**
 * Segmentation metrics.
 */
export interface SegmentationMetrics {
  byCampaign: CampaignSegment[];
  byNiche: NicheSegment[];
  byCohort: CohortSegment[];
  byPlan: PlanSegment[];
  byBehavior: BehaviorSegment[];
  byLeadScore: LeadScoreData;
  byLifecycle: LifecycleData;
  crossSegment: CrossSegmentComparison[];
}

// =============================================================================
// 10. CAMPAIGN METRICS (Email/SMS/WhatsApp)
// =============================================================================

/**
 * Campaign channel types.
 */
export type CampaignChannel = 'email' | 'sms' | 'whatsapp';

/**
 * Campaign summary metrics.
 */
export interface CampaignSummary {
  sent: number;
  delivered: number;
  deliveryRate: number;
  bounced: number;
  bounceRate: number;
}

/**
 * Campaign engagement metrics.
 */
export interface CampaignEngagement {
  opens: number;
  openRate: number;
  clicks: number;
  ctr: number;
  ctor: number; // Click-to-Open Rate
  replies: number;
  replyRate: number;
}

/**
 * Campaign conversion metrics.
 */
export interface CampaignConversions {
  count: number;
  rate: number;
  revenue: number;
  revenuePerMessage: number;
  revenuePerClick: number;
  roi: number;
}

/**
 * Campaign negative metrics.
 */
export interface CampaignNegative {
  unsubscribes: number;
  unsubscribeRate: number;
  spamComplaints: number;
  spamRate: number;
}

/**
 * List health metrics.
 */
export interface ListHealth {
  totalSubscribers: number;
  newSubscribers: number;
  activeSubscribers: number;
  growthRate: number;
}

/**
 * Channel-specific metrics.
 */
export interface ChannelMetrics {
  sent: number;
  delivered: number;
  deliveryRate: number;
  engaged: number;
  engagementRate: number;
  conversions: number;
  revenue: number;
}

/**
 * Individual campaign data.
 */
export interface CampaignData {
  id: string;
  name: string;
  channel: CampaignChannel;
  sentAt: string;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  conversions: number;
  revenue: number;
  unsubscribes: number;
}

/**
 * Campaign metrics (Email/SMS/WhatsApp).
 */
export interface CampaignMetrics {
  summary: CampaignSummary;
  engagement: CampaignEngagement;
  conversions: CampaignConversions;
  negative: CampaignNegative;
  listHealth: ListHealth;
  byChannel: Record<CampaignChannel, ChannelMetrics>;
  byCampaign: CampaignData[];
}

// =============================================================================
// FILTER TYPES
// =============================================================================

/**
 * Active filter selections for analytics data.
 */
export interface FilterState {
  /** Selected traffic sources (empty = all) */
  sources: TrafficSource[];
  /** Selected campaign channels (empty = all) */
  channels: CampaignChannel[];
  /** Selected campaign names (empty = all) */
  campaigns: string[];
}

/**
 * Available filter options derived from analytics data.
 */
export interface FilterOptions {
  /** Available traffic sources in current data */
  sources: TrafficSource[];
  /** Available campaign channels in current data */
  channels: CampaignChannel[];
  /** Available campaign names in current data */
  campaigns: string[];
}

/**
 * Default empty filter state (shows all data).
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  sources: [],
  channels: [],
  campaigns: [],
};

// =============================================================================
// UNIFIED ANALYTICS DATA
// =============================================================================

/**
 * Complete unified analytics data combining all metric categories.
 * Each category is optional to support incremental loading and partial data.
 */
export interface UnifiedAnalyticsData {
  /** Traffic & Acquisition (GA4) */
  traffic?: TrafficMetrics;
  /** SEO metrics (Search Console, Ahrefs, etc.) */
  seo?: SEOMetrics;
  /** Conversions & Funnel */
  conversions?: ConversionMetrics;
  /** Revenue & Orders (Stripe) */
  revenue?: RevenueMetrics;
  /** Subscriptions & Retention */
  subscriptions?: SubscriptionMetrics;
  /** Payment processing metrics */
  payments?: PaymentMetrics;
  /** Unit Economics */
  unitEconomics?: UnitEconomicsMetrics;
  /** Demographics */
  demographics?: DemographicsMetrics;
  /** Segmentation */
  segmentation?: SegmentationMetrics;
  /** Campaigns (Email/SMS/WhatsApp) */
  campaigns?: CampaignMetrics;
  /** Time range for the data */
  timeRange?: TimeRange;
  /** ISO timestamp when data was fetched */
  fetchedAt?: string;
}

// =============================================================================
// LEGACY SOCIAL MEDIA TYPES
// =============================================================================
// Moved to ./analytics-legacy.ts for better code organization.
// Re-exported from ./index.ts for backward compatibility.
