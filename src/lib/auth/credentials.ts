import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { API_ERRORS } from "@/lib/api-errors";
import type { AuthRole } from "@/lib/auth/roles";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

type CreateCredentialInput = {
  email: string;
  password: string;
  role: AuthRole;
  id?: string;
};

type CreateCredentialResult =
  | { ok: true; userId: string }
  | { ok: false; code: "already_registered" | "unknown"; message: string };

export type { CreateCredentialResult };

export async function createAuthCredential(input: CreateCredentialInput): Promise<CreateCredentialResult> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.authCredential.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      code: "already_registered",
      message: "このメールアドレスは既に登録されています。ログインしてください",
    };
  }

  try {
    const row = await prisma.authCredential.create({
      data: {
        id: input.id ?? randomUUID(),
        email,
        passwordHash: await hashPassword(input.password),
        role: input.role,
      },
    });
    return { ok: true, userId: row.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : API_ERRORS.userCreationFailed;
    return { ok: false, code: "unknown", message };
  }
}

export async function deleteAuthCredential(userId: string): Promise<void> {
  await prisma.authCredential.delete({ where: { id: userId } }).catch(() => {});
}

export async function updateAuthCredentialPassword(userId: string, password: string): Promise<void> {
  await prisma.authCredential.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(password) },
  });
}

export async function updateAuthCredentialEmail(userId: string, email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await prisma.authCredential.update({
    where: { id: userId },
    data: { email: normalized },
  });
}

export type VerifiedCredential = {
  id: string;
  email: string;
  role: AuthRole;
};

export async function verifyAuthCredential(
  email: string,
  password: string
): Promise<VerifiedCredential | null> {
  const row = await prisma.authCredential.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!row) return null;
  const valid = await verifyPassword(password, row.passwordHash);
  if (!valid) return null;
  return { id: row.id, email: row.email, role: row.role };
}
