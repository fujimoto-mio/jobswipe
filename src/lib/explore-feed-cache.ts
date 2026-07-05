import type { JobFeedItem, JobFilters } from "@/lib/types";

export type ExploreFeedCacheEntry = {
  jobs: JobFeedItem[];
  savedIds: string[];
  count: number;
  fetchKey: string;
};

const feedCache = new Map<string, ExploreFeedCacheEntry>();

export function exploreFeedCacheKey(filters: JobFilters): string {
  const areas = [...filters.areas].sort().join(",");
  const categories = [...filters.categories].sort().join(",");
  return `${areas}|${categories}`;
}

export function getExploreFeedCache(
  cacheKey: string,
  fetchKey: string
): ExploreFeedCacheEntry | undefined {
  const entry = feedCache.get(cacheKey);
  if (entry && entry.fetchKey === fetchKey) return entry;
  return undefined;
}

export function setExploreFeedCache(
  cacheKey: string,
  fetchKey: string,
  data: Pick<ExploreFeedCacheEntry, "jobs" | "savedIds" | "count">
): void {
  feedCache.set(cacheKey, { ...data, fetchKey });
}

export function updateExploreFeedSaves(
  cacheKey: string,
  fetchKey: string,
  savedIds: string[],
  count: number
): void {
  const entry = feedCache.get(cacheKey);
  if (entry && entry.fetchKey === fetchKey) {
    entry.savedIds = savedIds;
    entry.count = count;
  }
}
