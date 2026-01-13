"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export interface PieDataItem {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

interface PieDistributionChartProps {
  data: PieDataItem[];
  height?: number;
  className?: string;
  showLegend?: boolean;
  innerRadius?: number;
}

const DEFAULT_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export function PieDistributionChart({
  data,
  height = 200,
  className,
  showLegend = true,
  innerRadius = 0,
}: PieDistributionChartProps) {
  const getColor = (index: number, item: PieDataItem) => {
    return item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColor(index, entry)}
                stroke="var(--bg-primary)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--text-secondary)",
              borderRadius: "8px",
              color: "var(--text-primary)",
            }}
            labelStyle={{
              color: "var(--text-primary)",
            }}
            itemStyle={{
              color: "var(--text-secondary)",
            }}
          />
          {showLegend && (
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{
                color: "var(--text-primary)",
              }}
              formatter={(value) => (
                <span style={{ color: "var(--text-secondary)" }}>{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
