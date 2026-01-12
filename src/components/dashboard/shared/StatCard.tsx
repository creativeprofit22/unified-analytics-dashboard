import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  icon?: ReactNode;
  prefix?: string;
}

/**
 * Reusable stat card for displaying single metrics with label/value pairs.
 * Used in traffic sources, MRR movement, device breakdown, segments, etc.
 */
export function StatCard({
  label,
  value,
  subValue,
  color,
  icon,
  prefix,
}: StatCardProps) {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div className="p-3 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.03))] text-center">
      {icon && <p className="text-2xl mb-2">{icon}</p>}
      <p className="text-xs text-[var(--text-secondary)] capitalize mb-1">
        {label}
      </p>
      <p
        className={cn("text-lg font-semibold", color ?? "text-[var(--text-primary)]")}
      >
        {prefix}
        {formattedValue}
      </p>
      {subValue && (
        <p className="text-xs text-[var(--text-secondary)]">{subValue}</p>
      )}
    </div>
  );
}

export default StatCard;
