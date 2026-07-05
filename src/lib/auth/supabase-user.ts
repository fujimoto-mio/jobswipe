import { cache } from "react";
import type { AuthRole } from "@/lib/auth/roles";
import { getAuthSession, type AuthSession } from "@/lib/auth/session";

/** @deprecated Use getAuthSession instead */
export type LegacyAuthUser = {
  id: string;
  email: string;
  app_metadata: { role: AuthRole };
  user_metadata: { role: AuthRole; name?: string };
};

function toLegacyUser(session: AuthSession): LegacyAuthUser {
  return {
    id: session.userId,
    email: session.email,
    app_metadata: { role: session.role },
    user_metadata: { role: session.role },
  };
}

/** Local JWT session lookup — no Supabase network call. */
export const getSupabaseUser = cache(async (request?: Request): Promise<LegacyAuthUser | null> => {
  const session = await getAuthSession(request);
  return session ? toLegacyUser(session) : null;
});

export async function getSupabaseUserFromRequest(request?: Request): Promise<LegacyAuthUser | null> {
  return getSupabaseUser(request);
}

export { getAuthSession, type AuthSession } from "@/lib/auth/session";
