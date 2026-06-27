import { NextResponse } from "next/server";
import { updateJobApproval, deleteJob } from "@/lib/db";
import { requireAdminUser, requireStaffUser } from "@/lib/auth/admin";
import type { JobApprovalStatus } from "@/lib/types";

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
