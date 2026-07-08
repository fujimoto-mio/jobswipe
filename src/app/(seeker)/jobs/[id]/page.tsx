"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  CheckCircle,
  Gift,
  Send,
  Heart,
  Volume2,
  VolumeX,
  Globe,
} from "lucide-react";
import { XBrandIcon, InstagramIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import ApplyModal from "@/components/ApplyModal";
import SeekerAccountMenu from "@/components/seeker/SeekerAccountMenu";
import { useVideoPlayback } from "@/hooks/useVideoPlayback";
import { apiFetch } from "@/lib/api-client";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { formatDateJST } from "@/lib/datetime";
import type { Job } from "@/lib/types";
import { jobTagLabel } from "@/lib/job-tags";

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
      className="flex items-center gap-2.5 px-1 py-1.5 text-sm text-blue-600 transition hover:underline active:scale-[0.98]"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate font-medium">{href}</span>
    </a>
  );
}

function JobDetailHero({ videoUrl, onBack }: { videoUrl: string; onBack: () => void }) {
  const { videoRef, isMuted, toggleMute } = useVideoPlayback({
    src: videoUrl,
    isActive: Boolean(videoUrl),
    muted: true,
  });

  return (
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
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-black/40" />
      <button
        type="button"
        onClick={onBack}
        className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
        aria-label="戻る"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      {videoUrl ? (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute right-16 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
          aria-label={isMuted ? "ミュート解除" : "ミュート"}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      ) : null}
      <div className="absolute right-4 top-4 z-10">
        <SeekerAccountMenu variant="overlay" />
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    Promise.all([apiFetch(`/api/jobs/${id}`), apiFetch("/api/saves?summary=1")]).then(async ([jobRes, savesRes]) => {
      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJob(jobData.job);
      }
      const savesData = await savesRes.json();
      setIsSaved(savesData.savedIds.includes(id));
      setLoading(false);
    });
  }, [params.id]);

  const handleSave = async () => {
    if (!job) return;
    const res = await apiFetch("/api/saves", {
      method: "POST",
      body: JSON.stringify({ jobId: job.id }),
    });
    const data = await res.json();
    setIsSaved(data.saved);
  };

  if (loading) {
    return (
      <div className="seeker-job-detail-page flex h-full items-center justify-center bg-slate-50">
        <PageLoading message="求人詳細を読み込み中..." />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="seeker-job-detail-page flex h-full flex-col items-center justify-center gap-4 bg-slate-50 px-6">
        <p className="font-medium text-slate-700">求人が見つかりません</p>
        <Link href="/explore" className="btn-primary px-8">
          トップへ戻る
        </Link>
      </div>
    );
  }

  const links = job.links ?? {};
  const videoUrl = job.videoUrl?.trim() ?? "";

  return (
    <div className="seeker-job-detail-page h-full overflow-y-auto bg-slate-50 pb-24">
      <JobDetailHero videoUrl={videoUrl} onBack={() => router.back()} />

      <div className="page-container py-0">
        <div className="card -mt-6 relative mb-5 p-5">
          <div className="flex items-start gap-3">
            <img src={job.companyLogo} alt={job.company} className="h-12 w-12 shrink-0 rounded-xl border border-slate-100 object-cover shadow-sm" />
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-snug text-slate-900">{job.title}</h1>
              <p className="mt-0.5 text-sm text-slate-500">{job.company}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="h-4 w-4 text-blue-600" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <Briefcase className="h-4 w-4" />
              {job.salary}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <span key={tag} className="badge badge-blue">{jobTagLabel(tag)}</span>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">掲載日: {formatDateJST(job.postedAt)}</p>
        </div>

        <section className="card mb-4 p-5">
          <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">仕事内容</h2>
          <p className="text-sm leading-relaxed text-slate-700">{job.description}</p>
        </section>

        <section className="card mb-4 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <CheckCircle className="h-3.5 w-3.5" />
            必須条件
          </h2>
          <ul className="space-y-2">
            {job.requirements.map((req) => (
              <li key={req} className="text-sm text-slate-700">
                {req}
              </li>
            ))}
          </ul>
        </section>

        <section className="card mb-4 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Gift className="h-3.5 w-3.5" />
            福利厚生
          </h2>
          <ul className="space-y-2">
            {job.benefits.map((benefit) => (
              <li key={benefit} className="text-sm text-slate-700">
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">リンク</h2>
          <div className="grid gap-2">
            <LinkItem href={links.careersPage} icon={Globe} />
            <LinkItem href={links.twitter} icon={XBrandIcon} />
            <LinkItem href={links.instagram} icon={InstagramIcon} />
            <LinkItem href={links.linkedin} icon={LinkedinIcon} />
          </div>
        </section>
      </div>

      <div className="seeker-job-detail-footer fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 py-4 backdrop-blur-xl">
        <div className="page-container flex gap-2.5">
          <button
            onClick={handleSave}
            className={`btn-secondary flex-1 ${isSaved ? "border-blue-300 text-blue-600" : ""}`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-blue-600" : ""}`} />
            気になる
          </button>
          <button onClick={() => setApplyOpen(true)} className="btn-primary flex-1">
            <Send className="h-4 w-4" />
            応募する
          </button>
        </div>
      </div>

      <AnimatePresence>
        {applyOpen && (
          <ApplyModal
            key={job.id}
            job={job}
            onClose={() => setApplyOpen(false)}
            onSuccess={() => setApplyOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
