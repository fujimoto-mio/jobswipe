"use client";

import Link from "next/link";
import {
  X,
  MapPin,
  Briefcase,
  CheckCircle,
  Gift,
  Send,
  Heart,
  FileText,
  MessageCircle,
  Volume2,
  VolumeX,
  Globe,
} from "lucide-react";
import { XBrandIcon, InstagramIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import { formatDateJST } from "@/lib/datetime";
import { useVideoPlayback } from "@/hooks/useVideoPlayback";
import SeekerBottomSheet from "@/components/seeker/SeekerBottomSheet";
import type { Job } from "@/lib/types";
import { jobTagLabel } from "@/lib/job-tags";

type JobDetailModalProps = {
  job: Job;
  isSaved?: boolean;
  applied?: boolean;
  chatHref?: string;
  onClose: () => void;
  onSave?: () => void;
  onApply: () => void;
};

function LinkItem({
  href,
  icon: Icon,
}: {
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-1 py-1.5 text-sm text-[#2563EB] transition hover:underline"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{href}</span>
    </a>
  );
}

export default function JobDetailModal({
  job,
  isSaved,
  applied = false,
  chatHref,
  onClose,
  onSave,
  onApply,
}: JobDetailModalProps) {
  const links = job.links ?? {};
  const { videoRef, isMuted, toggleMute } = useVideoPlayback({
    src: job.videoUrl,
    isActive: true,
    muted: true,
  });

  return (
    <SeekerBottomSheet
      onClose={onClose}
      panelClassName="job-detail-modal-panel relative max-h-[85vh] w-full max-w-3xl bg-white"
    >
        <div className="job-detail-modal-scroll max-h-[85vh] overflow-y-auto overflow-x-hidden">
          <div className="sticky top-0 z-30 h-0 overflow-visible">
            <button
              type="button"
              onClick={onClose}
              className="job-detail-modal-close absolute right-4 top-[max(0.75rem,env(safe-area-inset-top,0px))] flex h-11 w-11 items-center justify-center rounded-full border border-[var(--seeker-border,#e2e8f0)] bg-white text-[var(--seeker-text,#0f172a)] shadow-[0_2px_12px_rgba(15,23,42,0.18)] transition active:scale-95"
              aria-label="閉じる"
            >
              <X className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>

          <div className="relative aspect-video overflow-hidden">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              loop
              muted={isMuted}
              playsInline
              preload="auto"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            <button
              type="button"
              onClick={toggleMute}
              className="absolute left-4 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
              aria-label={isMuted ? "ミュート解除" : "ミュート"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
          </div>

          <div className="job-detail-modal-content p-6">
          <div className="mb-4 flex items-center gap-3">
            <img src={job.companyLogo} alt={job.company} className="h-12 w-12 rounded-xl object-cover" />
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">{job.title}</h2>
              <p className="text-sm text-[#64748B]">{job.company}</p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-[#334155]">
              <MapPin className="h-4 w-4 text-[#2563EB]" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <Briefcase className="h-4 w-4" />
              {job.salary}
            </span>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#2563EB]">
                {jobTagLabel(tag)}
              </span>
            ))}
          </div>

          <p className="mb-5 text-xs text-[#64748B]">掲載日: {formatDateJST(job.postedAt)}</p>

          <section className="mb-5">
            <h3 className="mb-2 text-sm font-semibold text-[#64748B]">仕事内容</h3>
            <p className="text-sm leading-relaxed text-[#334155]">{job.description}</p>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#64748B]">
              <CheckCircle className="h-4 w-4" />
              必須条件
            </h3>
            <ul className="space-y-1.5">
              {job.requirements.map((req) => (
                <li key={req} className="text-sm text-[#334155]">
                  {req}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#64748B]">
              <Gift className="h-4 w-4" />
              福利厚生
            </h3>
            <ul className="space-y-1.5">
              {job.benefits.map((benefit) => (
                <li key={benefit} className="text-sm text-[#334155]">
                  {benefit}
                </li>
              ))}
            </ul>
          </section>

          {(links.careersPage || links.twitter || links.instagram || links.linkedin) && (
            <section className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-[#64748B]">リンク</h3>
              <div className="grid gap-2">
                <LinkItem href={links.careersPage} icon={Globe} />
                <LinkItem href={links.twitter} icon={XBrandIcon} />
                <LinkItem href={links.instagram} icon={InstagramIcon} />
                <LinkItem href={links.linkedin} icon={LinkedinIcon} />
              </div>
            </section>
          )}

          <div className="flex gap-2">
            {onSave && (
              <button
                onClick={onSave}
                className={`btn-secondary flex-1 ${isSaved ? "border-[#fe2c55] text-[#fe2c55]" : ""}`}
              >
                <Heart
                  className={`h-4 w-4 fill-none ${isSaved ? "text-[#fe2c55]" : ""}`}
                  strokeWidth={2.25}
                />
                気になる
              </button>
            )}
            {applied && chatHref ? (
              <Link href={chatHref} className="btn-primary flex-1">
                <MessageCircle className="h-4 w-4" />
                チャット
              </Link>
            ) : (
              <button onClick={onApply} disabled={applied} className="btn-primary flex-1 disabled:opacity-50">
                <Send className="h-4 w-4" />
                {applied ? "応募済み" : "応募する"}
              </button>
            )}
          </div>

          <Link
            href={`/jobs/${job.id}`}
            className="mt-3 flex items-center justify-center gap-1 text-sm text-[#64748B] hover:text-[#2563EB]"
          >
            <FileText className="h-4 w-4" />
            詳細ページで見る
          </Link>
          </div>
        </div>
    </SeekerBottomSheet>
  );
}
