"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import DataTable, { type ColumnDef } from "@/components/ui/DataTable";
import PaginatedTableToolbar from "@/components/ui/PaginatedTableToolbar";
import { AdminSeekerProfileView } from "@/components/admin/AdminSeekerProfileView";
import { formatBirthdayDisplay } from "@/lib/birthday";
import { formatDateJST } from "@/lib/datetime";
import { usePaginatedTable } from "@/hooks/usePaginatedTable";
import { apiFetch } from "@/lib/api-client";
import type { AdminSeekerRow } from "@/lib/db/admin-seekers";
import type { UserProfile } from "@/lib/types";

type SeekerDetail = {
  profile: UserProfile & { id: string };
  applicationCount: number;
  savedCount: number;
  recentApplications: {
    id: string;
    status: string;
    createdAt: string;
    jobTitle: string;
    companyName: string;
    jobId: string;
  }[];
};

function SeekerAccordionItem({
  seeker,
  expanded,
  onToggle,
}: {
  seeker: AdminSeekerRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [detail, setDetail] = useState<SeekerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!expanded) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    apiFetch(`/api/admin/seekers?id=${encodeURIComponent(seeker.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [expanded, seeker.id]);

  return (
    <div className={`overflow-hidden rounded-xl border border-[var(--border)] ${expanded ? "bg-slate-50" : "bg-white"}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`flex w-full items-center gap-3 px-4 py-4 text-left transition sm:px-5 ${
          expanded ? "bg-blue-50/60" : "hover:bg-slate-50"
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {seeker.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[var(--foreground)]">{seeker.name}</p>
          <p className="truncate text-sm text-[var(--muted)]">{seeker.email}</p>
          <p className="text-xs text-[var(--muted)]">
            {seeker.area} · {seeker.desiredJobType} · 応募 {seeker.applicationCount}件
          </p>
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)]">
          {loadingDetail || !detail ? (
            <PageLoading message="プロフィールを読み込み中..." minHeight="min-h-[200px]" />
          ) : (
            <div className="application-seeker-detail application-seeker-detail--embedded p-4">
              <div className="application-seeker-detail-sections">
                <section className="company-profile-section">
                  <div className="company-profile-section-header">
                    <h2 className="company-profile-section-title">登録情報</h2>
                  </div>
                  <div className="company-profile-section-body">
                    <div className="company-profile-info-table">
                      <div className="company-profile-info-row">
                        <div className="company-profile-info-label">性別</div>
                        <div className="company-profile-info-value">{detail.profile.gender || "未設定"}</div>
                      </div>
                      <div className="company-profile-info-row">
                        <div className="company-profile-info-label">生年月日</div>
                        <div className="company-profile-info-value">
                          {formatBirthdayDisplay(detail.profile.birthday)}
                        </div>
                      </div>
                      <div className="company-profile-info-row">
                        <div className="company-profile-info-label">最終学歴</div>
                        <div className="company-profile-info-value">
                          {detail.profile.education || "未設定"}
                        </div>
                      </div>
                      <div className="company-profile-info-row">
                        <div className="company-profile-info-label">メール</div>
                        <div className="company-profile-info-value break-all">{detail.profile.email}</div>
                      </div>
                    </div>
                  </div>
                </section>

                <AdminSeekerProfileView profile={detail.profile} />

                {detail.recentApplications.length > 0 && (
                  <section className="company-profile-section">
                    <div className="company-profile-section-header">
                      <h2 className="company-profile-section-title">応募履歴</h2>
                    </div>
                    <div className="company-profile-section-body company-profile-section-body--flush">
                      <ul className="company-dashboard-action-list">
                        {detail.recentApplications.map((app) => (
                          <li key={app.id}>
                            <div className="company-dashboard-action-row">
                              <div className="min-w-0 flex-1">
                                <p className="company-dashboard-action-title">{app.jobTitle}</p>
                                <p className="company-dashboard-action-desc">
                                  {app.companyName} · {formatDateJST(app.createdAt)} · {app.status}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminSeekersPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const table = usePaginatedTable<AdminSeekerRow>({
    fetchUrl: "/api/admin/seekers",
    defaultSort: { column: "createdAt", order: "desc" },
    buildQuery: ({ page, pageSize, sort, search }) => ({
      page: String(page),
      limit: String(pageSize),
      search: search || undefined,
      sort: sort.column || undefined,
      order: sort.order,
    }),
    parseResponse: (data) => {
      const payload = data as { items?: AdminSeekerRow[]; total?: number };
      return {
        items: Array.isArray(payload.items) ? payload.items : [],
        total: typeof payload.total === "number" ? payload.total : 0,
      };
    },
  });

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
  ];

  const onRowClick = useCallback((row: AdminSeekerRow) => {
    setExpandedId((prev) => (prev === row.id ? null : row.id));
  }, []);

  if (table.loading && table.items.length === 0) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">求職者管理</h1>
          <p className="mt-1 text-sm text-slate-500">登録求職者のプロフィール確認</p>
        </div>
        <PageLoading message="求職者データを読み込み中..." minHeight="min-h-[320px]" />
      </>
    );
  }

  return (
    <div className="company-dashboard-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">求職者管理</h1>
        <p className="mt-1 text-sm text-slate-500">{table.total}名の求職者が登録されています</p>
      </div>

      <DataTable
        columns={columns}
        data={table.items}
        loading={table.loading}
        getRowId={(row) => row.id}
        selectedRowId={expandedId}
        onRowClick={onRowClick}
        emptyMessage={table.searchInput ? "条件に一致する求職者がいません" : "求職者がまだいません"}
        className="mb-6"
        staffStyle
        toolbar={
          <PaginatedTableToolbar
            searchValue={table.searchInput}
            onSearchChange={table.setSearchInput}
            searchPlaceholder="氏名・メール・エリア・職種で検索..."
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

      {expandedId && (
        <div className="space-y-3">
          {table.items
            .filter((row) => row.id === expandedId)
            .map((seeker) => (
              <SeekerAccordionItem
                key={seeker.id}
                seeker={seeker}
                expanded
                onToggle={() => setExpandedId(null)}
              />
            ))}
        </div>
      )}

      {!expandedId && table.items.length > 0 && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          行をクリックするとプロフィール詳細が表示されます
        </p>
      )}
    </div>
  );
}
