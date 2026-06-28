import type { JobFilters } from "@/lib/types";

export const DEFAULT_JOB_FILTERS: JobFilters = { areas: [], categories: [] };

export const EXPLORE_STARTED_PARAM = "started";

export function parseExploreFiltersFromParams(searchParams: URLSearchParams): JobFilters {
  const areas = searchParams.get("areas")?.split(",").filter(Boolean) ?? [];
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) ?? [];
  return { areas, categories };
}

export function isExploreFeedReady(searchParams: URLSearchParams): boolean {
  if (searchParams.get(EXPLORE_STARTED_PARAM) === "1") return true;
  const areas = searchParams.get("areas");
  const categories = searchParams.get("categories");
  if (areas) return true;
  if (categories) return true;
  return false;
}

export function buildExploreFeedParams(
  filters: JobFilters,
  options?: { started?: boolean }
): URLSearchParams {
  const params = new URLSearchParams();
  if (options?.started) {
    params.set(EXPLORE_STARTED_PARAM, "1");
    return params;
  }
  if (filters.areas.length) params.set("areas", filters.areas.join(","));
  if (filters.categories.length) params.set("categories", filters.categories.join(","));
  return params;
}

export function exploreFeedParamsKey(searchParams: URLSearchParams): string {
  return [
    searchParams.get("areas") ?? "",
    searchParams.get("categories") ?? "",
    searchParams.get(EXPLORE_STARTED_PARAM) ?? "",
  ].join("|");
}
