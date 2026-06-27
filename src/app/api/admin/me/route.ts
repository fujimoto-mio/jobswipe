import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  let companyName: string | null = null;
  if (staff.companyId) {
    const company = await prisma.company.findUnique({ where: { id: staff.companyId } });
    companyName = company?.name ?? null;
  }

  return NextResponse.json({
    role: staff.role,
    companyId: staff.companyId,
    companyName,
    email: staff.email,
  });
}