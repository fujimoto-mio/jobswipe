export type EmploymentType =
  | "正社員"
  | "契約社員"
  | "派遣"
  | "パート・アルバイト"
  | "業務委託"
  | "インターン"
  | "アルバイト";

import type { JobApprovalStatus } from "@/lib/constants";

export type { JobApprovalStatus };

export type JobLinks = {
  website?: string;
  careersPage?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  jobPdf?: string;
};

export type Job = {
  id: string;
  title: string;
  companyId: string;
  company: string;
  companyLogo: string;
  location: string;
  area: string;
  category: string;
  salary: string;
  employmentType: EmploymentType;
  tags: string[];
  description: string;
  requirements: string[];
  benefits: string[];
  videoUrl: string;
  thumbnailUrl: string;
  postedAt: string;
  approvedAt?: string | null;
  links?: JobLinks;
  approvalStatus: JobApprovalStatus;
  viewCount: number;
};

export type CreateJobInput = {
  title: string;
  company?: string;
  companyId?: string;
  location: string;
  area?: string;
  category?: string;
  salary: string;
  employmentType: EmploymentType;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  requirements?: string[];
  benefits?: string[];
  links?: JobLinks;
};

export type UpdateJobInput = Partial<CreateJobInput> & {
  approvalStatus?: JobApprovalStatus;
};

export type ApplicationStatus =
  | "new"
  | "scheduling"
  | "interview_done"
  | "hired"
  | "rejected";

export type Application = {
  id: string;
  jobId: string;
  seekerId?: string;
  applicantName: string;
  applicantEmail: string;
  applicantBirthday?: string;
  applicantArea?: string;
  applicantJobType?: string;
  message?: string;
  status: ApplicationStatus;
  interviewSlot?: string;
  interviewBookedAt?: string;
  createdAt: string;
  jobTitle?: string;
  companyName?: string;
};

export type SeekerProfileDetail = UserProfile & {
  id: string;
  gender: string;
  experience: string;
  employmentType: string;
};

export type ApplicationWithSeeker = Application & {
  seeker?: SeekerProfileDetail;
};

export type CreateApplicationInput = {
  jobId: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantBirthday?: string;
  applicantArea?: string;
  applicantJobType?: string;
  message?: string;
};

export type SkillEntry = {
  name: string;
  years: string;
};

export type WorkHistoryEntry = {
  company: string;
  role: string;
  startYear: string;
  startMonth: string;
  startDay: string;
  endYear: string;
  endMonth: string;
  endDay: string;
  isCurrent: boolean;
  description: string;
};

export type UserProfile = {
  name: string;
  gender: string;
  birthday: string;
  area: string;
  desiredJobType: string;
  experience: string;
  employmentType: string;
  email: string;
  introSentence: string;
  profileTitle: string;
  resumeUrl: string;
  futureGoals: string;
  desiredSalary: string;
  jobSearchIntent: string;
  education: string;
  portfolioUrl: string;
  skills: SkillEntry[];
  workHistory: WorkHistoryEntry[];
};

export type ChatMessage = {
  id: string;
  applicationId: string;
  sender: "seeker" | "company";
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  content: string;
  createdAt: string;
};

export type CompanyStaffProfile = {
  name: string;
  avatarUrl: string | null;
};

export type ChatThread = {
  application: Application;
  job: Job;
  companyStaff?: CompanyStaffProfile;
  lastMessage?: ChatMessage;
  unreadCount?: number;
};

export type JobFilters = {
  areas: string[];
  categories: string[];
};

export type SeekerSettings = {
  notifyHiredEmail: boolean;
  notifyChatEmail: boolean;
};
