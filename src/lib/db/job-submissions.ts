import { prisma } from "@/lib/prisma";
import {
  JobApprovalStatus as PrismaJobApprovalStatus,
  JobSubmissionStatus as PrismaJobSubmissionStatus,
  Prisma,
} from "@prisma/client";
import { mapJobResolved } from "@/lib/db/mappers";
import { now } from "@/lib/datetime";
import { resolveCompanyIdForJob } from "@/lib/db/companies";
import type { CreateJobInput, Job, JobSubmissionContent, JobSubmissionStatus, UpdateJobInput } from "@/lib/types";

const jobInclude = { company: true } as const;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

export function mapSubmissionRow(
  row: {
    id: string;
    jobId: string;
    status: PrismaJobSubmissionStatus;
    submittedAt: Date;
    reviewedAt: Date | null;
    title: string;
    location: string;
    area: string;
    category: string;
    salaryDisplay: string;
    employmentType: string;
    description: string;
    requirements: unknown;
    benefits: unknown;
    tags: unknown;
    videoUrl: string;
    thumbnailUrl: string | null;
    links: unknown;
  }
): JobSubmissionContent {
  return {
    id: row.id,
    jobId: row.jobId,
    status: row.status as JobSubmissionStatus,
    submittedAt: row.submittedAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    title: row.title,
    location: row.location,
    area: row.area,
    category: row.category,
    salary: row.salaryDisplay,
    employmentType: row.employmentType,
    tags: asStringArray(row.tags),
    description: row.description,
    requirements: asStringArray(row.requirements),
    benefits: asStringArray(row.benefits),
    videoUrl: row.videoUrl,
    thumbnailUrl: row.thumbnailUrl ?? "",
    links: (row.links as Job["links"]) ?? {},
  };
}

function submissionDataFromInput(input: CreateJobInput | UpdateJobInput) {
  return {
    title: input.title ?? "",
    location: input.location ?? "",
    area: input.area ?? "東京都",
    category: input.category ?? "エンジニア",
    salaryDisplay: input.salary ?? "",
    employmentType: input.employmentType ?? "正社員",
    description: input.description ?? "",
    requirements: input.requirements ?? [],
    benefits: input.benefits ?? [],
    tags: input.tags ?? [],
    videoUrl: input.videoUrl ?? "",
    thumbnailUrl: input.thumbnailUrl ?? null,
    links: input.links ?? {},
  };
}

export async function getPendingSubmissionForJob(jobId: string): Promise<JobSubmissionContent | null> {
  const row = await prisma.jobSubmission.findFirst({
    where: { jobId, status: PrismaJobSubmissionStatus.Pending },
    orderBy: { submittedAt: "desc" },
  });
  return row ? mapSubmissionRow(row) : null;
}

export async function upsertPendingJobSubmission(
  jobId: string,
  input: CreateJobInput | UpdateJobInput
): Promise<JobSubmissionContent> {
  const data = submissionDataFromInput(input);
  const existing = await prisma.jobSubmission.findFirst({
    where: { jobId, status: PrismaJobSubmissionStatus.Pending },
  });

  const row = existing
    ? await prisma.jobSubmission.update({
        where: { id: existing.id },
        data: {
          ...data,
          submittedAt: now(),
          reviewedAt: null,
        },
      })
    : await prisma.jobSubmission.create({
        data: {
          jobId,
          ...data,
          status: PrismaJobSubmissionStatus.Pending,
        },
      });

  return mapSubmissionRow(row);
}

export async function approveJobSubmission(submissionId: string): Promise<Job | null> {
  const submission = await prisma.jobSubmission.findUnique({
    where: { id: submissionId },
    include: { job: { include: jobInclude } },
  });

  if (!submission || submission.status !== PrismaJobSubmissionStatus.Pending) {
    return null;
  }

  const reviewedAt = now();

  const [updatedJob] = await prisma.$transaction([
    prisma.job.update({
      where: { id: submission.jobId },
      data: {
        title: submission.title,
        location: submission.location,
        area: submission.area,
        category: submission.category,
        salaryDisplay: submission.salaryDisplay,
        employmentType: submission.employmentType,
        description: submission.description,
        requirements: submission.requirements as Prisma.InputJsonValue,
        benefits: submission.benefits as Prisma.InputJsonValue,
        tags: submission.tags as Prisma.InputJsonValue,
        videoUrl: submission.videoUrl,
        thumbnailUrl: submission.thumbnailUrl,
        links: submission.links as Prisma.InputJsonValue,
        approvalStatus: PrismaJobApprovalStatus.Active,
        approvedAt: reviewedAt,
      },
      include: jobInclude,
    }),
    prisma.jobSubmission.update({
      where: { id: submissionId },
      data: {
        status: PrismaJobSubmissionStatus.Approved,
        reviewedAt,
      },
    }),
  ]);

  return mapJobResolved(updatedJob);
}

