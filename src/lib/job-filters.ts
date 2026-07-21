import { AREAS, EMPLOYMENT_TYPES, JOB_CATEGORIES } from "@/lib/constants";
import type { JobFilters } from "@/lib/types";

export const DEFAULT_JOB_FILTERS: JobFilters = { areas: [], categories: [], employmentTypes: [] };

const EXPLORE_FILTERS_STORAGE_KEY = "jobswipe_explore_filters";

function sanitizeStoredFilters(value: unknown): JobFilters {
  if (!value || typeof value !== "object") return DEFAULT_JOB_FILTERS;

  const raw = value as { areas?: unknown; categories?: unknown; employmentTypes?: unknown };
  const areas = Array.isArray(raw.areas)
    ? raw.areas.filter((area): area is string => typeof area === "string" && AREAS.includes(area as (typeof AREAS)[number]))
    : [];
  const categories = Array.isArray(raw.categories)
    ? raw.categories.filter(
        (category): category is string =>
          typeof category === "string" && JOB_CATEGORIES.includes(category as (typeof JOB_CATEGORIES)[number])
      )
    : [];
  const employmentTypes = Array.isArray(raw.employmentTypes)
    ? raw.employmentTypes.filter(
        (type): type is string =>
          typeof type === "string" && EMPLOYMENT_TYPES.includes(type as (typeof EMPLOYMENT_TYPES)[number])
      )
    : [];

  return { areas, categories, employmentTypes };
}

export function loadStoredExploreFilters(): JobFilters {
  if (typeof window === "undefined") return DEFAULT_JOB_FILTERS;

  try {
    const raw = localStorage.getItem(EXPLORE_FILTERS_STORAGE_KEY);
    if (!raw) return DEFAULT_JOB_FILTERS;
    return sanitizeStoredFilters(JSON.parse(raw));
  } catch {
    return DEFAULT_JOB_FILTERS;
  }
}

export function saveStoredExploreFilters(filters: JobFilters): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(EXPLORE_FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // ignore quota / private mode errors
  }
}

export const EXPLORE_STARTED_PARAM = "started";
export const EXPLORE_FILTERS_PARAM = "filters";

export function parseExploreFiltersFromParams(searchParams: URLSearchParams): JobFilters {
  const areas = searchParams.get("areas")?.split(",").filter(Boolean) ?? [];
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) ?? [];
  // Unlike areas/categories, an unrecognised employment type would be dropped at
  // the enum boundary and turn into `in: []`, emptying the whole feed. Drop it
  // here instead so a stale link degrades to "no employment filter".
  const employmentTypes = (searchParams.get("employmentTypes")?.split(",").filter(Boolean) ?? [])
    .filter((type) => EMPLOYMENT_TYPES.includes(type as (typeof EMPLOYMENT_TYPES)[number]));
  return { areas, categories, employmentTypes };
}

export function isExploreFilterScreen(searchParams: URLSearchParams): boolean {
  return searchParams.get(EXPLORE_FILTERS_PARAM) === "1";
}

export function isExploreFeedReady(searchParams: URLSearchParams): boolean {
  return !isExploreFilterScreen(searchParams);
}

export function buildExploreFeedParams(
  filters: JobFilters,
  options?: { started?: boolean }
): URLSearchParams {
  const params = new URLSearchParams();
  if (options?.started) params.set(EXPLORE_STARTED_PARAM, "1");
  if (filters.areas.length) params.set("areas", filters.areas.join(","));
  if (filters.categories.length) params.set("categories", filters.categories.join(","));
  if (filters.employmentTypes.length) params.set("employmentTypes", filters.employmentTypes.join(","));
  return params;
}

export function exploreFeedParamsKey(searchParams: URLSearchParams): string {
  return [
    searchParams.get("areas") ?? "",
    searchParams.get("categories") ?? "",
    searchParams.get("employmentTypes") ?? "",
    searchParams.get(EXPLORE_STARTED_PARAM) ?? "",
  ].join("|");
}
