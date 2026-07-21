import { cache } from "react";
import { NextResponse } from "next/server";
import { CompanyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { API_ERRORS } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth/session";
import { isStaffRole, type StaffRole } from "@/lib/auth/roles";

export type StaffUser = {
  id: string;
  email: string;
  name: string | null;
  role: StaffRole;
  companyId: string | null;
};

export const getStaffUser = cache(async (): Promise<StaffUser | null> => {
  const session = await getAuthSession();
  if (!session || !isStaffRole(session.role)) return null;

  const account = await prisma.account.findUnique({
    where: { id: session.userId },
    include: { company: { select: { status: true } } },
  });
  if (!account || account.role !== session.role) return null;

  if (
    account.role === "company" &&
    (account.company?.status === CompanyStatus.Suspended ||
      account.company?.status === CompanyStatus.Cancelled)
  ) {
    return null;
  }

  return {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role as StaffRole,
    companyId: account.companyId,
  };
});

export async function requireStaffUser(): Promise<StaffUser | NextResponse> {
  const staff = await getStaffUser();
  if (!staff) {
    return NextResponse.json({ error: API_ERRORS.unauthorized }, { status: 401 });
  }
  return staff;
}

export async function requireAdminUser(): Promise<StaffUser | NextResponse> {
  const staff = await getStaffUser();
  if (!staff || staff.role !== "admin") {
    return NextResponse.json({ error: API_ERRORS.forbidden }, { status: 403 });
  }
  return staff;
}
