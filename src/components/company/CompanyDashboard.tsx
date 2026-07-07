"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ChevronRight,
  ClipboardClock,
  Eye,
  FileText,
  Heart,
  MessageCircle,
  Plus,
  TrendingUp,
  User,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AdminJobStatisticsChart from "@/components/admin/AdminJobStatisticsChart";
import { apiFetch } from "@/lib/api-client";

type CompanyStats = {
  totalJobs: number;
  approvedJobs: number;
  pendingJobs: number;
  applicationCount: number;
  pendingApplications: number;
  videoViews: number;
  savedCount: number;
  interviewRate: number;
  hireRate: number;
  activeChatCount: number;
};

type SummaryTone =
  | "views"
  | "likes"
  | "applications"
  | "interview"
  | "hire"
  | "active"
  | "pending"
  | "attention"
  | "chat";

type SummaryItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  tone: SummaryTone;
  suffix?: string;
};

function SummaryMetricCard({
  label,
  value,
  icon: Icon,
  href,
  tone,
  suffix = "",
}: SummaryItem) {
  return (
    <Link href={href} className={`admin-summary-card admin-summary-card--${tone}`}>
      <div className="admin-summary-card-top">
        <div className="admin-summary-card-icon">
          <Icon className="h-4 w-4" />
        </div>
        <ChevronRight className="admin-summary-card-go" aria-hidden />
      </div>
      <p className="admin-summary-card-value">
        {value.toLocaleString()}
        {suffix}
      </p>
      <p className="admin-summary-card-label">{label}</p>
    </Link>
  );
}

function SummaryGridSkeleton({
  items,
  columns = 4,
}: {
  items: Pick<SummaryItem, "label" | "icon" | "tone">[];
  columns?: 4 | 5;
}) {
  return (
    <div
      className={`admin-summary-grid${columns === 5 ? " admin-summary-grid--5" : ""}`}
      aria-busy="true"
      aria-label="指標を読み込み中"
    >
      {items.map(({ label, icon: Icon, tone }, index) => (
        <div key={label} className={`admin-summary-card admin-summary-card--${tone}`} aria-hidden>
          <div className="admin-summary-card-top">
            <div className="admin-summary-card-icon">
              <Icon className="h-4 w-4" />
            </div>
            <ChevronRight className="admin-summary-card-go" />
          </div>
          <div
            className="dashboard-skeleton-line dashboard-skeleton-line--metric"
            style={{ animationDelay: `${index * 90}ms`, marginTop: "0.625rem" }}
          />
          <p className="admin-summary-card-label">{label}</p>
        </div>
      ))}
    </div>
  );
}

function SummaryGrid({
  items,
  columns = 4,
}: {
  items: SummaryItem[];
  columns?: 4 | 5;
}) {
  return (
    <div className={`admin-summary-grid${columns === 5 ? " admin-summary-grid--5" : ""}`}>
      {items.map((item) => (
        <SummaryMetricCard key={item.label} {...item} />
      ))}
    </div>
  );
}

function DashboardQuickAction({
  href,
  title,
  description,
  icon: Icon,
  descriptionLoading = false,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof Plus;
  descriptionLoading?: boolean;
}) {
  return (
    <Link href={href} className="company-dashboard-action-row" aria-busy={descriptionLoading}>
      <div className="company-dashboard-action-icon">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="company-dashboard-action-title">{title}</p>
        {descriptionLoading ? (
          <div className="dashboard-skeleton-line dashboard-skeleton-line--desc" aria-hidden />
        ) : (
          <p className="company-dashboard-action-desc">{description}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </Link>
  );
}

const KPI_CARD_DEFS: (Pick<SummaryItem, "label" | "icon" | "href" | "tone" | "suffix"> & {
  key: keyof CompanyStats;
})[] = [
  { key: "videoViews", label: "動画再生数", icon: Eye, href: "/company/jobs?approval=Active", tone: "views" },
  { key: "savedCount", label: "いいね数", icon: Heart, href: "/company/jobs?approval=Active", tone: "likes" },
  {
    key: "applicationCount",
    label: "応募数",
    icon: FileText,
    href: "/company/applications",
    tone: "applications",
  },
  {
    key: "interviewRate",
    label: "面接率",
    icon: TrendingUp,
    href: "/company/applications",
    tone: "interview",
    suffix: "%",
  },
  {
    key: "hireRate",
    label: "採用率",
    icon: UserCheck,
    href: "/company/applications",
    tone: "hire",
    suffix: "%",
  },
];

const OPS_CARD_DEFS: (Pick<SummaryItem, "label" | "icon" | "href" | "tone"> & {
  key: keyof CompanyStats;
})[] = [
  {
    key: "approvedJobs",
    label: "掲載中求人",
    icon: Briefcase,
    href: "/company/jobs?approval=Active",
    tone: "active",
  },
  {
    key: "pendingJobs",
    label: "承認待ち",
    icon: ClipboardClock,
    href: "/company/jobs?approval=Pending",
    tone: "pending",
  },
  {
    key: "pendingApplications",
    label: "未対応応募",
    icon: User,
    href: "/company/applications",
    tone: "attention",
  },
  {
    key: "activeChatCount",
    label: "チャット",
    icon: MessageCircle,
    href: "/company/chat",
    tone: "chat",
  },
];

export default function CompanyDashboard() {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    apiFetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => setCompanyName(data.companyName ?? ""))
      .finally(() => setProfileLoading(false));
  }, []);

  const kpiCards: SummaryItem[] = KPI_CARD_DEFS.map(({ key, ...card }) => ({
    ...card,
    value: stats?.[key] ?? 0,
  }));

  const opsCards: SummaryItem[] = OPS_CARD_DEFS.map(({ key, ...card }) => ({
    ...card,
    value: stats?.[key] ?? 0,
  }));

  return (
    <div className="company-dashboard-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">採用ダッシュボード</h1>
        <p className="mt-1 text-sm text-slate-500">
          {profileLoading ? (
            <>
              <span className="dashboard-skeleton-line dashboard-skeleton-line--subtitle" aria-hidden />
              <span> · 求人・応募・求職者とのチャット</span>
            </>
          ) : companyName ? (
            `${companyName} · 求人・応募・求職者とのチャット`
          ) : (
            "求人・応募・求職者とのチャット"
          )}
        </p>
      </div>

      <div className="company-dashboard-sections">
        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">採用KPI</h2>
          </div>
          <div className="company-profile-section-body">
            {statsLoading ? (
              <SummaryGridSkeleton items={KPI_CARD_DEFS} columns={5} />
            ) : (
              <SummaryGrid items={kpiCards} columns={5} />
            )}
          </div>
        </section>

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">運用状況</h2>
          </div>
          <div className="company-profile-section-body">
            {statsLoading ? (
              <SummaryGridSkeleton items={OPS_CARD_DEFS} />
            ) : (
              <SummaryGrid items={opsCards} />
            )}
          </div>
        </section>

        <AdminJobStatisticsChart />

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">クイックアクション</h2>
          </div>
          <div className="company-profile-section-body company-profile-section-body--flush">
            <div className="company-dashboard-action-list">
              <DashboardQuickAction
                href="/company/jobs/new"
                title="求人を登録"
                description="動画付き求人を投稿"
                icon={Plus}
              />
              <DashboardQuickAction
                href="/company/applications"
                title="応募管理"
                description={`未対応 ${stats?.pendingApplications ?? 0}件`}
                icon={FileText}
                descriptionLoading={statsLoading}
              />
              <DashboardQuickAction
                href="/company/chat"
                title="チャット"
                description="求職者とメッセージ"
                icon={MessageCircle}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
