import type { ReactNode } from "react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  align?: "left" | "right";
  render?: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  limit?: number;
}

/**
 * Generic data table component for consistent table rendering.
 * Used in SEO queries, plan segments, campaign lists, etc.
 */
export function DataTable<T extends object>({
  data,
  columns,
  keyField,
  limit,
}: DataTableProps<T>) {
  const displayData = limit ? data.slice(0, limit) : data;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--text-secondary)] border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`py-2 pr-4 ${col.align === "right" ? "text-right" : ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((item) => (
            <tr
              key={String(item[keyField])}
              className="border-b border-[var(--border-color,rgba(255,255,255,0.05))]"
            >
              {columns.map((col, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === columns.length - 1;
                const baseClass = `py-2 ${isLast ? "" : "pr-4"} ${
                  col.align === "right" ? "text-right" : ""
                }`;
                const textClass = isFirst
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)]";

                return (
                  <td key={String(col.key)} className={`${baseClass} ${textClass}`}>
                    {col.render
                      ? col.render(item)
                      : String(item[col.key as keyof T] ?? "")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
