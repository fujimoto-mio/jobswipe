"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import CompanyLogo from "@/components/chat/CompanyLogo";
import CompanyStatusConfirmModal, {
  COMPANY_STATUS_ACTION_TARGET,
  type CompanyStatusAction,
} from "@/components/admin/CompanyStatusConfirmModal";
import FormSelectPicker from "@/components/form/FormSelectPicker";
import PaginatedDataTable, {
  type ColumnDef,
  type PaginatedDataTableHandle,
} from "@/components/ui/PaginatedDataTable";
import PaginatedTableToolbar from "@/components/ui/PaginatedTableToolbar";
import {
  TableApproveButton,
  TableRejectButton,
  TableRestoreButton,
  TableRowActions,
  TableSuspendButton,
  TableViewLink,
} from "@/components/ui/TableRowActions";
import {
  COMPANY_STATUS_BADGE_CLASS,
  COMPANY_STATUS_LABELS,
  COMPANY_STATUSES,
  type CompanyStatus,
} from "@/lib/constants";
import { formatDateJST } from "@/lib/datetime";
import { apiFetch } from "@/lib/api-client";
import type { AdminCompanyRow } from "@/lib/db/admin-companies";

type CompanyStatusFilter = "" | CompanyStatus;

const STATUS_FILTER_OPTIONS: { value: CompanyStatusFilter; label: string }[] = [
  { value: "", label: "すべて" },
  ...COMPANY_STATUSES.map((status) => ({
    value: status as CompanyStatusFilter,
    label: COMPANY_STATUS_LABELS[status],
  })),
];

function FilterSelect({
  value,
  onChange,
}: {
  value: CompanyStatusFilter;
  onChange: (value: CompanyStatusFilter) => void;
}) {
  const selectedLabel =
    STATUS_FILTER_OPTIONS.find((option) => option.value === value)?.label ?? "すべて";

  return (
    <FormSelectPicker
      name="filter"
      title="ステータス"
      value={selectedLabel}
      options={STATUS_FILTER_OPTIONS.map((option) => option.label)}
      placeholder="すべて"
      allowClear={false}
      onChange={(label) => {
        const next = STATUS_FILTER_OPTIONS.find((option) => option.label === label);
        if (next) onChange(next.value);
      }}
      onBlur={() => {}}
    />
  );
}

export default function AdminCompaniesPage() {
  const router = useRouter();
  const tableRef = useRef<PaginatedDataTableHandle>(null);
  const [statusFilter, setStatusFilter] = useState<CompanyStatusFilter>("");
  const [pendingAction, setPendingAction] = useState<{
    company: AdminCompanyRow;
    action: CompanyStatusAction;
  } | null>(null);

  const refetch = useCallback(async () => {
    await tableRef.current?.refetch();
  }, []);

  const updateStatus = async (companyId: string, status: CompanyStatus) => {
    const res = await apiFetch(`/api/admin/companies/${encodeURIComponent(companyId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("update failed");
    await refetch();
  };

  const columns: ColumnDef<AdminCompanyRow>[] = [
    {
      id: "name",
      header: "企業",
      sortable: true,
      cell: (row) => (
        <div className="flex min-w-[220px] items-center gap-4">
          <CompanyLogo company={row.name} logoUrl={row.logoUrl} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-[var(--foreground)]">{row.name}</p>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "ステータス",
      cell: (row) => (
        <span className={`badge ${COMPANY_STATUS_BADGE_CLASS[row.status]}`}>
          {COMPANY_STATUS_LABELS[row.status]}
        </span>
      ),
    },
    {
      id: "jobs",
      header: "求人数",
      sortable: true,
      cell: (row) => <span className="data-table-count-pill">{row.jobCount}</span>,
    },
    {
      id: "accounts",
      header: "担当者数",
      sortable: true,
      cell: (row) => <span className="data-table-count-pill">{row.accountCount}</span>,
    },
    {
      id: "createdAt",
      header: "登録日",
      sortable: true,
      cell: (row) => (
        <span className="whitespace-nowrap text-xs text-[var(--muted)]">
          {formatDateJST(row.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "操作",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <TableRowActions>
          <TableViewLink href={`/admin/companies/${row.id}`} />
          {row.status === "Pending" && (
            <>
              <TableApproveButton onClick={() => setPendingAction({ company: row, action: "approve" })} />
              <TableRejectButton onClick={() => setPendingAction({ company: row, action: "reject" })} />
            </>
          )}
          {row.status === "Active" && (
            <TableSuspendButton onClick={() => setPendingAction({ company: row, action: "suspend" })} />
          )}
          {row.status === "Suspended" && (
            <TableRestoreButton
              label="再開"
              onClick={() => setPendingAction({ company: row, action: "resume" })}
            />
          )}
        </TableRowActions>
      ),
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">企業管理</h1>
        <p className="mt-1 text-sm text-slate-500">検索・フィルター・並び替えで登録企業を管理</p>
      </div>

      <PaginatedDataTable
        ref={tableRef}
        staffStyle
        columns={columns}
        getRowId={(row) => row.id}
        fetchUrl="/api/admin/companies"
        defaultSort={{ column: "name", order: "asc" }}
        deps={[statusFilter]}
        buildQuery={({ page, pageSize, sort, search }) => ({
          page: String(page),
          limit: String(pageSize),
          search: search || undefined,
          sort: sort.column || undefined,
          order: sort.order,
          ...(statusFilter ? { status: statusFilter } : {}),
        })}
        parseResponse={(data) => {
          const payload = data as { items?: AdminCompanyRow[]; total?: number };
          return {
            items: Array.isArray(payload.items) ? payload.items : [],
            total: typeof payload.total === "number" ? payload.total : 0,
          };
        }}
        emptyMessage={
          statusFilter ? "条件に一致する企業がありません" : "登録企業がありません"
        }
        onRowClick={(row) => router.push(`/admin/companies/${row.id}`)}
        toolbar={({ searchInput, setSearchInput }) => (
          <PaginatedTableToolbar
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="企業名で検索..."
            filter={
              <FilterSelect value={statusFilter} onChange={setStatusFilter} />
            }
          />
        )}
      />

      <AnimatePresence>
        {pendingAction && (
          <CompanyStatusConfirmModal
            key={`${pendingAction.company.id}-${pendingAction.action}`}
            company={pendingAction.company}
            action={pendingAction.action}
            onClose={() => setPendingAction(null)}
            onConfirm={() =>
              updateStatus(
                pendingAction.company.id,
                COMPANY_STATUS_ACTION_TARGET[pendingAction.action]
              )
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}
