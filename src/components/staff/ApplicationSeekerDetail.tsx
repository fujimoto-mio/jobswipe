"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import {
  ProfileInfoRow,
  SeekerProfileCareerView,
} from "@/components/seeker/SeekerProfileSections";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatBirthdayDisplay } from "@/lib/birthday";
import { formatDateJST } from "@/lib/datetime";
import type {
  ApplicationStatus,
  ApplicationWithSeeker,
  SeekerProfileDetail,
  UserProfile,
} from "@/lib/types";

export const APPLICATION_STATUS_CHIP_COLORS: Record<ApplicationStatus, string> = {
  new: "badge-amber",
  scheduling: "badge-blue",
  interview_done: "bg-violet-100 text-violet-700",
  hired: "badge-green",
  rejected: "badge-red",
};

const APPLICATION_STATUS_PILL_COLORS: Record<ApplicationStatus, string> = {
  new: "bg-amber-50 text-amber-700",
  scheduling: "bg-blue-50 text-blue-700",
  interview_done: "bg-violet-50 text-violet-700",
  hired: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
};

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "new",
  "scheduling",
  "interview_done",
  "hired",
  "rejected",
];

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

function ApplicationSeekerHero({
  application,
  showMeta = true,
}: {
  application: ApplicationWithSeeker;
  showMeta?: boolean;
}) {
  return (
    <div className="application-seeker-hero">
      <div className="application-seeker-avatar">
        {application.applicantName.trim().charAt(0) || "?"}
      </div>
      <h2 className="application-seeker-name">{application.applicantName}</h2>
      <p className="application-seeker-email">{application.applicantEmail}</p>
      {showMeta && (
        <div className="application-seeker-meta">
          <span
            className={`application-seeker-status-pill ${APPLICATION_STATUS_PILL_COLORS[application.status]}`}
          >
            {APPLICATION_STATUS_LABELS[application.status]}
          </span>
          <span className="application-seeker-applied-date">
            応募日: {formatDateJST(application.createdAt)}
          </span>
        </div>
      )}
    </div>
  );
}

function ApplicationMessageSection({ message }: { message?: string }) {
  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <p className="profile-section-title">応募メッセージ</p>
      </div>
      <div className="profile-section-content">
        {message ? (
          <p className="profile-field-value profile-field-value-body whitespace-pre-wrap">{message}</p>
        ) : (
          <p className="profile-field-value profile-field-value-muted">メッセージはありません</p>
        )}
      </div>
    </section>
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

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <p className="profile-section-title">登録情報</p>
      </div>
      <div className="profile-section-content profile-section-content--flush">
        <div className="profile-info-list">
          <ProfileInfoRow label="性別" value={seeker?.gender ?? ""} />
          <ProfileInfoRow label="生年月日" value={birthday === "—" ? "" : birthday} />
          <ProfileInfoRow label="最終学歴" value={seeker?.education ?? ""} />
          <div className="px-4 pb-4 pt-2">
            <p className="profile-field-label">メール</p>
            <p className="profile-field-value break-all">{application.applicantEmail}</p>
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
    <section className="profile-section application-seeker-detail-actions">
      <div className="profile-section-header">
        <p className="profile-section-title">選考ステータス</p>
      </div>
      <div className="profile-section-content">
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
      className={`application-seeker-detail profile-page ${
        layout === "embedded"
          ? "application-seeker-detail--embedded"
          : layout === "modal"
            ? "application-seeker-detail--modal"
            : ""
      }`}
    >
      {showHero && (
        <ApplicationSeekerHero application={application} showMeta={layout !== "embedded"} />
      )}

      <ApplicationMessageSection message={application.message} />

      {displayProfile && <SeekerProfileCareerView profile={displayProfile} />}

      <ApplicationRegistrationSection application={application} seeker={seeker} />

      <ApplicationStatusSection
        application={application}
        basePath={basePath}
        isCompany={isCompany}
        onUpdateStatus={onUpdateStatus}
        showChatLink={showChatLink}
      />
    </div>
  );
}
