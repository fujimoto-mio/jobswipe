import { NextResponse } from "next/server";
import { upsertSeekerProfile, updateSeekerProfileMedia } from "@/lib/db";
import { getSeekerSession } from "@/lib/auth/seeker";
import { getSupabaseUserFromRequest } from "@/lib/auth/supabase-user";
import {
  profileEditSchema,
  profileMediaPatchSchema,
  seekerProfileSchema,
  type ProfileEditValues,
  type ProfileMediaPatchValues,
  type SeekerProfileValues,
} from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate-body";
import {
  isMediaOnlyProfilePatch,
  mergeSeekerProfilePatch,
  normalizeSeekerProfileFields,
  asSkills,
} from "@/lib/profile-fields";
import type { UserProfile } from "@/lib/types";

function profilePatchErrorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  if (message === "Invalid birthday") {
    return NextResponse.json({ error: "生年月日が正しくありません" }, { status: 400 });
  }
  if (message === "Account suspended") {
    return NextResponse.json({ error: "アカウントが停止されています" }, { status: 403 });
  }
  if (/invalid json|unexpected token|body/i.test(message)) {
    return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 });
  }
  if (message.includes("Unknown argument")) {
    return NextResponse.json(
      { error: "サーバーの再起動が必要です。開発中の場合は dev サーバーを止めて再起動してください。" },
      { status: 500 }
    );
  }
  console.error("[PATCH /api/profile]", err);
  return NextResponse.json({ error: "保存に失敗しました。しばらくしてから再度お試しください" }, { status: 500 });
}

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

    if (isMediaOnlyProfilePatch(raw)) {
      const validated = await validateBody<ProfileMediaPatchValues>(profileMediaPatchSchema, raw);
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: validated.status });
      }

      const profile = await updateSeekerProfileMedia(session.seekerId, validated.data);
      return NextResponse.json({ success: true, profile });
    }

    const merged = mergeSeekerProfilePatch(base, raw);

    const validated = await validateBody<ProfileEditValues>(profileEditSchema, merged);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: validated.status });
    }

    const profile = await upsertSeekerProfile(
      {
        ...mergeSeekerProfilePatch(base, validated.data),
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
    return profilePatchErrorResponse(err);
  }
}
