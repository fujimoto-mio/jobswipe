import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertSeekerProfile, getSeekerProfile } from "@/lib/db";
import { getSeekerSession } from "@/lib/auth/seeker";
import type { UserProfile } from "@/lib/types";

export async function GET() {
  const session = await getSeekerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ profile: session.profile });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized — sign up or sign in first" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as UserProfile;

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }

    const profile = await upsertSeekerProfile(
      { ...body, email: user.email },
      { supabaseUserId: user.id }
    );
    return NextResponse.json({ success: true, profile }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSeekerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as UserProfile;
    const profile = await upsertSeekerProfile(body, {
      id: session.seekerId,
      supabaseUserId: session.authUserId,
    });
    return NextResponse.json({ success: true, profile });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
