"use client";

import type { ReactNode } from "react";
import type { UserProfile, WorkHistoryEntry } from "@/lib/types";

const PROFILE_TEXT_FIELDS = [
  { key: "introSentence", label: "一言紹介" },
  { key: "futureGoals", label: "今後やりたいこと" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<UserProfile, "introSentence" | "futureGoals">;
  label: string;
}>;

const PREFERENCE_FIELDS = [
  { key: "area", label: "希望エリア" },
  { key: "desiredJobType", label: "希望職種" },
  { key: "employmentType", label: "希望雇用形態" },
  { key: "experience", label: "社会人経験" },
  { key: "desiredSalary", label: "希望年収" },
  { key: "jobSearchIntent", label: "転職意欲" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<
    UserProfile,
    "area" | "desiredJobType" | "employmentType" | "experience" | "desiredSalary" | "jobSearchIntent"
  >;
  label: string;
}>;

function ProfileTextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="profile-text-item">
      <p className="profile-field-label">{label}</p>
      <p className="profile-field-value profile-field-value-body whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function ProfileInfoRow({ label, value }: { label: string; value: string }) {
  const empty = !value.trim();
  return (
    <div className="profile-info-row">
      <p className="profile-field-label">{label}</p>
      <p className={`profile-info-value truncate ${empty ? "is-empty" : ""}`}>{empty ? "未設定" : value}</p>
    </div>
  );
}

export { ProfileInfoRow };

function formatWorkPeriod(entry: WorkHistoryEntry): string {
  const formatYm = (year: string, month: string) => {
    if (year && month) return `${year}/${month}`;
    if (year) return year;
    return "—";
  };
  const start = formatYm(entry.startYear, entry.startMonth);
  const end = entry.isCurrent ? "現在" : formatYm(entry.endYear, entry.endMonth);
  return `${start} 〜 ${end}`;
}

function ProfileSectionShell({
  title,
  children,
  flush = false,
}: {
  title: string;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className="profile-panel">
      <div className="profile-panel-header">
        <p className="profile-panel-title">{title}</p>
      </div>
      <div className={`profile-panel-body ${flush ? "profile-panel-body--flush" : ""}`}>{children}</div>
    </section>
  );
}

function ProfileTextSection({ profile }: { profile: UserProfile }) {
  const filledFields = PROFILE_TEXT_FIELDS.map(({ key, label }) => ({
    label,
    value: profile[key].trim(),
  })).filter((field) => field.value);

  if (filledFields.length === 0) return null;

  return (
    <ProfileSectionShell title="自己紹介">
      <div className="profile-text-fields">
        {filledFields.map(({ label, value }) => (
          <ProfileTextBlock key={label} label={label} value={value} />
        ))}
      </div>
    </ProfileSectionShell>
  );
}

export function SeekerProfileCareerView({ profile }: { profile: UserProfile }) {
  const filledPreferences = PREFERENCE_FIELDS.map(({ key, label }) => ({
    label,
    value: profile[key].trim(),
  })).filter((field) => field.value);

  return (
    <>
      <ProfileTextSection profile={profile} />

      {filledPreferences.length > 0 && (
        <ProfileSectionShell title="希望条件" flush>
          <div className="profile-info-list">
            {filledPreferences.map(({ label, value }) => (
              <ProfileInfoRow key={label} label={label} value={value} />
            ))}
          </div>
        </ProfileSectionShell>
      )}

      {profile.workHistory.length > 0 && (
        <ProfileSectionShell title="職歴" flush>
          <ul className="profile-info-list">
            {profile.workHistory.map((entry, index) => (
              <li key={`${entry.company}-${index}`} className="profile-work-item">
                <p className="profile-info-value">{entry.company || "—"}</p>
                <p className="profile-field-value">{entry.role || "—"}</p>
                <p className="profile-work-meta">{formatWorkPeriod(entry)}</p>
                {entry.description.trim() && (
                  <p className="profile-field-value profile-field-value-body mt-2 whitespace-pre-wrap">
                    {entry.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </ProfileSectionShell>
      )}

      {profile.skills.length > 0 && (
        <ProfileSectionShell title="スキル">
          <div className="profile-skill-chips">
            {profile.skills.map((skill, index) => (
              <span key={`${skill.name}-${index}`} className="profile-skill-chip">
                {skill.name}
                {skill.years ? <span className="profile-skill-chip-years">{skill.years}</span> : null}
              </span>
            ))}
          </div>
        </ProfileSectionShell>
      )}
    </>
  );
}

export function SeekerProfileCareerSummary({ profile }: { profile: UserProfile }) {
  const filledTextFields = PROFILE_TEXT_FIELDS.map(({ key, label }) => ({
    label,
    value: profile[key].trim(),
  })).filter((field) => field.value);

  const hasCareer =
    filledTextFields.length > 0 ||
    profile.skills.length > 0 ||
    profile.workHistory.length > 0 ||
    Boolean(profile.desiredSalary) ||
    Boolean(profile.jobSearchIntent);

  if (!hasCareer) return null;

  return (
    <>
      {filledTextFields.length > 0 && (
        <ProfileSectionShell title="自己紹介">
          <div className="profile-text-fields">
            {filledTextFields.map(({ label, value }) => (
              <ProfileTextBlock key={label} label={label} value={value} />
            ))}
          </div>
        </ProfileSectionShell>
      )}

      {(profile.desiredSalary || profile.jobSearchIntent) && (
        <ProfileSectionShell title="希望条件" flush>
          <div className="profile-info-list">
            {profile.desiredSalary && <ProfileInfoRow label="希望年収" value={profile.desiredSalary} />}
            {profile.jobSearchIntent && <ProfileInfoRow label="転職意欲" value={profile.jobSearchIntent} />}
          </div>
        </ProfileSectionShell>
      )}

      {profile.workHistory.length > 0 && (
        <ProfileSectionShell title="職歴" flush>
          <ul className="profile-info-list">
            {profile.workHistory.map((entry, index) => (
              <li key={`${entry.company}-${index}`} className="profile-work-item">
                <p className="profile-info-value">{entry.company || "—"}</p>
                <p className="profile-field-value">{entry.role || "—"}</p>
                <p className="profile-work-meta">{formatWorkPeriod(entry)}</p>
                {entry.description.trim() && (
                  <p className="profile-field-value profile-field-value-body mt-2 whitespace-pre-wrap">
                    {entry.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </ProfileSectionShell>
      )}

      {profile.skills.length > 0 && (
        <ProfileSectionShell title="スキル">
          <div className="profile-skill-chips">
            {profile.skills.map((skill, index) => (
              <span key={`${skill.name}-${index}`} className="profile-skill-chip">
                {skill.name}
                {skill.years ? <span className="profile-skill-chip-years">{skill.years}</span> : null}
              </span>
            ))}
          </div>
        </ProfileSectionShell>
      )}
    </>
  );
}
