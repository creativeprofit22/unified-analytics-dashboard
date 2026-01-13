"use client";

import type { EChartsOption } from "echarts";

/**
 * Interactive chart features utility
 * Provides reusable configurations for drill-down, brush selection,
 * data zoom, and cross-chart highlighting
 */

// ============== DATA ZOOM ==============

export interface DataZoomConfig {
  enabled?: boolean;
  type?: "slider" | "inside" | "both";
  orient?: "horizontal" | "vertical";
  showSlider?: boolean;
  startPercent?: number;
  endPercent?: number;
}

export function getDataZoomOptions(config: DataZoomConfig = {}): EChartsOption["dataZoom"] {
  const {
    enabled = true,
    type = "both",
    orient = "horizontal",
    showSlider = true,
    startPercent = 0,
    endPercent = 100,
  } = config;

  if (!enabled) return [];

  const result: EChartsOption["dataZoom"] = [];
  const xAxisIndex = orient === "horizontal" ? 0 : undefined;
  const yAxisIndex = orient === "vertical" ? 0 : undefined;

  // Inside zoom (scroll/pinch)
  if (type === "inside" || type === "both") {
    result.push({
      type: "inside",
      xAxisIndex,
      yAxisIndex,
      start: startPercent,
      end: endPercent,
      zoomOnMouseWheel: true,
      moveOnMouseMove: true,
      moveOnMouseWheel: false,
    });
  }

  // Slider zoom
  if ((type === "slider" || type === "both") && showSlider) {
    result.push({
      type: "slider",
      xAxisIndex,
      yAxisIndex,
      start: startPercent,
      end: endPercent,
      height: orient === "horizontal" ? 20 : undefined,
      width: orient === "vertical" ? 20 : undefined,
      bottom: orient === "horizontal" ? 5 : undefined,
      right: orient === "vertical" ? 5 : undefined,
      backgroundColor: "var(--bg-primary, #1f2937)",
      borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      fillerColor: "rgba(59, 130, 246, 0.2)",
      handleStyle: {
        color: "#3b82f6",
        borderColor: "#3b82f6",
      },
      textStyle: {
        color: "var(--text-secondary)",
        fontSize: 10,
      },
      dataBackground: {
        lineStyle: {
          color: "var(--text-secondary)",
          opacity: 0.3,
        },
        areaStyle: {
          color: "var(--text-secondary)",
          opacity: 0.1,
        },
      },
    });
  }

  return result;
}

// ============== BRUSH SELECTION ==============

export interface BrushConfig {
  enabled?: boolean;
  toolbox?: boolean;
  type?: ("rect" | "polygon" | "lineX" | "lineY" | "keep" | "clear")[];
  brushLink?: "all" | number[];
  outOfBrush?: {
    colorAlpha?: number;
  };
}

export function getBrushOptions(config: BrushConfig = {}): {
  brush?: EChartsOption["brush"];
  toolbox?: EChartsOption["toolbox"];
} {
  const {
    enabled = true,
    toolbox = true,
    type = ["rect", "polygon", "lineX", "lineY", "keep", "clear"],
    brushLink = "all",
    outOfBrush = { colorAlpha: 0.1 },
  } = config;

  if (!enabled) return {};

  const result: { brush?: EChartsOption["brush"]; toolbox?: EChartsOption["toolbox"] } = {
    brush: {
      toolbox: type,
      brushLink,
      outOfBrush: {
        colorAlpha: outOfBrush.colorAlpha,
      },
      brushStyle: {
        borderWidth: 1,
        color: "rgba(59, 130, 246, 0.2)",
        borderColor: "#3b82f6",
      },
    },
  };

  if (toolbox) {
    result.toolbox = {
      feature: {
        brush: {
          type: type.filter((t) => t !== "keep" && t !== "clear") as ("rect" | "polygon" | "lineX" | "lineY")[],
          title: {
            rect: "Rectangle selection",
            polygon: "Polygon selection",
            lineX: "Horizontal selection",
            lineY: "Vertical selection",
          },
        },
      },
      right: 20,
      top: 10,
      iconStyle: {
        borderColor: "var(--text-secondary)",
      },
      emphasis: {
        iconStyle: {
          borderColor: "#3b82f6",
        },
      },
    };
  }

  return result;
}

// ============== DRILL-DOWN ==============

export interface DrillDownConfig<T = unknown> {
  enabled?: boolean;
  onDrillDown?: (data: T, level: number) => void;
  onDrillUp?: () => void;
  breadcrumbs?: string[];
}

