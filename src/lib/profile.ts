import type { UserProfile } from "./types";

const PROFILE_KEY = "jobswipe_profile";

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  gender: "",
  birthday: "",
  area: "",
  desiredJobType: "",
  experience: "",
  employmentType: "",
  email: "",
  introSentence: "",
  profileTitle: "",
  summary: "",
  resumeUrl: "",
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
      introSentence: parsed.introSentence ?? "",
      profileTitle: parsed.profileTitle ?? "",
      summary: parsed.summary ?? "",
      resumeUrl: parsed.resumeUrl ?? "",
    };
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
}
