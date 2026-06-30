import { parseStorageObjectRef, resolveObjectReadUrl } from "@/lib/storage/urls";
import type { Job, UserProfile } from "@/lib/types";

export async function resolveStorageReadUrl(url: string | null | undefined): Promise<string | null> {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  const ref = parseStorageObjectRef(trimmed);
  if (!ref) return trimmed;

  return (await resolveObjectReadUrl(ref.bucket, ref.key)) ?? trimmed;
}

async function resolveOptionalUrl(url: string | null | undefined): Promise<string | null> {
  const resolved = await resolveStorageReadUrl(url);
  return resolved ?? url?.trim() ?? null;
}

export async function resolveJobMedia<T extends Pick<Job, "videoUrl" | "thumbnailUrl" | "companyLogo">>(
  job: T
): Promise<T> {
  const [videoUrl, thumbnailUrl, companyLogo] = await Promise.all([
    resolveOptionalUrl(job.videoUrl),
    resolveOptionalUrl(job.thumbnailUrl),
    resolveOptionalUrl(job.companyLogo),
  ]);

  return {
    ...job,
    videoUrl: videoUrl ?? job.videoUrl,
    thumbnailUrl: thumbnailUrl ?? job.thumbnailUrl,
    companyLogo: companyLogo ?? job.companyLogo,
  };
}

export async function resolveSeekerProfileMedia<T extends Pick<UserProfile, "resumeUrl" | "avatarUrl" | "bannerUrl">>(
  profile: T
): Promise<T> {
  const [resumeUrl, avatarUrl, bannerUrl] = await Promise.all([
    resolveOptionalUrl(profile.resumeUrl),
    resolveOptionalUrl(profile.avatarUrl),
    resolveOptionalUrl(profile.bannerUrl),
  ]);

  return {
    ...profile,
    resumeUrl: resumeUrl ?? profile.resumeUrl,
    avatarUrl: avatarUrl ?? profile.avatarUrl,
    bannerUrl: bannerUrl ?? profile.bannerUrl,
  };
}

export async function resolveStaffMediaFields<
  T extends {
    avatarUrl?: string | null;
    companyLogoUrl?: string | null;
    companyBannerUrl?: string | null;
  },
>(profile: T): Promise<T> {
  const [avatarUrl, companyLogoUrl, companyBannerUrl] = await Promise.all([
    resolveOptionalUrl(profile.avatarUrl),
    resolveOptionalUrl(profile.companyLogoUrl),
    resolveOptionalUrl(profile.companyBannerUrl),
  ]);

  return {
    ...profile,
    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    ...(companyLogoUrl !== undefined ? { companyLogoUrl } : {}),
    ...(companyBannerUrl !== undefined ? { companyBannerUrl } : {}),
  };
}

export async function resolveAvatarUrl(url: string | null | undefined): Promise<string | null> {
  return resolveOptionalUrl(url);
}
