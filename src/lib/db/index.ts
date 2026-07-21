import { prisma } from "@/lib/prisma";
import { JobApprovalStatus as PrismaJobApprovalStatus, Prisma, SeekerStatus } from "@prisma/client";
import { API_ERRORS } from "@/lib/api-errors";
import {
  mapApplication,
  mapChatMessageResolved,
  mapJobFeedResolved,
  mapJobResolved,
  mapSeekerProfileResolved,
} from "@/lib/db/mappers";
import { fetchSavedApplyMessages, resolveApplicationMessage } from "@/lib/db/saved-job-message";
import { now } from "@/lib/datetime";
import { parseBirthday } from "@/lib/birthday";
import { resolveCompanyIdForJob } from "@/lib/db/companies";
import {
  createJobWithStatus,
  getPendingSubmissionForJob,
  submitJobForReview,
  upsertPendingJobSubmission,
} from "@/lib/db/job-submissions";
import {
  toEmploymentTypeLabel,
  toPrismaEmploymentType,
  toPrismaEmploymentTypes,
} from "@/lib/db/employment-type";
import type {
  Application,
  ApplicationStatus,
  ChatMessage,
  CreateApplicationInput,
  CreateJobInput,
  Job,
  JobFeedItem,
  JobApprovalStatus,
  JobFilters,
  UpdateJobInput,
  UserProfile,
  ApplicationWithSeeker,
} from "@/lib/types";
import { resolveAvatarUrl } from "@/lib/storage/resolve-media";
import { sendMatchNotificationEmail } from "@/lib/email";

const jobInclude = { company: true } as const;

function asJsonStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

export { listCompanies } from "@/lib/db/companies";

export async function getAllJobs(filters?: JobFilters, includeUnapproved = false): Promise<Job[]> {
  const rows = await prisma.job.findMany({
    where: {
      ...(includeUnapproved ? {} : { approvalStatus: PrismaJobApprovalStatus.Active }),
      ...(filters?.areas.length ? { area: { in: filters.areas } } : {}),
      ...(filters?.categories.length ? { category: { in: filters.categories } } : {}),
      ...(filters?.employmentTypes.length
        ? { employmentType: { in: toPrismaEmploymentTypes(filters.employmentTypes) } }
        : {}),
    },
    include: jobInclude,
    orderBy: { postedAt: "desc" },
  });

  return Promise.all(rows.map(mapJobResolved));
}

export async function getFeedJobs(filters?: JobFilters): Promise<JobFeedItem[]> {
  const rows = await prisma.job.findMany({
    where: {
      approvalStatus: PrismaJobApprovalStatus.Active,
      ...(filters?.areas.length ? { area: { in: filters.areas } } : {}),
      ...(filters?.categories.length ? { category: { in: filters.categories } } : {}),
      ...(filters?.employmentTypes.length
        ? { employmentType: { in: toPrismaEmploymentTypes(filters.employmentTypes) } }
        : {}),
    },
    include: jobInclude,
    orderBy: { postedAt: "desc" },
  });

  return Promise.all(rows.map(mapJobFeedResolved));
}

export async function getJobById(id: string): Promise<Job | null> {
  const row = await prisma.job.findUnique({ where: { id }, include: jobInclude });
  return row ? mapJobResolved(row) : null;
}

export async function incrementJobView(id: string): Promise<void> {
  await prisma.job.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

export async function incrementJobViews(ids: string[]): Promise<void> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return;

  await prisma.$transaction(
    uniqueIds.map((id) =>
      prisma.job.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
    )
  );
}

export async function createJob(
  input: CreateJobInput,
  options?: { staffCompanyId?: string | null }
): Promise<Job> {
  return createJobWithStatus(input, {
    staffCompanyId: options?.staffCompanyId,
    submit: input.submit ?? false,
  });
}

