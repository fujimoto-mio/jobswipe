import { NextResponse } from "next/server";
import { requireSeekerSession } from "@/lib/auth/seeker";
import {
  toggleSave,
  getSavedJobs,
  getSavedCount,
  removeSave,
  getSavedJobIds,
} from "@/lib/db";
import { querySavedJobs } from "@/lib/db/saved-jobs";

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
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  const isSummary = searchParams.get("summary") === "1";
  const isPaginated =
    searchParams.has("page") ||
    searchParams.has("limit") ||
    searchParams.has("search") ||
    searchParams.has("sort");

  if (isSummary) {
    const [savedIds, count] = await Promise.all([
      getSavedJobIds(session.seekerId),
      getSavedCount(session.seekerId),
    ]);
    return NextResponse.json(
      { savedIds, count },
      { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } }
    );
  }

  if (isPaginated) {
    const page = parsePage(searchParams.get("page"));
    const limit = parseLimit(searchParams.get("limit"));
    const search = searchParams.get("search") ?? undefined;
    const sort = searchParams.get("sort") ?? undefined;
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const result = await querySavedJobs({
      seekerId: session.seekerId,
      page,
      limit,
      search,
      sort,
      order,
    });

    return NextResponse.json(result);
  }

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
