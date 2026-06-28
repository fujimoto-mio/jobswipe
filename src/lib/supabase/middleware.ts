import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getRoleFromUser, isStaffRole } from "@/lib/auth/roles";
import { mapStaffPanelPath } from "@/lib/staff/paths";

export type { AuthRole, StaffRole } from "@/lib/auth/roles";
export { getRoleFromUser, isStaffRole } from "@/lib/auth/roles";

const SEEKER_PROTECTED = ["/liked", "/profile", "/chat"];
/** Auth required; route handlers enforce seeker vs staff permissions. */
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
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;

  const isAdminLogin = isAdminLoginPath(pathname);
  const isCompanyLogin = isCompanyLoginPath(pathname);
  const isAdminPanel = isAdminPanelPath(pathname) && !isAdminLogin;
  const isCompanyPanel = isCompanyPanelPath(pathname) && !isCompanyLogin;
  const isStaffPanel = isAdminPanel || isCompanyPanel;
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!url || !key) {
    if (isStaffPanel) {
      return NextResponse.redirect(new URL("/company/login?error=supabase", request.url));
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  const role = user ? getRoleFromUser(user) : null;
  const isStaff = isStaffRole(role);

  if (isAdminApi) {
    if (!isStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return supabaseResponse;
  }

  if (isAdminPanel) {
    if (!isStaff) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      if (user && !isStaff) {
        loginUrl.searchParams.set("error", "staff_only");
      }
      return NextResponse.redirect(loginUrl);
    }
    if (role === "company") {
      return NextResponse.redirect(new URL(mapStaffPanelPath(pathname, "/company"), request.url));
    }
    return supabaseResponse;
  }

  if (isCompanyPanel) {
    if (!isStaff) {
      const loginUrl = new URL("/company/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      if (user && !isStaff) {
        loginUrl.searchParams.set("error", "staff_only");
      }
      return NextResponse.redirect(loginUrl);
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL(mapStaffPanelPath(pathname, "/admin"), request.url));
    }
    return supabaseResponse;
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
    return supabaseResponse;
  }

  if (AUTH_REQUIRED_APIS.some((p) => pathname.startsWith(p)) && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (SEEKER_PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("reason", "required");
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
