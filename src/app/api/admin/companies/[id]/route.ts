import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";
import { getAdminCompanyDetail } from "@/lib/db/admin-companies";
import { API_ERRORS } from "@/lib/api-errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const staff = await requireAdminUser();
  if (staff instanceof NextResponse) return staff;

  const { id } = await context.params;
  const company = await getAdminCompanyDetail(id);
  if (!company) {
    return NextResponse.json({ error: API_ERRORS.notFound }, { status: 404 });
  }

  return NextResponse.json({ company });
}
