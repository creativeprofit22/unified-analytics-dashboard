"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
  type DragEvent,
  type MouseEvent,
} from "react";
import { cn } from "@/utils/cn";
import type {
  Widget,
  GridPosition,
  DashboardLayout,
  DEFAULT_DASHBOARD_LAYOUT,
} from "@/types/custom-dashboards";

// =============================================================================
// TYPES
// =============================================================================

interface WidgetGridProps {
  /** Widgets to render in the grid */
  widgets: Widget[];
  /** Layout configuration */
  layout?: DashboardLayout;
  /** Whether the grid is in edit mode (allows drag/drop) */
  editMode?: boolean;
  /** Callback when widget positions change */
  onLayoutChange?: (widgets: Widget[]) => void;
  /** Callback when a widget is selected for editing */
  onWidgetSelect?: (widget: Widget) => void;
  /** Callback when a widget should be deleted */
  onWidgetDelete?: (widgetId: string) => void;
  /** Render function for widget content */
  renderWidget: (widget: Widget) => ReactNode;
  /** Additional class name */
  className?: string;
}

interface DragState {
  isDragging: boolean;
  widgetId: string | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
}

interface ResizeState {
  isResizing: boolean;
  widgetId: string | null;
  handle: "se" | "sw" | "ne" | "nw" | "e" | "w" | "s" | "n" | null;
  startWidth: number;
  startHeight: number;
  startX: number;
  startY: number;
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
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the current breakpoint based on window width.
 */
function getCurrentBreakpoint(
  width: number,
  breakpoints: DashboardLayout["breakpoints"]
): "lg" | "md" | "sm" | "xs" {
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  if (width >= breakpoints.sm) return "sm";
  return "xs";
}

/**
 * Get widget position for current breakpoint.
 */
function getWidgetPosition(
  widget: Widget,
  breakpoint: "lg" | "md" | "sm" | "xs"
): GridPosition {
  return (
    widget.position[breakpoint] ||
    widget.position.md ||
    widget.position.sm ||
    widget.position.lg
  );
}

/**
 * Calculate cell dimensions based on container width.
 */
function calculateCellDimensions(
  containerWidth: number,
  columns: number,
  gap: number,
  padding: number
): { cellWidth: number } {
  const availableWidth = containerWidth - padding * 2 - gap * (columns - 1);
  const cellWidth = availableWidth / columns;
  return { cellWidth };
}

/**
 * Convert pixel position to grid coordinates.
 */
function pixelToGrid(
  px: number,
  py: number,
  cellWidth: number,
  rowHeight: number,
  gap: number,
  padding: number
): { gridX: number; gridY: number } {
  const gridX = Math.round((px - padding) / (cellWidth + gap));
  const gridY = Math.round((py - padding) / (rowHeight + gap));
  return { gridX: Math.max(0, gridX), gridY: Math.max(0, gridY) };
}

/**
 * Convert grid coordinates to pixel position.
 */
function gridToPixel(
  gridX: number,
  gridY: number,
  cellWidth: number,
  rowHeight: number,
  gap: number,
  padding: number
): { px: number; py: number } {
  const px = padding + gridX * (cellWidth + gap);
  const py = padding + gridY * (rowHeight + gap);
  return { px, py };
}

/**
 * Check if two widgets overlap.
 */
function doWidgetsOverlap(pos1: GridPosition, pos2: GridPosition): boolean {
  return !(
    pos1.x + pos1.w <= pos2.x ||
    pos2.x + pos2.w <= pos1.x ||
    pos1.y + pos1.h <= pos2.y ||
    pos2.y + pos2.h <= pos1.y
  );
}

/**
 * Compact widgets vertically.
 */
function compactWidgets(widgets: Widget[], breakpoint: "lg" | "md" | "sm" | "xs"): Widget[] {
  // Sort widgets by y position, then x
  const sorted = [...widgets].sort((a, b) => {
    const posA = getWidgetPosition(a, breakpoint);
    const posB = getWidgetPosition(b, breakpoint);
    if (posA.y !== posB.y) return posA.y - posB.y;
    return posA.x - posB.x;
  });

  const compacted: Widget[] = [];
  const MAX_ITERATIONS = 1000; // Guard against infinite loops

  for (const widget of sorted) {
    const pos = { ...getWidgetPosition(widget, breakpoint) };

    // Try to move widget up as much as possible
    let newY = 0;
    let canPlace = false;
    let iterations = 0;

    while (!canPlace && iterations < MAX_ITERATIONS) {
      iterations++;
      pos.y = newY;
      canPlace = true;

      for (const placed of compacted) {
        const placedPos = getWidgetPosition(placed, breakpoint);
        if (doWidgetsOverlap(pos, placedPos)) {
          canPlace = false;
          newY = placedPos.y + placedPos.h;
          break;
        }
      }

      if (canPlace) break;
    }

    // If we hit max iterations, place widget at current position
    if (iterations >= MAX_ITERATIONS) {
      console.warn(`Widget ${widget.id} placement exceeded max iterations, using y=${newY}`);
    }

    compacted.push({
      ...widget,
      position: {
        ...widget.position,
        [breakpoint]: pos,
      },
    });
  }

  return compacted;
}

// =============================================================================
// WIDGET GRID COMPONENT
// =============================================================================

export function WidgetGrid({
  widgets,
  layout = defaultLayout,
  editMode = false,
  onLayoutChange,
  onWidgetSelect,
  onWidgetDelete,
  renderWidget,
  className,
}: WidgetGridProps) {
  console.log("🔵 WidgetGrid render - widgets:", widgets.length, "containerWidth:", "pending");

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    widgetId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    widgetId: null,
    handle: null,
    startWidth: 0,
    startHeight: 0,
    startX: 0,
    startY: 0,
  });

  // Measure container width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Calculate current breakpoint and cell dimensions
  const breakpoint = useMemo(
    () => getCurrentBreakpoint(containerWidth, layout.breakpoints),
    [containerWidth, layout.breakpoints]
  );

  const columns = layout.columnsPerBreakpoint[breakpoint];
  const { cellWidth } = useMemo(
    () => calculateCellDimensions(containerWidth, columns, layout.gap, layout.padding),
    [containerWidth, columns, layout.gap, layout.padding]
  );

  // Calculate grid height based on widgets
  const gridHeight = useMemo(() => {
    let maxBottom = 0;
    for (const widget of widgets) {
      const pos = getWidgetPosition(widget, breakpoint);
      const bottom = pos.y + pos.h;
      if (bottom > maxBottom) maxBottom = bottom;
    }
    return layout.padding * 2 + maxBottom * (layout.rowHeight + layout.gap) - layout.gap;
  }, [widgets, breakpoint, layout]);

  // Handle drag start
  const handleDragStart = useCallback(
    (e: MouseEvent, widgetId: string) => {
      if (!editMode) return;
      e.preventDefault();

      const widget = widgets.find((w) => w.id === widgetId);
      if (!widget) return;

      const pos = getWidgetPosition(widget, breakpoint);
      const { px, py } = gridToPixel(
        pos.x,
        pos.y,
        cellWidth,
        layout.rowHeight,
        layout.gap,
        layout.padding
      );

      setDragState({
        isDragging: true,
        widgetId,
        startX: e.clientX,
        startY: e.clientY,
        currentX: px,
        currentY: py,
        offsetX: e.clientX - px,
        offsetY: e.clientY - py,
      });

      setSelectedWidgetId(widgetId);
    },
    [editMode, widgets, breakpoint, cellWidth, layout]
  );

  // Handle drag move
  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const newX = e.clientX - containerRect.left - dragState.offsetX;
      const newY = e.clientY - containerRect.top - dragState.offsetY;

      setDragState((prev) => ({
        ...prev,
        currentX: Math.max(0, newX),
        currentY: Math.max(0, newY),
      }));
    },
    [dragState.isDragging, dragState.offsetX, dragState.offsetY]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging || !dragState.widgetId) return;

    const { gridX, gridY } = pixelToGrid(
      dragState.currentX,
      dragState.currentY,
      cellWidth,
      layout.rowHeight,
      layout.gap,
      layout.padding
    );

    const widget = widgets.find((w) => w.id === dragState.widgetId);
    if (!widget) {
      setDragState({
        isDragging: false,
        widgetId: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        offsetX: 0,
        offsetY: 0,
      });
      return;
    }

    const currentPos = getWidgetPosition(widget, breakpoint);
    const clampedX = Math.min(Math.max(0, gridX), columns - currentPos.w);
    const clampedY = Math.max(0, gridY);

    const updatedWidgets = widgets.map((w) => {
      if (w.id !== dragState.widgetId) return w;
      return {
        ...w,
        position: {
          ...w.position,
          [breakpoint]: {
            ...currentPos,
            x: clampedX,
            y: clampedY,
          },
        },
        updatedAt: new Date().toISOString(),
      };
    });

    const compacted = layout.compactType ? compactWidgets(updatedWidgets, breakpoint) : updatedWidgets;
    onLayoutChange?.(compacted);

    setDragState({
      isDragging: false,
      widgetId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      offsetX: 0,
      offsetY: 0,
    });
  }, [dragState, widgets, breakpoint, cellWidth, columns, layout, onLayoutChange]);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: MouseEvent, widgetId: string, handle: ResizeState["handle"]) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();

      const widget = widgets.find((w) => w.id === widgetId);
      if (!widget) return;

      const pos = getWidgetPosition(widget, breakpoint);

      setResizeState({
        isResizing: true,
        widgetId,
        handle,
        startWidth: pos.w,
        startHeight: pos.h,
        startX: e.clientX,
        startY: e.clientY,
      });
    },
    [editMode, widgets, breakpoint]
  );

  // Handle resize move
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.widgetId) return;

      const widget = widgets.find((w) => w.id === resizeState.widgetId);
      if (!widget) return;

      const currentPos = getWidgetPosition(widget, breakpoint);
      const deltaX = e.clientX - resizeState.startX;
      const deltaY = e.clientY - resizeState.startY;

      const cellWithGap = cellWidth + layout.gap;
      const rowWithGap = layout.rowHeight + layout.gap;

      let newW = resizeState.startWidth;
      let newH = resizeState.startHeight;

      if (resizeState.handle?.includes("e")) {
        newW = Math.max(currentPos.minW ?? 1, resizeState.startWidth + Math.round(deltaX / cellWithGap));
      }
      if (resizeState.handle?.includes("w")) {
        newW = Math.max(currentPos.minW ?? 1, resizeState.startWidth - Math.round(deltaX / cellWithGap));
      }
      if (resizeState.handle?.includes("s")) {
        newH = Math.max(currentPos.minH ?? 1, resizeState.startHeight + Math.round(deltaY / rowWithGap));
      }
      if (resizeState.handle?.includes("n")) {
        newH = Math.max(currentPos.minH ?? 1, resizeState.startHeight - Math.round(deltaY / rowWithGap));
      }

      // Clamp to max constraints
      newW = Math.min(newW, currentPos.maxW ?? columns);
      newH = Math.min(newH, currentPos.maxH ?? 20);

      // Update widget
      const updatedWidgets = widgets.map((w) => {
        if (w.id !== resizeState.widgetId) return w;
        return {
          ...w,
          position: {
            ...w.position,
            [breakpoint]: {
              ...currentPos,
              w: newW,
              h: newH,
            },
          },
          updatedAt: new Date().toISOString(),
        };
      });

      onLayoutChange?.(updatedWidgets);
    },
    [resizeState, widgets, breakpoint, cellWidth, columns, layout, onLayoutChange]
  );

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (!resizeState.isResizing) return;

    const compacted = layout.compactType ? compactWidgets(widgets, breakpoint) : widgets;
    onLayoutChange?.(compacted);

    setResizeState({
      isResizing: false,
      widgetId: null,
      handle: null,
      startWidth: 0,
      startHeight: 0,
      startX: 0,
      startY: 0,
    });
  }, [resizeState.isResizing, widgets, breakpoint, layout, onLayoutChange]);

  // Handle widget click for selection
  const handleWidgetClick = useCallback(
    (e: MouseEvent, widget: Widget) => {
      if (dragState.isDragging || resizeState.isResizing) return;

      if (editMode) {
        e.stopPropagation();
        setSelectedWidgetId(widget.id);
        onWidgetSelect?.(widget);
      }
    },
    [editMode, dragState.isDragging, resizeState.isResizing, onWidgetSelect]
  );

  // Handle delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedWidgetId && editMode) {
        onWidgetDelete?.(selectedWidgetId);
        setSelectedWidgetId(null);
      }
      if (e.key === "Escape") {
        setSelectedWidgetId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedWidgetId, editMode, onWidgetDelete]);

  // Handle mouse events at container level
  const handleContainerMouseMove = useCallback(
    (e: MouseEvent) => {
      handleDragMove(e);
      handleResizeMove(e);
    },
    [handleDragMove, handleResizeMove]
  );

  const handleContainerMouseUp = useCallback(() => {
    handleDragEnd();
    handleResizeEnd();
  }, [handleDragEnd, handleResizeEnd]);

  // Deselect on container click
  const handleContainerClick = useCallback(() => {
    setSelectedWidgetId(null);
  }, []);

  if (containerWidth === 0) {
    console.log("🔵 WidgetGrid: containerWidth is 0, showing skeleton");
    return (
      <div ref={containerRef} className={cn("w-full min-h-[200px]", className)}>
        <div className="animate-pulse h-48 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.05))]" />
      </div>
    );
  }

  console.log("🔵 WidgetGrid: rendering", widgets.length, "widgets, containerWidth:", containerWidth);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full",
        editMode && "cursor-default",
        className
      )}
      style={{
        minHeight: Math.max(gridHeight, 200),
        padding: layout.padding,
      }}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleContainerMouseUp}
      onMouseLeave={handleContainerMouseUp}
      onClick={handleContainerClick}
    >
      {/* Grid background (visible in edit mode) */}
      {editMode && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--border-color, rgba(255,255,255,0.1)) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border-color, rgba(255,255,255,0.1)) 1px, transparent 1px)
            `,
            backgroundSize: `${cellWidth + layout.gap}px ${layout.rowHeight + layout.gap}px`,
            backgroundPosition: `${layout.padding}px ${layout.padding}px`,
          }}
        />
      )}

      {/* Widgets */}
      {widgets.map((widget) => {
        console.log("🔵 Mapping widget:", widget.id, widget.title, "visible:", widget.visible);
        if (!widget.visible) {
          console.log("🔵 Widget hidden, skipping:", widget.id);
          return null;
        }

        const pos = getWidgetPosition(widget, breakpoint);
        console.log("🔵 Widget position:", widget.id, pos);
        const isDragging = dragState.isDragging && dragState.widgetId === widget.id;
        const isSelected = selectedWidgetId === widget.id;

        const { px, py } = isDragging
          ? { px: dragState.currentX, py: dragState.currentY }
          : gridToPixel(pos.x, pos.y, cellWidth, layout.rowHeight, layout.gap, layout.padding);

        const width = pos.w * cellWidth + (pos.w - 1) * layout.gap;
        const height = pos.h * layout.rowHeight + (pos.h - 1) * layout.gap;

        return (
          <div
            key={widget.id}
            className={cn(
              "absolute rounded-lg border bg-[var(--bg-secondary,rgba(255,255,255,0.05))] overflow-hidden",
              "transition-shadow duration-200",
              editMode && "cursor-move",
              isDragging && "opacity-80 shadow-2xl z-50",
              isSelected && editMode && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-primary)]",
              !editMode && "hover:shadow-lg"
            )}
            style={{
              left: px,
              top: py,
              width,
              height,
              borderColor: "var(--border-color, rgba(255,255,255,0.1))",
              transition: isDragging ? "none" : "left 0.2s, top 0.2s, width 0.2s, height 0.2s",
            }}
            onMouseDown={(e) => handleDragStart(e, widget.id)}
            onClick={(e) => handleWidgetClick(e, widget)}
          >
            {/* Widget header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color,rgba(255,255,255,0.1))] bg-[var(--bg-primary,rgba(0,0,0,0.2))]">
              <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
                {widget.title}
              </h3>
              {editMode && isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWidgetDelete?.(widget.id);
                  }}
                  className="p-1 rounded hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                  aria-label="Delete widget"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Widget content */}
            <div className="p-3 h-[calc(100%-40px)] overflow-auto">
              {renderWidget(widget)}
            </div>

            {/* Resize handles (visible in edit mode when selected) */}
            {editMode && isSelected && (
              <>
                {/* SE corner */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                  onMouseDown={(e) => handleResizeStart(e, widget.id, "se")}
                >
                  <svg className="w-4 h-4 text-[var(--text-secondary)]" viewBox="0 0 16 16">
                    <path
                      d="M14 14H10M14 14V10M14 14L10 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* E edge */}
                <div
                  className="absolute top-1/2 right-0 w-2 h-8 -translate-y-1/2 cursor-e-resize"
                  onMouseDown={(e) => handleResizeStart(e, widget.id, "e")}
                />

                {/* S edge */}
                <div
                  className="absolute bottom-0 left-1/2 w-8 h-2 -translate-x-1/2 cursor-s-resize"
                  onMouseDown={(e) => handleResizeStart(e, widget.id, "s")}
                />
              </>
            )}
          </div>
        );
      })}

      {/* Drop zone indicator */}
      {dragState.isDragging && (
        <div
          className="absolute border-2 border-dashed border-[var(--accent)] rounded-lg bg-[var(--accent)]/10 pointer-events-none"
          style={{
            ...(() => {
              const { gridX, gridY } = pixelToGrid(
                dragState.currentX,
                dragState.currentY,
                cellWidth,
                layout.rowHeight,
                layout.gap,
                layout.padding
              );
              const widget = widgets.find((w) => w.id === dragState.widgetId);
              const pos = widget ? getWidgetPosition(widget, breakpoint) : { w: 3, h: 2 };
              const snapped = gridToPixel(gridX, gridY, cellWidth, layout.rowHeight, layout.gap, layout.padding);
              return {
                left: snapped.px,
                top: snapped.py,
                width: pos.w * cellWidth + (pos.w - 1) * layout.gap,
                height: pos.h * layout.rowHeight + (pos.h - 1) * layout.gap,
              };
            })(),
          }}
        />
      )}
    </div>
  );
}

export default WidgetGrid;
