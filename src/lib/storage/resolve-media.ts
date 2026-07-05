import { parseStorageObjectRef, resolveObjectReadUrl, resolvePublicReadUrlSync } from "@/lib/storage/urls";
import type { Job, UserProfile } from "@/lib/types";

export { hasPublicCdnConfigured } from "@/lib/storage/urls";
export async function resolveStorageReadUrl(url: string | null | undefined): Promise<string | null> {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  const ref = parseStorageObjectRef(trimmed);
  if (!ref) return trimmed;

  return (await resolveObjectReadUrl(ref.bucket, ref.key)) ?? trimmed;
}

async function resolveOptionalUrl(url: string | null | undefined): Promise<string | null> {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  const stablePublic = resolvePublicReadUrlSync(trimmed);
  if (stablePublic) return stablePublic;

  const resolved = await resolveStorageReadUrl(url);
  return resolved ?? trimmed;
}

/** Feed media uses stable CDN URLs when R2_PUBLIC_BUCKET_URL is set; otherwise presigned URLs. */
export async function resolveJobMedia<T extends Pick<Job, "videoUrl" | "companyLogo">>(
  job: T
): Promise<T> {
  const [videoUrl, companyLogo] = await Promise.all([
    resolveOptionalUrl(job.videoUrl),
    resolveOptionalUrl(job.companyLogo),
  ]);

  return {
    ...job,
    videoUrl: videoUrl ?? job.videoUrl,
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
