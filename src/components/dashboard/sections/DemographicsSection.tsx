"use client";

import type { UnifiedAnalyticsData } from "@/types/analytics";
import { CategorySection } from "@/components/CategorySection";
import { BarComparisonChart, type BarComparisonDataItem } from "@/components/charts/BarComparisonChart";
import { StatCard, SectionHeader } from "../shared";

interface DemographicsSectionProps {
  data: UnifiedAnalyticsData["demographics"];
  comparisonData?: UnifiedAnalyticsData["demographics"];
}

function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const deviceIcons: Record<string, string> = {
  desktop: "\uD83D\uDCBB",
  mobile: "\uD83D\uDCF1",
  tablet: "\uD83D\uDCDF",
};

export function DemographicsSection({ data, comparisonData }: DemographicsSectionProps) {
  if (!data) return null;

  return (
    <CategorySection
      title="Demographics"
      description="User geographic and device breakdown"
    >
      {data.geographic?.byCountry && data.geographic.byCountry.length > 0 && (
        <div>
          <SectionHeader>Top Countries</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.geographic.byCountry.slice(0, 4).map((country) => (
              <div
                key={country.countryCode}
                className="p-3 rounded-lg bg-[var(--bg-secondary,rgba(255,255,255,0.03))] flex items-center gap-3"
              >
                <span className="text-2xl">{getCountryFlag(country.countryCode)}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {country.country}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {country.users.toLocaleString()} users
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.device?.byType && (
        <div className="mt-4">
          <SectionHeader>Device Types</SectionHeader>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(data.device.byType).map(([type, count]) => (
              <StatCard
                key={type}
                label={type}
                value={count}
                icon={deviceIcons[type] || "\uD83D\uDCDF"}
              />
            ))}
          </div>
        </div>
      )}

      {data.technology?.byBrowser &&
        Object.keys(data.technology.byBrowser).length > 0 && (
          <div className="mt-4">
            <SectionHeader>Browser Distribution</SectionHeader>
            <BarComparisonChart
              data={Object.entries(data.technology.byBrowser)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([browser, count]): BarComparisonDataItem => ({
                  label: browser,
                  value: count,
                }))}
              height={200}
              layout="vertical"
            />
          </div>
        )}
    </CategorySection>
  );
}

export default DemographicsSection;
