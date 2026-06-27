"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  FileText,
  Eye,
  ShieldCheck,
  ArrowRight,
  Users,
  Heart,
  TrendingUp,
  UserCheck,
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">管理者ダッシュボード</h1>
          <p className="mt-1 text-sm text-slate-500">プラットフォーム全体の運用状況</p>
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
    { label: "登録企業数", value: stats?.companyCount ?? 0, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "公開中求人", value: stats?.approvedJobs ?? 0, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "審査待ち求人", value: stats?.pendingJobs ?? 0, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "未対応応募", value: stats?.pendingApplications ?? 0, icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "アクティブチャット", value: stats?.activeChatCount ?? 0, icon: Users, color: "text-slate-600", bg: "bg-slate-50" },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">管理者ダッシュボード</h1>
        <p className="mt-1 text-sm text-slate-500">求人審査・企業管理・プラットフォームKPI</p>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">プラットフォームKPI</h2>
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
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

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/jobs"
          className="group card flex items-center justify-between p-6 transition hover:border-amber-200 hover:shadow-md"
        >
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-900">求人審査</h2>
            <p className="mt-1 text-sm text-slate-500">
              審査待ち {stats?.pendingJobs ?? 0}件 — 承認・却下
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:text-amber-500" />
        </Link>

        <Link
          href="/admin/applications"
          className="group card flex items-center justify-between p-6 transition hover:border-emerald-200 hover:shadow-md"
        >
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-900">応募モニタリング</h2>
            <p className="mt-1 text-sm text-slate-500">
              全企業の応募状況を確認（未対応 {stats?.pendingApplications ?? 0}件）
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:text-emerald-600" />
        </Link>
      </div>
    </>
  );
}
