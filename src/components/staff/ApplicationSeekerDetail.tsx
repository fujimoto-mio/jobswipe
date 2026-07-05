"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatBirthdayDisplay } from "@/lib/birthday";
import { formatDateJST } from "@/lib/datetime";
import type {
  ApplicationStatus,
  ApplicationWithSeeker,
  SeekerProfileDetail,
  UserProfile,
  WorkHistoryEntry,
} from "@/lib/types";

export const APPLICATION_STATUS_CHIP_COLORS: Record<ApplicationStatus, string> = {
  new: "badge-amber",
  scheduling: "badge-blue",
  interview_done: "bg-violet-100 text-violet-700",
  hired: "badge-green",
  rejected: "badge-red",
};

const APPLICATION_STATUS_PILL_CLASS: Record<ApplicationStatus, string> = {
  new: "application-seeker-status-pill--new",
  scheduling: "application-seeker-status-pill--scheduling",
  interview_done: "application-seeker-status-pill--interview",
  hired: "application-seeker-status-pill--hired",
  rejected: "application-seeker-status-pill--rejected",
};

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "new",
  "scheduling",
  "interview_done",
  "hired",
  "rejected",
];

const PROFILE_TEXT_FIELDS = [
  { key: "introSentence", label: "一言紹介" },
  { key: "futureGoals", label: "今後やりたいこと" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<UserProfile, "introSentence" | "futureGoals">;
  label: string;
}>;

export function ChatOpenLink({
  basePath,
  applicationId,
  jobId,
  className = "",
}: {
  basePath: string;
  applicationId: string;
  jobId: string;
  className?: string;
}) {
  const params = new URLSearchParams({ jobId, applicationId });
  return (
    <Link
      href={`${basePath}/chat?${params.toString()}`}
      className={`staff-ui btn-primary flex shrink-0 items-center gap-2 px-4 py-2 text-sm ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <MessageCircle className="h-4 w-4" />
      チャットを開く
    </Link>
  );
}

function buildDisplayProfile(
  application: ApplicationWithSeeker,
  seeker?: SeekerProfileDetail
): UserProfile | null {
  if (!seeker) return null;
  return {
    ...seeker,
    area: application.applicantArea ?? seeker.area,
    desiredJobType: application.applicantJobType ?? seeker.desiredJobType,
    birthday: application.applicantBirthday ?? seeker.birthday,
  };
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

function CompanyProfileInfoRow({ label, value }: { label: string; value?: string }) {
  const display = value?.trim();
  return (
    <div className="company-profile-info-row">
      <div className="company-profile-info-label">{label}</div>
      <div className="company-profile-info-value">
        {display ? display : <span className="company-profile-text--muted">未設定</span>}
      </div>
    </div>
  );
}

function ApplicationSeekerHero({
  application,
  showMeta = true,
}: {
  application: ApplicationWithSeeker;
  showMeta?: boolean;
}) {
  return (
    <div className="application-seeker-hero company-profile-section">
      <div className="company-profile-section-body flex flex-col items-center text-center">
        <div className="application-seeker-avatar">
          {application.applicantName.trim().charAt(0) || "?"}
        </div>
        <h2 className="application-seeker-name">{application.applicantName}</h2>
        <p className="application-seeker-email">{application.applicantEmail}</p>
        {showMeta && (
          <div className="application-seeker-meta">
            <span
              className={`application-seeker-status-pill ${APPLICATION_STATUS_PILL_CLASS[application.status]}`}
            >
              {APPLICATION_STATUS_LABELS[application.status]}
            </span>
            <span className="application-seeker-applied-date">
              応募日: {formatDateJST(application.createdAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationMessageSection({ message }: { message?: string }) {
  return (
    <section className="company-profile-section">
      <div className="company-profile-section-header">
        <h2 className="company-profile-section-title">応募メッセージ</h2>
      </div>
      <div className="company-profile-section-body">
        {message ? (
          <p className="company-profile-text">{message}</p>
        ) : (
          <p className="company-profile-text company-profile-text--muted">メッセージはありません</p>
        )}
      </div>
    </section>
  );
}

function SeekerApplicationProfileView({ profile }: { profile: UserProfile }) {
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
                  <p className="application-seeker-work-item-company">{entry.company || "—"}</p>
                  <p className="application-seeker-work-item-role">{entry.role || "—"}</p>
                  <p className="application-seeker-work-item-period">{formatWorkPeriod(entry)}</p>
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

function ApplicationRegistrationSection({
  application,
  seeker,
}: {
  application: ApplicationWithSeeker;
  seeker?: SeekerProfileDetail;
}) {
  const birthday = formatBirthdayDisplay(application.applicantBirthday ?? seeker?.birthday);
  const birthdayValue = birthday === "—" ? "" : birthday;

  return (
    <section className="company-profile-section">
      <div className="company-profile-section-header">
        <h2 className="company-profile-section-title">登録情報</h2>
      </div>
      <div className="company-profile-section-body">
        <div className="company-profile-info-table">
          <CompanyProfileInfoRow label="性別" value={seeker?.gender} />
          <CompanyProfileInfoRow label="生年月日" value={birthdayValue} />
          <CompanyProfileInfoRow label="最終学歴" value={seeker?.education} />
          <CompanyProfileInfoRow label="電話番号" value={seeker?.phone} />
          <CompanyProfileInfoRow label="住所" value={seeker?.address} />
          <div className="company-profile-info-row">
            <div className="company-profile-info-label">メール</div>
            <div className="company-profile-info-value break-all">{application.applicantEmail}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ApplicationStatusSection({
  application,
  basePath,
  isCompany,
  onUpdateStatus,
  showChatLink,
}: {
  application: ApplicationWithSeeker;
  basePath: string;
  isCompany: boolean;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  showChatLink: boolean;
}) {
  return (
    <section className="company-profile-section application-seeker-detail-actions">
      <div className="company-profile-section-header">
        <h2 className="company-profile-section-title">選考ステータス</h2>
      </div>
      <div className="company-profile-section-body">
        <div className="application-seeker-status-chips">
          {APPLICATION_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onUpdateStatus(application.id, s)}
              className={`application-seeker-status-chip ${
                application.status === s ? "application-seeker-status-chip-active" : ""
              }`}
            >
              {APPLICATION_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        {isCompany && showChatLink && (
          <div className="mt-4">
            <ChatOpenLink
              basePath={basePath}
              jobId={application.jobId}
              applicationId={application.id}
              className="w-full justify-center sm:w-auto"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function ApplicationDetailBody({
  application,
  seeker,
  basePath,
  isCompany,
  onUpdateStatus,
  showChatLink = true,
  showHero = true,
  layout = "card",
}: {
  application: ApplicationWithSeeker;
  seeker?: SeekerProfileDetail;
  basePath: string;
  isCompany: boolean;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  showChatLink?: boolean;
  showHero?: boolean;
  layout?: "embedded" | "modal" | "card";
}) {
  const displayProfile = buildDisplayProfile(application, seeker);

  return (
    <div
      className={`application-seeker-detail ${
        layout === "embedded"
          ? "application-seeker-detail--embedded"
          : layout === "modal"
            ? "application-seeker-detail--modal"
            : "application-seeker-detail--card"
      }`}
    >
      <div className="application-seeker-detail-sections">
        {showHero && (
          <ApplicationSeekerHero application={application} showMeta={layout !== "embedded"} />
        )}

        <ApplicationMessageSection message={application.message} />

        {displayProfile && <SeekerApplicationProfileView profile={displayProfile} />}

        <ApplicationRegistrationSection application={application} seeker={seeker} />

        <ApplicationStatusSection
          application={application}
          basePath={basePath}
          isCompany={isCompany}
          onUpdateStatus={onUpdateStatus}
          showChatLink={showChatLink}
        />
      </div>
    </div>
  );
}
