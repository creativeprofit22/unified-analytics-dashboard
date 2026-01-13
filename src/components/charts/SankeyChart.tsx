"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export interface SankeyNode {
  name: string;
  color?: string;
  itemStyle?: { color: string };
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyChartProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  height?: number;
  className?: string;
  orientation?: "horizontal" | "vertical";
  nodeWidth?: number;
  nodeGap?: number;
}

function formatValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toString();
}

// Default colors for nodes without explicit color
const defaultColors = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#f97316", // orange
];

export function SankeyChart({
  nodes,
  links,
  height = 400,
  className,
  orientation = "horizontal",
  nodeWidth = 20,
  nodeGap = 10,
}: SankeyChartProps) {
  // Calculate total value for percentage calculations
  const totalValue = links.reduce((sum, link) => sum + link.value, 0);

  // Build a map of node colors for gradient links
  const nodeColorMap = new Map<string, string>();
  nodes.forEach((node, index) => {
    const color =
      node.itemStyle?.color ||
      node.color ||
      defaultColors[index % defaultColors.length];
    nodeColorMap.set(node.name, color!);
  });

  // Prepare nodes with colors
  const processedNodes = nodes.map((node, index) => ({
    name: node.name,
    itemStyle: {
      color:
        node.itemStyle?.color ||
        node.color ||
        defaultColors[index % defaultColors.length],
      borderColor: "var(--bg-primary, #1f2937)",
      borderWidth: 1,
    },
  }));

  // Prepare links with gradient colors
  const processedLinks = links.map((link) => {
    const sourceColor = nodeColorMap.get(link.source) || defaultColors[0];
    const targetColor = nodeColorMap.get(link.target) || defaultColors[1];

    return {
      source: link.source,
      target: link.target,
      value: link.value,
      lineStyle: {
        color: {
          type: "linear" as const,
          x: orientation === "horizontal" ? 0 : 0.5,
          y: orientation === "horizontal" ? 0.5 : 0,
          x2: orientation === "horizontal" ? 1 : 0.5,
          y2: orientation === "horizontal" ? 0.5 : 1,
          colorStops: [
            { offset: 0, color: `${sourceColor}99` },
            { offset: 1, color: `${targetColor}99` },
          ],
        },
      },
    };
  });

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      backgroundColor: "var(--bg-primary, #1f2937)",
      borderColor: "var(--border-color, rgba(255,255,255,0.1))",
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: "var(--text-primary)",
        fontSize: 13,
      },
      extraCssText:
        "border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);",
      formatter: (params: unknown) => {
        const p = params as {
          dataType: string;
          data: {
            source?: string;
            target?: string;
            value?: number;
            name?: string;
          };
          name?: string;
          value?: number;
        };

        if (p.dataType === "edge") {
          // Link tooltip
          const source = p.data.source || "";
          const target = p.data.target || "";
          const value = p.data.value || 0;
          const percentage =
            totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : "0.0";
          const sourceColor = nodeColorMap.get(source) || "#3b82f6";
          const targetColor = nodeColorMap.get(target) || "#22c55e";

          return `<div style="min-width: 160px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${sourceColor};"></span>
              <span style="font-weight: 500;">${source}</span>
              <span style="color: var(--text-secondary);">→</span>
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${targetColor};"></span>
              <span style="font-weight: 500;">${target}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.1));">
              <span style="color: var(--text-secondary);">Value</span>
              <span style="font-weight: 600;">${formatValue(value)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
              <span style="color: var(--text-secondary);">% of Total</span>
              <span style="font-weight: 500; color: var(--text-secondary);">${percentage}%</span>
            </div>
          </div>`;
        } else {
          // Node tooltip
          const nodeName = p.name || "";
          const nodeValue = p.value || 0;
          const nodeColor = nodeColorMap.get(nodeName) || "#3b82f6";

          // Calculate incoming and outgoing values
          const incoming = links
            .filter((l) => l.target === nodeName)
            .reduce((sum, l) => sum + l.value, 0);
          const outgoing = links
            .filter((l) => l.source === nodeName)
            .reduce((sum, l) => sum + l.value, 0);

          return `<div style="min-width: 140px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 2px; background: ${nodeColor};"></span>
              <span style="font-weight: 600; font-size: 14px;">${nodeName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Total</span>
              <span style="font-weight: 600;">${formatValue(nodeValue)}</span>
            </div>
            ${
              incoming > 0
                ? `<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
              <span style="color: var(--text-secondary);">Incoming</span>
              <span style="color: #22c55e;">${formatValue(incoming)}</span>
            </div>`
                : ""
            }
            ${
              outgoing > 0
                ? `<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
              <span style="color: var(--text-secondary);">Outgoing</span>
              <span style="color: #3b82f6;">${formatValue(outgoing)}</span>
            </div>`
                : ""
            }
          </div>`;
        }
      },
    },
    animation: true,
    animationDuration: 300,
    animationEasing: "cubicOut",
    series: [
      {
        type: "sankey",
        orient: orientation,
        nodeWidth: nodeWidth,
        nodeGap: nodeGap,
        draggable: true,
        layoutIterations: 32,
        emphasis: {
          focus: "adjacency",
          lineStyle: {
            opacity: 0.8,
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: "var(--text-primary, #ffffff)",
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
        },
        blur: {
          lineStyle: {
            opacity: 0.1,
          },
          itemStyle: {
            opacity: 0.3,
          },
        },
        lineStyle: {
          curveness: 0.5,
          opacity: 0.6,
        },
        label: {
          show: true,
          position: orientation === "horizontal" ? "right" : "bottom",
          color: "var(--text-primary)",
          fontSize: 12,
          fontWeight: 500,
          distance: 5,
          formatter: (params: unknown) => {
            const p = params as { name: string };
            return p.name;
          },
        },
        labelLayout: {
          hideOverlap: true,
        },
        data: processedNodes,
        links: processedLinks,
      },
    ],
  };

  return (
    <div className={className}>
      <ReactECharts
        option={option}
        style={{ height, width: "100%" }}
        opts={{ renderer: "svg" }}
      />
    </div>
  );
}

export default SankeyChart;
