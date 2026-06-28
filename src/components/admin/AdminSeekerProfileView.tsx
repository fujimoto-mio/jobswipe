import type { UserProfile, WorkHistoryEntry } from "@/lib/types";

const PROFILE_TEXT_FIELDS = [
  { key: "introSentence", label: "一言紹介" },
  { key: "futureGoals", label: "今後やりたいこと" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<UserProfile, "introSentence" | "futureGoals">;
  label: string;
}>;

function CompanyProfileInfoRow({ label, value }: { label: string; value?: string }) {
  const display = value?.trim();
  return (
    <div className="company-profile-info-row">
      <div className="company-profile-info-label">{label}</div>
      <div className="company-profile-info-value">
        {display ? display : <span className="text-slate-400">未設定</span>}
      </div>
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

export function AdminSeekerProfileView({ profile }: { profile: UserProfile }) {
  const filledTextFields = PROFILE_TEXT_FIELDS.map(({ key, label }) => ({
    label,
    value: profile[key].trim(),
  })).filter((field) => field.value);

  return (
    <>
      <section className="company-profile-section">
        <div className="company-profile-section-header">
          <h2 className="company-profile-section-title">プロフィール</h2>
        </div>
        <div className="company-profile-section-body">
          {filledTextFields.length === 0 ? (
            <p className="company-profile-text company-profile-text--muted">未設定</p>
          ) : (
            filledTextFields.map(({ label, value }, index) => (
              <div
                key={label}
                className={`application-seeker-profile-block ${index > 0 ? "application-seeker-profile-block--divider" : ""}`}
              >
                <p className="application-seeker-profile-block-label">{label}</p>
                <p className="company-profile-text">{value}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="company-profile-section">
        <div className="company-profile-section-header">
          <h2 className="company-profile-section-title">希望条件</h2>
        </div>
        <div className="company-profile-section-body">
          <div className="company-profile-info-table">
            <CompanyProfileInfoRow label="希望エリア" value={profile.area} />
            <CompanyProfileInfoRow label="希望職種" value={profile.desiredJobType} />
            <CompanyProfileInfoRow label="希望雇用形態" value={profile.employmentType} />
            <CompanyProfileInfoRow label="社会人経験" value={profile.experience} />
            <CompanyProfileInfoRow label="希望年収" value={profile.desiredSalary} />
            <CompanyProfileInfoRow label="転職意欲" value={profile.jobSearchIntent} />
          </div>
        </div>
      </section>

      <section className="company-profile-section">
        <div className="company-profile-section-header">
          <h2 className="company-profile-section-title">職歴</h2>
        </div>
        <div className="company-profile-section-body">
          {profile.workHistory.length === 0 ? (
            <p className="company-profile-text company-profile-text--muted">未設定</p>
          ) : (
            <div className="application-seeker-work-list">
              {profile.workHistory.map((entry, index) => (
                <div key={`${entry.company}-${index}`} className="application-seeker-work-item">
                  <p className="font-semibold text-slate-900">{entry.company || "—"}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{entry.role || "—"}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatWorkPeriod(entry)}</p>
                  {entry.description.trim() && (
                    <p className="company-profile-text mt-3">{entry.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="company-profile-section">
        <div className="company-profile-section-header">
          <h2 className="company-profile-section-title">スキル</h2>
        </div>
        <div className="company-profile-section-body">
          {profile.skills.length === 0 ? (
            <p className="company-profile-text company-profile-text--muted">未設定</p>
          ) : (
            <div className="company-profile-info-table">
              {profile.skills.map((skill, index) => (
                <CompanyProfileInfoRow
                  key={`${skill.name}-${index}`}
                  label={skill.name}
                  value={skill.years}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
