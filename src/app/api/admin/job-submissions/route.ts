import { NextResponse } from "next/server";
import {
  approveJobSubmission,
  listAdminReviewItems,
  rejectJobSubmission,
  submissionToPreviewJob,
} from "@/lib/db/job-submissions";
import { updateJobApproval } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth/admin";
import { API_ERRORS } from "@/lib/api-errors";

export async function GET() {
  const admin = await requireAdminUser();
  if (admin instanceof NextResponse) return admin;

  try {
    const items = await listAdminReviewItems();
    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        previewJob:
          item.kind === "revision" && item.submission
            ? submissionToPreviewJob(item.job, item.submission)
            : item.job,
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/job-submissions]", error);
    return NextResponse.json({ error: "申請一覧の取得に失敗しました", items: [] }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdminUser();
  if (admin instanceof NextResponse) return admin;

  try {
    const body = (await request.json()) as {
      kind: "job" | "revision";
      id: string;
      action: "approve" | "reject";
    };

    if (!body.id || !body.action || !body.kind) {
      return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
    }

    if (body.kind === "job") {
      const status = body.action === "approve" ? "Active" : "Cancelled";
      const job = await updateJobApproval(body.id, status);
      if (!job) {
        return NextResponse.json({ error: API_ERRORS.jobNotFound }, { status: 404 });
      }
      return NextResponse.json({ success: true, job });
    }

    if (body.action === "approve") {
      const job = await approveJobSubmission(body.id);
      if (!job) {
        return NextResponse.json({ error: API_ERRORS.jobNotFound }, { status: 404 });
      }
      return NextResponse.json({ success: true, job });
    }

    const submission = await rejectJobSubmission(body.id);
    if (!submission) {
      return NextResponse.json({ error: API_ERRORS.jobNotFound }, { status: 404 });
    }
    return NextResponse.json({ success: true, submission });
  } catch {
    return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
  }
}
