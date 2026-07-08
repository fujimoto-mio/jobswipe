import { prisma } from "@/lib/prisma";
import { JobApprovalStatus as PrismaJobApprovalStatus } from "@prisma/client";
import { mapJobResolved } from "@/lib/db/mappers";
import { now } from "@/lib/datetime";
import type { Job } from "@/lib/types";

const jobInclude = { company: true } as const;

/**
 * A company requests cancellation of one of its published (Active) jobs.
 * The job stays Active until an admin approves the request.
 */
export async function requestJobCancellation(
  jobId: string,
  companyId?: string | null
): Promise<Job | null> {
  try {
    const existing = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existing) return null;
    if (companyId && existing.companyId !== companyId) return null;
    if (existing.approvalStatus !== PrismaJobApprovalStatus.Active) return null;

    const row = await prisma.job.update({
      where: { id: jobId },
      data: { cancelRequestedAt: now() },
      include: jobInclude,
    });
    return mapJobResolved(row);
  } catch {
    return null;
  }
}

/**
 * Admin resolves a pending cancellation request.
 * approve -> the job is finally cancelled (Closed) and hidden from seekers.
 * reject  -> the request is cleared and the job remains Active.
 */
export async function resolveJobCancellation(
  jobId: string,
  approve: boolean
): Promise<Job | null> {
  try {
    const existing = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existing || !existing.cancelRequestedAt) return null;

    const row = await prisma.job.update({
      where: { id: jobId },
      data: approve
        ? { approvalStatus: PrismaJobApprovalStatus.Closed, cancelRequestedAt: null }
        : { cancelRequestedAt: null },
      include: jobInclude,
    });
    return mapJobResolved(row);
  } catch {
    return null;
  }
}

/**
 * Admin directly cancels a published (Active) job without a company request.
 */
export async function cancelJobDirectly(jobId: string): Promise<Job | null> {
  try {
    const existing = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existing) return null;
    if (existing.approvalStatus !== PrismaJobApprovalStatus.Active) return null;

    const row = await prisma.job.update({
      where: { id: jobId },
      data: { approvalStatus: PrismaJobApprovalStatus.Closed, cancelRequestedAt: null },
      include: jobInclude,
    });
    return mapJobResolved(row);
  } catch {
    return null;
  }
}
