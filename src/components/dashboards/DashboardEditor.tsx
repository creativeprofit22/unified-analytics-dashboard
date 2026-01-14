"use client";

import {
  useState,
  useCallback,
  useMemo,
  useId,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import type {
  Widget,
  WidgetType,
  WidgetConfig,
  SavedDashboard,
  DashboardLayout,
  DashboardInput,
} from "@/types/custom-dashboards";
import {
  createWidget,
  DASHBOARD_TEMPLATES,
  type DashboardTemplateKey,
} from "@/lib/dashboards/widget-registry";
import { WidgetGrid } from "./WidgetGrid";
import { WidgetPicker } from "./WidgetPicker";

// =============================================================================
// TYPES
// =============================================================================

interface DashboardEditorProps {
  /** Initial dashboard to edit (null for new dashboard) */
  initialDashboard?: SavedDashboard | null;
  /** Callback when dashboard is saved */
  onSave?: (dashboard: DashboardInput) => void;
  /** Callback when dashboard is saved as new */
  onSaveAs?: (dashboard: DashboardInput) => void;
  /** Callback when editor is closed */
  onClose?: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Render function for widget content based on analytics data */
  renderWidget: (widget: Widget) => ReactNode;
  /** Additional class name */
  className?: string;
}

// =============================================================================
// DEFAULT LAYOUT
// =============================================================================

const defaultLayout: DashboardLayout = {
  columns: 12,
  rowHeight: 80,
  gap: 16,
  padding: 16,
  breakpoints: {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
  },
  columnsPerBreakpoint: {
    lg: 12,
    md: 10,
    sm: 6,
    xs: 4,
  },
  compactType: "vertical",
};

// =============================================================================
// DASHBOARD EDITOR COMPONENT
// =============================================================================

export function DashboardEditor({
  initialDashboard,
  onSave,
  onSaveAs,
  onClose,
  isSaving = false,
  renderWidget,
  className,
}: DashboardEditorProps) {
  const nameInputId = useId();
  const descInputId = useId();

  // Editor state
  const [dashboardName, setDashboardName] = useState(initialDashboard?.name || "Untitled Dashboard");
  const [dashboardDescription, setDashboardDescription] = useState(initialDashboard?.description || "");
  const [widgets, setWidgets] = useState<Widget[]>(initialDashboard?.widgets || []);
  const [layout] = useState<DashboardLayout>(initialDashboard?.layout || defaultLayout);
  const [editMode, setEditMode] = useState(true);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [saveAsName, setSaveAsName] = useState("");
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track if dashboard is new
  const isNewDashboard = !initialDashboard?.id;

  // Debug: track re-renders
  console.log("🔷 DashboardEditor render:", { widgetsCount: widgets.length, editMode, showWidgetPicker });

  // Handle widget layout changes
  const handleLayoutChange = useCallback((updatedWidgets: Widget[]) => {
    setWidgets(updatedWidgets);
    setHasUnsavedChanges(true);
  }, []);

  // Handle widget selection
  const handleWidgetSelect = useCallback((widget: Widget) => {
    setSelectedWidget(widget);
  }, []);

  // Handle widget deletion
  const handleWidgetDelete = useCallback((widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    setSelectedWidget(null);
    setHasUnsavedChanges(true);
  }, []);

  // Handle adding a new widget
  const handleAddWidget = useCallback(
    (type: WidgetType, title: string, dataBinding: WidgetConfig["dataBinding"]) => {
      console.log("🟢 DashboardEditor.handleAddWidget called:", { type, title, dataBinding });

      try {
        // Find the lowest available y position
        let maxY = 0;
        for (const widget of widgets) {
          const pos = widget.position.lg;
          const bottom = pos.y + pos.h;
          if (bottom > maxY) maxY = bottom;
        }
        console.log("🟢 Calculated maxY:", maxY, "from", widgets.length, "existing widgets");

        const newWidget = createWidget(type, title, dataBinding, { x: 0, y: maxY });
        console.log("🟢 Created widget:", newWidget.id, newWidget.title, "visible:", newWidget.visible);

        setWidgets((prev) => {
          const updated = [...prev, newWidget];
          console.log("🟢 Widgets state updating:", prev.length, "→", updated.length, "widgets");
          return updated;
        });
        setHasUnsavedChanges(true);
        console.log("🟢 handleAddWidget completed successfully");
      } catch (error) {
        console.error("🔴 Error in handleAddWidget:", error);
      }
    },
    [widgets]
  );

  // Handle loading a template
  const handleLoadTemplate = useCallback((templateKey: DashboardTemplateKey) => {
    const template = DASHBOARD_TEMPLATES[templateKey];
    const newWidgets = template.widgets.map((w) =>
      createWidget(w.type, w.title, w.dataBinding, w.position)
    );
    setWidgets(newWidgets);
    setDashboardName(template.name);
    setDashboardDescription(template.description);
    setShowTemplates(false);
    setHasUnsavedChanges(true);
  }, []);

  // Handle clearing all widgets
  const handleClearAll = useCallback(() => {
    if (widgets.length === 0) return;
    if (window.confirm("Are you sure you want to remove all widgets?")) {
      setWidgets([]);
      setHasUnsavedChanges(true);
    }
  }, [widgets.length]);

  // Build dashboard input for saving
  const buildDashboardInput = useCallback(
    (name?: string): DashboardInput => ({
      name: name || dashboardName,
      description: dashboardDescription,
      widgets,
      layout,
    }),
    [dashboardName, dashboardDescription, widgets, layout]
  );

  // Handle save
  const handleSave = useCallback(() => {
    if (!dashboardName.trim()) {
      alert("Please enter a dashboard name");
      return;
    }
    onSave?.(buildDashboardInput());
    setHasUnsavedChanges(false);
  }, [dashboardName, buildDashboardInput, onSave]);

  // Handle save as
  const handleSaveAs = useCallback(() => {
    if (!saveAsName.trim()) {
      alert("Please enter a name for the new dashboard");
      return;
    }
    onSaveAs?.(buildDashboardInput(saveAsName));
    setShowSaveAsModal(false);
    setSaveAsName("");
    setHasUnsavedChanges(false);
  }, [saveAsName, buildDashboardInput, onSaveAs]);

  // Handle close with unsaved changes warning
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        return;
      }
    }
    onClose?.();
  }, [hasUnsavedChanges, onClose]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--border-color,rgba(255,255,255,0.1))] bg-[var(--bg-primary)]">
        {/* Left side - Dashboard info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close editor"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <input
              id={nameInputId}
              type="text"
              value={dashboardName}
              onChange={(e) => {
                setDashboardName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="Dashboard Name"
              className={cn(
                "w-full bg-transparent border-none outline-none",
                "text-lg font-semibold text-[var(--text-primary)]",
                "placeholder:text-[var(--text-secondary)]",
                "focus:outline-none"
              )}
            />
            <input
              id={descInputId}
              type="text"
              value={dashboardDescription}
              onChange={(e) => {
                setDashboardDescription(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="Add a description..."
              className={cn(
                "w-full bg-transparent border-none outline-none",
                "text-sm text-[var(--text-secondary)]",
                "placeholder:text-[var(--text-secondary)]/50",
                "focus:outline-none"
              )}
            />
          </div>
        </div>

        {/* Center - Actions */}
        <div className="flex items-center gap-2">
          {/* Add widget button */}
          <button
            onClick={() => setShowWidgetPicker(true)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Widget
          </button>

          {/* Templates dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "border border-[var(--border-color,rgba(255,255,255,0.1))]",
                "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Templates
            </button>

            {showTemplates && (
              <div className="absolute top-full right-0 mt-1 w-64 rounded-lg border border-[var(--border-color,rgba(255,255,255,0.1))] bg-[var(--bg-primary)] shadow-xl z-50">
                <div className="p-2">
                  {(Object.keys(DASHBOARD_TEMPLATES) as DashboardTemplateKey[]).map((key) => {
                    const template = DASHBOARD_TEMPLATES[key];
                    return (
                      <button
                        key={key}
                        onClick={() => handleLoadTemplate(key)}
                        className="w-full px-3 py-2 rounded-lg text-left hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        <div className="font-medium text-sm text-[var(--text-primary)]">
                          {template.name}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {template.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Clear all button */}
          <button
            onClick={handleClearAll}
            disabled={widgets.length === 0}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              "border border-[var(--border-color,rgba(255,255,255,0.1))]",
              "text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400/50",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[var(--text-secondary)] disabled:hover:border-[var(--border-color,rgba(255,255,255,0.1))]"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        </div>

        {/* Right side - Mode toggle & Save */}
        <div className="flex items-center gap-3">
          {/* Edit mode toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.03))]">
            <button
              onClick={() => setEditMode(true)}
              className={cn(
                "px-2 py-1 rounded text-sm transition-colors",
                editMode
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Edit
            </button>
            <button
              onClick={() => setEditMode(false)}
              className={cn(
                "px-2 py-1 rounded text-sm transition-colors",
                !editMode
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Preview
            </button>
          </div>

          {/* Save buttons */}
          {!isNewDashboard && (
            <button
              onClick={() => {
                setSaveAsName(dashboardName + " (Copy)");
                setShowSaveAsModal(true);
              }}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "border border-[var(--border-color,rgba(255,255,255,0.1))]",
                "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              )}
            >
              Save As
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving || !dashboardName.trim()}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              "bg-green-600 text-white hover:bg-green-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isNewDashboard ? "Create" : "Save"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="px-4 py-1 text-xs text-amber-400 bg-amber-400/10 border-b border-amber-400/20">
          You have unsaved changes
        </div>
      )}

      {/* Widget count */}
      <div className="px-4 py-2 text-sm text-[var(--text-secondary)] border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
        {widgets.length} widget{widgets.length !== 1 ? "s" : ""}
        {editMode && " - Drag to reposition, resize from corners"}
      </div>

      {/* Grid area */}
      <div className="flex-1 overflow-auto bg-[var(--bg-primary)]">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary,rgba(255,255,255,0.05))] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No widgets yet
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md">
              Start building your custom dashboard by adding widgets or loading a template.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWidgetPicker(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Widget
              </button>
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Use Template
              </button>
            </div>
          </div>
        ) : (
          <WidgetGrid
            widgets={widgets}
            layout={layout}
            editMode={editMode}
            onLayoutChange={handleLayoutChange}
            onWidgetSelect={handleWidgetSelect}
            onWidgetDelete={handleWidgetDelete}
            renderWidget={renderWidget}
          />
        )}
      </div>

      {/* Widget Picker Modal */}
      <WidgetPicker
        isOpen={showWidgetPicker}
        onClose={() => setShowWidgetPicker(false)}
        onAddWidget={handleAddWidget}
      />

      {/* Save As Modal */}
      {showSaveAsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSaveAsModal(false);
          }}
        >
          <div className="w-full max-w-md rounded-lg bg-[var(--bg-primary)] p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Save Dashboard As</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                New Dashboard Name
              </label>
              <input
                type="text"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                placeholder="Enter name"
                className={cn(
                  "w-full px-3 py-2 rounded-lg border",
                  "bg-[var(--bg-secondary,rgba(255,255,255,0.03))]",
                  "border-[var(--border-color,rgba(255,255,255,0.1))]",
                  "text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                )}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveAsModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border-color,rgba(255,255,255,0.1))] text-sm font-medium hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAs}
                disabled={!saveAsName.trim()}
                className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardEditor;
