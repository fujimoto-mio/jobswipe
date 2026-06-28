"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { APPLICATION_STATUS_LABELS, JOB_APPROVAL_LABELS } from "@/lib/constants";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import {
  APPLICATION_STATUS_CHIP_COLORS,
  APPLICATION_STATUSES,
  ApplicationDetailBody,
  ChatOpenLink,
} from "@/components/staff/ApplicationSeekerDetail";
import { formatDateJST, formatDateTimeJST } from "@/lib/datetime";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import PaginatedTableToolbar from "@/components/ui/PaginatedTableToolbar";
import {
  TableDeleteButton,
  TableEditLink,
  TableRowActions,
  TableViewLink,
} from "@/components/ui/TableRowActions";
import { usePaginatedTable } from "@/hooks/usePaginatedTable";
import JobThumbnail from "@/components/JobThumbnail";
import FormSelectPicker from "@/components/form/FormSelectPicker";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { apiFetch } from "@/lib/api-client";
import type { ApplicationStatus, ApplicationWithSeeker, Job, JobApprovalStatus, SeekerProfileDetail } from "@/lib/types";
import type { JobApplicationGroupRow, StaffApplicationRow } from "@/lib/db/staff-applications";

const JOB_APPROVAL_COLORS: Record<JobApprovalStatus, string> = {
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

const APPLICATION_FILTER_OPTIONS: { value: "" | ApplicationStatus; label: string }[] = [
  { value: "", label: "すべて" },
  ...APPLICATION_STATUSES.map((status) => ({ value: status, label: APPLICATION_STATUS_LABELS[status] })),
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

function JobInfoCell({
  job,
  showCompany = false,
  showDates = true,
}: {
  job: Job;
  showCompany?: boolean;
  showDates?: boolean;
}) {
  return (
    <div className="flex min-w-[220px] items-center gap-3">
      <JobThumbnail job={job} className="h-12 w-12 shrink-0 rounded-lg object-cover" showLogoBadge={false} />
      <div className="min-w-0">
        <p className="font-semibold text-[var(--foreground)]">{job.title}</p>
        {showCompany && <p className="truncate text-xs text-[var(--muted)]">{job.company}</p>}
        <p className="truncate text-xs text-[var(--muted)]">
          {job.category} · {job.area || job.location}
        </p>
        <p className="truncate text-xs text-[var(--muted)]">
          {job.employmentType} · <span className="font-medium text-emerald-600">{job.salary}</span>
        </p>
        {showDates && (
          <>
            <p className="truncate text-xs text-[var(--muted)]">掲載: {formatDateTimeJST(job.postedAt)}</p>
            <p className="truncate text-xs text-[var(--muted)]">
              承認: {job.approvedAt ? formatDateTimeJST(job.approvedAt) : "—"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ApplicationSeekerAccordionItem({
  application,
  seeker,
  basePath,
  expanded,
  onToggle,
  onUpdateStatus,
}: {
  application: ApplicationWithSeeker;
  seeker?: SeekerProfileDetail;
  basePath: string;
  expanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
      <div
        className={`flex items-center gap-2 sm:gap-3 ${expanded ? "bg-blue-50/60" : ""}`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className={`flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-left transition sm:px-5 ${
            expanded ? "" : "hover:bg-slate-50"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {application.applicantName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-[var(--foreground)]">{application.applicantName}</p>
              <span className={`badge ${APPLICATION_STATUS_CHIP_COLORS[application.status]}`}>
                {APPLICATION_STATUS_LABELS[application.status]}
              </span>
            </div>
            <p className="truncate text-sm text-[var(--muted)]">{application.applicantEmail}</p>
            <p className="text-xs text-[var(--muted)]">
              応募日: {formatDateJST(application.createdAt)}
              {application.message ? " · メッセージあり" : ""}
            </p>
          </div>
        </button>
        <div className="shrink-0">
          <ChatOpenLink basePath={basePath} jobId={application.jobId} applicationId={application.id} />
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? "詳細を閉じる" : "詳細を開く"}
          className="flex shrink-0 items-center self-stretch px-3 pr-4 transition hover:bg-slate-50 sm:pr-5"
        >
          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[var(--border)] px-4 py-4 sm:px-5">
          <ApplicationDetailBody
            application={application}
            seeker={seeker}
            basePath={basePath}
            isCompany
            onUpdateStatus={onUpdateStatus}
          />
        </div>
      )}
    </div>
  );
}

function ApplicationDetailCard({
  application,
  jobTitle,
  seeker,
  basePath,
  isCompany,
  onUpdateStatus,
}: {
  application: ApplicationWithSeeker;
  jobTitle: string;
  seeker?: SeekerProfileDetail;
  basePath: string;
  isCompany: boolean;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--foreground)]">{application.applicantName}</p>
          <p className="text-sm text-[var(--muted)]">{application.applicantEmail}</p>
          <p className="mt-1 text-sm text-[var(--body)]">{jobTitle}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            応募日: {formatDateJST(application.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge ${APPLICATION_STATUS_CHIP_COLORS[application.status]}`}>
            {APPLICATION_STATUS_LABELS[application.status]}
          </span>
          {isCompany && (
            <ChatOpenLink basePath={basePath} jobId={application.jobId} applicationId={application.id} />
          )}
        </div>
      </div>

      <div className="mt-4">
        <ApplicationDetailBody
          application={application}
          seeker={seeker}
          basePath={basePath}
          isCompany={isCompany}
          onUpdateStatus={onUpdateStatus}
        />
      </div>
    </div>
  );
}

export default function StaffApplicationsPage() {
  const { basePath, role } = useStaffPanel();
  const isCompany = role === "company";

  const [approvalFilter, setApprovalFilter] = useState<"" | JobApprovalStatus>("");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<"" | ApplicationStatus>("");
  const [selectedApplication, setSelectedApplication] = useState<StaffApplicationRow | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobMeta, setSelectedJobMeta] = useState<JobApplicationGroupRow | null>(null);
  const [jobApplications, setJobApplications] = useState<ApplicationWithSeeker[]>([]);
  const [jobApplicationsLoading, setJobApplicationsLoading] = useState(false);
  const [expandedApplicationId, setExpandedApplicationId] = useState<string | null>(null);

  const table = usePaginatedTable<JobApplicationGroupRow | StaffApplicationRow>({
    fetchUrl: "/api/admin/applications",
    defaultSort: { column: isCompany ? "postedAt" : "date", order: "desc" },
    deps: [isCompany, approvalFilter, applicationStatusFilter],
    buildQuery: ({ page, pageSize, sort, search }) => ({
      view: isCompany ? "jobs" : "applications",
      page: String(page),
      limit: String(pageSize),
      search: search || undefined,
      sort: sort.column || undefined,
      order: sort.order,
      ...(isCompany && approvalFilter ? { approvalStatus: approvalFilter } : {}),
      ...(!isCompany && applicationStatusFilter ? { status: applicationStatusFilter } : {}),
    }),
    parseResponse: (data) => {
      const payload = data as {
        items?: (JobApplicationGroupRow | StaffApplicationRow)[];
        total?: number;
        summary?: { totalApplications?: number };
      };
      return {
        items: Array.isArray(payload.items) ? payload.items : [],
        total: typeof payload.total === "number" ? payload.total : 0,
        meta: {
          totalApplications: payload.summary?.totalApplications ?? 0,
        },
      };
    },
  });

  const totalApplications = (table.meta.totalApplications as number | undefined) ?? 0;
  const jobGroups = isCompany ? (table.items as JobApplicationGroupRow[]) : [];
  const applications = !isCompany ? (table.items as StaffApplicationRow[]) : [];

  const fetchJobApplications = useCallback(async (jobId: string) => {
    setJobApplicationsLoading(true);
    try {
      const res = await apiFetch(`/api/admin/applications?jobId=${encodeURIComponent(jobId)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error();
      setJobApplications(Array.isArray(data.applications) ? data.applications : []);
    } catch {
      setJobApplications([]);
    } finally {
      setJobApplicationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isCompany || !selectedJobId) {
      setJobApplications([]);
      return;
    }
    void fetchJobApplications(selectedJobId);
  }, [isCompany, selectedJobId, fetchJobApplications]);

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    await apiFetch("/api/admin/applications", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
    await table.refetch();
    if (isCompany && selectedJobId) await fetchJobApplications(selectedJobId);
    if (!isCompany && selectedApplication?.id === id) {
      setSelectedApplication((prev) => (prev ? { ...prev, status } : prev));
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("この求人を削除しますか？")) return;
    await apiFetch("/api/admin/jobs", {
      method: "DELETE",
      body: JSON.stringify({ id: jobId }),
    });
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
      setSelectedJobMeta(null);
      setJobApplications([]);
    }
    await table.refetch();
  };

  const companyColumns: ColumnDef<JobApplicationGroupRow>[] = [
    {
      id: "job",
      header: "求人",
      sortable: true,
      cell: (group) => <JobInfoCell job={group.job} showDates={false} />,
    },
    {
      id: "jobStatus",
      header: "公開状態",
      sortable: true,
      cell: (group) => (
        <span className={`badge ${JOB_APPROVAL_COLORS[group.job.approvalStatus]}`}>
          {JOB_APPROVAL_LABELS[group.job.approvalStatus]}
        </span>
      ),
    },
    {
      id: "postedAt",
      header: "掲載日",
      sortable: true,
      cell: (group) => (
        <span className="whitespace-nowrap text-xs text-[var(--muted)]">
          {formatDateTimeJST(group.job.postedAt)}
        </span>
      ),
    },
    {
      id: "approvedAt",
      header: "承認日",
      sortable: true,
      cell: (group) => (
        <span className="whitespace-nowrap text-xs text-[var(--muted)]">
          {group.job.approvedAt ? formatDateTimeJST(group.job.approvedAt) : "—"}
        </span>
      ),
    },
    {
      id: "count",
      header: "応募数",
      sortable: true,
      cell: (group) => <span className="data-table-count-pill">{group.applicantCount}</span>,
    },
    {
      id: "actions",
      header: "操作",
      headerClassName: "text-right",
      className: "text-right",
      cell: (group) => (
        <TableRowActions>
          <TableViewLink href={`${basePath}/jobs/${group.jobId}/view`} />
          {group.job.approvalStatus !== "approved" && (
            <>
              <TableEditLink href={`${basePath}/jobs/${group.jobId}/edit`} />
              <TableDeleteButton onClick={() => handleDeleteJob(group.jobId)} />
            </>
          )}
        </TableRowActions>
      ),
    },
  ];

  const adminColumns: ColumnDef<StaffApplicationRow>[] = [
    {
      id: "name",
      header: "応募者",
      sortable: true,
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
      cell: (app) => (app.job ? <JobInfoCell job={app.job} showCompany /> : <span>—</span>),
    },
    {
      id: "status",
      header: "ステータス",
      sortable: true,
      cell: (app) => (
        <span className={`badge ${APPLICATION_STATUS_CHIP_COLORS[app.status]}`}>
          {APPLICATION_STATUS_LABELS[app.status]}
        </span>
      ),
    },
    {
      id: "date",
      header: "応募日",
      sortable: true,
      cell: (app) => (
        <span className="whitespace-nowrap text-xs text-[var(--muted)]">
          {formatDateJST(app.createdAt)}
        </span>
      ),
    },
  ];

  const handleApprovalFilterChange = (value: "" | JobApprovalStatus) => {
    setApprovalFilter(value);
    table.setPage(1);
  };

  const handleApplicationStatusFilterChange = (value: "" | ApplicationStatus) => {
    setApplicationStatusFilter(value);
    table.setPage(1);
  };

  const applicationsToolbar = (
    <PaginatedTableToolbar
      searchValue={table.searchInput}
      onSearchChange={table.setSearchInput}
      searchPlaceholder={
        isCompany
          ? "求人名・エリア・カテゴリで検索..."
          : "応募者・メール・求人名・会社名で検索..."
      }
      filter={
        isCompany ? (
          <FilterSelect
            value={approvalFilter}
            options={APPROVAL_FILTER_OPTIONS}
            onChange={handleApprovalFilterChange}
            title="公開状態"
          />
        ) : (
          <FilterSelect
            value={applicationStatusFilter}
            options={APPLICATION_FILTER_OPTIONS}
            onChange={handleApplicationStatusFilterChange}
            title="ステータス"
          />
        )
      }
    />
  );

  const tableEmpty =
    table.searchInput || approvalFilter || applicationStatusFilter
      ? "条件に一致するデータがありません"
      : isCompany
        ? "求人がまだありません"
        : "応募はまだありません";

  if (table.loading && table.items.length === 0) {
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
            ? `${table.total}件の求人 · ${totalApplications}件の応募 — 求人を選択し、応募者をクリックして詳細を表示`
            : `${table.total}件の応募`}
        </p>
      </div>

      {table.error && (
        <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {table.error}
        </p>
      )}

      {isCompany ? (
        <DataTable
          columns={companyColumns}
          data={jobGroups}
          loading={table.loading}
          getRowId={(group) => group.jobId}
          selectedRowId={selectedJobId}
          onRowClick={(group) => {
            setSelectedJobId(group.jobId);
            setSelectedJobMeta(group);
            setExpandedApplicationId(null);
          }}
          emptyMessage={tableEmpty}
          className="mb-6"
          staffStyle
          toolbar={applicationsToolbar}
          pageSize={table.pageSize}
          totalCount={table.total}
          page={table.page}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          sort={table.sort}
          onSortChange={table.setSort}
        />
      ) : (
        <DataTable
          columns={adminColumns}
          data={applications}
          loading={table.loading}
          getRowId={(app) => app.id}
          selectedRowId={selectedApplication?.id ?? null}
          onRowClick={(app) => setSelectedApplication(app)}
          emptyMessage={tableEmpty}
          className="mb-6"
          staffStyle
          toolbar={applicationsToolbar}
          pageSize={table.pageSize}
          totalCount={table.total}
          page={table.page}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          sort={table.sort}
          onSortChange={table.setSort}
        />
      )}

      {isCompany && selectedJobMeta && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedJobMeta.job.title}
              <span className="ml-2 text-sm font-normal text-slate-500">
                {selectedJobMeta.applicantCount}件の応募
              </span>
            </h2>
            <p className="text-xs text-slate-400">応募者をクリックして詳細を開く</p>
          </div>

          {jobApplicationsLoading ? (
            <PageLoading message="応募者を読み込み中..." minHeight="min-h-[200px]" />
          ) : jobApplications.length === 0 ? (
            <p className="rounded-xl border border-[var(--border)] bg-white px-4 py-8 text-center text-sm text-[var(--muted)]">
              この求人への応募はまだありません
            </p>
          ) : (
            jobApplications.map((app) => (
              <ApplicationSeekerAccordionItem
                key={app.id}
                application={app}
                seeker={app.seeker}
                basePath={basePath}
                expanded={expandedApplicationId === app.id}
                onToggle={() =>
                  setExpandedApplicationId((prev) => (prev === app.id ? null : app.id))
                }
                onUpdateStatus={updateStatus}
              />
            ))
          )}
        </div>
      )}

      {!isCompany && selectedApplication && (
        <ApplicationDetailCard
          application={selectedApplication}
          jobTitle={
            selectedApplication.job?.company
              ? `${selectedApplication.job.title} · ${selectedApplication.job.company}`
              : (selectedApplication.job?.title ?? selectedApplication.jobTitle ?? "—")
          }
          seeker={selectedApplication.seeker}
          basePath={basePath}
          isCompany={isCompany}
          onUpdateStatus={updateStatus}
        />
      )}
    </>
  );
}
