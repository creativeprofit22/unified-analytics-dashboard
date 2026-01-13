"use client";

import { useId } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Re-export TrendDataPoint from TrendChart for convenience
export type { TrendDataPoint } from "../TrendChart";

interface AreaTrendChartProps {
  data: { date: string; value: number }[];
  height?: number;
  color?: string;
  className?: string;
  showGrid?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
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

export function AreaTrendChart({
  data,
  height = 150,
  color = "#3b82f6",
  className,
  showGrid = false,
}: AreaTrendChartProps) {
  // Use React's useId for SSR-safe unique ID generation
  const uniqueId = useId();
  const gradientId = `area-gradient-${uniqueId}`;

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--text-secondary)"
              opacity={0.2}
              vertical={false}
            />
          )}
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
            axisLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
            tickLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
            tickMargin={8}
          />
          <YAxis
            tickFormatter={formatValue}
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
            axisLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
            tickLine={{ stroke: "var(--text-secondary)", opacity: 0.3 }}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-primary, #1f2937)",
              border: "1px solid var(--text-secondary)",
              borderRadius: "8px",
              color: "var(--text-primary)",
            }}
            labelStyle={{ color: "var(--text-primary)" }}
            labelFormatter={(label: string) => {
              const date = new Date(label);
              return date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            }}
            formatter={(value: number | undefined) => [
              formatValue(value ?? 0),
              "Value",
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 5,
              fill: "var(--bg-primary, #1f2937)",
              stroke: color,
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaTrendChart;
