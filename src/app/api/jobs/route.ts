import { NextResponse } from "next/server";
import { getAllJobs, createJob, getJobsForStaff } from "@/lib/db";
import { requireStaffUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import type { CreateJobInput, JobFilters } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const areas = searchParams.get("areas")?.split(",").filter(Boolean) ?? [];
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) ?? [];
  const includeUnapproved = searchParams.get("includeUnapproved") === "true";

  const filters: JobFilters | undefined =
    areas.length || categories.length ? { areas, categories } : undefined;

  if (includeUnapproved) {
    const staff = await requireStaffUser();
    if (staff instanceof NextResponse) return staff;

    let jobs = await getJobsForStaff(
      staff.role === "company" ? staff.companyId : null,
      true
    );

    if (filters?.areas.length) {
      jobs = jobs.filter((j) => filters.areas.includes(j.area));
    }
    if (filters?.categories.length) {
      jobs = jobs.filter((j) => filters.categories.includes(j.category));
    }

    return NextResponse.json({ jobs, total: jobs.length });
  }

  const jobs = await getAllJobs(filters, false);
  return NextResponse.json(
    { jobs, total: jobs.length },
    {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    }
  );
}

export async function POST(request: Request) {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  try {
    const body = (await request.json()) as CreateJobInput;

    if (!body.title || !body.videoUrl || !body.description) {
      return NextResponse.json(
        { error: "必須項目: title, videoUrl, description" },
        { status: 400 }
      );
    }

    if (staff.role === "company" && staff.companyId) {
      const company = await prisma.company.findUnique({ where: { id: staff.companyId } });
      if (company) body.company = company.name;
    }

    if (!body.company) {
      return NextResponse.json({ error: "company is required" }, { status: 400 });
    }

    const job = await createJob(body);
    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
