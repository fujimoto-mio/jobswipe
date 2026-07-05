import type { AuthCredentialRole } from "@prisma/client";

export type AuthRole = AuthCredentialRole;
export type StaffRole = "admin" | "company";
export function getRoleFromUser(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}): AuthRole | null {
  const role = user.app_metadata?.role ?? user.user_metadata?.role;
  if (role === "admin" || role === "company" || role === "seeker") return role;
  return null;
}

export function isStaffRole(role: AuthRole | null | undefined): role is StaffRole {
  return role === "admin" || role === "company";
}
