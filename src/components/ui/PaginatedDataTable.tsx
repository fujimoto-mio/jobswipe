"use client";

import { forwardRef, useImperativeHandle, type ReactNode } from "react";
import DataTable, { type ColumnDef, type DataTableSort } from "@/components/ui/DataTable";
import {
  usePaginatedTable,
  type PaginatedResponse,
  type PaginatedTableQueryState,
  type UsePaginatedTableOptions,
} from "@/hooks/usePaginatedTable";

export type PaginatedDataTableHandle = {
  refetch: () => Promise<void>;
  searchInput: string;
  setSearchInput: (value: string) => void;
};

export type PaginatedDataTableProps<T> = {
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  fetchUrl: string;
  buildQuery: (state: PaginatedTableQueryState) => Record<string, string | undefined>;
  parseResponse: (data: unknown) => PaginatedResponse<T>;
  defaultSort?: DataTableSort;
  defaultPageSize?: number;
  searchDebounceMs?: number;
  enabled?: boolean;
  deps?: readonly unknown[];
  emptyMessage?: string;
  className?: string;
  toolbar?: ReactNode | ((ctx: { searchInput: string; setSearchInput: (v: string) => void }) => ReactNode);
  onRowClick?: (row: T) => void;
  selectedRowId?: string | null;
  staffStyle?: boolean;
};

function PaginatedDataTableInner<T>(
  {
    columns,
    getRowId,
    fetchUrl,
    buildQuery,
    parseResponse,
    defaultSort,
    defaultPageSize,
    searchDebounceMs,
    enabled,
    deps,
    emptyMessage = "データがありません",
    className,
    toolbar,
    onRowClick,
    selectedRowId,
    staffStyle,
  }: PaginatedDataTableProps<T>,
  ref: React.ForwardedRef<PaginatedDataTableHandle>
) {
  const table = usePaginatedTable<T>({
    fetchUrl,
    buildQuery,
    parseResponse,
    defaultSort,
    defaultPageSize,
    searchDebounceMs,
    enabled,
    deps,
  });

  useImperativeHandle(ref, () => ({
    refetch: table.refetch,
    searchInput: table.searchInput,
    setSearchInput: table.setSearchInput,
  }));

  const toolbarNode =
    typeof toolbar === "function"
      ? toolbar({ searchInput: table.searchInput, setSearchInput: table.setSearchInput })
      : toolbar;

  return (
    <DataTable
      columns={columns}
      data={table.items}
      loading={table.loading}
      getRowId={getRowId}
      onRowClick={onRowClick}
      selectedRowId={selectedRowId}
      emptyMessage={emptyMessage}
      className={className}
      toolbar={toolbarNode}
      pageSize={table.pageSize}
      totalCount={table.total}
      page={table.page}
      onPageChange={table.setPage}
      onPageSizeChange={table.setPageSize}
      sort={table.sort}
      onSortChange={table.setSort}
      staffStyle={staffStyle}
    />
  );
}

const PaginatedDataTable = forwardRef(PaginatedDataTableInner) as <T>(
  props: PaginatedDataTableProps<T> & { ref?: React.ForwardedRef<PaginatedDataTableHandle> }
) => ReturnType<typeof PaginatedDataTableInner>;

export default PaginatedDataTable;
export type { ColumnDef, DataTableSort, PaginatedResponse, PaginatedTableQueryState, UsePaginatedTableOptions };
export { usePaginatedTable };
