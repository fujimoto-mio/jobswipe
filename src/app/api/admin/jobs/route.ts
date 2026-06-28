import { NextResponse } from "next/server";
import { updateJobApproval, deleteJob } from "@/lib/db";
import { queryStaffJobs } from "@/lib/db/staff-jobs";
import { requireAdminUser, requireStaffUser } from "@/lib/auth/admin";
import type { JobApprovalStatus } from "@/lib/types";

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
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  const { searchParams } = new URL(request.url);
  const page = parsePage(searchParams.get("page"));
  const limit = parseLimit(searchParams.get("limit"));
  const search = searchParams.get("search") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const order: "asc" | "desc" = searchParams.get("order") === "asc" ? "asc" : "desc";
  const approvalStatus =
    (searchParams.get("approvalStatus") as JobApprovalStatus | null) ?? undefined;

  try {
    const result = await queryStaffJobs({
      companyId: staff.role === "company" ? staff.companyId : null,
      page,
      limit,
      search,
      sort,
      order,
      approvalStatus: approvalStatus || undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/admin/jobs]", error);
    return NextResponse.json(
      { error: "求人データの取得に失敗しました", items: [], total: 0, page: 1, pageSize: 10 },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdminUser();
  if (admin instanceof NextResponse) return admin;

  try {
    const { id, approvalStatus } = (await request.json()) as {
      id: string;
      approvalStatus: JobApprovalStatus;
    };

    if (!id || !approvalStatus) {
      return NextResponse.json(
        { error: "id and approvalStatus are required" },
        { status: 400 }
      );
    }

    const job = await updateJobApproval(id, approvalStatus);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  try {
    const { id } = (await request.json()) as { id: string };
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const deleted = await deleteJob(id, staff.role === "company" ? staff.companyId : null);
    if (!deleted) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
