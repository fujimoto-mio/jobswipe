import { apiFetch } from "@/lib/api-client";
import { getProfile, saveProfile, type StoredProfile } from "@/lib/profile";
import type { UserProfile } from "@/lib/types";

export type SeekerMeResponse = {
  seekerId: string;
  profile: UserProfile & { id: string };
};

let memoryCache: SeekerMeResponse | null = null;
let inflight: Promise<SeekerMeResponse | null> | null = null;

function toSeekerMeResponse(profile: StoredProfile): SeekerMeResponse | null {
  if (!profile.id) return null;
  const { id, ...rest } = profile;
  return {
    seekerId: id,
    profile: { ...rest, id },
  };
}

function readCachedMe(): SeekerMeResponse | null {
  if (memoryCache) return memoryCache;
  const profile = getProfile();
  if (!profile) return null;
  memoryCache = toSeekerMeResponse(profile);
  return memoryCache;
}

export function invalidateSeekerMeCache(): void {
  memoryCache = null;
  inflight = null;
}

export async function fetchSeekerMe(options?: { force?: boolean }): Promise<SeekerMeResponse | null> {
  if (!options?.force) {
    const cached = readCachedMe();
    if (cached) return cached;
  }

  if (inflight) return inflight;

  inflight = apiFetch("/api/me")
    .then(async (res) => {
      if (!res.ok) return null;
      const data = (await res.json()) as SeekerMeResponse;
      syncSeekerProfileFromMe(data);
      return data;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function syncSeekerProfileFromMe(data: SeekerMeResponse): StoredProfile {
  memoryCache = data;
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

export function getCachedSeekerMe(): SeekerMeResponse | null {
  return readCachedMe();
}
