import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function bearerToken(request?: Request): string | null {
  if (!request) return null;
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

async function getUserFromToken(token: string): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  return user ?? null;
}

/** One Supabase auth lookup per server request (deduped across route handlers). */
export const getSupabaseUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
});

/** Cookie session first, then Authorization Bearer (used right after sign-up). */
export async function getSupabaseUserFromRequest(request?: Request): Promise<User | null> {
  const fromCookie = await getSupabaseUser();
  if (fromCookie) return fromCookie;

  const token = bearerToken(request);
  if (!token) return null;

  return getUserFromToken(token);
}
