/**
 * Attribution Components
 * Marketing attribution analysis for the analytics dashboard.
 */

export { AttributionPanel } from "./AttributionPanel";
export type { AttributionPanelProps } from "./AttributionPanel";

export { AttributionModelSelector } from "./AttributionModelSelector";
export type { AttributionModelSelectorProps } from "./AttributionModelSelector";

export { TouchpointChart } from "./TouchpointChart";
export type { TouchpointChartProps } from "./TouchpointChart";

// Re-export types from AttributionPanel for convenience
export type {
  AttributionModel,
  Channel,
  ChannelAttribution,
  ModelResult,
  TouchpointPath,
  AttributionData,
} from "./AttributionPanel";
