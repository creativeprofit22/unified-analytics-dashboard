import useSWR from "swr";
import type {
  ReportBuilderData,
  ReportTemplate,
  ReportMetric,
  ExportFormat,
  ExportOptions,
} from "@/types/report-builder";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Input type for creating a new template.
 */
export interface CreateTemplateInput {
  name: string;
  description: string;
  metrics: ReportMetric[];
}

/**
 * Input type for updating an existing template.
 */
export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  metrics?: ReportMetric[];
}

/**
 * Return type for the useReportBuilder hook.
 */
export interface UseReportBuilderReturn {
  /** The fetched report builder data */
  data: ReportBuilderData | undefined;
  /** Error object if the request failed */
  error: Error | undefined;
  /** True during initial load */
  isLoading: boolean;
  /** Manually trigger a refresh */
  refresh: () => Promise<ReportBuilderData | undefined>;
  /** Create a new report template */
  saveTemplate: (
    template: Omit<ReportTemplate, "id" | "createdAt" | "updatedAt" | "createdBy" | "isDefault">
  ) => Promise<ReportTemplate>;
  /** Update an existing report template */
  updateTemplate: (id: string, updates: UpdateTemplateInput) => Promise<ReportTemplate>;
  /** Delete a report template */
  deleteTemplate: (id: string) => Promise<void>;
  /** Export a report to the specified format and trigger download */
  exportReport: (
    templateId: string,
    format: ExportFormat,
    options?: Partial<Omit<ExportOptions, "format">>
  ) => Promise<void>;
}

// =============================================================================
// FETCHER
// =============================================================================

/**
 * Fetcher for Report Builder API.
 */
async function reportBuilderFetcher(url: string): Promise<ReportBuilderData> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch report builder data");
  }
  const json = await res.json();
  // Validate response structure
  if (!json.success) {
    throw new Error(json.error || "Report builder request failed");
  }
  return json.data;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for managing report builder data with SWR caching.
 * Provides CRUD operations for templates and export functionality.
 */
export function useReportBuilder(): UseReportBuilderReturn {
  const { data, error, isLoading, mutate } = useSWR<ReportBuilderData>(
    "/api/reports",
    reportBuilderFetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false, // Don't refetch on window focus
    }
  );

  /**
   * Manually trigger a refresh of the data.
   */
  const refresh = async (): Promise<ReportBuilderData | undefined> => {
    try {
      return await mutate();
    } catch {
      // Error is already captured in the error state by SWR
      return undefined;
    }
  };

  /**
   * Create a new report template.
   */
  const saveTemplate = async (
    template: Omit<ReportTemplate, "id" | "createdAt" | "updatedAt" | "createdBy" | "isDefault">
  ): Promise<ReportTemplate> => {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(template),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to create template");
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to create template");
    }

    // Optimistically update the cache
    await mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          templates: [...currentData.templates, json.data],
        };
      },
      { revalidate: false }
    );

    return json.data;
  };

  /**
   * Update an existing report template.
   */
  const updateTemplate = async (
    id: string,
    updates: UpdateTemplateInput
  ): Promise<ReportTemplate> => {
    const res = await fetch(`/api/reports/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to update template");
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to update template");
    }

    // Optimistically update the cache
    await mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          templates: currentData.templates.map((t) =>
            t.id === id ? json.data : t
          ),
        };
      },
      { revalidate: false }
    );

    return json.data;
  };

  /**
   * Delete a report template.
   */
  const deleteTemplate = async (id: string): Promise<void> => {
    const res = await fetch(`/api/reports/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to delete template");
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "Failed to delete template");
    }

    // Optimistically update the cache
    await mutate(
      (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          templates: currentData.templates.filter((t) => t.id !== id),
        };
      },
      { revalidate: false }
    );
  };

  /**
   * Export a report to the specified format and trigger download.
   */
  const exportReport = async (
    templateId: string,
    format: ExportFormat,
    options?: Partial<Omit<ExportOptions, "format">>
  ): Promise<void> => {
    const res = await fetch("/api/reports/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateId,
        format,
        options: {
          ...options,
          format,
        },
      }),
    });

    if (!res.ok) {
      // Try to parse error message from JSON
      const contentType = res.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to export report");
      }
      throw new Error("Failed to export report");
    }

    // Get filename from Content-Disposition header
    const contentDisposition = res.headers.get("Content-Disposition");
    let filename = `report.${format}`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (filenameMatch?.[1]) {
        filename = filenameMatch[1];
      }
    }

    // Handle the response based on content type
    const contentType = res.headers.get("Content-Type") ?? "";
    let blob: Blob;

    if (
      contentType.includes("text/") ||
      contentType.includes("application/json") ||
      contentType.includes("text/markdown")
    ) {
      // Text-based formats
      const text = await res.text();
      blob = new Blob([text], { type: contentType });
    } else {
      // Binary formats (PDF, Excel, PNG)
      const arrayBuffer = await res.arrayBuffer();
      blob = new Blob([arrayBuffer], { type: contentType });
    }

    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    data,
    error,
    isLoading,
    refresh,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    exportReport,
  };
}
