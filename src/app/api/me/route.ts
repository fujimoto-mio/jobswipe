import { NextResponse } from "next/server";
import { requireSeekerSession } from "@/lib/auth/seeker";

export async function GET() {
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  return NextResponse.json({
    seekerId: session.seekerId,
    profile: session.profile,
  });
}
