import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/admin";
import { API_ERRORS } from "@/lib/api-errors";
import {
  getApplicationsForJob,
  queryStaffApplicationJobs,
  queryStaffApplications,
} from "@/lib/db/staff-applications";
import { getApplicationWithSeeker, updateApplicationStatus } from "@/lib/db";
import { staffCanAccessApplication } from "@/lib/db/access";
import { JOB_APPROVAL_STATUSES } from "@/lib/constants";
import type { ApplicationStatus, JobApprovalStatus } from "@/lib/types";

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
  const id = searchParams.get("id");
  const jobId = searchParams.get("jobId");
  const companyId = staff.role === "company" ? staff.companyId : null;

  try {
    if (id) {
      const app = await getApplicationWithSeeker(id);
      if (!app) return NextResponse.json({ error: API_ERRORS.notFound }, { status: 404 });
      if (staff.role === "company") {
        const allowed = await staffCanAccessApplication(id, staff);
        if (!allowed) {
          return NextResponse.json({ error: API_ERRORS.forbidden }, { status: 403 });
        }
      }
      return NextResponse.json({ application: app });
    }

    if (jobId) {
      const applications = await getApplicationsForJob(jobId, companyId);
      return NextResponse.json({ applications, total: applications.length });
    }

    const view: "applications" | "jobs" =
      searchParams.get("view") === "jobs" ? "jobs" : "applications";
    const page = parsePage(searchParams.get("page"));
    const limit = parseLimit(searchParams.get("limit"));
    const search = searchParams.get("search") ?? undefined;
    const sort = searchParams.get("sort") ?? undefined;
    const order: "asc" | "desc" = searchParams.get("order") === "asc" ? "asc" : "desc";
    const status = (searchParams.get("status") as ApplicationStatus | null) ?? undefined;
    const approvalStatusParam = searchParams.get("approvalStatus");
    const approvalStatus = JOB_APPROVAL_STATUSES.includes(approvalStatusParam as JobApprovalStatus)
      ? (approvalStatusParam as JobApprovalStatus)
      : undefined;

    const query = {
      companyId,
      view,
      page,
      limit,
      search,
      sort,
      order,
      status: status || undefined,
      approvalStatus: approvalStatus || undefined,
    };

    if (view === "jobs") {
      const result = await queryStaffApplicationJobs(query);
      return NextResponse.json(result);
    }

    const result = await queryStaffApplications(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/admin/applications]", error);
    return NextResponse.json(
      { error: "応募データの取得に失敗しました", items: [], total: 0, page: 1, pageSize: 10 },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  try {
    const { id, status } = (await request.json()) as {
      id: string;
      status: ApplicationStatus;
    };

    if (!id || !status) {
      return NextResponse.json({ error: API_ERRORS.idAndStatusRequired }, { status: 400 });
    }

    const application = await updateApplicationStatus(
      id,
      status,
      staff.role === "company" ? staff.companyId : null
    );
    if (!application) {
      return NextResponse.json({ error: API_ERRORS.applicationNotFound }, { status: 404 });
    }

    return NextResponse.json({ success: true, application });
  } catch {
    return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
  }
}
