import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteAuthUser } from "@/lib/auth/admin-signup";
import { requireSeekerSession } from "@/lib/auth/seeker";

export async function DELETE() {
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  try {
    await prisma.seekerProfile.delete({ where: { id: session.seekerId } });
    await deleteAuthUser(session.authUserId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "アカウントの削除に失敗しました";
    return NextResponse.json({ error: message.includes("削除") ? message : "アカウントの削除に失敗しました" }, { status: 500 });
  }
}
