import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateAuthCredentialEmail } from "@/lib/auth/credentials";
import { requireSeekerSession } from "@/lib/auth/seeker";
import { getStaffUser } from "@/lib/auth/admin";
import { upsertSeekerProfile } from "@/lib/db";

type EmailBody = { email?: string };

export async function PATCH(request: Request) {
  const body = (await request.json()) as EmailBody;
  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "メールアドレスを入力してください" }, { status: 400 });
  }

  const seeker = await requireSeekerSession();
  if (!(seeker instanceof NextResponse)) {
    try {
      await updateAuthCredentialEmail(seeker.authUserId, email);
      const profile = await upsertSeekerProfile(
        { ...seeker.profile, email },
        { id: seeker.seekerId, supabaseUserId: seeker.authUserId }
      );
      return NextResponse.json({ success: true, profile });
    } catch {
      return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 409 });
    }
  }

  const staff = await getStaffUser();
  if (!staff) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  try {
    await updateAuthCredentialEmail(staff.id, email);
    await prisma.account.update({ where: { id: staff.id }, data: { email } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 409 });
  }
}
