"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import FormSelectPicker from "@/components/form/FormSelectPicker";

type SeekerListPaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
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

export default function SeekerListPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
}: SeekerListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  if (totalItems === 0) return null;

  const pageBtnClass = (active: boolean) =>
    `data-table-page-btn flex h-8 min-w-8 items-center justify-center px-2 text-xs ${
      active ? "data-table-page-btn-active" : ""
    }`;

  const navBtnClass =
    "data-table-page-btn flex h-8 w-8 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40";

  const compactNavBtnClass =
    "seeker-pagination-nav-circle data-table-page-btn flex h-9 w-9 shrink-0 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="seeker-list-pagination data-table-pagination">
      <div className="data-table-pagination-meta">
        <span>
          {rangeStart}–{rangeEnd} / 全{totalItems}件
        </span>
        {onPageSizeChange && (
          <div className="seeker-pagination-label flex items-center gap-2 whitespace-nowrap text-xs">
            <span>表示件数</span>
            <div className="seeker-page-size-picker">
              <FormSelectPicker
                name="pageSize"
                title="表示件数"
                value={String(pageSize)}
                options={pageSizeOptions.map(String)}
                allowClear={false}
                compact
                onChange={(value) => onPageSizeChange(Number(value))}
                onBlur={() => {}}
              />
            </div>
          </div>
        )}
      </div>

      <div className="data-table-pagination-nav-compact">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className={compactNavBtnClass}
          aria-label="前のページ"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="seeker-pagination-page-indicator shrink-0 px-2 text-xs font-semibold">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className={compactNavBtnClass}
          aria-label="次のページ"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="data-table-pagination-nav data-table-pagination-nav-full">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className={navBtnClass}
          aria-label="前のページ"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="seeker-pagination-ellipsis px-1">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={pageBtnClass(page === p)}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className={navBtnClass}
          aria-label="次のページ"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
