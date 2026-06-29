import type { Job } from "./types";

const LOGO_COLORS = ["6366F1", "EC4899", "0EA5E9", "F97316", "8B5CF6", "10B981"];

export function getCompanyLogoUrl(company: string, index = 0): string {
  const slug = company.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, "").slice(0, 20);
  const color = LOGO_COLORS[index % LOGO_COLORS.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&size=128&background=${color}&color=fff&bold=true&format=svg`;
}

export function resolveCompanyLogoUrl(company: string, logoUrl?: string | null): string {
  const trimmed = logoUrl?.trim();
  return trimmed || getCompanyLogoUrl(company);
}

export function isGeneratedCompanyLogo(logoUrl?: string | null): boolean {
  const trimmed = logoUrl?.trim();
  return !trimmed || trimmed.includes("ui-avatars.com");
}

const HR_AVATAR_COLOR = "047857";

export function getStaffAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=${HR_AVATAR_COLOR}&color=fff&bold=true&format=svg`;
}

export function resolveStaffAvatarUrl(name: string, avatarUrl?: string | null): string {
  const trimmed = avatarUrl?.trim();
  if (trimmed && !trimmed.includes("ui-avatars.com")) return trimmed;
  return getStaffAvatarUrl(name);
}

const SEEKER_AVATAR_COLOR = "161823";

export function getSeekerAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=${SEEKER_AVATAR_COLOR}&color=fff&bold=true&format=svg`;
}

export function resolveSeekerAvatarUrl(name: string, avatarUrl?: string | null): string {
  const trimmed = avatarUrl?.trim();
  if (trimmed && !trimmed.includes("ui-avatars.com")) return trimmed;
  return getSeekerAvatarUrl(name);
}

export const DEFAULT_SEEKER_BANNER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80";

export function seekerBannerStyle(bannerUrl?: string | null): { backgroundImage: string } {
  const imageUrl = bannerUrl?.trim() || DEFAULT_SEEKER_BANNER;
  return {
    backgroundImage: `linear-gradient(135deg, rgb(254 44 85 / 0.28), rgb(37 244 238 / 0.18)), url("${imageUrl}")`,
  };
}

export function getJobThumbnail(job: Pick<Job, "thumbnailUrl" | "companyLogo" | "company">): string {
  return job.thumbnailUrl || job.companyLogo || getCompanyLogoUrl(job.company);
}

export function getJobThumbnailFallback(job: Pick<Job, "companyLogo" | "company">): string {
  return job.companyLogo || getCompanyLogoUrl(job.company);
}
