import { cache } from "react";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapSeekerProfile } from "@/lib/db/mappers";
import { getSupabaseUser } from "@/lib/auth/supabase-user";
import type { UserProfile } from "@/lib/types";

export type SeekerSession = {
  authUserId: string;
  seekerId: string;
  profile: UserProfile & { id: string };
};

export const getSeekerSession = cache(async (): Promise<SeekerSession | null> => {
  const user = await getSupabaseUser();
  if (!user?.email) return null;

  const role = user.app_metadata?.role as string | undefined;
  if (role === "admin" || role === "company") return null;

  const row = await prisma.seekerProfile.findFirst({
    where: { OR: [{ supabaseUserId: user.id }, { email: user.email }] },
  });

  if (!row) return null;

  if (!row.supabaseUserId) {
    await prisma.seekerProfile.update({
      where: { id: row.id },
      data: { supabaseUserId: user.id },
    });
  }

  return {
    authUserId: user.id,
    seekerId: row.id,
    profile: mapSeekerProfile(row),
  };
});

export async function requireSeekerSession(): Promise<SeekerSession | NextResponse> {
  const session = await getSeekerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
