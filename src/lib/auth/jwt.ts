import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { AuthRole } from "@/lib/auth/roles";

export const AUTH_COOKIE_NAME = "jobswipe_session";

export type SessionTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  role: AuthRole;
  seekerId?: string;
  companyId?: string | null;
};

function secretKey() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

function expiresInSeconds(): number {
  const raw = process.env.AUTH_JWT_EXPIRES_IN ?? "7d";
  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match) return 60 * 60 * 24 * 7;
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === "s") return value;
  if (unit === "m") return value * 60;
  if (unit === "h") return value * 60 * 60;
  return value * 60 * 60 * 24;
}

export async function signSessionToken(payload: Omit<SessionTokenPayload, "sub"> & { sub: string }) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    seekerId: payload.seekerId,
    companyId: payload.companyId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds()}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const sub = payload.sub;
    const email = payload.email;
    const role = payload.role;
    if (typeof sub !== "string" || typeof email !== "string") return null;
    if (role !== "admin" && role !== "company" && role !== "seeker") return null;
    return {
      ...payload,
      sub,
      email,
      role,
      seekerId: typeof payload.seekerId === "string" ? payload.seekerId : undefined,
      companyId:
        payload.companyId === null || typeof payload.companyId === "string" ? payload.companyId : undefined,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSeconds = expiresInSeconds()) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function clearSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
