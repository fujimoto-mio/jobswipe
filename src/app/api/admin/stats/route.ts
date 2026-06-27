import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/admin";
import { getAdminStats } from "@/lib/db";

export async function GET() {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  const companyId = staff.role === "company" ? staff.companyId : null;
  return NextResponse.json(await getAdminStats(companyId));
}