export async function updateJobApproval(id: string, status: JobApprovalStatus): Promise<Job | null> {
  try {
    const row = await prisma.job.update({
      where: { id },
      data: {
        approvalStatus: status as PrismaJobApprovalStatus,
        approvedAt: status === "Active" ? now() : null,
        cancelRequestedAt: null,
      },
      include: jobInclude,
    });
    return mapJobResolved(row);
  } catch {
    return null;
  }
}

export async function updateJob(
  id: string,
  input: UpdateJobInput,
  options?: { staffCompanyId?: string | null; allowActiveDirectEdit?: boolean }
): Promise<Job | null> {
  try {
    const existing = await prisma.job.findUnique({ where: { id }, include: jobInclude });
    if (!existing) return null;

    if (options?.staffCompanyId) {
      if (existing.companyId !== options.staffCompanyId) return null;
    }

    const { submit, approvalStatus: requestedApprovalStatus, ...contentInput } = input;

    if (existing.approvalStatus === PrismaJobApprovalStatus.Active) {
      if (requestedApprovalStatus && requestedApprovalStatus !== "Active") {
        return null;
      }
      if (options?.allowActiveDirectEdit) {
        // Admin may edit published jobs directly.
      } else if (submit) {
        await upsertPendingJobSubmission(id, {
          title: contentInput.title ?? existing.title,
          location: contentInput.location ?? existing.location,
          area: contentInput.area ?? existing.area,
          category: contentInput.category ?? existing.category,
          salary: contentInput.salary ?? existing.salaryDisplay,
          employmentType:
            contentInput.employmentType ?? toEmploymentTypeLabel(existing.employmentType),
          description: contentInput.description ?? existing.description,
          videoUrl: contentInput.videoUrl ?? existing.videoUrl,
          thumbnailUrl: contentInput.thumbnailUrl ?? existing.thumbnailUrl ?? undefined,
          tags: contentInput.tags ?? asJsonStringArray(existing.tags),
          requirements: contentInput.requirements ?? asJsonStringArray(existing.requirements),
          benefits: contentInput.benefits ?? asJsonStringArray(existing.benefits),
          links: (contentInput.links ?? existing.links) as CreateJobInput["links"],
        });
        return mapJobResolved(existing);
      } else {
        return null;
      }
    }

    let companyId = existing.companyId;

    if (options?.staffCompanyId) {
      companyId = options.staffCompanyId;
    } else if (contentInput.companyId !== undefined) {
      companyId = await resolveCompanyIdForJob({ companyId: contentInput.companyId });
    } else if (
      contentInput.company !== undefined &&
      contentInput.company.trim() !== existing.company.name
    ) {
      companyId = await resolveCompanyIdForJob({ companyName: contentInput.company });
    }

    const nextApprovalStatus =
      requestedApprovalStatus !== undefined
        ? (requestedApprovalStatus as PrismaJobApprovalStatus)
        : submit &&
            (existing.approvalStatus === PrismaJobApprovalStatus.Draft ||
              existing.approvalStatus === PrismaJobApprovalStatus.Cancelled)
          ? PrismaJobApprovalStatus.Pending
          : undefined;

    const row = await prisma.job.update({
      where: { id },
      data: {
        ...(contentInput.title !== undefined ? { title: contentInput.title } : {}),
        ...(contentInput.company !== undefined ||
        contentInput.companyId !== undefined ||
        options?.staffCompanyId
          ? { companyId }
          : {}),
        ...(contentInput.location !== undefined ? { location: contentInput.location } : {}),
        ...(contentInput.area !== undefined ? { area: contentInput.area } : {}),
        ...(contentInput.category !== undefined ? { category: contentInput.category } : {}),
        ...(contentInput.salary !== undefined ? { salaryDisplay: contentInput.salary } : {}),
        ...(contentInput.employmentType !== undefined
          ? { employmentType: toPrismaEmploymentType(contentInput.employmentType) }
          : {}),
        ...(contentInput.description !== undefined ? { description: contentInput.description } : {}),
        ...(contentInput.videoUrl !== undefined ? { videoUrl: contentInput.videoUrl } : {}),
        ...(contentInput.thumbnailUrl !== undefined ? { thumbnailUrl: contentInput.thumbnailUrl } : {}),
        ...(contentInput.tags !== undefined ? { tags: contentInput.tags } : {}),
        ...(contentInput.requirements !== undefined ? { requirements: contentInput.requirements } : {}),
        ...(contentInput.benefits !== undefined ? { benefits: contentInput.benefits } : {}),
        ...(contentInput.links !== undefined ? { links: contentInput.links } : {}),
        ...(nextApprovalStatus !== undefined
          ? {
              approvalStatus: nextApprovalStatus,
              approvedAt: nextApprovalStatus === PrismaJobApprovalStatus.Active ? now() : null,
            }
          : {}),
      },
      include: jobInclude,
    });
    return mapJobResolved(row);
  } catch {
    return null;
  }
}

