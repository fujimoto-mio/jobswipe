import type { StaffRole } from "@/lib/auth/roles";

export type StaffPanelConfig = {
  basePath: "/admin" | "/company";
  role: StaffRole;
  loginPath: string;
  title: string;
};

export const ADMIN_PANEL: StaffPanelConfig = {
  basePath: "/admin",
  role: "admin",
  loginPath: "/admin/login",
  title: "管理者",
};

export const COMPANY_PANEL: StaffPanelConfig = {
  basePath: "/company",
  role: "company",
  loginPath: "/company/login",
  title: "企業担当",
};

/** Map /admin/... ↔ /company/... for role redirects */
export function mapStaffPanelPath(pathname: string, targetBase: "/admin" | "/company"): string {
  const fromBase = targetBase === "/company" ? "/admin" : "/company";
  if (pathname === fromBase) return targetBase;
  if (pathname.startsWith(`${fromBase}/`)) {
    return `${targetBase}${pathname.slice(fromBase.length)}`;
  }
  return targetBase;
}
