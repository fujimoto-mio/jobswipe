/**
 * App base URL (no trailing slash).
 * Set NEXT_PUBLIC_APP_URL in .env — required for Vercel / custom domains.
 * Falls back to VERCEL_URL (server) or window.location.origin (browser).
 */
export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

/** Resolve a path or absolute URL for fetch (e.g. `/api/jobs` → full URL when APP_URL is set). */
export function apiUrl(input: string): string {
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }
  const path = input.startsWith("/") ? input : `/${input}`;
  return `${getAppUrl()}${path}`;
}