export async function submitJob(id: string, companyId?: string | null): Promise<Job | null> {
  if (companyId) {
    const existing = await prisma.job.findUnique({ where: { id }, select: { companyId: true } });
    if (!existing || existing.companyId !== companyId) return null;
  }
  return submitJobForReview(id);
}

export { getPendingSubmissionForJob } from "@/lib/db/job-submissions";

export async function getJobsForStaff(companyId?: string | null, includeUnapproved = true): Promise<Job[]> {
  const rows = await prisma.job.findMany({
    where: {
      ...(includeUnapproved ? {} : { approvalStatus: PrismaJobApprovalStatus.Active }),
      ...(companyId ? { companyId } : {}),
    },
    include: jobInclude,
    orderBy: { postedAt: "desc" },
  });
  return Promise.all(rows.map(mapJobResolved));
}

export async function getApplicationWithSeeker(id: string): Promise<ApplicationWithSeeker | null> {
  const row = await prisma.application.findUnique({
    where: { id },
    include: { seeker: true },
  });
  if (!row) return null;

  const savedMessages = await fetchSavedApplyMessages([{ seekerId: row.seekerId, jobId: row.jobId }]);

  return {
    ...mapApplication(row),
    message: resolveApplicationMessage(row.seekerId, row.jobId, row.message, savedMessages),
    seeker: row.seeker ? await mapSeekerProfileResolved(row.seeker) : undefined,
  };
}

