import { NextResponse, type NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { mapStaffPanelPath } from "@/lib/staff/paths";
import { API_ERRORS } from "@/lib/api-errors";

export type { AuthRole, StaffRole } from "@/lib/auth/roles";
export { getRoleFromUser, isStaffRole } from "@/lib/auth/roles";

const SEEKER_PROTECTED = ["/explore", "/liked", "/profile", "/chat", "/courses", "/settings", "/jobs"];
const AUTH_REQUIRED_APIS = ["/api/saves", "/api/applications", "/api/chat", "/api/profile"];

function isAdminLoginPath(pathname: string): boolean {
  return pathname === "/admin/login";
}

function isCompanyLoginPath(pathname: string): boolean {
  return pathname === "/company/login";
}

function isStaffLoginPath(pathname: string): boolean {
  return isAdminLoginPath(pathname) || isCompanyLoginPath(pathname);
}

function isAdminPanelPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isCompanyPanelPath(pathname: string): boolean {
  return pathname === "/company" || pathname.startsWith("/company/");
}

function staffHomeForRole(role: "admin" | "company"): string {
  return role === "admin" ? "/admin" : "/company";
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = await getAuthSession(request);
  const role = session?.role ?? null;
  const isStaff = isStaffRole(role);
  const isLoggedIn = Boolean(session);

  const isAdminLogin = isAdminLoginPath(pathname);
  const isCompanyLogin = isCompanyLoginPath(pathname);
  const isAdminPanel = isAdminPanelPath(pathname) && !isAdminLogin;
  const isCompanyPanel = isCompanyPanelPath(pathname) && !isCompanyLogin;
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdminApi) {
    if (!isStaff) {
      return NextResponse.json({ error: API_ERRORS.unauthorized }, { status: 401 });
    }
    return NextResponse.next({ request });
  }

  if (isAdminPanel) {
    if (!isStaff) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      if (isLoggedIn && !isStaff) {
        loginUrl.searchParams.set("error", "staff_only");
      }
      return NextResponse.redirect(loginUrl);
    }
    if (role === "company") {
      return NextResponse.redirect(new URL(mapStaffPanelPath(pathname, "/company"), request.url));
    }
    return NextResponse.next({ request });
  }

  if (isCompanyPanel) {
    if (!isStaff) {
      const loginUrl = new URL("/company/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      if (isLoggedIn && !isStaff) {
        loginUrl.searchParams.set("error", "staff_only");
      }
      return NextResponse.redirect(loginUrl);
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL(mapStaffPanelPath(pathname, "/admin"), request.url));
    }
    return NextResponse.next({ request });
  }

  if (isStaffLoginPath(pathname)) {
    if (isStaff && role) {
      const next = request.nextUrl.searchParams.get("next");
      const home = staffHomeForRole(role);
      let dest = home;

      if (next) {
        if (role === "admin" && next.startsWith("/admin")) dest = next;
        if (role === "company" && next.startsWith("/company")) dest = next;
      }

      if (isAdminLogin && role === "company") {
        return NextResponse.redirect(new URL("/company/login", request.url));
      }
      if (isCompanyLogin && role === "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next({ request });
  }

  if (AUTH_REQUIRED_APIS.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    return NextResponse.json({ error: API_ERRORS.unauthorized }, { status: 401 });
  }

  if (SEEKER_PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("reason", "required");
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request });
}
