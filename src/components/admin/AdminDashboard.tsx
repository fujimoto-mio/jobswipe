"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ChevronRight, ShieldCheck, Users } from "lucide-react";
import AdminJobStatisticsChart from "@/components/admin/AdminJobStatisticsChart";
import AdminRegistrationChart from "@/components/admin/AdminRegistrationChart";
import { apiFetch } from "@/lib/api-client";

type AdminStats = {
  companyCount: number;
  seekerCount: number;
  approvedJobs: number;
  pendingJobs: number;
};

type SummaryItem = {
  label: string;
  value: number;
};

const SUMMARY_ITEMS: { label: string; key: keyof AdminStats }[] = [
  { label: "審査待ち求人", key: "pendingJobs" },
  { label: "公開中求人", key: "approvedJobs" },
  { label: "登録企業", key: "companyCount" },
  { label: "登録求職者", key: "seekerCount" },
];

const SUMMARY_SKELETON_WIDTHS = ["4.5rem", "3.75rem", "4rem", "4.25rem"];

function SummaryGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="概要を読み込み中">
      {SUMMARY_ITEMS.map(({ label }, index) => (
        <div key={label} className="dashboard-summary-skeleton-card">
          <div
            className="dashboard-summary-skeleton-value"
            style={{
              width: SUMMARY_SKELETON_WIDTHS[index],
              animationDelay: `${index * 140}ms`,
            }}
          />
          <p className="dashboard-summary-skeleton-label">{label}</p>
        </div>
      ))}
    </div>
  );
}

function SummaryGrid({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center"
        >
          <p className="text-2xl font-bold tabular-nums text-slate-900">{value.toLocaleString()}</p>
          <p className="mt-1 text-sm text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

function NavRow({
  href,
  title,
  detail,
  icon: Icon,
  loading = false,
}: {
  href: string;
  title: string;
  detail: string;
  icon: typeof ShieldCheck;
  loading?: boolean;
}) {
  return (
    <Link href={href} className="company-dashboard-action-row" aria-busy={loading}>
      <div className="company-dashboard-action-icon">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="company-dashboard-action-title">{title}</p>
        {loading ? (
          <div
            className="company-dashboard-action-desc mt-0.5 h-3.5 w-28 max-w-full animate-pulse rounded bg-slate-200"
            aria-hidden
          />
        ) : (
          <p className="company-dashboard-action-desc">{detail}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </Link>
  );
}

function ManagementListSkeleton() {
  const rows = [
    { href: "/admin/jobs", title: "求人審査", icon: ShieldCheck },
    { href: "/admin/companies", title: "企業管理", icon: Building2 },
    { href: "/admin/seekers", title: "求職者管理", icon: Users },
  ] as const;

  return (
    <>
      {rows.map(({ href, title, icon }) => (
        <NavRow key={href} href={href} title={title} detail="" icon={icon} loading />
      ))}
    </>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="company-dashboard-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-slate-500">プラットフォームの概要</p>
      </div>

      <div className="company-dashboard-sections">
        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">概要</h2>
          </div>
          <div className="company-profile-section-body">
            {loading ? (
              <SummaryGridSkeleton />
            ) : (
              <SummaryGrid
                items={SUMMARY_ITEMS.map(({ label, key }) => ({
                  label,
                  value: stats?.[key] ?? 0,
                }))}
              />
            )}
          </div>
        </section>

        <AdminRegistrationChart />

        <AdminJobStatisticsChart />

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">管理</h2>
          </div>
          <div className="company-profile-section-body company-profile-section-body--flush">
            <div className="company-dashboard-action-list">
              {loading ? (
                <ManagementListSkeleton />
              ) : (
                <>
                  <NavRow
                    href="/admin/jobs"
                    title="求人審査"
                    detail={`審査待ち ${stats?.pendingJobs ?? 0}件`}
                    icon={ShieldCheck}
                  />
                  <NavRow
                    href="/admin/companies"
                    title="企業管理"
                    detail={`登録 ${stats?.companyCount ?? 0}社`}
                    icon={Building2}
                  />
                  <NavRow
                    href="/admin/seekers"
                    title="求職者管理"
                    detail={`登録 ${stats?.seekerCount ?? 0}名`}
                    icon={Users}
                  />
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
