import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";
import { getAdminSeekerDetail, setSeekerStatus } from "@/lib/db/admin-seekers";
import { SEEKER_STATUSES, type SeekerStatus } from "@/lib/constants";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const staff = await requireAdminUser();
  if (staff instanceof NextResponse) return staff;

  const { id } = await context.params;
  const seeker = await getAdminSeekerDetail(id);
  if (!seeker) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(seeker);
}

export async function PATCH(request: Request, context: RouteContext) {
  const staff = await requireAdminUser();
  if (staff instanceof NextResponse) return staff;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { status?: string };
    if (!body.status || !SEEKER_STATUSES.includes(body.status as SeekerStatus)) {
      return NextResponse.json({ error: "status must be Active or Suspended" }, { status: 400 });
    }

    const existing = await getAdminSeekerDetail(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await setSeekerStatus(id, body.status as SeekerStatus);
    const seeker = await getAdminSeekerDetail(id);
    return NextResponse.json({ success: true, ...seeker });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
