/**
 * CSV Exporter
 *
 * Exports analytics data to CSV format with proper escaping.
 */

import type { UnifiedAnalyticsData } from "@/types";

/**
 * Escape a value for CSV (handles commas, quotes, newlines)
 */
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert a record to CSV row
 */
function toCSVRow(values: unknown[]): string {
  return values.map(escapeCSV).join(",");
}

/**
 * Generate Traffic & Acquisition section
 */
function exportTraffic(data: UnifiedAnalyticsData["traffic"]): string {
  if (!data) return "";

  const lines: string[] = [
    "# Traffic & Acquisition",
    "",
    toCSVRow(["Metric", "Value"]),
    toCSVRow(["Sessions", data.sessions]),
    toCSVRow(["Unique Visitors", data.uniqueVisitors]),
    toCSVRow(["New Visitors", data.newVisitors]),
    toCSVRow(["Returning Visitors", data.returningVisitors]),
    toCSVRow(["Bounce Rate (%)", data.bounceRate]),
    toCSVRow(["Pages per Session", data.pagesPerSession]),
    toCSVRow(["Avg Session Duration (s)", data.avgSessionDuration]),
    "",
    "Traffic by Source",
    toCSVRow(["Source", "Sessions"]),
  ];

  for (const [source, sessions] of Object.entries(data.trafficBySource)) {
    lines.push(toCSVRow([source, sessions]));
  }

  lines.push("", "Top Landing Pages", toCSVRow(["Path", "Sessions", "Bounce Rate (%)"]));
  for (const page of data.topLandingPages) {
    lines.push(toCSVRow([page.path, page.sessions, page.bounceRate]));
  }

  lines.push("", "Core Web Vitals", toCSVRow(["Metric", "Value"]));
  lines.push(toCSVRow(["LCP (s)", data.coreWebVitals.lcp]));
  lines.push(toCSVRow(["FID (ms)", data.coreWebVitals.fid]));
  lines.push(toCSVRow(["CLS", data.coreWebVitals.cls]));

  return lines.join("\n");
}

/**
 * Generate SEO section
 */
function exportSEO(data: UnifiedAnalyticsData["seo"]): string {
  if (!data) return "";

  const lines: string[] = [
    "# SEO Metrics",
    "",
    toCSVRow(["Metric", "Value"]),
    toCSVRow(["Visibility Score", data.visibilityScore]),
    toCSVRow(["Impressions", data.impressions]),
    toCSVRow(["Clicks", data.clicks]),
    toCSVRow(["CTR (%)", data.ctr]),
    toCSVRow(["Average Position", data.averagePosition]),
    toCSVRow(["Backlinks", data.backlinks]),
    toCSVRow(["Referring Domains", data.referringDomains]),
    toCSVRow(["Domain Authority", data.domainAuthority]),
    toCSVRow(["Indexed Pages", data.indexedPages]),
    "",
    "Keyword Rankings",
    toCSVRow(["Keyword", "Position", "Previous", "Change", "Volume", "URL"]),
  ];

  for (const kw of data.keywordRankings) {
    lines.push(toCSVRow([kw.keyword, kw.position, kw.previousPosition, kw.change, kw.volume, kw.url]));
  }

  lines.push("", "Top Search Queries", toCSVRow(["Query", "Impressions", "Clicks", "CTR (%)", "Position"]));
  for (const q of data.topQueries) {
    lines.push(toCSVRow([q.query, q.impressions, q.clicks, q.ctr, q.position]));
  }

  return lines.join("\n");
}

/**
 * Generate Conversions section
 */
function exportConversions(data: UnifiedAnalyticsData["conversions"]): string {
  if (!data) return "";

  const lines: string[] = [
    "# Conversions & Funnel",
    "",
    toCSVRow(["Metric", "Value"]),
    toCSVRow(["Conversion Rate (%)", data.conversionRate]),
    toCSVRow(["Total Conversions", data.totalConversions]),
    toCSVRow(["Add to Cart Rate (%)", data.addToCartRate]),
    toCSVRow(["Cart Abandonment Rate (%)", data.cartAbandonmentRate]),
    toCSVRow(["Checkout Abandonment Rate (%)", data.checkoutAbandonmentRate]),
    toCSVRow(["Checkout Completion Rate (%)", data.checkoutCompletionRate]),
    "",
    "Funnel",
    toCSVRow(["Step", "Users", "Drop Off", "Drop Off Rate (%)"]),
  ];

  for (const step of data.funnel) {
    lines.push(toCSVRow([step.step, step.users, step.dropOff, step.dropOffRate]));
  }

  lines.push("", "Conversions by Source", toCSVRow(["Source", "Visitors", "Conversions", "Rate (%)"]));
  for (const [source, conv] of Object.entries(data.conversionsBySource)) {
    lines.push(toCSVRow([source, conv.visitors, conv.conversions, conv.rate]));
  }

  return lines.join("\n");
}

