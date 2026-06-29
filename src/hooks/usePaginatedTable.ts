"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { DataTableSort } from "@/components/ui/DataTable";

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
  meta?: Record<string, unknown>;
};

export type PaginatedTableQueryState = {
  page: number;
  pageSize: number;
  sort: DataTableSort;
  search: string;
};

export type UsePaginatedTableOptions<T> = {
  fetchUrl: string;
  buildQuery: (state: PaginatedTableQueryState) => Record<string, string | undefined>;
  parseResponse: (data: unknown) => PaginatedResponse<T>;
  defaultSort?: DataTableSort;
  defaultPageSize?: number;
  searchDebounceMs?: number;
  enabled?: boolean;
  /** Extra values that should trigger a refetch (e.g. filter state). */
  deps?: readonly unknown[];
};

export function usePaginatedTable<T>({
  fetchUrl,
  buildQuery,
  parseResponse,
  defaultSort = { column: "", order: "desc" },
  defaultPageSize = 10,
  searchDebounceMs = 300,
  enabled = true,
  deps = [],
}: UsePaginatedTableOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sort, setSort] = useState<DataTableSort>(defaultSort);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQueryRef = useRef(buildQuery);
  buildQueryRef.current = buildQuery;
  const parseResponseRef = useRef(parseResponse);
  parseResponseRef.current = parseResponse;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, searchDebounceMs);
    return () => window.clearTimeout(timer);
  }, [searchInput, searchDebounceMs]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are caller-provided refetch triggers
  }, deps);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    try {
      const params = buildQueryRef.current({ page, pageSize, sort, search: searchQuery });
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") qs.set(key, value);
      }
      const query = qs.toString();
      const url = query ? `${fetchUrl}?${query}` : fetchUrl;
      const res = await apiFetch(url);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "データの取得に失敗しました");
      }
      const parsed = parseResponseRef.current(data);
      setItems(parsed.items);
      setTotal(parsed.total);
      setMeta(parsed.meta ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchUrl, page, pageSize, sort, searchQuery, ...deps]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((next: DataTableSort) => {
    setSort(next);
    setPage(1);
  }, []);

  return {
    items,
    total,
    meta,
    page,
    pageSize,
    sort,
    loading,
    error,
    searchInput,
    setSearchInput,
    setPage,
    setPageSize: handlePageSizeChange,
    setSort: handleSortChange,
    refetch: fetchData,
  };
}
