# Demographics Metrics

## Overview

Demographics metrics describe who your users are. Understanding audience composition helps optimize marketing, product, and content strategies.

## Metrics

### Geographic Distribution

#### Country

| Property | Value |
|----------|-------|
| **Definition** | User distribution by country |
| **Formula** | Group users/sessions by country |
| **Data Source** | Google Analytics 4, IP geolocation |
| **Update Frequency** | Real-time |
| **Visualization** | World map (choropleth), Table, Bar chart |

#### Region/State

| Property | Value |
|----------|-------|
| **Definition** | User distribution by region within countries |
| **Formula** | Group users by region dimension |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time |
| **Visualization** | Regional map, Table |

#### City

| Property | Value |
|----------|-------|
| **Definition** | User distribution by city |
| **Formula** | Group users by city dimension |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time |
| **Visualization** | Table (top cities), Map markers |

### Device Information

#### Device Type

| Property | Value |
|----------|-------|
| **Definition** | Desktop vs Mobile vs Tablet |
| **Formula** | Group sessions by device category |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time |
| **Visualization** | Donut chart, Comparison bars |
| **Trend** | Mobile typically 50-70% for consumer sites |

#### Device Model

| Property | Value |
|----------|-------|
| **Definition** | Specific device models (iPhone 14, Samsung Galaxy, etc.) |
| **Formula** | Group sessions by device model |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time |
| **Visualization** | Table (top models) |

#### Screen Resolution

| Property | Value |
|----------|-------|
| **Definition** | User screen dimensions |
| **Formula** | Group sessions by screen resolution |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Daily |
| **Visualization** | Table |

### Browser & Technology

#### Browser

| Property | Value |
|----------|-------|
| **Definition** | Web browser used |
| **Categories** | Chrome, Safari, Firefox, Edge, Samsung Internet, Other |
| **Formula** | Group sessions by browser |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time |
| **Visualization** | Donut chart, Bar chart |

#### Browser Version

| Property | Value |
|----------|-------|
| **Definition** | Specific browser versions |
| **Formula** | Group sessions by browser + version |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Daily |
| **Visualization** | Table |

#### Operating System

| Property | Value |
|----------|-------|
| **Definition** | User operating system |
| **Categories** | Windows, macOS, iOS, Android, Linux, Chrome OS |
| **Formula** | Group sessions by OS |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time |
| **Visualization** | Donut chart, Bar chart |

#### OS Version

| Property | Value |
|----------|-------|
| **Definition** | Specific OS versions |
| **Formula** | Group sessions by OS + version |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Daily |
| **Visualization** | Table |

### Language

| Property | Value |
|----------|-------|
| **Definition** | Browser/system language setting |
| **Formula** | Group sessions by language |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Real-time |
| **Visualization** | Table, Bar chart |

### User Attributes (if collected)

#### Age Range

| Property | Value |
|----------|-------|
| **Definition** | User age brackets |
| **Categories** | 18-24, 25-34, 35-44, 45-54, 55-64, 65+ |
| **Formula** | From user profiles or GA demographics |
| **Data Source** | Google Analytics 4 (with signals enabled), CRM |
| **Update Frequency** | Daily |
| **Visualization** | Bar chart, Donut |
| **Note** | Requires user consent and may not be available for all users |

#### Gender

| Property | Value |
|----------|-------|
| **Definition** | User gender |
| **Categories** | Male, Female, Unknown |
| **Formula** | From user profiles or GA demographics |
| **Data Source** | Google Analytics 4, CRM |
| **Update Frequency** | Daily |
| **Visualization** | Donut chart |
| **Note** | Requires user consent |

#### Interests

| Property | Value |
|----------|-------|
| **Definition** | User interest categories (affinity, in-market) |
| **Formula** | From GA4 audience signals |
| **Data Source** | Google Analytics 4 |
| **Update Frequency** | Daily |
| **Visualization** | Table, Word cloud |

### Network Information

#### Connection Type

| Property | Value |
|----------|-------|
| **Definition** | Network connection type |
| **Categories** | WiFi, 4G, 3G, 2G, Offline |
| **Formula** | From Network Information API |
| **Data Source** | Custom tracking |
| **Update Frequency** | Real-time |
| **Visualization** | Donut chart |

#### ISP/Network

| Property | Value |
|----------|-------|
| **Definition** | Internet service provider |
| **Formula** | From IP lookup |
| **Data Source** | IP geolocation service |
| **Update Frequency** | Daily |
| **Visualization** | Table (top ISPs) |

### Conversion Metrics by Demographic

| Property | Value |
|----------|-------|
| **Definition** | Conversion rate segmented by demographic attributes |
| **Formula** | Calculate conversion rate per segment |
| **Data Source** | Calculated |
| **Update Frequency** | Daily |
| **Visualization** | Table, Comparison charts |

## Dashboard Component

