"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export type ColumnDef<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
};

export type DataTableSort = {
  column: string;
  order: "asc" | "desc";
};

export type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedRowId?: string | null;
  className?: string;
  toolbar?: ReactNode;
  /** When this value changes, the table resets to page 1 (client mode only). */
  paginationKey?: string | number;
  /** Server-side pagination */
  totalCount?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  /** Staff panel UI (blue accent) */
  staffStyle?: boolean;
};

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  emptyMessage = "データがありません",
  getRowId,
  onRowClick,
  selectedRowId,
  className = "",
  toolbar,
  paginationKey,
  totalCount,
  page: controlledPage,
  onPageChange,
  onPageSizeChange,
  sort,
  onSortChange,
  staffStyle = false,
}: DataTableProps<T>) {
  const isServerMode = totalCount !== undefined && onPageChange !== undefined;

  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);

  const page = isServerMode ? (controlledPage ?? 1) : internalPage;
  const pageSize = isServerMode ? initialPageSize : internalPageSize;

  const rowIds = useMemo(() => data.map(getRowId).join("\0"), [data, getRowId]);
  const totalItems = isServerMode ? totalCount : data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (!isServerMode) setInternalPageSize(initialPageSize);
  }, [initialPageSize, isServerMode]);

  useEffect(() => {
    if (isServerMode) return;
    setInternalPage(1);
  }, [rowIds, internalPageSize, paginationKey, isServerMode]);

  useEffect(() => {
    if (isServerMode) return;
    if (internalPage > totalPages) setInternalPage(totalPages);
  }, [internalPage, totalPages, isServerMode]);

  const pageData = useMemo(() => {
    if (isServerMode) return data;
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize, isServerMode]);

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  const setPage = (next: number) => {
    if (isServerMode) onPageChange?.(next);
    else setInternalPage(next);
  };

  const setPageSize = (next: number) => {
    if (isServerMode) onPageSizeChange?.(next);
    else setInternalPageSize(next);
  };

  const handleSort = (columnId: string) => {
    if (!onSortChange) return;
    if (sort?.column === columnId) {
      onSortChange({ column: columnId, order: sort.order === "asc" ? "desc" : "asc" });
      return;
    }
    onSortChange({ column: columnId, order: "desc" });
  };

  const pageBtnClass = (active: boolean) =>
    staffStyle
      ? `data-table-page-btn flex items-center justify-center ${active ? "data-table-page-btn-active" : ""} h-8 min-w-8 px-2 text-xs disabled:cursor-not-allowed disabled:opacity-40`
      : `flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition disabled:opacity-40 ${
          active
            ? "bg-[var(--accent)] text-white"
            : "border border-[var(--border)] bg-white text-[var(--muted)] hover:text-[var(--foreground)]"
        }`;

  const navBtnClass = staffStyle
    ? "data-table-page-btn flex h-8 w-8 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
    : "flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] transition hover:bg-white hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40";

  const compactNavBtnClass = staffStyle
    ? "data-table-page-btn flex h-9 flex-1 items-center justify-center gap-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
    : "flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-white text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40";

  const pageSizeClass = staffStyle
    ? "data-table-page-size text-xs"
    : "rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-xs text-[var(--foreground)]";

  const selectedRowClass = staffStyle ? "bg-blue-50" : "bg-[var(--accent-light)]";

  return (
    <div className={`data-table-card ${staffStyle ? "staff-ui" : ""} ${className}`}>
      {toolbar && (
        <div className="border-b border-[var(--border)] bg-white">{toolbar}</div>
      )}
      <div className="data-table-scroll">
        <table className="border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)] sm:px-4 sm:py-3.5 ${col.headerClassName ?? ""}`}
                >
                  {col.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.id)}
                      className="inline-flex items-center gap-1 transition hover:text-[var(--foreground)]"
                    >
                      {col.header}
                      {sort?.column === col.id ? (
                        sort.order === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 opacity-30" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16">
                  <LoadingSpinner message="データを読み込み中..." />
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-[var(--muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row) => {
                const rowId = getRowId(row);
                const selected = selectedRowId === rowId;
                return (
                  <tr
                    key={rowId}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`border-b border-[var(--border)] transition last:border-b-0 ${
                      onRowClick ? "cursor-pointer hover:bg-[var(--surface)]" : ""
                    } ${selected ? selectedRowClass : "bg-white"}`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={`px-3 py-4 align-middle text-[var(--body)] sm:px-4 sm:py-5 ${col.className ?? ""}`}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && !loading && (
        <div className="data-table-pagination">
          <div className="data-table-pagination-meta">
            <span>
              {rangeStart}–{rangeEnd} / 全{totalItems}件
            </span>
            <label className="flex items-center gap-2 whitespace-nowrap">
              表示件数
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className={pageSizeClass}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="data-table-pagination-nav-compact">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className={compactNavBtnClass}
              aria-label="前のページ"
            >
              <ChevronLeft className="h-4 w-4" />
              前へ
            </button>
            <span className="shrink-0 px-2 text-xs font-medium text-[var(--muted)]">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              className={compactNavBtnClass}
              aria-label="次のページ"
            >
              次へ
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="data-table-pagination-nav data-table-pagination-nav-full">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className={navBtnClass}
              aria-label="前のページ"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-[var(--muted)]">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  disabled={loading}
                  className={pageBtnClass(page === p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              className={navBtnClass}
              aria-label="次のページ"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
