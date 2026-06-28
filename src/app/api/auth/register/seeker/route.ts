import { NextResponse } from "next/server";
import { createConfirmedAuthUser, deleteAuthUser } from "@/lib/auth/admin-signup";
import { upsertSeekerProfile } from "@/lib/db";
import { seekerRegisterSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate-body";

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const validated = await validateBody(seekerRegisterSchema, raw);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: validated.status });
    }

    const { password, email, ...profileFields } = validated.data;

    const auth = await createConfirmedAuthUser({
      email: email.trim(),
      password,
      role: "seeker",
      name: profileFields.name.trim(),
    });

    if (!auth.ok) {
      const status = auth.code === "already_registered" ? 409 : 500;
      return NextResponse.json({ error: auth.message }, { status });
    }

    try {
      const profile = await upsertSeekerProfile(
        {
          ...profileFields,
          email: email.trim(),
        },
        { supabaseUserId: auth.userId }
      );

      return NextResponse.json({ success: true, profile }, { status: 201 });
    } catch (err) {
      await deleteAuthUser(auth.userId);
      const message = err instanceof Error ? err.message : "プロフィールの保存に失敗しました";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
