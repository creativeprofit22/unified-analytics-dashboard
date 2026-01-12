# Campaign Metrics (Email / SMS / WhatsApp)

## Overview

Campaign metrics track the performance of outbound messaging across channels. Essential for optimizing nurture sequences and marketing ROI.

## Channels Covered

- **Email** - Traditional email campaigns and automated sequences
- **SMS** - Text message campaigns
- **WhatsApp** - WhatsApp Business messaging
- **Push Notifications** - App/web push (optional)

## Universal Campaign Metrics

### Sent

| Property | Value |
|----------|-------|
| **Definition** | Total messages dispatched |
| **Formula** | `count(messages where status = 'sent')` |
| **Data Source** | Email/SMS platform (Mailchimp, Sendgrid, Twilio, etc.) |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Line chart |

### Delivered

| Property | Value |
|----------|-------|
| **Definition** | Messages successfully received by recipient |
| **Formula** | `count(messages where status = 'delivered')` |
| **Data Source** | Platform delivery reports |
| **Update Frequency** | Real-time (with delay for email) |
| **Visualization** | Stat card |

### Delivery Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of sent messages that were delivered |
| **Formula** | `delivered / sent × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Gauge |
| **Benchmarks** | Email: >95%, SMS: >98%, WhatsApp: >95% |

### Bounces

| Property | Value |
|----------|-------|
| **Definition** | Messages that failed to deliver |
| **Types** | Hard bounce (permanent), Soft bounce (temporary) |
| **Formula** | `count(messages where status = 'bounced')` |
| **Data Source** | Platform bounce reports |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Breakdown by type |

### Bounce Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of sent messages that bounced |
| **Formula** | `bounced / sent × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |
| **Benchmarks** | < 2% healthy, > 5% list hygiene issue |

## Engagement Metrics

### Opens (Email)

| Property | Value |
|----------|-------|
| **Definition** | Unique recipients who opened the email |
| **Formula** | `count(distinct recipients who triggered open pixel)` |
| **Data Source** | Email platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Time-series chart |
| **Note** | Apple Mail Privacy Protection affects accuracy |

### Open Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of delivered emails that were opened |
| **Formula** | `unique_opens / delivered × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Gauge |
| **Benchmarks** | 15-25% typical, varies by industry |

### Read Rate (SMS/WhatsApp)

| Property | Value |
|----------|-------|
| **Definition** | Percentage of messages marked as read |
| **Formula** | `read / delivered × 100` |
| **Data Source** | Platform read receipts |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |
| **Benchmarks** | SMS: 90%+, WhatsApp: 80%+ |

### Clicks

| Property | Value |
|----------|-------|
| **Definition** | Unique recipients who clicked a link |
| **Formula** | `count(distinct recipients who clicked)` |
| **Data Source** | Platform click tracking |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Heatmap (for email) |

### Click-Through Rate (CTR)

| Property | Value |
|----------|-------|
| **Definition** | Percentage of delivered messages with clicks |
| **Formula** | `unique_clicks / delivered × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Gauge |
| **Benchmarks** | Email: 2-5%, SMS: 10-15% |

### Click-to-Open Rate (CTOR)

| Property | Value |
|----------|-------|
| **Definition** | Clicks as percentage of opens (email only) |
| **Formula** | `unique_clicks / unique_opens × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |
| **Benchmarks** | 10-20% typical |

### Replies (SMS/WhatsApp)

| Property | Value |
|----------|-------|
| **Definition** | Recipients who replied to the message |
| **Formula** | `count(inbound messages linked to campaign)` |
| **Data Source** | Platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

### Reply Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of delivered messages that got replies |
| **Formula** | `replies / delivered × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

## Conversion Metrics

### Conversions

| Property | Value |
|----------|-------|
| **Definition** | Desired actions taken after engaging with campaign |
| **Examples** | Purchase, Signup, Form submit, Appointment booked |
| **Formula** | `count(conversions attributed to campaign)` |
| **Data Source** | Platform + UTM tracking + conversion tracking |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

### Conversion Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of clicks that converted |
| **Formula** | `conversions / clicks × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

### Revenue Attributed

| Property | Value |
|----------|-------|
| **Definition** | Revenue generated from campaign |
| **Formula** | `sum(order_values where campaign_attributed)` |
| **Data Source** | E-commerce/CRM + attribution |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

### Revenue per Message

| Property | Value |
|----------|-------|
| **Definition** | Average revenue per sent message |
| **Formula** | `attributed_revenue / sent` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

### Revenue per Click

| Property | Value |
|----------|-------|
| **Definition** | Average revenue per click |
| **Formula** | `attributed_revenue / clicks` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

### ROI

| Property | Value |
|----------|-------|
| **Definition** | Return on campaign investment |
| **Formula** | `(attributed_revenue - campaign_cost) / campaign_cost × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |

## Negative Metrics

### Unsubscribes

| Property | Value |
|----------|-------|
| **Definition** | Recipients who opted out |
| **Formula** | `count(unsubscribe events)` |
| **Data Source** | Platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Alert if high |

### Unsubscribe Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of delivered messages resulting in unsubscribe |
| **Formula** | `unsubscribes / delivered × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |
| **Benchmarks** | < 0.5% healthy, > 1% concerning |

### Spam Complaints

| Property | Value |
|----------|-------|
| **Definition** | Recipients who marked message as spam |
| **Formula** | `count(spam_complaint events)` |
| **Data Source** | Platform + ISP feedback loops |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Alert |

### Spam Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of delivered resulting in spam complaint |
| **Formula** | `spam_complaints / delivered × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card |
| **Benchmarks** | < 0.1% critical threshold |

