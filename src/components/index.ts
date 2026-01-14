/**
 * Dashboard UI Components
 */

export { MetricCard, type MetricCardProps } from "./MetricCard";
export { TrendChart, type TrendDataPoint } from "./TrendChart";
export { CategorySection } from "./CategorySection";
export { TimeRangePicker, type TimeRangePickerProps } from "./TimeRangePicker";
export { ComparisonToggle, type ComparisonToggleProps } from "./ComparisonToggle";
export { ComparisonView } from "./ComparisonView";
export { ThemeToggle } from "./ThemeToggle";
export { FilterPanel } from "./FilterPanel";
export { FilterChip } from "./FilterChip";
export { SectionFilterBar } from "./SectionFilterBar";
export { ExportButton } from "./ExportButton";
export { ExportModal } from "./ExportModal";
export { SettingsButton } from "./SettingsButton";
export { SettingsModal, type SettingsModalProps } from "./SettingsModal";
export { TabNavigation, DASHBOARD_TABS, type TabId, type Tab, type TabNavigationProps } from "./TabNavigation";
export { TabPanel, type TabPanelProps } from "./TabPanel";

// Recharts-based chart components
export * from "./charts";

// Dashboard with all sections and shared components
export { Dashboard } from "./dashboard";
export * from "./dashboard/sections";
export * from "./dashboard/shared";

// Alerts & Monitoring components
export * from "./alerts";

// Notifications
export * from "./notifications";

// Export
export * from "./export";

// Predictions & Forecasting
export * from "./predictions";

// Attribution
export * from "./attribution";

// ROI Calculator
export * from "./roi";

// A/B Test
export * from "./abtest";

// Report Builder
export * from "./report-builder";
