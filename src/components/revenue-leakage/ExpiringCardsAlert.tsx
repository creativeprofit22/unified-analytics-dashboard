"use client";

import { memo } from "react";
import { cn } from "@/utils/cn";
import type { CardsExpiring } from "@/types/analytics";

interface ExpiringCardsAlertProps {
  cardsExpiring: CardsExpiring;
  className?: string;
}

const urgencyConfig = [
  {
    key: "next30Days" as const,
    label: "30 Days",
    bgColor: "rgba(239, 68, 68, 0.15)",
    textColor: "#ef4444",
  },
  {
    key: "next60Days" as const,
    label: "60 Days",
    bgColor: "rgba(234, 179, 8, 0.15)",
    textColor: "#eab308",
  },
  {
    key: "next90Days" as const,
    label: "90 Days",
    bgColor: "rgba(59, 130, 246, 0.15)",
    textColor: "#3b82f6",
  },
] as const;

export const ExpiringCardsAlert = memo(function ExpiringCardsAlert({
  cardsExpiring,
  className,
}: ExpiringCardsAlertProps) {
  const totalExpiring =
    cardsExpiring.next30Days +
    cardsExpiring.next60Days +
    cardsExpiring.next90Days;

  return (
    <div
      className={cn("rounded-lg p-4", className)}
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Header */}
      <p
        className="text-sm font-medium mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        {totalExpiring} cards expiring soon
      </p>

      {/* Urgency Cards */}
      <div className="flex gap-3">
        {urgencyConfig.map((config) => (
          <div
            key={config.key}
            className="flex-1 rounded-md p-3 text-center"
            style={{
              backgroundColor: config.bgColor,
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: config.textColor }}
            >
              {cardsExpiring[config.key]}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {config.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});
