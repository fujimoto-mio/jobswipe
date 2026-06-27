"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Check, X, Trash2, Pencil } from "lucide-react";
import JobThumbnail from "@/components/JobThumbnail";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { formatDateJST } from "@/lib/datetime";
import { JOB_APPROVAL_LABELS } from "@/lib/constants";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import type { Job, JobApprovalStatus } from "@/lib/types";

const STATUS_COLORS: Record<JobApprovalStatus, string> = {
  pending: "badge-amber",
  approved: "badge-green",
  rejected: "badge-red",
};

export default function AdminJobsPage() {
  const { basePath, role } = useStaffPanel();
  const isAdmin = role === "admin";
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiFetch("/api/jobs?includeUnapproved=true").then((r) => r.json()),
    ])
      .then(([jobsData]) => {
        setJobs(jobsData.jobs ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateApproval = async (id: string, approvalStatus: JobApprovalStatus) => {
    await apiFetch("/api/admin/jobs", {
      method: "PATCH",
      body: JSON.stringify({ id, approvalStatus }),
    });
    fetchJobs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この求人を削除しますか？")) return;
    await apiFetch("/api/admin/jobs", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    fetchJobs();
  };

  const columns: ColumnDef<Job>[] = [
    {
      id: "job",
      header: "求人",
      cell: (job) => (
        <div className="flex min-w-[200px] items-center gap-3">
          <JobThumbnail job={job} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="font-semibold text-[var(--foreground)]">{job.title}</p>
            <p className="text-xs text-[var(--muted)]">{job.category}</p>
          </div>
        </div>
      ),
    },
    {
      id: "company",
      header: "会社",
      cell: (job) => <span className="whitespace-nowrap">{job.company}</span>,
    },
    {
      id: "location",
      header: "勤務地",
      cell: (job) => <span className="max-w-[140px] truncate">{job.location}</span>,
    },
    {
      id: "salary",
      header: "給与",
      cell: (job) => <span className="whitespace-nowrap font-medium text-emerald-600">{job.salary}</span>,
    },
    {
      id: "status",
      header: "ステータス",
      cell: (job) => (
        <span className={`badge ${STATUS_COLORS[job.approvalStatus]}`}>
          {JOB_APPROVAL_LABELS[job.approvalStatus]}
        </span>
      ),
    },
    {
      id: "posted",
      header: "掲載日",
      cell: (job) => (
        <span className="whitespace-nowrap text-xs text-[var(--muted)]">{formatDateJST(job.postedAt)}</span>
      ),
    },
    {
      id: "views",
      header: "再生",
      cell: (job) => <span className="tabular-nums">{job.viewCount.toLocaleString()}</span>,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      id: "actions",
      header: "操作",
      headerClassName: "text-right",
      className: "text-right",
      cell: (job) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {isAdmin && job.approvalStatus === "pending" && (
            <>
              <button
                type="button"
                onClick={() => updateApproval(job.id, "approved")}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700"
                aria-label="承認"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => updateApproval(job.id, "rejected")}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                aria-label="却下"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
          <Link
            href={`${basePath}/jobs/${job.id}/edit`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--accent)]"
            aria-label="編集"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(job.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600"
            aria-label="削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading && jobs.length === 0) {
    return (
      <>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">求人管理</h1>
            <p className="mt-1 text-sm text-slate-500">求人一覧</p>
          </div>
        </div>
        <PageLoading message="求人一覧を読み込み中..." minHeight="min-h-[320px]" />
      </>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">求人管理</h1>
          <p className="mt-1 text-sm text-slate-500">{jobs.length}件の求人</p>
        </div>
        <Link href={`${basePath}/jobs/new`} className="btn-primary">
          <Plus className="h-4 w-4" />
          求人登録
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={jobs}
        loading={loading}
        getRowId={(job) => job.id}
        emptyMessage="求人がまだありません"
        pageSize={10}
      />
    </>
  );
}
