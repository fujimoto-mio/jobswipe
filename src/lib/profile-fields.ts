import type { UserProfile, WorkHistoryEntry, SkillEntry } from "./types";

export const EMPTY_WORK_HISTORY_ENTRY: WorkHistoryEntry = {
  company: "",
  role: "",
  startYear: "",
  startMonth: "",
  startDay: "",
  endYear: "",
  endMonth: "",
  endDay: "",
  isCurrent: false,
  description: "",
};

export const EMPTY_SKILL_ENTRY: SkillEntry = {
  name: "",
  years: "",
};

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function asWorkHistory(value: unknown): WorkHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      company: typeof item.company === "string" ? item.company : "",
      role: typeof item.role === "string" ? item.role : "",
      startYear: typeof item.startYear === "string" ? item.startYear : "",
      startMonth: typeof item.startMonth === "string" ? item.startMonth : "",
      startDay: typeof item.startDay === "string" ? item.startDay : "",
      endYear: typeof item.endYear === "string" ? item.endYear : "",
      endMonth: typeof item.endMonth === "string" ? item.endMonth : "",
      endDay: typeof item.endDay === "string" ? item.endDay : "",
      isCurrent: Boolean(item.isCurrent),
      description: typeof item.description === "string" ? item.description : "",
    }))
    .filter((item) => item.company.trim() || item.role.trim());
}

export function asSkills(value: unknown): SkillEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): SkillEntry => {
      if (typeof item === "string" && item.trim()) {
        return { name: item.trim(), years: "" };
      }
      if (item && typeof item === "object") {
        const row = item as Record<string, unknown>;
        return {
          name: typeof row.name === "string" ? row.name.trim() : "",
          years: typeof row.years === "string" ? row.years.trim() : "",
        };
      }
      return { name: "", years: "" };
    })
    .filter((item) => item.name.length > 0);
}

/** Keep only skills complete enough for server validation. */
export function skillsForProfileSave(skills: SkillEntry[]): SkillEntry[] {
  return skills.filter((item) => item.name.trim() && item.years.trim());
}

const MEDIA_PATCH_KEYS = new Set(["avatarUrl", "bannerUrl"]);

export function isMediaOnlyProfilePatch(raw: Partial<UserProfile>): boolean {
  const keys = Object.keys(raw).filter((key) => {
    if (key === "id") return false;
    return raw[key as keyof UserProfile] !== undefined;
  });
  return keys.length > 0 && keys.every((key) => MEDIA_PATCH_KEYS.has(key));
}

export function mergeSeekerProfilePatch(
  base: UserProfile,
  raw: Partial<UserProfile>
): UserProfile {
  const extended = normalizeSeekerProfileFields(base);
  return {
    name: raw.name ?? base.name,
    gender: raw.gender ?? base.gender,
    birthday: raw.birthday ?? base.birthday,
    area: raw.area ?? base.area,
    desiredJobType: raw.desiredJobType ?? base.desiredJobType,
    experience: raw.experience ?? base.experience,
    employmentType: raw.employmentType ?? base.employmentType,
    email: base.email,
    profileTitle: raw.profileTitle ?? extended.profileTitle,
    introSentence: raw.introSentence ?? extended.introSentence,
    resumeUrl: raw.resumeUrl ?? extended.resumeUrl,
    futureGoals: raw.futureGoals ?? extended.futureGoals,
    desiredSalary: raw.desiredSalary ?? extended.desiredSalary,
    jobSearchIntent: raw.jobSearchIntent ?? extended.jobSearchIntent,
    education: raw.education ?? extended.education,
    phone: raw.phone ?? extended.phone,
    address: raw.address ?? extended.address,
    portfolioUrl: raw.portfolioUrl ?? extended.portfolioUrl,
    avatarUrl: raw.avatarUrl ?? extended.avatarUrl,
    bannerUrl: raw.bannerUrl ?? extended.bannerUrl,
    skills: skillsForProfileSave(asSkills(raw.skills ?? base.skills)),
    workHistory: asWorkHistory(raw.workHistory ?? base.workHistory),
  };
}

export function normalizeSeekerProfileFields(p: Partial<UserProfile> | null | undefined): Pick<
  UserProfile,
  | "introSentence"
  | "profileTitle"
  | "resumeUrl"
  | "futureGoals"
  | "desiredSalary"
  | "jobSearchIntent"
  | "education"
  | "phone"
  | "address"
  | "portfolioUrl"
  | "avatarUrl"
  | "bannerUrl"
  | "skills"
  | "workHistory"
> {
  return {
    introSentence: p?.introSentence ?? "",
    profileTitle: p?.profileTitle ?? "",
    resumeUrl: p?.resumeUrl ?? "",
    futureGoals: p?.futureGoals ?? "",
    desiredSalary: p?.desiredSalary ?? "",
    jobSearchIntent: p?.jobSearchIntent ?? "",
    education: p?.education ?? "",
    phone: p?.phone ?? "",
    address: p?.address ?? "",
    portfolioUrl: p?.portfolioUrl ?? "",
    avatarUrl: p?.avatarUrl ?? "",
    bannerUrl: p?.bannerUrl ?? "",
    skills: asSkills(p?.skills),
    workHistory: asWorkHistory(p?.workHistory),
  };
}

export function calcProfileCompletion(profile: UserProfile): number {
  const checks = [
    Boolean(profile.name.trim()),
    Boolean(profile.gender),
    Boolean(profile.birthday),
    Boolean(profile.area),
    Boolean(profile.desiredJobType),
    Boolean(profile.experience),
    Boolean(profile.employmentType),
    Boolean(profile.introSentence.trim()),
    Boolean(profile.futureGoals.trim()),
    Boolean(profile.desiredSalary),
    Boolean(profile.jobSearchIntent),
    Boolean(profile.education),
    Boolean(profile.phone.trim()),
    Boolean(profile.address.trim()),
    Boolean(profile.avatarUrl.trim()),
    Boolean(profile.bannerUrl.trim()),
    profile.skills.some((skill) => skill.name.trim() && skill.years),
    profile.workHistory.length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
