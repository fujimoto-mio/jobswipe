"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { Heart, MapPin, Briefcase, Trash2, Send, Search } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage, AppBadge } from "@/components/ui/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import JobDetailModal from "@/components/JobDetailModal";
import ApplyModal from "@/components/ApplyModal";
import JobThumbnail from "@/components/JobThumbnail";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import type { Job } from "@/lib/types";

export default function LikedPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  const fetchSaves = () => {
    apiFetch("/api/saves")
      .then((r) => r.json())
      .then((d) => {
        setJobs(d.jobs);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSaves();
  }, []);

  const handleRemove = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    await apiFetch("/api/saves", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    fetchSaves();
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
            {jobs.map((job) => (
              <div key={job.id} className="card flex gap-3 p-3 transition hover:shadow-md">
                <button onClick={() => setSelectedJob(job)} className="flex min-w-0 flex-1 gap-3 text-left">
                  <JobThumbnail job={job} className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover ring-1 ring-slate-100" />
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="truncate text-xs font-medium text-slate-500">{job.company}</p>
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
                    onClick={() => setApplyJob(job)}
                    className="btn-icon btn-icon-primary"
                    aria-label="応募"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleRemove(e, job.id)}
                    className="btn-icon btn-icon-danger"
                    aria-label="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav saveCount={jobs.length} />

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isSaved={true}
          onClose={() => setSelectedJob(null)}
          onSave={() => {}}
          onApply={() => {
            setSelectedJob(null);
            setApplyJob(selectedJob);
          }}
        />
      )}

      {applyJob && (
        <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} onSuccess={() => setApplyJob(null)} />
      )}
    </AppPage>
  );
}
