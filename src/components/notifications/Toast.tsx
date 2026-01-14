"use client";

import { memo, useEffect, useState } from "react";
import { cn } from "@/utils/cn";

// =============================================================================
// TYPES
// =============================================================================

export type ToastType = "critical" | "warning" | "info" | "success";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

export interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

// =============================================================================
// STYLES
// =============================================================================

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  critical: {
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.4)",
    icon: "#ef4444",
  },
  warning: {
    bg: "rgba(234, 179, 8, 0.15)",
    border: "rgba(234, 179, 8, 0.4)",
    icon: "#eab308",
  },
  info: {
    bg: "rgba(59, 130, 246, 0.15)",
    border: "rgba(59, 130, 246, 0.4)",
    icon: "#3b82f6",
  },
  success: {
    bg: "rgba(34, 197, 94, 0.15)",
    border: "rgba(34, 197, 94, 0.4)",
    icon: "#22c55e",
  },
};

// =============================================================================
// ICONS
// =============================================================================

function AlertIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

function ToastComponent({ id, type, title, message, duration = 5000, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const styles = typeStyles[type];

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Auto dismiss
  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      className={cn(
        "w-80 rounded-lg border p-4 shadow-lg backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.border,
      }}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertIcon color={styles.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[var(--text-primary)]">{title}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Dismiss"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

export const Toast = memo(ToastComponent);
export default Toast;
