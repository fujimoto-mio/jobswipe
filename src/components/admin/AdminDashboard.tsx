"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  FileText,
  MessageCircle,
  Eye,
  ShieldCheck,
  Users,
  Heart,
  TrendingUp,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { apiFetch } from "@/lib/api-client";

type AdminStats = {
  companyCount: number;
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

type MetricItem = {
  label: string;
  value: number;
  icon: typeof Eye;
  suffix?: string;
};

function DashboardMetricGrid({ items }: { items: MetricItem[] }) {
  return (
    <div className="company-dashboard-metric-grid">
      {items.map(({ label, value, icon: Icon, suffix = "" }) => (
        <div key={label} className="company-dashboard-metric">
          <div className="company-dashboard-metric-icon">
            <Icon className="h-4 w-4" />
          </div>
          <p className="company-dashboard-metric-value">
            {value.toLocaleString()}
            {suffix}
          </p>
          <p className="company-dashboard-metric-label">{label}</p>
        </div>
      ))}
    </div>
  );
}

function DashboardQuickAction({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <Link href={href} className="company-dashboard-action-row">
      <div className="company-dashboard-action-icon">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="company-dashboard-action-title">{title}</p>
        <p className="company-dashboard-action-desc">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </Link>
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

  const pageHeader = (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">管理者ダッシュボード</h1>
      <p className="mt-1 text-sm text-slate-500">求人審査・企業管理・プラットフォームKPI</p>
    </div>
  );

  if (loading) {
    return (
      <>
        {pageHeader}
        <PageLoading message="データを読み込み中..." minHeight="min-h-[360px]" />
      </>
    );
  }

  const kpiCards: MetricItem[] = [
    { label: "動画再生数", value: stats?.videoViews ?? 0, icon: Eye },
    { label: "いいね数", value: stats?.savedCount ?? 0, icon: Heart },
    { label: "応募数", value: stats?.applicationCount ?? 0, icon: FileText },
    { label: "面接率", value: stats?.interviewRate ?? 0, icon: TrendingUp, suffix: "%" },
    { label: "採用率", value: stats?.hireRate ?? 0, icon: UserCheck, suffix: "%" },
  ];

  const opsCards: MetricItem[] = [
    { label: "登録企業数", value: stats?.companyCount ?? 0, icon: Building2 },
    { label: "公開中求人", value: stats?.approvedJobs ?? 0, icon: Briefcase },
    { label: "審査待ち求人", value: stats?.pendingJobs ?? 0, icon: ShieldCheck },
    { label: "未対応応募", value: stats?.pendingApplications ?? 0, icon: Users },
    { label: "アクティブチャット", value: stats?.activeChatCount ?? 0, icon: MessageCircle },
  ];

  return (
    <div className="company-dashboard-page admin-dashboard-page">
      {pageHeader}

      <div className="company-dashboard-sections">
        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">プラットフォームKPI</h2>
          </div>
          <div className="company-profile-section-body">
            <DashboardMetricGrid items={kpiCards} />
          </div>
        </section>

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">運用状況</h2>
          </div>
          <div className="company-profile-section-body">
            <DashboardMetricGrid items={opsCards} />
          </div>
        </section>

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">クイックアクション</h2>
          </div>
          <div className="company-profile-section-body company-profile-section-body--flush">
            <div className="company-dashboard-action-list">
              <DashboardQuickAction
                href="/admin/jobs"
                title="求人審査"
                description={`審査待ち ${stats?.pendingJobs ?? 0}件 — 承認・却下`}
                icon={ShieldCheck}
              />
              <DashboardQuickAction
                href="/admin/companies"
                title="企業管理"
                description={`登録企業 ${stats?.companyCount ?? 0}社`}
                icon={Building2}
              />
              <DashboardQuickAction
                href="/admin/seekers"
                title="求職者管理"
                description="登録求職者のプロフィール確認"
                icon={Users}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
