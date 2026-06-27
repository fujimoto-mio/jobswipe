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
    "/api/admin/:path*",
    "/liked",
    "/profile",
    "/chat",
    "/api/saves",
    "/api/applications",
    "/api/chat",
    "/api/profile",
  ],
};
