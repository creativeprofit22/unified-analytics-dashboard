"use client";

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";

// =============================================================================
// TYPES
// =============================================================================

export type AttributionModel = "first-touch" | "last-touch" | "linear" | "time-decay";

export interface AttributionModelSelectorProps {
  value: AttributionModel;
  onChange: (model: AttributionModel) => void;
  variant?: "dropdown" | "tabs";
  className?: string;
}

interface ModelConfig {
  id: AttributionModel;
  label: string;
  shortLabel: string;
  description: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MODELS: ModelConfig[] = [
  {
    id: "first-touch",
    label: "First Touch",
    shortLabel: "First",
    description:
      "100% credit to the first channel that introduced the customer. Best for understanding acquisition sources.",
  },
  {
    id: "last-touch",
    label: "Last Touch",
    shortLabel: "Last",
    description:
      "100% credit to the last channel before conversion. Best for direct response campaigns.",
  },
  {
    id: "linear",
    label: "Linear",
    shortLabel: "Linear",
    description:
      "Equal credit distributed across all touchpoints. Best for balanced multi-channel analysis.",
  },
  {
    id: "time-decay",
    label: "Time Decay",
    shortLabel: "Decay",
    description:
      "More credit to touchpoints closer to conversion. Best for long sales cycles.",
  },
];

// =============================================================================
// STATIC STYLES
// =============================================================================

const dropdownContainerStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
};

const dropdownButtonStyle = {
  backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.05))",
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const dropdownMenuStyle = {
  backgroundColor: "var(--bg-primary, #1f2937)",
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface DropdownProps {
  value: AttributionModel;
  onChange: (model: AttributionModel) => void;
}

function Dropdown({ value, onChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = MODELS.find((m) => m.id === value) ?? MODELS[0]!;

  const handleSelect = useCallback(
    (model: AttributionModel) => {
      onChange(model);
      setIsOpen(false);
    },
    [onChange]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-all min-w-[180px]"
        style={dropdownButtonStyle}
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{selectedModel.label}</span>
        </div>
        <span
          className="text-xs transition-transform"
          style={{
            color: "var(--text-secondary, rgba(255,255,255,0.6))",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          &#9660;
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-80 rounded-lg border shadow-lg overflow-hidden"
          style={dropdownMenuStyle}
        >
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => handleSelect(model.id)}
              className={cn(
                "w-full text-left px-4 py-3 transition-colors",
                model.id === value
                  ? "bg-[var(--bg-tertiary,rgba(255,255,255,0.1))]"
                  : "hover:bg-[var(--bg-secondary,rgba(255,255,255,0.05))]"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary, rgba(255,255,255,0.95))" }}
                >
                  {model.label}
                </span>
                {model.id === value && (
                  <span style={{ color: "var(--accent-color, #8b5cf6)" }}>&#10003;</span>
                )}
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
              >
                {model.description}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface TabsProps {
  value: AttributionModel;
  onChange: (model: AttributionModel) => void;
}

function Tabs({ value, onChange }: TabsProps) {
  const [hoveredTab, setHoveredTab] = useState<AttributionModel | null>(null);

  const displayedModel = hoveredTab
    ? MODELS.find((m) => m.id === hoveredTab)
    : MODELS.find((m) => m.id === value);

  return (
    <div className="space-y-2">
      {/* Tab Buttons */}
      <div
        className="inline-flex items-center gap-1 p-1 rounded-lg"
        style={{ backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))" }}
      >
        {MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => onChange(model.id)}
            onMouseEnter={() => setHoveredTab(model.id)}
            onMouseLeave={() => setHoveredTab(null)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all",
              model.id === value
                ? "bg-[var(--bg-tertiary,rgba(255,255,255,0.1))]"
                : "hover:bg-[var(--bg-tertiary,rgba(255,255,255,0.05))]"
            )}
            style={{
              color:
                model.id === value
                  ? "var(--text-primary, rgba(255,255,255,0.95))"
                  : "var(--text-secondary, rgba(255,255,255,0.6))",
              borderBottom:
                model.id === value
                  ? "2px solid var(--accent-color, #8b5cf6)"
                  : "2px solid transparent",
            }}
          >
            {model.shortLabel}
          </button>
        ))}
      </div>

      {/* Description */}
      {displayedModel && (
        <p
          className="text-xs max-w-md"
          style={{ color: "var(--text-secondary, rgba(255,255,255,0.6))" }}
        >
          {displayedModel.description}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function AttributionModelSelectorComponent({
  value,
  onChange,
  variant = "dropdown",
  className,
}: AttributionModelSelectorProps) {
  return (
    <div className={cn("relative", className)}>
      {variant === "dropdown" ? (
        <Dropdown value={value} onChange={onChange} />
      ) : (
        <Tabs value={value} onChange={onChange} />
      )}
    </div>
  );
}

export const AttributionModelSelector = memo(AttributionModelSelectorComponent);
export default AttributionModelSelector;
