import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";
import { getAdminSeekerDetail, queryAdminSeekers } from "@/lib/db/admin-seekers";
import { API_ERRORS } from "@/lib/api-errors";

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
  const id = searchParams.get("id");

  if (id) {
    const seeker = await getAdminSeekerDetail(id);
    if (!seeker) return NextResponse.json({ error: API_ERRORS.notFound }, { status: 404 });
    return NextResponse.json(seeker);
  }

  const page = parsePage(searchParams.get("page"));
  const limit = parseLimit(searchParams.get("limit"));
  const search = searchParams.get("search") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "Active" || statusParam === "Suspended" ? statusParam : undefined;

  const result = await queryAdminSeekers({ page, limit, search, sort, order, status });
  return NextResponse.json(result);
}
