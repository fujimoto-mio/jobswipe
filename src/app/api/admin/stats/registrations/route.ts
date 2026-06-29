import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";
import {
  getAdminRegistrationTrend,
} from "@/lib/db/admin-registration-trend";
import { parseRegistrationTrendRange } from "@/lib/admin-registration-trend";

export async function GET(request: Request) {
  const admin = await requireAdminUser();
  if (admin instanceof NextResponse) return admin;

  const days = parseRegistrationTrendRange(new URL(request.url).searchParams.get("days"));
  if (!days) {
    return NextResponse.json({ error: "Invalid days parameter" }, { status: 400 });
  }

  return NextResponse.json({
    days,
    points: await getAdminRegistrationTrend(days),
  });
}
