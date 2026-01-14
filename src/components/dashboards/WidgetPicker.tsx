"use client";

import { useState, useMemo, useId, useCallback } from "react";
import { cn } from "@/utils/cn";
import type {
  WidgetType,
  WidgetTypeInfo,
  DataSourceCategory,
  WidgetConfig,
} from "@/types/custom-dashboards";
import {
  WIDGET_REGISTRY,
  WIDGET_CATEGORIES,
  DATA_SOURCE_PRESETS,
  getWidgetsByCategory,
  getWidgetsForDataSource,
} from "@/lib/dashboards/widget-registry";

// =============================================================================
// TYPES
// =============================================================================

interface WidgetPickerProps {
  /** Whether the picker modal is open */
  isOpen: boolean;
  /** Callback to close the picker */
  onClose: () => void;
  /** Callback when a widget is selected to be added */
  onAddWidget: (
    type: WidgetType,
    title: string,
    dataBinding: WidgetConfig["dataBinding"]
  ) => void;
  /** Additional class name */
  className?: string;
}

type FilterMode = "category" | "source";

// =============================================================================
// ICON COMPONENTS
// =============================================================================

const icons: Record<string, React.FC<{ className?: string }>> = {
  hash: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  ),
  "trending-up": ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  layers: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  "bar-chart-2": ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  "pie-chart": ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  ),
  filter: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  gauge: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  table: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  grid: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  "scatter-chart": ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="8" cy="8" r="2" fill="currentColor" />
      <circle cx="12" cy="14" r="2" fill="currentColor" />
      <circle cx="18" cy="10" r="2" fill="currentColor" />
      <circle cx="6" cy="16" r="2" fill="currentColor" />
      <circle cx="16" cy="18" r="2" fill="currentColor" />
    </svg>
  ),
  radar: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  "git-branch": ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3v12M18 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM18 9a9 9 0 01-9 9" />
    </svg>
  ),
};

