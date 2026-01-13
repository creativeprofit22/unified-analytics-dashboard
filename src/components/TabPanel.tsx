"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import type { TabId } from "./TabNavigation";
import { cn } from "@/utils/cn";

export interface TabPanelProps {
  tabId: TabId;
  activeTab: TabId;
  children: ReactNode;
  className?: string;
}

export function TabPanel({
  tabId,
  activeTab,
  children,
  className,
}: TabPanelProps) {
  const id = useId();
  const isActive = tabId === activeTab;

  // Don't render inactive panels to reduce DOM size and improve performance
  if (!isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`${id}-panel-${tabId}`}
      aria-labelledby={`${id}-tab-${tabId}`}
      tabIndex={0}
      className={cn("focus:outline-none", className)}
    >
      {children}
    </div>
  );
}

export default TabPanel;
