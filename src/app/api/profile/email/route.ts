import { NextResponse } from "next/server";
import { upsertSeekerProfile } from "@/lib/db";
import { requireSeekerSession } from "@/lib/auth/seeker";
import { getSupabaseUser } from "@/lib/auth/supabase-user";

/** Sync seeker_profiles.email from the current Supabase auth user. */
export async function PATCH() {
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  const user = await getSupabaseUser();
  if (!user?.email) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const profile = await upsertSeekerProfile(
    {
      ...session.profile,
      email: user.email,
    },
    { id: session.seekerId, supabaseUserId: session.authUserId }
  );

  return NextResponse.json({ success: true, profile });
}
