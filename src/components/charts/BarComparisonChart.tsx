"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

export interface BarComparisonDataItem {
  label: string;
  value: number;
  color?: string;
}

interface BarComparisonChartProps {
  data: BarComparisonDataItem[];
  height?: number;
  color?: string;
  className?: string;
  layout?: "vertical" | "horizontal";
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

export function BarComparisonChart({
  data,
  height = 200,
  color = "#3b82f6",
  className,
  layout = "horizontal",
}: BarComparisonChartProps) {
  const isVertical = layout === "vertical";

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={isVertical ? "vertical" : "horizontal"}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--text-secondary)"
            opacity={0.2}
          />
          {isVertical ? (
            <>
              <XAxis
                type="number"
                tickFormatter={formatValue}
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
                tickLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
                tickLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
                width={80}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
                tickLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
              />
              <YAxis
                tickFormatter={formatValue}
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
                tickLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--text-secondary)",
              borderRadius: "8px",
              color: "var(--text-primary)",
            }}
            labelStyle={{ color: "var(--text-primary)" }}
            formatter={(value: number | undefined) => [formatValue(value ?? 0), "Value"]}
            cursor={{ fill: "var(--text-secondary)", opacity: 0.1 }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
