import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";
import { getAdminCompanyDetail, setCompanyStatus } from "@/lib/db/admin-companies";
import { COMPANY_STATUSES, type CompanyStatus } from "@/lib/constants";
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

export async function PATCH(request: Request, context: RouteContext) {
  const staff = await requireAdminUser();
  if (staff instanceof NextResponse) return staff;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { status?: string };
    if (!body.status || !COMPANY_STATUSES.includes(body.status as CompanyStatus)) {
      return NextResponse.json({ error: API_ERRORS.invalidCompanyStatus }, { status: 400 });
    }

    const existing = await getAdminCompanyDetail(id);
    if (!existing) {
      return NextResponse.json({ error: API_ERRORS.notFound }, { status: 404 });
    }

    await setCompanyStatus(id, body.status as CompanyStatus);
    const company = await getAdminCompanyDetail(id);
    return NextResponse.json({ success: true, company });
  } catch {
    return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
  }
}
