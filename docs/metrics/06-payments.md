# Payments Metrics

## Overview

Payment metrics track transaction success rates and revenue recovery. Critical for subscription businesses to minimize involuntary churn.

## Metrics

### Successful Payments

| Property | Value |
|----------|-------|
| **Definition** | Completed payment transactions |
| **Formula** | `count(payments where status = 'succeeded')` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Line chart |

### Failed Payments

| Property | Value |
|----------|-------|
| **Definition** | Payment attempts that did not complete |
| **Formula** | `count(payments where status = 'failed')` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Line chart, Alert threshold |

### Payment Failure Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of payment attempts that fail |
| **Formula** | `failed_payments / total_payment_attempts × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Trend line |
| **Benchmarks** | < 2% excellent, 2-5% normal, > 5% needs attention |

### Failure by Reason

| Property | Value |
|----------|-------|
| **Definition** | Breakdown of why payments failed |
| **Categories** | Card declined, Insufficient funds, Expired card, Invalid card, Fraud detection, Processing error |
| **Formula** | Group failed payments by decline_code |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Pie chart, Bar chart, Table |

### Recovery Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of failed payments eventually recovered |
| **Formula** | `recovered_payments / failed_payments × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Daily |
| **Visualization** | Stat card, Gauge |
| **Benchmarks** | 50-70% is good with proper dunning |

### Dunning Success Rate

| Property | Value |
|----------|-------|
| **Definition** | Effectiveness of payment retry attempts |
| **Formula** | `successful_retries / total_retries × 100` |
| **Data Source** | Stripe Billing |
| **Update Frequency** | Daily |
| **Visualization** | Stat card, Breakdown by retry attempt |

### Recovery by Retry Attempt

| Property | Value |
|----------|-------|
| **Definition** | Success rate for each dunning retry |
| **Breakdown** | 1st retry, 2nd retry, 3rd retry, 4th retry |
| **Data Source** | Stripe Billing |
| **Update Frequency** | Daily |
| **Visualization** | Bar chart |

### Average Time to Recovery

| Property | Value |
|----------|-------|
| **Definition** | Days between initial failure and successful recovery |
| **Formula** | `avg(recovery_date - failure_date)` |
| **Data Source** | Calculated |
| **Update Frequency** | Daily |
| **Visualization** | Stat card |

### Involuntary Churn

| Property | Value |
|----------|-------|
| **Definition** | Subscribers lost due to payment failures (not user choice) |
| **Formula** | `count(subscriptions cancelled due to payment failure)` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card, Comparison with voluntary churn |

### Involuntary Churn Rate

| Property | Value |
|----------|-------|
| **Definition** | Percentage of churn from payment failures |
| **Formula** | `involuntary_churn / total_churn × 100` |
| **Data Source** | Calculated |
| **Update Frequency** | Daily |
| **Visualization** | Stat card, Pie chart (involuntary vs voluntary) |

### Payment Method Distribution

| Property | Value |
|----------|-------|
| **Definition** | Breakdown of payment methods used |
| **Categories** | Credit card (Visa, MC, Amex), Debit card, PayPal, Apple Pay, Google Pay, Bank transfer |
| **Formula** | Group payments by payment_method |
| **Data Source** | Stripe |
| **Update Frequency** | Daily |
| **Visualization** | Pie chart, Table |

### Failure Rate by Payment Method

| Property | Value |
|----------|-------|
| **Definition** | Which payment methods fail most often |
| **Formula** | Group failure rate by payment_method |
| **Data Source** | Stripe |
| **Update Frequency** | Daily |
| **Visualization** | Bar chart |

### At-Risk Revenue

| Property | Value |
|----------|-------|
| **Definition** | MRR from subscribers with failing payments |
| **Formula** | `sum(mrr where payment status = 'past_due')` |
| **Data Source** | Stripe |
| **Update Frequency** | Real-time |
| **Visualization** | Stat card (alert style) |

### Recovered Revenue

| Property | Value |
|----------|-------|
| **Definition** | Revenue saved through dunning and recovery |
| **Formula** | `sum(recovered_payment_amounts)` |
| **Data Source** | Stripe |
| **Update Frequency** | Daily |
| **Visualization** | Stat card |

### Card Expiring Soon

| Property | Value |
|----------|-------|
| **Definition** | Subscribers with cards expiring in next 30/60/90 days |
| **Formula** | `count(subscribers where card_exp_date within period)` |
| **Data Source** | Stripe |
| **Update Frequency** | Daily |
| **Visualization** | Stat card (warning), List for action |

## Dashboard Component

```typescript
interface PaymentMetrics {
  successfulPayments: number;
  failedPayments: number;
  failureRate: number;
  failureByReason: Record<string, number>;
  recoveryRate: number;
  dunningSuccessRate: number;
  recoveryByAttempt: {
    attempt1: number;
    attempt2: number;
    attempt3: number;
    attempt4: number;
  };
  avgTimeToRecovery: number; // days
  involuntaryChurn: number;
  involuntaryChurnRate: number;
  paymentMethodDistribution: Record<string, number>;
  failureRateByMethod: Record<string, number>;
  atRiskRevenue: number;
  recoveredRevenue: number;
  cardsExpiringSoon: {
    next30Days: number;
    next60Days: number;
    next90Days: number;
  };
}
```

## API Endpoint

```
GET /api/analytics/payments
  ?start=2026-01-01
  &end=2026-01-12

GET /api/analytics/payments/at-risk
  ?threshold_days=30
```

## Mock Data Structure

```typescript
export const mockPaymentData: PaymentMetrics = {
  successfulPayments: 2847,
  failedPayments: 143,
  failureRate: 4.8,
  failureByReason: {
    'Card declined': 52,
    'Insufficient funds': 38,
    'Expired card': 24,
    'Invalid card': 12,
    'Fraud detection': 8,
    'Processing error': 9,
  },
  recoveryRate: 62.4,
  dunningSuccessRate: 58.2,
  recoveryByAttempt: {
    attempt1: 45,
    attempt2: 28,
    attempt3: 12,
    attempt4: 4,
  },
  avgTimeToRecovery: 4.2,
  involuntaryChurn: 34,
  involuntaryChurnRate: 39.1,
  paymentMethodDistribution: {
    'Visa': 42,
    'Mastercard': 28,
    'American Express': 12,
    'PayPal': 10,
    'Apple Pay': 5,
    'Other': 3,
  },
  atRiskRevenue: 7240,
  recoveredRevenue: 12450,
  cardsExpiringSoon: {
    next30Days: 47,
    next60Days: 89,
    next90Days: 156,
  },
};
```

## Failure Reasons Breakdown

```
Payment Failure Reasons
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Card declined        ████████████████  52 (36%)
Insufficient funds   ███████████       38 (27%)
Expired card         ███████           24 (17%)
Invalid card         ████              12 (8%)
Processing error     ███               9 (6%)
Fraud detection      ██                8 (6%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Dunning Sequence Visualization

```
Initial Failure → Retry 1 → Retry 2 → Retry 3 → Retry 4 → Cancelled
     100%          45%        28%       12%        4%        11%
                 recovered  recovered recovered recovered  churned
```
