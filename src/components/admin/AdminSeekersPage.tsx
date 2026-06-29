"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import SeekerSuspendConfirmModal from "@/components/admin/SeekerSuspendConfirmModal";
import FormSelectPicker from "@/components/form/FormSelectPicker";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import PaginatedTableToolbar from "@/components/ui/PaginatedTableToolbar";
import {
  TableRestoreButton,
  TableRowActions,
  TableSuspendButton,
  TableViewLink,
} from "@/components/ui/TableRowActions";
import {
  SEEKER_STATUS_BADGE_CLASS,
  SEEKER_STATUS_LABELS,
  SEEKER_STATUSES,
  type SeekerStatus,
} from "@/lib/constants";
import { formatDateJST } from "@/lib/datetime";
import { usePaginatedTable } from "@/hooks/usePaginatedTable";
import { apiFetch } from "@/lib/api-client";
import type { AdminSeekerRow } from "@/lib/db/admin-seekers";

type SeekerStatusFilter = "" | SeekerStatus;

function getStatusFilterOptions(): { value: SeekerStatusFilter; label: string }[] {
  return [
    { value: "", label: "すべて" },
    ...SEEKER_STATUSES.map((status) => ({
      value: status,
      label: SEEKER_STATUS_LABELS[status],
    })),
  ];
}

function FilterSelect({
  value,
  onChange,
}: {
  value: SeekerStatusFilter;
  onChange: (value: SeekerStatusFilter) => void;
}) {
  const statusFilterOptions = getStatusFilterOptions();
  const selectedLabel =
    statusFilterOptions.find((option) => option.value === value)?.label ?? "すべて";

  return (
    <FormSelectPicker
      name="filter"
      title="ステータス"
      value={selectedLabel}
      options={statusFilterOptions.map((option) => option.label)}
      placeholder="すべて"
      allowClear={false}
      onChange={(label) => {
        const next = statusFilterOptions.find((option) => option.label === label);
        if (next) onChange(next.value);
      }}
      onBlur={() => {}}
    />
  );
}

export default function AdminSeekersPage() {
  const [statusFilter, setStatusFilter] = useState<SeekerStatusFilter>("");
  const [pendingAction, setPendingAction] = useState<{
    seeker: AdminSeekerRow;
    action: "suspend" | "restore";
  } | null>(null);

  const table = usePaginatedTable<AdminSeekerRow>({
    fetchUrl: "/api/admin/seekers",
    defaultSort: { column: "createdAt", order: "desc" },
    deps: [statusFilter],
    buildQuery: ({ page, pageSize, sort, search }) => ({
      page: String(page),
      limit: String(pageSize),
      search: search || undefined,
      sort: sort.column || undefined,
      order: sort.order,
      ...(statusFilter ? { status: statusFilter } : {}),
    }),
    parseResponse: (data) => {
      const payload = data as { items?: AdminSeekerRow[]; total?: number };
      return {
        items: Array.isArray(payload.items) ? payload.items : [],
        total: typeof payload.total === "number" ? payload.total : 0,
      };
    },
  });

  const updateStatus = async (seekerId: string, status: SeekerStatus) => {
    const res = await apiFetch(`/api/admin/seekers/${encodeURIComponent(seekerId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("update failed");
    await table.refetch();
  };

  const columns: ColumnDef<AdminSeekerRow>[] = [
    {
      id: "name",
      header: "氏名",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-semibold text-[var(--foreground)]">{row.name}</p>
          <p className="text-xs text-[var(--muted)]">{row.email}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "ステータス",
      cell: (row) => (
        <span className={`badge ${SEEKER_STATUS_BADGE_CLASS[row.status]}`}>
          {SEEKER_STATUS_LABELS[row.status]}
        </span>
      ),
    },
    {
      id: "area",
      header: "希望エリア",
      cell: (row) => <span className="text-sm text-[var(--body)]">{row.area || "—"}</span>,
    },
    {
      id: "desiredJobType",
      header: "希望職種",
      cell: (row) => <span className="text-sm text-[var(--body)]">{row.desiredJobType || "—"}</span>,
    },
    {
      id: "applications",
      header: "応募数",
      sortable: true,
      cell: (row) => <span className="data-table-count-pill">{row.applicationCount}</span>,
    },
    {
      id: "createdAt",
      header: "登録日",
      sortable: true,
      cell: (row) => (
        <span className="whitespace-nowrap text-xs text-[var(--muted)]">{formatDateJST(row.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "操作",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <TableRowActions>
          <TableViewLink href={`/admin/seekers/${row.id}`} />
          {row.status === "Suspended" ? (
            <TableRestoreButton onClick={() => setPendingAction({ seeker: row, action: "restore" })} />
          ) : (
            <TableSuspendButton onClick={() => setPendingAction({ seeker: row, action: "suspend" })} />
          )}
        </TableRowActions>
      ),
    },
  ];

  const tableEmpty =
    table.searchInput || statusFilter
      ? "条件に一致する求職者がいません"
      : "求職者がまだいません";

  return (
    <div className="company-dashboard-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">求職者管理</h1>
        <p className="mt-1 text-sm text-slate-500">
          {table.loading && table.items.length === 0
            ? "求職者データを読み込み中..."
            : `${table.total}名の求職者が登録されています`}
        </p>
      </div>

      {table.error && (
        <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {table.error}
        </p>
      )}

      <DataTable
        columns={columns}
        data={table.items}
        loading={table.loading}
        getRowId={(row) => row.id}
        emptyMessage={tableEmpty}
        staffStyle
        toolbar={
          <PaginatedTableToolbar
            searchValue={table.searchInput}
            onSearchChange={table.setSearchInput}
            searchPlaceholder="氏名・メール・エリア・職種で検索..."
            filter={
              <FilterSelect
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  table.setPage(1);
                }}
              />
            }
          />
        }
        pageSize={table.pageSize}
        totalCount={table.total}
        page={table.page}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        sort={table.sort}
        onSortChange={table.setSort}
      />

      <AnimatePresence>
        {pendingAction && (
          <SeekerSuspendConfirmModal
            key={`${pendingAction.seeker.id}-${pendingAction.action}`}
            seeker={pendingAction.seeker}
            action={pendingAction.action}
            onClose={() => setPendingAction(null)}
            onConfirm={() =>
              updateStatus(
                pendingAction.seeker.id,
                pendingAction.action === "suspend" ? "Suspended" : "Active"
              )
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
