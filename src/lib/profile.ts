import type { UserProfile } from "./types";

const PROFILE_KEY = "jobswipe_profile";

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  gender: "",
  age: 0,
  area: "",
  desiredJobType: "",
  experience: "",
  employmentType: "",
  email: "",
};

export type StoredProfile = UserProfile & { id?: string };

export function getProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: StoredProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function isProfileComplete(profile: StoredProfile | null): profile is StoredProfile {
  if (!profile) return false;
  return Boolean(
    profile.name &&
      profile.gender &&
      profile.age > 0 &&
      profile.area &&
      profile.desiredJobType &&
      profile.experience &&
      profile.employmentType &&
      profile.email
  );
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}
