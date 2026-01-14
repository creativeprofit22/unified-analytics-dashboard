"use client";

import { memo, useState, useMemo, useCallback } from "react";
import type { PaymentRecord, RecoveryStatus } from "@/types";
import { cn } from "@/utils/cn";

// =============================================================================
// TYPES
// =============================================================================

export interface FailedPaymentWithCustomer extends PaymentRecord {
  customerName: string;
  customerEmail: string;
  customerPlan: string;
}

export interface FailedPaymentsTableProps {
  failedPayments: FailedPaymentWithCustomer[];
  className?: string;
  onContact?: (payment: FailedPaymentWithCustomer) => void;
}

type FilterStatus = RecoveryStatus | "all";
type SortField = "amount" | "customerName" | "timestamp";
type SortDirection = "asc" | "desc";

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

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRecoveryStatusColor(status: RecoveryStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case "pending":
      return {
        bg: "rgba(234, 179, 8, 0.15)",
        text: "#eab308",
        border: "rgba(234, 179, 8, 0.3)",
      };
    case "recovered":
      return {
        bg: "rgba(34, 197, 94, 0.15)",
        text: "#22c55e",
        border: "rgba(34, 197, 94, 0.3)",
      };
    case "failed":
      return {
        bg: "rgba(239, 68, 68, 0.15)",
        text: "#ef4444",
        border: "rgba(239, 68, 68, 0.3)",
      };
  }
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface RecoveryBadgeProps {
  status: RecoveryStatus;
}

function RecoveryBadge({ status }: RecoveryBadgeProps) {
  const colors = getRecoveryStatusColor(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: colors.text }}
      />
      {status}
    </span>
  );
}

interface FilterButtonProps {
  label: string;
  value: FilterStatus;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function FilterButton({ label, value, count, isActive, onClick }: FilterButtonProps) {
  const colors = value === "all"
    ? { bg: "rgba(255, 255, 255, 0.05)", text: "var(--text-secondary)", border: "rgba(255, 255, 255, 0.1)" }
    : getRecoveryStatusColor(value);
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
        isActive && "ring-1"
      )}
      style={{
        backgroundColor: isActive ? colors.bg : "transparent",
        color: isActive ? colors.text : "var(--text-secondary)",
        borderColor: isActive ? colors.border : "transparent",
        "--tw-ring-color": isActive ? colors.border : "transparent",
      } as React.CSSProperties}
    >
      {label} ({count})
    </button>
  );
}

interface SortHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}

function SortHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
  align = "left",
}: SortHeaderProps) {
  const isActive = currentField === field;
  return (
    <th
      className={cn(
        "py-2 pr-4 cursor-pointer hover:opacity-80 transition-opacity",
        align === "right" && "text-right"
      )}
      style={{ color: "var(--text-secondary)" }}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-xs">{direction === "asc" ? "\u2191" : "\u2193"}</span>
        )}
      </span>
    </th>
  );
}

interface ContactButtonProps {
  onClick?: () => void;
}

