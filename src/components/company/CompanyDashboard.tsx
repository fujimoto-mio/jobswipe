"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  MessageCircle,
  Eye,
  Plus,
  ArrowRight,
  User,
  Heart,
  TrendingUp,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatTimeJST } from "@/lib/datetime";
import type { ApplicationWithSeeker, ChatMessage, Job } from "@/lib/types";

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

type Thread = {
  application: ApplicationWithSeeker;
  job: Job;
  lastMessage?: ChatMessage;
};

type MetricItem = {
  label: string;
  value: number;
  icon: typeof Eye;
  suffix?: string;
};

function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  suffix = "",
  loading = false,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: typeof Eye;
  suffix?: string;
  loading?: boolean;
  delay?: number;
}) {
  return (
    <div className="company-dashboard-metric">
      <div className="company-dashboard-metric-icon">
        <Icon className="h-4 w-4" />
      </div>
      {loading ? (
        <div
          className="dashboard-skeleton-line dashboard-skeleton-line--metric"
          style={{ animationDelay: `${delay}ms` }}
          aria-hidden
        />
      ) : (
        <p className="company-dashboard-metric-value">
          {value.toLocaleString()}
          {suffix}
        </p>
      )}
      <p className="company-dashboard-metric-label">{label}</p>
    </div>
  );
}

function DashboardMetricGrid({
  items,
  loading = false,
}: {
  items: MetricItem[];
  loading?: boolean;
}) {
  return (
    <div className="company-dashboard-metric-grid" aria-busy={loading}>
      {items.map((item, index) => (
        <DashboardMetricCard key={item.label} {...item} loading={loading} delay={index * 90} />
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

function DashboardChatListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="company-dashboard-chat-list" aria-busy="true" aria-label="チャットを読み込み中">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="company-dashboard-chat-row company-dashboard-chat-row--skeleton">
          <div
            className="dashboard-skeleton-line dashboard-skeleton-line--chat"
            style={{ animationDelay: `${index * 100}ms` }}
            aria-hidden
          />
        </li>
      ))}
    </ul>
  );
}

export default function CompanyDashboard() {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    apiFetch("/api/chat")
      .then((r) => r.json())
      .then((data) => setThreads((data.threads ?? []).slice(0, 5)))
      .finally(() => setThreadsLoading(false));
  }, []);

  useEffect(() => {
    apiFetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => setCompanyName(data.companyName ?? ""))
      .finally(() => setProfileLoading(false));
  }, []);

  const kpiCards: MetricItem[] = [
    { label: "動画再生数", value: stats?.videoViews ?? 0, icon: Eye },
    { label: "いいね数", value: stats?.savedCount ?? 0, icon: Heart },
    { label: "応募数", value: stats?.applicationCount ?? 0, icon: FileText },
    { label: "面接率", value: stats?.interviewRate ?? 0, icon: TrendingUp, suffix: "%" },
    { label: "採用率", value: stats?.hireRate ?? 0, icon: UserCheck, suffix: "%" },
  ];

  const opsCards: MetricItem[] = [
    { label: "掲載中求人", value: stats?.approvedJobs ?? 0, icon: Briefcase },
    { label: "承認待ち", value: stats?.pendingJobs ?? 0, icon: Briefcase },
    { label: "未対応応募", value: stats?.pendingApplications ?? 0, icon: User },
    { label: "チャット", value: stats?.activeChatCount ?? 0, icon: MessageCircle },
  ];

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
            <DashboardMetricGrid items={kpiCards} loading={statsLoading} />
          </div>
        </section>

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">運用状況</h2>
          </div>
          <div className="company-profile-section-body">
            <DashboardMetricGrid items={opsCards} loading={statsLoading} />
          </div>
        </section>

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

        <section className="company-profile-section">
          <div className="company-profile-section-header company-dashboard-section-header-row">
            <h2 className="company-profile-section-title">最近のチャット</h2>
            <Link href="/company/chat" className="company-dashboard-link">
              すべて見る
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="company-profile-section-body company-profile-section-body--flush">
            {threadsLoading ? (
              <DashboardChatListSkeleton />
            ) : threads.length === 0 ? (
              <p className="company-profile-text company-profile-text--muted px-4 py-6 text-center">
                応募があると、ここに求職者とのチャットが表示されます
              </p>
            ) : (
              <ul className="company-dashboard-chat-list">
                {threads.map((t) => (
                  <li key={t.application.id}>
                    <Link
                      href={`/company/chat?jobId=${t.job.id}&applicationId=${t.application.id}`}
                      className="company-dashboard-chat-row"
                    >
                      <div className="company-dashboard-chat-avatar">
                        {t.application.applicantName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-slate-900">
                            {t.application.applicantName}
                          </p>
                          {t.lastMessage && (
                            <span className="shrink-0 text-[10px] text-slate-400">
                              {formatTimeJST(t.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-500">{t.job.title}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {t.lastMessage?.content ?? "メッセージを送信して会話を始めましょう"}
                        </p>
                      </div>
                      <span className="badge badge-blue shrink-0 text-[10px]">
                        {APPLICATION_STATUS_LABELS[t.application.status]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
