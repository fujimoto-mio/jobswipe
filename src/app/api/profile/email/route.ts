import { NextResponse } from "next/server";
import { upsertSeekerProfile } from "@/lib/db";
import { requireSeekerSession } from "@/lib/auth/seeker";

/** @deprecated Use PATCH /api/auth/email */
export async function PATCH() {
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  const profile = await upsertSeekerProfile(
    {
      ...session.profile,
      email: session.profile.email,
    },
    { id: session.seekerId, supabaseUserId: session.authUserId }
  );

  return NextResponse.json({ success: true, profile });
}
