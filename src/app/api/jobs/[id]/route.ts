import { NextResponse } from "next/server";
import { getJobById, incrementJobView, updateJob } from "@/lib/db";
import { getStaffUser, requireStaffUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import type { UpdateJobInput } from "@/lib/types";

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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const staff = await getStaffUser();
  const job = await getJobById(id);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (!staff) {
    if (job.approvalStatus !== "approved") {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    await incrementJobView(id);
  } else if (staff.role === "company") {
    const allowed = await staffCanAccessJob(staff, id);
    if (!allowed) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ job });
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
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      const existing = await getJobById(id);
      if (existing?.approvalStatus === "approved") {
        return NextResponse.json({ error: "承認済みの求人は編集できません" }, { status: 403 });
      }
    }

    if (staff.role === "company" && body.approvalStatus && body.approvalStatus !== "pending") {
      return NextResponse.json({ error: "Only admins can change approval status" }, { status: 403 });
    }

    const job = await updateJob(id, body, {
      staffCompanyId: staff.role === "company" ? staff.companyId : null,
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
