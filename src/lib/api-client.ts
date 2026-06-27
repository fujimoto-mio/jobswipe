import { apiUrl } from "@/lib/app-url";

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
  const resolved =
    typeof input === "string" ? apiUrl(input) : input instanceof URL ? input.toString() : input;

  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(resolved, { ...init, headers, credentials: "include" });
}
