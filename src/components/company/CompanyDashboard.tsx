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
} from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
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

export default function CompanyDashboard() {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/admin/stats").then((r) => r.json()),
      apiFetch("/api/chat").then((r) => r.json()),
      apiFetch("/api/admin/me").then((r) => r.json()),
    ])
      .then(([statsData, chatData, meData]) => {
        setStats(statsData);
        setThreads((chatData.threads ?? []).slice(0, 5));
        setCompanyName(meData.companyName ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">採用ダッシュボード</h1>
          <p className="mt-1 text-sm text-slate-500">求人・応募・チャットの状況</p>
        </div>
        <PageLoading message="データを読み込み中..." minHeight="min-h-[360px]" />
      </>
    );
  }

  const kpiCards = [
    { label: "動画再生数", value: stats?.videoViews ?? 0, icon: Eye, color: "text-violet-600", bg: "bg-violet-50", suffix: "" },
    { label: "いいね数", value: stats?.savedCount ?? 0, icon: Heart, color: "text-rose-600", bg: "bg-rose-50", suffix: "" },
    { label: "応募数", value: stats?.applicationCount ?? 0, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50", suffix: "" },
    { label: "面接率", value: stats?.interviewRate ?? 0, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50", suffix: "%" },
    { label: "採用率", value: stats?.hireRate ?? 0, icon: UserCheck, color: "text-indigo-600", bg: "bg-indigo-50", suffix: "%" },
  ];

  const opsCards = [
    { label: "掲載中求人", value: stats?.approvedJobs ?? 0, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "承認待ち", value: stats?.pendingJobs ?? 0, icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "未対応応募", value: stats?.pendingApplications ?? 0, icon: User, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "チャット", value: stats?.activeChatCount ?? 0, icon: MessageCircle, color: "text-slate-600", bg: "bg-slate-50" },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">採用ダッシュボード</h1>
        <p className="mt-1 text-sm text-slate-500">
          {companyName ? `${companyName} · ` : ""}求人・応募・求職者とのチャット
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">採用KPI</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
          {kpiCards.map(({ label, value, icon: Icon, color, bg, suffix }) => (
            <div key={label} className="card p-5">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {value.toLocaleString()}
                {suffix}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">運用状況</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {opsCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-5">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
              <p className="mt-0.5 text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Link
          href="/company/jobs/new"
          className="group card flex items-center justify-between p-5 transition hover:border-blue-200 hover:shadow-md"
        >
          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Plus className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-slate-900">求人を登録</h2>
            <p className="mt-0.5 text-xs text-slate-500">動画付き求人を投稿</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
        </Link>

        <Link
          href="/company/applications"
          className="group card flex items-center justify-between p-5 transition hover:border-emerald-200 hover:shadow-md"
        >
          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-slate-900">応募管理</h2>
            <p className="mt-0.5 text-xs text-slate-500">未対応 {stats?.pendingApplications ?? 0}件</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600" />
        </Link>

        <Link
          href="/company/chat"
          className="group card flex items-center justify-between p-5 transition hover:border-rose-200 hover:shadow-md"
        >
          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500 text-white">
              <MessageCircle className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-slate-900">チャット</h2>
            <p className="mt-0.5 text-xs text-slate-500">求職者とメッセージ</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-rose-500" />
        </Link>
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">最近のチャット</h2>
          <Link href="/company/chat" className="text-sm font-medium text-blue-600 hover:underline">
            すべて見る
          </Link>
        </div>
        {threads.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            応募があると、ここに求職者とのチャットが表示されます
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {threads.map((t) => (
              <li key={t.application.id}>
                <Link
                  href={`/company/chat?applicationId=${t.application.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {t.application.applicantName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium text-slate-900">{t.application.applicantName}</p>
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
      </section>
    </>
  );
}
