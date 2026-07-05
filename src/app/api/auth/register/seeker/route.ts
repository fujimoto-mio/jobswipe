import { NextResponse } from "next/server";
import { createConfirmedAuthUser, deleteAuthUser } from "@/lib/auth/admin-signup";
import { upsertSeekerProfile } from "@/lib/db";
import { buildSessionForUserId } from "@/lib/auth/login";
import { setAuthSessionCookie } from "@/lib/auth/session";
import { seekerRegisterSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate-body";
import { normalizeSeekerProfileFields } from "@/lib/profile-fields";
import { API_ERRORS } from "@/lib/api-errors";

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
          ...normalizeSeekerProfileFields(null),
        },
        { supabaseUserId: auth.userId }
      );

      const session = await buildSessionForUserId(auth.userId);
      const response = NextResponse.json({ success: true, profile }, { status: 201 });
      if (session) await setAuthSessionCookie(response, session);
      return response;
    } catch (err) {
      await deleteAuthUser(auth.userId);
      const message = err instanceof Error ? err.message : API_ERRORS.profileSaveFailed;
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
  }
}
