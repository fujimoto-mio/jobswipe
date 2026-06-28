"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SeekerProfileCareerSummary } from "@/components/seeker/SeekerProfileSections";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatBirthdayDisplay } from "@/lib/birthday";
import type { ApplicationStatus, ApplicationWithSeeker, SeekerProfileDetail } from "@/lib/types";

export const APPLICATION_STATUS_CHIP_COLORS: Record<ApplicationStatus, string> = {
  new: "badge-amber",
  scheduling: "badge-blue",
  interview_done: "bg-violet-100 text-violet-700",
  hired: "badge-green",
  rejected: "badge-red",
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

function ApplicationMessageSection({ message }: { message?: string }) {
  return (
    <section className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">応募メッセージ</p>
      {message ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--body)]">{message}</p>
      ) : (
        <p className="text-sm text-[var(--muted)]">メッセージはありません</p>
      )}
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
}: {
  application: ApplicationWithSeeker;
  seeker?: SeekerProfileDetail;
  basePath: string;
  isCompany: boolean;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  showChatLink?: boolean;
}) {
  return (
    <>
      <ApplicationMessageSection message={application.message} />

      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-[var(--muted)]">性別</dt>
          <dd className="font-medium text-[var(--body)]">{seeker?.gender ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">生年月日</dt>
          <dd className="font-medium text-[var(--body)]">
            {formatBirthdayDisplay(application.applicantBirthday ?? seeker?.birthday)}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">希望エリア</dt>
          <dd className="font-medium text-[var(--body)]">{application.applicantArea ?? seeker?.area ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">希望職種</dt>
          <dd className="font-medium text-[var(--body)]">
            {application.applicantJobType ?? seeker?.desiredJobType ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">経験歴</dt>
          <dd className="font-medium text-[var(--body)]">{seeker?.experience ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">雇用形態</dt>
          <dd className="font-medium text-[var(--body)]">{seeker?.employmentType ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">最終学歴</dt>
          <dd className="font-medium text-[var(--body)]">{seeker?.education || "—"}</dd>
        </div>
      </dl>

      {seeker && <SeekerProfileCareerSummary profile={seeker} />}

      <div className="staff-ui mt-4 flex flex-wrap items-center gap-2">
        {APPLICATION_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onUpdateStatus(application.id, s)}
            className={`chip ${application.status === s ? "chip-active" : ""}`}
          >
            {APPLICATION_STATUS_LABELS[s]}
          </button>
        ))}
        {isCompany && showChatLink && (
          <ChatOpenLink
            basePath={basePath}
            jobId={application.jobId}
            applicationId={application.id}
            className="ml-auto"
          />
        )}
      </div>
    </>
  );
}
