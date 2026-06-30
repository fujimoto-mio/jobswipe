import { JobApprovalStatus as PrismaJobApprovalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapJobResolved } from "@/lib/db/mappers";
import type { Job } from "@/lib/types";

const savedJobInclude = {
  job: {
    include: { company: true },
  },
} as const;

export type SavedJobsQuery = {
  seekerId: string;
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
};

function buildJobSearchFilter(search?: string) {
  const q = search?.trim();
  if (!q) return {};

  return {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { company: { name: { contains: q, mode: "insensitive" as const } } },
    ],
  };
}

function buildOrderBy(sort: string, order: "asc" | "desc") {
  switch (sort) {
    case "title":
      return { job: { title: order } };
    case "company":
      return { job: { company: { name: order } } };
    case "location":
      return { job: { location: order } };
    case "savedAt":
    default:
      return { createdAt: order };
  }
}

export async function querySavedJobs(query: SavedJobsQuery): Promise<{
  items: Job[];
  total: number;
  count: number;
}> {
  const { seekerId, page, limit, search, sort = "savedAt", order = "desc" } = query;

  const where = {
    seekerId,
    job: {
      approvalStatus: PrismaJobApprovalStatus.Active,
      ...buildJobSearchFilter(search),
    },
  };

  const baseCountWhere = {
    seekerId,
    job: { approvalStatus: PrismaJobApprovalStatus.Active },
  };

  const [total, rows, count] = await Promise.all([
    prisma.savedJob.count({ where }),
    prisma.savedJob.findMany({
      where,
      orderBy: buildOrderBy(sort, order),
      skip: (page - 1) * limit,
      take: limit,
      include: savedJobInclude,
    }),
    prisma.savedJob.count({ where: baseCountWhere }),
  ]);

  return {
    items: await Promise.all(rows.map((row) => mapJobResolved(row.job))),
    total,
    count,
  };
}
