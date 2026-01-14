"use client";

import { memo, useMemo } from "react";
import type { PaymentMetrics, CardsExpiring, RecoveryByAttempt } from "@/types/analytics";
import { cn } from "@/utils/cn";
import { FailedPaymentsTable, type FailedPaymentWithCustomer } from "./FailedPaymentsTable";
import { ExpiringCardsAlert } from "./ExpiringCardsAlert";
import { RecoveryMetrics } from "./RecoveryMetrics";

// =============================================================================
// TYPES
// =============================================================================

export interface RevenueLeakageDashboardProps {
  payments: PaymentMetrics;
  /** Optional: override with enriched failed payment data that includes customer info */
  failedPaymentsWithCustomers?: FailedPaymentWithCustomer[];
  className?: string;
  onContactCustomer?: (payment: FailedPaymentWithCustomer) => void;
}

// =============================================================================
// UTILITIES
// =============================================================================

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Converts PaymentRecord[] to FailedPaymentWithCustomer[] by adding placeholder customer data.
 * In production, this would be joined with customer data from a separate source.
 */
function enrichPaymentRecords(payments: PaymentMetrics): FailedPaymentWithCustomer[] {
  const failedRecords = payments.paymentRecords?.filter((r) => !r.successful) ?? [];

  return failedRecords.map((record, index): FailedPaymentWithCustomer => {
    const planIndex = index % 3;
    const plan = planIndex === 0 ? "Starter" : planIndex === 1 ? "Pro" : "Enterprise";
    return {
      ...record,
      // Placeholder customer data - in production, join with customer table
      customerName: `Customer ${index + 1}`,
      customerEmail: `customer${index + 1}@example.com`,
      customerPlan: plan,
    };
  });
}

// =============================================================================
// SUMMARY CARD
// =============================================================================

interface SummaryCardProps {
  label: string;
  value: string;
  subValue?: string;
  color: string;
}

function SummaryCard({ label, value, subValue, color }: SummaryCardProps) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: `${color}15` }}
    >
      <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      {subValue && (
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          {subValue}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function RevenueLeakageDashboardComponent({
  payments,
  failedPaymentsWithCustomers,
  className,
  onContactCustomer,
}: RevenueLeakageDashboardProps) {
  // Derive failed payments with customer info
  const enrichedFailedPayments = useMemo(() => {
    return failedPaymentsWithCustomers ?? enrichPaymentRecords(payments);
  }, [failedPaymentsWithCustomers, payments]);

  // Calculate recovery rate from the data
  const recoveryRate = payments.recoveryRate;
  const recoveredRevenue = payments.recoveredRevenue;
  const atRiskRevenue = payments.atRiskRevenue;
  const totalAtRisk = atRiskRevenue + recoveredRevenue;

  return (
    <div
      className={cn("rounded-xl border p-6", className)}
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.02))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
        >
          Revenue Leakage
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Money you&apos;re losing right now - and how to recover it
        </p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          label="Total At-Risk Revenue"
          value={formatCurrency(totalAtRisk)}
          subValue="Failed + pending recovery"
          color="#ef4444"
        />
        <SummaryCard
          label="Recovered Revenue"
          value={formatCurrency(recoveredRevenue)}
          subValue={`${recoveryRate.toFixed(1)}% recovery rate`}
          color="#22c55e"
        />
        <SummaryCard
          label="Still At Risk"
          value={formatCurrency(atRiskRevenue)}
          subValue="Pending recovery attempts"
          color="#eab308"
        />
      </div>

      {/* Metrics Row: Recovery Metrics + Expiring Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RecoveryMetrics
          recoveryByAttempt={payments.recoveryByAttempt}
          avgTimeToRecovery={payments.avgTimeToRecovery}
          overallRecoveryRate={payments.recoveryRate}
        />
        <div className="flex flex-col gap-4">
          <ExpiringCardsAlert cardsExpiring={payments.cardsExpiringSoon} />
          {/* Additional context card */}
          <div
            className="flex-1 rounded-lg p-4"
            style={{
              backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))",
              borderColor: "var(--border-color, rgba(255,255,255,0.1))",
              border: "1px solid var(--border-color)",
            }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              Quick Actions
            </p>
            <ul className="space-y-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              <li className="flex items-center gap-2">
                <span style={{ color: "#ef4444" }}>!</span>
                Send card update reminders to {payments.cardsExpiringSoon.next30Days} customers
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: "#eab308" }}>!</span>
                Review {payments.failedPayments} failed payment cases
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: "#3b82f6" }}>i</span>
                {payments.dunningSuccessRate.toFixed(0)}% dunning success rate
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Failed Payments Table */}
      <FailedPaymentsTable
        failedPayments={enrichedFailedPayments}
        onContact={onContactCustomer}
      />
    </div>
  );
}

export const RevenueLeakageDashboard = memo(RevenueLeakageDashboardComponent);
export default RevenueLeakageDashboard;
