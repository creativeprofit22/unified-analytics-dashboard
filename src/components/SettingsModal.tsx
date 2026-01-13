"use client";

import { useEffect, useCallback } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { TimeRange, ComparisonPeriod, AutoRefreshInterval, ExportFormat } from "@/types";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "12m", label: "12 Months" },
  { value: "ytd", label: "Year to Date" },
];

const COMPARISON_OPTIONS: { value: ComparisonPeriod; label: string }[] = [
  { value: "previous", label: "Previous Period" },
  { value: "year_ago", label: "Year Ago" },
  { value: "none", label: "None" },
];

const REFRESH_OPTIONS: { value: AutoRefreshInterval; label: string }[] = [
  { value: 0, label: "Disabled" },
  { value: 30000, label: "30 seconds" },
  { value: 60000, label: "1 minute" },
  { value: 300000, label: "5 minutes" },
];

const EXPORT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "xlsx", label: "Excel (XLSX)" },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSetting, resetSettings, hasCustomSettings } = useSettings();
  const { theme, setTheme } = useTheme();

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="Close settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Section */}
          <SettingsSection title="Appearance">
            <SettingsRow label="Theme">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </SettingsRow>
            <SettingsRow label="Compact Mode">
              <Toggle
                checked={settings.compactMode}
                onChange={(v) => updateSetting("compactMode", v)}
              />
            </SettingsRow>
          </SettingsSection>

          {/* Data Display Section */}
          <SettingsSection title="Data Display">
            <SettingsRow label="Default Time Range">
              <select
                value={settings.defaultTimeRange}
                onChange={(e) => updateSetting("defaultTimeRange", e.target.value as TimeRange)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {TIME_RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SettingsRow>
            <SettingsRow label="Default Comparison">
              <select
                value={settings.defaultComparisonPeriod}
                onChange={(e) => updateSetting("defaultComparisonPeriod", e.target.value as ComparisonPeriod)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {COMPARISON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SettingsRow>
            <SettingsRow label="Enable Comparison by Default">
              <Toggle
                checked={settings.showComparisonByDefault}
                onChange={(v) => updateSetting("showComparisonByDefault", v)}
              />
            </SettingsRow>
          </SettingsSection>

          {/* Auto Refresh Section */}
          <SettingsSection title="Data Refresh">
            <SettingsRow label="Auto-Refresh Interval">
              <select
                value={settings.autoRefreshInterval}
                onChange={(e) => updateSetting("autoRefreshInterval", Number(e.target.value) as AutoRefreshInterval)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {REFRESH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SettingsRow>
          </SettingsSection>

          {/* Export Section */}
          <SettingsSection title="Export">
            <SettingsRow label="Default Export Format">
              <select
                value={settings.exportFormat}
                onChange={(e) => updateSetting("exportFormat", e.target.value as ExportFormat)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {EXPORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </SettingsRow>
          </SettingsSection>

          {/* Notifications Section */}
          <SettingsSection title="Notifications">
            <SettingsRow label="Show Update Notifications">
              <Toggle
                checked={settings.showNotifications}
                onChange={(v) => updateSetting("showNotifications", v)}
              />
            </SettingsRow>
          </SettingsSection>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button
            onClick={resetSettings}
            disabled={!hasCustomSettings}
            className="px-4 py-2 text-sm rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper components
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-3 bg-[var(--bg-secondary)] rounded-lg p-4">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[var(--text-primary)]">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-[var(--accent-primary)]" : "bg-[var(--bg-tertiary)]"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