/**
 * Generate Revenue section
 */
function exportRevenue(data: UnifiedAnalyticsData["revenue"]): string {
  if (!data) return "";

  const lines: string[] = [
    "# Revenue & Orders",
    "",
    toCSVRow(["Metric", "Value"]),
    toCSVRow(["Gross Revenue ($)", data.grossRevenue]),
    toCSVRow(["Net Revenue ($)", data.netRevenue]),
    toCSVRow(["Transactions", data.transactions]),
    toCSVRow(["Average Order Value ($)", data.aov]),
    toCSVRow(["Median Order Value ($)", data.medianOrderValue]),
    toCSVRow(["Units per Order", data.unitsPerOrder]),
    toCSVRow(["Revenue per Visitor ($)", data.revenuePerVisitor]),
    toCSVRow(["Refund Amount ($)", data.refundAmount]),
    toCSVRow(["Refund Rate (%)", data.refundRate]),
    toCSVRow(["Return Rate (%)", data.returnRate]),
    toCSVRow(["Discount Usage Rate (%)", data.discountUsageRate]),
    toCSVRow(["Avg Discount Value ($)", data.avgDiscountValue]),
    "",
    "Revenue by Product",
    toCSVRow(["Product", "Revenue ($)", "Units"]),
  ];

  for (const prod of data.revenueByProduct) {
    lines.push(toCSVRow([prod.productName, prod.revenue, prod.units]));
  }

  lines.push("", "Revenue by Channel", toCSVRow(["Channel", "Revenue ($)"]));
  for (const [channel, revenue] of Object.entries(data.revenueByChannel)) {
    lines.push(toCSVRow([channel, revenue]));
  }

  return lines.join("\n");
}

/**
 * Generate Subscriptions section
 */
function exportSubscriptions(data: UnifiedAnalyticsData["subscriptions"]): string {
  if (!data) return "";

  const lines: string[] = [
    "# Subscriptions & Retention",
    "",
    toCSVRow(["Metric", "Value"]),
    toCSVRow(["Active Subscribers", data.activeSubscribers]),
    toCSVRow(["New Subscribers", data.newSubscribers]),
    toCSVRow(["Cancelled Subscribers", data.cancelledSubscribers]),
    toCSVRow(["Monthly Churn Rate (%)", data.churnRate.monthly]),
    toCSVRow(["Annual Churn Rate (%)", data.churnRate.annual]),
    toCSVRow(["Retention Rate (%)", data.retentionRate]),
    toCSVRow(["MRR ($)", data.mrr]),
    toCSVRow(["ARR ($)", data.arr]),
    toCSVRow(["Reactivations", data.reactivations]),
    toCSVRow(["Reactivation Rate (%)", data.reactivationRate]),
    toCSVRow(["Trial to Paid Rate (%)", data.trialToPaidRate]),
    toCSVRow(["Avg Subscription Length (months)", data.avgSubscriptionLength]),
    toCSVRow(["Subscriber LTV ($)", data.subscriberLtv]),
    "",
    "MRR Movement",
    toCSVRow(["Type", "Amount ($)"]),
    toCSVRow(["New", data.mrrMovement.new]),
    toCSVRow(["Expansion", data.mrrMovement.expansion]),
    toCSVRow(["Contraction", data.mrrMovement.contraction]),
    toCSVRow(["Churned", data.mrrMovement.churned]),
    toCSVRow(["Net", data.mrrMovement.net]),
    "",
    "Subscribers by Plan",
    toCSVRow(["Plan", "Subscribers"]),
  ];

  for (const [plan, count] of Object.entries(data.subscribersByPlan)) {
    lines.push(toCSVRow([plan, count]));
  }

  return lines.join("\n");
}

/**
 * Generate Payments section
 */