```typescript
interface DemographicsMetrics {
  geographic: {
    byCountry: Array<{
      country: string;
      countryCode: string;
      users: number;
      sessions: number;
      conversionRate: number;
    }>;
    byRegion: Array<{
      region: string;
      country: string;
      users: number;
    }>;
    byCity: Array<{
      city: string;
      country: string;
      users: number;
    }>;
  };
  device: {
    byType: Record<'desktop' | 'mobile' | 'tablet', number>;
    byModel: Array<{ model: string; users: number }>;
    byResolution: Array<{ resolution: string; users: number }>;
  };
  technology: {
    byBrowser: Record<string, number>;
    byOS: Record<string, number>;
    byLanguage: Array<{ language: string; users: number }>;
  };
  userAttributes: {
    byAge: Record<string, number>;
    byGender: Record<string, number>;
    byInterest: Array<{ interest: string; users: number }>;
  };
  conversionsBySegment: Array<{
    segment: string;
    segmentValue: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
  }>;
}
```

## API Endpoint

```
GET /api/analytics/demographics
  ?start=2026-01-01
  &end=2026-01-12
  &dimension=country|device|browser
  &limit=50
```

## Mock Data Structure

```typescript
export const mockDemographicsData: DemographicsMetrics = {
  geographic: {
    byCountry: [
      { country: 'United States', countryCode: 'US', users: 5234, sessions: 8421, conversionRate: 3.8 },
      { country: 'United Kingdom', countryCode: 'GB', users: 1876, sessions: 2943, conversionRate: 4.2 },
      { country: 'Canada', countryCode: 'CA', users: 1243, sessions: 1987, conversionRate: 3.5 },
      { country: 'Australia', countryCode: 'AU', users: 987, sessions: 1543, conversionRate: 4.1 },
      { country: 'Germany', countryCode: 'DE', users: 756, sessions: 1121, conversionRate: 2.9 },
    ],
    byRegion: [
      { region: 'California', country: 'US', users: 1234 },
      { region: 'Texas', country: 'US', users: 876 },
      { region: 'New York', country: 'US', users: 754 },
    ],
    byCity: [
      { city: 'New York', country: 'US', users: 543 },
      { city: 'Los Angeles', country: 'US', users: 432 },
      { city: 'London', country: 'UK', users: 387 },
    ],
  },
  device: {
    byType: {
      desktop: 5432,
      mobile: 6234,
      tablet: 1181,
    },
    byModel: [
      { model: 'iPhone', users: 3421 },
      { model: 'Samsung Galaxy', users: 1234 },
      { model: 'iPad', users: 876 },
    ],
    byResolution: [
      { resolution: '1920x1080', users: 2341 },
      { resolution: '1440x900', users: 1234 },
      { resolution: '375x812', users: 3421 },
    ],
  },
  technology: {
    byBrowser: {
      'Chrome': 52,
      'Safari': 28,
      'Firefox': 8,
      'Edge': 7,
      'Samsung Internet': 3,
      'Other': 2,
    },
    byOS: {
      'iOS': 32,
      'Android': 28,
      'Windows': 24,
      'macOS': 14,
      'Linux': 2,
    },
    byLanguage: [
      { language: 'en-US', users: 6543 },
      { language: 'en-GB', users: 1876 },
      { language: 'es', users: 543 },
    ],
  },
  userAttributes: {
    byAge: {
      '18-24': 12,
      '25-34': 34,
      '35-44': 28,
      '45-54': 16,
      '55-64': 7,
      '65+': 3,
    },
    byGender: {
      'Male': 54,
      'Female': 42,
      'Unknown': 4,
    },
    byInterest: [
      { interest: 'Technology', users: 4321 },
      { interest: 'Business', users: 3456 },
      { interest: 'Finance', users: 2345 },
    ],
  },
  conversionsBySegment: [
    { segment: 'device', segmentValue: 'desktop', visitors: 5432, conversions: 234, conversionRate: 4.3 },
    { segment: 'device', segmentValue: 'mobile', visitors: 6234, conversions: 187, conversionRate: 3.0 },
    { segment: 'device', segmentValue: 'tablet', visitors: 1181, conversions: 52, conversionRate: 4.4 },
  ],
};
```

## Geo Visualization

```
Top Countries by Users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🇺🇸 United States   ████████████████  5,234 (52%)
🇬🇧 United Kingdom  █████             1,876 (19%)
🇨🇦 Canada          ████              1,243 (12%)
🇦🇺 Australia       ███                 987 (10%)
🇩🇪 Germany         ██                  756 (7%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Device Distribution

```
Device Type Distribution
┌─────────────────────────────────────┐
│                                     │
│      ┌───────────────────┐          │
│      │     Mobile        │          │
│      │      48%          │          │
│      └───────────────────┘          │
│  ┌─────────────┐  ┌──────────┐      │
│  │   Desktop   │  │  Tablet  │      │
│  │     42%     │  │   10%    │      │
│  └─────────────┘  └──────────┘      │
│                                     │
└─────────────────────────────────────┘
```
