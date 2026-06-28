import { prisma } from "@/lib/prisma";
import { mapApplication, mapJob, mapSeekerProfile } from "@/lib/db/mappers";
import { fetchSavedApplyMessages, resolveApplicationMessage } from "@/lib/db/saved-job-message";
import type {
  ApplicationStatus,
  ApplicationWithSeeker,
  Job,
  JobApprovalStatus,
} from "@/lib/types";

const jobInclude = { company: true } as const;

export type StaffApplicationsQuery = {
  companyId?: string | null;
  view: "applications" | "jobs";
  page: number;
  limit: number;
  search?: string;
  status?: ApplicationStatus;
  approvalStatus?: JobApprovalStatus;
  sort?: string;
  order?: "asc" | "desc";
  jobId?: string;
};

export type JobApplicationGroupRow = {
  jobId: string;
  job: Job;
  applicantCount: number;
};

export type StaffApplicationRow = ApplicationWithSeeker & {
  job?: Job;
};

export type PaginatedStaffResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  summary?: { totalApplications: number };
};

function applicationSearchFilter(search?: string) {
  const q = search?.trim();
  if (!q) return {};
  return {
    OR: [
      { applicantName: { contains: q, mode: "insensitive" as const } },
      { applicantEmail: { contains: q, mode: "insensitive" as const } },
      { job: { title: { contains: q, mode: "insensitive" as const } } },
      { job: { company: { name: { contains: q, mode: "insensitive" as const } } } },
      { job: { category: { contains: q, mode: "insensitive" as const } } },
      { job: { area: { contains: q, mode: "insensitive" as const } } },
    ],
  };
}

function jobSearchFilter(search?: string) {
  const q = search?.trim();
  if (!q) return {};
  return {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { category: { contains: q, mode: "insensitive" as const } },
      { area: { contains: q, mode: "insensitive" as const } },
      { location: { contains: q, mode: "insensitive" as const } },
      { company: { name: { contains: q, mode: "insensitive" as const } } },
      { employmentType: { contains: q, mode: "insensitive" as const } },
      { salaryDisplay: { contains: q, mode: "insensitive" as const } },
    ],
  };
}

function applicationOrderBy(sort?: string, order: "asc" | "desc" = "desc") {
  switch (sort) {
    case "name":
      return { applicantName: order };
    case "status":
      return { status: order };
    case "date":
    default:
      return { createdAt: order };
  }
}

function jobOrderBy(sort?: string, order: "asc" | "desc" = "desc") {
  switch (sort) {
    case "count":
      return { applications: { _count: order } };
    case "job":
    case "title":
      return { title: order };
    case "jobStatus":
      return { approvalStatus: order };
    case "postedAt":
    case "posted":
      return { postedAt: order };
    case "approvedAt":
    case "approved":
      return { approvedAt: order };
    default:
      return { applications: { _count: "desc" as const } };
  }
}

export async function getApplicationsForJob(
  jobId: string,
  companyId?: string | null
): Promise<ApplicationWithSeeker[]> {
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      ...(companyId ? { companyId } : {}),
    },
  });
  if (!job) return [];

  const rows = await prisma.application.findMany({
    where: { jobId },
    include: { seeker: true },
    orderBy: { createdAt: "desc" },
  });

  const savedMessages = await fetchSavedApplyMessages(
    rows.map((row) => ({ seekerId: row.seekerId, jobId: row.jobId }))
  );

  return rows.map((row) => ({
    ...mapApplication(row),
    message: resolveApplicationMessage(row.seekerId, row.jobId, row.message, savedMessages),
    seeker: row.seeker ? mapSeekerProfile(row.seeker) : undefined,
  }));
}

export async function queryStaffApplications(
  query: StaffApplicationsQuery
): Promise<PaginatedStaffResult<StaffApplicationRow>> {
  const page = Math.max(1, query.page);
  const pageSize = Math.min(100, Math.max(1, query.limit));
  const skip = (page - 1) * pageSize;
  const order = query.order === "asc" ? "asc" : "desc";

  const baseWhere = {
    ...(query.companyId ? { job: { companyId: query.companyId } } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...applicationSearchFilter(query.search),
  };

  const [total, rows] = await Promise.all([
    prisma.application.count({ where: baseWhere }),
    prisma.application.findMany({
      where: baseWhere,
      include: { seeker: true, job: { include: jobInclude } },
      orderBy: applicationOrderBy(query.sort, order),
      skip,
      take: pageSize,
    }),
  ]);

  const savedMessages = await fetchSavedApplyMessages(
    rows.map((row) => ({ seekerId: row.seekerId, jobId: row.jobId }))
  );

  return {
    items: rows.map((row) => ({
      ...mapApplication(row, { title: row.job.title, company: row.job.company }),
      message: resolveApplicationMessage(row.seekerId, row.jobId, row.message, savedMessages),
      seeker: row.seeker ? mapSeekerProfile(row.seeker) : undefined,
      job: mapJob(row.job),
    })),
    total,
    page,
    pageSize,
  };
}

export async function queryStaffApplicationJobs(
  query: StaffApplicationsQuery
): Promise<PaginatedStaffResult<JobApplicationGroupRow>> {
  const page = Math.max(1, query.page);
  const pageSize = Math.min(100, Math.max(1, query.limit));
  const skip = (page - 1) * pageSize;
  const order = query.order === "asc" ? "asc" : "desc";

  const jobWhere = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.approvalStatus ? { approvalStatus: query.approvalStatus } : {}),
    ...jobSearchFilter(query.search),
  };

  const applicationSummaryWhere = {
    job: {
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.approvalStatus ? { approvalStatus: query.approvalStatus } : {}),
      ...jobSearchFilter(query.search),
    },
  };

  const [total, rows, totalApplications] = await Promise.all([
    prisma.job.count({ where: jobWhere }),
    prisma.job.findMany({
      where: jobWhere,
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
      orderBy: jobOrderBy(query.sort, order),
      skip,
      take: pageSize,
    }),
    prisma.application.count({ where: applicationSummaryWhere }),
  ]);

  return {
    items: rows.map((row) => ({
      jobId: row.id,
      job: mapJob(row),
      applicantCount: row._count.applications,
    })),
    total,
    page,
    pageSize,
    summary: { totalApplications },
  };
}