export interface DrillDownState {
  level: number;
  path: string[];
}

// Hook-like function to manage drill-down state
export function createDrillDownState(initialPath: string[] = []): DrillDownState {
  return {
    level: initialPath.length,
    path: initialPath,
  };
}

export function drillDown(state: DrillDownState, item: string): DrillDownState {
  return {
    level: state.level + 1,
    path: [...state.path, item],
  };
}

export function drillUp(state: DrillDownState): DrillDownState {
  if (state.level === 0) return state;
  return {
    level: state.level - 1,
    path: state.path.slice(0, -1),
  };
}

// ============== CROSS-CHART HIGHLIGHTING ==============

export interface LinkedHighlightConfig {
  groupId?: string;
  enabled?: boolean;
}

// Event types for cross-chart communication
export type HighlightEvent = {
  type: "highlight" | "downplay";
  groupId: string;
  dataIndex?: number;
  seriesIndex?: number;
  name?: string;
};

// Simple event emitter for cross-chart communication
class ChartEventBus {
  private listeners: Map<string, Set<(event: HighlightEvent) => void>> = new Map();

  subscribe(groupId: string, callback: (event: HighlightEvent) => void): () => void {
    if (!this.listeners.has(groupId)) {
      this.listeners.set(groupId, new Set());
    }
    this.listeners.get(groupId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(groupId)?.delete(callback);
    };
  }

  emit(event: HighlightEvent): void {
    const callbacks = this.listeners.get(event.groupId);
    if (callbacks) {
      callbacks.forEach((callback) => callback(event));
    }
  }
}

export const chartEventBus = new ChartEventBus();

// ============== GRID ADJUSTMENT ==============

export function getGridWithDataZoom(
  baseGrid: NonNullable<EChartsOption["grid"]>,
  hasHorizontalZoom: boolean,
  hasVerticalZoom: boolean
): EChartsOption["grid"] {
  const grid = { ...baseGrid } as {
    left?: number | string;
    right?: number | string;
    top?: number | string;
    bottom?: number | string;
  };

  if (hasHorizontalZoom) {
    const currentBottom = typeof grid.bottom === "number" ? grid.bottom : 30;
    grid.bottom = currentBottom + 30;
  }

  if (hasVerticalZoom) {
    const currentRight = typeof grid.right === "number" ? grid.right : 10;
    grid.right = currentRight + 30;
  }

  return grid;
}

// ============== TOOLTIP ENHANCEMENT ==============

export interface EnhancedTooltipConfig {
  showPercentChange?: boolean;
  showRanking?: boolean;
  showTotal?: boolean;
  customFields?: { label: string; value: (data: unknown) => string }[];
}

export function formatTooltipWithComparison(
  currentValue: number,
  previousValue: number | undefined,
  formatFn: (v: number) => string = (v) => v.toLocaleString()
): string {
  if (previousValue === undefined) {
    return formatFn(currentValue);
  }

  const diff = currentValue - previousValue;
  const percentChange = previousValue !== 0 ? ((diff / previousValue) * 100).toFixed(1) : "0.0";
  const arrow = diff >= 0 ? "↑" : "↓";
  const changeColor = diff >= 0 ? "#22c55e" : "#ef4444";

  return `${formatFn(currentValue)} <span style="color: ${changeColor}; margin-left: 8px;">${arrow} ${Math.abs(Number(percentChange))}%</span>`;
}

// ============== ANIMATION PRESETS ==============

export const animationPresets = {
  fast: {
    animation: true,
    animationDuration: 150,
    animationEasing: "cubicOut" as const,
  },
  normal: {
    animation: true,
    animationDuration: 300,
    animationEasing: "cubicOut" as const,
  },
  slow: {
    animation: true,
    animationDuration: 500,
    animationEasing: "cubicInOut" as const,
  },
  bounce: {
    animation: true,
    animationDuration: 400,
    animationEasing: "elasticOut" as const,
  },
};

// ============== THEME COLORS ==============

export const chartColors = {
  primary: "#3b82f6",
  secondary: "#22c55e",
  warning: "#eab308",
  danger: "#ef4444",
  info: "#06b6d4",
  purple: "#8b5cf6",
  pink: "#ec4899",
  palette: ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"],
};

export default {
  getDataZoomOptions,
  getBrushOptions,
  createDrillDownState,
  drillDown,
  drillUp,
  chartEventBus,
  getGridWithDataZoom,
  formatTooltipWithComparison,
  animationPresets,
  chartColors,
};
