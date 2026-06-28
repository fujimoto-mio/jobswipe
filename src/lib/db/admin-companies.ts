import { prisma } from "@/lib/prisma";
import { mapJob } from "@/lib/db/mappers";
import { formatDateISOJST } from "@/lib/datetime";

export type AdminCompanyRow = {
  id: string;
  name: string;
  logoUrl: string | null;
  jobCount: number;
  accountCount: number;
  createdAt: string;
};

export type AdminCompaniesQuery = {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
};

export async function queryAdminCompanies(query: AdminCompaniesQuery) {
  const { page, limit, search, sort = "name", order = "asc" } = query;
  const q = search?.trim();

  const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {};

  const orderBy =
    sort === "jobs"
      ? { jobs: { _count: order } }
      : sort === "accounts"
        ? { accounts: { _count: order } }
        : sort === "createdAt"
          ? { createdAt: order }
          : { name: order };

  const [total, rows] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        logoUrl: true,
        createdAt: true,
        _count: { select: { jobs: true, accounts: true } },
      },
    }),
  ]);

  const items: AdminCompanyRow[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    logoUrl: row.logoUrl,
    jobCount: row._count.jobs,
    accountCount: row._count.accounts,
    createdAt: formatDateISOJST(row.createdAt),
  }));

  return { items, total };
}

export type AdminCompanyDetail = {
  id: string;
  name: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  website: string | null;
  postalCode: string | null;
  address: string | null;
  links: unknown;
  createdAt: string;
  jobCount: number;
  accountCount: number;
  applicationCount: number;
  accounts: { id: string; name: string | null; email: string }[];
  recentJobs: ReturnType<typeof mapJob>[];
};

export async function getAdminCompanyDetail(companyId: string): Promise<AdminCompanyDetail | null> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      accounts: {
        select: { id: true, name: true, email: true },
        orderBy: { createdAt: "asc" },
      },
      jobs: {
        orderBy: { postedAt: "desc" },
        take: 8,
        include: { company: true },
      },
      _count: { select: { jobs: true, accounts: true } },
    },
  });

  if (!company) return null;

  const applicationCount = await prisma.application.count({
    where: { job: { companyId } },
  });

  return {
    id: company.id,
    name: company.name,
    logoUrl: company.logoUrl,
    bannerUrl: company.bannerUrl,
    description: company.description,
    website: company.website,
    postalCode: company.postalCode,
    address: company.address,
    links: company.links,
    createdAt: formatDateISOJST(company.createdAt),
    jobCount: company._count.jobs,
    accountCount: company._count.accounts,
    applicationCount,
    accounts: company.accounts,
    recentJobs: company.jobs.map(mapJob),
  };
}
