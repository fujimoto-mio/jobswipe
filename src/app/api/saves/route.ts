import { NextResponse } from "next/server";
import { requireSeekerSession } from "@/lib/auth/seeker";
import {
  toggleSave,
  getSavedJobs,
  getSavedCount,
  removeSave,
  getSavedJobIds,
} from "@/lib/db";

export async function GET() {
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  const jobs = await getSavedJobs(session.seekerId);
  const savedIds = await getSavedJobIds(session.seekerId);
  const count = await getSavedCount(session.seekerId);
  return NextResponse.json({ jobs, savedIds, count });
}

export async function POST(request: Request) {
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  try {
    const { jobId } = (await request.json()) as { jobId: string };
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const saved = await toggleSave(session.seekerId, jobId);
    const savedIds = await getSavedJobIds(session.seekerId);
    const count = await getSavedCount(session.seekerId);

    return NextResponse.json({ success: true, saved, savedIds, count });
  } catch (error) {
    if (error instanceof Error && error.message === "JOB_NOT_AVAILABLE") {
      return NextResponse.json({ error: "この求人は保存できません" }, { status: 404 });
    }
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  try {
    const { jobId } = (await request.json()) as { jobId: string };
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    await removeSave(session.seekerId, jobId);
    const savedIds = await getSavedJobIds(session.seekerId);
    const count = await getSavedCount(session.seekerId);

    return NextResponse.json({ success: true, savedIds, count });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