function ContactButton({ onClick }: ContactButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-md text-xs font-medium transition-all hover:opacity-80"
      style={{
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        color: "#3b82f6",
        border: "1px solid rgba(59, 130, 246, 0.3)",
      }}
    >
      Contact
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function FailedPaymentsTableComponent({
  failedPayments,
  className,
  onContact,
}: FailedPaymentsTableProps) {
  // State
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortField, setSortField] = useState<SortField>("amount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Compute summary stats
  const summaryStats = useMemo(() => {
    const totalFailed = failedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingRecovery = failedPayments
      .filter((p) => p.recoveryStatus === "pending")
      .reduce((sum, p) => sum + p.amount, 0);
    const recoveredAmount = failedPayments
      .filter((p) => p.recoveryStatus === "recovered")
      .reduce((sum, p) => sum + p.amount, 0);
    return { totalFailed, pendingRecovery, recoveredAmount };
  }, [failedPayments]);

  // Compute counts by recovery status
  const counts = useMemo(() => {
    return {
      all: failedPayments.length,
      pending: failedPayments.filter((p) => p.recoveryStatus === "pending").length,
      recovered: failedPayments.filter((p) => p.recoveryStatus === "recovered").length,
      failed: failedPayments.filter((p) => p.recoveryStatus === "failed").length,
    };
  }, [failedPayments]);

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let result = [...failedPayments];

    // Apply filter
    if (filterStatus !== "all") {
      result = result.filter((p) => p.recoveryStatus === filterStatus);
    }

    // Apply sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "customerName":
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case "timestamp":
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [failedPayments, filterStatus, sortField, sortDirection]);

  // Handle sort click
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("desc");
      }
    },
    [sortField]
  );

  return (
    <div
      className={cn("rounded-lg border", className)}
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}>
        <h4
          className="text-sm font-medium mb-4"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Failed Payments
        </h4>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          >
            <p className="text-xs mb-1" style={{ color: "#ef4444" }}>
              Total Failed Amount
            </p>
            <p className="text-lg font-semibold" style={{ color: "#ef4444" }}>
              {formatCurrency(summaryStats.totalFailed)}
            </p>
          </div>
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "rgba(234, 179, 8, 0.1)" }}
          >
            <p className="text-xs mb-1" style={{ color: "#eab308" }}>
              Pending Recovery
            </p>
            <p className="text-lg font-semibold" style={{ color: "#eab308" }}>
              {formatCurrency(summaryStats.pendingRecovery)}
            </p>
          </div>
          <div
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
          >
            <p className="text-xs mb-1" style={{ color: "#22c55e" }}>
              Recovered Amount
            </p>
            <p className="text-lg font-semibold" style={{ color: "#22c55e" }}>
              {formatCurrency(summaryStats.recoveredAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
      >
        <span
          className="text-xs mr-2"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          Filter:
        </span>
        <FilterButton
          label="All"
          value="all"
          count={counts.all}
          isActive={filterStatus === "all"}
          onClick={() => setFilterStatus("all")}
        />
        <FilterButton
          label="Pending"
          value="pending"
          count={counts.pending}
          isActive={filterStatus === "pending"}
          onClick={() => setFilterStatus("pending")}
        />
        <FilterButton
          label="Recovered"
          value="recovered"
          count={counts.recovered}
          isActive={filterStatus === "recovered"}
          onClick={() => setFilterStatus("recovered")}
        />
        <FilterButton
          label="Failed"
          value="failed"
          count={counts.failed}
          isActive={filterStatus === "failed"}
          onClick={() => setFilterStatus("failed")}
        />
      </div>

      {/* Table */}
      <div className="p-4 overflow-x-auto">
        {filteredPayments.length === 0 ? (
          <div
            className="py-8 text-center text-sm"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            No payments match the selected filter.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left border-b"
                style={{ borderColor: "var(--border-color, rgba(255,255,255,0.1))" }}
              >
                <SortHeader
                  label="Customer"
                  field="customerName"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <th
                  className="py-2 pr-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Plan
                </th>
                <SortHeader
                  label="Amount"
                  field="amount"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
                <th
                  className="py-2 pr-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Failure Reason
                </th>
                <th
                  className="py-2 pr-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Recovery Status
                </th>
                <SortHeader
                  label="Date"
                  field="timestamp"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <th
                  className="py-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b hover:bg-[var(--bg-tertiary,rgba(255,255,255,0.02))] transition-colors"
                  style={{ borderColor: "var(--border-color, rgba(255,255,255,0.05))" }}
                >
                  <td className="py-3 pr-4">
                    <div>
                      <p style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}>
                        {payment.customerName}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary, rgba(255,255,255,0.5))" }}
                      >
                        {payment.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td
                    className="py-3 pr-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {payment.customerPlan}
                  </td>
                  <td
                    className="py-3 pr-4 text-right font-medium"
                    style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
                  >
                    {formatCurrency(payment.amount)}
                  </td>
                  <td
                    className="py-3 pr-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {payment.failureReason || "Unknown"}
                  </td>
                  <td className="py-3 pr-4">
                    {payment.recoveryStatus && (
                      <RecoveryBadge status={payment.recoveryStatus} />
                    )}
                  </td>
                  <td
                    className="py-3 pr-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {formatDate(payment.timestamp)}
                  </td>
                  <td className="py-3">
                    <ContactButton onClick={() => onContact?.(payment)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export const FailedPaymentsTable = memo(FailedPaymentsTableComponent);
export default FailedPaymentsTable;
