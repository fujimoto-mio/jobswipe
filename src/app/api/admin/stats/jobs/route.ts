import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/admin";
import { parseRegistrationTrendRange } from "@/lib/admin-registration-trend";
import { getAdminJobTrend } from "@/lib/db/admin-job-trend";
import { API_ERRORS } from "@/lib/api-errors";

export async function GET(request: Request) {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  const days = parseRegistrationTrendRange(new URL(request.url).searchParams.get("days"));
  if (!days) {
    return NextResponse.json({ error: API_ERRORS.invalidDaysParameter }, { status: 400 });
  }

  const companyId = staff.role === "company" ? staff.companyId : null;

  return NextResponse.json({
    days,
    points: await getAdminJobTrend(days, companyId),
  });
}