function exportPayments(data: UnifiedAnalyticsData["payments"]): string {
  if (!data) return "";

  const lines: string[] = [
    "# Payments",
    "",
    toCSVRow(["Metric", "Value"]),
    toCSVRow(["Successful Payments", data.successfulPayments]),
    toCSVRow(["Failed Payments", data.failedPayments]),
    toCSVRow(["Failure Rate (%)", data.failureRate]),
    toCSVRow(["Recovery Rate (%)", data.recoveryRate]),
    toCSVRow(["Dunning Success Rate (%)", data.dunningSuccessRate]),
    toCSVRow(["Avg Time to Recovery (days)", data.avgTimeToRecovery]),
    toCSVRow(["Involuntary Churn", data.involuntaryChurn]),
    toCSVRow(["Involuntary Churn Rate (%)", data.involuntaryChurnRate]),
    toCSVRow(["At-Risk Revenue ($)", data.atRiskRevenue]),
    toCSVRow(["Recovered Revenue ($)", data.recoveredRevenue]),
    "",
    "Payment Method Distribution (%)",
    toCSVRow(["Method", "Percentage"]),
  ];

  for (const [method, pct] of Object.entries(data.paymentMethodDistribution)) {
    lines.push(toCSVRow([method, pct]));
  }

  lines.push("", "Failure by Reason", toCSVRow(["Reason", "Count"]));
  for (const [reason, count] of Object.entries(data.failureByReason)) {
    lines.push(toCSVRow([reason, count]));
  }

  return lines.join("\n");
}

/**
 * Generate Unit Economics section
 */
function exportUnitEconomics(data: UnifiedAnalyticsData["unitEconomics"]): string {
  if (!data) return "";

  const lines: string[] = [
    "# Unit Economics",
    "",
    toCSVRow(["Metric", "Value"]),
    toCSVRow(["CAC ($)", data.cac]),
    toCSVRow(["CAC Payback Period (months)", data.cacPaybackPeriod]),
    toCSVRow(["LTV ($)", data.ltv]),
    toCSVRow(["LTV:CAC Ratio", data.ltvCacRatio]),
    toCSVRow(["Gross Margin (%)", data.grossMargin]),
    toCSVRow(["Gross Margin per Customer ($)", data.grossMarginPerCustomer]),
    toCSVRow(["ARPU ($)", data.arpu]),
    toCSVRow(["ARPPU ($)", data.arppu]),
    toCSVRow(["ARPU Growth Rate (%)", data.arpuGrowthRate]),
    toCSVRow(["Contribution Margin (%)", data.contributionMargin]),
    toCSVRow(["Net Revenue Retention (%)", data.nrr]),
    toCSVRow(["Gross Revenue Retention (%)", data.grr]),
    "",
    "CAC by Channel",
    toCSVRow(["Channel", "CAC ($)"]),
  ];

  for (const [channel, cac] of Object.entries(data.cacByChannel)) {
    lines.push(toCSVRow([channel, cac]));
  }

  lines.push("", "LTV by Channel", toCSVRow(["Channel", "LTV ($)"]));
  for (const [channel, ltv] of Object.entries(data.ltvByChannel)) {
    lines.push(toCSVRow([channel, ltv]));
  }

  return lines.join("\n");
}

/**
 * Generate Demographics section
 */
function exportDemographics(data: UnifiedAnalyticsData["demographics"]): string {
  if (!data) return "";

  const lines: string[] = [
    "# Demographics",
    "",
    "Geographic - By Country",
    toCSVRow(["Country", "Code", "Users", "Sessions", "Conversion Rate (%)"]),
  ];

  for (const c of data.geographic.byCountry) {
    lines.push(toCSVRow([c.country, c.countryCode, c.users, c.sessions, c.conversionRate]));
  }

  lines.push("", "Device Type", toCSVRow(["Type", "Users"]));
  for (const [type, users] of Object.entries(data.device.byType)) {
    lines.push(toCSVRow([type, users]));
  }

  lines.push("", "Browser Distribution (%)", toCSVRow(["Browser", "Percentage"]));
  for (const [browser, pct] of Object.entries(data.technology.byBrowser)) {
    lines.push(toCSVRow([browser, pct]));
  }

  lines.push("", "OS Distribution (%)", toCSVRow(["OS", "Percentage"]));
  for (const [os, pct] of Object.entries(data.technology.byOS)) {
    lines.push(toCSVRow([os, pct]));
  }

  return lines.join("\n");
}

/**
 * Generate Segmentation section
 */
