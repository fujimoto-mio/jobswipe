import { NextResponse } from "next/server";
import { getSeekerSession } from "@/lib/auth/seeker";

export async function GET() {
  const session = await getSeekerSession();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  return NextResponse.json({
    seekerId: session.seekerId,
    profile: session.profile,
  });
}
