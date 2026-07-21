import { NextResponse } from "next/server";
import { createJob, getJobsForStaff, getFeedJobs } from "@/lib/db";
import { requireStaffUser } from "@/lib/auth/admin";
import type { CreateJobInput, JobFilters } from "@/lib/types";
import { API_ERRORS } from "@/lib/api-errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const areas = searchParams.get("areas")?.split(",").filter(Boolean) ?? [];
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) ?? [];
  const employmentTypes = searchParams.get("employmentTypes")?.split(",").filter(Boolean) ?? [];
  const includeUnapproved = searchParams.get("includeUnapproved") === "true";

  const filters: JobFilters | undefined =
    areas.length || categories.length || employmentTypes.length
      ? { areas, categories, employmentTypes }
      : undefined;

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
    if (filters?.employmentTypes.length) {
      jobs = jobs.filter((j) => filters.employmentTypes.includes(j.employmentType));
    }

    return NextResponse.json({ jobs, total: jobs.length });
  }

  const jobs = await getFeedJobs(filters);
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

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "必須項目: title, description" },
        { status: 400 }
      );
    }

    if (staff.role === "company") {
      if (!staff.companyId) {
        return NextResponse.json({ error: "企業アカウントが会社に紐づいていません" }, { status: 403 });
      }
    } else if (!body.companyId && !body.company?.trim()) {
      return NextResponse.json({ error: API_ERRORS.companyIdOrCompanyRequired }, { status: 400 });
    }

    const job = await createJob(body, {
      staffCompanyId: staff.role === "company" ? staff.companyId : null,
    });
    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : API_ERRORS.invalidJson;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
