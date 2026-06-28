import { NextResponse } from "next/server";
import { upsertSeekerProfile } from "@/lib/db";
import { getSeekerSession } from "@/lib/auth/seeker";
import { getSupabaseUserFromRequest } from "@/lib/auth/supabase-user";
import { profileEditSchema, seekerProfileSchema, type ProfileEditValues, type SeekerProfileValues } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate-body";
import type { UserProfile } from "@/lib/types";

export async function GET() {
  const session = await getSeekerSession();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  return NextResponse.json({ profile: session.profile });
}

export async function POST(request: Request) {
  const user = await getSupabaseUserFromRequest(request);
  if (!user?.email) {
    return NextResponse.json({ error: "先にサインアップまたはログインしてください" }, { status: 401 });
  }

  try {
    const raw = await request.json();
    const validated = await validateBody<SeekerProfileValues>(seekerProfileSchema, {
      ...raw,
      email: user.email,
    });
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: validated.status });
    }

    const profile = await upsertSeekerProfile(validated.data, { supabaseUserId: user.id });
    return NextResponse.json({ success: true, profile }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON body";
    return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSeekerSession();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  try {
    const raw = (await request.json()) as Partial<UserProfile>;
    const merged = {
      name: raw.name ?? session.profile.name,
      gender: raw.gender ?? session.profile.gender,
      birthday: raw.birthday ?? session.profile.birthday,
      area: raw.area ?? session.profile.area,
      desiredJobType: raw.desiredJobType ?? session.profile.desiredJobType,
      experience: raw.experience ?? session.profile.experience,
      employmentType: raw.employmentType ?? session.profile.employmentType,
      introSentence: raw.introSentence ?? session.profile.introSentence,
      summary: raw.summary ?? session.profile.summary,
      resumeUrl: raw.resumeUrl ?? session.profile.resumeUrl,
    };

    const validated = await validateBody<ProfileEditValues>(profileEditSchema, merged);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: validated.status });
    }

    const profile = await upsertSeekerProfile(
      {
        ...validated.data,
        email: session.profile.email,
      },
      {
        id: session.seekerId,
        supabaseUserId: session.authUserId,
      }
    );
    return NextResponse.json({ success: true, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON body";
    return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 });
  }
}
