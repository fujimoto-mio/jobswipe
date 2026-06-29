import type { Job as PrismaJob, Company, Application as PrismaApplication, ChatMessage as PrismaChatMessage } from "@prisma/client";
import { birthdayToInputValue } from "@/lib/birthday";
import { asStringArray as parseNonEmptyStrings, asWorkHistory, asSkills } from "@/lib/profile-fields";
import { getCompanyLogoUrl } from "@/lib/job-image";
import { resolveJobLinks } from "@/lib/company-links";
import { formatDateISOJST, serializeTimestamp } from "@/lib/datetime";
import type {
  Application,
  ApplicationStatus,
  ChatMessage,
  Job,
  JobApprovalStatus,
  UserProfile,
} from "@/lib/types";

type JobWithCompany = PrismaJob & { company: Company };

function asJsonStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

export function mapJob(row: JobWithCompany): Job {
  return {
    id: row.id,
    title: row.title,
    companyId: row.companyId,
    company: row.company.name,
    companyLogo: row.company.logoUrl ?? getCompanyLogoUrl(row.company.name),
    location: row.location,
    area: row.area,
    category: row.category,
    salary: row.salaryDisplay,
    employmentType: row.employmentType as Job["employmentType"],
    tags: asJsonStringArray(row.tags),
    description: row.description,
    requirements: asJsonStringArray(row.requirements),
    benefits: asJsonStringArray(row.benefits),
    videoUrl: row.videoUrl,
    thumbnailUrl: row.thumbnailUrl ?? getCompanyLogoUrl(row.company.name),
    postedAt: formatDateISOJST(row.postedAt),
    approvedAt: row.approvedAt ? serializeTimestamp(row.approvedAt) : null,
    links: resolveJobLinks(row.company, row.links),
    approvalStatus: row.approvalStatus as JobApprovalStatus,
    viewCount: row.viewCount,
  };
}

export function mapApplication(
  row: PrismaApplication,
  job?: { title: string; company: { name: string; logoUrl?: string | null } }
): Application {
  return {
    id: row.id,
    jobId: row.jobId,
    seekerId: row.seekerId,
    applicantName: row.applicantName,
    applicantEmail: row.applicantEmail,
    applicantBirthday: row.applicantBirthday ? birthdayToInputValue(row.applicantBirthday) : undefined,
    applicantArea: row.applicantArea ?? undefined,
    applicantJobType: row.applicantJobType ?? undefined,
    message: row.message?.trim() || undefined,
    status: row.status as ApplicationStatus,
    interviewSlot: row.interviewSlot ?? undefined,
    interviewBookedAt: row.interviewBookedAt ? serializeTimestamp(row.interviewBookedAt) : undefined,
    createdAt: serializeTimestamp(row.createdAt),
    ...(job
      ? {
          jobTitle: job.title,
          companyName: job.company.name,
          companyLogo: job.company.logoUrl ?? null,
        }
      : {}),
  };
}

export function mapChatMessage(row: PrismaChatMessage): ChatMessage {
  return {
    id: row.id,
    applicationId: row.applicationId,
    sender: row.sender as ChatMessage["sender"],
    senderName: row.senderName,
    senderAvatarUrl: row.senderAvatarUrl,
    content: row.content,
    createdAt: serializeTimestamp(row.createdAt),
  };
}

export function mapSeekerProfile(row: {
  id: string;
  email: string;
  name: string;
  gender: string;
  birthday: Date;
  area: string;
  desiredJobType: string;
  experience: string;
  employmentType: string;
  introSentence?: string | null;
  profileTitle?: string | null;
  resumeUrl?: string | null;
  futureGoals?: string | null;
  desiredSalary?: string | null;
  jobSearchIntent?: string | null;
  education?: string | null;
  phone?: string | null;
  address?: string | null;
  portfolioUrl?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  skills?: unknown;
  workHistory?: unknown;
}): UserProfile & { id: string } {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    birthday: birthdayToInputValue(row.birthday),
    area: row.area,
    desiredJobType: row.desiredJobType,
    experience: row.experience,
    employmentType: row.employmentType,
    email: row.email,
    introSentence: row.introSentence ?? "",
    profileTitle: row.profileTitle ?? "",
    resumeUrl: row.resumeUrl ?? "",
    futureGoals: row.futureGoals ?? "",
    desiredSalary: row.desiredSalary ?? "",
    jobSearchIntent: row.jobSearchIntent ?? "",
    education: row.education ?? "",
    phone: row.phone ?? "",
    address: row.address ?? "",
    portfolioUrl: row.portfolioUrl ?? "",
    avatarUrl: row.avatarUrl ?? "",
    bannerUrl: row.bannerUrl ?? "",
    skills: asSkills(row.skills),
    workHistory: asWorkHistory(row.workHistory),
  };
}
