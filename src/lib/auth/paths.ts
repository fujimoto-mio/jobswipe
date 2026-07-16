import type { AuthRole } from "@/lib/auth/roles";

/** Login page for the given account role. */
export function loginPathForRole(role?: AuthRole | string | null): string {
  if (role === "company") return "/company/login";
  if (role === "admin") return "/admin/login";
  return "/login";
}

/** Home panel for staff roles after login. */
export function homePathForRole(role?: AuthRole | string | null): string {
  if (role === "company") return "/company";
  if (role === "admin") return "/admin";
  return "/explore";
}
