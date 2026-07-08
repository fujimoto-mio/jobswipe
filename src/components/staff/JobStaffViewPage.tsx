"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Pencil,
  Volume2,
  VolumeX,
} from "lucide-react";
import JobApprovalConfirmModal from "@/components/admin/JobApprovalConfirmModal";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { formatDateTimeJST } from "@/lib/datetime";
import { JOB_APPROVAL_BADGE_CLASS, JOB_APPROVAL_LABELS } from "@/lib/constants";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { useVideoPlayback } from "@/hooks/useVideoPlayback";
import { apiFetch } from "@/lib/api-client";
import type { Job, JobApprovalStatus, JobSubmissionContent } from "@/lib/types";
import { jobTagLabel } from "@/lib/job-tags";

const APPROVAL_BADGE = JOB_APPROVAL_BADGE_CLASS;

function JobViewHero({
  job,
}: {
  job: Job;
}) {
  const videoUrl = job.videoUrl?.trim() ?? "";
  const { videoRef, isMuted, toggleMute } = useVideoPlayback({
    src: videoUrl,
    isActive: Boolean(videoUrl),
    muted: true,
  });

  return (
    <section className="company-profile-hero overflow-hidden">
      <div className="relative h-52 bg-slate-900 sm:h-60">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 h-full w-full object-cover"
            loop
            muted={isMuted}
            playsInline
            preload="auto"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200" />
        )}

        <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-slate-900/50 via-transparent to-black/40" />

        {videoUrl && (
          <button
            type="button"
            onClick={toggleMute}
            className="absolute right-4 top-4 z-[10] flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
            aria-label={isMuted ? "ミュート解除" : "ミュート"}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        )}
      </div>
    </section>
  );
}

