import { prisma } from "@/lib/prisma";
import { JobApprovalStatus as PrismaJobApprovalStatus } from "@prisma/client";
import { mapJob } from "@/lib/db/mappers";
import type { Job, JobApprovalStatus } from "@/lib/types";

const jobInclude = { company: true } as const;

export type StaffJobsQuery = {
  companyId?: string | null;
  page: number;
  limit: number;
  search?: string;
  approvalStatus?: JobApprovalStatus;
  sort?: string;
  order?: "asc" | "desc";
};

export type PaginatedJobsResult = {
  items: Job[];
  total: number;
  page: number;
  pageSize: number;
};

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

function jobOrderBy(sort?: string, order: "asc" | "desc" = "desc") {
  switch (sort) {
    case "title":
    case "job":
      return { title: order };
    case "company":
      return { company: { name: order } };
    case "location":
      return { location: order };
    case "salary":
      return { salaryDisplay: order };
    case "status":
      return { approvalStatus: order };
    case "postedAt":
    case "posted":
      return { postedAt: order };
    case "approvedAt":
    case "approved":
      return { approvedAt: order };
    case "views":
      return { viewCount: order };
    default:
      return { postedAt: "desc" as const };
  }
}

export async function queryStaffJobs(query: StaffJobsQuery): Promise<PaginatedJobsResult> {
  const page = Math.max(1, query.page);
  const pageSize = Math.min(100, Math.max(1, query.limit));
  const skip = (page - 1) * pageSize;
  const order = query.order === "asc" ? "asc" : "desc";

  const where = {
    ...(query.companyId ? { companyId: query.companyId } : {}),
    ...(query.approvalStatus ? { approvalStatus: query.approvalStatus as PrismaJobApprovalStatus } : {}),
    ...jobSearchFilter(query.search),
  };

  const [total, rows] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      include: jobInclude,
      orderBy: jobOrderBy(query.sort, order),
      skip,
      take: pageSize,
    }),
  ]);

  return {
    items: rows.map(mapJob),
    total,
    page,
    pageSize,
  };
}
