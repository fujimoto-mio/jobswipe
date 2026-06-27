import { prisma } from "@/lib/prisma";
import type { StaffUser } from "@/lib/auth/admin";

export async function staffCanAccessApplication(
  applicationId: string,
  staff: StaffUser
): Promise<boolean> {
  if (staff.role === "admin") return true;

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: { select: { companyId: true } } },
  });
  if (!app || !staff.companyId) return false;
  return app.job.companyId === staff.companyId;
}

export async function seekerCanAccessApplication(
  applicationId: string,
  seekerId: string
): Promise<boolean> {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { seekerId: true },
  });
  return app?.seekerId === seekerId;
}

export async function staffCanAccessJob(jobId: string, staff: StaffUser): Promise<boolean> {
  if (staff.role === "admin") return true;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { companyId: true },
  });
  if (!job || !staff.companyId) return false;
  return job.companyId === staff.companyId;
}
