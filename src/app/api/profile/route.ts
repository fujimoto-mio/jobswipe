import { NextResponse } from "next/server";
import { upsertSeekerProfile } from "@/lib/db";
import { getSeekerSession } from "@/lib/auth/seeker";
import { getSupabaseUserFromRequest } from "@/lib/auth/supabase-user";
import { profileEditSchema, seekerProfileSchema, type ProfileEditValues, type SeekerProfileValues } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate-body";
import { normalizeSeekerProfileFields, asSkills } from "@/lib/profile-fields";
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

    const profile = await upsertSeekerProfile(
      { ...normalizeSeekerProfileFields(null), ...validated.data },
      { supabaseUserId: user.id }
    );
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
    const base = session.profile;
    const merged: UserProfile = {
      name: raw.name ?? base.name,
      gender: raw.gender ?? base.gender,
      birthday: raw.birthday ?? base.birthday,
      area: raw.area ?? base.area,
      desiredJobType: raw.desiredJobType ?? base.desiredJobType,
      experience: raw.experience ?? base.experience,
      employmentType: raw.employmentType ?? base.employmentType,
      email: base.email,
      introSentence: raw.introSentence ?? base.introSentence,
      profileTitle: raw.profileTitle ?? base.profileTitle,
      resumeUrl: raw.resumeUrl ?? base.resumeUrl,
      futureGoals: raw.futureGoals ?? base.futureGoals,
      desiredSalary: raw.desiredSalary ?? base.desiredSalary,
      jobSearchIntent: raw.jobSearchIntent ?? base.jobSearchIntent,
      education: raw.education ?? base.education,
      portfolioUrl: raw.portfolioUrl ?? base.portfolioUrl,
      skills: raw.skills ?? base.skills,
      workHistory: raw.workHistory ?? base.workHistory,
    };

    const validated = await validateBody<ProfileEditValues>(profileEditSchema, merged);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: validated.status });
    }

    const profile = await upsertSeekerProfile(
      {
        ...normalizeSeekerProfileFields(base),
        ...validated.data,
        skills: asSkills(validated.data.skills),
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
