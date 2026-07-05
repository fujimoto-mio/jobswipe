import { prisma } from "@/lib/prisma";
import { API_ERRORS } from "@/lib/api-errors";
import { getCompanyLogoUrl } from "@/lib/job-image";

export type CompanyOption = {
  id: string;
  name: string;
  jobCount: number;
  accountCount: number;
};

export async function listCompanies(): Promise<CompanyOption[]> {
  const rows = await prisma.company.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      _count: { select: { jobs: true, accounts: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    jobCount: row._count.jobs,
    accountCount: row._count.accounts,
  }));
}

export async function resolveCompanyIdForJob(input: {
  companyId?: string | null;
  companyName?: string | null;
  staffCompanyId?: string | null;
}): Promise<string> {
  if (input.staffCompanyId) {
    const company = await prisma.company.findUnique({ where: { id: input.staffCompanyId } });
    if (!company) {
      throw new Error(API_ERRORS.linkedCompanyNotFound);
    }
    return company.id;
  }

  if (input.companyId) {
    const company = await prisma.company.findUnique({ where: { id: input.companyId } });
    if (!company) {
      throw new Error(API_ERRORS.companyNotFound);
    }
    return company.id;
  }

  const name = input.companyName?.trim();
  if (!name) {
    throw new Error(API_ERRORS.companyRequired);
  }

  const company = await prisma.company.upsert({
    where: { name },
    create: { name, logoUrl: getCompanyLogoUrl(name) },
    update: {},
  });

  return company.id;
}
