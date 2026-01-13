"use client";

import { useId, useEffect, useRef, useCallback } from "react";
import { cn } from "@/utils/cn";

export type TabId =
  | "acquisition"
  | "conversions"
  | "revenue"
  | "economics"
  | "audience"
  | "marketing";

export interface Tab {
  id: TabId;
  label: string;
  description: string;
}

export const DASHBOARD_TABS: Tab[] = [
  { id: "acquisition", label: "Acquisition", description: "Traffic & SEO" },
  { id: "conversions", label: "Conversions", description: "Funnel Analytics" },
  { id: "revenue", label: "Revenue", description: "Revenue, Subscriptions & Payments" },
  { id: "economics", label: "Economics", description: "Unit Economics" },
  { id: "audience", label: "Audience", description: "Demographics & Segments" },
  { id: "marketing", label: "Marketing", description: "Campaigns" },
];

export interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  syncHash?: boolean;
  className?: string;
}

export function TabNavigation({
  activeTab,
  onTabChange,
  syncHash = false,
  className,
}: TabNavigationProps) {
  const id = useId();
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map());

  // Sync with URL hash on mount and hash changes
  useEffect(() => {
    if (!syncHash) return;

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as TabId;
      if (DASHBOARD_TABS.some((tab) => tab.id === hash)) {
        onTabChange(hash);
      }
    };

    // Check initial hash
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [syncHash, onTabChange]);

  // Update hash when tab changes
  useEffect(() => {
    if (!syncHash) return;

    const currentHash = window.location.hash.slice(1);
    if (currentHash !== activeTab) {
      window.history.replaceState(null, "", `#${activeTab}`);
    }
  }, [activeTab, syncHash]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = DASHBOARD_TABS.findIndex((tab) => tab.id === activeTab);
      let newIndex = currentIndex;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : DASHBOARD_TABS.length - 1;
          break;
        case "ArrowRight":
          e.preventDefault();
          newIndex = currentIndex < DASHBOARD_TABS.length - 1 ? currentIndex + 1 : 0;
          break;
        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;
        case "End":
          e.preventDefault();
          newIndex = DASHBOARD_TABS.length - 1;
          break;
        default:
          return;
      }

      const newTab = DASHBOARD_TABS[newIndex];
      if (newTab) {
        onTabChange(newTab.id);
        tabRefs.current.get(newTab.id)?.focus();
      }
    },
    [activeTab, onTabChange]
  );

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onTabChange(e.target.value as TabId);
  };

  const setTabRef = (tabId: TabId) => (el: HTMLButtonElement | null) => {
    if (el) {
      tabRefs.current.set(tabId, el);
    } else {
      tabRefs.current.delete(tabId);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile: Dropdown */}
      <div className="md:hidden">
        <label htmlFor={`${id}-select`} className="sr-only">
          Select dashboard section
        </label>
        <select
          id={`${id}-select`}
          value={activeTab}
          onChange={handleSelectChange}
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.05))] border border-[var(--border,rgba(255,255,255,0.1))] text-[var(--text-primary,rgba(255,255,255,0.95))] text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DASHBOARD_TABS.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label} - {tab.description}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: Tab Bar */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Dashboard sections"
        onKeyDown={handleKeyDown}
        className="hidden md:flex gap-1 p-1.5 rounded-xl bg-[var(--bg-secondary,rgba(255,255,255,0.03))] border border-[var(--border,rgba(255,255,255,0.05))] overflow-x-auto scrollbar-none"
      >
        {DASHBOARD_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={setTabRef(tab.id)}
              role="tab"
              id={`${id}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${id}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-[var(--text-secondary,rgba(255,255,255,0.6))] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary,rgba(255,255,255,0.08))]"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TabNavigation;
