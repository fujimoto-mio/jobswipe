import { cache } from "react";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import type { AuthRole } from "@/lib/auth/roles";
import {
  AUTH_COOKIE_NAME,
  clearSessionCookieOptions,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
  type SessionTokenPayload,
} from "@/lib/auth/jwt";

export type AuthSession = {
  userId: string;
  email: string;
  role: AuthRole;
  seekerId?: string;
  companyId?: string | null;
};

function bearerToken(request?: Request): string | null {
  if (!request) return null;
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

async function readSessionToken(request?: Request): Promise<string | null> {
  const bearer = bearerToken(request);
  if (bearer) return bearer;

  if (request) {
    const req = request as NextRequest;
    const fromRequest = req.cookies?.get(AUTH_COOKIE_NAME)?.value;
    if (fromRequest) return fromRequest;
  }

  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

function toAuthSession(payload: SessionTokenPayload): AuthSession {
  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    seekerId: payload.seekerId,
    companyId: payload.companyId,
  };
}

/** Local JWT verify — no external auth network call. */
export const getAuthSession = cache(async (request?: Request): Promise<AuthSession | null> => {
  const token = await readSessionToken(request);
  if (!token) return null;
  const payload = await verifySessionToken(token);
  return payload ? toAuthSession(payload) : null;
});

export async function setAuthSessionCookie(
  response: NextResponse,
  session: AuthSession
): Promise<void> {
  const token = await signSessionToken({
    sub: session.userId,
    email: session.email,
    role: session.role,
    seekerId: session.seekerId,
    companyId: session.companyId,
  });
  response.cookies.set(AUTH_COOKIE_NAME, token, sessionCookieOptions());
}

export function clearAuthSessionCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", clearSessionCookieOptions());
}
