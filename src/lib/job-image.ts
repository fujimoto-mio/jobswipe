import type { Job } from "./types";

const LOGO_COLORS = ["6366F1", "EC4899", "0EA5E9", "F97316", "8B5CF6", "10B981"];

export function getCompanyLogoUrl(company: string, index = 0): string {
  const slug = company.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, "").slice(0, 20);
  const color = LOGO_COLORS[index % LOGO_COLORS.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&size=128&background=${color}&color=fff&bold=true&format=svg`;
}

export function getJobThumbnail(job: Pick<Job, "thumbnailUrl" | "companyLogo" | "company">): string {
  return job.thumbnailUrl || job.companyLogo || getCompanyLogoUrl(job.company);
}

export function getJobThumbnailFallback(job: Pick<Job, "companyLogo" | "company">): string {
  return job.companyLogo || getCompanyLogoUrl(job.company);
}