## List Health Metrics

### List Size

| Property | Value |
|----------|-------|
| **Definition** | Total subscribers/contacts |
| **Formula** | `count(active subscribers)` |
| **Data Source** | Platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Growth chart |

### List Growth Rate

| Property | Value |
|----------|-------|
| **Definition** | Net change in list size |
| **Formula** | `(new_subscribers - unsubscribes - bounces) / list_size × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Daily |
| **Visualization** | Stat card, Trend |

### New Subscribers

| Property | Value |
|----------|-------|
| **Definition** | New signups in period |
| **Formula** | `count(new subscribers)` |
| **Data Source** | Platform |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Line chart |

### Active Subscribers

| Property | Value |
|----------|-------|
| **Definition** | Subscribers who engaged recently (30/60/90 days) |
| **Formula** | `count(subscribers with open/click in period)` |
| **Data Source** | Calculated |
| **Update Frequency** | Daily |
| **Visualization** | Stat card, Percentage of total |

## Dashboard Component

```typescript
interface CampaignMetrics {
  summary: {
    sent: number;
    delivered: number;
    deliveryRate: number;
    bounced: number;
    bounceRate: number;
  };
  engagement: {
    opens: number;
    openRate: number;
    clicks: number;
    ctr: number;
    ctor: number;
    replies: number;
    replyRate: number;
  };
  conversions: {
    count: number;
    rate: number;
    revenue: number;
    revenuePerMessage: number;
    revenuePerClick: number;
    roi: number;
  };
  negative: {
    unsubscribes: number;
    unsubscribeRate: number;
    spamComplaints: number;
    spamRate: number;
  };
  listHealth: {
    totalSubscribers: number;
    newSubscribers: number;
    activeSubscribers: number;
    growthRate: number;
  };
  byChannel: {
    email: ChannelMetrics;
    sms: ChannelMetrics;
    whatsapp: ChannelMetrics;
  };
  byCampaign: Array<{
    id: string;
    name: string;
    channel: 'email' | 'sms' | 'whatsapp';
    sentAt: string;
    sent: number;
    delivered: number;
    opens: number;
    clicks: number;
    conversions: number;
    revenue: number;
    unsubscribes: number;
  }>;
}

interface ChannelMetrics {
  sent: number;
  delivered: number;
  deliveryRate: number;
  engaged: number;
  engagementRate: number;
  conversions: number;
  revenue: number;
}
```

## API Endpoint

```
GET /api/analytics/campaigns
  ?channel=email|sms|whatsapp|all
  &start=2026-01-01
  &end=2026-01-12

GET /api/analytics/campaigns/:campaignId
  ?include=clicks,conversions,timeline
```

## Mock Data Structure

```typescript
export const mockCampaignData: CampaignMetrics = {
  summary: {
    sent: 45000,
    delivered: 43200,
    deliveryRate: 96.0,
    bounced: 1800,
    bounceRate: 4.0,
  },
  engagement: {
    opens: 9504,
    openRate: 22.0,
    clicks: 1728,
    ctr: 4.0,
    ctor: 18.2,
    replies: 234,
    replyRate: 0.54,
  },
  conversions: {
    count: 432,
    rate: 25.0,
    revenue: 54890,
    revenuePerMessage: 1.22,
    revenuePerClick: 31.76,
    roi: 412,
  },
  negative: {
    unsubscribes: 189,
    unsubscribeRate: 0.44,
    spamComplaints: 12,
    spamRate: 0.03,
  },
  listHealth: {
    totalSubscribers: 28470,
    newSubscribers: 1234,
    activeSubscribers: 18540,
    growthRate: 3.2,
  },
  byChannel: {
    email: { sent: 35000, delivered: 33600, deliveryRate: 96, engaged: 7392, engagementRate: 22, conversions: 312, revenue: 42340 },
    sms: { sent: 8000, delivered: 7840, deliveryRate: 98, engaged: 1568, engagementRate: 20, conversions: 98, revenue: 9870 },
    whatsapp: { sent: 2000, delivered: 1760, deliveryRate: 88, engaged: 544, engagementRate: 31, conversions: 22, revenue: 2680 },
  },
  byCampaign: [
    { id: 'camp_001', name: 'January Newsletter', channel: 'email', sentAt: '2026-01-05', sent: 25000, delivered: 24000, opens: 5280, clicks: 960, conversions: 187, revenue: 24310, unsubscribes: 108 },
    { id: 'camp_002', name: 'Flash Sale Alert', channel: 'sms', sentAt: '2026-01-08', sent: 8000, delivered: 7840, opens: 0, clicks: 1568, conversions: 98, revenue: 9870, unsubscribes: 24 },
    { id: 'camp_003', name: 'Abandoned Cart', channel: 'email', sentAt: '2026-01-01', sent: 10000, delivered: 9600, opens: 4224, clicks: 768, conversions: 125, revenue: 18030, unsubscribes: 57 },
  ],
};
```

## Email Funnel Visualization

```
Email Campaign Funnel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent        ████████████████████████████  35,000
Delivered   ███████████████████████████   33,600 (96%)
Opened      ███████                        7,392 (22%)
Clicked     ██                             1,478 (4.4%)
Converted   █                                312 (0.9%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Revenue: $42,340 | ROI: 412%
```

## Channel Comparison

```
Channel Performance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              Delivery   Engagement   Conv Rate   Revenue
Email           96%         22%         0.9%      $42,340
SMS             98%         20%         1.2%       $9,870
WhatsApp        88%         31%         1.1%       $2,680
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
