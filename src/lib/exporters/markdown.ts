/**
 * Markdown Exporter
 *
 * Exports analytics data to Markdown format with tables.
 */

import type { UnifiedAnalyticsData } from "@/types";

/**
 * Create a markdown table from headers and rows
 */
function table(headers: string[], rows: (string | number)[][]): string {
  const headerRow = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const dataRows = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  return [headerRow, separator, dataRows].join("\n");
}

/**
 * Format number with locale formatting
 */
function fmt(n: number | undefined, decimals = 0): string {
  if (n === undefined) return "N/A";
  return n.toLocaleString(undefined, { maximumFractionDigits: decimals });
}

/**
 * Format currency
 */
function currency(n: number | undefined): string {
  if (n === undefined) return "N/A";
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Format percentage
 */
function pct(n: number | undefined): string {
  if (n === undefined) return "N/A";
  return `${n.toFixed(1)}%`;
}

/**
 * Generate Traffic section
 */
function exportTraffic(data: UnifiedAnalyticsData["traffic"]): string {
  if (!data) return "";

  const lines = [
    "## Traffic & Acquisition",
    "",
    "### Overview",
    "",
    table(
      ["Metric", "Value"],
      [
        ["Sessions", fmt(data.sessions)],
        ["Unique Visitors", fmt(data.uniqueVisitors)],
        ["New Visitors", fmt(data.newVisitors)],
        ["Returning Visitors", fmt(data.returningVisitors)],
        ["Bounce Rate", pct(data.bounceRate)],
        ["Pages/Session", fmt(data.pagesPerSession, 1)],
        ["Avg Session Duration", `${fmt(data.avgSessionDuration)}s`],
      ]
    ),
    "",
    "### Traffic by Source",
    "",
    table(
      ["Source", "Sessions"],
      Object.entries(data.trafficBySource).map(([source, sessions]) => [source, fmt(sessions)])
    ),
    "",
    "### Top Landing Pages",
    "",
    table(
      ["Path", "Sessions", "Bounce Rate"],
      data.topLandingPages.map((p) => [p.path, fmt(p.sessions), pct(p.bounceRate)])
    ),
    "",
    "### Core Web Vitals",
    "",
    table(
      ["Metric", "Value", "Status"],
      [
        ["LCP", `${data.coreWebVitals.lcp}s`, data.coreWebVitals.lcp <= 2.5 ? "✅ Good" : "⚠️ Needs Work"],
        ["FID", `${data.coreWebVitals.fid}ms`, data.coreWebVitals.fid <= 100 ? "✅ Good" : "⚠️ Needs Work"],
        ["CLS", fmt(data.coreWebVitals.cls, 2), data.coreWebVitals.cls <= 0.1 ? "✅ Good" : "⚠️ Needs Work"],
      ]
    ),
  ];

  return lines.join("\n");
}

/**
 * Generate SEO section
 */
function exportSEO(data: UnifiedAnalyticsData["seo"]): string {
  if (!data) return "";

  const lines = [
    "## SEO Metrics",
    "",
    "### Overview",
    "",
    table(
      ["Metric", "Value"],
      [
        ["Visibility Score", fmt(data.visibilityScore, 1)],
        ["Impressions", fmt(data.impressions)],
        ["Clicks", fmt(data.clicks)],
        ["CTR", pct(data.ctr)],
        ["Average Position", fmt(data.averagePosition, 1)],
        ["Backlinks", fmt(data.backlinks)],
        ["Referring Domains", fmt(data.referringDomains)],
        ["Domain Authority", fmt(data.domainAuthority)],
        ["Indexed Pages", fmt(data.indexedPages)],
      ]
    ),
    "",
    "### Keyword Rankings",
    "",
    table(
      ["Keyword", "Position", "Change", "Volume", "URL"],
      data.keywordRankings.map((kw) => [
        kw.keyword,
        kw.position,
        kw.change > 0 ? `↑${kw.change}` : kw.change < 0 ? `↓${Math.abs(kw.change)}` : "—",
        fmt(kw.volume),
        kw.url,
      ])
    ),
    "",
    "### Top Search Queries",
    "",
    table(
      ["Query", "Impressions", "Clicks", "CTR", "Position"],
      data.topQueries.map((q) => [q.query, fmt(q.impressions), fmt(q.clicks), pct(q.ctr), fmt(q.position, 1)])
    ),
  ];

  return lines.join("\n");
}

/**
 * Generate Conversions section
 */
function exportConversions(data: UnifiedAnalyticsData["conversions"]): string {
  if (!data) return "";

  const lines = [
    "## Conversions & Funnel",
    "",
    "### Overview",
    "",
    table(
      ["Metric", "Value"],
      [
        ["Conversion Rate", pct(data.conversionRate)],
        ["Total Conversions", fmt(data.totalConversions)],
        ["Add to Cart Rate", pct(data.addToCartRate)],
        ["Cart Abandonment", pct(data.cartAbandonmentRate)],
        ["Checkout Abandonment", pct(data.checkoutAbandonmentRate)],
        ["Checkout Completion", pct(data.checkoutCompletionRate)],
      ]
    ),
    "",
    "### Funnel",
    "",
    table(
      ["Step", "Users", "Drop Off", "Drop Off Rate"],
      data.funnel.map((s) => [s.step, fmt(s.users), fmt(s.dropOff), pct(s.dropOffRate)])
    ),
    "",
    "### Conversions by Source",
    "",
    table(
      ["Source", "Visitors", "Conversions", "Rate"],
      Object.entries(data.conversionsBySource).map(([source, c]) => [source, fmt(c.visitors), fmt(c.conversions), pct(c.rate)])
    ),
  ];

  return lines.join("\n");
}

/**
 * Generate Revenue section
 */
function exportRevenue(data: UnifiedAnalyticsData["revenue"]): string {
  if (!data) return "";

  const lines = [
    "## Revenue & Orders",
    "",
    "### Overview",
    "",
    table(
      ["Metric", "Value"],
      [
        ["Gross Revenue", currency(data.grossRevenue)],
        ["Net Revenue", currency(data.netRevenue)],
        ["Transactions", fmt(data.transactions)],
        ["Average Order Value", currency(data.aov)],
        ["Median Order Value", currency(data.medianOrderValue)],
        ["Units per Order", fmt(data.unitsPerOrder, 1)],
        ["Revenue per Visitor", currency(data.revenuePerVisitor)],
        ["Refund Amount", currency(data.refundAmount)],
        ["Refund Rate", pct(data.refundRate)],
      ]
    ),
    "",
    "### Revenue by Product",
    "",
    table(
      ["Product", "Revenue", "Units"],
      data.revenueByProduct.map((p) => [p.productName, currency(p.revenue), fmt(p.units)])
    ),
    "",
    "### Revenue by Channel",
    "",
    table(
      ["Channel", "Revenue"],
      Object.entries(data.revenueByChannel).map(([ch, rev]) => [ch, currency(rev)])
    ),
  ];

  return lines.join("\n");
}

/**
 * Generate Subscriptions section
 */
function exportSubscriptions(data: UnifiedAnalyticsData["subscriptions"]): string {
  if (!data) return "";

  const lines = [
    "## Subscriptions & Retention",
    "",
    "### Overview",
    "",
    table(
      ["Metric", "Value"],
      [
        ["Active Subscribers", fmt(data.activeSubscribers)],
        ["New Subscribers", fmt(data.newSubscribers)],
        ["Cancelled", fmt(data.cancelledSubscribers)],
        ["Monthly Churn", pct(data.churnRate.monthly)],
        ["Retention Rate", pct(data.retentionRate)],
        ["MRR", currency(data.mrr)],
        ["ARR", currency(data.arr)],
        ["Trial to Paid", pct(data.trialToPaidRate)],
        ["Subscriber LTV", currency(data.subscriberLtv)],
      ]
    ),
    "",
    "### MRR Movement",
    "",
    table(
      ["Type", "Amount"],
      [
        ["New", currency(data.mrrMovement.new)],
        ["Expansion", currency(data.mrrMovement.expansion)],
        ["Contraction", `-${currency(data.mrrMovement.contraction)}`],
        ["Churned", `-${currency(data.mrrMovement.churned)}`],
        ["**Net**", `**${currency(data.mrrMovement.net)}**`],
      ]
    ),
    "",
    "### Subscribers by Plan",
    "",
    table(
      ["Plan", "Subscribers"],
      Object.entries(data.subscribersByPlan).map(([plan, count]) => [plan, fmt(count)])
    ),
  ];

  return lines.join("\n");
}

/**
 * Generate Payments section
 */
function exportPayments(data: UnifiedAnalyticsData["payments"]): string {
  if (!data) return "";

  const lines = [
    "## Payments",
    "",
    "### Overview",
    "",
    table(
      ["Metric", "Value"],
      [
        ["Successful Payments", fmt(data.successfulPayments)],
        ["Failed Payments", fmt(data.failedPayments)],
        ["Failure Rate", pct(data.failureRate)],
        ["Recovery Rate", pct(data.recoveryRate)],
        ["At-Risk Revenue", currency(data.atRiskRevenue)],
        ["Recovered Revenue", currency(data.recoveredRevenue)],
      ]
    ),
    "",
    "### Payment Methods",
    "",
    table(
      ["Method", "Distribution"],
      Object.entries(data.paymentMethodDistribution).map(([method, p]) => [method, pct(p)])
    ),
    "",
    "### Failure Reasons",
    "",
    table(
      ["Reason", "Count"],
      Object.entries(data.failureByReason).map(([reason, count]) => [reason, fmt(count)])
    ),
  ];

  return lines.join("\n");
}

/**
 * Generate Unit Economics section
 */
function exportUnitEconomics(data: UnifiedAnalyticsData["unitEconomics"]): string {
  if (!data) return "";

  const lines = [
    "## Unit Economics",
    "",
    "### Key Metrics",
    "",
    table(
      ["Metric", "Value"],
      [
        ["CAC", currency(data.cac)],
        ["LTV", currency(data.ltv)],
        ["LTV:CAC Ratio", `${fmt(data.ltvCacRatio, 1)}x`],
        ["CAC Payback", `${fmt(data.cacPaybackPeriod, 1)} months`],
        ["Gross Margin", pct(data.grossMargin)],
        ["ARPU", currency(data.arpu)],
        ["NRR", pct(data.nrr)],
        ["GRR", pct(data.grr)],
      ]
    ),
    "",
    "### CAC by Channel",
    "",
    table(
      ["Channel", "CAC", "LTV:CAC"],
      Object.entries(data.cacByChannel).map(([ch, cac]) => [
        ch,
        currency(cac),
        `${fmt(data.ltvCacByChannel[ch] ?? 0, 1)}x`,
      ])
    ),
  ];

  return lines.join("\n");
}

/**
 * Generate Demographics section
 */
function exportDemographics(data: UnifiedAnalyticsData["demographics"]): string {
  if (!data) return "";

  const lines = [
    "## Demographics",
    "",
    "### Top Countries",
    "",
    table(
      ["Country", "Users", "Sessions", "Conv Rate"],
      data.geographic.byCountry.map((c) => [c.country, fmt(c.users), fmt(c.sessions), pct(c.conversionRate)])
    ),
    "",
    "### Device Distribution",
    "",
    table(
      ["Device", "Users"],
      Object.entries(data.device.byType).map(([type, users]) => [type, fmt(users)])
    ),
    "",
    "### Browser Usage",
    "",
    table(
      ["Browser", "Share"],
      Object.entries(data.technology.byBrowser).map(([browser, share]) => [browser, pct(share)])
    ),
  ];

  return lines.join("\n");
}

/**
 * Generate Segmentation section
 */
function exportSegmentation(data: UnifiedAnalyticsData["segmentation"]): string {
  if (!data) return "";

  const lines = [
    "## Segmentation",
    "",
    "### By Campaign",
    "",
    table(
      ["Campaign", "Users", "Conversions", "Revenue", "ROI"],
      data.byCampaign.map((c) => [c.campaign, fmt(c.users), fmt(c.conversions), currency(c.revenue), `${fmt(c.roi, 1)}x`])
    ),
    "",
    "### By Plan",
    "",
    table(
      ["Plan", "Users", "MRR", "Churn"],
      data.byPlan.map((p) => [p.plan, fmt(p.users), currency(p.mrr), pct(p.churnRate)])
    ),
    "",
    "### By Behavior",
    "",
    table(
      ["Segment", "Users", "Share", "Avg Revenue"],
      data.byBehavior.map((b) => [b.segment, fmt(b.users), pct(b.percentage), currency(b.avgRevenue)])
    ),
    "",
    "### Lifecycle Stages",
    "",
    table(
      ["Stage", "Count"],
      Object.entries(data.byLifecycle).map(([stage, count]) => [stage, fmt(count)])
    ),
  ];

  return lines.join("\n");
}

/**
 * Generate Campaigns section
 */
function exportCampaigns(data: UnifiedAnalyticsData["campaigns"]): string {
  if (!data) return "";

  const lines = [
    "## Campaigns (Email/SMS)",
    "",
    "### Summary",
    "",
    table(
      ["Metric", "Value"],
      [
        ["Sent", fmt(data.summary.sent)],
        ["Delivered", fmt(data.summary.delivered)],
        ["Delivery Rate", pct(data.summary.deliveryRate)],
        ["Opens", fmt(data.engagement.opens)],
        ["Open Rate", pct(data.engagement.openRate)],
        ["Clicks", fmt(data.engagement.clicks)],
        ["CTR", pct(data.engagement.ctr)],
        ["Conversions", fmt(data.conversions.count)],
        ["Revenue", currency(data.conversions.revenue)],
        ["ROI", pct(data.conversions.roi)],
      ]
    ),
    "",
    "### Individual Campaigns",
    "",
    table(
      ["Name", "Channel", "Sent", "Opens", "Clicks", "Conversions", "Revenue"],
      data.byCampaign.map((c) => [
        c.name,
        c.channel,
        fmt(c.sent),
        fmt(c.opens),
        fmt(c.clicks),
        fmt(c.conversions),
        currency(c.revenue),
      ])
    ),
  ];

  return lines.join("\n");
}

/**
 * Export unified analytics data to Markdown format
 */
export function exportToMarkdown(data: UnifiedAnalyticsData): string {
  const sections = [
    "# Unified Analytics Report",
    "",
    `> **Time Range:** ${data.timeRange ?? "N/A"}`,
    `> **Generated:** ${new Date().toISOString()}`,
    "",
    "---",
    "",
  ];

  if (data.traffic) sections.push(exportTraffic(data.traffic), "", "---", "");
  if (data.seo) sections.push(exportSEO(data.seo), "", "---", "");
  if (data.conversions) sections.push(exportConversions(data.conversions), "", "---", "");
  if (data.revenue) sections.push(exportRevenue(data.revenue), "", "---", "");
  if (data.subscriptions) sections.push(exportSubscriptions(data.subscriptions), "", "---", "");
  if (data.payments) sections.push(exportPayments(data.payments), "", "---", "");
  if (data.unitEconomics) sections.push(exportUnitEconomics(data.unitEconomics), "", "---", "");
  if (data.demographics) sections.push(exportDemographics(data.demographics), "", "---", "");
  if (data.segmentation) sections.push(exportSegmentation(data.segmentation), "", "---", "");
  if (data.campaigns) sections.push(exportCampaigns(data.campaigns), "");

  return sections.join("\n");
}

/**
 * Download Markdown file in browser
 */
export function downloadMarkdown(
  data: UnifiedAnalyticsData,
  filename = "analytics-export.md"
): void {
  const md = exportToMarkdown(data);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