export async function getApplicationsForStaff(companyId?: string | null): Promise<ApplicationWithSeeker[]> {
  const rows = await prisma.application.findMany({
    where: companyId ? { job: { companyId } } : {},
    include: { seeker: true, job: { include: jobInclude } },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    rows.map(async (row) => ({
      ...mapApplication(row),
      seeker: row.seeker ? await mapSeekerProfileResolved(row.seeker) : undefined,
    }))
  );
}

export async function deleteJob(id: string, companyId?: string | null): Promise<boolean> {
  try {
    if (companyId) {
      const job = await prisma.job.findUnique({ where: { id }, select: { companyId: true } });
      if (!job || job.companyId !== companyId) return false;
    }
    await prisma.job.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function toggleSave(seekerId: string, jobId: string): Promise<boolean> {
  const existing = await prisma.savedJob.findUnique({
    where: { seekerId_jobId: { seekerId, jobId } },
  });

  if (existing) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
    return false;
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { approvalStatus: true },
  });
  if (!job || job.approvalStatus !== PrismaJobApprovalStatus.Active) {
    throw new Error(API_ERRORS.jobNotAvailable);
  }

  await prisma.savedJob.create({ data: { seekerId, jobId } });
  return true;
}

export async function removeSave(seekerId: string, jobId: string): Promise<boolean> {
  try {
    await prisma.savedJob.delete({ where: { seekerId_jobId: { seekerId, jobId } } });
    return true;
  } catch {
    return false;
  }
}

export async function getSavedJobs(seekerId: string): Promise<Job[]> {
  const rows = await prisma.savedJob.findMany({
    where: { seekerId, job: { approvalStatus: PrismaJobApprovalStatus.Active } },
    include: { job: { include: jobInclude } },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(rows.map((r) => mapJobResolved(r.job)));
}

async function upsertSavedJobApplyMessage(
  seekerId: string,
  jobId: string,
  message: string | null
): Promise<void> {
  const existing = await prisma.savedJob.findUnique({
    where: { seekerId_jobId: { seekerId, jobId } },
  });

  if (existing) {
    await prisma.savedJob.update({
      where: { id: existing.id },
      data: { message: message || existing.message || null },
    });
    return;
  }

  await prisma.savedJob.create({
    data: { seekerId, jobId, message },
  });
}

export async function getSavedJobIds(seekerId: string): Promise<string[]> {
  const rows = await prisma.savedJob.findMany({
    where: { seekerId, job: { approvalStatus: PrismaJobApprovalStatus.Active } },
    select: { jobId: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => row.jobId);
}

export async function getSavedCount(seekerId?: string): Promise<number> {
  if (!seekerId) {
    return prisma.savedJob.count();
  }
  return prisma.savedJob.count({ where: { seekerId } });
}

export async function upsertSeekerProfile(
  profile: UserProfile,
  options?: { id?: string; supabaseUserId?: string }
): Promise<UserProfile & { id: string }> {
  const { id, supabaseUserId } = options ?? {};
  const birthday = parseBirthday(profile.birthday);
  if (!birthday) {
    throw new Error(API_ERRORS.invalidBirthday);
  }

  const data = {
    name: profile.name,
    gender: profile.gender,
    birthday,
    area: profile.area,
    desiredJobType: profile.desiredJobType,
    experience: profile.experience,
    employmentType: toPrismaEmploymentType(profile.employmentType),
    email: profile.email,
    introSentence: profile.introSentence?.trim() || null,
    profileTitle: profile.profileTitle?.trim() || null,
    resumeUrl: profile.resumeUrl?.trim() || null,
    futureGoals: profile.futureGoals?.trim() || null,
    desiredSalary: profile.desiredSalary?.trim() || null,
    jobSearchIntent: profile.jobSearchIntent?.trim() || null,
    education: profile.education?.trim() || null,
    phone: profile.phone?.trim() || null,
    address: profile.address?.trim() || null,
    portfolioUrl: profile.portfolioUrl?.trim() || null,
    avatarUrl: profile.avatarUrl?.trim() || null,
    bannerUrl: profile.bannerUrl?.trim() || null,
    skills: profile.skills ?? [],
    workHistory: profile.workHistory ?? [],
  };

  if (supabaseUserId) {
    const byAuth = await prisma.seekerProfile.findUnique({ where: { supabaseUserId } });
    if (byAuth?.status === SeekerStatus.Suspended) {
      throw new Error(API_ERRORS.accountSuspended);
    }
    if (byAuth) {
      const row = await prisma.seekerProfile.update({
        where: { id: byAuth.id },
        data,
      });
      return mapSeekerProfileResolved(row);
    }
  }

  if (id) {
    try {
      const existing = await prisma.seekerProfile.findUnique({ where: { id } });
      if (existing?.status === SeekerStatus.Suspended) {
        throw new Error(API_ERRORS.accountSuspended);
      }
      const row = await prisma.seekerProfile.update({
        where: { id },
        data: {
          ...data,
          ...(supabaseUserId ? { supabaseUserId } : {}),
        },
      });
      return mapSeekerProfileResolved(row);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Record to update not found")) {
        // fall through to email upsert
      } else {
        throw err;
      }
    }
  }

  if (!supabaseUserId) {
    throw new Error(API_ERRORS.authUserIdRequired);
  }

  const byEmail = await prisma.seekerProfile.findUnique({ where: { email: profile.email } });
  if (byEmail?.status === SeekerStatus.Suspended) {
    throw new Error(API_ERRORS.accountSuspended);
  }

  const row = await prisma.seekerProfile.upsert({
    where: { email: profile.email },
    create: {
      ...data,
      supabaseUserId,
    },
    update: {
      ...data,
      supabaseUserId,
    },
  });

  return mapSeekerProfileResolved(row);
}

export async function updateSeekerProfileMedia(
  seekerId: string,
  patch: { avatarUrl?: string; bannerUrl?: string }
): Promise<UserProfile & { id: string }> {
  const existing = await prisma.seekerProfile.findUnique({
    where: { id: seekerId },
    select: { id: true, status: true },
  });
  if (!existing) throw new Error(API_ERRORS.seekerProfileNotFound);
  if (existing.status === SeekerStatus.Suspended) throw new Error(API_ERRORS.accountSuspended);

  const data: Prisma.SeekerProfileUpdateInput = {};
  if (patch.avatarUrl !== undefined) data.avatarUrl = patch.avatarUrl.trim() || null;
  if (patch.bannerUrl !== undefined) data.bannerUrl = patch.bannerUrl.trim() || null;
  if (Object.keys(data).length === 0) throw new Error(API_ERRORS.noFieldsToUpdate);

  try {
    const row = await prisma.seekerProfile.update({ where: { id: seekerId }, data });
    return mapSeekerProfileResolved(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("Unknown argument")) throw err;

    if (patch.avatarUrl !== undefined) {
      await prisma.$executeRaw`
        UPDATE seeker_profiles
        SET avatar_url = ${patch.avatarUrl.trim() || null}, updated_at = NOW()
        WHERE id = ${seekerId}::uuid
      `;
    }
    if (patch.bannerUrl !== undefined) {
      await prisma.$executeRaw`
        UPDATE seeker_profiles
        SET banner_url = ${patch.bannerUrl.trim() || null}, updated_at = NOW()
        WHERE id = ${seekerId}::uuid
      `;
    }

    const row = await prisma.seekerProfile.findUnique({ where: { id: seekerId } });
    if (!row) throw new Error(API_ERRORS.seekerProfileNotFound);
    return mapSeekerProfileResolved(row);
  }
}

export async function getSeekerProfile(id: string): Promise<(UserProfile & { id: string }) | null> {
  const row = await prisma.seekerProfile.findUnique({ where: { id } });
  return row ? mapSeekerProfileResolved(row) : null;
}

export async function createApplication(
  seekerId: string,
  input: CreateApplicationInput,
  profile?: UserProfile
): Promise<Application> {
  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    select: { approvalStatus: true },
  });
  if (!job || job.approvalStatus !== PrismaJobApprovalStatus.Active) {
    throw new Error(API_ERRORS.jobNotAvailable);
  }

  const applicantBirthdayRaw = input.applicantBirthday ?? profile?.birthday;
  const applicantBirthday = applicantBirthdayRaw ? parseBirthday(applicantBirthdayRaw) : null;
  const trimmedMessage = input.message?.trim() ?? "";
  const savedJob = await prisma.savedJob.findUnique({
    where: { seekerId_jobId: { seekerId, jobId: input.jobId } },
    select: { message: true },
  });
  const savedMessage = savedJob?.message?.trim() ?? "";
  const effectiveMessage = trimmedMessage || savedMessage;
  const applicantData = {
    applicantName: input.applicantName ?? profile?.name ?? "ゲストユーザー",
    applicantEmail: input.applicantEmail ?? profile?.email ?? "guest@jobswipe.app",
    applicantBirthday,
    applicantArea: input.applicantArea ?? profile?.area,
    applicantJobType: input.applicantJobType ?? profile?.desiredJobType,
  };

  const existing = await prisma.application.findUnique({
    where: { seekerId_jobId: { seekerId, jobId: input.jobId } },
  });

  if (existing) {
    const row = await prisma.application.update({
      where: { id: existing.id },
      data: {
        ...applicantData,
        message: effectiveMessage || existing.message || null,
      },
    });
    await upsertSavedJobApplyMessage(
      seekerId,
      input.jobId,
      effectiveMessage || row.message || null
    );
    return mapApplication(row);
  }

  const row = await prisma.application.create({
    data: {
      seekerId,
      jobId: input.jobId,
      ...applicantData,
      message: effectiveMessage || null,
      status: "new",
    },
  });

  await upsertSavedJobApplyMessage(seekerId, input.jobId, effectiveMessage || null);

  return mapApplication(row);
}

export async function getAllApplications(): Promise<Application[]> {
  const rows = await prisma.application.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((row) => mapApplication(row));
}

export async function getApplicationsForSeeker(seekerId: string): Promise<Application[]> {
  const rows = await prisma.application.findMany({
    where: { seekerId },
    orderBy: { createdAt: "desc" },
    include: { job: { select: { title: true, company: { select: { name: true, logoUrl: true } } } } },
  });
  return rows.map((row) => mapApplication(row, row.job));
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  companyId?: string | null
): Promise<Application | null> {
  try {
    const existing = await prisma.application.findUnique({
      where: { id },
      include: { job: { select: { companyId: true } } },
    });
    if (!existing) return null;
    if (companyId && existing.job.companyId !== companyId) return null;

    const row = await prisma.application.update({
      where: { id },
      data: { status },
      include: { job: { include: jobInclude }, seeker: true },
    });

    const shouldNotify =
      (status === "scheduling" || status === "hired") && !row.matchEmailSentAt;

    if (status === "hired") {
      const staffMeta = await getCompanyStaffMeta(existing.job.companyId);
      await addChatMessage(
        id,
        "company",
        "おめでとうございます！採用が決定しました。今後の手続きについてご連絡いたします。",
        staffMeta ?? undefined
      );
    }

    if (shouldNotify) {
      const notifyEnabled = row.seeker?.notifyHiredEmail ?? true;
      if (notifyEnabled) {
        const sent = await sendMatchNotificationEmail(
          row.applicantEmail,
          row.applicantName,
          row.job.title,
          row.job.company.name
        );
        if (sent) {
          await prisma.application.update({
            where: { id },
            data: { matchEmailSentAt: now() },
          });
        }
      }
    }

    return mapApplication(row);
  } catch {
    return null;
  }
}

export async function addChatMessage(
  applicationId: string,
  sender: "seeker" | "company",
  content: string,
  senderMeta?: { name?: string | null; avatarUrl?: string | null }
): Promise<ChatMessage> {
  const sentAt = now();
  const row = await prisma.chatMessage.create({
    data: {
      applicationId,
      sender,
      content,
      ...(sender === "company" && senderMeta
        ? {
            senderName: senderMeta.name?.trim() || null,
            senderAvatarUrl: senderMeta.avatarUrl?.trim() || null,
          }
        : {}),
    },
  });

  if (sender === "seeker") {
    await prisma.application.update({
      where: { id: applicationId },
      data: { seekerReadAt: sentAt },
    });
  } else if (sender === "company") {
    await prisma.application.update({
      where: { id: applicationId },
      data: { companyReadAt: sentAt },
    });
  }

  return mapChatMessageResolved(row);
}

export async function getChatMessages(applicationId: string): Promise<ChatMessage[]> {
  const rows = await prisma.chatMessage.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" },
  });
  return Promise.all(rows.map(mapChatMessageResolved));
}

