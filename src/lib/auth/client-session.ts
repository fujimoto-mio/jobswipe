import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SessionCache = {
  loggedIn: boolean;
  expiresAt: number;
};

let cache: SessionCache | null = null;
const TTL_MS = 60_000;

/** Fast client-side session hint; avoids repeated getSession() during navigation. */
export async function getCachedClientSession(): Promise<boolean> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.loggedIn;
  }

  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    cache = { loggedIn: false, expiresAt: Date.now() + TTL_MS };
    return false;
  }

  const { data } = await supabase.auth.getSession();
  const loggedIn = Boolean(data.session);
  cache = { loggedIn, expiresAt: Date.now() + TTL_MS };
  return loggedIn;
}

export function clearClientSessionCache(): void {
  cache = null;
}
