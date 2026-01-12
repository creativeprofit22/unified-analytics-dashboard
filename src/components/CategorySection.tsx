"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CategorySectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  collapsed?: boolean;
  collapsible?: boolean;
}

export function CategorySection({
  title,
  description,
  children,
  className,
  collapsed: initialCollapsed = false,
  collapsible = false,
}: CategorySectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed((prev) => !prev);
    }
  };

  return (
    <section
      className={cn(
        "rounded-lg border border-[var(--border-color,rgba(255,255,255,0.1))]",
        "bg-[var(--section-bg,rgba(255,255,255,0.02))]",
        "p-4 sm:p-6",
        className
      )}
    >
      {/* Section Header */}
      <header
        className={cn(
          "flex items-start justify-between gap-4",
          collapsible && "cursor-pointer select-none",
          !isCollapsed && "pb-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]"
        )}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (collapsible && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleToggle();
          }
        }}
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? !isCollapsed : undefined}
      >
        <div className="flex-1 min-w-0">
          <h2
            className={cn(
              "text-lg font-semibold",
              "text-[var(--text-primary,rgba(255,255,255,0.95))]"
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "mt-1 text-sm",
                "text-[var(--text-secondary,rgba(255,255,255,0.6))]"
              )}
            >
              {description}
            </p>
          )}
        </div>

        {/* Collapse Toggle Icon */}
        {collapsible && (
          <span
            className={cn(
              "flex-shrink-0 w-5 h-5 flex items-center justify-center",
              "text-[var(--text-secondary,rgba(255,255,255,0.6))]",
              "transition-transform duration-200",
              isCollapsed && "rotate-180"
            )}
            aria-hidden="true"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </header>

      {/* Section Content - uses CSS grid for smooth height animation */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
        )}
      >
        <div className="overflow-hidden">
          <div className={cn("pt-4", "space-y-4")}>{children}</div>
        </div>
      </div>
    </section>
  );
}

export default CategorySection;
