"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  CheckCircle,
  Gift,
  ExternalLink,
  Pencil,
  Play,
} from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { formatDateTimeJST } from "@/lib/datetime";
import { JOB_APPROVAL_LABELS } from "@/lib/constants";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import type { Job } from "@/lib/types";

const APPROVAL_BADGE: Record<Job["approvalStatus"], string> = {
  pending: "badge-amber",
  approved: "badge-green",
  rejected: "badge-red",
};

function LinkItem({ href, label }: { href?: string; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition active:scale-[0.98] hover:bg-slate-50"
    >
      <ExternalLink className="h-4 w-4 shrink-0" />
      {label}
    </a>
  );
}

function JobViewHero({
  job,
  basePath,
}: {
  job: Job;
  basePath: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoUrl = job.videoUrl?.trim() ?? "";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setIsPlaying(false);
  }, [videoUrl]);

  const togglePlay = () => {
    if (!videoUrl) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  return (
    <div className="relative h-52 bg-slate-200 sm:h-60">
      {!isPlaying && (
        <img src={job.thumbnailUrl} alt={job.title} className="h-full w-full object-cover" />
      )}

      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          preload="metadata"
          controls={isPlaying}
          className={`absolute inset-0 h-full w-full object-cover ${isPlaying ? "z-[2]" : "pointer-events-none z-[1] opacity-0"}`}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {!isPlaying && (
        <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-slate-50 via-transparent to-black/40" />
      )}

      <Link
        href={`${basePath}/jobs`}
        className="absolute left-4 top-4 z-[10] flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
        aria-label="求人一覧に戻る"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      {videoUrl && !isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-[5] flex items-center justify-center"
          aria-label="再生"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2563eb] shadow-lg shadow-blue-600/40 ring-4 ring-white transition active:scale-95">
            <Play className="ml-1 h-8 w-8 fill-white text-white" strokeWidth={1.5} />
          </span>
        </button>
      )}
    </div>
  );
}

type JobStaffViewPageProps = {
  jobId: string;
};

export default function JobStaffViewPage({ jobId }: JobStaffViewPageProps) {
  const router = useRouter();
  const { basePath } = useStaffPanel();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/jobs/${jobId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => setJob(d.job))
      .catch(() => router.replace(`${basePath}/jobs`))
      .finally(() => setLoading(false));
  }, [jobId, router, basePath]);

  if (loading || !job) {
    return <PageLoading message="求人詳細を読み込み中..." minHeight="min-h-[320px]" />;
  }

  const links = job.links ?? {};
  const canEdit = job.approvalStatus !== "approved";
  const hasLinks =
    links.website ||
    links.careersPage ||
    links.twitter ||
    links.instagram ||
    links.linkedin ||
    links.jobPdf;

  return (
    <div className="staff-ui -mx-4 overflow-hidden rounded-2xl bg-slate-50 sm:mx-0">
      <JobViewHero job={job} basePath={basePath} />

      <div className="px-4 pb-8 pt-3 sm:px-0">
        <div className="card relative -mt-4 mb-5 p-5 pt-7">
          <div className="flex items-start gap-4">
            <img
              src={job.companyLogo}
              alt={job.company}
              className="h-12 w-12 shrink-0 rounded-xl border border-slate-100 object-cover shadow-sm"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-start gap-2">
                <h1 className="text-lg font-bold leading-snug text-slate-900">{job.title}</h1>
                <span className={`badge shrink-0 ${APPROVAL_BADGE[job.approvalStatus]}`}>
                  {JOB_APPROVAL_LABELS[job.approvalStatus]}
                </span>
              </div>
              <p className="text-sm text-slate-500">{job.company}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
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
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-1 text-xs text-slate-400">
            <p>掲載日: {formatDateTimeJST(job.postedAt)}</p>
            <p>承認日: {job.approvedAt ? formatDateTimeJST(job.approvedAt) : "—"}</p>
          </div>
        </div>

        <section className="card mb-4 p-5">
          <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">仕事内容</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{job.description}</p>
        </section>

        {job.requirements.length > 0 && (
          <section className="card mb-4 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <CheckCircle className="h-3.5 w-3.5" />
              必須条件
            </h2>
            <ul className="space-y-2">
              {job.requirements.map((req) => (
                <li key={req} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  {req}
                </li>
              ))}
            </ul>
          </section>
        )}

        {job.benefits.length > 0 && (
          <section className="card mb-4 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Gift className="h-3.5 w-3.5" />
              福利厚生
            </h2>
            <ul className="space-y-2">
              {job.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasLinks && (
          <section className="mb-4">
            <h2 className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">リンク</h2>
            <div className="grid gap-2">
              <LinkItem href={links.website} label="企業HP" />
              <LinkItem href={links.careersPage} label="採用ページ" />
              <LinkItem href={links.twitter} label="Twitter / X" />
              <LinkItem href={links.instagram} label="Instagram" />
              <LinkItem href={links.linkedin} label="LinkedIn" />
              <LinkItem href={links.jobPdf} label="求人票・募集要項PDF" />
            </div>
          </section>
        )}

        {canEdit && (
          <Link
            href={`${basePath}/jobs/${job.id}/edit`}
            className="staff-ui btn-primary mt-2 flex w-full items-center justify-center gap-2 py-3"
          >
            <Pencil className="h-4 w-4" />
            求人を編集
          </Link>
        )}
      </div>
    </div>
  );
}
