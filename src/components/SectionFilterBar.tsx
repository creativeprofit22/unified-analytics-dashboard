"use client";

import { useState, useRef, useEffect } from "react";
import type {
  FilterFieldConfig,
  FilterValue,
  SectionFilters,
} from "@/contexts/SectionFilterContext";

// =============================================================================
// ICONS
// =============================================================================

const FilterIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const XIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className || "w-4 h-4"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

// =============================================================================
// TYPES
// =============================================================================

interface SectionFilterBarProps {
  /** Section identifier for filter state */
  sectionId: string;
  /** Filter field configurations */
  fields: FilterFieldConfig[];
  /** Current filter values */
  filters: SectionFilters;
  /** Called when a filter value changes */
  onFilterChange: (key: string, value: FilterValue) => void;
  /** Called when toggling a multiselect value */
  onToggle: (key: string, value: string) => void;
  /** Called to clear all filters */
  onClear: () => void;
  /** Called to clear a specific filter */
  onClearFilter: (key: string) => void;
  /** Whether there are active filters */
  hasActiveFilters: boolean;
  /** Count of active filters */
  activeFilterCount: number;
  /** Optional compact mode */
  compact?: boolean;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  color?: string;
}

function FilterChip({ label, value, onRemove, color = "blue" }: FilterChipProps) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${colorClasses[color] || colorClasses.blue}`}
    >
      <span className="text-[var(--text-secondary)] mr-0.5">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-white/10 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <XIcon />
      </button>
    </span>
  );
}

interface SelectFilterProps {
  field: FilterFieldConfig;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

function SelectFilter({ field, value, onChange }: SelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = typeof value === "string" ? value : field.placeholder || "Select...";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
          value
            ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/30"
            : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--text-secondary)]"
        }`}
      >
        <span className="truncate max-w-[120px]">{displayValue}</span>
        <ChevronDownIcon
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && field.options && (
        <div className="absolute z-30 top-full mt-1 min-w-[160px] max-h-48 overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-xl">
          <button
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
          >
            All
          </button>
          {field.options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-tertiary)] ${
                value === option
                  ? "text-[var(--accent-primary)] bg-[var(--accent-primary)]/5"
                  : "text-[var(--text-primary)]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface MultiSelectFilterProps {
  field: FilterFieldConfig;
  value: FilterValue;
  onToggle: (value: string) => void;
}

function MultiSelectFilter({ field, value, onToggle }: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = Array.isArray(value) ? value : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue =
    selected.length > 0
      ? `${selected.length} selected`
      : field.placeholder || "Select...";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
          selected.length > 0
            ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/30"
            : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--text-secondary)]"
        }`}
      >
        <span>{displayValue}</span>
        <ChevronDownIcon
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && field.options && (
        <div className="absolute z-30 top-full mt-1 min-w-[180px] max-h-56 overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-xl">
          {field.options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
                className="w-4 h-4 rounded border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] focus:ring-offset-0 bg-[var(--bg-tertiary)]"
              />
              <span className="text-[var(--text-primary)]">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

interface RangeFilterProps {
  field: FilterFieldConfig;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

function RangeFilter({ field, value, onChange }: RangeFilterProps) {
  const range = field.range || { min: 0, max: 100, step: 1 };
  const currentValue =
    typeof value === "object" && value !== null && "min" in value
      ? value
      : { min: range.min, max: range.max };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-secondary)]">{field.label}:</span>
      <input
        type="number"
        value={currentValue.min}
        min={range.min}
        max={range.max}
        step={range.step}
        onChange={(e) =>
          onChange({ ...currentValue, min: parseFloat(e.target.value) })
        }
        className="w-16 px-2 py-1 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)]"
      />
      <span className="text-[var(--text-secondary)]">-</span>
      <input
        type="number"
        value={currentValue.max}
        min={range.min}
        max={range.max}
        step={range.step}
        onChange={(e) =>
          onChange({ ...currentValue, max: parseFloat(e.target.value) })
        }
        className="w-16 px-2 py-1 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)]"
      />
    </div>
  );
}

interface SearchFilterProps {
  field: FilterFieldConfig;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

function SearchFilter({ field, value, onChange }: SearchFilterProps) {
  return (
    <div className="relative">
      <SearchIcon />
      <input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder={field.placeholder || `Search ${field.label}...`}
        className="pl-8 pr-3 py-1.5 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-primary)] focus:outline-none w-[180px]"
      />
      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
        <SearchIcon />
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SectionFilterBar({
  sectionId,
  fields,
  filters,
  onFilterChange,
  onToggle,
  onClear,
  onClearFilter,
  hasActiveFilters,
  activeFilterCount,
  compact = false,
}: SectionFilterBarProps) {
  if (fields.length === 0) return null;

  // Collect active filter chips for display
  const activeChips: Array<{ key: string; label: string; value: string }> = [];
  for (const field of fields) {
    const val = filters[field.key];
    if (val === null || val === undefined) continue;
    if (Array.isArray(val)) {
      val.forEach((v) => activeChips.push({ key: field.key, label: field.label, value: v }));
    } else if (typeof val === "string" && val) {
      activeChips.push({ key: field.key, label: field.label, value: val });
    } else if (typeof val === "object" && "min" in val) {
      // Only show chip if range differs from default (actual filtering happening)
      const defaultRange = field.range || { min: 0, max: 100 };
      const isAtDefault = val.min === defaultRange.min && val.max === defaultRange.max;
      if (!isAtDefault) {
        activeChips.push({
          key: field.key,
          label: field.label,
          value: `${val.min}-${val.max}`,
        });
      }
    }
  }

  const chipColors = ["blue", "purple", "green", "amber", "rose"];

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 px-1">
      {/* Filter Icon Label */}
      <div className="flex items-center gap-1.5 text-[var(--text-secondary)] mr-1">
        <FilterIcon />
        {!compact && <span className="text-xs font-medium">Filters</span>}
      </div>

      {/* Filter Controls */}
      {fields.map((field) => {
        const value = filters[field.key] ?? null;
        switch (field.type) {
          case "select":
            return (
              <SelectFilter
                key={field.key}
                field={field}
                value={value}
                onChange={(v) => onFilterChange(field.key, v)}
              />
            );
          case "multiselect":
            return (
              <MultiSelectFilter
                key={field.key}
                field={field}
                value={value}
                onToggle={(v) => onToggle(field.key, v)}
              />
            );
          case "range":
            return (
              <RangeFilter
                key={field.key}
                field={field}
                value={value}
                onChange={(v) => onFilterChange(field.key, v)}
              />
            );
          case "search":
            return (
              <SearchFilter
                key={field.key}
                field={field}
                value={value}
                onChange={(v) => onFilterChange(field.key, v)}
              />
            );
          default:
            return null;
        }
      })}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Clear all
        </button>
      )}

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 ml-2 pl-2 border-l border-[var(--border-primary)]">
          {activeChips.map((chip, idx) => (
            <FilterChip
              key={`${chip.key}-${chip.value}`}
              label={chip.label}
              value={chip.value}
              color={chipColors[idx % chipColors.length]}
              onRemove={() => {
                const fieldVal = filters[chip.key];
                if (Array.isArray(fieldVal)) {
                  onToggle(chip.key, chip.value);
                } else {
                  onClearFilter(chip.key);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SectionFilterBar;
