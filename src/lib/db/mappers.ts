import type { Job as PrismaJob, Company, Application as PrismaApplication, ChatMessage as PrismaChatMessage } from "@prisma/client";
import { getCompanyLogoUrl } from "@/lib/job-image";
import { formatDateISOJST, toISOStringJST } from "@/lib/datetime";
import type {
  Application,
  ApplicationStatus,
  ChatMessage,
  Job,
  JobApprovalStatus,
  JobLinks,
  UserProfile,
} from "@/lib/types";

type JobWithCompany = PrismaJob & { company: Company };

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

function asJobLinks(value: unknown): JobLinks {
  if (!value || typeof value !== "object") return {};
  return value as JobLinks;
}

export function mapJob(row: JobWithCompany): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company.name,
    companyLogo: row.company.logoUrl ?? getCompanyLogoUrl(row.company.name),
    location: row.location,
    area: row.area,
    category: row.category,
    salary: row.salaryDisplay,
    employmentType: row.employmentType as Job["employmentType"],
    tags: asStringArray(row.tags),
    description: row.description,
    requirements: asStringArray(row.requirements),
    benefits: asStringArray(row.benefits),
    videoUrl: row.videoUrl,
    thumbnailUrl: row.thumbnailUrl ?? getCompanyLogoUrl(row.company.name),
    postedAt: formatDateISOJST(row.postedAt),
    links: asJobLinks(row.links),
    approvalStatus: row.approvalStatus as JobApprovalStatus,
    viewCount: row.viewCount,
  };
}

export function mapApplication(row: PrismaApplication): Application {
  return {
    id: row.id,
    jobId: row.jobId,
    seekerId: row.seekerId,
    applicantName: row.applicantName,
    applicantEmail: row.applicantEmail,
    applicantAge: row.applicantAge ?? undefined,
    applicantArea: row.applicantArea ?? undefined,
    applicantJobType: row.applicantJobType ?? undefined,
    message: row.message ?? undefined,
    status: row.status as ApplicationStatus,
    interviewSlot: row.interviewSlot ?? undefined,
    interviewBookedAt: row.interviewBookedAt ? toISOStringJST(row.interviewBookedAt) : undefined,
    createdAt: toISOStringJST(row.createdAt),
  };
}

export function mapChatMessage(row: PrismaChatMessage): ChatMessage {
  return {
    id: row.id,
    applicationId: row.applicationId,
    sender: row.sender as ChatMessage["sender"],
    content: row.content,
    createdAt: toISOStringJST(row.createdAt),
  };
}

export function mapSeekerProfile(row: {
  id: string;
  email: string;
  name: string;
  gender: string;
  age: number;
  area: string;
  desiredJobType: string;
  experience: string;
  employmentType: string;
}): UserProfile & { id: string } {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    age: row.age,
    area: row.area,
    desiredJobType: row.desiredJobType,
    experience: row.experience,
    employmentType: row.employmentType,
    email: row.email,
  };
}