export async function rejectJobSubmission(submissionId: string): Promise<JobSubmissionContent | null> {
  try {
    const row = await prisma.jobSubmission.update({
      where: { id: submissionId, status: PrismaJobSubmissionStatus.Pending },
      data: {
        status: PrismaJobSubmissionStatus.Rejected,
        reviewedAt: now(),
      },
    });
    return mapSubmissionRow(row);
  } catch {
    return null;
  }
}

export async function createJobWithStatus(
  input: CreateJobInput,
  options: { staffCompanyId?: string | null; submit?: boolean }
): Promise<Job> {
  const companyId = await resolveCompanyIdForJob({
    companyId: input.companyId,
    companyName: input.company,
    staffCompanyId: options.staffCompanyId,
  });

  const approvalStatus = options.submit
    ? PrismaJobApprovalStatus.Pending
    : PrismaJobApprovalStatus.Draft;

  const row = await prisma.job.create({
    data: {
      companyId,
      title: input.title,
      location: input.location,
      area: input.area ?? "東京都",
      category: input.category ?? "エンジニア",
      salaryDisplay: input.salary,
      employmentType: input.employmentType,
      description: input.description,
      requirements: input.requirements ?? [],
      benefits: input.benefits ?? [],
      tags: input.tags ?? [],
      videoUrl: input.videoUrl ?? "",
      thumbnailUrl: input.thumbnailUrl,
      links: input.links ?? {},
      approvalStatus,
    },
    include: jobInclude,
  });

  return mapJobResolved(row);
}

export async function submitJobForReview(id: string): Promise<Job | null> {
  try {
    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) return null;
    if (
      existing.approvalStatus !== PrismaJobApprovalStatus.Draft &&
      existing.approvalStatus !== PrismaJobApprovalStatus.Cancelled
    ) {
      return null;
    }

    const row = await prisma.job.update({
      where: { id },
      data: { approvalStatus: PrismaJobApprovalStatus.Pending },
      include: jobInclude,
    });
    return mapJobResolved(row);
  } catch {
    return null;
  }
}

export type AdminReviewItem = {
  kind: "job" | "revision";
  job: Job;
  submission?: JobSubmissionContent;
  submittedAt: string;
};

export async function listAdminReviewItems(): Promise<AdminReviewItem[]> {
  const [pendingJobs, pendingSubmissions] = await Promise.all([
    prisma.job.findMany({
      where: { approvalStatus: PrismaJobApprovalStatus.Pending },
      include: jobInclude,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.jobSubmission.findMany({
      where: { status: PrismaJobSubmissionStatus.Pending },
      include: { job: { include: jobInclude } },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const items: AdminReviewItem[] = [
    ...(await Promise.all(
      pendingJobs.map(async (row) => ({
        kind: "job" as const,
        job: await mapJobResolved(row),
        submittedAt: row.updatedAt.toISOString(),
      }))
    )),
    ...(await Promise.all(
      pendingSubmissions.map(async (submission) => ({
        kind: "revision" as const,
        job: await mapJobResolved(submission.job),
        submission: mapSubmissionRow(submission),
        submittedAt: submission.submittedAt.toISOString(),
      }))
    )),
  ];

  items.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return items;
}

export function submissionToPreviewJob(baseJob: Job, submission: JobSubmissionContent): Job {
  return {
    ...baseJob,
    title: submission.title,
    location: submission.location,
    area: submission.area,
    category: submission.category,
    salary: submission.salary,
    employmentType: submission.employmentType as Job["employmentType"],
    tags: submission.tags,
    description: submission.description,
    requirements: submission.requirements,
    benefits: submission.benefits,
    videoUrl: submission.videoUrl,
    thumbnailUrl: submission.thumbnailUrl,
    links: submission.links,
  };
}
