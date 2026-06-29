import { apiFetch } from "@/lib/api-client";
import { getProfile, saveProfile, type StoredProfile } from "@/lib/profile";
import type { UserProfile } from "@/lib/types";

export type SeekerMeResponse = {
  seekerId: string;
  profile: UserProfile & { id: string };
};

let inflight: Promise<SeekerMeResponse | null> | null = null;

export function invalidateSeekerMeCache(): void {
  inflight = null;
}

export async function fetchSeekerMe(): Promise<SeekerMeResponse | null> {
  if (inflight) return inflight;

  inflight = apiFetch("/api/me")
    .then(async (res) => {
      if (!res.ok) return null;
      return (await res.json()) as SeekerMeResponse;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function syncSeekerProfileFromMe(data: SeekerMeResponse): StoredProfile {
  const stored: StoredProfile = {
    ...data.profile,
    id: data.seekerId,
  };
  saveProfile(stored);
  return stored;
}

export function getCachedSeekerProfile(): StoredProfile | null {
  return getProfile();
}