export async function markSeekerChatRead(
  applicationId: string,
  seekerId: string
): Promise<boolean> {
  try {
    await prisma.application.update({
      where: { id: applicationId, seekerId },
      data: { seekerReadAt: now() },
    });
    return true;
  } catch {
    return false;
  }
}

export async function markCompanyChatRead(
  applicationId: string,
  companyId: string
): Promise<boolean> {
  try {
    const result = await prisma.application.updateMany({
      where: { id: applicationId, job: { companyId } },
      data: { companyReadAt: now() },
    });
    return result.count > 0;
  } catch {
    return false;
  }
}

export async function getSeekerUnreadTotal(seekerId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) AS count
    FROM chat_messages cm
    INNER JOIN applications a ON a.id = cm.application_id
    WHERE a.seeker_id = ${seekerId}
      AND cm.sender = 'company'
      AND (a.seeker_read_at IS NULL OR cm.created_at > a.seeker_read_at)
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function getCompanyUnreadTotal(companyId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) AS count
    FROM chat_messages cm
    INNER JOIN applications a ON a.id = cm.application_id
    INNER JOIN jobs j ON j.id = a.job_id
    WHERE j.company_id = ${companyId}
      AND cm.sender = 'seeker'
      AND (a.company_read_at IS NULL OR cm.created_at > a.company_read_at)
  `;
  return Number(rows[0]?.count ?? 0);
}

async function getSeekerUnreadByApplication(
  seekerId: string
): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<{ application_id: string; count: bigint }[]>`
    SELECT cm.application_id, COUNT(*) AS count
    FROM chat_messages cm
    INNER JOIN applications a ON a.id = cm.application_id
    WHERE a.seeker_id = ${seekerId}
      AND cm.sender = 'company'
      AND (a.seeker_read_at IS NULL OR cm.created_at > a.seeker_read_at)
    GROUP BY cm.application_id
  `;

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.application_id, Number(row.count));
  }
  return map;
}

export async function getCompanyUnreadByApplication(
  companyId: string
): Promise<Map<string, number>> {
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
  for (const row of rows) {
    map.set(row.application_id, Number(row.count));
  }
  return map;
}

export async function getCompanyUnreadByJob(
  companyId: string
): Promise<Map<string, number>> {
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
  for (const row of rows) {
    map.set(row.job_id, Number(row.count));
  }
  return map;
}

export async function getCompanyStaffMeta(
  companyId: string | null | undefined
): Promise<{ name: string; avatarUrl: string | null } | null> {
  if (!companyId) return null;

  const account = await prisma.account.findFirst({
    where: { companyId, role: "company" },
    orderBy: { updatedAt: "desc" },
    select: { name: true, avatarUrl: true, company: { select: { name: true } } },
  });

  if (!account) return null;

  return {
    name: account.name?.trim() || account.company?.name || "担当者",
    avatarUrl: account.avatarUrl,
  };
}

async function getCompanyStaffMap(companyIds: string[]) {
  if (companyIds.length === 0) return new Map<string, { name: string; avatarUrl: string | null }>();

  const rows = await prisma.account.findMany({
    where: { companyId: { in: companyIds }, role: "company" },
    orderBy: { updatedAt: "desc" },
    select: { companyId: true, name: true, avatarUrl: true, company: { select: { name: true } } },
  });

  const map = new Map<string, { name: string; avatarUrl: string | null }>();
  for (const row of rows) {
    if (!row.companyId || map.has(row.companyId)) continue;
    map.set(row.companyId, {
      name: row.name?.trim() || row.company?.name || "担当者",
      avatarUrl: row.avatarUrl,
    });
  }

  const entries = await Promise.all(
    [...map.entries()].map(async ([companyId, staff]) => [
      companyId,
      {
        ...staff,
        avatarUrl: (await resolveAvatarUrl(staff.avatarUrl)) ?? staff.avatarUrl,
      },
    ] as const)
  );
  return new Map(entries);
}

export async function getChatThreadsForSeeker(seekerId: string): Promise<
  { application: Application; job: Job; companyStaff?: { name: string; avatarUrl: string | null }; lastMessage?: ChatMessage; unreadCount: number }[]
> {
  const [apps, unreadMap] = await Promise.all([
    prisma.application.findMany({
      where: { seekerId },
      include: {
        job: { include: jobInclude },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    getSeekerUnreadByApplication(seekerId),
  ]);

  const staffMap = await getCompanyStaffMap([...new Set(apps.map((app) => app.job.companyId))]);

  const threads = await Promise.all(
    apps.map(async (app) => ({
      application: mapApplication(app),
      job: await mapJobResolved(app.job),
      companyStaff: staffMap.get(app.job.companyId),
      lastMessage: app.messages[0] ? await mapChatMessageResolved(app.messages[0]) : undefined,
      unreadCount: unreadMap.get(app.id) ?? 0,
    }))
  );

  threads.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ?? a.application.createdAt;
    const bTime = b.lastMessage?.createdAt ?? b.application.createdAt;
    return bTime.localeCompare(aTime);
  });

  return threads;
}

export async function getChatThreadsForStaff(
  companyId?: string | null
): Promise<{ application: ApplicationWithSeeker; job: Job; lastMessage?: ChatMessage }[]> {
  const rows = await prisma.application.findMany({
    where: companyId ? { job: { companyId } } : {},
    include: {
      seeker: true,
      job: { include: jobInclude },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return Promise.all(
    rows.map(async (row) => ({
      application: {
        ...mapApplication(row),
        seeker: row.seeker ? await mapSeekerProfileResolved(row.seeker) : undefined,
      },
      job: await mapJobResolved(row.job),
      lastMessage: row.messages[0] ? await mapChatMessageResolved(row.messages[0]) : undefined,
    }))
  );
}

export async function getAdminStats(companyId?: string | null) {
  const jobWhere = companyId ? { companyId } : {};
  const approvedJobWhere = { ...jobWhere, approvalStatus: PrismaJobApprovalStatus.Active };
  const applicationWhere = companyId ? { job: { companyId } } : {};
  const savedWhere = companyId ? { job: { companyId } } : {};

  const [totalJobs, approvedJobs, pendingJobs, videoViews, savedCount, applicationCount, pendingApplications, interviewCount, hiredCount, companyCount, seekerCount, activeChatCount] =
    await Promise.all([
      prisma.job.count({ where: jobWhere }),
      prisma.job.count({ where: approvedJobWhere }),
      prisma.job.count({ where: { ...jobWhere, approvalStatus: PrismaJobApprovalStatus.Pending } }),
      prisma.job.aggregate({ where: approvedJobWhere, _sum: { viewCount: true } }),
      prisma.savedJob.count({ where: savedWhere }),
      prisma.application.count({ where: applicationWhere }),
      prisma.application.count({ where: { ...applicationWhere, status: "new" } }),
      prisma.application.count({
        where: { ...applicationWhere, status: { in: ["interview_done", "hired"] } },
      }),
      prisma.application.count({ where: { ...applicationWhere, status: "hired" } }),
      companyId ? Promise.resolve(0) : prisma.company.count(),
      companyId ? Promise.resolve(0) : prisma.seekerProfile.count(),
      prisma.application.count({
        where: {
          ...applicationWhere,
          messages: { some: {} },
        },
      }),
    ]);

  const views = videoViews._sum.viewCount ?? 0;

  return {
    totalJobs,
    approvedJobs,
    pendingJobs,
    videoViews: views,
    savedCount,
    applicationCount,
    pendingApplications,
    interviewRate: applicationCount ? Math.round((interviewCount / applicationCount) * 100) : 0,
    hireRate: interviewCount ? Math.round((hiredCount / interviewCount) * 100) : 0,
    companyCount,
    seekerCount,
    activeChatCount,
  };
}

/** Clears applications, saves, seekers, jobs, and companies. Staff accounts are kept. */
export async function resetDemo(): Promise<void> {
  await prisma.$transaction([
    prisma.chatMessage.deleteMany(),
    prisma.application.deleteMany(),
    prisma.savedJob.deleteMany(),
    prisma.seekerProfile.deleteMany(),
    prisma.job.deleteMany(),
    prisma.company.deleteMany(),
  ]);
}

export function getSeekerIdFromRequest(request: Request): string | null {
  return request.headers.get("x-seeker-id");
}
