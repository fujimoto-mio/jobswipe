import { CompanyStatus as PrismaCompanyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapJobResolved } from "@/lib/db/mappers";
import { resolveStorageReadUrl } from "@/lib/storage/resolve-media";
import { formatDateISOJST } from "@/lib/datetime";
import { COMPANY_STATUSES, type CompanyStatus } from "@/lib/constants";

export type AdminCompanyRow = {
  id: string;
  name: string;
  logoUrl: string | null;
  jobCount: number;
  accountCount: number;
  status: CompanyStatus;
  createdAt: string;
};

export type AdminCompaniesQuery = {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: CompanyStatus;
};

function parseCompanyStatus(value: string | undefined): CompanyStatus | undefined {
  if (value && COMPANY_STATUSES.includes(value as CompanyStatus)) {
    return value as CompanyStatus;
  }
  return undefined;
}

function toPrismaCompanyStatus(status: CompanyStatus): PrismaCompanyStatus {
  return status as PrismaCompanyStatus;
}

export async function queryAdminCompanies(query: AdminCompaniesQuery) {
  const { page, limit, search, sort = "name", order = "asc", status } = query;
  const q = search?.trim();
  const statusFilter = parseCompanyStatus(status);

  const where = {
    ...(statusFilter ? { status: toPrismaCompanyStatus(statusFilter) } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

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
        status: true,
        createdAt: true,
        _count: { select: { jobs: true, accounts: true } },
      },
    }),
  ]);

  const items: AdminCompanyRow[] = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      name: row.name,
      logoUrl: (await resolveStorageReadUrl(row.logoUrl)) ?? row.logoUrl,
      jobCount: row._count.jobs,
      accountCount: row._count.accounts,
      status: row.status as CompanyStatus,
      createdAt: formatDateISOJST(row.createdAt),
    }))
  );

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
  status: CompanyStatus;
  createdAt: string;
  jobCount: number;
  accountCount: number;
  applicationCount: number;
  accounts: { id: string; name: string | null; email: string }[];
  recentJobs: Awaited<ReturnType<typeof mapJobResolved>>[];
};

export async function setCompanyStatus(companyId: string, status: CompanyStatus) {
  return prisma.company.update({
    where: { id: companyId },
    data: { status: toPrismaCompanyStatus(status) },
  });
}

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
    logoUrl: (await resolveStorageReadUrl(company.logoUrl)) ?? company.logoUrl,
    bannerUrl: (await resolveStorageReadUrl(company.bannerUrl)) ?? company.bannerUrl,
    description: company.description,
    website: company.website,
    postalCode: company.postalCode,
    address: company.address,
    links: company.links,
    status: company.status as CompanyStatus,
    createdAt: formatDateISOJST(company.createdAt),
    jobCount: company._count.jobs,
    accountCount: company._count.accounts,
    applicationCount,
    accounts: company.accounts,
    recentJobs: await Promise.all(company.jobs.map(mapJobResolved)),
  };
}
