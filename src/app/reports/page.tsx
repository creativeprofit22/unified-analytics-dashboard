"use client";

import Link from "next/link";
import { ReportBuilder } from "@/components";
import { useReportBuilder } from "@/hooks";
import type { ExportFormat, ReportMetric } from "@/types/report-builder";
import {
  exportToCSV,
  exportToExcel,
  exportToMarkdown,
  exportToJSON,
  downloadText,
  downloadBlob,
  generateFilename,
} from "@/lib/export";

export default function ReportsPage() {
  const {
    data,
    error,
    isLoading,
    saveTemplate,
  } = useReportBuilder();

  const handleSaveTemplate = async (template: {
    name: string;
    description: string;
    metrics: ReportMetric[];
  }) => {
    try {
      await saveTemplate(template);
    } catch (err) {
      console.error("[ReportsPage] Failed to save template:", err);
    }
  };

  const handleExport = (format: ExportFormat, metrics: ReportMetric[]) => {
    if (!data?.currentReport) {
      console.warn("[ReportsPage] No report data to export");
      return;
    }

    try {
      const reportData = {
        ...data.currentReport,
        template: {
          ...data.currentReport.template,
          metrics,
        },
        dataPoints: data.currentReport.dataPoints.filter((dp) =>
          metrics.some((m) => m.metricId === dp.metricId)
        ),
      };

      const filename = generateFilename(reportData.template.name, format);

      switch (format) {
        case "csv": {
          const csv = exportToCSV(reportData);
          downloadText(csv, filename, "text/csv");
          break;
        }
        case "excel": {
          const blob = exportToExcel(reportData);
          downloadBlob(blob, filename);
          break;
        }
        case "markdown": {
          const md = exportToMarkdown(reportData);
          downloadText(md, filename, "text/markdown");
          break;
        }
        case "json": {
          const json = exportToJSON(reportData);
          downloadText(json, filename, "application/json");
          break;
        }
        case "pdf": {
          // PDF export opens print dialog
          window.print();
          break;
        }
        case "png": {
          // PNG export captures the preview element
          const element = document.getElementById("report-preview");
          if (element) {
            import("@/lib/export/png").then(({ downloadPNG }) => {
              downloadPNG("report-preview", filename).catch((err) => {
                console.error("[ReportsPage] PNG export failed:", err);
              });
            });
          }
          break;
        }
      }
    } catch (err) {
      console.error("[ReportsPage] Export failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="p-6 border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Custom Report Builder</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Create custom reports with drag-and-drop metrics and export to multiple formats
            </p>
          </div>
          <Link
            href="/"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : data ? (
          <ReportBuilder
            data={data}
            onSaveTemplate={handleSaveTemplate}
            onExport={handleExport}
          />
        ) : null}
      </div>

      {/* Export Format Guide */}
      <footer className="border-t border-[var(--border-primary)] mt-8">
        <div className="max-w-7xl mx-auto p-6">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Export Formats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { format: "CSV", desc: "Spreadsheet data", icon: "📊" },
              { format: "Excel", desc: "Formatted workbook", icon: "📗" },
              { format: "PDF", desc: "Printable report", icon: "📄" },
              { format: "Markdown", desc: "Documentation", icon: "📝" },
              { format: "JSON", desc: "API/Backup", icon: "🔧" },
              { format: "PNG", desc: "Chart image", icon: "🖼️" },
            ].map(({ format, desc, icon }) => (
              <div
                key={format}
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <div className="text-2xl mb-1">{icon}</div>
                <div
                  className="font-medium text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {format}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
