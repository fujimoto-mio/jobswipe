import { cache } from "react";
import { NextResponse } from "next/server";
import { SeekerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapSeekerProfileResolved } from "@/lib/db/mappers";
import { getAuthSession } from "@/lib/auth/session";
import type { UserProfile } from "@/lib/types";

export type SeekerSession = {
  authUserId: string;
  seekerId: string;
  profile: UserProfile & { id: string };
};

export const getSeekerSession = cache(async (): Promise<SeekerSession | null> => {
  const session = await getAuthSession();
  if (!session || session.role !== "seeker") return null;

  if (session.seekerId) {
    const row = await prisma.seekerProfile.findUnique({ where: { id: session.seekerId } });
    if (!row || row.status === SeekerStatus.Suspended) return null;
    return {
      authUserId: session.userId,
      seekerId: row.id,
      profile: await mapSeekerProfileResolved(row),
    };
  }

  const row = await prisma.seekerProfile.findFirst({
    where: { OR: [{ supabaseUserId: session.userId }, { email: session.email }] },
  });
  if (!row || row.status === SeekerStatus.Suspended) return null;

  if (row.supabaseUserId !== session.userId) {
    await prisma.seekerProfile.update({
      where: { id: row.id },
      data: { supabaseUserId: session.userId },
    });
  }

  return {
    authUserId: session.userId,
    seekerId: row.id,
    profile: await mapSeekerProfileResolved(row),
  };
});

export async function requireSeekerSession(): Promise<SeekerSession | NextResponse> {
  const session = await getSeekerSession();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  return session;
}
