import { NextResponse } from "next/server";
import {
  cancelJobDirectly,
  requestJobCancellation,
  resolveJobCancellation,
} from "@/lib/db/job-cancellation";
import { requireAdminUser, requireStaffUser } from "@/lib/auth/admin";
import { API_ERRORS } from "@/lib/api-errors";

// Company (or admin) requests cancellation of a published job.
export async function POST(request: Request) {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  try {
    const { id } = (await request.json()) as { id: string };
    if (!id) {
      return NextResponse.json({ error: API_ERRORS.idRequired }, { status: 400 });
    }

    const job = await requestJobCancellation(
      id,
      staff.role === "company" ? staff.companyId : null
    );
    if (!job) {
      return NextResponse.json({ error: API_ERRORS.jobNotFound }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch {
    return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
  }
}

// Admin approves/rejects a request, or directly cancels a job.
export async function PATCH(request: Request) {
  const admin = await requireAdminUser();
  if (admin instanceof NextResponse) return admin;

  try {
    const { id, action } = (await request.json()) as {
      id: string;
      action: "approve" | "reject" | "cancel";
    };

    if (!id || !action) {
      return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
    }

    const job =
      action === "cancel"
        ? await cancelJobDirectly(id)
        : await resolveJobCancellation(id, action === "approve");

    if (!job) {
      return NextResponse.json({ error: API_ERRORS.jobNotFound }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch {
    return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
  }
}
