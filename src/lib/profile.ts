import type { UserProfile } from "./types";
import { normalizeSeekerProfileFields } from "./profile-fields";

const PROFILE_KEY = "jobswipe_profile";
const PROFILE_UPDATED_EVENT = "jobswipe_profile_updated";

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  gender: "",
  birthday: "",
  area: "",
  desiredJobType: "",
  experience: "",
  employmentType: "",
  email: "",
  ...normalizeSeekerProfileFields(null),
};

export type StoredProfile = UserProfile & { id?: string };

export function getProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredProfile & { age?: number };
    if (parsed.age != null && !parsed.birthday) {
      clearProfile();
      return null;
    }
    return {
      ...parsed,
      ...normalizeSeekerProfileFields(parsed),
    };
  } catch {
    return null;
  }
}

export function saveProfile(profile: StoredProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: profile }));
  }
}

export function subscribeProfileUpdates(
  listener: (profile: StoredProfile | null) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    listener((event as CustomEvent<StoredProfile | null>).detail ?? null);
  };

  window.addEventListener(PROFILE_UPDATED_EVENT, handler);
  return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
}

export function isProfileComplete(profile: StoredProfile | null): profile is StoredProfile {
  if (!profile) return false;
  return Boolean(
    profile.name &&
      profile.gender &&
      profile.birthday &&
      profile.area &&
      profile.desiredJobType &&
      profile.experience &&
      profile.employmentType &&
      profile.email
  );
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: null }));
  }
}
