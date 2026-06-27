import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffUser } from "@/lib/auth/admin";
import { getRoleFromUser, isStaffRole } from "@/lib/auth/roles";

export async function POST() {
  const staff = await getStaffUser();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await import("@/lib/supabase/server").then((m) => m.createSupabaseServerClient());
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = getRoleFromUser(user);
  if (!isStaffRole(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
