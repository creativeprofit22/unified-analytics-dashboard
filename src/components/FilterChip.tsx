"use client";

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

interface FilterChipProps {
  /** The filter label to display */
  label: string;
  /** Category of the filter (for styling) */
  category: "source" | "channel" | "campaign";
  /** Callback when chip is removed */
  onRemove: () => void;
}

const categoryColors: Record<FilterChipProps["category"], string> = {
  source: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  channel: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  campaign: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function FilterChip({ label, category, onRemove }: FilterChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${categoryColors[category]}`}
    >
      <span className="capitalize">{label}</span>
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

export default FilterChip;
