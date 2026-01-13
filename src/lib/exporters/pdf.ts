/**
 * PDF Exporter
 *
 * Exports analytics data to PDF using browser print functionality.
 * Creates a styled HTML document and triggers the print dialog.
 */

import type { UnifiedAnalyticsData } from "@/types";

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
 * Create HTML table
 */
function htmlTable(headers: string[], rows: (string | number)[][]): string {
  const headerCells = headers.map((h) => `<th>${h}</th>`).join("");
  const dataRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${headerCells}</tr></thead><tbody>${dataRows}</tbody></table>`;
}

/**
 * Generate Traffic section HTML
 */
function exportTraffic(data: UnifiedAnalyticsData["traffic"]): string {
  if (!data) return "";

  return `
    <section>
      <h2>Traffic & Acquisition</h2>
      <div class="metrics-grid">
        <div class="metric"><span class="label">Sessions</span><span class="value">${fmt(data.sessions)}</span></div>
        <div class="metric"><span class="label">Unique Visitors</span><span class="value">${fmt(data.uniqueVisitors)}</span></div>
        <div class="metric"><span class="label">Bounce Rate</span><span class="value">${pct(data.bounceRate)}</span></div>
        <div class="metric"><span class="label">Avg Session</span><span class="value">${fmt(data.avgSessionDuration)}s</span></div>
      </div>
      <h3>Traffic by Source</h3>
      ${htmlTable(
        ["Source", "Sessions"],
        Object.entries(data.trafficBySource).map(([source, sessions]) => [source, fmt(sessions)])
      )}
      <h3>Core Web Vitals</h3>
      ${htmlTable(
        ["Metric", "Value"],
        [
          ["LCP", `${data.coreWebVitals.lcp}s`],
          ["FID", `${data.coreWebVitals.fid}ms`],
          ["CLS", fmt(data.coreWebVitals.cls, 2)],
        ]
      )}
    </section>
  `;
}

/**
 * Generate SEO section HTML
 */
function exportSEO(data: UnifiedAnalyticsData["seo"]): string {
  if (!data) return "";

  return `
    <section>
      <h2>SEO Metrics</h2>
      <div class="metrics-grid">
        <div class="metric"><span class="label">Visibility</span><span class="value">${fmt(data.visibilityScore, 1)}</span></div>
        <div class="metric"><span class="label">Impressions</span><span class="value">${fmt(data.impressions)}</span></div>
        <div class="metric"><span class="label">Clicks</span><span class="value">${fmt(data.clicks)}</span></div>
        <div class="metric"><span class="label">CTR</span><span class="value">${pct(data.ctr)}</span></div>
      </div>
      <h3>Keyword Rankings</h3>
      ${htmlTable(
        ["Keyword", "Position", "Change", "Volume"],
        data.keywordRankings.slice(0, 5).map((kw) => [
          kw.keyword,
          kw.position,
          kw.change > 0 ? `+${kw.change}` : kw.change,
          fmt(kw.volume),
        ])
      )}
    </section>
  `;
}

/**
 * Generate Conversions section HTML
 */
function exportConversions(data: UnifiedAnalyticsData["conversions"]): string {
  if (!data) return "";

  return `
    <section>
      <h2>Conversions & Funnel</h2>
      <div class="metrics-grid">
        <div class="metric"><span class="label">Conversion Rate</span><span class="value">${pct(data.conversionRate)}</span></div>
        <div class="metric"><span class="label">Total Conversions</span><span class="value">${fmt(data.totalConversions)}</span></div>
        <div class="metric"><span class="label">Cart Abandonment</span><span class="value">${pct(data.cartAbandonmentRate)}</span></div>
        <div class="metric"><span class="label">Checkout Completion</span><span class="value">${pct(data.checkoutCompletionRate)}</span></div>
      </div>
      <h3>Funnel</h3>
      ${htmlTable(
        ["Step", "Users", "Drop Off Rate"],
        data.funnel.map((s) => [s.step, fmt(s.users), pct(s.dropOffRate)])
      )}
    </section>
  `;
}

/**
 * Generate Revenue section HTML
 */
function exportRevenue(data: UnifiedAnalyticsData["revenue"]): string {
  if (!data) return "";

  return `
    <section>
      <h2>Revenue & Orders</h2>
      <div class="metrics-grid">
        <div class="metric"><span class="label">Gross Revenue</span><span class="value">${currency(data.grossRevenue)}</span></div>
        <div class="metric"><span class="label">Net Revenue</span><span class="value">${currency(data.netRevenue)}</span></div>
        <div class="metric"><span class="label">Transactions</span><span class="value">${fmt(data.transactions)}</span></div>
        <div class="metric"><span class="label">AOV</span><span class="value">${currency(data.aov)}</span></div>
      </div>
      <h3>Revenue by Product</h3>
      ${htmlTable(
        ["Product", "Revenue", "Units"],
        data.revenueByProduct.map((p) => [p.productName, currency(p.revenue), fmt(p.units)])
      )}
    </section>
  `;
}

/**
 * Generate Subscriptions section HTML
 */
function exportSubscriptions(data: UnifiedAnalyticsData["subscriptions"]): string {
  if (!data) return "";

  return `
    <section>
      <h2>Subscriptions & Retention</h2>
      <div class="metrics-grid">
        <div class="metric"><span class="label">Active Subscribers</span><span class="value">${fmt(data.activeSubscribers)}</span></div>
        <div class="metric"><span class="label">MRR</span><span class="value">${currency(data.mrr)}</span></div>
        <div class="metric"><span class="label">Churn Rate</span><span class="value">${pct(data.churnRate.monthly)}</span></div>
        <div class="metric"><span class="label">LTV</span><span class="value">${currency(data.subscriberLtv)}</span></div>
      </div>
      <h3>MRR Movement</h3>
      ${htmlTable(
        ["Type", "Amount"],
        [
          ["New", currency(data.mrrMovement.new)],
          ["Expansion", currency(data.mrrMovement.expansion)],
          ["Contraction", `-${currency(data.mrrMovement.contraction)}`],
          ["Churned", `-${currency(data.mrrMovement.churned)}`],
          ["Net", currency(data.mrrMovement.net)],
        ]
      )}
    </section>
  `;
}

/**
 * Generate Unit Economics section HTML
 */
function exportUnitEconomics(data: UnifiedAnalyticsData["unitEconomics"]): string {
  if (!data) return "";

  return `
    <section>
      <h2>Unit Economics</h2>
      <div class="metrics-grid">
        <div class="metric"><span class="label">CAC</span><span class="value">${currency(data.cac)}</span></div>
        <div class="metric"><span class="label">LTV</span><span class="value">${currency(data.ltv)}</span></div>
        <div class="metric"><span class="label">LTV:CAC</span><span class="value">${fmt(data.ltvCacRatio, 1)}x</span></div>
        <div class="metric"><span class="label">Gross Margin</span><span class="value">${pct(data.grossMargin)}</span></div>
      </div>
    </section>
  `;
}

/**
 * Generate Campaigns section HTML
 */
function exportCampaigns(data: UnifiedAnalyticsData["campaigns"]): string {
  if (!data) return "";

  return `
    <section>
      <h2>Campaigns</h2>
      <div class="metrics-grid">
        <div class="metric"><span class="label">Sent</span><span class="value">${fmt(data.summary.sent)}</span></div>
        <div class="metric"><span class="label">Open Rate</span><span class="value">${pct(data.engagement.openRate)}</span></div>
        <div class="metric"><span class="label">CTR</span><span class="value">${pct(data.engagement.ctr)}</span></div>
        <div class="metric"><span class="label">Revenue</span><span class="value">${currency(data.conversions.revenue)}</span></div>
      </div>
      <h3>Recent Campaigns</h3>
      ${htmlTable(
        ["Name", "Channel", "Sent", "Opens", "Clicks", "Revenue"],
        data.byCampaign.slice(0, 5).map((c) => [
          c.name,
          c.channel,
          fmt(c.sent),
          fmt(c.opens),
          fmt(c.clicks),
          currency(c.revenue),
        ])
      )}
    </section>
  `;
}

/**
 * Generate full PDF HTML document
 */
function generatePDFHTML(data: UnifiedAnalyticsData): string {
  const styles = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px;
        line-height: 1.4;
        color: #1a1a2e;
        padding: 20px;
      }
      header {
        text-align: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e0e0e0;
      }
      header h1 { font-size: 24px; margin-bottom: 8px; }
      header p { color: #666; font-size: 12px; }
      section {
        margin-bottom: 24px;
        page-break-inside: avoid;
      }
      h2 {
        font-size: 16px;
        color: #1a1a2e;
        margin-bottom: 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid #e0e0e0;
      }
      h3 {
        font-size: 12px;
        color: #444;
        margin: 12px 0 8px;
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 16px;
      }
      .metric {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 6px;
        text-align: center;
      }
      .metric .label {
        display: block;
        font-size: 10px;
        color: #666;
        margin-bottom: 4px;
      }
      .metric .value {
        display: block;
        font-size: 18px;
        font-weight: 600;
        color: #1a1a2e;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }
      th, td {
        padding: 6px 8px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }
      th {
        background: #f8f9fa;
        font-weight: 600;
        color: #444;
      }
      tr:nth-child(even) { background: #fafafa; }
      @media print {
        body { padding: 0; }
        section { page-break-inside: avoid; }
      }
    </style>
  `;

  const sections: string[] = [];
  if (data.traffic) sections.push(exportTraffic(data.traffic));
  if (data.seo) sections.push(exportSEO(data.seo));
  if (data.conversions) sections.push(exportConversions(data.conversions));
  if (data.revenue) sections.push(exportRevenue(data.revenue));
  if (data.subscriptions) sections.push(exportSubscriptions(data.subscriptions));
  if (data.unitEconomics) sections.push(exportUnitEconomics(data.unitEconomics));
  if (data.campaigns) sections.push(exportCampaigns(data.campaigns));

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Analytics Report</title>
      ${styles}
    </head>
    <body>
      <header>
        <h1>Unified Analytics Report</h1>
        <p>Time Range: ${data.timeRange ?? "N/A"} | Generated: ${new Date().toLocaleDateString()}</p>
      </header>
      ${sections.join("")}
    </body>
    </html>
  `;
}

/**
 * Export to PDF by opening print dialog in a new window
 */
export function exportToPDF(data: UnifiedAnalyticsData): void {
  const html = generatePDFHTML(data);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow popups to export PDF");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Download as HTML file (alternative to print)
 */
export function downloadPDFHTML(
  data: UnifiedAnalyticsData,
  filename = "analytics-report.html"
): void {
  const html = generatePDFHTML(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
