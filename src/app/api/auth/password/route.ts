import { NextResponse } from "next/server";
import { updateAuthCredentialPassword } from "@/lib/auth/credentials";
import { requireSeekerSession } from "@/lib/auth/seeker";
import { getStaffUser } from "@/lib/auth/admin";

type PasswordBody = { password?: string };

export async function PATCH(request: Request) {
  const body = (await request.json()) as PasswordBody;
  const password = body.password?.trim();
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "パスワードは8文字以上で入力してください" }, { status: 400 });
  }

  const seeker = await requireSeekerSession();
  if (!(seeker instanceof NextResponse)) {
    await updateAuthCredentialPassword(seeker.authUserId, password);
    return NextResponse.json({ success: true });
  }

  const staff = await getStaffUser();
  if (staff) {
    await updateAuthCredentialPassword(staff.id, password);
    return NextResponse.json({ success: true });
  }

  // Prefer the structured seeker auth error (code + loginPath).
  return seeker;
}
