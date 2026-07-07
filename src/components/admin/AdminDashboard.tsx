"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Building2, ChevronRight, ClipboardClock, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AdminJobStatisticsChart from "@/components/admin/AdminJobStatisticsChart";
import AdminRegistrationChart from "@/components/admin/AdminRegistrationChart";
import { apiFetch } from "@/lib/api-client";

type AdminStats = {
  companyCount: number;
  seekerCount: number;
  approvedJobs: number;
  pendingJobs: number;
};

type SummaryTone = "pending" | "active" | "companies" | "seekers";

type SummaryItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  tone: SummaryTone;
};

const SUMMARY_ITEMS: {
  label: string;
  key: keyof AdminStats;
  icon: LucideIcon;
  href: string;
  tone: SummaryTone;
}[] = [
  {
    label: "審査待ち求人",
    key: "pendingJobs",
    icon: ClipboardClock,
    href: "/admin/jobs?approval=Pending",
    tone: "pending",
  },
  {
    label: "公開中求人",
    key: "approvedJobs",
    icon: Briefcase,
    href: "/admin/jobs?approval=Active",
    tone: "active",
  },
  {
    label: "登録企業",
    key: "companyCount",
    icon: Building2,
    href: "/admin/companies",
    tone: "companies",
  },
  {
    label: "登録求職者",
    key: "seekerCount",
    icon: Users,
    href: "/admin/seekers",
    tone: "seekers",
  },
];

function SummaryMetricCard({
  label,
  value,
  icon: Icon,
  href,
  tone,
}: SummaryItem) {
  return (
    <Link href={href} className={`admin-summary-card admin-summary-card--${tone}`}>
      <div className="admin-summary-card-top">
        <div className="admin-summary-card-icon">
          <Icon className="h-4 w-4" />
        </div>
        <ChevronRight className="admin-summary-card-go" aria-hidden />
      </div>
      <p className="admin-summary-card-value">{value.toLocaleString()}</p>
      <p className="admin-summary-card-label">{label}</p>
    </Link>
  );
}

function SummaryGridSkeleton() {
  return (
    <div className="admin-summary-grid" aria-busy="true" aria-label="概要を読み込み中">
      {SUMMARY_ITEMS.map(({ label, icon: Icon, tone }, index) => (
        <div key={label} className={`admin-summary-card admin-summary-card--${tone}`} aria-hidden>
          <div className="admin-summary-card-top">
            <div className="admin-summary-card-icon">
              <Icon className="h-4 w-4" />
            </div>
            <ChevronRight className="admin-summary-card-go" />
          </div>
          <div
            className="dashboard-skeleton-line dashboard-skeleton-line--metric"
            style={{ animationDelay: `${index * 140}ms`, marginTop: "0.625rem" }}
          />
          <p className="admin-summary-card-label">{label}</p>
        </div>
      ))}
    </div>
  );
}

function SummaryGrid({ items }: { items: SummaryItem[] }) {
  return (
    <div className="admin-summary-grid">
      {items.map((item) => (
        <SummaryMetricCard key={item.label} {...item} />
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
            className="company-dashboard-action-desc dashboard-skeleton-line dashboard-skeleton-line--desc mt-0.5 w-28 max-w-full"
            aria-hidden
          />
        ) : (
          <p className="company-dashboard-action-desc">{detail}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--staff-text-faint)]" />
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
      <div className="staff-page-header mb-8">
        <h1>ダッシュボード</h1>
        <p>プラットフォームの概要</p>
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
                items={SUMMARY_ITEMS.map(({ label, key, icon, href, tone }) => ({
                  label,
                  value: stats?.[key] ?? 0,
                  icon,
                  href,
                  tone,
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
