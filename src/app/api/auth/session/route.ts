import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";

/** Lightweight session probe for client navigation (local JWT verify only). */
export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
  return NextResponse.json({
    loggedIn: true,
    role: session.role,
    email: session.email,
    seekerId: session.seekerId ?? null,
    companyId: session.companyId ?? null,
  });
}
