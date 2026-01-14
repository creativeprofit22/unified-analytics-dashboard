"use client";

import { memo, useEffect, useRef } from "react";
import { Toast, type ToastData, type ToastType } from "./Toast";
import { useAlerts } from "@/hooks";
import { create } from "zustand";

// =============================================================================
// TOAST STORE (Zustand)
// =============================================================================

interface ToastStore {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: `toast-${Date.now()}-${Math.random()}` }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
}));

// Helper to add toast from anywhere
export const toast = {
  critical: (title: string, message: string) =>
    useToastStore.getState().addToast({ type: "critical", title, message }),
  warning: (title: string, message: string) =>
    useToastStore.getState().addToast({ type: "warning", title, message }),
  info: (title: string, message: string) =>
    useToastStore.getState().addToast({ type: "info", title, message }),
  success: (title: string, message: string) =>
    useToastStore.getState().addToast({ type: "success", title, message }),
};

// =============================================================================
// ALERT WATCHER COMPONENT
// =============================================================================

function AlertWatcher() {
  const { data: alertsData } = useAlerts();
  const addToast = useToastStore((state) => state.addToast);
  const shownAlertsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!alertsData) return;

    // Check for new critical anomalies
    alertsData.anomalies
      .filter((a) => a.severity === "critical")
      .forEach((anomaly) => {
        if (!shownAlertsRef.current.has(anomaly.id)) {
          shownAlertsRef.current.add(anomaly.id);
          addToast({
            type: "critical",
            title: `${anomaly.metricLabel} ${anomaly.direction === "spike" ? "Spike" : "Drop"} Detected`,
            message: `${anomaly.direction === "spike" ? "Increased" : "Decreased"} by ${Math.abs(anomaly.deviation).toFixed(1)} standard deviations`,
            duration: 8000,
          });
        }
      });

    // Check for breached thresholds
    alertsData.thresholdAlerts
      .filter((t) => t.status === "breached")
      .forEach((threshold) => {
        if (!shownAlertsRef.current.has(threshold.id)) {
          shownAlertsRef.current.add(threshold.id);
          addToast({
            type: "critical",
            title: `Threshold Breached: ${threshold.rule.name}`,
            message: threshold.message,
            duration: 8000,
          });
        }
      });

    // Check for goals that fell behind
    alertsData.goals
      .filter((g) => g.status === "behind")
      .forEach((goal) => {
        if (!shownAlertsRef.current.has(goal.id)) {
          shownAlertsRef.current.add(goal.id);
          addToast({
            type: "warning",
            title: `Goal Behind: ${goal.name}`,
            message: `Currently at ${goal.progress.toFixed(0)}% - action needed`,
            duration: 6000,
          });
        }
      });
  }, [alertsData, addToast]);

  return null;
}

// =============================================================================
// TOAST CONTAINER
// =============================================================================

function ToastContainerComponent() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <>
      {/* Alert Watcher - monitors for new alerts and shows toasts */}
      <AlertWatcher />

      {/* Toast Stack */}
      <div
        className="fixed bottom-4 right-4 z-[200] flex flex-col-reverse gap-2"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toastData) => (
          <Toast key={toastData.id} {...toastData} onDismiss={removeToast} />
        ))}
      </div>
    </>
  );
}

export const ToastContainer = memo(ToastContainerComponent);
export default ToastContainer;
