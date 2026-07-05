import { NextResponse } from "next/server";
import { incrementJobViews } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { jobIds?: unknown };
    const jobIds = Array.isArray(body.jobIds)
      ? body.jobIds.filter((id): id is string => typeof id === "string" && id.length > 0)
      : [];

    if (!jobIds.length) {
      return NextResponse.json({ success: true });
    }

    await incrementJobViews(jobIds.slice(0, 20));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
