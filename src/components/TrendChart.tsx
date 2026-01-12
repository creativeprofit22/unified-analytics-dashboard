import { useId, useMemo } from "react";
import { cn } from "@/utils/cn";

export interface TrendDataPoint {
  date: string; // ISO 8601 date string
  value: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  height?: number;
  color?: string;
  className?: string;
}

// Extracted constants to avoid recreating objects on each render
const CHART_PADDING = 8;
const DOT_RADIUS = 4;

export function TrendChart({
  data,
  height = 120,
  color = "#3b82f6",
  className,
}: TrendChartProps) {

  // Use React's useId for SSR-safe unique ID generation
  const uniqueId = useId();
  const gradientId = `trend-gradient-${uniqueId}`;

  const { path, gradientPath, points, viewBox } = useMemo(() => {
    if (!data || data.length === 0) {
      return { path: "", gradientPath: "", points: [], viewBox: "0 0 100 100" };
    }

    const values = data.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1; // Prevent division by zero

    // Use a fixed viewBox width for calculations
    const viewBoxWidth = 400;
    const viewBoxHeight = height;

    const chartWidth = viewBoxWidth - CHART_PADDING * 2;
    const chartHeight = viewBoxHeight - CHART_PADDING * 2;

    // Calculate normalized points
    const calculatedPoints = data.map((point, index) => {
      const x =
        CHART_PADDING +
        (data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2);
      const y =
        CHART_PADDING +
        chartHeight -
        ((point.value - minValue) / valueRange) * chartHeight;

      return { x, y, ...point };
    });

    // Generate SVG path for the line
    const linePath = calculatedPoints
      .map((point, index) => {
        const command = index === 0 ? "M" : "L";
        return `${command} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
      })
      .join(" ");

    // Generate path for gradient fill (closed shape)
    const lastPoint = calculatedPoints[calculatedPoints.length - 1];
    const gradientFillPath =
      calculatedPoints.length > 0 && lastPoint
        ? `${linePath} L ${lastPoint.x.toFixed(2)} ${viewBoxHeight - CHART_PADDING} L ${CHART_PADDING} ${viewBoxHeight - CHART_PADDING} Z`
        : "";

    return {
      path: linePath,
      gradientPath: gradientFillPath,
      points: calculatedPoints,
      viewBox: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
    };
  }, [data, height]);

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-[var(--text-muted,#6b7280)]",
          className
        )}
        style={{ height }}
      >
        <span className="text-sm">No data available</span>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Trend chart"
      >
        <defs>
          {/* Gradient fill for area under the line */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* Gradient fill area */}
        {gradientPath && (
          <path
            d={gradientPath}
            fill={`url(#${gradientId})`}
            className="transition-all duration-300"
          />
        )}

        {/* Main line */}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Data point dots */}
        {points.map((point, index) => (
          <circle
            key={`${point.date}-${index}`}
            cx={point.x}
            cy={point.y}
            r={DOT_RADIUS}
            fill="var(--bg-primary, #1f2937)"
            stroke={color}
            strokeWidth={2}
            className="transition-all duration-300"
            style={{ cursor: 'pointer' }}
          >
            <title>
              {new Date(point.date).toLocaleDateString()}: {point.value}
            </title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

export default TrendChart;
