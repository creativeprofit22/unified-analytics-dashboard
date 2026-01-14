/**
 * Channel ROI Calculator Types
 *
 * Type definitions for channel return on investment analysis, including:
 * 1. Channel cost and spend tracking
 * 2. ROI metrics per channel
 * 3. Comparison metrics (CAC, LTV:CAC, payback period)
 * 4. Summary statistics
 */

import type { Channel } from "./attribution";
import type { TimeRange } from "./analytics";

// =============================================================================
// 1. COST INPUT TYPES
// =============================================================================

/**
 * Cost breakdown for a single channel.
 * Represents the total investment in a marketing channel.
 */
export interface ChannelCost {
  /** The marketing channel */
  channel: Channel;
  /** Total ad spend for the period (in dollars) */
  adSpend: number;
  /** Labor costs allocated to this channel (in dollars) */
  laborCost: number;
  /** Tool and software costs for this channel (in dollars) */
  toolsCost: number;
  /** Other miscellaneous costs (in dollars) */
  otherCost: number;
  /** Total cost = adSpend + laborCost + toolsCost + otherCost */
  totalCost: number;
}

// =============================================================================
// 2. ROI METRICS TYPES
// =============================================================================

/**
 * Complete ROI metrics for a single channel.
 * Contains calculated ROI, ROAS, and efficiency metrics.
 */
export interface ChannelROIMetrics {
  /** The marketing channel */
  channel: Channel;
  /** Cost breakdown for this channel */
  costs: ChannelCost;
  /** Total revenue attributed to this channel (in dollars) */
  revenue: number;
  /** Number of conversions from this channel */
  conversions: number;
  /** ROI percentage = (Revenue - Cost) / Cost × 100 */
  roi: number;
  /** Return on ad spend = Revenue / Ad Spend */
  roas: number;
  /** Customer acquisition cost = Total Cost / Conversions */
  cac: number;
  /** Lifetime value for customers from this channel (in dollars) */
  ltv: number;
  /** LTV to CAC ratio = LTV / CAC */
  ltvCacRatio: number;
  /** Payback period in days = CAC / (Monthly Revenue per Customer / 30) */
  paybackPeriodDays: number;
  /** Conversion rate percentage */
  conversionRate: number;
  /** Number of impressions/reach for this channel */
  impressions: number;
  /** Cost per impression = Total Cost / Impressions × 1000 (CPM) */
  cpm: number;
}

// =============================================================================
// 3. SUMMARY TYPES
// =============================================================================

/**
 * Summary statistics across all channels.
 */
export interface ROISummary {
  /** Total spend across all channels (in dollars) */
  totalSpend: number;
  /** Total revenue across all channels (in dollars) */
  totalRevenue: number;
  /** Total conversions across all channels */
  totalConversions: number;
  /** Overall ROI = (Total Revenue - Total Spend) / Total Spend × 100 */
  overallROI: number;
  /** Average CAC across all channels */
  avgCAC: number;
  /** Average LTV:CAC ratio across all channels */
  avgLtvCacRatio: number;
  /** Channel with the highest ROI */
  topROIChannel: Channel;
  /** Channel with the lowest CAC (most efficient) */
  lowestCACChannel: Channel;
  /** Channel with the best LTV:CAC ratio */
  bestLtvCacChannel: Channel;
}

// =============================================================================
// 4. TREND DATA
// =============================================================================

/**
 * ROI trend data point for historical tracking.
 */
export interface ROITrendPoint {
  /** ISO 8601 date string */
  date: string;
  /** Overall ROI for this date */
  roi: number;
  /** Total spend for this date */
  spend: number;
  /** Total revenue for this date */
  revenue: number;
}

// =============================================================================
// 5. COMBINED ROI DATA
// =============================================================================

/**
 * Complete ROI data response.
 * Contains metrics for all channels, summary, and trend data.
 */
export interface ROIData {
  /** ROI metrics for each channel */
  channels: ChannelROIMetrics[];
  /** Summary statistics across all channels */
  summary: ROISummary;
  /** Historical ROI trend data */
  trend: ROITrendPoint[];
  /** Time range for this analysis */
  timeRange: TimeRange;
  /** ISO 8601 timestamp when this data was generated */
  generatedAt: string;
}

// =============================================================================
// 6. API RESPONSE TYPE
// =============================================================================

/**
 * API response wrapper for ROI data.
 */
export interface ROIResponse {
  /** Whether the request was successful */
  success: boolean;
  /** The ROI data payload */
  data: ROIData;
  /** ISO 8601 timestamp of the response */
  timestamp: string;
  /** Error message (present on failure) */
  error?: string;
}
