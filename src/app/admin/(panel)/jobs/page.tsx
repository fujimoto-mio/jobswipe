"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import JobApprovalConfirmModal from "@/components/admin/JobApprovalConfirmModal";
import JobDeleteConfirmModal from "@/components/staff/JobDeleteConfirmModal";
import JobThumbnail from "@/components/JobThumbnail";
import PaginatedDataTable, {
  type ColumnDef,
  type PaginatedDataTableHandle,
} from "@/components/ui/PaginatedDataTable";
import PaginatedTableToolbar from "@/components/ui/PaginatedTableToolbar";
import {
  TableApproveButton,
  TableDeleteButton,
  TableEditLink,
  TableRejectButton,
  TableRowActions,
  TableViewLink,
} from "@/components/ui/TableRowActions";
import FormSelectPicker from "@/components/form/FormSelectPicker";
import { formatDateTimeJST } from "@/lib/datetime";
import { JOB_APPROVAL_BADGE_CLASS, JOB_APPROVAL_LABELS, JOB_APPROVAL_STATUSES } from "@/lib/constants";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import type { Job, JobApprovalStatus } from "@/lib/types";

const APPROVAL_FILTER_OPTIONS: { value: "" | JobApprovalStatus; label: string }[] = [
  { value: "", label: "すべて" },
  ...JOB_APPROVAL_STATUSES.map((status) => ({
    value: status,
    label: JOB_APPROVAL_LABELS[status],
  })),
];

function FilterSelect<T extends string>({
  value,
  options,
  onChange,
  title,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  title: string;
}) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? options[0]?.label ?? "";

  return (
    <FormSelectPicker
      name="filter"
      title={title}
      value={selectedLabel}
      options={options.map((option) => option.label)}
      placeholder={options[0]?.label ?? "選択"}
      allowClear={false}
      onChange={(label) => {
        const next = options.find((option) => option.label === label);
        if (next) onChange(next.value);
      }}
      onBlur={() => {}}
    />
  );
}

