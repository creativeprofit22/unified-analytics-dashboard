"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { cn } from "@/utils/cn";
import { MetricSelector } from "./MetricSelector";
import { ReportPreview } from "./ReportPreview";
import { TemplateModal } from "./TemplateModal";
import type {
  ReportBuilderData,
  ReportTemplate,
  ReportMetric,
  MetricDefinition,
  ExportFormat,
  ReportDataPoint,
} from "@/types/report-builder";

// =============================================================================
// TYPES
// =============================================================================

export interface ReportBuilderProps {
  data: ReportBuilderData;
  className?: string;
  onSaveTemplate?: (template: Omit<ReportTemplate, "id" | "createdAt" | "updatedAt" | "createdBy" | "isDefault">) => void;
  onExport?: (format: ExportFormat, metrics: ReportMetric[]) => void;
}

interface SelectedMetric extends ReportMetric {
  definition: MetricDefinition;
  dataPoint?: ReportDataPoint;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const EXPORT_FORMATS: { value: ExportFormat; label: string; icon: string }[] = [
  { value: "csv", label: "CSV", icon: "table" },
  { value: "excel", label: "Excel", icon: "file-spreadsheet" },
  { value: "pdf", label: "PDF", icon: "file-text" },
  { value: "markdown", label: "Markdown", icon: "file-code" },
  { value: "json", label: "JSON", icon: "braces" },
  { value: "png", label: "PNG Image", icon: "image" },
];

// =============================================================================
// STATIC STYLES
// =============================================================================

const headerStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const subheaderStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const cardBgStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
};