function exportSegmentation(data: UnifiedAnalyticsData["segmentation"]): string {
  if (!data) return "";

  const lines: string[] = [
    "# Segmentation",
    "",
    "By Campaign",
    toCSVRow(["Campaign", "Source", "Medium", "Users", "Conversions", "Revenue ($)", "CAC ($)", "ROI"]),
  ];

  for (const c of data.byCampaign) {
    lines.push(toCSVRow([c.campaign, c.source, c.medium, c.users, c.conversions, c.revenue, c.cac, c.roi]));
  }

  lines.push("", "By Niche", toCSVRow(["Niche", "Users", "Conv Rate (%)", "Avg LTV ($)", "Churn Rate (%)"]));
  for (const n of data.byNiche) {
    lines.push(toCSVRow([n.niche, n.users, n.conversionRate, n.avgLtv, n.churnRate]));
  }

  lines.push("", "By Plan", toCSVRow(["Plan", "Users", "MRR ($)", "Churn Rate (%)", "Upgrade Rate (%)", "Downgrade Rate (%)"]));
  for (const p of data.byPlan) {
    lines.push(toCSVRow([p.plan, p.users, p.mrr, p.churnRate, p.upgradeRate, p.downgradeRate]));
  }

  lines.push("", "By Behavior", toCSVRow(["Segment", "Users", "Percentage (%)", "Avg Revenue ($)"]));
  for (const b of data.byBehavior) {
    lines.push(toCSVRow([b.segment, b.users, b.percentage, b.avgRevenue]));
  }

  lines.push("", "Lifecycle Stage", toCSVRow(["Stage", "Count"]));
  for (const [stage, count] of Object.entries(data.byLifecycle)) {
    lines.push(toCSVRow([stage, count]));
  }

  return lines.join("\n");
}

/**
 * Generate Campaigns section
 */
function exportCampaigns(data: UnifiedAnalyticsData["campaigns"]): string {
  if (!data) return "";

  const lines: string[] = [
    "# Campaigns (Email/SMS)",
    "",
    "Summary",
    toCSVRow(["Metric", "Value"]),
    toCSVRow(["Sent", data.summary.sent]),
    toCSVRow(["Delivered", data.summary.delivered]),
    toCSVRow(["Delivery Rate (%)", data.summary.deliveryRate]),
    toCSVRow(["Bounced", data.summary.bounced]),
    toCSVRow(["Bounce Rate (%)", data.summary.bounceRate]),
    "",
    "Engagement",
    toCSVRow(["Opens", data.engagement.opens]),
    toCSVRow(["Open Rate (%)", data.engagement.openRate]),
    toCSVRow(["Clicks", data.engagement.clicks]),
    toCSVRow(["CTR (%)", data.engagement.ctr]),
    toCSVRow(["CTOR (%)", data.engagement.ctor]),
    "",
    "Conversions",
    toCSVRow(["Count", data.conversions.count]),
    toCSVRow(["Rate (%)", data.conversions.rate]),
    toCSVRow(["Revenue ($)", data.conversions.revenue]),
    toCSVRow(["ROI (%)", data.conversions.roi]),
    "",
    "Individual Campaigns",
    toCSVRow(["Name", "Channel", "Sent At", "Sent", "Delivered", "Opens", "Clicks", "Conversions", "Revenue ($)"]),
  ];

  for (const c of data.byCampaign) {
    lines.push(toCSVRow([c.name, c.channel, c.sentAt, c.sent, c.delivered, c.opens, c.clicks, c.conversions, c.revenue]));
  }

  return lines.join("\n");
}

/**
 * Export unified analytics data to CSV format
 */
export function exportToCSV(data: UnifiedAnalyticsData): string {
  const sections: string[] = [
    `# Unified Analytics Report`,
    `# Time Range: ${data.timeRange ?? "N/A"}`,
    `# Generated: ${new Date().toISOString()}`,
    "",
  ];

  if (data.traffic) sections.push(exportTraffic(data.traffic), "");
  if (data.seo) sections.push(exportSEO(data.seo), "");
  if (data.conversions) sections.push(exportConversions(data.conversions), "");
  if (data.revenue) sections.push(exportRevenue(data.revenue), "");
  if (data.subscriptions) sections.push(exportSubscriptions(data.subscriptions), "");
  if (data.payments) sections.push(exportPayments(data.payments), "");
  if (data.unitEconomics) sections.push(exportUnitEconomics(data.unitEconomics), "");
  if (data.demographics) sections.push(exportDemographics(data.demographics), "");
  if (data.segmentation) sections.push(exportSegmentation(data.segmentation), "");
  if (data.campaigns) sections.push(exportCampaigns(data.campaigns), "");

  return sections.join("\n");
}

/**
 * Download CSV file in browser
 */
export function downloadCSV(data: UnifiedAnalyticsData, filename = "analytics-export.csv"): void {
  const csv = exportToCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
