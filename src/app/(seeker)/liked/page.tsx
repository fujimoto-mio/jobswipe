"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { Heart, MapPin, Briefcase, Trash2, Send, Search, MessageCircle, Eye } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage, AppBadge } from "@/components/ui/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import JobDetailModal from "@/components/JobDetailModal";
import ApplyModal from "@/components/ApplyModal";
import JobThumbnail from "@/components/JobThumbnail";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import type { Application, Job } from "@/lib/types";

export default function LikedPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicationByJobId, setApplicationByJobId] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  const fetchPageData = () => {
    return Promise.all([apiFetch("/api/saves"), apiFetch("/api/applications")]).then(
      async ([savesRes, applicationsRes]) => {
        const savesData = await savesRes.json();
        const applicationsData = await applicationsRes.json();
        setJobs(savesData.jobs ?? []);
        const applications = (applicationsData.applications ?? []) as Application[];
        setApplicationByJobId(new Map(applications.map((app) => [app.jobId, app.id])));
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    void fetchPageData();
  }, []);

  const handleRemove = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (jobs.length <= 1) return;
    await apiFetch("/api/saves", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    void fetchPageData();
  };

  return (
    <AppPage>
      <AppHeader
        title="保存した求人"
        onBack={() => router.push("/explore")}
        action={jobs.length > 0 ? <AppBadge>{jobs.length}件</AppBadge> : undefined}
      />

      <main className="page-main page-container py-4">
        {loading ? (
          <PageLoading message="保存した求人を読み込み中..." minHeight="min-h-[50vh]" />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="保存した求人はありません"
            description="右スワイプまたは保存ボタンで追加できます"
            action={
              <Link href="/explore" className="btn-primary flex items-center gap-2 px-8">
                <Search className="h-4 w-4" />
                求人を探す
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const applicationId = applicationByJobId.get(job.id);
              const applied = Boolean(applicationId);
              const deleteDisabled = jobs.length === 1;

              return (
              <div key={job.id} className="card flex gap-3 p-3 transition hover:shadow-md">
                <button type="button" onClick={() => setSelectedJob(job)} className="flex min-w-0 flex-1 gap-3 text-left">
                  <JobThumbnail job={job} className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover ring-1 ring-slate-100" />
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-xs font-medium text-slate-500">{job.company}</p>
                      {applied && <span className="badge badge-green shrink-0">応募済み</span>}
                    </div>
                    <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location.split("（")[0]}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-blue-600">
                        <Briefcase className="h-3 w-3" />
                        {job.salary}
                      </span>
                    </div>
                  </div>
                </button>
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className="btn-icon btn-icon-muted"
                    aria-label="求人を見る"
                    title="求人を見る"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {applied && applicationId ? (
                    <Link
                      href={`/chat?applicationId=${applicationId}`}
                      className="btn-icon btn-icon-primary"
                      aria-label="チャット"
                      title="チャット"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setApplyJob(job)}
                        className="btn-icon btn-icon-primary"
                        aria-label="応募"
                        title="応募"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, job.id)}
                        disabled={deleteDisabled}
                        className="btn-icon btn-icon-danger disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="削除"
                        title={deleteDisabled ? "最後の1件は削除できません" : "削除"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav saveCount={jobs.length} />

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isSaved={true}
          applied={applicationByJobId.has(selectedJob.id)}
          onClose={() => setSelectedJob(null)}
          onSave={() => {}}
          onApply={() => {
            if (applicationByJobId.has(selectedJob.id)) return;
            setSelectedJob(null);
            setApplyJob(selectedJob);
          }}
          chatHref={
            applicationByJobId.get(selectedJob.id)
              ? `/chat?applicationId=${applicationByJobId.get(selectedJob.id)}`
              : undefined
          }
        />
      )}

      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={() => {
            setApplyJob(null);
            void fetchPageData();
          }}
        />
      )}
    </AppPage>
  );
}