const borderStyle = {
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface TemplateDropdownProps {
  templates: ReportTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (template: ReportTemplate | null) => void;
  onCreateNew: () => void;
}

const TemplateDropdown = memo(function TemplateDropdown({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onCreateNew,
}: TemplateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  const handleSelect = useCallback(
    (template: ReportTemplate | null) => {
      onSelectTemplate(template);
      setIsOpen(false);
    },
    [onSelectTemplate]
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
        style={{
          ...cardBgStyle,
          ...borderStyle,
          color: "var(--text-primary, rgba(255,255,255,0.95))",
        }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>{selectedTemplate?.name || "Select Template"}</span>
        <svg
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-72 rounded-lg border shadow-lg z-50"
          style={{
            backgroundColor: "var(--bg-primary, #1a1a2e)",
            ...borderStyle,
          }}
        >
          <div className="p-2">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-white/5"
              style={{
                color: selectedTemplateId === null ? "#3b82f6" : "var(--text-secondary, rgba(255,255,255,0.6))",
              }}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Start Fresh</span>
              </div>
            </button>
          </div>

          {templates.length > 0 && (
            <>
              <div
                className="border-t mx-2"
                style={borderStyle}
              />
              <div className="p-2 max-h-64 overflow-y-auto">
                <p
                  className="px-3 py-1 text-xs font-medium"
                  style={subheaderStyle}
                >
                  Saved Templates
                </p>
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelect(template)}
                    className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-white/5"
                    style={{
                      color:
                        selectedTemplateId === template.id
                          ? "#3b82f6"
                          : "var(--text-primary, rgba(255,255,255,0.95))",
                    }}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div
                      className="text-xs truncate"
                      style={subheaderStyle}
                    >
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          <div
            className="border-t p-2"
            style={borderStyle}
          >
            <button
              type="button"
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: "#3b82f6",
                color: "#ffffff",
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create New Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

interface ExportDropdownProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
}

const ExportDropdown = memo(function ExportDropdown({
  onExport,
  disabled,
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = useCallback(
    (format: ExportFormat) => {
      onExport(format);
      setIsOpen(false);
    },
    [onExport]
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{
          backgroundColor: "#22c55e",
          color: "#ffffff",
        }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>Export</span>
        <svg
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div
          className="absolute top-full right-0 mt-2 w-48 rounded-lg border shadow-lg z-50"
          style={{
            backgroundColor: "var(--bg-primary, #1a1a2e)",
            ...borderStyle,
          }}
        >
          <div className="p-2">
            {EXPORT_FORMATS.map((format) => (
              <button
                key={format.value}
                type="button"
                onClick={() => handleExport(format.value)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-white/5"
                style={headerStyle}
              >
                <span className="w-8 text-center font-mono text-xs px-1 py-0.5 rounded bg-white/10">
                  {format.value.toUpperCase()}
                </span>
                <span>{format.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

interface ActionBarProps {
  hasChanges: boolean;
  metricsCount: number;
  onSave: () => void;
  onExport: (format: ExportFormat) => void;
}

const ActionBar = memo(function ActionBar({
  hasChanges,
  metricsCount,
  onSave,
  onExport,
}: ActionBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm" style={subheaderStyle}>
        {metricsCount} metric{metricsCount !== 1 ? "s" : ""} selected
      </span>

      {hasChanges && (
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-white/5"
          style={{
            ...cardBgStyle,
            ...borderStyle,
            color: "var(--text-primary, rgba(255,255,255,0.95))",
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          Save Template
        </button>
      )}

      <ExportDropdown
        onExport={onExport}
        disabled={metricsCount === 0}
      />
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function ReportBuilderComponent({
  data,
  className,
  onSaveTemplate,
  onExport,
}: ReportBuilderProps) {
  const { availableMetrics, templates, currentReport } = data;

  // State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    currentReport?.templateId || null
  );
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>(() => {
    if (currentReport) {
      const metrics: SelectedMetric[] = [];
      for (const rm of currentReport.template.metrics) {
        const definition = availableMetrics.find((m) => m.id === rm.metricId);
        if (!definition) continue;
        const dataPoint = currentReport.dataPoints.find((dp) => dp.metricId === rm.metricId);
        metrics.push({
          ...rm,
          definition,
          dataPoint,
        });
      }
      return metrics;
    }
    return [];
  });
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Handlers
  const handleSelectTemplate = useCallback(
    (template: ReportTemplate | null) => {
      setSelectedTemplateId(template?.id || null);
      if (template) {
        const newMetrics: SelectedMetric[] = [];
        for (const rm of template.metrics) {
          const definition = availableMetrics.find((m) => m.id === rm.metricId);
          if (!definition) continue;
          const dataPoint = currentReport?.dataPoints.find((dp) => dp.metricId === rm.metricId);
          newMetrics.push({
            ...rm,
            definition,
            dataPoint,
          });
        }
        setSelectedMetrics(newMetrics);
      } else {
        setSelectedMetrics([]);
      }
      setHasChanges(false);
    },
    [availableMetrics, currentReport]
  );

  const handleAddMetric = useCallback(
    (metricId: string) => {
      const definition = availableMetrics.find((m) => m.id === metricId);
      if (!definition) return;

      // Check if already selected
      if (selectedMetrics.some((m) => m.metricId === metricId)) return;

      const dataPoint = currentReport?.dataPoints.find((dp) => dp.metricId === metricId);
      const newMetric: SelectedMetric = {
        metricId,
        order: selectedMetrics.length,
        width: "third",
        chartType: "line",
        definition,
        dataPoint,
      };

      setSelectedMetrics((prev) => [...prev, newMetric]);
      setHasChanges(true);
    },
    [availableMetrics, currentReport, selectedMetrics]
  );

  const handleRemoveMetric = useCallback((metricId: string) => {
    setSelectedMetrics((prev) =>
      prev
        .filter((m) => m.metricId !== metricId)
        .map((m, idx) => ({ ...m, order: idx }))
    );
    setHasChanges(true);
  }, []);

  const handleUpdateMetric = useCallback(
    (metricId: string, updates: Partial<Pick<ReportMetric, "width" | "chartType">>) => {
      setSelectedMetrics((prev) =>
        prev.map((m) =>
          m.metricId === metricId ? { ...m, ...updates } : m
        )
      );
      setHasChanges(true);
    },
    []
  );

  const handleReorderMetrics = useCallback((fromIndex: number, toIndex: number) => {
    setSelectedMetrics((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length) return prev;
      const newMetrics = [...prev];
      const removed = newMetrics.splice(fromIndex, 1)[0];
      if (!removed) return prev;
      newMetrics.splice(toIndex, 0, removed);
      return newMetrics.map((m, idx) => ({ ...m, order: idx }));
    });
    setHasChanges(true);
  }, []);

  const handleSaveTemplate = useCallback(
    (name: string, description: string) => {
      if (!onSaveTemplate) return;

      const metrics: ReportMetric[] = selectedMetrics.map(
        ({ metricId, order, width, chartType }) => ({
          metricId,
          order,
          width,
          chartType,
        })
      );

      onSaveTemplate({ name, description, metrics });
      setIsTemplateModalOpen(false);
      setHasChanges(false);
    },
    [onSaveTemplate, selectedMetrics]
  );

  const handleExport = useCallback(
    (format: ExportFormat) => {
      if (!onExport) return;

      const metrics: ReportMetric[] = selectedMetrics.map(
        ({ metricId, order, width, chartType }) => ({
          metricId,
          order,
          width,
          chartType,
        })
      );

      onExport(format, metrics);
    },
    [onExport, selectedMetrics]
  );

  // Memoized derived state
  const selectedMetricIds = useMemo(
    () => new Set(selectedMetrics.map((m) => m.metricId)),
    [selectedMetrics]
  );

  // Early return if no metrics available
  if (availableMetrics.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <div>
          <h2 className="text-xl font-semibold" style={headerStyle}>
            Report Builder
          </h2>
          <p className="text-sm mt-1" style={subheaderStyle}>
            No metrics available for report building.
          </p>
        </div>
        <div
          className="rounded-lg border p-8 text-center"
          style={{
            backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
            ...borderStyle,
          }}
        >
          <p style={subheaderStyle}>
            Configure your analytics data sources to start building custom reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold" style={headerStyle}>
            Report Builder
          </h2>
          <p className="text-sm mt-1" style={subheaderStyle}>
            Create custom reports by selecting and arranging metrics
          </p>
        </div>
        <TemplateDropdown
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={handleSelectTemplate}
          onCreateNew={() => setIsTemplateModalOpen(true)}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Selector (Left Panel) */}
        <div className="lg:col-span-4">
          <MetricSelector
            metrics={availableMetrics}
            selectedMetricIds={selectedMetricIds}
            onAddMetric={handleAddMetric}
          />
        </div>

        {/* Report Preview (Right Panel) */}
        <div className="lg:col-span-8">
          <ReportPreview
            metrics={selectedMetrics}
            onRemoveMetric={handleRemoveMetric}
            onUpdateMetric={handleUpdateMetric}
            onReorderMetrics={handleReorderMetrics}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div
        className="flex items-center justify-end pt-4 border-t"
        style={borderStyle}
      >
        <ActionBar
          hasChanges={hasChanges}
          metricsCount={selectedMetrics.length}
          onSave={() => setIsTemplateModalOpen(true)}
          onExport={handleExport}
        />
      </div>

      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}

export const ReportBuilder = memo(ReportBuilderComponent);
export default ReportBuilder;
