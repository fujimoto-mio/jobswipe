"use client";

import type { UserProfile, WorkHistoryEntry } from "@/lib/types";

const PROFILE_TEXT_FIELDS = [
  { key: "introSentence", label: "一言紹介" },
  { key: "futureGoals", label: "今後やりたいこと" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<UserProfile, "introSentence" | "futureGoals">;
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

function ProfileTextSection({ profile }: { profile: UserProfile }) {
  const filledFields = PROFILE_TEXT_FIELDS.map(({ key, label }) => ({
    label,
    value: profile[key].trim(),
  })).filter((field) => field.value);

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <p className="profile-section-title">プロフィール</p>
      </div>
      <div className="profile-section-content">
        {filledFields.length === 0 ? (
          <p className="profile-field-value profile-field-value-muted">未設定</p>
        ) : (
          <div className="profile-text-fields">
            {filledFields.map(({ label, value }) => (
              <ProfileTextBlock key={label} label={label} value={value} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function SeekerProfileCareerView({ profile }: { profile: UserProfile }) {
  return (
    <>
      <ProfileTextSection profile={profile} />
      <section className="profile-section">
        <div className="profile-section-header">
          <p className="profile-section-title">希望条件</p>
        </div>
        <div className="profile-section-content profile-section-content--flush">
          <div className="profile-info-list">
          <ProfileInfoRow label="希望エリア" value={profile.area} />
          <ProfileInfoRow label="希望職種" value={profile.desiredJobType} />
          <ProfileInfoRow label="希望雇用形態" value={profile.employmentType} />
          <ProfileInfoRow label="社会人経験" value={profile.experience} />
          <ProfileInfoRow label="希望年収" value={profile.desiredSalary} />
          <ProfileInfoRow label="転職意欲" value={profile.jobSearchIntent} />
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-header">
          <p className="profile-section-title">職歴</p>
        </div>
        {profile.workHistory.length === 0 ? (
          <div className="profile-section-content">
            <p className="profile-field-value profile-field-value-muted">未設定</p>
          </div>
        ) : (
          <div className="profile-section-content profile-section-content--flush">
            <ul className="profile-info-list">
            {profile.workHistory.map((entry, index) => (
              <li key={`${entry.company}-${index}`} className="profile-work-item">
                <p className="profile-info-value">{entry.company || "—"}</p>
                <p className="profile-field-value">{entry.role || "—"}</p>
                <p className="profile-work-meta">{formatWorkPeriod(entry)}</p>
                {entry.description.trim() && (
                  <p className="profile-field-value profile-field-value-body mt-2 whitespace-pre-wrap">{entry.description}</p>
                )}
              </li>
            ))}
            </ul>
          </div>
        )}
      </section>

      <section className="profile-section">
        <div className="profile-section-header">
          <p className="profile-section-title">スキル</p>
        </div>
        <div className="profile-section-content profile-section-content--flush">
          {profile.skills.length === 0 ? (
            <p className="profile-field-value profile-field-value-muted px-4 pb-2">未設定</p>
          ) : (
            <ul className="profile-info-list">
              {profile.skills.map((skill, index) => (
                <li key={`${skill.name}-${index}`} className="profile-info-row">
                  <p className="profile-field-label">{skill.name}</p>
                  <p className={`profile-info-value ${skill.years ? "" : "is-empty"}`}>
                    {skill.years || "未設定"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
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
    <div className="profile-section mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="profile-section-title mb-3">プロフィール</p>
      <dl className="space-y-4">
        {filledTextFields.length > 0 && (
          <div className="profile-text-fields">
            {filledTextFields.map(({ label, value }) => (
              <div key={label}>
                <dt className="profile-field-label">{label}</dt>
                <dd className="profile-field-value profile-field-value-body mt-1 whitespace-pre-wrap">{value}</dd>
              </div>
            ))}
          </div>
        )}
        {(profile.desiredSalary || profile.jobSearchIntent) && (
          <div className="profile-info-list rounded-lg bg-white/60">
            {profile.desiredSalary && <ProfileInfoRow label="希望年収" value={profile.desiredSalary} />}
            {profile.jobSearchIntent && <ProfileInfoRow label="転職意欲" value={profile.jobSearchIntent} />}
          </div>
        )}
        {profile.skills.length > 0 && (
          <div>
            <dt className="profile-field-label">スキル</dt>
            <dd className="mt-2 space-y-2">
              {profile.skills.map((skill, index) => (
                <div
                  key={`${skill.name}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2"
                >
                  <span className="profile-info-value text-[#161823]">{skill.name}</span>
                  <span className="profile-work-meta">{skill.years || "—"}</span>
                </div>
              ))}
            </dd>
          </div>
        )}
        {profile.workHistory.length > 0 && (
          <div>
            <dt className="profile-field-label">職歴</dt>
            <dd className="mt-2 space-y-2">
              {profile.workHistory.map((entry, index) => (
                <div key={`${entry.company}-${index}`} className="rounded-lg bg-white/70 px-3 py-2.5">
                  <p className="profile-info-value text-[#161823]">
                    {entry.company} · {entry.role}
                  </p>
                  <p className="profile-work-meta">{formatWorkPeriod(entry)}</p>
                </div>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
