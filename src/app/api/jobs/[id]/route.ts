import { NextResponse } from "next/server";
import { getJobById, incrementJobView, updateJob, getPendingSubmissionForJob } from "@/lib/db";
import { submissionToPreviewJob } from "@/lib/db/job-submissions";
import { getStaffUser, requireStaffUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import type { UpdateJobInput } from "@/lib/types";
import { API_ERRORS } from "@/lib/api-errors";

async function staffCanAccessJob(
  staff: { role: string; companyId: string | null },
  jobId: string
): Promise<boolean> {
  if (staff.role === "admin") return true;
  if (staff.role !== "company" || !staff.companyId) return false;

  const row = await prisma.job.findFirst({
    where: { id: jobId, companyId: staff.companyId },
  });
  return Boolean(row);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const trackView = searchParams.get("trackView") !== "false";
  const staff = await getStaffUser();
  const job = await getJobById(id);

  if (!job) {
    return NextResponse.json({ error: API_ERRORS.jobNotFound }, { status: 404 });
  }

  if (!staff) {
    if (job.approvalStatus !== "Active") {
      return NextResponse.json({ error: API_ERRORS.jobNotFound }, { status: 404 });
    }
    if (trackView) {
      await incrementJobView(id);
    }
  } else if (staff.role === "company") {
    const allowed = await staffCanAccessJob(staff, id);
    if (!allowed) {
      return NextResponse.json({ error: API_ERRORS.jobNotFound }, { status: 404 });
    }
  }

  const pendingSubmission = staff ? await getPendingSubmissionForJob(id) : null;
  const editJob =
    staff && staff.role !== "admin" && job.approvalStatus === "Active" && pendingSubmission
      ? submissionToPreviewJob(job, pendingSubmission)
      : job;

  return NextResponse.json({
    job,
    ...(staff ? { pendingSubmission, editJob } : {}),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  const { id } = await params;

  try {
    const body = (await request.json()) as UpdateJobInput;

    if (staff.role === "company") {
      const allowed = await staffCanAccessJob(staff, id);
      if (!allowed) {
        return NextResponse.json({ error: API_ERRORS.jobNotFound }, { status: 404 });
      }

      const existing = await getJobById(id);

      if (existing?.approvalStatus === "Active" && !body.submit) {
        return NextResponse.json(
          { error: "承認済みの求人は変更を申請してください" },
          { status: 400 }
        );
      }
    }

    if (
      staff.role === "company" &&
      body.approvalStatus &&
      body.approvalStatus !== "Pending" &&
      body.approvalStatus !== "Draft"
    ) {
      return NextResponse.json({ error: API_ERRORS.adminOnlyApproval }, { status: 403 });
    }

    const job = await updateJob(id, body, {
      staffCompanyId: staff.role === "company" ? staff.companyId : null,
      allowActiveDirectEdit: staff.role === "admin",
    });
    if (!job) {
      return NextResponse.json({ error: API_ERRORS.jobNotFound }, { status: 404 });
    }

    const pendingSubmission =
      staff.role === "company" ? await getPendingSubmissionForJob(id) : null;

    return NextResponse.json({ success: true, job, pendingSubmission });
  } catch {
    return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
  }
}
