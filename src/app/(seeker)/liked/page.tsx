"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { Heart, MapPin, Briefcase, Trash2, Send, Search, MessageCircle, Eye } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage, AppBadge } from "@/components/ui/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import JobThumbnail from "@/components/JobThumbnail";
import SeekerListPagination from "@/components/seeker/SeekerListPagination";
import SeekerSearchBar from "@/components/seeker/SeekerSearchBar";
import LoadingSpinner, { PageLoading } from "@/components/ui/LoadingSpinner";
import { usePaginatedTable } from "@/hooks/usePaginatedTable";
import { useSeekerBadges } from "@/components/seeker/SeekerBadgeProvider";
import type { Application, Job } from "@/lib/types";

const JobDetailModal = dynamic(() => import("@/components/JobDetailModal"), { ssr: false });
const ApplyModal = dynamic(() => import("@/components/ApplyModal"), { ssr: false });

const DEFAULT_PAGE_SIZE = 10;

export default function LikedPage() {
  const router = useRouter();
  const { saveCount: navSaveCount, chatCount, applySavesUpdate } = useSeekerBadges();
  const [applicationByJobId, setApplicationByJobId] = useState<Map<string, string>>(new Map());
  const [applicationsReady, setApplicationsReady] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  const table = usePaginatedTable<Job>({
    fetchUrl: "/api/saves",
    buildQuery: ({ page, pageSize, search }) => ({
      page: String(page),
      limit: String(pageSize),
      search: search || undefined,
    }),
    parseResponse: (data) => {
      const payload = data as { items?: Job[]; total?: number; count?: number };
      return {
        items: Array.isArray(payload.items) ? payload.items : [],
        total: typeof payload.total === "number" ? payload.total : 0,
        meta: { count: payload.count },
      };
    },
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  const saveCount = typeof table.meta.count === "number" ? table.meta.count : table.total;

  useEffect(() => {
    void apiFetch("/api/applications")
      .then((res) => res.json())
      .then((data) => {
        const applications = (data.applications ?? []) as Application[];
        setApplicationByJobId(new Map(applications.map((app) => [app.jobId, app.id])));
      })
      .finally(() => setApplicationsReady(true));
  }, []);

  const handleRemove = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (saveCount <= 1) return;
    const res = await apiFetch("/api/saves", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    const data = await res.json();
    if (Array.isArray(data.savedIds) && typeof data.count === "number") {
      applySavesUpdate(data.savedIds, data.count);
    }
    await table.refetch();
  };

  const initialLoading = table.loading && table.items.length === 0 && !table.searchInput;
  const hasSavedJobs = saveCount > 0 || (table.loading && table.searchInput.length > 0);
  const showSearchEmpty =
    !table.loading && table.total === 0 && table.searchInput.trim().length > 0;

  return (
    <AppPage>
      <AppHeader
        title="保存した求人"
        onBack={() => router.push("/explore")}
        action={saveCount > 0 ? <AppBadge>{saveCount}件</AppBadge> : undefined}
      />

      <main className="page-main page-container py-4">
        {!applicationsReady || initialLoading ? (
          <PageLoading message="保存した求人を読み込み中..." minHeight="min-h-[50vh]" />
        ) : !hasSavedJobs && saveCount === 0 ? (
          <EmptyState
            variant="seeker"
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
          <>
            <SeekerSearchBar
              value={table.searchInput}
              onChange={table.setSearchInput}
              placeholder="求人名・企業名で検索"
            />

            {showSearchEmpty ? (
              <EmptyState
                variant="seeker"
                icon={Search}
                title="該当する求人がありません"
                description="検索キーワードを変えてお試しください"
                action={
                  <button type="button" onClick={() => table.setSearchInput("")} className="btn-secondary px-8">
                    検索をクリア
                  </button>
                }
              />
            ) : table.loading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <LoadingSpinner size="lg" message="データを読み込み中..." />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {table.items.map((job) => {
                    const applicationId = applicationByJobId.get(job.id);
                    const applied = Boolean(applicationId);
                    const deleteDisabled = saveCount <= 1;

                    return (
                      <div key={job.id} className="card flex flex-col gap-3 p-3 transition hover:shadow-md md:flex-row md:items-center">
                        <button type="button" onClick={() => setSelectedJob(job)} className="flex min-w-0 flex-1 gap-3 text-left">
                          <JobThumbnail
                            job={job}
                            className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover ring-1 ring-slate-100"
                            showLogoBadge={false}
                          />
                          <div className="min-w-0 flex-1 py-0.5">
                            <div className="flex flex-wrap items-start gap-2">
                              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{job.title}</h3>
                              {applied && <span className="badge badge-green shrink-0">応募済み</span>}
                            </div>
                            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{job.company}</p>
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
                        <div className="seeker-saved-job-actions flex flex-row items-center gap-2 pl-[84px] md:shrink-0 md:pl-0">
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

                <SeekerListPagination
                  page={table.page}
                  pageSize={table.pageSize}
                  totalItems={table.total}
                  onPageChange={table.setPage}
                  onPageSizeChange={table.setPageSize}
                />
              </>
            )}
          </>
        )}
      </main>

      <BottomNav saveCount={navSaveCount} chatCount={chatCount} />

      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal
            key={selectedJob.id}
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
            key={applyJob.id}
            job={applyJob}
            onClose={() => setApplyJob(null)}
            onSuccess={(application) => {
              if (application?.jobId && application.id) {
                setApplicationByJobId((prev) => {
                  const next = new Map(prev);
                  next.set(application.jobId, application.id);
                  return next;
                });
              }
              setApplyJob(null);
              void table.refetch();
            }}
          />
        )}
      </AnimatePresence>
    </AppPage>
  );
}
