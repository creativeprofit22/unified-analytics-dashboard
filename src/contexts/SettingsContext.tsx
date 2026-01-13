"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  UserPreferences,
  TimeRange,
  ComparisonPeriod,
  AutoRefreshInterval,
  ExportFormat,
} from "@/types";
import { DEFAULT_USER_PREFERENCES } from "@/types";

interface SettingsContextValue {
  /** Current user preferences */
  settings: UserPreferences;
  /** Update a single preference */
  updateSetting: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  /** Reset all preferences to defaults */
  resetSettings: () => void;
  /** Whether settings have been modified from defaults */
  hasCustomSettings: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEY = "dashboard-settings";

function getStoredSettings(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_USER_PREFERENCES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new preferences
      return { ...DEFAULT_USER_PREFERENCES, ...parsed };
    }
  } catch {
    // Invalid stored data, use defaults
  }
  return DEFAULT_USER_PREFERENCES;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [mounted, setMounted] = useState(false);

  // Initialize settings from localStorage
  useEffect(() => {
    const stored = getStoredSettings();
    setSettings(stored);
    setMounted(true);
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, mounted]);

  const updateSetting = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_USER_PREFERENCES);
  }, []);

  const hasCustomSettings = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(DEFAULT_USER_PREFERENCES);
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      updateSetting,
      resetSettings,
      hasCustomSettings,
    }),
    [settings, updateSetting, resetSettings, hasCustomSettings]
  );

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <SettingsContext.Provider
        value={{
          settings: DEFAULT_USER_PREFERENCES,
          updateSetting: () => {},
          resetSettings: () => {},
          hasCustomSettings: false,
        }}
      >
        {children}
      </SettingsContext.Provider>
    );
  }

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