export default function AdminJobsPage() {
  const { basePath, role } = useStaffPanel();
  const isAdmin = role === "admin";
  const tableRef = useRef<PaginatedDataTableHandle>(null);
  const [approvalFilter, setApprovalFilter] = useState<"" | JobApprovalStatus>("");
  const [pendingApproval, setPendingApproval] = useState<{
    job: Job;
    action: Extract<JobApprovalStatus, "Active" | "Cancelled">;
  } | null>(null);
  const [pendingDeleteJob, setPendingDeleteJob] = useState<Job | null>(null);

  const refetch = useCallback(async () => {
    await tableRef.current?.refetch();
  }, []);

  const updateApproval = async (id: string, approvalStatus: JobApprovalStatus) => {
    const res = await apiFetch("/api/admin/jobs", {
      method: "PATCH",
      body: JSON.stringify({ id, approvalStatus }),
    });
    if (!res.ok) {
      throw new Error("approval update failed");
    }
    await refetch();
  };

  const deleteJob = async (id: string) => {
    const res = await apiFetch("/api/admin/jobs", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error("delete failed");
    await refetch();
  };

  const handleConfirmDeleteJob = async () => {
    if (!pendingDeleteJob) return;
    await deleteJob(pendingDeleteJob.id);
  };

  const columns: ColumnDef<Job>[] = [
    {
      id: "job",
      header: "求人",
      sortable: true,
      className: "data-table-col-job",
      headerClassName: "data-table-col-job",
      cell: (job) => (
        <div className="flex w-full items-center gap-3">
          <JobThumbnail job={job} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 overflow-hidden">
            <p className="truncate font-semibold text-[var(--foreground)]" title={job.title}>
              {job.title}
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              {job.category} · {job.area || job.location}
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              {job.employmentType} · <span className="font-medium text-emerald-600">{job.salary}</span>
            </p>
          </div>
        </div>
      ),
    },
    ...(isAdmin
      ? [
          {
            id: "company",
            header: "企業",
            sortable: true,
            className: "data-table-col-company",
            headerClassName: "data-table-col-company",
            cell: (job: Job) => (
              <span
                className="block truncate text-sm font-medium text-[var(--foreground)]"
                title={job.company}
              >
                {job.company}
              </span>
            ),
          } satisfies ColumnDef<Job>,
        ]
      : []),
    {
      id: "status",
      header: "ステータス",
      sortable: true,
      className: "data-table-col-status",
      headerClassName: "data-table-col-status",
      cell: (job) => (
        <span className={`badge ${JOB_APPROVAL_BADGE_CLASS[job.approvalStatus]}`}>
          {JOB_APPROVAL_LABELS[job.approvalStatus]}
        </span>
      ),
    },
    {
      id: "postedAt",
      header: "掲載日",
      sortable: true,
      className: "data-table-col-date",
      headerClassName: "data-table-col-date",
      cell: (job) => (
        <span className="whitespace-nowrap text-xs text-[var(--muted)]">
          {formatDateTimeJST(job.postedAt)}
        </span>
      ),
    },
    {
      id: "approvedAt",
      header: "承認日",
      sortable: true,
      className: "data-table-col-date",
      headerClassName: "data-table-col-date",
      cell: (job) => (
        <span className="whitespace-nowrap text-xs text-[var(--muted)]">
          {job.approvedAt ? formatDateTimeJST(job.approvedAt) : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "操作",
      headerClassName: "data-table-col-actions text-right",
      className: "data-table-col-actions text-right",
      cell: (job) => {
        if (isAdmin) {
          return (
            <TableRowActions>
              <TableViewLink href={`${basePath}/jobs/${job.id}/view`} />
              {job.approvalStatus === "Pending" && (
                <>
                  <TableApproveButton onClick={() => setPendingApproval({ job, action: "Active" })} />
                  <TableRejectButton onClick={() => setPendingApproval({ job, action: "Cancelled" })} />
                </>
              )}
            </TableRowActions>
          );
        }

        return (
          <TableRowActions>
            <TableViewLink href={`${basePath}/jobs/${job.id}/view`} />
            {job.approvalStatus !== "Active" && (
              <>
                <TableEditLink href={`${basePath}/jobs/${job.id}/edit`} />
                <TableDeleteButton onClick={() => setPendingDeleteJob(job)} />
              </>
            )}
          </TableRowActions>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isAdmin ? "求人審査" : "求人管理"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? "求人内容の確認と承認・却下"
              : "検索・フィルター・並び替えで求人を管理"}
          </p>
        </div>
        {!isAdmin && (
          <Link href={`${basePath}/jobs/new`} className="staff-ui btn-primary shrink-0">
            <Plus className="h-4 w-4" />
            求人登録
          </Link>
        )}
      </div>

      <PaginatedDataTable
        ref={tableRef}
        staffStyle
        className="data-table-jobs-layout"
        columns={columns}
        getRowId={(job) => job.id}
        fetchUrl="/api/admin/jobs"
        defaultSort={{ column: "postedAt", order: "desc" }}
        deps={[approvalFilter]}
        buildQuery={({ page, pageSize, sort, search }) => ({
          page: String(page),
          limit: String(pageSize),
          search: search || undefined,
          sort: sort.column || undefined,
          order: sort.order,
          ...(approvalFilter ? { approvalStatus: approvalFilter } : {}),
        })}
        parseResponse={(data) => {
          const payload = data as { items?: Job[]; total?: number };
          return {
            items: Array.isArray(payload.items) ? payload.items : [],
            total: typeof payload.total === "number" ? payload.total : 0,
          };
        }}
        emptyMessage={
          approvalFilter ? "条件に一致する求人がありません" : "求人がまだありません"
        }
        toolbar={({ searchInput, setSearchInput }) => (
          <PaginatedTableToolbar
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="求人名・会社・エリアで検索..."
            filter={
              <FilterSelect
                value={approvalFilter}
                options={APPROVAL_FILTER_OPTIONS}
                onChange={setApprovalFilter}
                title="ステータス"
              />
            }
          />
        )}
      />

      <AnimatePresence>
        {pendingApproval && (
          <JobApprovalConfirmModal
            key={`${pendingApproval.job.id}-${pendingApproval.action}`}
            job={pendingApproval.job}
            action={pendingApproval.action}
            onClose={() => setPendingApproval(null)}
            onConfirm={() =>
              updateApproval(pendingApproval.job.id, pendingApproval.action)
            }
          />
        )}
        {pendingDeleteJob && (
          <JobDeleteConfirmModal
            key={pendingDeleteJob.id}
            job={pendingDeleteJob}
            onClose={() => setPendingDeleteJob(null)}
            onConfirm={handleConfirmDeleteJob}
          />
        )}
      </AnimatePresence>
    </>
  );
}
