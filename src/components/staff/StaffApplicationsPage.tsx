"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { formatDateJST } from "@/lib/datetime";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import { formatBirthdayDisplay } from "@/lib/birthday";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { apiFetch } from "@/lib/api-client";
import type { ApplicationStatus, ApplicationWithSeeker, Job } from "@/lib/types";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  new: "badge-amber",
  scheduling: "badge-blue",
  interview_done: "bg-violet-100 text-violet-700",
  hired: "badge-green",
  rejected: "badge-red",
};

const STATUSES: ApplicationStatus[] = ["new", "scheduling", "interview_done", "hired", "rejected"];

export default function StaffApplicationsPage() {
  const { basePath, role } = useStaffPanel();
  const isCompany = role === "company";

  const [applications, setApplications] = useState<ApplicationWithSeeker[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    Promise.all([
      apiFetch("/api/admin/applications").then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "応募データの取得に失敗しました"
          );
        }
        return data;
      }),
      apiFetch("/api/jobs?includeUnapproved=true").then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) return { jobs: [] as Job[] };
        return data;
      }),
    ])
      .then(([appsData, jobsData]) => {
        const apps = Array.isArray(appsData.applications) ? appsData.applications : [];
        setApplications(apps);
        const map: Record<string, Job> = {};
        (jobsData.jobs ?? []).forEach((j: Job) => {
          map[j.id] = j;
        });
        setJobs(map);
        setSelectedId((prev) => (prev && apps.some((a: ApplicationWithSeeker) => a.id === prev) ? prev : apps[0]?.id ?? null));
      })
      .catch((err: Error) => {
        setApplications([]);
        setSelectedId(null);
        setFetchError(err.message || "応募データの取得に失敗しました");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    await apiFetch("/api/admin/applications", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const selected = applications.find((a) => a.id === selectedId);
  const seeker = selected?.seeker;

  const columns: ColumnDef<ApplicationWithSeeker>[] = [
    {
      id: "name",
      header: "応募者",
      cell: (app) => (
        <div>
          <p className="font-semibold text-[var(--foreground)]">{app.applicantName}</p>
          <p className="text-xs text-[var(--muted)]">{app.applicantEmail}</p>
        </div>
      ),
    },
    {
      id: "job",
      header: "求人",
      cell: (app) => (
        <div className="max-w-[180px]">
          <p className="truncate font-medium">{jobs[app.jobId]?.title ?? "—"}</p>
          {!isCompany && (
            <p className="truncate text-xs text-[var(--muted)]">{jobs[app.jobId]?.company}</p>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "ステータス",
      cell: (app) => (
        <span className={`badge ${STATUS_COLORS[app.status]}`}>
          {APPLICATION_STATUS_LABELS[app.status]}
        </span>
      ),
    },
    {
      id: "date",
      header: "応募日",
      cell: (app) => (
        <span className="whitespace-nowrap text-xs text-[var(--muted)]">
          {formatDateJST(app.createdAt)}
        </span>
      ),
    },
  ];

  if (loading && applications.length === 0) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isCompany ? "応募管理" : "応募一覧"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isCompany ? "選考ステータスの更新" : "プラットフォーム全体の応募モニタリング"}
          </p>
        </div>
        <PageLoading message="応募データを読み込み中..." minHeight="min-h-[320px]" />
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isCompany ? "応募管理" : "応募一覧"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isCompany
            ? `${applications.length}件の応募 — チャットは「チャット」メニューから`
            : `${applications.length}件の応募（全企業）`}
        </p>
      </div>

      {fetchError && (
        <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {fetchError}
        </p>
      )}

      <DataTable
        columns={columns}
        data={applications}
        loading={loading}
        getRowId={(app) => app.id}
        selectedRowId={selectedId}
        onRowClick={(app) => setSelectedId(app.id)}
        emptyMessage="応募はまだありません"
        pageSize={10}
        className="mb-6"
      />

      {selected && (
        <div className="card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[var(--foreground)]">{selected.applicantName}</p>
              <p className="text-sm text-[var(--muted)]">{selected.applicantEmail}</p>
              <p className="mt-1 text-sm text-[var(--body)]">
                {jobs[selected.jobId]?.title ?? "—"}
                {!isCompany && jobs[selected.jobId]?.company ? ` · ${jobs[selected.jobId].company}` : ""}
              </p>
            </div>
            {isCompany && (
              <Link
                href={`${basePath}/chat?applicationId=${selected.id}`}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                チャットを開く
              </Link>
            )}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <div>
              <dt className="text-[var(--muted)]">性別</dt>
              <dd className="font-medium text-[var(--body)]">{seeker?.gender ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">生年月日</dt>
              <dd className="font-medium text-[var(--body)]">
                {formatBirthdayDisplay(selected.applicantBirthday ?? seeker?.birthday)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">希望エリア</dt>
              <dd className="font-medium text-[var(--body)]">{selected.applicantArea ?? seeker?.area}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">希望職種</dt>
              <dd className="font-medium text-[var(--body)]">{selected.applicantJobType ?? seeker?.desiredJobType}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">経験歴</dt>
              <dd className="font-medium text-[var(--body)]">{seeker?.experience ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">雇用形態</dt>
              <dd className="font-medium text-[var(--body)]">{seeker?.employmentType ?? "—"}</dd>
            </div>
          </dl>

          {selected.message && (
            <p className="mt-3 rounded-lg bg-[var(--surface)] p-3 text-sm text-[var(--body)]">{selected.message}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateStatus(selected.id, s)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  selected.status === s
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--border)]"
                }`}
              >
                {APPLICATION_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
