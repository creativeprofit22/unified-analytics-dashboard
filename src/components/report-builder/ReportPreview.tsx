"use client";

import { memo, useCallback, useState } from "react";
import { cn } from "@/utils/cn";
import { MetricCard } from "./MetricCard";
import type {
  ReportMetric,
  MetricDefinition,
  ReportDataPoint,
  MetricWidth,
  ChartType,
} from "@/types/report-builder";

// =============================================================================
// TYPES
// =============================================================================

export interface SelectedMetric extends ReportMetric {
  definition: MetricDefinition;
  dataPoint?: ReportDataPoint;
}

export interface ReportPreviewProps {
  metrics: SelectedMetric[];
  onRemoveMetric: (metricId: string) => void;
  onUpdateMetric: (metricId: string, updates: Partial<Pick<ReportMetric, "width" | "chartType">>) => void;
  onReorderMetrics: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

// =============================================================================
// STATIC STYLES
// =============================================================================

const headerStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const subheaderStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const borderStyle = {
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface DropZoneProps {
  isActive: boolean;
  onDrop: (e: React.DragEvent) => void;
}

const DropZone = memo(function DropZone({ isActive, onDrop }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      onDrop(e);
    },
    [onDrop]
  );

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 rounded-lg border-2 border-dashed transition-all duration-200 z-10",
        isDragOver ? "border-blue-500 bg-blue-500/10" : "border-blue-500/30 bg-blue-500/5"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <svg
            className={cn(
              "w-12 h-12 mx-auto mb-2 transition-transform",
              isDragOver && "scale-110"
            )}
            style={{ color: isDragOver ? "#3b82f6" : "var(--text-secondary, rgba(255,255,255,0.4))" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <p
            className="text-sm font-medium"
            style={{ color: isDragOver ? "#3b82f6" : "var(--text-secondary, rgba(255,255,255,0.6))" }}
          >
            {isDragOver ? "Drop to add metric" : "Drop metrics here"}
          </p>
        </div>
      </div>
    </div>
  );
});

interface EmptyStateProps {
  onDrop: (e: React.DragEvent) => void;
}

const EmptyState = memo(function EmptyState({ onDrop }: EmptyStateProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      onDrop(e);
    },
    [onDrop]
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 rounded-lg border-2 border-dashed transition-all",
        isDragOver ? "border-blue-500 bg-blue-500/10" : "border-gray-600"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <svg
        className={cn(
          "w-16 h-16 mb-4 transition-transform",
          isDragOver && "scale-110"
        )}
        style={{ color: isDragOver ? "#3b82f6" : "var(--text-secondary, rgba(255,255,255,0.3))" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
        />
      </svg>
      <p
        className="text-lg font-medium mb-1"
        style={{ color: isDragOver ? "#3b82f6" : "var(--text-primary, rgba(255,255,255,0.95))" }}
      >
        {isDragOver ? "Drop to add metric" : "Your report is empty"}
      </p>
      <p className="text-sm" style={subheaderStyle}>
        Drag metrics from the left panel or click the + button to add them
      </p>
    </div>
  );
});

interface PreviewHeaderProps {
  metricsCount: number;
}

const PreviewHeader = memo(function PreviewHeader({ metricsCount }: PreviewHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b" style={borderStyle}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            style={{ color: "#22c55e" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <h3 className="text-sm font-semibold" style={headerStyle}>
            Preview Mode
          </h3>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: metricsCount > 0 ? "#22c55e20" : "var(--bg-tertiary, rgba(255,255,255,0.05))",
            color: metricsCount > 0 ? "#22c55e" : "var(--text-secondary, rgba(255,255,255,0.6))",
          }}
        >
          {metricsCount} metric{metricsCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs" style={subheaderStyle}>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-blue-500" />
          Full
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-amber-500" />
          Half
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-purple-500" />
          Third
        </span>
      </div>
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ReportPreviewComponent({
  metrics,
  onRemoveMetric,
  onUpdateMetric,
  onReorderMetrics,
  className,
}: ReportPreviewProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingExternal, setIsDraggingExternal] = useState(false);

  // Handle external drag (from MetricSelector)
  const handleExternalDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/json")) {
      setIsDraggingExternal(true);
    }
  }, []);

  const handleExternalDragLeave = useCallback(() => {
    setIsDraggingExternal(false);
  }, []);

  const handleExternalDrop = useCallback((e: React.DragEvent) => {
    setIsDraggingExternal(false);
    try {
      const data = e.dataTransfer.getData("application/json");
      if (data) {
        const metric = JSON.parse(data) as MetricDefinition;
        // The parent component handles adding via onAddMetric
        // For now we just need to receive the drop
        const event = new CustomEvent("metric-dropped", { detail: metric });
        window.dispatchEvent(event);
      }
    } catch {
      // Invalid JSON, ignore
    }
  }, []);

  // Handle internal reordering
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== targetIndex) {
        onReorderMetrics(draggedIndex, targetIndex);
        setDraggedIndex(targetIndex);
      }
    },
    [draggedIndex, onReorderMetrics]
  );

  // Metric card handlers
  const handleWidthChange = useCallback(
    (metricId: string, width: MetricWidth) => {
      onUpdateMetric(metricId, { width });
    },
    [onUpdateMetric]
  );

  const handleChartTypeChange = useCallback(
    (metricId: string, chartType: ChartType) => {
      onUpdateMetric(metricId, { chartType });
    },
    [onUpdateMetric]
  );

  // Calculate width classes
  const getWidthClass = (width: MetricWidth): string => {
    switch (width) {
      case "full":
        return "col-span-12";
      case "half":
        return "col-span-12 md:col-span-6";
      case "third":
        return "col-span-12 md:col-span-6 lg:col-span-4";
      default:
        return "col-span-12 md:col-span-6 lg:col-span-4";
    }
  };

  return (
    <div
      id="report-preview"
      className={cn("rounded-lg border relative", className)}
      style={{
        backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
        ...borderStyle,
      }}
      onDragOver={handleExternalDragOver}
      onDragLeave={handleExternalDragLeave}
    >
      {/* Header */}
      <PreviewHeader metricsCount={metrics.length} />

      {/* Content */}
      <div className="p-4 min-h-[400px] relative">
        {/* Drop zone overlay for external drag */}
        <DropZone isActive={isDraggingExternal} onDrop={handleExternalDrop} />

        {metrics.length === 0 ? (
          <EmptyState onDrop={handleExternalDrop} />
        ) : (
          <div className="grid grid-cols-12 gap-4">
            {metrics.map((metric, index) => (
              <div
                key={metric.metricId}
                className={cn(
                  getWidthClass(metric.width),
                  "transition-all duration-200",
                  draggedIndex === index && "opacity-50 scale-95"
                )}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
              >
                <MetricCard
                  metric={metric}
                  onRemove={() => onRemoveMetric(metric.metricId)}
                  onWidthChange={(width) => handleWidthChange(metric.metricId, width)}
                  onChartTypeChange={(chartType) => handleChartTypeChange(metric.metricId, chartType)}
                  isDragging={draggedIndex === index}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Width Indicators Legend */}
      {metrics.length > 0 && (
        <div className="p-4 border-t" style={borderStyle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs" style={subheaderStyle}>
              <span>Drag cards to reorder</span>
              <span className="text-gray-600">|</span>
              <span>Use controls to resize</span>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors hover:bg-white/5"
              style={{
                backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))",
                color: "var(--text-secondary, rgba(255,255,255,0.6))",
              }}
              onClick={() => {
                // Trigger PNG export capture
                const event = new CustomEvent("export-png-request");
                window.dispatchEvent(event);
              }}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Capture Preview
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const ReportPreview = memo(ReportPreviewComponent);
export default ReportPreview;
