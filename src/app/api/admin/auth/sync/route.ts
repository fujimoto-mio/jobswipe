import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseUserFromRequest } from "@/lib/auth/supabase-user";
import { getRoleFromUser, isStaffRole } from "@/lib/auth/roles";
import { API_ERRORS } from "@/lib/api-errors";

export async function POST(request: Request) {
  const user = await getSupabaseUserFromRequest(request);
  if (!user?.email) {
    return NextResponse.json({ error: API_ERRORS.unauthorized }, { status: 401 });
  }

  const role = getRoleFromUser(user);
  if (!isStaffRole(role)) {
    return NextResponse.json({ error: API_ERRORS.forbidden }, { status: 403 });
  }

  await prisma.account.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email,
      name: (user.user_metadata?.name as string) ?? null,
      role,
    },
    update: {
      email: user.email,
      name: (user.user_metadata?.name as string) ?? null,
      role,
    },
  });

  return NextResponse.json({ success: true });
}
