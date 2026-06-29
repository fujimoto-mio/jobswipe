import { SeekerStatus as PrismaSeekerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapSeekerProfile } from "@/lib/db/mappers";
import { formatDateISOJST } from "@/lib/datetime";
import { SEEKER_STATUSES, type SeekerStatus } from "@/lib/constants";

export type AdminSeekerRow = {
  id: string;
  name: string;
  email: string;
  area: string;
  desiredJobType: string;
  applicationCount: number;
  status: SeekerStatus;
  createdAt: string;
};

export type AdminSeekersQuery = {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: SeekerStatus;
};

function parseSeekerStatus(value: string | undefined): SeekerStatus | undefined {
  if (value && SEEKER_STATUSES.includes(value as SeekerStatus)) {
    return value as SeekerStatus;
  }
  return undefined;
}

function toPrismaSeekerStatus(status: SeekerStatus): PrismaSeekerStatus {
  return status as PrismaSeekerStatus;
}

export async function queryAdminSeekers(query: AdminSeekersQuery) {
  const { page, limit, search, sort = "createdAt", order = "desc", status } = query;
  const q = search?.trim();
  const statusFilter = parseSeekerStatus(status);

  const where = {
    ...(statusFilter ? { status: toPrismaSeekerStatus(statusFilter) } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { area: { contains: q, mode: "insensitive" as const } },
            { desiredJobType: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "name"
      ? { name: order }
      : sort === "email"
        ? { email: order }
        : sort === "applications"
          ? { applications: { _count: order } }
          : { createdAt: order };

  const [total, rows] = await Promise.all([
    prisma.seekerProfile.count({ where }),
    prisma.seekerProfile.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { applications: true } } },
    }),
  ]);

  const items: AdminSeekerRow[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    area: row.area,
    desiredJobType: row.desiredJobType,
    applicationCount: row._count.applications,
    status: row.status as SeekerStatus,
    createdAt: formatDateISOJST(row.createdAt),
  }));

  return { items, total };
}

export async function getAdminSeekerDetail(seekerId: string) {
  const row = await prisma.seekerProfile.findUnique({
    where: { id: seekerId },
    include: {
      _count: { select: { applications: true, savedJobs: true } },
      applications: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { job: { include: { company: true } } },
      },
    },
  });

  if (!row) return null;

  return {
    profile: mapSeekerProfile(row),
    status: row.status as SeekerStatus,
    createdAt: formatDateISOJST(row.createdAt),
    applicationCount: row._count.applications,
    savedCount: row._count.savedJobs,
    recentApplications: row.applications.map((app) => ({
      id: app.id,
      status: app.status,
      createdAt: formatDateISOJST(app.createdAt),
      jobTitle: app.job.title,
      companyName: app.job.company.name,
      jobId: app.jobId,
    })),
  };
}

export async function setSeekerStatus(seekerId: string, status: SeekerStatus) {
  const row = await prisma.seekerProfile.update({
    where: { id: seekerId },
    data: { status: toPrismaSeekerStatus(status) },
  });
  return row;
}
