import { SeekerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthRole } from "@/lib/auth/roles";
import { API_ERRORS } from "@/lib/api-errors";
import { verifyAuthCredential } from "@/lib/auth/credentials";
import type { AuthSession } from "@/lib/auth/session";

export type LoginResult =
  | { ok: true; session: AuthSession }
  | { ok: false; code: "invalid" | "suspended" | "wrong_role"; message: string };

export async function loginWithPassword(
  email: string,
  password: string,
  expectedRole?: AuthRole
): Promise<LoginResult> {
  const credential = await verifyAuthCredential(email, password);
  if (!credential) {
    return { ok: false, code: "invalid", message: API_ERRORS.invalidCredentials };
  }

  if (expectedRole && credential.role !== expectedRole) {
    return { ok: false, code: "wrong_role", message: API_ERRORS.wrongRole };
  }

  if (credential.role === "seeker") {
    const seeker = await prisma.seekerProfile.findFirst({
      where: { OR: [{ supabaseUserId: credential.id }, { email: credential.email }] },
      select: { id: true, status: true, supabaseUserId: true },
    });
    if (!seeker) {
      return { ok: false, code: "invalid", message: API_ERRORS.profileNotFound };
    }
    if (seeker.status === SeekerStatus.Suspended) {
      return { ok: false, code: "suspended", message: API_ERRORS.accountSuspended };
    }
    if (seeker.supabaseUserId !== credential.id) {
      await prisma.seekerProfile.update({
        where: { id: seeker.id },
        data: { supabaseUserId: credential.id },
      });
    }
    return {
      ok: true,
      session: {
        userId: credential.id,
        email: credential.email,
        role: "seeker",
        seekerId: seeker.id,
      },
    };
  }

  const account = await prisma.account.findUnique({
    where: { id: credential.id },
    include: { company: { select: { status: true } } },
  });

  if (!account || account.role !== credential.role) {
    return { ok: false, code: "invalid", message: API_ERRORS.invalidCredentials };
  }

  if (
    account.role === "company" &&
    (account.company?.status === "Suspended" || account.company?.status === "Cancelled")
  ) {
    return { ok: false, code: "suspended", message: API_ERRORS.accountSuspended };
  }

  return {
    ok: true,
    session: {
      userId: credential.id,
      email: credential.email,
      role: credential.role as "admin" | "company",
      companyId: account.companyId,
    },
  };
}

export async function buildSessionForUserId(userId: string): Promise<AuthSession | null> {
  const credential = await prisma.authCredential.findUnique({ where: { id: userId } });
  if (!credential) return null;

  if (credential.role === "seeker") {
    const seeker = await prisma.seekerProfile.findFirst({
      where: { OR: [{ supabaseUserId: userId }, { email: credential.email }] },
      select: { id: true, status: true },
    });
    if (!seeker || seeker.status === SeekerStatus.Suspended) return null;
    return {
      userId,
      email: credential.email,
      role: "seeker",
      seekerId: seeker.id,
    };
  }

  const account = await prisma.account.findUnique({ where: { id: userId } });
  if (!account) return null;
  if (account.role === "company" && account.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: account.companyId },
      select: { status: true },
    });
    if (company?.status === "Suspended" || company?.status === "Cancelled") return null;
  }
  return {
    userId,
    email: credential.email,
    role: account.role as "admin" | "company",
    companyId: account.companyId,
  };
}
