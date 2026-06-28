import type { JobFilters } from "@/lib/types";

export const FILTER_STORAGE_KEY = "jobswipe_filters_ready";

export const DEFAULT_JOB_FILTERS: JobFilters = { areas: [], categories: [] };

export function clearExploreFilters(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(FILTER_STORAGE_KEY);
}
