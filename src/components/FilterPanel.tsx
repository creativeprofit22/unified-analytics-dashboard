"use client";

import { useState, useId } from "react";
import { useFilters } from "@/contexts/FilterContext";

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
import { FilterChip } from "./FilterChip";
import type { TrafficSource, CampaignChannel } from "@/types";

const SOURCE_LABELS: Record<TrafficSource, string> = {
  organic: "Organic",
  paid: "Paid",
  direct: "Direct",
  referral: "Referral",
  social: "Social",
  email: "Email",
};

const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

export function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownId = useId();

  const {
    filters,
    options,
    toggleSource,
    toggleChannel,
    toggleCampaign,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useFilters();

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
          hasActiveFilters
            ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
            : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)]"
        }`}
        aria-expanded={isOpen}
        aria-controls={dropdownId}
      >
        <FilterIcon />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 text-xs bg-white/20 rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            id={dropdownId}
            className="absolute right-0 top-full mt-2 z-20 w-80 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-[var(--border-primary)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Filter Analytics
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="p-3 space-y-4 max-h-96 overflow-y-auto">
              {/* Traffic Sources */}
              {options.sources.length > 0 && (
                <FilterSection
                  title="Traffic Source"
                  items={options.sources}
                  selected={filters.sources}
                  labels={SOURCE_LABELS}
                  onToggle={toggleSource}
                />
              )}

              {/* Campaign Channels */}
              {options.channels.length > 0 && (
                <FilterSection
                  title="Channel"
                  items={options.channels}
                  selected={filters.channels}
                  labels={CHANNEL_LABELS}
                  onToggle={toggleChannel}
                />
              )}

              {/* Campaigns */}
              {options.campaigns.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Campaigns
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {options.campaigns.map((campaign) => (
                      <label
                        key={campaign}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-[var(--bg-tertiary)] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.campaigns.includes(campaign)}
                          onChange={() => toggleCampaign(campaign)}
                          className="w-4 h-4 rounded border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] focus:ring-offset-0 bg-[var(--bg-tertiary)]"
                        />
                        <span className="text-sm text-[var(--text-primary)] truncate">
                          {campaign}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* No options available */}
              {options.sources.length === 0 &&
                options.channels.length === 0 &&
                options.campaigns.length === 0 && (
                  <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                    No filter options available
                  </p>
                )}
            </div>
          </div>
        </>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="absolute left-0 top-full mt-2 flex flex-wrap gap-2">
          {filters.sources.map((source) => (
            <FilterChip
              key={source}
              label={SOURCE_LABELS[source]}
              category="source"
              onRemove={() => toggleSource(source)}
            />
          ))}
          {filters.channels.map((channel) => (
            <FilterChip
              key={channel}
              label={CHANNEL_LABELS[channel]}
              category="channel"
              onRemove={() => toggleChannel(channel)}
            />
          ))}
          {filters.campaigns.map((campaign) => (
            <FilterChip
              key={campaign}
              label={campaign}
              category="campaign"
              onRemove={() => toggleCampaign(campaign)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterSectionProps<T extends string> {
  title: string;
  items: T[];
  selected: T[];
  labels: Record<T, string>;
  onToggle: (item: T) => void;
}

function FilterSection<T extends string>({
  title,
  items,
  selected,
  labels,
  onToggle,
}: FilterSectionProps<T>) {
  return (
    <div>
      <h4 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              selected.includes(item)
                ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                : "bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border-primary)] hover:border-[var(--accent-primary)]"
            }`}
          >
            {labels[item]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FilterPanel;
