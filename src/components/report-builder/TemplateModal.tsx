"use client";

import { memo, useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/utils/cn";

// =============================================================================
// TYPES
// =============================================================================

export interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  initialName?: string;
  initialDescription?: string;
  className?: string;
}

interface ValidationState {
  name: { valid: boolean; message: string };
  description: { valid: boolean; message: string };
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;
const MIN_NAME_LENGTH = 3;

// =============================================================================
// STATIC STYLES
// =============================================================================

const headerStyle = {
  color: "var(--text-primary, rgba(255,255,255,0.95))",
};

const subheaderStyle = {
  color: "var(--text-secondary, rgba(255,255,255,0.6))",
};

const borderStyle = {
  borderColor: "var(--border-color, rgba(255,255,255,0.1))",
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  minLength?: number;
  error?: string;
  autoFocus?: boolean;
}

const InputField = memo(function InputField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  minLength,
  error,
  autoFocus,
}: InputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const remaining = maxLength - value.length;
  const hasError = !!error;
  const showWarning = remaining <= 10 && remaining > 0;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={headerStyle}>
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20",
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
        )}
        style={{
          backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))",
          borderColor: hasError
            ? "#ef4444"
            : "var(--border-color, rgba(255,255,255,0.1))",
          color: "var(--text-primary, rgba(255,255,255,0.95))",
        }}
      />
      <div className="flex items-center justify-between">
        {hasError ? (
          <span className="text-xs text-red-400">{error}</span>
        ) : minLength && value.length < minLength && value.length > 0 ? (
          <span className="text-xs text-amber-400">
            Minimum {minLength} characters required
          </span>
        ) : (
          <span className="text-xs" style={subheaderStyle}>
            &nbsp;
          </span>
        )}
        <span
          className={cn(
            "text-xs",
            showWarning && "text-amber-400",
            remaining === 0 && "text-red-400"
          )}
          style={!showWarning && remaining > 0 ? subheaderStyle : undefined}
        >
          {remaining} remaining
        </span>
      </div>
    </div>
  );
});

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  rows?: number;
  error?: string;
}

const TextareaField = memo(function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 3,
  error,
}: TextareaFieldProps) {
  const remaining = maxLength - value.length;
  const hasError = !!error;
  const showWarning = remaining <= 20 && remaining > 0;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={headerStyle}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={cn(
          "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors resize-none",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20",
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
        )}
        style={{
          backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))",
          borderColor: hasError
            ? "#ef4444"
            : "var(--border-color, rgba(255,255,255,0.1))",
          color: "var(--text-primary, rgba(255,255,255,0.95))",
        }}
      />
      <div className="flex items-center justify-between">
        {hasError ? (
          <span className="text-xs text-red-400">{error}</span>
        ) : (
          <span className="text-xs" style={subheaderStyle}>
            Optional but recommended
          </span>
        )}
        <span
          className={cn(
            "text-xs",
            showWarning && "text-amber-400",
            remaining === 0 && "text-red-400"
          )}
          style={!showWarning && remaining > 0 ? subheaderStyle : undefined}
        >
          {remaining} remaining
        </span>
      </div>
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function TemplateModalComponent({
  isOpen,
  onClose,
  onSave,
  initialName = "",
  initialDescription = "",
  className,
}: TemplateModalProps) {
  // State
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [touched, setTouched] = useState({ name: false, description: false });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setTouched({ name: false, description: false });
    }
  }, [isOpen, initialName, initialDescription]);

  // Validation
  const validation: ValidationState = {
    name: {
      valid: name.length >= MIN_NAME_LENGTH && name.length <= MAX_NAME_LENGTH,
      message:
        name.length === 0
          ? "Template name is required"
          : name.length < MIN_NAME_LENGTH
            ? `Name must be at least ${MIN_NAME_LENGTH} characters`
            : "",
    },
    description: {
      valid: description.length <= MAX_DESCRIPTION_LENGTH,
      message: "",
    },
  };

  const isValid = validation.name.valid && validation.description.valid;

  // Handlers
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    setTouched((prev) => ({ ...prev, name: true }));
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
    setTouched((prev) => ({ ...prev, description: true }));
  }, []);

  const handleSave = useCallback(() => {
    if (!isValid) {
      setTouched({ name: true, description: true });
      return;
    }
    onSave(name.trim(), description.trim());
  }, [isValid, name, description, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && e.metaKey) {
        handleSave();
      }
    },
    [onClose, handleSave]
  );

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md mx-4 rounded-xl border shadow-2xl",
          className
        )}
        style={{
          backgroundColor: "var(--bg-primary, #1a1a2e)",
          ...borderStyle,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={borderStyle}>
          <div>
            <h2 className="text-lg font-semibold" style={headerStyle}>
              Save Template
            </h2>
            <p className="text-sm mt-0.5" style={subheaderStyle}>
              Create a reusable report template
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "var(--text-secondary, rgba(255,255,255,0.4))" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <InputField
            label="Template Name"
            value={name}
            onChange={handleNameChange}
            placeholder="e.g., Weekly Performance Report"
            maxLength={MAX_NAME_LENGTH}
            minLength={MIN_NAME_LENGTH}
            error={touched.name && !validation.name.valid ? validation.name.message : undefined}
            autoFocus
          />

          <TextareaField
            label="Description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe what this template is used for..."
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={3}
            error={
              touched.description && !validation.description.valid
                ? validation.description.message
                : undefined
            }
          />

          {/* Tips */}
          <div
            className="rounded-lg p-3"
            style={{
              backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))",
            }}
          >
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                style={{ color: "#3b82f6" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-xs font-medium" style={headerStyle}>
                  Pro tip
                </p>
                <p className="text-xs mt-0.5" style={subheaderStyle}>
                  Use descriptive names like "Q4 Sales Dashboard" or "Daily Marketing KPIs"
                  to quickly find templates later.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t" style={borderStyle}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
            style={{
              color: "var(--text-secondary, rgba(255,255,255,0.6))",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid && touched.name}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              (!isValid && touched.name) && "opacity-50 cursor-not-allowed"
            )}
            style={{
              backgroundColor: "#3b82f6",
              color: "#ffffff",
            }}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Save Template
            </span>
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="absolute bottom-4 left-4">
          <span className="text-xs" style={subheaderStyle}>
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-xs">Cmd</kbd>
            {" + "}
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-xs">Enter</kbd>
            {" to save"}
          </span>
        </div>
      </div>
    </div>
  );
}

export const TemplateModal = memo(TemplateModalComponent);
export default TemplateModal;
