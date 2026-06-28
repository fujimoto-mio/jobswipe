const SEEKER_ID_KEY = "jobswipe_seeker_id";

/** @deprecated Use Supabase session cookies instead */
export function getSeekerId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SEEKER_ID_KEY);
}

export function saveSeekerId(id: string): void {
  localStorage.setItem(SEEKER_ID_KEY, id);
}

export function clearSeekerId(): void {
  localStorage.removeItem(SEEKER_ID_KEY);
}

export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers, credentials: "include" });
}

type CacheEntry = { data: unknown; expiresAt: number };
const getCache = new Map<string, CacheEntry>();

/** Cached GET for short-lived client data (counts, lists). */
export async function apiFetchCached<T>(url: string, ttlMs = 30_000): Promise<T> {
  const key = url;
  const hit = getCache.get(key);
  if (hit && Date.now() < hit.expiresAt) {
    return hit.data as T;
  }

  const res = await apiFetch(url);
  const data = (await res.json()) as T;
  getCache.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}

export function invalidateApiCache(prefix?: string): void {
  if (!prefix) {
    getCache.clear();
    return;
  }
  for (const key of getCache.keys()) {
    if (key.startsWith(prefix)) getCache.delete(key);
  }
}
