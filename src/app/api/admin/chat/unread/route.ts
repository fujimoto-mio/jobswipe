import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/admin";
import { getCompanyUnreadTotal } from "@/lib/db";
import { API_ERRORS } from "@/lib/api-errors";

export async function GET() {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  if (staff.role !== "company" || !staff.companyId) {
    return NextResponse.json({ unreadTotal: 0 });
  }

  const unreadTotal = await getCompanyUnreadTotal(staff.companyId);
  return NextResponse.json(
    { unreadTotal },
    { headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=20" } }
  );
}
