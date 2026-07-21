import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";
import { queryAdminCompanies } from "@/lib/db/admin-companies";
import { listCompanies } from "@/lib/db/companies";
import { COMPANY_STATUSES, type CompanyStatus } from "@/lib/constants";

function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

function parseLimit(value: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 10;
  return Math.min(100, Math.floor(n));
}

export async function GET(request: Request) {
  const staff = await requireAdminUser();
  if (staff instanceof NextResponse) return staff;

  const { searchParams } = new URL(request.url);
  const isPaginated =
    searchParams.has("page") ||
    searchParams.has("limit") ||
    searchParams.has("search") ||
    searchParams.has("sort") ||
    searchParams.has("status");

  if (isPaginated) {
    const page = parsePage(searchParams.get("page"));
    const limit = parseLimit(searchParams.get("limit"));
    const search = searchParams.get("search") ?? undefined;
    const sort = searchParams.get("sort") ?? undefined;
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";
    const statusParam = searchParams.get("status");
    const status =
      statusParam && COMPANY_STATUSES.includes(statusParam as CompanyStatus)
        ? (statusParam as CompanyStatus)
        : undefined;

    const result = await queryAdminCompanies({ page, limit, search, sort, order, status });
    return NextResponse.json(result);
  }

  const companies = await listCompanies();
  return NextResponse.json({ companies });
}
