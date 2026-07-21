import { prisma } from "@/lib/prisma";
import { JobApprovalStatus as PrismaJobApprovalStatus } from "@prisma/client";
import { mapApplication, mapJobResolved, mapSeekerProfileResolved } from "@/lib/db/mappers";
import { fetchSavedApplyMessages, resolveApplicationMessage } from "@/lib/db/saved-job-message";
import { employmentTypeValuesMatching } from "@/lib/db/employment-type";
import type {
  ApplicationStatus,
  ApplicationWithSeeker,
  Job,
  JobApprovalStatus,
} from "@/lib/types";

const jobInclude = { company: true } as const;

async function unreadByApplicationForCompany(companyId: string): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<{ application_id: string; count: bigint }[]>`
    SELECT cm.application_id, COUNT(*) AS count
    FROM chat_messages cm
    INNER JOIN applications a ON a.id = cm.application_id
    INNER JOIN jobs j ON j.id = a.job_id
    WHERE j.company_id = ${companyId}
      AND cm.sender = 'seeker'
      AND (a.company_read_at IS NULL OR cm.created_at > a.company_read_at)
    GROUP BY cm.application_id
  `;
  const map = new Map<string, number>();
  for (const row of rows) map.set(row.application_id, Number(row.count));
  return map;
}

async function unreadByJobForCompany(companyId: string): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<{ job_id: string; count: bigint }[]>`
    SELECT a.job_id, COUNT(*) AS count
    FROM chat_messages cm
    INNER JOIN applications a ON a.id = cm.application_id
    INNER JOIN jobs j ON j.id = a.job_id
    WHERE j.company_id = ${companyId}
      AND cm.sender = 'seeker'
      AND (a.company_read_at IS NULL OR cm.created_at > a.company_read_at)
    GROUP BY a.job_id
  `;
  const map = new Map<string, number>();
  for (const row of rows) map.set(row.job_id, Number(row.count));
  return map;
}

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
  unreadCount?: number;
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
  // employmentType is an enum column, so it is matched on its labels instead of `contains`.
  const employmentTypes = employmentTypeValuesMatching(q);
  return {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { category: { contains: q, mode: "insensitive" as const } },
      { area: { contains: q, mode: "insensitive" as const } },
      { location: { contains: q, mode: "insensitive" as const } },
      { company: { name: { contains: q, mode: "insensitive" as const } } },
      ...(employmentTypes.length ? [{ employmentType: { in: employmentTypes } }] : []),
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

  const unreadMap = companyId
    ? await unreadByApplicationForCompany(companyId)
    : new Map<string, number>();

  return Promise.all(
    rows.map(async (row) => ({
      ...mapApplication(row),
      message: resolveApplicationMessage(row.seekerId, row.jobId, row.message, savedMessages),
      seeker: row.seeker ? await mapSeekerProfileResolved(row.seeker) : undefined,
      unreadCount: unreadMap.get(row.id) ?? 0,
    }))
  );
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
    items: await Promise.all(
      rows.map(async (row) => ({
        ...mapApplication(row, { title: row.job.title, company: row.job.company }),
        message: resolveApplicationMessage(row.seekerId, row.jobId, row.message, savedMessages),
        seeker: row.seeker ? await mapSeekerProfileResolved(row.seeker) : undefined,
        job: await mapJobResolved(row.job),
      }))
    ),
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
    ...(query.approvalStatus ? { approvalStatus: query.approvalStatus as PrismaJobApprovalStatus } : {}),
    ...jobSearchFilter(query.search),
  };

  const applicationSummaryWhere = {
    job: {
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.approvalStatus ? { approvalStatus: query.approvalStatus as PrismaJobApprovalStatus } : {}),
      ...jobSearchFilter(query.search),
    },
  };

  const [total, rows, totalApplications, unreadByJob] = await Promise.all([
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
    query.companyId
      ? unreadByJobForCompany(query.companyId)
      : Promise.resolve(new Map<string, number>()),
  ]);

  return {
    items: await Promise.all(
      rows.map(async (row) => ({
        jobId: row.id,
        job: await mapJobResolved(row),
        applicantCount: row._count.applications,
        unreadCount: unreadByJob.get(row.id) ?? 0,
      }))
    ),
    total,
    page,
    pageSize,
    summary: { totalApplications },
  };
}
