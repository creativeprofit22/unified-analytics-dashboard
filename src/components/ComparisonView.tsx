"use client";

import { useState, useCallback } from "react";
import type { UnifiedAnalyticsData, ComparisonConfig, CustomDateRange } from "@/types/analytics";
import { cn } from "@/utils/cn";

interface ComparisonViewProps {
  currentData: UnifiedAnalyticsData;
  comparisonData: UnifiedAnalyticsData;
  comparison: ComparisonConfig;
  className?: string;
}

// Section keys for filtering
type SectionKey = "traffic" | "conversions" | "revenue" | "subscriptions" | "unitEconomics" | "campaigns";

const SECTION_LABELS: Record<SectionKey, string> = {
  traffic: "Traffic",
  conversions: "Conversions",
  revenue: "Revenue",
  subscriptions: "Subscriptions",
  unitEconomics: "Unit Economics",
  campaigns: "Campaigns",
};

// Cached formatters
const formatters = {
  currency: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  number: new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }),
};

function formatValue(value: number, format: "number" | "currency" | "percent"): string {
  if (!Number.isFinite(value)) return "—";
  switch (format) {
    case "currency":
      return formatters.currency.format(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    default:
      return formatters.number.format(value);
  }
}

function formatDateRange(range?: CustomDateRange): string {
  if (!range) return "Selected Period";
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${formatDate(range.start)} - ${formatDate(range.end)}`;
}

interface SectionFilterProps {
  sections: SectionKey[];
  enabledSections: Set<SectionKey>;
  onToggle: (section: SectionKey) => void;
}

function SectionFilter({ sections, enabledSections, onToggle }: SectionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sections.map((section) => {
        const isEnabled = enabledSections.has(section);
        return (
          <button
            key={section}
            onClick={() => onToggle(section)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              isEnabled
                ? "bg-blue-600 text-white"
                : "bg-[var(--bg-secondary,rgba(255,255,255,0.05))] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary,rgba(255,255,255,0.1))]"
            )}
          >
            {SECTION_LABELS[section]}
          </button>
        );
      })}
    </div>
  );
}

interface ComparisonCardProps {
  title: string;
  value: number;
  format: "number" | "currency" | "percent";
  variant: "current" | "comparison";
}

function ComparisonCard({ title, value, format, variant }: ComparisonCardProps) {
  const borderColor = variant === "current" ? "border-l-blue-500" : "border-l-purple-500";

  return (
    <div
      className={cn(
        "rounded-lg border border-l-4 p-3 bg-[var(--bg-secondary,rgba(255,255,255,0.03))]",
        "border-[var(--border-primary,rgba(255,255,255,0.1))]",
        borderColor
      )}
    >
      <h4 className="text-xs text-[var(--text-secondary)] mb-1">{title}</h4>
      <p className="text-xl font-bold">{formatValue(value, format)}</p>
    </div>
  );
}

interface MetricPairProps {
  title: string;
  metricKey: string;
  currentValue: number;
  comparisonValue: number;
  format: "number" | "currency" | "percent";
  onHide: (key: string) => void;
}

function MetricPair({ title, metricKey, currentValue, comparisonValue, format, onHide }: MetricPairProps) {
  const change = comparisonValue !== 0
    ? ((currentValue - comparisonValue) / comparisonValue) * 100
    : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="group grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
      <ComparisonCard title={title} value={currentValue} format={format} variant="current" />

      <div className={cn(
        "text-xs font-medium px-2 py-1 rounded",
        isPositive && "text-green-400 bg-green-400/10",
        isNegative && "text-red-400 bg-red-400/10",
        !isPositive && !isNegative && "text-[var(--text-secondary)] bg-white/5"
      )}>
        {isPositive ? "+" : ""}{change.toFixed(1)}%
      </div>

      <ComparisonCard title={title} value={comparisonValue} format={format} variant="comparison" />

      <button
        onClick={() => onHide(metricKey)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-400"
        title={`Hide ${title}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface SectionProps {
  title: string;
  sectionKey: SectionKey;
  children: React.ReactNode;
  hiddenMetrics: Set<string>;
  onRestoreAll: () => void;
}

function Section({ title, sectionKey, children, hiddenMetrics, onRestoreAll }: SectionProps) {
  const sectionHiddenCount = Array.from(hiddenMetrics).filter(k => k.startsWith(`${sectionKey}.`)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {sectionHiddenCount > 0 && (
          <button
            onClick={onRestoreAll}
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Show {sectionHiddenCount} hidden
          </button>
        )}
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

export function ComparisonView({
  currentData,
  comparisonData,
  comparison,
  className,
}: ComparisonViewProps) {
  // Determine available sections based on data
  const availableSections: SectionKey[] = [];
  if (currentData.traffic && comparisonData.traffic) availableSections.push("traffic");
  if (currentData.conversions && comparisonData.conversions) availableSections.push("conversions");
  if (currentData.revenue && comparisonData.revenue) availableSections.push("revenue");
  if (currentData.subscriptions && comparisonData.subscriptions) availableSections.push("subscriptions");
  if (currentData.unitEconomics && comparisonData.unitEconomics) availableSections.push("unitEconomics");
  if (currentData.campaigns && comparisonData.campaigns) availableSections.push("campaigns");

  // Section filter state - all enabled by default
  const [enabledSections, setEnabledSections] = useState<Set<SectionKey>>(
    () => new Set(availableSections)
  );

  // Hidden metrics state
  const [hiddenMetrics, setHiddenMetrics] = useState<Set<string>>(() => new Set());

  const toggleSection = useCallback((section: SectionKey) => {
    setEnabledSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const hideMetric = useCallback((key: string) => {
    setHiddenMetrics(prev => new Set(prev).add(key));
  }, []);

  const restoreSectionMetrics = useCallback((sectionKey: SectionKey) => {
    setHiddenMetrics(prev => {
      const next = new Set(prev);
      for (const key of next) {
        if (key.startsWith(`${sectionKey}.`)) {
          next.delete(key);
        }
      }
      return next;
    });
  }, []);

  const isMetricVisible = (sectionKey: SectionKey, metricKey: string) => {
    return !hiddenMetrics.has(`${sectionKey}.${metricKey}`);
  };

  const currentLabel = formatDateRange(comparison.currentRange);
  const comparisonLabel = formatDateRange(comparison.comparisonRange);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Section Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 px-4 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.03))] border border-[var(--border-primary,rgba(255,255,255,0.1))]">
        <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide shrink-0">
          Compare:
        </span>
        <SectionFilter
          sections={availableSections}
          enabledSections={enabledSections}
          onToggle={toggleSection}
        />
      </div>

      {/* Period Labels Header */}
      <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center py-4 px-4 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.03))] border border-[var(--border-primary,rgba(255,255,255,0.1))]">
        <div className="text-center">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Current Period</div>
          <div className="text-base font-semibold text-blue-400">{currentLabel}</div>
        </div>
        <div className="text-lg text-[var(--text-secondary)]">vs</div>
        <div className="text-center">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Comparison Period</div>
          <div className="text-base font-semibold text-purple-400">{comparisonLabel}</div>
        </div>
        <div className="w-6" /> {/* Spacer for hide button column */}
      </div>

      {/* Traffic Comparison */}
      {enabledSections.has("traffic") && currentData.traffic && comparisonData.traffic && (
        <Section
          title="Traffic & Acquisition"
          sectionKey="traffic"
          hiddenMetrics={hiddenMetrics}
          onRestoreAll={() => restoreSectionMetrics("traffic")}
        >
          {isMetricVisible("traffic", "sessions") && (
            <MetricPair
              title="Sessions"
              metricKey="traffic.sessions"
              currentValue={currentData.traffic.sessions}
              comparisonValue={comparisonData.traffic.sessions}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("traffic", "uniqueVisitors") && (
            <MetricPair
              title="Unique Visitors"
              metricKey="traffic.uniqueVisitors"
              currentValue={currentData.traffic.uniqueVisitors}
              comparisonValue={comparisonData.traffic.uniqueVisitors}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("traffic", "newVisitors") && (
            <MetricPair
              title="New Visitors"
              metricKey="traffic.newVisitors"
              currentValue={currentData.traffic.newVisitors}
              comparisonValue={comparisonData.traffic.newVisitors}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("traffic", "bounceRate") && (
            <MetricPair
              title="Bounce Rate"
              metricKey="traffic.bounceRate"
              currentValue={currentData.traffic.bounceRate}
              comparisonValue={comparisonData.traffic.bounceRate}
              format="percent"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("traffic", "pagesPerSession") && (
            <MetricPair
              title="Pages/Session"
              metricKey="traffic.pagesPerSession"
              currentValue={currentData.traffic.pagesPerSession}
              comparisonValue={comparisonData.traffic.pagesPerSession}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("traffic", "avgSessionDuration") && (
            <MetricPair
              title="Avg Session (min)"
              metricKey="traffic.avgSessionDuration"
              currentValue={currentData.traffic.avgSessionDuration / 60}
              comparisonValue={comparisonData.traffic.avgSessionDuration / 60}
              format="number"
              onHide={hideMetric}
            />
          )}
        </Section>
      )}

      {/* Conversions Comparison */}
      {enabledSections.has("conversions") && currentData.conversions && comparisonData.conversions && (
        <Section
          title="Conversions"
          sectionKey="conversions"
          hiddenMetrics={hiddenMetrics}
          onRestoreAll={() => restoreSectionMetrics("conversions")}
        >
          {isMetricVisible("conversions", "conversionRate") && (
            <MetricPair
              title="Conversion Rate"
              metricKey="conversions.conversionRate"
              currentValue={currentData.conversions.conversionRate}
              comparisonValue={comparisonData.conversions.conversionRate}
              format="percent"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("conversions", "totalConversions") && (
            <MetricPair
              title="Total Conversions"
              metricKey="conversions.totalConversions"
              currentValue={currentData.conversions.totalConversions}
              comparisonValue={comparisonData.conversions.totalConversions}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("conversions", "addToCartRate") && (
            <MetricPair
              title="Add to Cart Rate"
              metricKey="conversions.addToCartRate"
              currentValue={currentData.conversions.addToCartRate}
              comparisonValue={comparisonData.conversions.addToCartRate}
              format="percent"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("conversions", "cartAbandonmentRate") && (
            <MetricPair
              title="Cart Abandonment"
              metricKey="conversions.cartAbandonmentRate"
              currentValue={currentData.conversions.cartAbandonmentRate}
              comparisonValue={comparisonData.conversions.cartAbandonmentRate}
              format="percent"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("conversions", "checkoutCompletionRate") && (
            <MetricPair
              title="Checkout Completion"
              metricKey="conversions.checkoutCompletionRate"
              currentValue={currentData.conversions.checkoutCompletionRate}
              comparisonValue={comparisonData.conversions.checkoutCompletionRate}
              format="percent"
              onHide={hideMetric}
            />
          )}
        </Section>
      )}

      {/* Revenue Comparison */}
      {enabledSections.has("revenue") && currentData.revenue && comparisonData.revenue && (
        <Section
          title="Revenue"
          sectionKey="revenue"
          hiddenMetrics={hiddenMetrics}
          onRestoreAll={() => restoreSectionMetrics("revenue")}
        >
          {isMetricVisible("revenue", "grossRevenue") && (
            <MetricPair
              title="Gross Revenue"
              metricKey="revenue.grossRevenue"
              currentValue={currentData.revenue.grossRevenue}
              comparisonValue={comparisonData.revenue.grossRevenue}
              format="currency"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("revenue", "netRevenue") && (
            <MetricPair
              title="Net Revenue"
              metricKey="revenue.netRevenue"
              currentValue={currentData.revenue.netRevenue}
              comparisonValue={comparisonData.revenue.netRevenue}
              format="currency"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("revenue", "transactions") && (
            <MetricPair
              title="Transactions"
              metricKey="revenue.transactions"
              currentValue={currentData.revenue.transactions}
              comparisonValue={comparisonData.revenue.transactions}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("revenue", "aov") && (
            <MetricPair
              title="AOV"
              metricKey="revenue.aov"
              currentValue={currentData.revenue.aov}
              comparisonValue={comparisonData.revenue.aov}
              format="currency"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("revenue", "revenuePerVisitor") && (
            <MetricPair
              title="Revenue/Visitor"
              metricKey="revenue.revenuePerVisitor"
              currentValue={currentData.revenue.revenuePerVisitor}
              comparisonValue={comparisonData.revenue.revenuePerVisitor}
              format="currency"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("revenue", "refundRate") && (
            <MetricPair
              title="Refund Rate"
              metricKey="revenue.refundRate"
              currentValue={currentData.revenue.refundRate}
              comparisonValue={comparisonData.revenue.refundRate}
              format="percent"
              onHide={hideMetric}
            />
          )}
        </Section>
      )}

      {/* Subscriptions Comparison */}
      {enabledSections.has("subscriptions") && currentData.subscriptions && comparisonData.subscriptions && (
        <Section
          title="Subscriptions"
          sectionKey="subscriptions"
          hiddenMetrics={hiddenMetrics}
          onRestoreAll={() => restoreSectionMetrics("subscriptions")}
        >
          {isMetricVisible("subscriptions", "activeSubscribers") && (
            <MetricPair
              title="Active Subscribers"
              metricKey="subscriptions.activeSubscribers"
              currentValue={currentData.subscriptions.activeSubscribers}
              comparisonValue={comparisonData.subscriptions.activeSubscribers}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("subscriptions", "newSubscribers") && (
            <MetricPair
              title="New Subscribers"
              metricKey="subscriptions.newSubscribers"
              currentValue={currentData.subscriptions.newSubscribers}
              comparisonValue={comparisonData.subscriptions.newSubscribers}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("subscriptions", "mrr") && (
            <MetricPair
              title="MRR"
              metricKey="subscriptions.mrr"
              currentValue={currentData.subscriptions.mrr}
              comparisonValue={comparisonData.subscriptions.mrr}
              format="currency"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("subscriptions", "arr") && (
            <MetricPair
              title="ARR"
              metricKey="subscriptions.arr"
              currentValue={currentData.subscriptions.arr}
              comparisonValue={comparisonData.subscriptions.arr}
              format="currency"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("subscriptions", "churnRate") && (
            <MetricPair
              title="Monthly Churn"
              metricKey="subscriptions.churnRate"
              currentValue={currentData.subscriptions.churnRate.monthly}
              comparisonValue={comparisonData.subscriptions.churnRate.monthly}
              format="percent"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("subscriptions", "retentionRate") && (
            <MetricPair
              title="Retention Rate"
              metricKey="subscriptions.retentionRate"
              currentValue={currentData.subscriptions.retentionRate}
              comparisonValue={comparisonData.subscriptions.retentionRate}
              format="percent"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("subscriptions", "subscriberLtv") && (
            <MetricPair
              title="Subscriber LTV"
              metricKey="subscriptions.subscriberLtv"
              currentValue={currentData.subscriptions.subscriberLtv}
              comparisonValue={comparisonData.subscriptions.subscriberLtv}
              format="currency"
              onHide={hideMetric}
            />
          )}
        </Section>
      )}

      {/* Unit Economics Comparison */}
      {enabledSections.has("unitEconomics") && currentData.unitEconomics && comparisonData.unitEconomics && (
        <Section
          title="Unit Economics"
          sectionKey="unitEconomics"
          hiddenMetrics={hiddenMetrics}
          onRestoreAll={() => restoreSectionMetrics("unitEconomics")}
        >
          {isMetricVisible("unitEconomics", "cac") && (
            <MetricPair
              title="CAC"
              metricKey="unitEconomics.cac"
              currentValue={currentData.unitEconomics.cac}
              comparisonValue={comparisonData.unitEconomics.cac}
              format="currency"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("unitEconomics", "ltv") && (
            <MetricPair
              title="LTV"
              metricKey="unitEconomics.ltv"
              currentValue={currentData.unitEconomics.ltv}
              comparisonValue={comparisonData.unitEconomics.ltv}
              format="currency"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("unitEconomics", "ltvCacRatio") && (
            <MetricPair
              title="LTV:CAC Ratio"
              metricKey="unitEconomics.ltvCacRatio"
              currentValue={currentData.unitEconomics.ltvCacRatio}
              comparisonValue={comparisonData.unitEconomics.ltvCacRatio}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("unitEconomics", "cacPaybackPeriod") && (
            <MetricPair
              title="CAC Payback (months)"
              metricKey="unitEconomics.cacPaybackPeriod"
              currentValue={currentData.unitEconomics.cacPaybackPeriod}
              comparisonValue={comparisonData.unitEconomics.cacPaybackPeriod}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("unitEconomics", "grossMargin") && (
            <MetricPair
              title="Gross Margin"
              metricKey="unitEconomics.grossMargin"
              currentValue={currentData.unitEconomics.grossMargin}
              comparisonValue={comparisonData.unitEconomics.grossMargin}
              format="percent"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("unitEconomics", "arpu") && (
            <MetricPair
              title="ARPU"
              metricKey="unitEconomics.arpu"
              currentValue={currentData.unitEconomics.arpu}
              comparisonValue={comparisonData.unitEconomics.arpu}
              format="currency"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("unitEconomics", "nrr") && (
            <MetricPair
              title="NRR"
              metricKey="unitEconomics.nrr"
              currentValue={currentData.unitEconomics.nrr}
              comparisonValue={comparisonData.unitEconomics.nrr}
              format="percent"
              onHide={hideMetric}
            />
          )}
        </Section>
      )}

      {/* Campaigns Comparison */}
      {enabledSections.has("campaigns") && currentData.campaigns && comparisonData.campaigns && (
        <Section
          title="Campaigns"
          sectionKey="campaigns"
          hiddenMetrics={hiddenMetrics}
          onRestoreAll={() => restoreSectionMetrics("campaigns")}
        >
          {isMetricVisible("campaigns", "sent") && (
            <MetricPair
              title="Sent"
              metricKey="campaigns.sent"
              currentValue={currentData.campaigns.summary.sent}
              comparisonValue={comparisonData.campaigns.summary.sent}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("campaigns", "deliveryRate") && (
            <MetricPair
              title="Delivery Rate"
              metricKey="campaigns.deliveryRate"
              currentValue={currentData.campaigns.summary.deliveryRate}
              comparisonValue={comparisonData.campaigns.summary.deliveryRate}
              format="percent"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("campaigns", "openRate") && (
            <MetricPair
              title="Open Rate"
              metricKey="campaigns.openRate"
              currentValue={currentData.campaigns.engagement.openRate}
              comparisonValue={comparisonData.campaigns.engagement.openRate}
              format="percent"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("campaigns", "ctr") && (
            <MetricPair
              title="CTR"
              metricKey="campaigns.ctr"
              currentValue={currentData.campaigns.engagement.ctr}
              comparisonValue={comparisonData.campaigns.engagement.ctr}
              format="percent"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("campaigns", "conversions") && (
            <MetricPair
              title="Conversions"
              metricKey="campaigns.conversions"
              currentValue={currentData.campaigns.conversions.count}
              comparisonValue={comparisonData.campaigns.conversions.count}
              format="number"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("campaigns", "revenue") && (
            <MetricPair
              title="Revenue"
              metricKey="campaigns.revenue"
              currentValue={currentData.campaigns.conversions.revenue}
              comparisonValue={comparisonData.campaigns.conversions.revenue}
              format="currency"
              onHide={hideMetric}
            />
          )}
          {isMetricVisible("campaigns", "roi") && (
            <MetricPair
              title="ROI"
              metricKey="campaigns.roi"
              currentValue={currentData.campaigns.conversions.roi}
              comparisonValue={comparisonData.campaigns.conversions.roi}
              format="percent"
              onHide={hideMetric}
            />
          )}
        </Section>
      )}

      {/* Empty state when no sections selected */}
      {enabledSections.size === 0 && (
        <div className="py-12 text-center text-[var(--text-secondary)]">
          <p>No sections selected. Click on a section above to compare.</p>
        </div>
      )}
    </div>
  );
}

export default ComparisonView;
