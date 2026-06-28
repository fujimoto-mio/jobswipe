import { cache } from "react";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRoleFromUser, isStaffRole, type StaffRole } from "@/lib/auth/roles";
import { getSupabaseUser } from "@/lib/auth/supabase-user";

export type StaffUser = {
  id: string;
  email: string;
  name: string | null;
  role: StaffRole;
  companyId: string | null;
};

export const getStaffUser = cache(async (): Promise<StaffUser | null> => {
  const user = await getSupabaseUser();
  if (!user?.email) return null;

  const role = getRoleFromUser(user);
  if (!isStaffRole(role)) return null;

  const account = await prisma.account.findUnique({ where: { id: user.id } });
  const companyId = account?.companyId ?? null;

  return {
    id: user.id,
    email: user.email,
    name: account?.name ?? (user.user_metadata?.name as string | undefined) ?? null,
    role,
    companyId,
  };
});

export async function requireStaffUser(): Promise<StaffUser | NextResponse> {
  const staff = await getStaffUser();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return staff;
}

export async function requireAdminUser(): Promise<StaffUser | NextResponse> {
  const staff = await getStaffUser();
  if (!staff || staff.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return staff;
}
