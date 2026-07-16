import { cache } from "react";
import { NextResponse } from "next/server";
import { SeekerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapSeekerProfileResolved } from "@/lib/db/mappers";
import { getAuthSession } from "@/lib/auth/session";
import { API_ERRORS } from "@/lib/api-errors";
import type { AuthRole } from "@/lib/auth/roles";
import type { UserProfile } from "@/lib/types";

export type SeekerSession = {
  authUserId: string;
  seekerId: string;
  profile: UserProfile & { id: string };
};

type SeekerSessionFailure = {
  status: 401 | 403;
  error: string;
  code: "session_required" | "wrong_role" | "profile_missing" | "suspended";
  role?: AuthRole;
  loginPath: string;
};

function failureResponse(failure: SeekerSessionFailure): NextResponse {
  return NextResponse.json(
    {
      error: failure.error,
      code: failure.code,
      role: failure.role ?? null,
      loginPath: failure.loginPath,
    },
    { status: failure.status }
  );
}

async function resolveSeekerSession(): Promise<
  { ok: true; session: SeekerSession } | { ok: false; failure: SeekerSessionFailure }
> {
  const auth = await getAuthSession();
  if (!auth) {
    return {
      ok: false,
      failure: {
        status: 401,
        error: "セッションの有効期限が切れました。再度ログインしてください",
        code: "session_required",
        loginPath: "/login",
      },
    };
  }

  if (auth.role !== "seeker") {
    return {
      ok: false,
      failure: {
        status: 401,
        error: "求職者アカウントでログインしてください",
        code: "wrong_role",
        role: auth.role,
        // Action requires seeker — always send to seeker login (not company/admin login).
        loginPath: "/login",
      },
    };
  }

  let row =
    auth.seekerId != null
      ? await prisma.seekerProfile.findUnique({ where: { id: auth.seekerId } })
      : null;

  if (!row) {
    row = await prisma.seekerProfile.findFirst({
      where: { OR: [{ supabaseUserId: auth.userId }, { email: auth.email }] },
    });
  }

  if (!row) {
    return {
      ok: false,
      failure: {
        status: 401,
        error: API_ERRORS.profileNotFound,
        code: "profile_missing",
        role: "seeker",
        loginPath: "/login",
      },
    };
  }

  if (row.status === SeekerStatus.Suspended) {
    return {
      ok: false,
      failure: {
        status: 403,
        error: API_ERRORS.accountSuspended,
        code: "suspended",
        role: "seeker",
        loginPath: "/login",
      },
    };
  }

  if (row.supabaseUserId !== auth.userId) {
    await prisma.seekerProfile.update({
      where: { id: row.id },
      data: { supabaseUserId: auth.userId },
    });
  }

  return {
    ok: true,
    session: {
      authUserId: auth.userId,
      seekerId: row.id,
      profile: await mapSeekerProfileResolved(row),
    },
  };
}

export const getSeekerSession = cache(async (): Promise<SeekerSession | null> => {
  const result = await resolveSeekerSession();
  return result.ok ? result.session : null;
});

export async function requireSeekerSession(): Promise<SeekerSession | NextResponse> {
  const result = await resolveSeekerSession();
  if (!result.ok) return failureResponse(result.failure);
  return result.session;
}
