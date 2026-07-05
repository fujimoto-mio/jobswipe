import { NextResponse } from "next/server";
import { requireSeekerSession } from "@/lib/auth/seeker";
import { getSeekerUnreadTotal } from "@/lib/db";

export async function GET() {
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  const unreadTotal = await getSeekerUnreadTotal(session.seekerId);
  return NextResponse.json(
    { unreadTotal },
    { headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=20" } }
  );
}
