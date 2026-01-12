import type { ReactNode } from "react";

export interface SectionHeaderProps {
  children: ReactNode;
}

/**
 * Consistent sub-section header styling.
 * Used for "Traffic by Source", "Top Queries", "MRR Movement", etc.
 */
export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
      {children}
    </h4>
  );
}

export default SectionHeader;