function WidgetIcon({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = icons[icon];
  if (!IconComponent) {
    return <div className={cn("w-6 h-6 bg-current rounded opacity-20", className)} />;
  }
  return <IconComponent className={className} />;
}

// =============================================================================
// DATA SOURCE LABELS
// =============================================================================

const DATA_SOURCE_LABELS: Record<DataSourceCategory, string> = {
  traffic: "Traffic & Acquisition",
  seo: "SEO",
  conversions: "Conversions",
  revenue: "Revenue",
  subscriptions: "Subscriptions",
  payments: "Payments",
  unitEconomics: "Unit Economics",
  demographics: "Demographics",
  segmentation: "Segmentation",
  campaigns: "Campaigns",
  predictions: "Predictions",
};

// =============================================================================
// WIDGET PICKER COMPONENT
// =============================================================================

export function WidgetPicker({
  isOpen,
  onClose,
  onAddWidget,
  className,
}: WidgetPickerProps) {
  const titleId = useId();
  const [filterMode, setFilterMode] = useState<FilterMode>("category");
  const [selectedCategory, setSelectedCategory] = useState<WidgetTypeInfo["category"] | null>(null);
  const [selectedSource, setSelectedSource] = useState<DataSourceCategory | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<WidgetTypeInfo | null>(null);
  const [widgetTitle, setWidgetTitle] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [step, setStep] = useState<"select" | "configure">("select");

  // Get filtered widgets based on mode and selection
  const filteredWidgets = useMemo(() => {
    if (filterMode === "category" && selectedCategory) {
      return getWidgetsByCategory(selectedCategory);
    }
    if (filterMode === "source" && selectedSource) {
      return getWidgetsForDataSource(selectedSource);
    }
    return Object.values(WIDGET_REGISTRY);
  }, [filterMode, selectedCategory, selectedSource]);

  // Get available fields for selected widget and source
  const availableFields = useMemo(() => {
    if (!selectedWidget || !selectedSource) return [];
    return DATA_SOURCE_PRESETS[selectedSource] || [];
  }, [selectedWidget, selectedSource]);

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setSelectedCategory(null);
    setSelectedSource(null);
    setSelectedWidget(null);
    setWidgetTitle("");
    setSelectedField("");
    setStep("select");
    onClose();
  }, [onClose]);

  // Handle widget selection
  const handleWidgetSelect = useCallback((widget: WidgetTypeInfo) => {
    setSelectedWidget(widget);
    setWidgetTitle(widget.name);
    if (widget.compatibleSources.length === 1) {
      setSelectedSource(widget.compatibleSources[0]!);
    }
    setStep("configure");
  }, []);

  // Handle going back to selection
  const handleBack = useCallback(() => {
    setSelectedWidget(null);
    setWidgetTitle("");
    setSelectedField("");
    setStep("select");
  }, []);

  // Handle adding the widget
  const handleAddWidget = useCallback(() => {
    console.log("🟡 WidgetPicker handleAddWidget triggered:", {
      selectedWidget: selectedWidget?.type,
      selectedSource,
      selectedField,
      widgetTitle,
    });

    if (!selectedWidget || !selectedSource || !selectedField || !widgetTitle) {
      console.warn("🔴 WidgetPicker: Missing required fields:", {
        hasWidget: !!selectedWidget,
        hasSource: !!selectedSource,
        hasField: !!selectedField,
        hasTitle: !!widgetTitle,
      });
      return;
    }

    console.log("🟢 WidgetPicker: Calling onAddWidget with:", {
      type: selectedWidget.type,
      title: widgetTitle,
      dataBinding: { source: selectedSource, field: selectedField },
    });

    onAddWidget(selectedWidget.type, widgetTitle, {
      source: selectedSource,
      field: selectedField,
    });

    handleClose();
  }, [selectedWidget, selectedSource, selectedField, widgetTitle, onAddWidget, handleClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={cn(
          "w-full max-w-3xl max-h-[80vh] rounded-lg bg-[var(--bg-primary)] shadow-xl flex flex-col",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
          <div className="flex items-center gap-3">
            {step === "configure" && (
              <button
                onClick={handleBack}
                className="p-1 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 id={titleId} className="text-lg font-semibold">
              {step === "select" ? "Add Widget" : "Configure Widget"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {(() => { console.log("🔵 WidgetPicker render:", { step, selectedWidget: selectedWidget?.type, selectedSource, selectedField, widgetTitle, availableFields: availableFields.length }); return null; })()}
          {step === "select" ? (
            <>
              {/* Filter mode toggle */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-[var(--text-secondary)]">Browse by:</span>
                <div className="flex rounded-lg border border-[var(--border-color,rgba(255,255,255,0.1))] overflow-hidden">
                  <button
                    onClick={() => {
                      setFilterMode("category");
                      setSelectedSource(null);
                    }}
                    className={cn(
                      "px-3 py-1.5 text-sm transition-colors",
                      filterMode === "category"
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    Type
                  </button>
                  <button
                    onClick={() => {
                      setFilterMode("source");
                      setSelectedCategory(null);
                    }}
                    className={cn(
                      "px-3 py-1.5 text-sm transition-colors",
                      filterMode === "source"
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    Data Source
                  </button>
                </div>
              </div>

              {/* Category/Source filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {filterMode === "category" ? (
                  <>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm border transition-colors",
                        selectedCategory === null
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                      )}
                    >
                      All
                    </button>
                    {WIDGET_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm border transition-colors",
                          selectedCategory === cat.id
                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedSource(null)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm border transition-colors",
                        selectedSource === null
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                      )}
                    >
                      All
                    </button>
                    {(Object.keys(DATA_SOURCE_LABELS) as DataSourceCategory[]).map((source) => (
                      <button
                        key={source}
                        onClick={() => setSelectedSource(source)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm border transition-colors",
                          selectedSource === source
                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                        )}
                      >
                        {DATA_SOURCE_LABELS[source]}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Widget grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredWidgets.map((widget) => (
                  <button
                    key={widget.type}
                    onClick={() => handleWidgetSelect(widget)}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all",
                      "border-[var(--border-color,rgba(255,255,255,0.1))]",
                      "hover:border-[var(--accent)] hover:bg-[var(--accent)]/5",
                      "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    )}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.05))] mb-3">
                      <WidgetIcon icon={widget.icon} className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                    <h3 className="font-medium text-sm text-[var(--text-primary)] mb-1">
                      {widget.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {widget.description}
                    </p>
                  </button>
                ))}
              </div>

              {filteredWidgets.length === 0 && (
                <div className="text-center py-12 text-[var(--text-secondary)]">
                  No widgets available for this selection.
                </div>
              )}
            </>
          ) : (
            /* Configure step */
            <div className="space-y-6">
              {/* Selected widget preview */}
              {selectedWidget && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.03))]">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--accent)]/10">
                    <WidgetIcon icon={selectedWidget.icon} className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">{selectedWidget.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{selectedWidget.description}</p>
                  </div>
                </div>
              )}

              {/* Widget title */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Widget Title
                </label>
                <input
                  type="text"
                  value={widgetTitle}
                  onChange={(e) => setWidgetTitle(e.target.value)}
                  placeholder="Enter widget title"
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border",
                    "bg-[var(--bg-secondary,rgba(255,255,255,0.03))]",
                    "border-[var(--border-color,rgba(255,255,255,0.1))]",
                    "text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  )}
                />
              </div>

              {/* Data source selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Data Source
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedWidget?.compatibleSources.map((source) => (
                    <button
                      key={source}
                      onClick={() => {
                        setSelectedSource(source);
                        setSelectedField("");
                      }}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-sm text-left transition-colors",
                        selectedSource === source
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                      )}
                    >
                      {DATA_SOURCE_LABELS[source]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field selection */}
              {selectedSource && availableFields.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Metric
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableFields.map((field) => (
                      <button
                        key={field.field}
                        onClick={() => setSelectedField(field.field)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm text-left transition-colors",
                          selectedField === field.field
                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                        )}
                      >
                        {field.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "configure" && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-color,rgba(255,255,255,0.1))]">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-[var(--border-color,rgba(255,255,255,0.1))] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAddWidget}
              disabled={!selectedWidget || !selectedSource || !selectedField || !widgetTitle}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Add Widget
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WidgetPicker;
