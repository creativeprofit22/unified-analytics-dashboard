/**
 * Dashboard UI Components
 */

export { MetricCard, type MetricCardProps } from "./MetricCard";
export { TrendChart, type TrendDataPoint } from "./TrendChart";
export { CategorySection } from "./CategorySection";
export { TimeRangePicker, type TimeRangePickerProps } from "./TimeRangePicker";

// Recharts-based chart components
export * from "./charts";

// Dashboard with all sections and shared components
export { Dashboard } from "./dashboard";
export * from "./dashboard/sections";
export * from "./dashboard/shared";
