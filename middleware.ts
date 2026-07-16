import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/company",
    "/company/:path*",
    "/explore",
    "/liked",
    "/profile",
    "/chat",
    "/courses",
    "/settings",
    "/jobs/:path*",
    "/api/saves",
    "/api/saves/:path*",
    "/api/applications",
    "/api/applications/:path*",
    "/api/chat",
    "/api/chat/:path*",
    "/api/profile",
    "/api/profile/:path*",
  ],
};
