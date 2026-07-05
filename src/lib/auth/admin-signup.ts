import type { AuthRole } from "@/lib/auth/roles";
import { API_ERRORS } from "@/lib/api-errors";
import {
  createAuthCredential,
  deleteAuthCredential,
  type CreateCredentialResult,
} from "@/lib/auth/credentials";

type CreateAuthUserInput = {
  email: string;
  password: string;
  role: AuthRole;
  name: string;
};

type CreateAuthUserResult = CreateCredentialResult;

/** Create an auth credential with email/password (no confirmation email). */
export async function createConfirmedAuthUser(
  input: CreateAuthUserInput
): Promise<CreateAuthUserResult> {
  if (!process.env.AUTH_JWT_SECRET) {
    return { ok: false, code: "unknown", message: API_ERRORS.jwtNotConfigured };
  }
  return createAuthCredential({
    email: input.email,
    password: input.password,
    role: input.role,
  });
}

export async function deleteAuthUser(userId: string): Promise<void> {
  await deleteAuthCredential(userId);
}
