"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
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
import { JOB_APPROVAL_LABELS } from "@/lib/constants";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import type { Job, JobApprovalStatus } from "@/lib/types";

const STATUS_COLORS: Record<JobApprovalStatus, string> = {
  pending: "badge-amber",
  approved: "badge-green",
  rejected: "badge-red",
};

const APPROVAL_FILTER_OPTIONS: { value: "" | JobApprovalStatus; label: string }[] = [
  { value: "", label: "すべて" },
  { value: "pending", label: JOB_APPROVAL_LABELS.pending },
  { value: "approved", label: JOB_APPROVAL_LABELS.approved },
  { value: "rejected", label: JOB_APPROVAL_LABELS.rejected },
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

  const refetch = useCallback(async () => {
    await tableRef.current?.refetch();
  }, []);

  const updateApproval = async (id: string, approvalStatus: JobApprovalStatus) => {
    await apiFetch("/api/admin/jobs", {
      method: "PATCH",
      body: JSON.stringify({ id, approvalStatus }),
    });
    await refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この求人を削除しますか？")) return;
    await apiFetch("/api/admin/jobs", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    await refetch();
  };

  const columns: ColumnDef<Job>[] = [
    {
      id: "job",
      header: "求人",
      sortable: true,
      cell: (job) => (
        <div className="flex min-w-[220px] items-center gap-4">
          <JobThumbnail job={job} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-[var(--foreground)]">{job.title}</p>
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
    {
      id: "status",
      header: "ステータス",
      sortable: true,
      cell: (job) => (
        <span className={`badge ${STATUS_COLORS[job.approvalStatus]}`}>
          {JOB_APPROVAL_LABELS[job.approvalStatus]}
        </span>
      ),
    },
    {
      id: "postedAt",
      header: "掲載日",
      sortable: true,
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
      cell: (job) => (
        <span className="whitespace-nowrap text-xs text-[var(--muted)]">
          {job.approvedAt ? formatDateTimeJST(job.approvedAt) : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "操作",
      headerClassName: "text-right",
      className: "text-right",
      cell: (job) => (
        <TableRowActions>
          {isAdmin && job.approvalStatus === "pending" && (
            <>
              <TableApproveButton onClick={() => updateApproval(job.id, "approved")} />
              <TableRejectButton onClick={() => updateApproval(job.id, "rejected")} />
            </>
          )}
          <TableViewLink href={`${basePath}/jobs/${job.id}/view`} />
          {job.approvalStatus !== "approved" && (
            <>
              <TableEditLink href={`${basePath}/jobs/${job.id}/edit`} />
              <TableDeleteButton onClick={() => handleDelete(job.id)} />
            </>
          )}
        </TableRowActions>
      ),
    },
  ];

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">求人管理</h1>
          <p className="mt-1 text-sm text-slate-500">検索・フィルター・並び替えで求人を管理</p>
        </div>
        <Link href={`${basePath}/jobs/new`} className="staff-ui btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          求人登録
        </Link>
      </div>

      <PaginatedDataTable
        ref={tableRef}
        staffStyle
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
    </>
  );
}