function JobDetailBody({
  job,
  extraBadge,
}: {
  job: Job;
  extraBadge?: { label: string; className: string };
}) {
  return (
    <>
      <section className="company-profile-section">
        <div className="company-profile-section-header">
          <div className="flex items-start gap-4">
            <img
              src={job.companyLogo}
              alt={job.company}
              className="h-12 w-12 shrink-0 rounded-xl border border-slate-100 object-cover shadow-sm"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-start gap-2">
                <h1 className="company-profile-section-title">{job.title}</h1>
                <span className={`badge shrink-0 ${APPROVAL_BADGE[job.approvalStatus]}`}>
                  {JOB_APPROVAL_LABELS[job.approvalStatus]}
                </span>
                {extraBadge && (
                  <span className={`badge shrink-0 ${extraBadge.className}`}>{extraBadge.label}</span>
                )}
              </div>
              <p className="text-sm text-slate-500">{job.company}</p>
            </div>
          </div>
        </div>
        <div className="company-profile-section-body">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="h-4 w-4 text-blue-600" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <Briefcase className="h-4 w-4" />
              {job.salary}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            {job.category} · {job.employmentType}
          </p>

          {job.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span key={tag} className="badge badge-blue">
                  {jobTagLabel(tag)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-1 text-xs text-slate-400">
            <p>掲載日: {formatDateTimeJST(job.postedAt)}</p>
            <p>承認日: {job.approvedAt ? formatDateTimeJST(job.approvedAt) : "—"}</p>
          </div>
        </div>
      </section>

      <section className="company-profile-section">
        <div className="company-profile-section-header">
          <h2 className="company-profile-section-title">仕事内容</h2>
        </div>
        <div className="company-profile-section-body">
          <p className="company-profile-text whitespace-pre-wrap">{job.description}</p>
        </div>
      </section>

      {job.requirements.length > 0 && (
        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">必須条件</h2>
          </div>
          <div className="company-profile-section-body">
            <ul className="space-y-2">
              {job.requirements.map((req) => (
                <li key={req} className="company-profile-text">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {job.benefits.length > 0 && (
        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">福利厚生</h2>
          </div>
          <div className="company-profile-section-body">
            <ul className="space-y-2">
              {job.benefits.map((benefit) => (
                <li key={benefit} className="company-profile-text">
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

type JobStaffViewPageProps = {
  jobId: string;
};

type AdminViewMode = "published" | "review";

export default function JobStaffViewPage({ jobId }: JobStaffViewPageProps) {
  const router = useRouter();
  const { basePath, role } = useStaffPanel();
  const isAdmin = role === "admin";

  const [job, setJob] = useState<Job | null>(null);
  const [reviewJob, setReviewJob] = useState<Job | null>(null);
  const [pendingSubmission, setPendingSubmission] = useState<JobSubmissionContent | null>(null);
  const [viewMode, setViewMode] = useState<AdminViewMode>("review");
  const [loading, setLoading] = useState(true);
  const [pendingApproval, setPendingApproval] = useState<{
    job: Job;
    action: Extract<JobApprovalStatus, "Active" | "Cancelled">;
    kind: "job" | "revision";
    targetId: string;
  } | null>(null);

  const loadJob = () =>
    apiFetch(`/api/jobs/${jobId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => {
        const loadedJob = d.job as Job;
        const loadedReviewJob = (d.reviewJob as Job | null) ?? null;
        setJob(loadedJob);
        setReviewJob(loadedReviewJob);
        setPendingSubmission((d.pendingSubmission as JobSubmissionContent | null) ?? null);
        if (loadedReviewJob) {
          setViewMode("review");
        }
      });

  useEffect(() => {
    loadJob()
      .catch(() => router.replace(`${basePath}/jobs`))
      .finally(() => setLoading(false));
  }, [jobId, router, basePath]);

  if (loading || !job) {
    return <PageLoading message="求人詳細を読み込み中..." minHeight="min-h-[320px]" />;
  }

  const canReviewJob = isAdmin && job.approvalStatus === "Pending";
  const canReviewRevision = isAdmin && Boolean(pendingSubmission);
  const hasPublishedAndReview = canReviewRevision && job.approvalStatus === "Active";
  const displayJob =
    isAdmin && viewMode === "review" && reviewJob ? reviewJob : job;
  const showReviewActions =
    isAdmin &&
    ((canReviewJob && !hasPublishedAndReview) ||
      (canReviewRevision && viewMode === "review"));

  const updateApproval = async (
    kind: "job" | "revision",
    targetId: string,
    action: Extract<JobApprovalStatus, "Active" | "Cancelled">
  ) => {
    const res = await apiFetch(
      kind === "job" ? "/api/admin/jobs" : "/api/admin/job-submissions",
      {
        method: "PATCH",
        body: JSON.stringify(
          kind === "job"
            ? { id: targetId, approvalStatus: action }
            : { kind: "revision", id: targetId, action: action === "Active" ? "approve" : "reject" }
        ),
      }
    );
    if (!res.ok) {
      throw new Error("approval update failed");
    }
    router.push(`${basePath}/jobs`);
  };

  const toolbarNote = isAdmin
    ? viewMode === "review" && reviewJob
      ? hasPublishedAndReview
        ? "変更申請内容のプレビュー（管理者審査）"
        : "投稿申請内容のプレビュー（管理者審査）"
      : "現在公開中の内容"
    : "求職者向けページのプレビュー";

  return (
    <div className="company-profile-page staff-ui">
      <Link href={`${basePath}/jobs`} className="staff-back-link mb-4 inline-flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        求人一覧に戻る
      </Link>

      <p className="company-profile-toolbar-note mb-4">{toolbarNote}</p>

      {hasPublishedAndReview && (
        <div className="mb-4 flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setViewMode("review")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              viewMode === "review"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            申請内容
          </button>
          <button
            type="button"
            onClick={() => setViewMode("published")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              viewMode === "published"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            公開中
          </button>
        </div>
      )}

      <JobViewHero job={displayJob} />

      <div className="mt-4 flex flex-col gap-4">
        <JobDetailBody
          job={displayJob}
          extraBadge={
            hasPublishedAndReview && viewMode === "review"
              ? { label: "変更申請中", className: "badge-amber" }
              : undefined
          }
        />

        {showReviewActions && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setPendingApproval({
                  job: displayJob,
                  action: "Cancelled",
                  kind: canReviewRevision ? "revision" : "job",
                  targetId: canReviewRevision ? pendingSubmission!.id : job.id,
                })
              }
              className="staff-ui btn-secondary w-full py-3"
            >
              差し戻す
            </button>
            <button
              type="button"
              onClick={() =>
                setPendingApproval({
                  job: displayJob,
                  action: "Active",
                  kind: canReviewRevision ? "revision" : "job",
                  targetId: canReviewRevision ? pendingSubmission!.id : job.id,
                })
              }
              className="staff-ui btn-primary w-full py-3"
            >
              承認する
            </button>
          </div>
        )}

        {!isAdmin && (
          <Link
            href={`${basePath}/jobs/${job.id}/edit`}
            className="staff-ui btn-primary flex w-full items-center justify-center gap-2 py-3"
          >
            <Pencil className="h-4 w-4" />
            {job.approvalStatus === "Active" ? "変更を申請" : "求人を編集"}
          </Link>
        )}
      </div>

      <AnimatePresence>
        {pendingApproval && (
          <JobApprovalConfirmModal
            key={`${pendingApproval.targetId}-${pendingApproval.action}`}
            job={pendingApproval.job}
            action={pendingApproval.action}
            kind={pendingApproval.kind}
            onClose={() => setPendingApproval(null)}
            onConfirm={() =>
              updateApproval(
                pendingApproval.kind,
                pendingApproval.targetId,
                pendingApproval.action
              )
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
