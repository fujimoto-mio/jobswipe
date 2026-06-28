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

export function normalizeSeekerProfileFields(p: Partial<UserProfile> | null | undefined): Pick<
  UserProfile,
  | "introSentence"
  | "profileTitle"
  | "resumeUrl"
  | "futureGoals"
  | "desiredSalary"
  | "jobSearchIntent"
  | "education"
  | "portfolioUrl"
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
    portfolioUrl: p?.portfolioUrl ?? "",
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
    profile.skills.some((skill) => skill.name.trim() && skill.years),
    profile.workHistory.length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
