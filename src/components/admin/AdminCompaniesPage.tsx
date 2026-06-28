"use client";

import { useRouter } from "next/navigation";
import CompanyLogo from "@/components/chat/CompanyLogo";
import PaginatedDataTable, { type ColumnDef } from "@/components/ui/PaginatedDataTable";
import PaginatedTableToolbar from "@/components/ui/PaginatedTableToolbar";
import { TableRowActions, TableViewLink } from "@/components/ui/TableRowActions";
import { formatDateJST } from "@/lib/datetime";
import type { AdminCompanyRow } from "@/lib/db/admin-companies";

export default function AdminCompaniesPage() {
  const router = useRouter();

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
        </TableRowActions>
      ),
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">企業管理</h1>
        <p className="mt-1 text-sm text-slate-500">検索・並び替えで登録企業を管理</p>
      </div>

      <PaginatedDataTable
        staffStyle
        columns={columns}
        getRowId={(row) => row.id}
        fetchUrl="/api/admin/companies"
        defaultSort={{ column: "name", order: "asc" }}
        buildQuery={({ page, pageSize, sort, search }) => ({
          page: String(page),
          limit: String(pageSize),
          search: search || undefined,
          sort: sort.column || undefined,
          order: sort.order,
        })}
        parseResponse={(data) => {
          const payload = data as { items?: AdminCompanyRow[]; total?: number };
          return {
            items: Array.isArray(payload.items) ? payload.items : [],
            total: typeof payload.total === "number" ? payload.total : 0,
          };
        }}
        emptyMessage="登録企業がありません"
        onRowClick={(row) => router.push(`/admin/companies/${row.id}`)}
        toolbar={({ searchInput, setSearchInput }) => (
          <PaginatedTableToolbar
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="企業名で検索..."
          />
        )}
      />
    </>
  );
}
