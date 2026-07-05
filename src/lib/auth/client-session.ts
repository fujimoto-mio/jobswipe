let cache: { loggedIn: boolean; expiresAt: number } | null = null;
const TTL_MS = 60_000;

/** Fast client-side session hint via local JWT cookie (no Supabase call). */
export async function getCachedClientSession(): Promise<boolean> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.loggedIn;
  }

  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    const loggedIn = res.ok;
    cache = { loggedIn, expiresAt: Date.now() + TTL_MS };
    return loggedIn;
  } catch {
    cache = { loggedIn: false, expiresAt: Date.now() + TTL_MS };
    return false;
  }
}

export function clearClientSessionCache(): void {
  cache = null;
}
