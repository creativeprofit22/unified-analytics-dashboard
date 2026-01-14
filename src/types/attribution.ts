/**
 * Attribution & Multi-Touch Analytics Types
 *
 * Type definitions for marketing attribution analysis, including:
 * 1. Attribution Models - First-touch, last-touch, linear, time-decay
 * 2. Conversion Journeys - Customer touchpoint sequences
 * 3. Channel Attribution - Revenue and conversion credit by channel
 * 4. Path Analysis - Touchpoint flow visualization data (Sankey)
 */

// =============================================================================
// 1. CORE ATTRIBUTION TYPES
// =============================================================================

/**
 * Supported attribution models for credit assignment.
 * - first-touch: 100% credit to the first interaction
 * - last-touch: 100% credit to the final interaction before conversion
 * - linear: Equal credit distributed across all touchpoints
 * - time-decay: Exponential decay with recent touchpoints weighted higher
 */
export type AttributionModel = "first-touch" | "last-touch" | "linear" | "time-decay";

/**
 * Marketing channels for attribution tracking.
 * Represents the source of customer acquisition touchpoints.
 */
export type Channel =
  | "email"
  | "paid-search"
  | "organic-search"
  | "social"
  | "direct"
  | "referral"
  | "display"
  | "affiliate";

// =============================================================================
// 2. TOUCHPOINT & JOURNEY TYPES
// =============================================================================

/**
 * A single touchpoint in a customer's journey.
 * Represents one interaction with a marketing channel.
 */
export interface Touchpoint {
  /** Unique identifier for this touchpoint */
  id: string;
  /** Marketing channel of this touchpoint */
  channel: Channel;
  /** ISO 8601 timestamp when the touchpoint occurred */
  timestamp: string;
  /** Campaign name associated with this touchpoint (if applicable) */
  campaign?: string;
  /** Traffic source identifier (e.g., "google", "newsletter") */
  source?: string;
  /** Marketing medium (e.g., "cpc", "email", "organic") */
  medium?: string;
}

/**
 * A complete conversion journey tracking all customer touchpoints.
 * Represents the path from first interaction to conversion.
 */
export interface ConversionJourney {
  /** Unique identifier for this journey */
  id: string;
  /** User identifier who completed this journey */
  userId: string;
  /** Ordered list of touchpoints leading to conversion */
  touchpoints: Touchpoint[];
  /** ISO 8601 timestamp when the conversion occurred */
  convertedAt: string;
  /** Monetary value of the conversion (in dollars) */
  conversionValue: number;
}

// =============================================================================
// 3. ATTRIBUTION RESULTS
// =============================================================================

/**
 * Attribution results for a single channel.
 * Contains credited conversions and revenue for the channel.
 */
export interface ChannelAttribution {
  /** The marketing channel */
  channel: Channel;
  /** Number of conversions attributed to this channel */
  conversions: number;
  /** Total revenue attributed to this channel (in dollars) */
  attributedRevenue: number;
  /** Percentage of total attributed revenue for this channel */
  percentOfTotal: number;
  /** Average number of touchpoints per conversion for this channel */
  avgTouchpoints: number;
  /** Cost per acquisition for this channel (in dollars, if available) */
  costPerAcquisition?: number;
  /** Return on investment percentage for this channel (if available) */
  roi?: number;
}

/**
 * Complete attribution results for a single model.
 * Contains channel-level breakdowns and totals.
 */
export interface ModelResult {
  /** The attribution model used for these results */
  model: AttributionModel;
  /** Attribution results broken down by channel */
  channelAttributions: ChannelAttribution[];
  /** Total number of conversions analyzed */
  totalConversions: number;
  /** Total revenue from all conversions (in dollars) */
  totalRevenue: number;
  /** ISO 8601 timestamp when these results were generated */
  generatedAt: string;
}

// =============================================================================
// 4. PATH ANALYSIS (SANKEY VISUALIZATION)
// =============================================================================

/**
 * A single path segment for Sankey flow visualization.
 * Represents transitions between touchpoints in customer journeys.
 */
export interface TouchpointPath {
  /** Starting point of this path segment ("start" for journey beginning) */
  from: Channel | "start";
  /** Ending point of this path segment ("conversion" for journey completion) */
  to: Channel | "conversion";
  /** Number of journeys that followed this path segment */
  count: number;
  /** Total value of conversions flowing through this path segment (in dollars) */
  value: number;
}

// =============================================================================
// 5. COMBINED ATTRIBUTION DATA
// =============================================================================

/**
 * Summary statistics for attribution analysis.
 */
export interface AttributionSummary {
  /** Total number of conversions in the analysis period */
  totalConversions: number;
  /** Total revenue from all conversions (in dollars) */
  totalRevenue: number;
  /** Average number of touchpoints per conversion journey */
  avgJourneyLength: number;
  /** Channel with the highest attributed revenue */
  topChannel: Channel;
}

/**
 * Complete attribution data response.
 * Contains results from all models, journey data, and path analysis.
 */
export interface AttributionData {
  /** Attribution results for each model */
  models: ModelResult[];
  /** Raw conversion journey data */
  journeys: ConversionJourney[];
  /** Path flow data for Sankey visualization */
  paths: TouchpointPath[];
  /** Time range for this attribution analysis */
  timeRange: {
    /** ISO 8601 date for the start of the analysis period */
    start: string;
    /** ISO 8601 date for the end of the analysis period */
    end: string;
  };
  /** Summary statistics */
  summary: AttributionSummary;
}

// =============================================================================
// API RESPONSE TYPE
// =============================================================================

/**
 * API response wrapper for attribution data.
 */
export interface AttributionResponse {
  /** Whether the request was successful */
  success: boolean;
  /** The attribution data payload */
  data: AttributionData;
  /** ISO 8601 timestamp of the response */
  timestamp: string;
  /** Error message (present on failure) */
  error?: string;
}
